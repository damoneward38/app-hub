import CoreGraphics
import Foundation
import Vision

nonisolated enum FaceLandmarkError: LocalizedError, Sendable {
    case unreadableImage
    case noFace
    case faceTooSmall
    case noLandmarks

    var errorDescription: String? {
        switch self {
        case .unreadableImage: return "That image could not be decoded."
        case .noFace: return "No face found. Fill the frame and face the camera."
        case .faceTooSmall: return "Move closer — the face is too small to measure."
        case .noLandmarks: return "Found a face but no landmarks. Try brighter, even light."
        }
    }
}

/// Turns a photo into `FaceMetrics` using Vision's on-device landmark detector.
///
/// This is the Swift equivalent of the MediaPipe FaceMesh step: Vision returns
/// 76 landmark points grouped by region (eyes, brows, nose, lips, face contour),
/// and we reduce them to the handful of proportions the mesh builder needs.
/// Runs entirely on device — no model download, no network.
nonisolated struct FaceLandmarkService: Sendable {

    /// Measures the largest face in the image.
    static func metrics(from image: CGImage) throws -> FaceMetrics {
        let request = VNDetectFaceLandmarksRequest()
        let handler = VNImageRequestHandler(cgImage: image, orientation: .up, options: [:])
        try handler.perform([request])

        guard let observations = request.results, !observations.isEmpty else {
            throw FaceLandmarkError.noFace
        }
        guard let face = observations.max(by: { lhs, rhs in
            lhs.boundingBox.width * lhs.boundingBox.height < rhs.boundingBox.width * rhs.boundingBox.height
        }) else {
            throw FaceLandmarkError.noFace
        }
        guard face.boundingBox.width >= 0.06, face.boundingBox.height >= 0.06 else {
            throw FaceLandmarkError.faceTooSmall
        }
        guard let landmarks = face.landmarks else {
            throw FaceLandmarkError.noLandmarks
        }
        return measure(face: face, landmarks: landmarks)
    }

    /// Reduces Vision regions to normalised proportions.
    ///
    /// Vision reports the bounding box in image space with a bottom-left origin,
    /// and each region's points relative to that box (also bottom-left). We keep
    /// the region points in box space — that *is* the face-relative space the
    /// mesh builder wants — and only flip the box itself into top-left image
    /// coordinates for texture mapping.
    static func measure(face: VNFaceObservation, landmarks: VNFaceLandmarks2D) -> FaceMetrics {
        let box = face.boundingBox
        var metrics = FaceMetrics.neutral
        metrics.boxX = Double(box.origin.x)
        metrics.boxY = Double(1 - box.origin.y - box.height) // flip to top-left origin
        metrics.boxWidth = Double(box.width)
        metrics.boxHeight = Double(box.height)
        metrics.confidence = Double(face.confidence)

        let leftEye = points(landmarks.leftEye)
        let rightEye = points(landmarks.rightEye)

        if let left = center(of: leftEye), let right = center(of: rightEye) {
            metrics.eyeLine = (left.y + right.y) / 2
            metrics.interocular = abs(left.x - right.x)
            metrics.roll = atan2(left.y - right.y, left.x - right.x)
            if metrics.roll > .pi / 2 { metrics.roll -= .pi }
            if metrics.roll < -.pi / 2 { metrics.roll += .pi }

            let widths = [span(leftEye)?.width, span(rightEye)?.width].compactMap { $0 }
            if !widths.isEmpty {
                metrics.eyeWidth = widths.reduce(0, +) / Double(widths.count)
            }
        }

        let nose = points(landmarks.nose)
        if let noseSpan = span(nose), let noseCenter = center(of: nose) {
            metrics.noseLine = noseCenter.y
            metrics.noseWidth = max(noseSpan.width, 0.12)
        }

        let lips = points(landmarks.outerLips)
        if let lipSpan = span(lips), let lipCenter = center(of: lips) {
            metrics.mouthLine = lipCenter.y
            metrics.lipWidth = lipSpan.width
        }

        let contour = points(landmarks.faceContour)
        if !contour.isEmpty {
            // Jaw: contour points in the bottom third, measured across.
            let lower = contour.filter { $0.y < 0.34 }
            if let jaw = span(lower.isEmpty ? contour : lower) {
                metrics.jawWidth = jaw.width
            }
            // Forehead: contour rarely reaches the crown, so use its widest span
            // (the temples) as the upper width.
            if let widest = span(contour) {
                metrics.foreheadWidth = widest.width
            }
        }

        return metrics.sanitized()
    }

    // MARK: - Region helpers

    private static func points(_ region: VNFaceLandmarkRegion2D?) -> [(x: Double, y: Double)] {
        guard let region, region.pointCount > 0 else { return [] }
        return region.normalizedPoints.map { (Double($0.x), Double($0.y)) }
    }

    private static func center(of points: [(x: Double, y: Double)]) -> (x: Double, y: Double)? {
        guard !points.isEmpty else { return nil }
        let count = Double(points.count)
        return (points.reduce(0) { $0 + $1.x } / count, points.reduce(0) { $0 + $1.y } / count)
    }

    private static func span(_ points: [(x: Double, y: Double)]) -> (width: Double, height: Double)? {
        guard let firstX = points.first?.x, let firstY = points.first?.y else { return nil }
        var minX = firstX, maxX = firstX, minY = firstY, maxY = firstY
        for point in points {
            minX = min(minX, point.x); maxX = max(maxX, point.x)
            minY = min(minY, point.y); maxY = max(maxY, point.y)
        }
        return (maxX - minX, maxY - minY)
    }
}
