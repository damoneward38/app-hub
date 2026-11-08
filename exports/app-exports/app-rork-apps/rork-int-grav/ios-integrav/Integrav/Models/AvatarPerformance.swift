import Foundation

/// How one beat travels to the next.
nonisolated enum Easing: String, Sendable, CaseIterable {
    /// Constant speed — mechanical, used for held states.
    case linear
    /// Slow out of the pose. Reads as effort.
    case easeIn
    /// Fast then settle. Reads as reflex — the shape most real motion takes.
    case easeOut
    case easeInOut
    /// Arrive on frame one and hold. For snaps: a blink, a flinch, a hit.
    case snap
    /// Overshoots and comes back. For anything with weight behind it.
    case overshoot

    nonisolated func apply(_ t: Double) -> Double {
        let x = t.clamped(to: 0...1)
        switch self {
        case .linear: return x
        case .easeIn: return x * x
        case .easeOut: return 1 - (1 - x) * (1 - x)
        case .easeInOut: return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2
        case .snap: return x > 0 ? 1 : 0
        case .overshoot:
            let c = 1.70158
            let p = x - 1
            return 1 + (c + 1) * p * p * p + c * p * p
        }
    }
}

/// Every channel the rig can actually move.
///
/// Four of these are the real morph targets baked into the fitted head, and the
/// other three are its euler angles — there is deliberately nothing here the
/// renderer cannot draw, so a program can never describe a motion the avatar
/// silently fails to perform.
nonisolated struct RigPose: Equatable, Sendable {
    var mouthOpen: Double = 0
    var smile: Double = 0.12
    var blink: Double = 0
    var browRaise: Double = 0
    /// Radians. The head's own limits, matching the drag gesture's clamps.
    var yaw: Double = 0
    var pitch: Double = 0
    var roll: Double = 0

    /// What the face does when nothing is being performed: a trace of a smile,
    /// eyes open, level.
    nonisolated static let rest = RigPose()

    nonisolated static let blank = RigPose(smile: 0)

    nonisolated var clamped: RigPose {
        RigPose(
            mouthOpen: mouthOpen.clamped(to: 0...1),
            smile: smile.clamped(to: 0...1),
            blink: blink.clamped(to: 0...1),
            browRaise: browRaise.clamped(to: 0...1),
            yaw: yaw.clamped(to: -0.7...0.7),
            pitch: pitch.clamped(to: -0.32...0.32),
            roll: roll.clamped(to: -0.28...0.28)
        )
    }

    /// Linear blend toward another pose. `t` of 0 is self, 1 is other.
    nonisolated func mixed(with other: RigPose, t: Double) -> RigPose {
        let a = t.clamped(to: 0...1)
        func lerp(_ from: Double, _ to: Double) -> Double { from + (to - from) * a }
        return RigPose(
            mouthOpen: lerp(mouthOpen, other.mouthOpen),
            smile: lerp(smile, other.smile),
            blink: lerp(blink, other.blink),
            browRaise: lerp(browRaise, other.browRaise),
            yaw: lerp(yaw, other.yaw),
            pitch: lerp(pitch, other.pitch),
            roll: lerp(roll, other.roll)
        )
    }

    /// How far this pose is from another, as one number — used to tell a rig
    /// that is genuinely moving from one that is merely switched on.
    nonisolated func distance(to other: RigPose) -> Double {
        abs(mouthOpen - other.mouthOpen)
            + abs(smile - other.smile)
            + abs(blink - other.blink)
            + abs(browRaise - other.browRaise)
            + abs(yaw - other.yaw) * 1.4
            + abs(pitch - other.pitch) * 1.4
            + abs(roll - other.roll) * 1.4
    }

    /// The four morph weights in the renderer's target order, for telemetry.
    nonisolated var morphWeights: [(FaceMorph, Double)] {
        [
            (.mouthOpen, mouthOpen),
            (.smile, smile),
            (.blink, blink),
            (.browRaise, browRaise),
        ]
    }
}

