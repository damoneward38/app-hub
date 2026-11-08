import Foundation
import Observation

/// Drives the rig in real time.
///
/// Until now a function call appended two lines of text and the avatar's face
/// never moved — `smile` was a constant in the view. This owns the other half:
/// a 50 Hz loop that plays compiled programs onto the face and the body, blends
/// between them, and falls back to idle life when nothing is queued.
///
/// The loop is the only writer of `pose`, so nothing else in the app can leave
/// the rig stuck in a half-finished expression.
@Observable
final class StageStore {
    /// The rig's live state. Read by the head view every frame.
    private(set) var pose: RigPose = .rest
    /// The live body. `nil` when the figure is not being driven.
    private(set) var body: BodyPoseFrame?

    private(set) var current: MotorProgram?
    private(set) var queue: [MotorProgram] = []
    /// Seconds into the running program.
    private(set) var elapsed: Double = 0
    private(set) var isRunning: Bool = false

    /// Names performed this session, newest first — the live tape.
    private(set) var recent: [String] = []
    private(set) var performedCount: Int = 0

    /// Measured, not declared: frames the loop actually delivered in the last
    /// second. A stage that claims 50 fps while dropping frames is worse than
    /// one that admits it.
    private(set) var frameRate: Double = 0
    private(set) var frameCount: Int = 0

    /// Loops the running program until stopped, for holding a pose on screen.
    var isLooping: Bool = false
    /// Performs a new function on its own every few seconds.
    var isAutopilot: Bool = false {
        didSet { if !isAutopilot { autopilotDue = nil } }
    }

    /// Live microphone/speech loudness, folded into the jaw so a program never
    /// fights the actual audio — whichever is more open wins.
    private var speechLevel: Double = 0

    private var loop: Task<Void, Never>?
    private var lastTick: Date = .now
    private var frameWindowStart: Date = .now
    private var framesInWindow: Int = 0
    private var idlePhase: Double = 0
    private var nextBlink: Double = 3
    private var idleClock: Double = 0
    private var autopilotDue: Date?
    private var blinkUntil: Double = 0

    /// 50 Hz. Fast enough that a 70 ms snap reads as a snap, cheap enough to
    /// leave running behind a visible stage.
    private static let interval: Duration = .milliseconds(20)

    /// How fast the live pose chases the program's pose. Anything instant makes
    /// snaps read as glitches; anything slower smears them into mush.
    private static let follow: Double = 0.34

    // MARK: - Wiring

    /// Points the function registry at this engine, so every call from anywhere
    /// in the app — registry tap, chain step, chat, voice — actually moves the
    /// avatar instead of only appending a transcript line.
    func attach(registry: RegistryStore) {
        registry.performer = { [weak self] function in
            self?.perform(function)
        }
    }

    // MARK: - Performing

    /// Compiles a function and plays it now, interrupting whatever was running.
    func perform(_ function: AvatarFunction) {
        play(PerformanceDirector.program(for: function))
    }

    func play(_ program: MotorProgram) {
        current = program
        elapsed = 0
        performedCount += 1
        recent.insert(program.function, at: 0)
        if recent.count > 40 { recent.removeLast(recent.count - 40) }
        start()
    }

    /// Queues functions to play back to back — the honest version of "run them
    /// all", one at a time at performance speed rather than 300 at once.
    func enqueue(_ functions: [AvatarFunction]) {
        let programs = functions.map { PerformanceDirector.program(for: $0) }
        guard !programs.isEmpty else { return }
        if current == nil {
            queue.append(contentsOf: programs.dropFirst())
            play(programs[0])
        } else {
            queue.append(contentsOf: programs)
            start()
        }
    }

    func clearQueue() {
        queue = []
    }

    /// Ends the performance and lets the rig settle back to rest.
    func stopPerformance() {
        current = nil
        queue = []
        elapsed = 0
        isLooping = false
    }

    var queuedCount: Int { queue.count }

    /// 0…1 through the running program, for the transport bar.
    var progress: Double {
        guard let current, current.duration > 0 else { return 0 }
        return (elapsed / current.duration).clamped(to: 0...1)
    }

    /// True when the rig is meaningfully away from rest — used to tell a live
    /// performance from a stage that is merely switched on.
    var isMoving: Bool { pose.distance(to: .rest) > 0.06 }

    // MARK: - Loop

