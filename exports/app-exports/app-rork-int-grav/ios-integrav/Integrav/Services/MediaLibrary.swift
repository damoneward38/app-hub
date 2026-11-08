import AVFoundation
import Foundation
import UIKit

/// What an import produced: the stored file, its real length, and a frame
/// lifted from the footage itself for the thumbnail.
nonisolated struct ImportedClip: Sendable, Equatable {
    let fileName: String
    let thumbnailName: String?
    let seconds: Int
    let displayName: String
}

nonisolated enum MediaError: LocalizedError {
    case unreadable
    case emptyClip
    case storageFull

    nonisolated var errorDescription: String? {
        switch self {
        case .unreadable: return "That file couldn't be read."
        case .emptyClip: return "That clip has no playable video."
        case .storageFull: return "There isn't enough space left on this device."
        }
    }
}

/// Stores imported pictures and footage inside the app container.
///
/// Files are written with complete protection, so their contents are encrypted
/// with a key tied to the device passcode and are unreadable while the phone is
/// locked — the same guarantee the encrypted record store gives, applied to the
/// media the records point at.
nonisolated enum MediaLibrary {
    static let directoryName = "Media"

    static var directory: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent(directoryName, isDirectory: true)
    }

    static func url(for fileName: String) -> URL {
        directory.appendingPathComponent(fileName)
    }

    /// Whether the file behind a record is still on disk. A record whose file
    /// has gone must not offer a play button that does nothing.
    static func exists(_ fileName: String?) -> Bool {
        guard let fileName, !fileName.isEmpty else { return false }
        return FileManager.default.fileExists(atPath: url(for: fileName).path)
    }

    @discardableResult
    static func ensureDirectory() throws -> URL {
        let directory = self.directory
        if !FileManager.default.fileExists(atPath: directory.path) {
            try FileManager.default.createDirectory(
                at: directory,
                withIntermediateDirectories: true,
                attributes: [.protectionKey: FileProtectionType.complete]
            )
        }
        return directory
    }

    // MARK: - Import

    /// Copies a picked movie into the container, then reads its true duration
    /// and a poster frame out of the footage.
    static func importVideo(from source: URL, preferredName: String?) async throws -> ImportedClip {
        try ensureDirectory()

        let asset = AVURLAsset(url: source)
        guard try await asset.load(.isPlayable) else { throw MediaError.emptyClip }

        let duration = try await asset.load(.duration)
        let seconds = Int(CMTimeGetSeconds(duration).rounded())
        guard seconds > 0 else { throw MediaError.emptyClip }

        let fileExtension = source.pathExtension.isEmpty ? "mov" : source.pathExtension
        let fileName = "clip-\(UUID().uuidString).\(fileExtension)"
        let destination = url(for: fileName)

        do {
            try FileManager.default.copyItem(at: source, to: destination)
            try FileManager.default.setAttributes(
                [.protectionKey: FileProtectionType.complete],
                ofItemAtPath: destination.path
            )
        } catch {
            throw MediaError.storageFull
        }

        let thumbnailName = await makeThumbnail(for: destination)
        let displayName = preferredName.flatMap { $0.isEmpty ? nil : $0 }
            ?? source.deletingPathExtension().lastPathComponent
        let safeName = displayName.isEmpty ? "clip.\(fileExtension)" : "\(displayName).\(fileExtension)"

        return ImportedClip(
            fileName: fileName,
            thumbnailName: thumbnailName,
            seconds: seconds,
            displayName: safeName
        )
    }

    /// Writes a picked photo into the container as a JPEG.
    static func importImage(_ image: UIImage) throws -> String {
        try ensureDirectory()
        guard let data = image.jpegData(compressionQuality: 0.9) else { throw MediaError.unreadable }
        let fileName = "photo-\(UUID().uuidString).jpg"
        try data.write(to: url(for: fileName), options: [.atomic, .completeFileProtection])
        return fileName
    }

    /// Loads a stored image back off disk.
    static func image(named fileName: String?) -> UIImage? {
        guard let fileName, exists(fileName) else { return nil }
        guard let data = try? Data(contentsOf: url(for: fileName)) else { return nil }
        return UIImage(data: data)
    }

    static func remove(_ fileName: String?) {
        guard let fileName, !fileName.isEmpty else { return }
        try? FileManager.default.removeItem(at: url(for: fileName))
    }

    // MARK: - Thumbnails

    /// Grabs a frame a little way in — the first frame of a clip is very often
    /// black, which would make every import look broken.
    private static func makeThumbnail(for videoURL: URL) async -> String? {
        let asset = AVURLAsset(url: videoURL)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 640, height: 640)

        let duration = (try? await asset.load(.duration)) ?? .zero
        let totalSeconds = CMTimeGetSeconds(duration)
        let target = totalSeconds > 2 ? min(1.5, totalSeconds * 0.1) : 0
        let time = CMTime(seconds: target, preferredTimescale: 600)

        guard let cgImage = try? await generator.image(at: time).image else { return nil }
        return try? importImage(UIImage(cgImage: cgImage))
    }

    // MARK: - Footprint

    /// Total bytes the imported media occupies, for the vault read-out.
    static func bytesOnDisk() -> Int64 {
        let manager = FileManager.default
        guard let contents = try? manager.contentsOfDirectory(
            at: directory,
            includingPropertiesForKeys: [.fileSizeKey]
        ) else { return 0 }

        return contents.reduce(into: Int64(0)) { total, file in
            let size = (try? file.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0
            total += Int64(size)
        }
    }

    /// Deletes every imported file. Paired with the vault's erase button.
    static func removeEverything() {
        try? FileManager.default.removeItem(at: directory)
    }
}
