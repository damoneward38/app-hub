import AVFoundation
import Foundation
import Observation

/// Speaks the avatar's replies out loud and publishes a live loudness envelope
/// while it plays, so the rigged mouth moves with her real audio instead of a
/// decorative animation.
@Observable
final class VoiceService: NSObject {
    /// xAI's warm female voice — the closest match to the twin's presence.
    static let defaultVoice = "eve"

    private(set) var isSpeaking: Bool = false
    /// 0…1 loudness of what is playing right now.
    private(set) var level: Double = 0

    var voice: String = VoiceService.defaultVoice

    private var player: AVAudioPlayer?
    private var meterTask: Task<Void, Never>?
    private var finishHandler: (() -> Void)?

    /// Built on first use, not at init — SwiftUI re-runs `@State` initializers
    /// on every update of the view that owns this store.
    @ObservationIgnored private lazy var session: URLSession = {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 25
        return URLSession(configuration: configuration)
    }()

    /// Fetches speech for `text` and plays it, returning when playback ends.
    /// Cancelling the surrounding task (a barge-in) stops the audio immediately.
    func speak(_ text: String) async throws {
        let clean = VoiceService.spoken(from: text)
        guard !clean.isEmpty else { return }

        let audio = try await synthesize(clean)
        guard !Task.isCancelled else { return }

        // Without an explicit session the default category is silenced by the
        // ring switch, so she would speak into a muted output.
        AudioRoute.prepareForPlayback()

        try await withTaskCancellationHandler {
            try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                do {
                    let created = try AVAudioPlayer(data: audio)
                    created.isMeteringEnabled = true
                    created.delegate = self
                    player = created
                    var didResume = false
                    finishHandler = {
                        guard !didResume else { return }
                        didResume = true
                        continuation.resume()
                    }
                    guard created.play() else {
                        finishHandler = nil
                        didResume = true
                        continuation.resume(throwing: AgentError.server(-2))
                        return
                    }
                    isSpeaking = true
                    startMetering()
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        } onCancel: {
            Task { @MainActor [weak self] in self?.stop() }
        }
    }

    /// Cuts playback off mid-sentence — used when the user talks over her.
    func stop() {
        player?.stop()
        player = nil
        meterTask?.cancel()
        meterTask = nil
        isSpeaking = false
        level = 0
        let handler = finishHandler
        finishHandler = nil
        handler?()
    }

    // MARK: - Synthesis

    private func synthesize(_ text: String) async throws -> Data {
        guard AgentService.isConfigured,
              let url = URL(string: "\(AgentService.toolkitBase)/v2/vercel/v4/ai/speech-model") else {
            throw AgentError.notConfigured
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(
            "Bearer \(Config.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY)",
            forHTTPHeaderField: "Authorization"
        )
        request.setValue("xai/grok-tts", forHTTPHeaderField: "ai-model-id")
        request.setValue("0.0.1", forHTTPHeaderField: "ai-gateway-protocol-version")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "text": text,
            "voice": voice,
            "outputFormat": "mp3",
        ])

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw AgentError.offline
        }

        guard let http = response as? HTTPURLResponse else { throw AgentError.server(-1) }
        switch http.statusCode {
        case 200: break
        case 401, 403: throw AgentError.unauthorized
        case 402: throw AgentError.outOfCredit
        case 429: throw AgentError.rateLimited
        default: throw AgentError.server(http.statusCode)
        }

        return try VoiceService.decodeAudio(from: data)
    }

    /// The speech endpoint returns JSON with base64 audio, not raw bytes.
    nonisolated static func decodeAudio(from data: Data) throws -> Data {
        nonisolated struct Envelope: Decodable { let audio: String }
        guard let envelope = try? JSONDecoder().decode(Envelope.self, from: data),
              let decoded = Data(base64Encoded: envelope.audio),
              !decoded.isEmpty else {
            throw AgentError.emptyReply
        }
        return decoded
    }

    // MARK: - Metering

    private func startMetering() {
        meterTask?.cancel()
        meterTask = Task { [weak self] in
            while !Task.isCancelled {
                guard let self, let player = self.player, player.isPlaying else { return }
                player.updateMeters()
                let decibels = Double(player.averagePower(forChannel: 0))
                self.level = VoiceService.normalize(decibels: decibels)
                try? await Task.sleep(for: .milliseconds(45))
            }
        }
    }

    /// Maps AVAudioPlayer's dBFS reading onto a 0…1 envelope with the quiet
    /// floor cut off, so the jaw rests closed between words.
    nonisolated static func normalize(decibels: Double) -> Double {
        guard decibels.isFinite else { return 0 }
        let floor = -42.0
        guard decibels > floor else { return 0 }
        return min(1, (decibels - floor) / -floor)
    }

    /// Strips the markup the behaviour catalog uses for stage directions so the
    /// voice never reads asterisks or underscores aloud.
    nonisolated static func spoken(from text: String) -> String {
        var output = text.replacingOccurrences(of: "*", with: "")
        output = output.replacingOccurrences(of: "_", with: " ")
        output = output.replacingOccurrences(of: "•", with: "")
        output = output.replacingOccurrences(of: "…", with: "...")
        while output.contains("  ") {
            output = output.replacingOccurrences(of: "  ", with: " ")
        }
        return output.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

extension VoiceService: AVAudioPlayerDelegate {
    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor [weak self] in
            guard let self else { return }
            self.isSpeaking = false
            self.level = 0
            self.meterTask?.cancel()
            self.meterTask = nil
            self.player = nil
            let handler = self.finishHandler
            self.finishHandler = nil
            handler?()
        }
    }

    nonisolated func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) {
        Task { @MainActor [weak self] in self?.stop() }
    }
}
