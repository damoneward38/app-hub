import CoreGraphics
import Foundation

/// The limb group a joint belongs to, used for the coverage read-out.
nonisolated enum BodyGroup: String, Codable, CaseIterable, Sendable, Identifiable {
    case head
    case torso
    case arms
    case legs

    nonisolated var id: String { rawValue }

    nonisolated var label: String {
        switch self {
        case .head: return "Head"
        case .torso: return "Torso"
        case .arms: return "Arms"
        case .legs: return "Legs"
        }
    }
}

/// Every joint Intégrav mimics. These map one-to-one onto Vision's body pose
/// joints, minus the eyes and ears — a figure gains nothing from them and each
/// extra point is another thing that can jitter.
nonisolated enum BodyJoint: String, Codable, CaseIterable, Sendable, Identifiable {
    case nose
    case neck
    case leftShoulder
    case rightShoulder
    case leftElbow
    case rightElbow
    case leftWrist
    case rightWrist
    case root
    case leftHip
    case rightHip
    case leftKnee
    case rightKnee
    case leftAnkle
    case rightAnkle

    nonisolated var id: String { rawValue }

    nonisolated var group: BodyGroup {
        switch self {
        case .nose: return .head
        case .neck, .root, .leftShoulder, .rightShoulder, .leftHip, .rightHip: return .torso
        case .leftElbow, .rightElbow, .leftWrist, .rightWrist: return .arms
        case .leftKnee, .rightKnee, .leftAnkle, .rightAnkle: return .legs
        }
    }

    /// The mirror of this joint. Mirroring a pose swaps left and right, because
    /// the camera's "left" is the user's right when they face it.
    nonisolated var mirrored: BodyJoint {
        switch self {
        case .leftShoulder: return .rightShoulder
        case .rightShoulder: return .leftShoulder
        case .leftElbow: return .rightElbow
        case .rightElbow: return .leftElbow
        case .leftWrist: return .rightWrist
        case .rightWrist: return .leftWrist
        case .leftHip: return .rightHip
        case .rightHip: return .leftHip
        case .leftKnee: return .rightKnee
        case .rightKnee: return .leftKnee
        case .leftAnkle: return .rightAnkle
        case .rightAnkle: return .leftAnkle
        case .nose, .neck, .root: return self
        }
    }
}

/// A bone drawn between two joints.
nonisolated struct BodyBone: Hashable, Sendable, Identifiable {
    let from: BodyJoint
    let to: BodyJoint
    let group: BodyGroup

    nonisolated var id: String { "\(from.rawValue)-\(to.rawValue)" }

    /// The skeleton, in draw order: torso first so limbs sit on top of it.
    nonisolated static let skeleton: [BodyBone] = [
        BodyBone(from: .neck, to: .root, group: .torso),
        BodyBone(from: .leftShoulder, to: .rightShoulder, group: .torso),
        BodyBone(from: .leftHip, to: .rightHip, group: .torso),
        BodyBone(from: .leftShoulder, to: .leftHip, group: .torso),
        BodyBone(from: .rightShoulder, to: .rightHip, group: .torso),
        BodyBone(from: .nose, to: .neck, group: .head),
        BodyBone(from: .leftShoulder, to: .leftElbow, group: .arms),
        BodyBone(from: .leftElbow, to: .leftWrist, group: .arms),
        BodyBone(from: .rightShoulder, to: .rightElbow, group: .arms),
        BodyBone(from: .rightElbow, to: .rightWrist, group: .arms),
        BodyBone(from: .leftHip, to: .leftKnee, group: .legs),
        BodyBone(from: .leftKnee, to: .leftAnkle, group: .legs),
        BodyBone(from: .rightHip, to: .rightKnee, group: .legs),
        BodyBone(from: .rightKnee, to: .rightAnkle, group: .legs),
    ]
}

/// One tracked joint in view space: `x` runs left→right, `y` runs top→bottom,
/// both 0…1. Vision reports bottom-left origin; the conversion happens once, at
/// the service boundary, so nothing downstream has to remember which way is up.
nonisolated struct TrackedJoint: Codable, Hashable, Sendable {
    var x: Double
    var y: Double
    var confidence: Double

    nonisolated init(x: Double, y: Double, confidence: Double) {
        self.x = x
        self.y = y
        self.confidence = confidence
    }

    nonisolated var point: CGPoint { CGPoint(x: x, y: y) }

    /// Distance to another joint in normalised units.
    nonisolated func distance(to other: TrackedJoint) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return (dx * dx + dy * dy).squareRoot()
    }
}

