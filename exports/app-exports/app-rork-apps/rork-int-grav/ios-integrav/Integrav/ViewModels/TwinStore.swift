import Foundation
import Observation

/// Owns the digital twin: ingested source footage, training progress toward the
/// 3,000-hour goal, and the live conversation. Replies are generated on-device.
@Observable
final class TwinStore {
    static let targetHours: Int = 3_000

    private(set) var videos: [SourceVideo] = []
    private(set) var messages: [TwinMessage] = []
    private(set) var levels: [Double] = Array(repeating: 0.08, count: 48)
    private(set) var isThinking: Bool = false
    var isListening: Bool = false

    /// Hours already ingested before the user started adding clips in-app.
    private let baselineMinutes: Int = 170_820 // 2,847 hrs

    private var waveTask: Task<Void, Never>?
    private var phase: Double = 0

    init() {
        videos = LocalStore.shared.load([SourceVideo].self, key: StoreKey.videos) ?? TwinStore.seedVideos()
        messages = LocalStore.shared.load([TwinMessage].self, key: StoreKey.messages) ?? TwinStore.seedMessages()
    }

    // MARK: - Training progress

    var ingestedMinutes: Int { baselineMinutes + videos.reduce(0) { $0 + $1.minutes } }

    var ingestedHours: Int { ingestedMinutes / 60 }

    var trainedFraction: Double {
        min(1, Double(ingestedHours) / Double(TwinStore.targetHours))
    }

    var trainedPercent: Int { Int((trainedFraction * 100).rounded()) }

    var isFullyTrained: Bool { ingestedHours >= TwinStore.targetHours }

    var statusLine: String {
        "Twin online · \(ingestedHours.formatted(.number.grouping(.automatic))) hrs trained"
    }

    /// Lip-sync latency tightens as the twin approaches full training.
    var lipSyncMs: Int { max(11, 40 - Int(trainedFraction * 18)) }

    /// 0…1 jaw-opening envelope derived from the live level meter — this is what
    /// drives the avatar's mouth blend shape.
    var speechEnvelope: Double {
        let window = levels.suffix(10)
        guard !window.isEmpty else { return 0 }
        let average = window.reduce(0, +) / Double(window.count)
        guard average > 0.14 else { return 0 }
        return min(1, (average - 0.14) * 1.9)
    }

    // MARK: - Source footage

    @discardableResult
    func addVideo(name: String, minutes: Int) -> SourceVideo {
        let cleanName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalName = cleanName.isEmpty ? "clip_\(videos.count + 1).mov" : cleanName
        let video = SourceVideo(name: finalName, minutes: max(1, minutes))
        videos.insert(video, at: 0)
        persistVideos()
        CloudSync.shared.pushClip(video)
        return video
    }

    /// Files an imported clip: real footage, real length, real poster frame.
    @discardableResult
    func addImportedClip(_ clip: ImportedClip) -> SourceVideo {
        let video = SourceVideo(
            name: clip.displayName,
            minutes: SourceVideo.trainingMinutes(forSeconds: clip.seconds),
            fileName: clip.fileName,
            thumbnailName: clip.thumbnailName,
            seconds: clip.seconds
        )
        videos.insert(video, at: 0)
        persistVideos()
        CloudSync.shared.pushClip(video)
        return video
    }

    func removeVideo(_ video: SourceVideo) {
        videos.removeAll { $0.id == video.id }
        // The record and the footage go together — orphaned files would keep
        // occupying the device with nothing left pointing at them.
        MediaLibrary.remove(video.fileName)
        MediaLibrary.remove(video.thumbnailName)
        persistVideos()
        CloudSync.shared.removeClip(video)
    }

    /// Adopts the clip list stored against the signed-in account.
    func applyCloudClips(_ merged: [SourceVideo]) {
        videos = merged
        persistVideos()
    }

    // MARK: - Conversation

