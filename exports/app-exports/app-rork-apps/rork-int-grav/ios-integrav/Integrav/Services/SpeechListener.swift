import AVFoundation
import Accelerate
import Foundation
import Observation
import Speech

/// Keeps the microphone open and transcribes continuously on device, handing up
/// a finished utterance once the speaker pauses. Nothing is uploaded: Apple's
/// recognizer runs locally when the device supports it, so an always-on mic
/// never becomes an always-on network stream.
@Observable
final class SpeechListener {
    nonisolated enum Availability: Equatable {
        case unknown
        case ready
        case denied(String)
        case unavailable(String)

        nonisolated var isReady: Bool { self == .ready }
    }

    /// How long the speaker has to stop before the sentence is considered done.
    private static let endpointSilence: Duration = .milliseconds(950)
    /// Recognition tasks are capped by the system, so the session is recycled
    /// well before it is dropped underneath us.
    private static let recycleAfter: Duration = .seconds(45)

    private(set) var availability: Availability = .unknown
    private(set) var isRunning: Bool = false
    /// Live text as it is being spoken, for the caption line.
    private(set) var partial: String = ""
    /// 0…1 microphone loudness, for the waveform.
    private(set) var level: Double = 0

    /// Fires when a complete utterance has been heard.
    var onUtterance: ((String) -> Void)?
    /// Fires the moment speech starts, so playback can duck for a barge-in.
    var onSpeechStart: (() -> Void)?

    // The audio engine and the recognizer are OS-level objects: one touches the
    // audio hardware, the other opens an XPC connection to the speech daemon.
    // Both are built only when a session actually starts — never at init, which
    // SwiftUI re-runs on every update of the view that owns this store.
    @ObservationIgnored private var engine: AVAudioEngine?
    @ObservationIgnored private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var endpointTask: Task<Void, Never>?
    private var recycleTask: Task<Void, Never>?
    private var hasAnnouncedSpeech: Bool = false

    // MARK: - Permission

    /// Asks for microphone and speech permission. Returns true only when both
    /// are granted and a recognizer exists for this locale.
    @discardableResult
    func requestAccess() async -> Bool {
        guard resolveRecognizer() != nil else {
            availability = .unavailable("Speech recognition isn't available for this language.")
            return false
        }

        let speechStatus = await withCheckedContinuation { (continuation: CheckedContinuation<SFSpeechRecognizerAuthorizationStatus, Never>) in
            SFSpeechRecognizer.requestAuthorization { continuation.resume(returning: $0) }
        }
        guard speechStatus == .authorized else {
            availability = .denied("Speech recognition is off. Turn it on in Settings to talk to her.")
            return false
        }

        let micGranted = await withCheckedContinuation { (continuation: CheckedContinuation<Bool, Never>) in
            AVAudioApplication.requestRecordPermission { continuation.resume(returning: $0) }
        }
        guard micGranted else {
            availability = .denied("The microphone is off. Turn it on in Settings to talk to her.")
            return false
        }

        availability = .ready
        return true
    }

    // MARK: - Lifecycle

    /// Opens the mic and begins transcribing. Safe to call when already running.
    func start() throws {
        guard !isRunning else { return }
        try configureSession()
        try beginRecognition()
        isRunning = true
    }

    func stop() {
        endpointTask?.cancel()
        endpointTask = nil
        recycleTask?.cancel()
        recycleTask = nil
        teardownRecognition()

        if let engine {
            if engine.isRunning { engine.stop() }
            engine.inputNode.removeTap(onBus: 0)
        }
        engine = nil
        isRunning = false
        partial = ""
        level = 0
        hasAnnouncedSpeech = false
        AudioRoute.deactivate()
    }

    /// `.voiceChat` turns on the system's echo canceller, which is what lets the
    /// mic stay open while she is speaking without her hearing herself.
    private func configureSession() throws {
        try AudioRoute.prepareForConversation()
    }

    /// Builds the recognizer the first time it is genuinely needed.
    private func resolveRecognizer() -> SFSpeechRecognizer? {
        if let recognizer { return recognizer }
        let made = SFSpeechRecognizer(locale: Locale.current)
            ?? SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        recognizer = made
        return made
    }