/// One joint keyed by name — the persisted shape of a frame.
///
/// A dictionary keyed by an enum encodes as a flat alternating array in JSON,
/// which is unreadable and order-dependent. Frames are stored as a list of
/// these instead and rebuilt into a dictionary in memory.
nonisolated struct JointSample: Codable, Hashable, Sendable {
    let joint: BodyJoint
    let value: TrackedJoint
}

/// A single instant of a tracked body.
///
/// `Codable` is declared here rather than on the extension below: a conformance
/// declared in an extension picks up the file's default MainActor isolation, and
/// a main-actor `Encodable` cannot be used from the background decode a take
/// goes through.
nonisolated struct BodyPoseFrame: Hashable, Sendable, Codable {
    /// Seconds since the take started. Live frames use the capture timestamp.
    var timestamp: TimeInterval
    var joints: [BodyJoint: TrackedJoint]

    nonisolated init(timestamp: TimeInterval = 0, joints: [BodyJoint: TrackedJoint] = [:]) {
        self.timestamp = timestamp
        self.joints = joints
    }

    nonisolated subscript(joint: BodyJoint) -> TrackedJoint? { joints[joint] }

    /// Joints confident enough to draw. Vision reports a point for occluded
    /// joints too, at whatever confidence it can manage; drawing those makes the
    /// figure flail with limbs the camera never saw.
    nonisolated static let confidenceFloor: Double = 0.25

    nonisolated func confident(_ joint: BodyJoint) -> TrackedJoint? {
        guard let value = joints[joint], value.confidence >= BodyPoseFrame.confidenceFloor else {
            return nil
        }
        return value
    }

    nonisolated var trackedCount: Int {
        joints.values.count { $0.confidence >= BodyPoseFrame.confidenceFloor }
    }

    nonisolated var isEmpty: Bool { trackedCount == 0 }

    /// Mean confidence over the joints that cleared the floor.
    nonisolated var confidence: Double {
        let good = joints.values.filter { $0.confidence >= BodyPoseFrame.confidenceFloor }
        guard !good.isEmpty else { return 0 }
        return good.reduce(0) { $0 + $1.confidence } / Double(good.count)
    }

    /// Which limb groups are actually being tracked, so the UI can say "legs out
    /// of frame" instead of quietly dropping half the body.
    nonisolated func groupsTracked() -> Set<BodyGroup> {
        var found: Set<BodyGroup> = []
        for (joint, value) in joints where value.confidence >= BodyPoseFrame.confidenceFloor {
            found.insert(joint.group)
        }
        return found
    }

    nonisolated var missingGroups: [BodyGroup] {
        let tracked = groupsTracked()
        return BodyGroup.allCases.filter { !tracked.contains($0) }
    }

    /// Shoulder width — the unit every other proportion is measured in, because
    /// it barely changes as the subject moves toward or away from the lens.
    nonisolated var shoulderWidth: Double? {
        guard let left = confident(.leftShoulder), let right = confident(.rightShoulder) else {
            return nil
        }
        let width = left.distance(to: right)
        return width > 0.01 ? width : nil
    }

    /// Wrist-to-wrist span in shoulder widths. A T-pose lands around 3.
    nonisolated var armSpan: Double? {
        guard let left = confident(.leftWrist),
              let right = confident(.rightWrist),
              let unit = shoulderWidth else { return nil }
        return left.distance(to: right) / unit
    }

    /// Standing height in shoulder widths, nose to the lowest tracked ankle.
    nonisolated var standingHeight: Double? {
        guard let head = confident(.nose), let unit = shoulderWidth else { return nil }
        let ankles = [confident(.leftAnkle), confident(.rightAnkle)].compactMap { $0 }
        guard let lowest = ankles.max(by: { $0.y < $1.y }) else { return nil }
        return (lowest.y - head.y) / unit
    }

    /// A pose only counts as full-body when the feet are in shot. Framing that
    /// crops at the waist tracks fine and mimics badly, and the difference has
    /// to be visible before someone records a take they cannot use.
    nonisolated var isFullBody: Bool {
        confident(.leftAnkle) != nil || confident(.rightAnkle) != nil
    }

    /// Left/right flip for mirror mode: positions flip across the vertical
    /// centre line *and* the joint names swap, or the figure raises the opposite
    /// arm to the one you raised.
    nonisolated func mirroredHorizontally() -> BodyPoseFrame {
        var flipped: [BodyJoint: TrackedJoint] = [:]
        for (joint, value) in joints {
            flipped[joint.mirrored] = TrackedJoint(
                x: 1 - value.x,
                y: value.y,
                confidence: value.confidence
            )
        }
        return BodyPoseFrame(timestamp: timestamp, joints: flipped)
    }

    /// Exponential smoothing toward a new reading.
    ///
    /// `factor` is how much of the new frame to take: 1 is raw Vision output
    /// (jittery), 0.2 is heavily damped. A joint that was not tracked before is
    /// adopted outright — easing in from a stale position drags a phantom limb
    /// across the frame.
    nonisolated func smoothed(towards next: BodyPoseFrame, factor: Double) -> BodyPoseFrame {
        let alpha = min(1, max(0.05, factor))
        var blended: [BodyJoint: TrackedJoint] = [:]
        for (joint, incoming) in next.joints {
            guard let previous = joints[joint],
                  previous.confidence >= BodyPoseFrame.confidenceFloor,
                  incoming.confidence >= BodyPoseFrame.confidenceFloor else {
                blended[joint] = incoming
                continue
            }
            blended[joint] = TrackedJoint(
                x: previous.x + (incoming.x - previous.x) * alpha,
                y: previous.y + (incoming.y - previous.y) * alpha,
                confidence: incoming.confidence
            )
        }
        return BodyPoseFrame(timestamp: next.timestamp, joints: blended)
    }

    /// Mean per-joint travel against an earlier frame, in shoulder widths per
    /// second — the honest version of a "motion" meter.
    nonisolated func motion(since previous: BodyPoseFrame) -> Double {
        let elapsed = timestamp - previous.timestamp
        guard elapsed > 0.001, let unit = shoulderWidth else { return 0 }
        var total = 0.0
        var count = 0
        for (joint, value) in joints {
            guard value.confidence >= BodyPoseFrame.confidenceFloor,
                  let old = previous.confident(joint) else { continue }
            total += value.distance(to: old)
            count += 1
        }
        guard count > 0 else { return 0 }
        return (total / Double(count)) / unit / elapsed
    }
}

