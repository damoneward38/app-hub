import AuthenticationServices
import CryptoKit
import Foundation

/// Real Google OAuth 2.0 for installed apps, scoped to YouTube upload.
///
/// Uses PKCE with no embedded secret, which is the only flow Google permits for
/// a shipped mobile binary. The user supplies their own OAuth client id from
/// Google Cloud Console; tokens are stored in the Keychain, never in defaults.
nonisolated enum YouTubeService {
    nonisolated static let scope = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly"

    nonisolated static let accessTokenKey = "youtube_access_token"
    nonisolated static let refreshTokenKey = "youtube_refresh_token"
    nonisolated static let clientSecretKey = "youtube_client_secret"

    // MARK: - Authorization

    /// Runs the consent screen and exchanges the returned code for tokens.
    @MainActor
    static func authorize(client: YouTubeClient) async throws -> YouTubeTokens {
        guard client.isValid, let redirectURI = client.redirectURI, let scheme = client.redirectScheme else {
            throw YouTubeError.invalidClient
        }

        let verifier = randomVerifier()
        let challenge = codeChallenge(for: verifier)

        var components = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")
        components?.queryItems = [
            URLQueryItem(name: "client_id", value: client.clientID),
            URLQueryItem(name: "redirect_uri", value: redirectURI),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: scope),
            URLQueryItem(name: "code_challenge", value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            // Google only returns a refresh token with both of these present.
            URLQueryItem(name: "access_type", value: "offline"),
            URLQueryItem(name: "prompt", value: "consent"),
        ]
        guard let authURL = components?.url else { throw YouTubeError.invalidClient }

        let code = try await presentConsent(url: authURL, scheme: scheme)
        return try await exchange(code: code, verifier: verifier, client: client, redirectURI: redirectURI)
    }

    @MainActor
    private static func presentConsent(url: URL, scheme: String) async throws -> String {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<String, Error>) in
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: scheme) { callbackURL, error in
                if let error {
                    if let authError = error as? ASWebAuthenticationSessionError,
                       authError.code == .canceledLogin {
                        continuation.resume(throwing: YouTubeError.cancelled)
                    } else {
                        continuation.resume(throwing: error)
                    }
                    return
                }
                guard let callbackURL,
                      let items = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?.queryItems else {
                    continuation.resume(throwing: YouTubeError.noCode)
                    return
                }
                if let denied = items.first(where: { $0.name == "error" })?.value {
                    continuation.resume(throwing: YouTubeError.denied(denied))
                    return
                }
                guard let code = items.first(where: { $0.name == "code" })?.value else {
                    continuation.resume(throwing: YouTubeError.noCode)
                    return
                }
                continuation.resume(returning: code)
            }
            session.presentationContextProvider = WebAuthPresentationContext.shared
            session.prefersEphemeralWebBrowserSession = false
            session.start()
        }
    }

    private static func exchange(
        code: String,
        verifier: String,
        client: YouTubeClient,
        redirectURI: String
    ) async throws -> YouTubeTokens {
        var fields: [String: String] = [
            "code": code,
            "client_id": client.clientID,
            "redirect_uri": redirectURI,
            "grant_type": "authorization_code",
            "code_verifier": verifier,
        ]
        // Desktop-app clients require the secret even with PKCE.
        if let secret = KeychainHelper.get(clientSecretKey), !secret.isEmpty {
            fields["client_secret"] = secret
        }
        return try await postToken(fields)
    }

    /// Trades the stored refresh token for a fresh access token.
    static func refresh(client: YouTubeClient) async throws -> YouTubeTokens {
        guard let refreshToken = KeychainHelper.get(refreshTokenKey), !refreshToken.isEmpty else {
            throw YouTubeError.notConnected
        }
        var fields: [String: String] = [
            "client_id": client.clientID,
            "refresh_token": refreshToken,
            "grant_type": "refresh_token",
        ]
        if let secret = KeychainHelper.get(clientSecretKey), !secret.isEmpty {
            fields["client_secret"] = secret
        }
        var tokens = try await postToken(fields)
        // A refresh response omits the refresh token; keep the one we hold.
        if tokens.refreshToken == nil { tokens.refreshToken = refreshToken }
        return tokens
    }

    private static func postToken(_ fields: [String: String]) async throws -> YouTubeTokens {
        guard let url = URL(string: "https://oauth2.googleapis.com/token") else {
            throw YouTubeError.invalidClient
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.httpBody = formEncode(fields).data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? -1
        guard status == 200 else {
            throw YouTubeError.google(decodeMessage(data, status: status))
        }
        let payload = try JSONDecoder().decode(TokenPayload.self, from: data)
        return YouTubeTokens(
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            expiresAt: Date().addingTimeInterval(TimeInterval(payload.expires_in ?? 3_500))
        )
    }

    // MARK: - Channel

    /// Reads the signed-in channel. Proves the token and scope actually work.
    static func channel(accessToken: String) async throws -> YouTubeChannel {
        var components = URLComponents(string: "https://www.googleapis.com/youtube/v3/channels")
        components?.queryItems = [
            URLQueryItem(name: "part", value: "snippet,statistics"),
            URLQueryItem(name: "mine", value: "true"),
        ]
        guard let url = components?.url else { throw YouTubeError.invalidClient }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? -1
        guard status == 200 else {
            throw YouTubeError.google(decodeMessage(data, status: status))
        }

        let payload = try JSONDecoder().decode(ChannelListPayload.self, from: data)
        guard let item = payload.items?.first else { throw YouTubeError.noChannel }
        return YouTubeChannel(
            id: item.id,
            title: item.snippet.title,
            thumbnailURL: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url,
            subscriberLabel: item.statistics?.subscriberCount,
            videoCount: item.statistics?.videoCount
        )
    }

    // MARK: - Helpers

    nonisolated private static func randomVerifier() -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return base64URL(Data(bytes))
    }

    nonisolated private static func codeChallenge(for verifier: String) -> String {
        base64URL(Data(SHA256.hash(data: Data(verifier.utf8))))
    }

    nonisolated private static func base64URL(_ data: Data) -> String {
        data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    nonisolated static func formEncode(_ fields: [String: String]) -> String {
        var allowed = CharacterSet.alphanumerics
        allowed.insert(charactersIn: "-._~")
        return fields
            .sorted { $0.key < $1.key }
            .map { key, value in
                let encoded = value.addingPercentEncoding(withAllowedCharacters: allowed) ?? value
                return "\(key)=\(encoded)"
            }
            .joined(separator: "&")
    }

    /// Google returns structured errors; surface the message, not the status code.
    nonisolated static func decodeMessage(_ data: Data, status: Int) -> String {
        if let payload = try? JSONDecoder().decode(GoogleErrorPayload.self, from: data) {
            if let message = payload.error_description { return message }
            if let message = payload.error?.message { return message }
            if let simple = payload.errorString { return simple }
        }
        return "YouTube request failed (\(status))"
    }
}

