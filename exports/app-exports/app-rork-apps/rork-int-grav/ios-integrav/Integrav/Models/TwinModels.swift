import Foundation

/// A source clip the user has fed into their digital twin.
///
/// A clip may be a real imported file (`fileName` set, playable, with a poster
/// frame lifted from the footage) or a length-only record from before importing
/// existed. The two are deliberately distinguishable: a record with no file must
/// never present a play button that does nothing.
nonisolated struct SourceVideo: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var name: String
    var minutes: Int
    var addedAt: Date
    /// File in the media container. `nil` for length-only records.
    var fileName: String?
    /// Poster frame taken from the clip itself.
    var thumbnailName: String?
    /// True length in seconds, read off the asset. Older records only know
    /// whole minutes.
    var seconds: Int?

    nonisolated init(
        id: UUID = UUID(),
        name: String,
        minutes: Int,
        addedAt: Date = .now,
        fileName: String? = nil,
        thumbnailName: String? = nil,
        seconds: Int? = nil
    ) {
        self.id = id
        self.name = name
        self.minutes = minutes
        self.addedAt = addedAt
        self.fileName = fileName
        self.thumbnailName = thumbnailName
        self.seconds = seconds
    }

    /// Whether this record points at footage that is actually on this device.
    nonisolated var isPlayable: Bool { MediaLibrary.exists(fileName) }

    nonisolated var url: URL? {
        guard let fileName, isPlayable else { return nil }
        return MediaLibrary.url(for: fileName)
    }

    /// "42 min", "1:12" past an hour, or "0:48" for a clip under a minute —
    /// rounding a 48-second import up to "1 min" made short clips look wrong.
    nonisolated var durationLabel: String {
        if let seconds, seconds < 60 { return "\(seconds) sec" }
        if minutes < 60 { return "\(minutes) min" }
        let hours = minutes / 60
        let remainder = minutes % 60
        return String(format: "%d:%02d", hours, remainder)
    }

    /// The timecode badge on the thumbnail: mm:ss for real footage.
    nonisolated var stampLabel: String {
        if let seconds {
            return String(format: "%02d:%02d", seconds / 60, seconds % 60)
        }
        if minutes < 60 { return String(format: "%02d:00", minutes) }
        let hours = minutes / 60
        let remainder = minutes % 60
        return String(format: "%02d:%02d", hours, remainder)
    }

    /// Training minutes a clip of this length contributes. A clip shorter than
    /// a minute still counts as one — it was still ingested.
    nonisolated static func trainingMinutes(forSeconds seconds: Int) -> Int {
        max(1, Int((Double(seconds) / 60).rounded()))
    }
}

nonisolated enum TwinRole: String, Codable, Sendable {
    case user
    case twin
}

/// One line in the live conversation with the twin.
nonisolated struct TwinMessage: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    let role: TwinRole
    let text: String
    let createdAt: Date

    nonisolated init(id: UUID = UUID(), role: TwinRole, text: String, createdAt: Date = .now) {
        self.id = id
        self.role = role
        self.text = text
        self.createdAt = createdAt
    }
}