extension BodyPoseFrame {
    private enum CodingKeys: String, CodingKey {
        case timestamp
        case samples
    }

    nonisolated init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        timestamp = try container.decode(TimeInterval.self, forKey: .timestamp)
        let samples = try container.decode([JointSample].self, forKey: .samples)
        joints = Dictionary(samples.map { ($0.joint, $0.value) }) { _, last in last }
    }

    nonisolated func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(timestamp, forKey: .timestamp)
        // Sorted so an encoded take is stable between runs.
        let samples = joints
            .map { JointSample(joint: $0.key, value: $0.value) }
            .sorted { $0.joint.rawValue < $1.joint.rawValue }
        try container.encode(samples, forKey: .samples)
    }
}

/// A recorded movement the twin can replay.
nonisolated struct MimicTake: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var name: String
    var frames: [BodyPoseFrame]
    var recordedAt: Date

    nonisolated init(
        id: UUID = UUID(),
        name: String,
        frames: [BodyPoseFrame],
        recordedAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.frames = frames
        self.recordedAt = recordedAt
    }

    nonisolated var duration: TimeInterval {
        guard let first = frames.first?.timestamp, let last = frames.last?.timestamp else {
            return 0
        }
        return max(0, last - first)
    }

    nonisolated var durationLabel: String {
        String(format: "%.1fs", duration)
    }

    nonisolated var frameRate: Double {
        guard duration > 0.05 else { return 0 }
        return Double(frames.count - 1) / duration
    }

    /// True when every frame in the take had the feet in shot.
    nonisolated var isFullBody: Bool {
        !frames.isEmpty && frames.allSatisfy(\.isFullBody)
    }

    nonisolated var summary: String {
        let rate = frameRate > 0 ? String(format: " · %.0f fps", frameRate) : ""
        return "\(durationLabel) · \(frames.count) frames\(rate)"
    }

    /// The frame to show at `offset` seconds into playback, or nil past the end.
    nonisolated func frame(at offset: TimeInterval) -> BodyPoseFrame? {
        guard let start = frames.first?.timestamp else { return nil }
        let target = start + offset
        // Frames are recorded in order, so the last one at or before the target
        // is the one on screen.
        var match: BodyPoseFrame?
        for frame in frames {
            if frame.timestamp <= target { match = frame } else { break }
        }
        return match
    }
}
