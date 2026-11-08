import Foundation

/// Builds body poses without a camera.
///
/// The mimic studio produces `BodyPoseFrame`s from Vision. This produces the
/// same type from a gesture and a phase, so the twin can perform a wave or a
/// kick with nobody standing in front of the lens — and the figure that draws
/// tracked bodies draws these with no changes at all.
nonisolated enum ProceduralBody {
    /// Confidence stamped on every generated joint. A synthesised joint is
    /// exact, so it sits above the draw floor and never flickers.
    private nonisolated static let certainty: Double = 1.0

    /// A relaxed standing figure, normalised the way Vision reports: x and y in
    /// 0…1 with y increasing downward.
    nonisolated static let standing: [BodyJoint: CGPoint] = [
        .nose: CGPoint(x: 0.500, y: 0.140),
        .neck: CGPoint(x: 0.500, y: 0.245),
        .leftShoulder: CGPoint(x: 0.408, y: 0.272),
        .rightShoulder: CGPoint(x: 0.592, y: 0.272),
        .leftElbow: CGPoint(x: 0.372, y: 0.400),
        .rightElbow: CGPoint(x: 0.628, y: 0.400),
        .leftWrist: CGPoint(x: 0.352, y: 0.522),
        .rightWrist: CGPoint(x: 0.648, y: 0.522),
        .root: CGPoint(x: 0.500, y: 0.530),
        .leftHip: CGPoint(x: 0.452, y: 0.548),
        .rightHip: CGPoint(x: 0.548, y: 0.548),
        .leftKnee: CGPoint(x: 0.444, y: 0.718),
        .rightKnee: CGPoint(x: 0.556, y: 0.718),
        .leftAnkle: CGPoint(x: 0.438, y: 0.892),
        .rightAnkle: CGPoint(x: 0.562, y: 0.892),
    ]

    /// The full skeleton for one gesture at one instant.
    ///
    /// - Parameters:
    ///   - gesture: which movement to build.
    ///   - phase: 0…1 through the movement. Cyclic gestures repeat inside it.
    ///   - intensity: 0…1 — how far the limbs actually travel.
    ///   - timestamp: stamped onto the frame so motion maths downstream works.
    nonisolated static func frame(
        gesture: BodyGesture,
        phase: Double,
        intensity: Double = 0.7,
        timestamp: TimeInterval = 0
    ) -> BodyPoseFrame {
        var points = standing
        let p = phase.clamped(to: 0...1)
        let amount = intensity.clamped(to: 0...1)
        // Cyclic gestures ease in and out at the edges of the program, so a
        // wave starts from the side rather than snapping to shoulder height.
        let envelope = sin(.pi * p)
        let tau = Double.pi * 2

        switch gesture {
        case .still:
            break

        case .breathe:
            let rise = sin(p * tau) * 0.004 * amount
            lift(&points, [.neck, .leftShoulder, .rightShoulder, .nose], by: -rise)
            offset(&points, [.leftWrist, .rightWrist], dx: 0, dy: rise * 0.6)

        case .wave:
            // The whole arm goes up once, then the hand oscillates from the
            // elbow — waving from the shoulder looks like signalling a plane.
            let raise = envelope * amount
            move(&points, .rightElbow, to: CGPoint(x: 0.665, y: 0.300), t: raise)
            move(&points, .rightWrist, to: CGPoint(x: 0.700, y: 0.185), t: raise)
            let swing = sin(p * tau * 3) * 0.045 * raise
            offset(&points, [.rightWrist], dx: swing, dy: -abs(swing) * 0.25)
            tilt(&points, degrees: 4 * raise)

        case .nod:
            let dip = sin(p * tau * 2) * 0.030 * amount
            offset(&points, [.nose], dx: 0, dy: dip)
            offset(&points, [.neck], dx: 0, dy: dip * 0.35)

        case .shake:
            let swing = sin(p * tau * 2.5) * 0.042 * amount
            offset(&points, [.nose], dx: swing, dy: 0)
            offset(&points, [.neck], dx: swing * 0.3, dy: 0)

        case .bounce:
            let rise = abs(sin(p * tau * 2)) * 0.030 * amount
            lift(&points, Array(points.keys), by: rise)
            // Feet stay planted, so the bounce compresses the legs.
            lift(&points, [.leftAnkle, .rightAnkle], by: -rise)
            offset(&points, [.leftKnee, .rightKnee], dx: 0, dy: rise * 0.4)

        case .jump:
            // One parabola, not a sine: a jump has a launch and a landing.
            let arc = 4 * p * (1 - p)
            let rise = arc * 0.150 * amount
            let crouch = (p < 0.15 || p > 0.85) ? 0.035 * amount : 0
            lift(&points, Array(points.keys), by: rise)
            offset(&points, [.leftKnee, .rightKnee], dx: 0, dy: crouch - rise * 0.25)
            offset(&points, [.leftAnkle, .rightAnkle], dx: 0, dy: -rise * 0.10)
            offset(&points, [.leftWrist, .rightWrist], dx: 0, dy: -rise * 0.9)
            offset(&points, [.leftElbow, .rightElbow], dx: 0, dy: -rise * 0.5)

        case .spin:
            // A 2D skeleton cannot rotate in depth, so the turn is sold by
            // narrowing the figure and crossing the arms as it passes side-on.
            let turn = sin(p * tau)
            let squeeze = 1 - abs(turn) * 0.82 * amount
            scaleHorizontally(&points, by: squeeze)
            offset(&points, [.leftWrist, .rightWrist], dx: turn * 0.05 * amount, dy: -0.03 * amount)

        case .dance:
            let sway = sin(p * tau * 2) * 0.038 * amount
            let counter = cos(p * tau * 2) * 0.030 * amount
            offset(&points, [.leftHip, .rightHip, .root], dx: sway, dy: 0)
            offset(&points, [.neck, .leftShoulder, .rightShoulder], dx: -sway * 0.6, dy: 0)
            offset(&points, [.nose], dx: -sway * 0.9, dy: 0)
            offset(&points, [.leftWrist, .leftElbow], dx: counter, dy: -abs(counter) * 1.6)
            offset(&points, [.rightWrist, .rightElbow], dx: -counter, dy: -abs(counter) * 1.1)
            offset(&points, [.leftKnee], dx: sway * 0.5, dy: -abs(sway) * 0.3)
            offset(&points, [.rightKnee], dx: sway * 0.5, dy: abs(sway) * 0.3)

        case .bow:
            let fold = envelope * amount
            offset(&points, [.nose], dx: 0, dy: 0.115 * fold)
            offset(&points, [.neck], dx: 0, dy: 0.075 * fold)
            offset(&points, [.leftShoulder, .rightShoulder], dx: 0, dy: 0.062 * fold)
            offset(&points, [.leftElbow, .rightElbow], dx: 0, dy: 0.030 * fold)
            offset(&points, [.leftWrist, .rightWrist], dx: 0, dy: 0.012 * fold)

        case .shrug:
            let up = envelope * amount
            lift(&points, [.leftShoulder, .rightShoulder], by: 0.030 * up)
            lift(&points, [.neck], by: 0.010 * up)
            move(&points, .leftElbow, to: CGPoint(x: 0.348, y: 0.395), t: up)
            move(&points, .rightElbow, to: CGPoint(x: 0.652, y: 0.395), t: up)
            move(&points, .leftWrist, to: CGPoint(x: 0.372, y: 0.455), t: up)
            move(&points, .rightWrist, to: CGPoint(x: 0.628, y: 0.455), t: up)

        case .point:
            let out = envelope * amount
            move(&points, .rightElbow, to: CGPoint(x: 0.660, y: 0.352), t: out)
            move(&points, .rightWrist, to: CGPoint(x: 0.790, y: 0.318), t: out)
            tilt(&points, degrees: -3 * out)

        case .clap:
            // Hands meet at the centre line, twice a cycle.
            let close = abs(sin(p * tau * 3))
            let reach = close * amount
            move(&points, .leftWrist, to: CGPoint(x: 0.482, y: 0.400), t: reach)
            move(&points, .rightWrist, to: CGPoint(x: 0.518, y: 0.400), t: reach)
            move(&points, .leftElbow, to: CGPoint(x: 0.408, y: 0.428), t: reach)
            move(&points, .rightElbow, to: CGPoint(x: 0.592, y: 0.428), t: reach)

        case .stomp:
            let lift = max(0, sin(p * tau * 2)) * 0.070 * amount
            offset(&points, [.rightAnkle], dx: 0, dy: -lift)
            offset(&points, [.rightKnee], dx: 0, dy: -lift * 0.45)
            offset(&points, [.leftShoulder, .rightShoulder, .neck, .nose], dx: 0, dy: lift * 0.12)

        case .kick:
            let swing = envelope * amount
            move(&points, .rightKnee, to: CGPoint(x: 0.640, y: 0.628), t: swing)
            move(&points, .rightAnkle, to: CGPoint(x: 0.790, y: 0.590), t: swing)
            offset(&points, [.neck, .nose, .leftShoulder, .rightShoulder], dx: -0.030 * swing, dy: 0)
            offset(&points, [.leftWrist], dx: -0.040 * swing, dy: -0.050 * swing)

        case .reach:
            let up = envelope * amount
            move(&points, .leftElbow, to: CGPoint(x: 0.395, y: 0.250), t: up)
            move(&points, .rightElbow, to: CGPoint(x: 0.605, y: 0.250), t: up)
            move(&points, .leftWrist, to: CGPoint(x: 0.378, y: 0.108), t: up)
            move(&points, .rightWrist, to: CGPoint(x: 0.622, y: 0.108), t: up)
            lift(&points, [.nose], by: 0.012 * up)

        case .recoil:
            let back = envelope * amount
            offset(&points, [.nose], dx: 0, dy: -0.028 * back)
            offset(&points, [.neck, .leftShoulder, .rightShoulder], dx: 0, dy: -0.014 * back)
            move(&points, .leftWrist, to: CGPoint(x: 0.410, y: 0.398), t: back)
            move(&points, .rightWrist, to: CGPoint(x: 0.590, y: 0.398), t: back)
            move(&points, .leftElbow, to: CGPoint(x: 0.352, y: 0.420), t: back)
            move(&points, .rightElbow, to: CGPoint(x: 0.648, y: 0.420), t: back)

        case .sway:
            let lean = sin(p * tau) * 0.045 * amount
            offset(&points, [.nose], dx: lean, dy: 0)
            offset(&points, [.neck, .leftShoulder, .rightShoulder], dx: lean * 0.7, dy: 0)
            offset(&points, [.leftElbow, .rightElbow], dx: lean * 0.55, dy: 0)
            offset(&points, [.leftWrist, .rightWrist], dx: lean * 0.4, dy: 0)

        case .march:
            let cycle = sin(p * tau * 2)
            let leftUp = max(0, cycle) * 0.075 * amount
            let rightUp = max(0, -cycle) * 0.075 * amount
            offset(&points, [.leftKnee], dx: 0, dy: -leftUp)
            offset(&points, [.leftAnkle], dx: 0.020 * amount, dy: -leftUp * 1.5)
            offset(&points, [.rightKnee], dx: 0, dy: -rightUp)
            offset(&points, [.rightAnkle], dx: -0.020 * amount, dy: -rightUp * 1.5)
            offset(&points, [.leftWrist, .leftElbow], dx: 0, dy: -rightUp * 0.8)
            offset(&points, [.rightWrist, .rightElbow], dx: 0, dy: -leftUp * 0.8)

        case .think:
            let up = envelope * amount
            move(&points, .rightElbow, to: CGPoint(x: 0.600, y: 0.395), t: up)
            move(&points, .rightWrist, to: CGPoint(x: 0.548, y: 0.215), t: up)
            offset(&points, [.nose], dx: -0.018 * up, dy: -0.008 * up)

        case .fold:
            let close = envelope * amount
            move(&points, .leftWrist, to: CGPoint(x: 0.560, y: 0.396), t: close)
            move(&points, .rightWrist, to: CGPoint(x: 0.440, y: 0.412), t: close)
            move(&points, .leftElbow, to: CGPoint(x: 0.388, y: 0.402), t: close)
            move(&points, .rightElbow, to: CGPoint(x: 0.612, y: 0.402), t: close)
        }

        return BodyPoseFrame(
            timestamp: timestamp,
            joints: points.mapValues { point in
                // Converted before clamping: these are CGFloats, and the
                // Comparable clamp SwiftUI ships for them is package-internal.
                TrackedJoint(
                    x: Double(point.x).clamped(to: 0...1),
                    y: Double(point.y).clamped(to: 0...1),
                    confidence: certainty
                )
            }
        )
    }

    // MARK: - Joint maths

    private nonisolated static func offset(
        _ points: inout [BodyJoint: CGPoint],
        _ joints: [BodyJoint],
        dx: Double,
        dy: Double
    ) {
        for joint in joints {
            guard let current = points[joint] else { continue }
            points[joint] = CGPoint(x: current.x + dx, y: current.y + dy)
        }
    }

    /// Positive `by` moves joints up the frame, which is *negative* y — the sign
    /// flip lives here so no caller has to remember it.
    private nonisolated static func lift(
        _ points: inout [BodyJoint: CGPoint],
        _ joints: [BodyJoint],
        by amount: Double
    ) {
        offset(&points, joints, dx: 0, dy: -amount)
    }

    private nonisolated static func move(
        _ points: inout [BodyJoint: CGPoint],
        _ joint: BodyJoint,
        to target: CGPoint,
        t: Double
    ) {
        guard let current = points[joint] else { return }
        let a = t.clamped(to: 0...1)
        points[joint] = CGPoint(
            x: current.x + (target.x - current.x) * a,
            y: current.y + (target.y - current.y) * a
        )
    }

    /// Squeezes the figure toward its own centre line.
    private nonisolated static func scaleHorizontally(
        _ points: inout [BodyJoint: CGPoint],
        by factor: Double
    ) {
        let centre = 0.5
        for (joint, point) in points {
            points[joint] = CGPoint(x: centre + (point.x - centre) * factor, y: point.y)
        }
    }

    /// Rotates the upper body about the neck.
    private nonisolated static func tilt(_ points: inout [BodyJoint: CGPoint], degrees: Double) {
        guard abs(degrees) > 0.001, let pivot = points[.neck] else { return }
        let radians = degrees * .pi / 180
        let upper: [BodyJoint] = [.nose, .leftShoulder, .rightShoulder, .leftElbow, .rightElbow, .leftWrist, .rightWrist]
        for joint in upper {
            guard let point = points[joint] else { continue }
            let dx = point.x - pivot.x
            let dy = point.y - pivot.y
            points[joint] = CGPoint(
                x: pivot.x + dx * cos(radians) - dy * sin(radians),
                y: pivot.y + dx * sin(radians) + dy * cos(radians)
            )
        }
    }
}
