import CoreVideo
import Foundation
import Vision

/// Turns camera frames into `BodyPoseFrame`s with Vision's on-device body pose
/// detector. No model download, no network, nothing leaves the phone.
nonisolated struct BodyPoseService: Sendable {

    /// Vision joint → Intégrav joint. Eyes and ears are deliberately absent:
    /// they add four points that jitter and drive nothing in the figure.
    nonisolated static let jointMap: [VNHumanBodyPoseObservation.JointName: BodyJoint] = [
        .nose: .nose,
        .neck: .neck,
        .leftShoulder: .leftShoulder,
        .rightShoulder: .rightShoulder,
        .leftElbow: .leftElbow,
        .rightElbow: .rightElbow,
        .leftWrist: .leftWrist,
        .rightWrist: .rightWrist,
        .root: .root,
        .leftHip: .leftHip,
        .rightHip: .rightHip,
        .leftKnee: .leftKnee,
        .rightKnee: .rightKnee,
        .leftAnkle: .leftAnkle,
        .rightAnkle: .rightAnkle,
    ]

    /// Runs the detector over one pixel buffer. Returns nil when nobody is in
    /// shot — an empty frame and "no person" are different states and the UI
    /// says so.
    nonisolated static func detect(
        in pixelBuffer: CVPixelBuffer,
        orientation: CGImagePropertyOrientation,
        timestamp: TimeInterval
    ) throws -> BodyPoseFrame? {
        let request = VNDetectHumanBodyPoseRequest()
        let handler = VNImageRequestHandler(
            cvPixelBuffer: pixelBuffer,
            orientation: orientation,
            options: [:]
        )
        try handler.perform([request])

        guard let observations = request.results, !observations.isEmpty else { return nil }
        // Whoever fills the most frame is the subject. Vision has no notion of
        // "the one being filmed", so the biggest torso wins.
        let subject = observations.max { lhs, rhs in
            torsoSize(of: lhs) < torsoSize(of: rhs)
        }
        guard let subject else { return nil }
        let frame = convert(subject, timestamp: timestamp)
        return frame.isEmpty ? nil : frame
    }

    /// Pure conversion, split out so it can be tested without a camera.
    ///
    /// Vision reports normalised points with a bottom-left origin; every view in
    /// this app draws top-left. The flip happens here, once, rather than in each
    /// consumer.
    nonisolated static func convert(
        _ observation: VNHumanBodyPoseObservation,
        timestamp: TimeInterval
    ) -> BodyPoseFrame {
        guard let points = try? observation.recognizedPoints(.all) else {
            return BodyPoseFrame(timestamp: timestamp)
        }
        var joints: [BodyJoint: TrackedJoint] = [:]
        for (visionName, joint) in jointMap {
            guard let point = points[visionName], point.confidence > 0 else { continue }
            joints[joint] = TrackedJoint(
                x: Double(point.location.x),
                y: 1 - Double(point.location.y),
                confidence: Double(point.confidence)
            )
        }
        return BodyPoseFrame(timestamp: timestamp, joints: joints)
    }

    /// Rough on-screen size of a detected person, used to pick the subject.
    nonisolated static func torsoSize(of observation: VNHumanBodyPoseObservation) -> Double {
        guard let points = try? observation.recognizedPoints(.all),
              let neck = points[.neck], let root = points[.root],
              neck.confidence > 0, root.confidence > 0 else {
            return 0
        }
        return abs(Double(neck.location.y) - Double(root.location.y))
    }
}
