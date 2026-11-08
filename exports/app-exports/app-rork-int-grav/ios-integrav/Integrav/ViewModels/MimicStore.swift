import AVFoundation
import Foundation
import Observation

/// Drives the full-body mimic studio: live body tracking, the smoothing filter,
/// recorded takes and their playback.
///
/// Takes never leave the device. A recording of how someone moves is as
/// identifying as their face, so it is written to local storage and to nothing
/// else — there is no cloud row for it and no upload path.
@Observable
final class MimicStore {
    enum State: Equatable {
        case idle
        case denied
        case unavailable
        case live
    }

    /// A take longer than this is almost never replayed, and every frame is
    /// persisted, so the cap is a real limit rather than a guess.
    static let maximumTakeSeconds: TimeInterval = 60

    private(set) var state: State = .idle
    /// The smoothed live pose, or nil when nobody is in frame.
    private(set) var pose: BodyPoseFrame?
    /// Width ÷ height of the camera buffer, needed to line the skeleton up with
    /// an aspect-fill preview.
    private(set) var sourceAspect: Double = 9.0 / 16.0
    private(set) var motion: Double = 0
    private(set) var isRecording: Bool = false
    private(set) var recordingSeconds: TimeInterval = 0
    private(set) var takes: [MimicTake] = []
    private(set) var playingTakeID: UUID?
    private(set) var playbackFrame: BodyPoseFrame?

    /// Mirror mode: the figure moves like a reflection. Off, it moves as another
    /// person facing you would.
    var mirrors: Bool = true
    /// How much of each new Vision reading to take, 0.05…1.
    var smoothing: Double = 0.45

    let session = PoseCameraSession()

    private var recordingFrames: [BodyPoseFrame] = []
    private var recordingStart: TimeInterval?
    private var playbackTask: Task<Void, Never>?
    private var lastRawFrame: BodyPoseFrame?

    init() {
        takes = LocalStore.shared.load([MimicTake].self, key: StoreKey.mimicTakes) ?? []
    }

    // MARK: - Derived read-outs

    /// What the figure should be drawing right now: a take being replayed, or
    /// the live body.
    var displayedPose: BodyPoseFrame? {
        if playingTakeID != nil { return playbackFrame }
        return pose
    }

    var isTracking: Bool { pose != nil }

    var trackedJointCount: Int { pose?.trackedCount ?? 0 }

    var missingGroups: [BodyGroup] { pose?.missingGroups ?? BodyGroup.allCases }

    /// One honest line about what the camera can currently see.
    var trackingLine: String {
        switch state {
        case .idle: return "Camera off"
        case .denied: return "Camera access is off for Intégrav"
        case .unavailable: return "No camera attached"
        case .live:
            guard let pose else { return "Step into frame" }
            if !pose.isFullBody { return "Tracking upper body — step back for legs" }
            let missing = pose.missingGroups
            if missing.isEmpty { return "Full body · \(pose.trackedCount) joints" }
            return "Missing \(missing.map(\.label).joined(separator: ", ").lowercased())"
        }
    }

    var canRecord: Bool { state == .live && pose != nil && playingTakeID == nil }

    // MARK: - Lifecycle

    func start() async {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            break
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            guard granted else {
                state = .denied
                return
            }
        case .denied, .restricted:
            state = .denied
            return
        @unknown default:
            state = .denied
            return
        }

        guard session.configure() else {
            state = .unavailable
            return
        }
        session.onFrame = { [weak self] frame, aspect in
            Task { @MainActor [weak self] in
                self?.ingest(frame, aspect: aspect)
            }
        }
        session.start()
        state = .live
    }

    func stop() {
        session.stop()
        session.onFrame = nil
        stopPlayback()
        if isRecording { _ = finishRecording() }
        pose = nil
        state = .idle
    }

    // MARK: - Frames

    /// Folds one Vision reading into the live pose.
    func ingest(_ frame: BodyPoseFrame?, aspect: Double) {
        sourceAspect = aspect > 0 ? aspect : sourceAspect

        guard var incoming = frame else {
            // Nobody in shot. Drop the pose rather than freezing the last one —
            // a figure holding a stale pose reads as tracking that still works.
            pose = nil
            lastRawFrame = nil
            motion = 0
            return
        }

        if mirrors { incoming = incoming.mirroredHorizontally() }

        if let previous = lastRawFrame {
            motion = incoming.motion(since: previous)
        }
        lastRawFrame = incoming

        if let current = pose {
            pose = current.smoothed(towards: incoming, factor: smoothing)
        } else {
            pose = incoming
        }

        if isRecording, let live = pose {
            appendRecording(live)
        }
    }

    // MARK: - Recording

    func startRecording() {
        guard canRecord else { return }
        recordingFrames = []
        recordingStart = nil
        recordingSeconds = 0
        isRecording = true
        Haptics.fire()
    }

    private func appendRecording(_ frame: BodyPoseFrame) {
        let start = recordingStart ?? frame.timestamp
        recordingStart = start
        recordingSeconds = max(0, frame.timestamp - start)
        recordingFrames.append(frame)
        if recordingSeconds >= MimicStore.maximumTakeSeconds {
            _ = finishRecording()
        }
    }

    /// Ends the recording and keeps it if there is anything worth keeping.
    @discardableResult
    func finishRecording() -> MimicTake? {
        guard isRecording else { return nil }
        isRecording = false
        let frames = recordingFrames
        recordingFrames = []
        recordingStart = nil
        recordingSeconds = 0

        // Two frames is not a movement. Saving it would litter the list with
        // takes that replay as a still.
        guard frames.count >= 3 else { return nil }
        let take = MimicTake(name: nextTakeName(), frames: frames)
        takes.insert(take, at: 0)
        persist()
        Haptics.success()
        return take
    }

    func cancelRecording() {
        isRecording = false
        recordingFrames = []
        recordingStart = nil
        recordingSeconds = 0
    }

    private func nextTakeName() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return "Take \(takes.count + 1) · \(formatter.string(from: .now))"
    }

    func rename(_ take: MimicTake, to name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let index = takes.firstIndex(where: { $0.id == take.id }) else {
            return
        }
        takes[index].name = trimmed
        persist()
    }

    func delete(_ take: MimicTake) {
        if playingTakeID == take.id { stopPlayback() }
        takes.removeAll { $0.id == take.id }
        persist()
    }

    func deleteAllTakes() {
        stopPlayback()
        takes = []
        persist()
    }

    // MARK: - Playback

    func play(_ take: MimicTake) {
        stopPlayback()
        guard take.frames.count >= 2 else { return }
        playingTakeID = take.id
        playbackFrame = take.frames.first
        playbackTask = Task { [weak self] in
            let started = Date()
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(33))
                guard let self else { return }
                let offset = Date().timeIntervalSince(started)
                guard offset <= take.duration else {
                    self.stopPlayback()
                    return
                }
                self.playbackFrame = take.frame(at: offset)
            }
        }
    }

    func stopPlayback() {
        playbackTask?.cancel()
        playbackTask = nil
        playingTakeID = nil
        playbackFrame = nil
    }

    private func persist() {
        LocalStore.shared.save(takes, key: StoreKey.mimicTakes)
    }
}
