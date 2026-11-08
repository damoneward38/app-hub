import Foundation
import simd

/// One blend shape: a full copy of the vertex positions in a deformed pose.
nonisolated struct FaceMorphTarget: Sendable {
    let morph: FaceMorph
    let positions: [SIMD3<Float>]
    let normals: [SIMD3<Float>]
}

/// A finished head: geometry, photo UVs and blend shapes.
nonisolated struct FaceMeshData: Sendable {
    let positions: [SIMD3<Float>]
    let normals: [SIMD3<Float>]
    let uvs: [SIMD2<Float>]
    let indices: [Int32]
    let morphs: [FaceMorphTarget]

    var vertexCount: Int { positions.count }
    var triangleCount: Int { indices.count / 3 }
}

/// Builds a head mesh fitted to measured face proportions, with the photo
/// projected onto it and four blend shapes rigged in.
///
/// This replaces the 3DMM least-squares fit from the Python prototype. Instead
/// of solving for 200 shape + 61 expression coefficients against a licensed
/// basis (which cannot be shipped in an app binary), it deforms an analytic head
/// with the measured proportions: jaw taper, brow ridge, nose, eye sockets,
/// cheeks and lips are placed exactly where the landmarks say they are. The
/// likeness comes from the person's own photo, projected onto that geometry.
nonisolated enum FaceMeshBuilder {
    /// Latitude divisions, crown to chin.
    static let rows: Int = 48
    /// Longitude divisions around the head.
    static let columns: Int = 64

    /// Model space: the head is exactly 1.0 tall, centred on the origin.
    static let crownY: Float = 0.5
    static let chinY: Float = -0.5
    /// Where the detected face box's top edge (the brow) sits on the head.
    static let browY: Float = 0.17

    static func build(from rawMetrics: FaceMetrics) -> FaceMeshData {
        let metrics = rawMetrics.sanitized()
        let shape = HeadShape(metrics: metrics)

        var positions: [SIMD3<Float>] = []
        var uvs: [SIMD2<Float>] = []
        positions.reserveCapacity((rows + 1) * (columns + 1))
        uvs.reserveCapacity((rows + 1) * (columns + 1))

        for row in 0...rows {
            let phi = Float(row) / Float(rows) * .pi
            for column in 0...columns {
                let theta = Float(column) / Float(columns) * 2 * .pi - .pi
                let point = shape.point(phi: phi, theta: theta)
                positions.append(point)
                uvs.append(shape.uv(for: point, theta: theta))
            }
        }

        let indices = triangleIndices()
        let normals = computeNormals(positions: positions, indices: indices)

        let morphs = FaceMorph.allCases.map { morph in
            let deformed = positions.map { shape.deform($0, morph: morph) }
            return FaceMorphTarget(
                morph: morph,
                positions: deformed,
                normals: computeNormals(positions: deformed, indices: indices)
            )
        }

        return FaceMeshData(
            positions: positions,
            normals: normals,
            uvs: uvs,
            indices: indices,
            morphs: morphs
        )
    }

    // MARK: - Topology

    static func triangleIndices() -> [Int32] {
        var indices: [Int32] = []
        indices.reserveCapacity(rows * columns * 6)
        let stride = columns + 1
        for row in 0..<rows {
            for column in 0..<columns {
                let topLeft = Int32(row * stride + column)
                let topRight = topLeft + 1
                let bottomLeft = Int32((row + 1) * stride + column)
                let bottomRight = bottomLeft + 1
                indices.append(contentsOf: [topLeft, bottomLeft, topRight])
                indices.append(contentsOf: [topRight, bottomLeft, bottomRight])
            }
        }
        return indices
    }

    static func computeNormals(positions: [SIMD3<Float>], indices: [Int32]) -> [SIMD3<Float>] {
        var normals = [SIMD3<Float>](repeating: .zero, count: positions.count)
        var index = 0
        while index + 2 < indices.count {
            let a = Int(indices[index])
            let b = Int(indices[index + 1])
            let c = Int(indices[index + 2])
            let edge1 = positions[b] - positions[a]
            let edge2 = positions[c] - positions[a]
            let faceNormal = cross(edge1, edge2)
            normals[a] += faceNormal
            normals[b] += faceNormal
            normals[c] += faceNormal
            index += 3
        }
        return zip(normals, positions).map { normal, position in
            let length = simd_length(normal)
            if length > 1e-6 { return normal / length }
            let fallback = simd_length(position)
            return fallback > 1e-6 ? position / fallback : SIMD3<Float>(0, 0, 1)
        }
    }
}