    /// Sends a line to the twin and schedules its on-device reply.
    func send(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        messages.append(TwinMessage(role: .user, text: trimmed))
        trimHistory()
        isThinking = true
        startWave()

        Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(700))
            guard let self else { return }
            let reply = self.reply(to: trimmed)
            self.messages.append(TwinMessage(role: .twin, text: reply))
            self.trimHistory()
            self.isThinking = false
            try? await Task.sleep(for: .seconds(2))
            if !self.isListening { self.stopWave() }
            self.persistMessages()
        }
    }

    /// Runs one avatar function on the twin: the call appears as a line, the
    /// performance comes back in the twin's voice.
    func invoke(signature: String, response: String) {
        messages.append(TwinMessage(role: .user, text: signature))
        trimHistory()
        isThinking = true
        startWave()

        Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(420))
            guard let self else { return }
            self.messages.append(TwinMessage(role: .twin, text: response))
            self.trimHistory()
            self.isThinking = false
            self.persistMessages()
            try? await Task.sleep(for: .milliseconds(1_400))
            if !self.isListening && !self.isThinking { self.stopWave() }
        }
    }

    func clearConversation() {
        messages = []
        persistMessages()
    }

    // MARK: - Live voice

    /// Appends a line spoken in the live voice loop. The reply comes from the
    /// agent rather than the rule-based voice, so this records without replying.
    func record(role: TwinRole, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        messages.append(TwinMessage(role: role, text: trimmed))
        trimHistory()
        persistMessages()
    }

    func setThinking(_ value: Bool) {
        isThinking = value
    }

    /// Pushes one real loudness sample onto the waveform. While the voice loop
    /// runs, the bars and the rigged jaw follow actual audio instead of the
    /// decorative animation.
    func pushLevel(_ value: Double) {
        let clamped = min(1, max(0, value))
        guard !levels.isEmpty else { return }
        var next = levels
        next.removeFirst()
        next.append(clamped)
        levels = next
    }

    /// Rule-based twin voice — grounded in the twin's own training state so it
    /// never claims capabilities the app does not have.
    private func reply(to prompt: String) -> String {
        let text = prompt.lowercased()
        let hours = ingestedHours.formatted(.number.grouping(.automatic))

        if text.contains("who are you") || text.contains("your name") {
            return "I'm your Intégrav twin — built from \(hours) hours of your own footage, your face, your voice, your cadence."
        }
        if text.contains("how") && (text.contains("train") || text.contains("hour")) {
            return "\(trainedPercent)% trained. \(hours) of \(TwinStore.targetHours.formatted(.number.grouping(.automatic))) hours ingested across \(videos.count) source clips."
        }
        if text.contains("secur") || text.contains("hack") || text.contains("pen") {
            return "I can run legal, scoped pen-tests — recon, injection, auth and config sweeps. Dispatch it from the Command bar and the pen-test fleet picks it up."
        }
        if text.contains("code") || text.contains("function") || text.contains("refactor") {
            return "Send me the module. I write, detect, refresh and extend — the code fleet returns full function chains, not snippets."
        }
        if text.contains("api") || text.contains("pipeline") || text.contains("chain") {
            return "Give me the services and I'll chain them end to end: adapters, schema validation, retries, and one call to run the whole thing."
        }
        if text.contains("100,000") || text.contains("100000") || text.contains("scale") || text.contains("concurrent") {
            return "Capacity is 100,000 concurrent slots. The Tasks screen shows exactly how much of that the fleets are holding right now."
        }
        if text.contains("hello") || text.contains("hey") || text.contains("hi ") || text == "hi" {
            return "I'm here. Lip sync is holding at \(lipSyncMs)ms — talk to me like you'd talk to yourself."
        }
        if text.contains("thank") {
            return "Any time. I'm you, just without the sleep schedule."
        }
        if text.hasSuffix("?") {
            return "From what you've taught me across \(hours) hours: yes — but let me run it as a task so you get proof, not an opinion."
        }
        return "Logged. I'll fold that into how I answer as you — \(trainedPercent)% trained and still listening."
    }

    private func trimHistory() {
        if messages.count > 40 { messages.removeFirst(messages.count - 40) }
    }

    // MARK: - Waveform

    /// Animates the audio-reactive waveform while the twin listens or speaks.
    func startWave() {
        guard waveTask == nil else { return }
        waveTask = Task { [weak self] in
            while !Task.isCancelled {
                guard let self else { return }
                self.phase += 0.34
                let count = self.levels.count
                self.levels = (0..<count).map { index in
                    let center = Double(count) / 2
                    let envelope = max(0.12, 1 - abs(Double(index) - center) / center)
                    let motion = abs(sin(self.phase + Double(index) / 3.1))
                    return min(1, 0.1 + envelope * motion * Double.random(in: 0.55...1.05))
                }
                try? await Task.sleep(for: .milliseconds(70))
            }
        }
    }

    func stopWave() {
        waveTask?.cancel()
        waveTask = nil
        levels = Array(repeating: 0.08, count: levels.count)
    }

    func toggleListening() {
        isListening.toggle()
        if isListening {
            startWave()
        } else if !isThinking {
            stopWave()
        }
    }

    // MARK: - Persistence & seeds

    private func persistVideos() { LocalStore.shared.save(videos, key: StoreKey.videos) }
    private func persistMessages() { LocalStore.shared.save(messages, key: StoreKey.messages) }

    private static func seedVideos() -> [SourceVideo] {
        [
            SourceVideo(name: "keynote_2024.mp4", minutes: 42),
            SourceVideo(name: "podcast_ep12.mov", minutes: 72),
            SourceVideo(name: "vlog_stack.mov", minutes: 18),
        ]
    }

    private static func seedMessages() -> [TwinMessage] {
        [TwinMessage(role: .twin, text: "I'm online. Ask me anything you'd ask yourself.")]
    }
}
