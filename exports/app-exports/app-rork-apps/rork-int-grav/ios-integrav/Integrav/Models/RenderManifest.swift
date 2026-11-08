import Foundation

/// One scene row inside `manifest.json`.
nonisolated struct ManifestScene: Codable, Hashable, Identifiable, Sendable {
    let id: String
    let file: String
    let start: String
    let end: String
    let duration: Double
    let transition: String
}

/// A decoded `out/manifest.json`, written by houly-pipe at the end of a render.
///
/// Field names match the Python side exactly — this decodes real pipeline output,
/// not a re-typed copy of it.
nonisolated struct RenderManifest: Codable, Hashable, Identifiable, Sendable {
    let generatedAt: String
    let output: String
    let duration: Double
    let durationLabel: String
    let resolution: String
    let fps: Double
    let codec: String
    let sizeBytes: Int
    let sizeLabel: String
    let renderSeconds: Double
    let scenes: [ManifestScene]
    let preview: String?
    let thumbnail: String?

    nonisolated var id: String { output + generatedAt }

    /// `manifest.json` writes a POSIX-ish stamp; fall back to now if it drifts.
    nonisolated var renderedAt: Date {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
        return formatter.date(from: generatedAt) ?? .distantPast
    }

    nonisolated var formatLabel: String { "\(resolution) @ \(Int(fps))" }

    /// How much faster than real time the render ran. Below 1 means slower.
    nonisolated var realtimeFactor: Double {
        guard renderSeconds > 0 else { return 0 }
        return duration / renderSeconds
    }

    nonisolated var speedLabel: String {
        guard realtimeFactor > 0 else { return "—" }
        return String(format: "%.2f×", realtimeFactor)
    }
}

/// A render imported from a houly-pipe `out/` folder: the manifest plus the
/// thumbnail bytes copied into the app's own storage.
nonisolated struct ImportedRender: Codable, Hashable, Identifiable, Sendable {
    let id: UUID
    let manifest: RenderManifest
    /// File name inside the app's Documents/renders directory.
    let thumbnailFile: String?
    let importedAt: Date
    var publishState: PublishState
    var youTubeVideoID: String?

    nonisolated init(
        id: UUID = UUID(),
        manifest: RenderManifest,
        thumbnailFile: String?,
        importedAt: Date = .now,
        publishState: PublishState = .notPublished,
        youTubeVideoID: String? = nil
    ) {
        self.id = id
        self.manifest = manifest
        self.thumbnailFile = thumbnailFile
        self.importedAt = importedAt
        self.publishState = publishState
        self.youTubeVideoID = youTubeVideoID
    }

    nonisolated var watchURL: URL? {
        guard let youTubeVideoID else { return nil }
        return URL(string: "https://www.youtube.com/watch?v=\(youTubeVideoID)")
    }
}