/// The analytic head: an ellipsoid pushed around by measured facial landmarks.
nonisolated struct HeadShape: Sendable {
    let metrics: FaceMetrics

    let radiusX: Float
    let radiusY: Float
    let radiusZ: Float

    /// Half the width of the *face* (temple to temple) in model units.
    let faceHalfWidth: Float

    let eyeY: Float
    let noseY: Float
    let mouthY: Float
    let eyeOffsetX: Float

    nonisolated init(metrics: FaceMetrics) {
        self.metrics = metrics

        // A head is about 0.68 as wide as it is tall; a long narrow face makes it
        // narrower, a broad face wider.
        let widthFactor = Float((1.3 / max(metrics.aspect, 0.6)).clamped(to: 0.86...1.14))
        radiusY = 0.5
        radiusX = 0.34 * widthFactor
        radiusZ = radiusX * 1.18
        faceHalfWidth = radiusX * 0.95

        let span = FaceMeshBuilder.browY - FaceMeshBuilder.chinY
        eyeY = FaceMeshBuilder.chinY + Float(metrics.eyeLine) * span
        noseY = FaceMeshBuilder.chinY + Float(metrics.noseLine) * span
        mouthY = FaceMeshBuilder.chinY + Float(metrics.mouthLine) * span
        eyeOffsetX = Float(metrics.interocular) * faceHalfWidth
    }

    /// A single surface point. `theta` = 0 faces the camera.
    func point(phi: Float, theta: Float) -> SIMD3<Float> {
        let sinPhi = sin(phi)
        var y = radiusY * cos(phi)
        var x = radiusX * sinPhi * sin(theta)
        var z = radiusZ * sinPhi * cos(theta)

        let front = max(0, cos(theta))
        let frontness = front * front

        // Jaw taper: the head narrows and shortens in depth below the eye line.
        if y < eyeY {
            let t = ((eyeY - y) / (eyeY - FaceMeshBuilder.chinY)).clamped(to: 0...1)
            let jaw = Float(metrics.jawWidth / 0.74)
            let target = 0.58 * jaw
            let taper = 1 - pow(t, 1.5) * (1 - target)
            x *= taper
            z *= 1 - pow(t, 1.8) * 0.28
        }

        // Crown: gently narrow above the brow so the skull is not a beach ball.
        if y > FaceMeshBuilder.browY {
            let t = ((y - FaceMeshBuilder.browY) / (FaceMeshBuilder.crownY - FaceMeshBuilder.browY)).clamped(to: 0...1)
            let forehead = Float(metrics.foreheadWidth / 0.9)
            x *= 1 - t * t * (0.14 / max(forehead, 0.6))
        }

        // Faces are flatter than spheres.
        z *= 1 - frontness * 0.1
        if cos(theta) < 0 { z *= 0.95 }

        var relief: Float = 0
        relief += bump(x: x, y: y, cx: 0, cy: noseY, sx: 0.055, sy: 0.085) * 0.075
        relief += bump(x: x, y: y, cx: 0, cy: (noseY + eyeY) / 2, sx: 0.032, sy: 0.09) * 0.03
        relief += bump(x: x, y: y, cx: eyeOffsetX, cy: eyeY + 0.05, sx: 0.09, sy: 0.028) * 0.022
        relief += bump(x: x, y: y, cx: -eyeOffsetX, cy: eyeY + 0.05, sx: 0.09, sy: 0.028) * 0.022
        relief -= bump(x: x, y: y, cx: eyeOffsetX, cy: eyeY, sx: Float(metrics.eyeWidth) * faceHalfWidth, sy: 0.03) * 0.03
        relief -= bump(x: x, y: y, cx: -eyeOffsetX, cy: eyeY, sx: Float(metrics.eyeWidth) * faceHalfWidth, sy: 0.03) * 0.03
        relief += bump(x: x, y: y, cx: faceHalfWidth * 0.62, cy: (eyeY + mouthY) / 2, sx: 0.09, sy: 0.07) * 0.022
        relief += bump(x: x, y: y, cx: -faceHalfWidth * 0.62, cy: (eyeY + mouthY) / 2, sx: 0.09, sy: 0.07) * 0.022
        relief += bump(x: x, y: y, cx: 0, cy: mouthY, sx: Float(metrics.lipWidth) * faceHalfWidth, sy: 0.026) * 0.03
        relief -= bump(x: x, y: y, cx: 0, cy: mouthY, sx: Float(metrics.lipWidth) * faceHalfWidth * 0.9, sy: 0.006) * 0.012
        relief += bump(x: x, y: y, cx: 0, cy: -0.43, sx: 0.075, sy: 0.05) * 0.028

        z += relief * frontness

        // Head roll, so a tilted capture still lines up with its texture.
        let roll = Float(metrics.roll)
        if abs(roll) > 0.001 {
            let cosR = cos(roll), sinR = sin(roll)
            let rotatedX = x * cosR - y * sinR
            let rotatedY = x * sinR + y * cosR
            x = rotatedX
            y = rotatedY
        }

        return SIMD3<Float>(x, y, z)
    }

    /// Projects the captured photo onto the head: a planar front projection
    /// keyed to the detected face box, fading to a cheek sample around the back
    /// so the skull reads as skin instead of a mirrored face.
    func uv(for point: SIMD3<Float>, theta: Float) -> SIMD2<Float> {
        let boxX = Float(metrics.boxX)
        let boxY = Float(metrics.boxY)
        let boxWidth = Float(metrics.boxWidth)
        let boxHeight = Float(metrics.boxHeight)

        let u = boxX + boxWidth * (0.5 + point.x / (2 * faceHalfWidth))
        let verticalSpan = FaceMeshBuilder.browY - FaceMeshBuilder.chinY
        let t = (point.y - FaceMeshBuilder.chinY) / verticalSpan
        let v = boxY + boxHeight * (1 - t)

        // Sample just inside the face edge for anything turned away from camera.
        let edgeU = boxX + boxWidth * (point.x >= 0 ? 0.86 : 0.14)
        let edgeV = boxY + boxHeight * 0.45
        let blend = smoothstep(-0.12, 0.34, cos(theta))

        return SIMD2<Float>(
            mix(edgeU, u, t: blend).clamped(to: 0...1),
            mix(edgeV, v, t: blend).clamped(to: 0...1)
        )
    }

    // MARK: - Blend shapes

    func deform(_ point: SIMD3<Float>, morph: FaceMorph) -> SIMD3<Float> {
        switch morph {
        case .mouthOpen: return mouthOpen(point)
        case .smile: return smile(point)
        case .blink: return blink(point)
        case .browRaise: return browRaise(point)
        }
    }

    /// Swings the jaw down and back around a pivot behind the ears.
    private func mouthOpen(_ point: SIMD3<Float>) -> SIMD3<Float> {
        let pivotY = mouthY + 0.09
        guard point.y < pivotY else { return point }
        let weight = pow(((pivotY - point.y) / (pivotY - FaceMeshBuilder.chinY)).clamped(to: 0...1), 1.25)
        let angle = 0.30 * weight
        let pivotZ: Float = -0.12
        let dy = point.y - pivotY
        let dz = point.z - pivotZ
        let cosA = cos(angle), sinA = sin(angle)
        var result = point
        result.y = pivotY + dy * cosA - dz * sinA
        result.z = pivotZ + dy * sinA + dz * cosA
        // Part the lips a little more than the jaw alone would.
        let lips = bump(x: point.x, y: point.y, cx: 0, cy: mouthY - 0.012,
                        sx: Float(metrics.lipWidth) * faceHalfWidth, sy: 0.022)
        result.y -= lips * 0.018
        return result
    }

    /// Pulls the mouth corners out and up, lifting the cheeks with them.
    private func smile(_ point: SIMD3<Float>) -> SIMD3<Float> {
        let cornerX = Float(metrics.lipWidth) * faceHalfWidth
        let side: Float = point.x >= 0 ? 1 : -1
        let corner = bump(x: point.x, y: point.y, cx: side * cornerX, cy: mouthY, sx: 0.055, sy: 0.04)
        let cheek = bump(x: point.x, y: point.y, cx: side * faceHalfWidth * 0.6,
                         cy: (eyeY + mouthY) / 2, sx: 0.085, sy: 0.07)
        var result = point
        result.x += side * corner * 0.022
        result.y += corner * 0.020 + cheek * 0.010
        result.z += cheek * 0.008
        return result
    }

    /// Drops the upper lids over the eyes.
    private func blink(_ point: SIMD3<Float>) -> SIMD3<Float> {
        let lidWidth = Float(metrics.eyeWidth) * faceHalfWidth
        let left = bump(x: point.x, y: point.y, cx: eyeOffsetX, cy: eyeY + 0.014, sx: lidWidth, sy: 0.026)
        let right = bump(x: point.x, y: point.y, cx: -eyeOffsetX, cy: eyeY + 0.014, sx: lidWidth, sy: 0.026)
        let lid = max(left, right)
        var result = point
        result.y -= lid * 0.026
        result.z += lid * 0.006
        return result
    }

    /// Raises the brow ridge.
    private func browRaise(_ point: SIMD3<Float>) -> SIMD3<Float> {
        let left = bump(x: point.x, y: point.y, cx: eyeOffsetX, cy: eyeY + 0.055, sx: 0.1, sy: 0.045)
        let right = bump(x: point.x, y: point.y, cx: -eyeOffsetX, cy: eyeY + 0.055, sx: 0.1, sy: 0.045)
        let brow = max(left, right)
        var result = point
        result.y += brow * 0.022
        result.z += brow * 0.006
        return result
    }

    // MARK: - Math helpers

    /// Anisotropic gaussian falloff, 1 at the centre.
    private func bump(x: Float, y: Float, cx: Float, cy: Float, sx: Float, sy: Float) -> Float {
        let dx = (x - cx) / max(sx, 0.001)
        let dy = (y - cy) / max(sy, 0.001)
        return exp(-(dx * dx + dy * dy))
    }
}

nonisolated func smoothstep(_ edge0: Float, _ edge1: Float, _ value: Float) -> Float {
    let t = ((value - edge0) / max(edge1 - edge0, 1e-6)).clamped(to: 0...1)
    return t * t * (3 - 2 * t)
}

nonisolated func mix(_ a: Float, _ b: Float, t: Float) -> Float { a + (b - a) * t }

extension Float {
    nonisolated func clamped(to range: ClosedRange<Float>) -> Float {
        Swift.min(Swift.max(self, range.lowerBound), range.upperBound)
    }
}