/// Access + refresh pair returned by Google.
nonisolated struct YouTubeTokens: Sendable, Equatable {
    let accessToken: String
    var refreshToken: String?
    let expiresAt: Date

    nonisolated var isExpired: Bool { Date() >= expiresAt.addingTimeInterval(-60) }
}

nonisolated enum YouTubeError: LocalizedError, Equatable {
    case invalidClient
    case notConnected
    case cancelled
    case noCode
    case noChannel
    case denied(String)
    case google(String)

    nonisolated var errorDescription: String? {
        switch self {
        case .invalidClient:
            return "That doesn't look like a Google OAuth client id. It ends in .apps.googleusercontent.com"
        case .notConnected:
            return "Connect a YouTube account first."
        case .cancelled:
            return "Sign-in cancelled."
        case .noCode:
            return "Google didn't return an authorization code."
        case .noChannel:
            return "This Google account has no YouTube channel. Create one, then reconnect."
        case .denied(let reason):
            return "Google denied the request: \(reason)"
        case .google(let message):
            return message
        }
    }
}

// MARK: - Wire types

nonisolated private struct TokenPayload: Decodable, Sendable {
    let access_token: String
    let refresh_token: String?
    let expires_in: Int?
}

nonisolated private struct ChannelListPayload: Decodable, Sendable {
    struct Item: Decodable, Sendable {
        struct Snippet: Decodable, Sendable {
            struct Thumbnails: Decodable, Sendable {
                struct Image: Decodable, Sendable { let url: String }
                let `default`: Image?
                let medium: Image?
            }
            let title: String
            let thumbnails: Thumbnails?
        }
        struct Statistics: Decodable, Sendable {
            let subscriberCount: String?
            let videoCount: String?
        }
        let id: String
        let snippet: Snippet
        let statistics: Statistics?
    }
    let items: [Item]?
}

nonisolated private struct GoogleErrorPayload: Decodable, Sendable {
    struct Detail: Decodable, Sendable { let message: String? }
    let error: Detail?
    let error_description: String?
    let errorString: String?

    private enum CodingKeys: String, CodingKey {
        case error
        case error_description
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        error_description = try? container.decodeIfPresent(String.self, forKey: .error_description)
        // `error` is an object on API calls and a bare string on token calls.
        if let detail = try? container.decodeIfPresent(Detail.self, forKey: .error) {
            error = detail
            errorString = nil
        } else if let simple = try? container.decodeIfPresent(String.self, forKey: .error) {
            error = nil
            errorString = simple
        } else {
            error = nil
            errorString = nil
        }
    }
}
