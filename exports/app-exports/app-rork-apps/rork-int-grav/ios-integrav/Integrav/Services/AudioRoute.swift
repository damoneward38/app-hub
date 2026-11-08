import AVFoundation
import Foundation

/// Owns the app's audio session category.
///
/// Without this the app never configured a session at all, so playback ran in
/// the default `.soloAmbient` category — which is silenced by the ring switch.
/// Her voice was being synthesised and played into a muted output, which reads
/// as "there is no speaker". `.playback` ignores the ring switch and routes to
/// the loudspeaker, which is what a spoken reply needs.
nonisolated enum AudioRoute {
    /// Prepares the session to play a reply out loud.
    ///
    /// When the microphone is already open for a live conversation the category
    /// is left alone — switching to `.playback` would tear the mic down
    /// mid-sentence — and the output is merely forced off the earpiece.
    static func prepareForPlayback() {
        let session = AVAudioSession.sharedInstance()

        if session.category == .playAndRecord {
            try? session.overrideOutputAudioPort(.speaker)
            return
        }

        do {
            try session.setCategory(.playback, mode: .spokenAudio, options: [])
            try session.setActive(true)
        } catch {
            #if DEBUG
            print("AudioRoute could not open the playback session")
            #endif
        }
    }

    /// Applies the recording session used while the twin is listening.
    ///
    /// `.voiceChat` enables the echo canceller — needed so an open mic does not
    /// hear her own voice — but it also prefers the earpiece, so the speaker
    /// override is not optional here.
    static func prepareForConversation() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(
            .playAndRecord,
            mode: .voiceChat,
            options: [.defaultToSpeaker, .allowBluetooth, .allowBluetoothA2DP]
        )
        try session.setActive(true, options: .notifyOthersOnDeactivation)
        try? session.overrideOutputAudioPort(.speaker)
    }

    static func deactivate() {
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    /// Whether audio is currently routed somewhere the user can actually hear
    /// without holding the phone to their ear.
    static var isOnLoudspeaker: Bool {
        let outputs = AVAudioSession.sharedInstance().currentRoute.outputs
        guard let port = outputs.first else { return false }
        return port.portType != .builtInReceiver
    }
}
