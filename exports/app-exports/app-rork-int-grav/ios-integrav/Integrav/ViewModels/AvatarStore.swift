import Foundation
import Observation
import UIKit

/// Owns the captured face: the photo on disk, the measured proportions, and the
/// head mesh fitted to them. Everything stays on device.
@Observable
final class AvatarStore {
    enum Stage: Equatable {
        case idle
        case measuring
        case building
        case ready
        case failed(String)
    }

    private(set) var record: FaceCaptureRecord?
    private(set) var image: UIImage?
    private(set) var mesh: FaceMeshData?
    private(set) var stage: Stage = .idle

    /// Longest edge kept when re-encoding a capture — plenty for landmarks and a
    /// crisp texture, small enough to stay instant.
    private static let maxEdge: CGFloat = 1024

    var hasFace: Bool { record != nil && image != nil && mesh != nil }

    var metrics: FaceMetrics? { record?.metrics }

    init() {
        guard let stored = LocalStore.shared.load(FaceCaptureRecord.self, key: StoreKey.faceCapture),
              let loaded = AvatarStore.loadImage(named: stored.imageFile) else { return }
        record = stored
        image = loaded
        mesh = FaceMeshBuilder.build(from: stored.metrics)
        stage = .ready
    }

    // MARK: - Capture

    /// Measures a captured photo and fits the head to it.
    /// - Returns: `true` when a face was found and the rig was built.
    @discardableResult
    func ingest(imageData: Data, source: FaceCaptureRecord.CaptureSource) async -> Bool {
        stage = .measuring

        let outcome = await Task.detached(priority: .userInitiated) { () -> Result<(FaceMetrics, Data), Error> in
            guard let decoded = UIImage(data: imageData),
                  let normalized = AvatarStore.normalize(decoded),
                  let jpeg = normalized.jpegData(compressionQuality: 0.9),
                  let cgImage = normalized.cgImage else {
                return .failure(FaceLandmarkError.unreadableImage)
            }
            do {
                let metrics = try FaceLandmarkService.metrics(from: cgImage)
                return .success((metrics, jpeg))
            } catch {
                return .failure(error)
            }
        }.value

        switch outcome {
        case .failure(let error):
            stage = .failed(error.localizedDescription)
            return false

        case .success(let (metrics, jpeg)):
            stage = .building
            guard let stored = UIImage(data: jpeg) else {
                stage = .failed(FaceLandmarkError.unreadableImage.localizedDescription)
                return false
            }
            let built = FaceMeshBuilder.build(from: metrics)
            let filename = "face_\(UUID().uuidString).jpg"
            guard AvatarStore.writeImage(jpeg, named: filename) else {
                stage = .failed("Could not save the capture to this device.")
                return false
            }

            let previous = record?.imageFile
            let newRecord = FaceCaptureRecord(
                imageFile: filename,
                metrics: metrics,
                capturedAt: .now,
                source: source,
                vertexCount: built.vertexCount
            )
            record = newRecord
            image = stored
            mesh = built
            stage = .ready
            LocalStore.shared.save(newRecord, key: StoreKey.faceCapture)
            if let previous, previous != filename { AvatarStore.deleteImage(named: previous) }
            CloudSync.shared.pushFace(newRecord, imageData: jpeg)
            return true
        }
    }

    func clearFace() {
        if let file = record?.imageFile { AvatarStore.deleteImage(named: file) }
        record = nil
        image = nil
        mesh = nil
        stage = .idle
        UserDefaults.standard.removeObject(forKey: StoreKey.faceCapture)
        CloudSync.shared.removeFace()
    }

    /// Rebuilds the rig from the face model stored against the signed-in account.
    @discardableResult
    func adoptCloudFace(
        metrics: FaceMetrics,
        capturedAt: Date,
        source: FaceCaptureRecord.CaptureSource,
        imageData: Data
    ) -> Bool {
        guard let restored = UIImage(data: imageData) else { return false }
        let built = FaceMeshBuilder.build(from: metrics)
        let filename = "face_\(UUID().uuidString).jpg"
        guard AvatarStore.writeImage(imageData, named: filename) else { return false }

        let previous = record?.imageFile
        let restoredRecord = FaceCaptureRecord(
            imageFile: filename,
            metrics: metrics,
            capturedAt: capturedAt,
            source: source,
            vertexCount: built.vertexCount
        )
        record = restoredRecord
        image = restored
        mesh = built
        stage = .ready
        LocalStore.shared.save(restoredRecord, key: StoreKey.faceCapture)
        if let previous, previous != filename { AvatarStore.deleteImage(named: previous) }
        return true
    }

    func resetStage() {
        stage = record == nil ? .idle : .ready
    }

    // MARK: - Image plumbing

    /// Bakes orientation into the pixels (Vision reads raw buffers) and caps the
    /// longest edge.
    nonisolated static func normalize(_ image: UIImage) -> UIImage? {
        let size = image.size
        guard size.width > 0, size.height > 0 else { return nil }
        let scale = min(1, maxEdge / max(size.width, size.height))
        let target = CGSize(width: (size.width * scale).rounded(), height: (size.height * scale).rounded())
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
    }

    nonisolated static func imageURL(named name: String) -> URL? {
        let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
        return directory?.appendingPathComponent(name)
    }

    nonisolated static func writeImage(_ data: Data, named name: String) -> Bool {
        guard let url = imageURL(named: name) else { return false }
        do {
            try data.write(to: url, options: .atomic)
            return true
        } catch {
            return false
        }
    }

    nonisolated static func imageData(named name: String) -> Data? {
        guard let url = imageURL(named: name) else { return nil }
        return try? Data(contentsOf: url)
    }

    nonisolated static func loadImage(named name: String) -> UIImage? {
        guard let url = imageURL(named: name), let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    nonisolated static func deleteImage(named name: String) {
        guard let url = imageURL(named: name) else { return }
        try? FileManager.default.removeItem(at: url)
    }
}
