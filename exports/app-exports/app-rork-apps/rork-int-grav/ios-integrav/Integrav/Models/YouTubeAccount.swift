import Foundation

/// Visibility applied to an uploaded video.
nonisolated enum YouTubePrivacy: String, Codable, CaseIterable, Identifiable, Sendable {
    case privateVideo = "private"
    case unlisted
    case publicVideo = "public"

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .privateVideo: return "Private"
        case .unlisted: return "Unlisted"
        case .publicVideo: return "Public"
        }
    }

    nonisolated var note: String {
        switch self {
        case .privateVideo: return "Only you can watch it"
        case .unlisted: return "Anyone with the link"
        case .publicVideo: return "Listed on your channel"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .privateVideo: return "lock.fill"
        case .unlisted: return "link"
        case .publicVideo: return "globe"
        }
    }
}

/// The OAuth client the user registered in Google Cloud Console.
///
/// Only the client id is stored in plain defaults — it is not a secret and is
/// visible in every redirect. The client secret, when the user has one, lives in
/// the Keychain and never leaves the device.
nonisolated struct YouTubeClient: Codable, Hashable, Sendable {
    var clientID: String
    /// Optional: Desktop-app clients issue one, iOS clients do not.
    var hasSecret: Bool

    nonisolated var isValid: Bool { YouTubeClient.looksLikeClientID(clientID) }

    /// Google installed-app clients redirect to the reversed client id.
    nonisolated var redirectScheme: String? {
        guard isValid else { return nil }
        let bare = clientID.replacingOccurrences(of: ".apps.googleusercontent.com", with: "")
        return "com.googleusercontent.apps.\(bare)"
    }

    nonisolated var redirectURI: String? {
        guard let redirectScheme else { return nil }
        return "\(redirectScheme):/oauth2redirect"
    }

    nonisolated static func looksLikeClientID(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        let suffix = ".apps.googleusercontent.com"
        guard trimmed.hasSuffix(suffix) else { return false }
        // Validate the project prefix, not the total length — the suffix alone is
        // 27 characters, so a length check on the whole string proves nothing.
        let prefix = String(trimmed.dropLast(suffix.count))
        return prefix.count >= 12 && prefix.allSatisfy { $0.isLetter || $0.isNumber || $0 == "-" }
    }
}

/// The connected YouTube channel, as returned by `channels?mine=true`.
nonisolated struct YouTubeChannel: Codable, Hashable, Sendable {
    let id: String
    let title: String
    let thumbnailURL: String?
    let subscriberLabel: String?
    let videoCount: String?
}

/// Where a completed render stands with YouTube.
nonisolated enum PublishState: String, Codable, Hashable, Sendable {
    case notPublished
    case publishing
    case published
    case failed
}