    private func beginRecognition() throws {
        guard let recognizer = resolveRecognizer(), recognizer.isAvailable else {
            throw AgentError.notConfigured
        }

        let created = SFSpeechAudioBufferRecognitionRequest()
        created.shouldReportPartialResults = true
        // Prefer on-device so continuous listening stays private and works offline.
        created.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        created.taskHint = .dictation
        request = created

        let engine = self.engine ?? AVAudioEngine()
        self.engine = engine

        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        guard format.sampleRate > 0, format.channelCount > 0 else {
            throw AgentError.notConfigured
        }

        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 4_096, format: format) { [weak self] buffer, _ in
            created.append(buffer)
            let rms = SpeechListener.loudness(of: buffer)
            Task { @MainActor [weak self] in self?.level = rms }
        }

        engine.prepare()
        try engine.start()

        task = recognizer.recognitionTask(with: created) { [weak self] result, error in
            Task { @MainActor [weak self] in
                self?.handle(result: result, error: error)
            }
        }

        scheduleRecycle()
    }

    private func teardownRecognition() {
        task?.cancel()
        task = nil
        request?.endAudio()
        request = nil
    }

    // MARK: - Recognition handling

    private func handle(result: SFSpeechRecognitionResult?, error: Error?) {
        if let result {
            let text = result.bestTranscription.formattedString
            if !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                partial = text
                if !hasAnnouncedSpeech {
                    hasAnnouncedSpeech = true
                    onSpeechStart?()
                }
                scheduleEndpoint()
            }
            if result.isFinal {
                flush()
            }
            return
        }

        guard error != nil, isRunning else { return }
        // A recognition error usually means the task expired or the audio route
        // changed. Keep whatever was heard and start a fresh session.
        flush()
        restart()
    }

    /// Restarts the endpoint countdown; when it survives a full silence window
    /// the sentence is treated as finished.
    private func scheduleEndpoint() {
        endpointTask?.cancel()
        endpointTask = Task { [weak self] in
            try? await Task.sleep(for: SpeechListener.endpointSilence)
            guard !Task.isCancelled else { return }
            self?.flush()
            self?.restart()
        }
    }

    private func scheduleRecycle() {
        recycleTask?.cancel()
        recycleTask = Task { [weak self] in
            try? await Task.sleep(for: SpeechListener.recycleAfter)
            guard !Task.isCancelled, let self, self.isRunning else { return }
            // Nothing was said for the whole window — refresh the session so the
            // system never expires it out from under us.
            if self.partial.isEmpty { self.restart() }
        }
    }

    /// Emits the buffered sentence, if there is one worth emitting.
    private func flush() {
        endpointTask?.cancel()
        endpointTask = nil
        let text = partial.trimmingCharacters(in: .whitespacesAndNewlines)
        partial = ""
        hasAnnouncedSpeech = false
        guard SpeechListener.isMeaningful(text) else { return }
        onUtterance?(text)
    }

    private func restart() {
        guard isRunning else { return }
        teardownRecognition()
        do {
            try beginRecognition()
        } catch {
            isRunning = false
            availability = .unavailable("Listening stopped unexpectedly. Tap to start again.")
        }
    }

    // MARK: - Helpers

    /// Filters out the stray one-character blips a live mic produces between
    /// real sentences, so the model is never asked to answer noise.
    nonisolated static func isMeaningful(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 2 else { return false }
        return trimmed.rangeOfCharacter(from: .alphanumerics) != nil
    }

    /// Root-mean-square loudness of one buffer, mapped onto a 0…1 scale.
    nonisolated static func loudness(of buffer: AVAudioPCMBuffer) -> Double {
        guard let channel = buffer.floatChannelData?[0] else { return 0 }
        let count = vDSP_Length(buffer.frameLength)
        guard count > 0 else { return 0 }
        var rms: Float = 0
        vDSP_rmsqv(channel, 1, &rms, count)
        guard rms.isFinite, rms > 0 else { return 0 }
        let decibels = 20 * log10(Double(rms))
        return VoiceService.normalize(decibels: decibels)
    }
}