/// One pose to travel to, and how long the travel takes.
nonisolated struct PerformanceBeat: Equatable, Sendable {
    var pose: RigPose
    var seconds: Double
    var easing: Easing

    nonisolated init(_ pose: RigPose, seconds: Double = 0.3, easing: Easing = .easeOut) {
        self.pose = pose
        self.seconds = max(0.02, seconds)
        self.easing = easing
    }
}

/// A body movement the procedural skeleton can actually build.
///
/// This is a closed list because every case has a real generator behind it in
/// `ProceduralBody` — a gesture with no generator would leave the figure frozen
/// while the label claimed it was dancing.
nonisolated enum BodyGesture: String, Sendable, CaseIterable {
    case still
    case breathe
    case wave
    case nod
    case shake
    case bounce
    case jump
    case spin
    case dance
    case bow
    case shrug
    case point
    case clap
    case stomp
    case kick
    case reach
    case recoil
    case sway
    case march
    case think
    case fold

    nonisolated var title: String {
        switch self {
        case .still: return "Hold"
        case .breathe: return "Breathe"
        case .wave: return "Wave"
        case .nod: return "Nod"
        case .shake: return "Shake head"
        case .bounce: return "Bounce"
        case .jump: return "Jump"
        case .spin: return "Spin"
        case .dance: return "Dance"
        case .bow: return "Bow"
        case .shrug: return "Shrug"
        case .point: return "Point"
        case .clap: return "Clap"
        case .stomp: return "Stomp"
        case .kick: return "Kick"
        case .reach: return "Reach up"
        case .recoil: return "Recoil"
        case .sway: return "Sway"
        case .march: return "March"
        case .think: return "Think"
        case .fold: return "Fold arms"
        }
    }

    /// True when the gesture moves the whole body rather than the upper half,
    /// so the stage can frame it wider.
    nonisolated var isFullBody: Bool {
        switch self {
        case .jump, .spin, .dance, .stomp, .kick, .march, .bounce: return true
        default: return false
        }
    }
}

/// One function, compiled into motion the rig performs.
nonisolated struct MotorProgram: Equatable, Sendable, Identifiable {
    /// The catalog name this was compiled from, e.g. `laugh_cackle`.
    let function: String
    let beats: [PerformanceBeat]
    let gesture: BodyGesture
    /// What the twin says while performing it.
    let line: String
    /// 0…1 — how hard the body plays it, and how hard the haptic hits.
    let intensity: Double
    /// True when this program was hand-directed rather than derived from the
    /// function's family. Surfaced honestly in the stage telemetry.
    let isDirected: Bool

    nonisolated var id: String { function }

    nonisolated var duration: Double { beats.reduce(0) { $0 + $1.seconds } }

    nonisolated init(
        function: String,
        beats: [PerformanceBeat],
        gesture: BodyGesture = .breathe,
        line: String = "",
        intensity: Double = 0.6,
        isDirected: Bool = false
    ) {
        self.function = function
        // A program with no beats would render as a frozen face, so the rest
        // pose is the floor rather than an empty timeline.
        self.beats = beats.isEmpty ? [PerformanceBeat(.rest, seconds: 0.4)] : beats
        self.gesture = gesture
        self.line = line
        self.intensity = intensity.clamped(to: 0...1)
        self.isDirected = isDirected
    }

    /// The pose at `time` seconds in, interpolated between beats.
    ///
    /// Travel always starts from rest rather than from wherever the last program
    /// left the face, because the engine cross-fades programs itself — baking a
    /// start pose in here would double the blend.
    nonisolated func pose(at time: Double) -> RigPose {
        guard time > 0 else { return .rest }
        var elapsed = 0.0
        var previous = RigPose.rest
        for beat in beats {
            if time < elapsed + beat.seconds {
                let local = (time - elapsed) / beat.seconds
                return previous.mixed(with: beat.pose, t: beat.easing.apply(local)).clamped
            }
            elapsed += beat.seconds
            previous = beat.pose
        }
        return previous.clamped
    }

    /// 0…1 through the program.
    nonisolated func phase(at time: Double) -> Double {
        guard duration > 0 else { return 1 }
        return (time / duration).clamped(to: 0...1)
    }
}
