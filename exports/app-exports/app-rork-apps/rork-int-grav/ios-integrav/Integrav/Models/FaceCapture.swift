import CoreGraphics
import Foundation

/// Proportions of a real face, measured from detected landmarks.
///
/// Every value is resolution-independent: `faceWidth`/`faceHeight` are fractions
/// of the source image, and every other length is a fraction of the detected
/// face box, so the same metrics rebuild the same head from a 480p webcam grab
/// or a 12MP photo.
nonisolated struct FaceMetrics: Codable, Hashable, Sendable {
    /// Detected face box inside the image, normalised, origin top-left.
    var boxX: Double
    var boxY: Double
    var boxWidth: Double
    var boxHeight: Double

    /// Vertical landmark lines, 0 = chin, 1 = top of the face box.
    var eyeLine: Double
    var noseLine: Double
    var mouthLine: Double

    /// Horizontal spans as a fraction of face width.
    var interocular: Double
    var eyeWidth: Double
    var noseWidth: Double
    var lipWidth: Double
    var jawWidth: Double
    var foreheadWidth: Double

    /// Head roll in radians, from the eye-to-eye axis.
    var roll: Double
    var confidence: Double

    /// Average adult proportions — the fallback when a region is undetectable.
    static let neutral = FaceMetrics(
        boxX: 0.25,
        boxY: 0.18,
        boxWidth: 0.5,
        boxHeight: 0.62,
        eyeLine: 0.62,
        noseLine: 0.42,
        mouthLine: 0.24,
        interocular: 0.42,
        eyeWidth: 0.22,
        noseWidth: 0.24,
        lipWidth: 0.36,
        jawWidth: 0.74,
        foreheadWidth: 0.9,
        roll: 0,
        confidence: 0
    )

    /// Height over width of the detected face box.
    var aspect: Double { boxHeight / max(boxWidth, 0.0001) }

    /// Rejects boxes too small or too shallow to carry usable landmark detail.
    var isUsable: Bool {
        boxWidth >= 0.08 && boxHeight >= 0.08 && confidence >= 0.2
    }

    /// Clamps every field into an anatomically sane range so a bad detection can
    /// never produce a broken mesh.
    func sanitized() -> FaceMetrics {
        var copy = self
        copy.boxWidth = boxWidth.clamped(to: 0.05...1)
        copy.boxHeight = boxHeight.clamped(to: 0.05...1)
        copy.boxX = boxX.clamped(to: -0.2...1)
        copy.boxY = boxY.clamped(to: -0.2...1)
        copy.eyeLine = eyeLine.clamped(to: 0.45...0.8)
        copy.noseLine = noseLine.clamped(to: 0.25...0.58)
        copy.mouthLine = mouthLine.clamped(to: 0.08...0.4)
        copy.interocular = interocular.clamped(to: 0.28...0.58)
        copy.eyeWidth = eyeWidth.clamped(to: 0.12...0.32)
        copy.noseWidth = noseWidth.clamped(to: 0.14...0.36)
        copy.lipWidth = lipWidth.clamped(to: 0.2...0.55)
        copy.jawWidth = jawWidth.clamped(to: 0.55...1)
        copy.foreheadWidth = foreheadWidth.clamped(to: 0.6...1.05)
        copy.roll = roll.clamped(to: -0.5...0.5)
        copy.confidence = confidence.clamped(to: 0...1)

        // Landmark lines must stay in anatomical order, chin upward.
        if copy.mouthLine >= copy.noseLine { copy.mouthLine = copy.noseLine - 0.08 }
        if copy.noseLine >= copy.eyeLine { copy.noseLine = copy.eyeLine - 0.1 }
        return copy
    }

    /// Human-readable summary shown under the captured portrait.
    var readout: [(String, String)] {
        [
            ("interocular", String(format: "%.2f w", interocular)),
            ("jaw", String(format: "%.2f w", jawWidth)),
            ("eye line", String(format: "%.2f h", eyeLine)),
            ("mouth line", String(format: "%.2f h", mouthLine)),
            ("aspect", String(format: "%.2f", aspect)),
            ("confidence", String(format: "%.0f%%", confidence * 100)),
        ]
    }
}

/// A face the user captured: the photo on disk plus the geometry fitted to it.
nonisolated struct FaceCaptureRecord: Codable, Hashable, Sendable {
    var imageFile: String
    var metrics: FaceMetrics
    var capturedAt: Date
    var source: CaptureSource
    var vertexCount: Int

    nonisolated enum CaptureSource: String, Codable, Sendable {
        case camera
        case library

        var label: String {
            switch self {
            case .camera: return "Camera"
            case .library: return "Photo"
            }
        }
    }
}

/// The blend shapes the rig ships with. Order is the morph-target order in the
/// generated mesh, so the raw values double as SceneKit target indices.
nonisolated enum FaceMorph: Int, CaseIterable, Sendable {
    case mouthOpen
    case smile
    case blink
    case browRaise

    var name: String {
        switch self {
        case .mouthOpen: return "mouth_open"
        case .smile: return "smile"
        case .blink: return "blink"
        case .browRaise: return "brow_raise"
        }
    }
}

extension Double {
    nonisolated func clamped(to range: ClosedRange<Double>) -> Double {
        Swift.min(Swift.max(self, range.lowerBound), range.upperBound)
    }
}