    func start() {
        guard loop == nil else { return }
        isRunning = true
        lastTick = .now
        frameWindowStart = .now
        framesInWindow = 0
        loop = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: StageStore.interval)
                guard let self, !Task.isCancelled else { return }
                self.tick()
            }
        }
    }

    func stop() {
        loop?.cancel()
        loop = nil
        isRunning = false
        frameRate = 0
        body = nil
        pose = .rest
    }

    /// One frame: advance the clock, sample the program, blend, and publish.
    private func tick() {
        let now = Date.now
        // Measured elapsed time, never the nominal interval — the loop is not
        // guaranteed its 20 ms and animating as if it were makes motion drift.
        let delta = min(0.1, max(0.001, now.timeIntervalSince(lastTick)))
        lastTick = now
        idleClock += delta

        framesInWindow += 1
        frameCount += 1
        if now.timeIntervalSince(frameWindowStart) >= 1 {
            frameRate = Double(framesInWindow) / now.timeIntervalSince(frameWindowStart)
            framesInWindow = 0
            frameWindowStart = now
        }

        let target: RigPose
        if let program = current {
            elapsed += delta
            if elapsed >= program.duration {
                advance(program)
            }
            let sampled = current.map { $0.pose(at: elapsed) } ?? idlePose()
            target = sampled
            body = ProceduralBody.frame(
                gesture: current?.gesture ?? .breathe,
                phase: current.map { $0.phase(at: elapsed) } ?? 0,
                intensity: current?.intensity ?? 0.4,
                timestamp: idleClock
            )
        } else {
            target = idlePose()
            body = ProceduralBody.frame(
                gesture: .breathe,
                phase: (idleClock / 4).truncatingRemainder(dividingBy: 1),
                intensity: 0.35,
                timestamp: idleClock
            )
            runAutopilotIfDue(now)
        }

        // The jaw answers to whichever is more open: the program or real audio.
        var blended = pose.mixed(with: target, t: StageStore.follow)
        blended.mouthOpen = max(blended.mouthOpen, speechLevel)
        pose = blended.clamped
    }

    /// The running program finished: take the next one, loop, or fall idle.
    private func advance(_ finished: MotorProgram) {
        if isLooping {
            elapsed = 0
            return
        }
        if !queue.isEmpty {
            let next = queue.removeFirst()
            current = next
            elapsed = 0
            performedCount += 1
            recent.insert(next.function, at: 0)
            if recent.count > 40 { recent.removeLast(recent.count - 40) }
            return
        }
        current = nil
        elapsed = 0
    }

    /// Breathing, drifting attention, and involuntary blinks. The difference
    /// between a model and someone who is present.
    private func idlePose() -> RigPose {
        idlePhase += 0.006
        let breath = sin(idlePhase * 2.1)
        let drift = sin(idlePhase * 0.7)

        var blink = 0.0
        if idleClock >= nextBlink {
            blinkUntil = idleClock + 0.16
            nextBlink = idleClock + Double.random(in: 2.8...6.4)
        }
        if idleClock < blinkUntil {
            // A blink is a fast close and a slower open, not a symmetric fade.
            let through = 1 - (blinkUntil - idleClock) / 0.16
            blink = through < 0.35 ? through / 0.35 : (1 - through) / 0.65
        }

        return RigPose(
            mouthOpen: 0,
            smile: 0.12 + breath * 0.03,
            blink: blink.clamped(to: 0...1),
            browRaise: max(0, drift) * 0.06,
            yaw: drift * 0.10,
            pitch: breath * 0.025,
            roll: drift * 0.02
        )
    }

    private func runAutopilotIfDue(_ now: Date) {
        guard isAutopilot else { return }
        guard let due = autopilotDue else {
            autopilotDue = now.addingTimeInterval(Double.random(in: 1.6...3.4))
            return
        }
        guard now >= due else { return }
        autopilotDue = nil
        guard let function = FunctionCatalog.all.randomElement() else { return }
        perform(function)
    }

    // MARK: - Audio

    /// Feeds real loudness into the jaw. Called from the voice loop.
    func pushSpeechLevel(_ value: Double) {
        speechLevel = value.clamped(to: 0...1)
    }

    // MARK: - Telemetry

    /// What the stage readout shows: real channel values, no invented ones.
    var channels: [(FaceMorph, Double)] { pose.morphWeights }

    var headAngles: (yaw: Double, pitch: Double, roll: Double) {
        (pose.yaw, pose.pitch, pose.roll)
    }

    /// Joints the procedural skeleton is currently publishing.
    var trackedJoints: Int { body?.trackedCount ?? 0 }

    var statusLine: String {
        if let current {
            return "\(current.function)() · \(current.gesture.title.lowercased())"
        }
        if isAutopilot { return "Autopilot · waiting for the next cue" }
        return isRunning ? "Idle · breathing" : "Stage asleep"
    }

    deinit {
        loop?.cancel()
    }
}
