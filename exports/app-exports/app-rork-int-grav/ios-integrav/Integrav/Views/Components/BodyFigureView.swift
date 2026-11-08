import SwiftUI

/// Maps normalised pose coordinates into a view.
///
/// Pose points are normalised against the *camera buffer*, which is almost
/// never the shape of the view showing it. Getting this wrong is not subtle:
/// the skeleton slides off the body as soon as the aspect ratios differ.
nonisolated struct PoseProjector: Sendable {
    enum Mode: Sendable {
        /// Match `AVCaptureVideoPreviewLayer`'s `.resizeAspectFill`: the buffer
        /// covers the view and the overflow is cropped evenly.
        case fill
        /// Frame the body itself, preserving proportions — used for the twin
        /// figure, which has no camera behind it.
        case fit(box: CGRect, padding: Double)
    }

    let size: CGSize
    let sourceAspect: Double
    let mode: Mode

    nonisolated func point(x: Double, y: Double) -> CGPoint {
        switch mode {
        case .fill:
            let viewAspect = size.height > 0 ? size.width / size.height : 1
            let aspect = sourceAspect > 0 ? sourceAspect : viewAspect
            var displayed = size
            if viewAspect > aspect {
                displayed = CGSize(width: size.width, height: size.width / aspect)
            } else {
                displayed = CGSize(width: size.height * aspect, height: size.height)
            }
            let originX = (size.width - displayed.width) / 2
            let originY = (size.height - displayed.height) / 2
            return CGPoint(
                x: originX + x * displayed.width,
                y: originY + y * displayed.height
            )

        case .fit(let box, let padding):
            // Work in square-pixel space so limbs keep their real proportions.
            let aspect = sourceAspect > 0 ? sourceAspect : 1
            let boxWidth = max(0.02, box.width * aspect)
            let boxHeight = max(0.02, box.height)
            let usable = CGSize(
                width: size.width * (1 - padding * 2),
                height: size.height * (1 - padding * 2)
            )
            let scale = min(usable.width / boxWidth, usable.height / boxHeight)
            let drawnWidth = boxWidth * scale
            let drawnHeight = boxHeight * scale
            let originX = (size.width - drawnWidth) / 2
            let originY = (size.height - drawnHeight) / 2
            return CGPoint(
                x: originX + (x * aspect - box.minX * aspect) * scale,
                y: originY + (y - box.minY) * scale
            )
        }
    }

    nonisolated func point(_ joint: TrackedJoint) -> CGPoint {
        point(x: joint.x, y: joint.y)
    }

    /// Scale factor from normalised units to points, for sizing the head and
    /// joint dots off the subject rather than off the view.
    nonisolated var unitScale: Double {
        let a = point(x: 0, y: 0)
        let b = point(x: 1, y: 0)
        return abs(b.x - a.x)
    }

    /// The bounding box of everything tracked, so the figure can be framed.
    nonisolated static func boundingBox(of pose: BodyPoseFrame) -> CGRect {
        let points = pose.joints.values.filter { $0.confidence >= BodyPoseFrame.confidenceFloor }
        guard let first = points.first else {
            return CGRect(x: 0.25, y: 0.1, width: 0.5, height: 0.8)
        }
        var minX = first.x, maxX = first.x, minY = first.y, maxY = first.y
        for value in points {
            minX = min(minX, value.x); maxX = max(maxX, value.x)
            minY = min(minY, value.y); maxY = max(maxY, value.y)
        }
        // The nose is not the top of the head. Leave room above it or the skull
        // is drawn clipped by the frame edge.
        let headroom = (maxY - minY) * 0.18
        return CGRect(
            x: minX,
            y: max(0, minY - headroom),
            width: max(0.05, maxX - minX),
            height: max(0.05, (maxY - minY) + headroom)
        )
    }
}

/// Draws a tracked body as a luminous figure.
///
/// Bones are only drawn between two joints Vision was actually confident about,
/// so an arm behind a back disappears instead of snapping to the torso.
struct BodyFigureView: View {
    let pose: BodyPoseFrame?
    var sourceAspect: Double = 9.0 / 16.0
    var fillsFrame: Bool = false
    var lineWidth: CGFloat = 7
    var showsHead: Bool = true
    var dims: Bool = false

    var body: some View {
        Canvas { context, size in
            guard let pose else { return }
            let projector = PoseProjector(
                size: size,
                sourceAspect: sourceAspect,
                mode: fillsFrame
                    ? .fill
                    : .fit(box: PoseProjector.boundingBox(of: pose), padding: 0.08)
            )

            for bone in BodyBone.skeleton {
                guard let start = pose.confident(bone.from),
                      let end = pose.confident(bone.to) else { continue }
                var path = Path()
                path.move(to: projector.point(start))
                path.addLine(to: projector.point(end))

                let strength = min(start.confidence, end.confidence)
                context.stroke(
                    path,
                    with: .color(tint(for: bone.group).opacity(dims ? 0.35 : 0.55 + strength * 0.45)),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
            }

            for (joint, value) in pose.joints where value.confidence >= BodyPoseFrame.confidenceFloor {
                let center = projector.point(value)
                let radius = lineWidth * 0.52
                context.fill(
                    Path(ellipseIn: CGRect(
                        x: center.x - radius,
                        y: center.y - radius,
                        width: radius * 2,
                        height: radius * 2
                    )),
                    with: .color(tint(for: joint.group).opacity(dims ? 0.5 : 1))
                )
            }

            if showsHead, let nose = pose.confident(.nose) {
                let center = projector.point(nose)
                // Head size follows the shoulders, so it stays right as the
                // subject walks toward or away from the camera.
                let unit = pose.shoulderWidth ?? 0.12
                let radius = max(lineWidth, projector.unitScale * unit * 0.42)
                let rect = CGRect(
                    x: center.x - radius,
                    y: center.y - radius * 1.05,
                    width: radius * 2,
                    height: radius * 2
                )
                context.stroke(
                    Path(ellipseIn: rect),
                    with: .color(Theme.magenta.opacity(dims ? 0.4 : 0.9)),
                    lineWidth: lineWidth * 0.75
                )
            }
        }
        .drawingGroup()
        .shadow(color: Theme.magenta.opacity(dims ? 0 : 0.5), radius: 12)
        .animation(.linear(duration: 0.06), value: pose)
    }

    private func tint(for group: BodyGroup) -> Color {
        switch group {
        case .head: return Theme.magenta
        case .torso: return Theme.violet
        case .arms: return Theme.magenta
        case .legs: return Color(hex: 0x6D8BFF)
        }
    }
}
