import Foundation

/// Talks to `scripts/bridge.py` running on the user's own computer.
///
/// Every call except `hello` and `pair` carries the bearer token issued during
/// pairing. Timeouts are short because this is a local network — if the machine
/// is asleep or the bridge isn't running, the user should hear about it quickly
/// rather than watch a spinner for a minute.
nonisolated enum BridgeService {
    nonisolated static let tokenKey = "bridge_token"

    private nonisolated static let timeout: TimeInterval = 8

    private nonisolated static var session: URLSession {
        let config = URLSessionConfiguration.ephemeral
        config.timeoutIntervalForRequest = timeout
        config.timeoutIntervalForResource = timeout
        config.waitsForConnectivity = false
        config.allowsCellularAccess = true
        return URLSession(configuration: config)
    }

    // MARK: - Handshake

    /// Confirms an address is a houly-pipe bridge before asking for a code.
    nonisolated static func hello(at origin: URL) async throws -> BridgeHello {
        let data = try await send(request(origin, "/v1/hello"))
        let hello = try decode(BridgeHello.self, from: data)
        guard hello.isBridge else { throw BridgeError.notABridge }
        return hello
    }

    /// Exchanges the six-digit code shown in the computer's terminal for a token.
    nonisolated static func pair(
        at origin: URL,
        code: String,
        deviceName: String
    ) async throws -> BridgePairResponse {
        var req = request(origin, "/v1/pair", method: "POST")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "code": RemoteAddress.normalizeCode(code),
            "device": deviceName,
            "platform": "ios",
        ])
        let data = try await send(req)
        return try decode(BridgePairResponse.self, from: data)
    }

    // MARK: - Authenticated

    nonisolated static func status(at origin: URL, token: String) async throws -> BridgeStatus {
        let data = try await send(request(origin, "/v1/status", token: token))
        return try decode(BridgeStatus.self, from: data)
    }

    nonisolated static func manifest(at origin: URL, token: String) async throws -> RenderManifest {
        let data = try await send(request(origin, "/v1/manifest", token: token))
        return try decode(RenderManifest.self, from: data)
    }

    nonisolated static func thumbnail(at origin: URL, token: String) async throws -> Data {
        try await send(request(origin, "/v1/thumbnail", token: token))
    }

    /// Sends a render to the computer. The config is the same YAML the pipeline
    /// panel generates, so what runs there is exactly what was configured here.
    nonisolated static func submit(
        at origin: URL,
        token: String,
        title: String,
        configYAML: String,
        stages: String?,
        limitSeconds: Double?
    ) async throws -> BridgeJob {
        var req = request(origin, "/v1/jobs", method: "POST", token: token)
        var payload: [String: Any] = ["title": title, "config": configYAML]
        if let stages { payload["stages"] = stages }
        if let limitSeconds { payload["limit"] = limitSeconds }
        req.httpBody = try JSONSerialization.data(withJSONObject: payload)
        let data = try await send(req)
        return try decode(BridgeJob.self, from: data)
    }

    nonisolated static func cancel(at origin: URL, token: String, jobID: String) async throws {
        _ = try await send(request(origin, "/v1/jobs/\(jobID)/cancel", method: "POST", token: token))
    }

    /// Asks the computer to key ONE frame with the given settings and returns
    /// the composited PNG. The first call on a render host also pays the OpenCV
    /// import, so this gets a longer leash than the polling calls.
    nonisolated static func previewKey(
        at origin: URL,
        token: String,
        request: KeyPreviewRequest
    ) async throws -> Data {
        var req = self.request(origin, "/v1/preview-key", method: "POST", token: token)
        req.httpBody = try JSONEncoder().encode(request)
        req.timeoutInterval = 30
        return try await send(req)
    }

    nonisolated static func devices(at origin: URL, token: String) async throws -> BridgeDeviceList {
        let data = try await send(request(origin, "/v1/devices", token: token))
        return try decode(BridgeDeviceList.self, from: data)
    }

    /// Removes this phone's own access from the computer.
    nonisolated static func revoke(at origin: URL, token: String, deviceID: String) async throws {
        _ = try await send(request(origin, "/v1/devices/\(deviceID)", method: "DELETE", token: token))
    }

    // MARK: - Plumbing

    nonisolated private static func request(
        _ origin: URL,
        _ path: String,
        method: String = "GET",
        token: String? = nil
    ) -> URLRequest {
        var req = URLRequest(url: origin.appendingPathComponent(path))
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("no-store", forHTTPHeaderField: "Cache-Control")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        return req
    }

    nonisolated private static func send(_ request: URLRequest) async throws -> Data {
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let error as URLError {
            throw BridgeError.transport(error)
        }

        let status = (response as? HTTPURLResponse)?.statusCode ?? -1
        switch status {
        case 200...299:
            return data
        case 401, 403:
            throw BridgeError.server(status, message(from: data) ?? "The computer refused this phone.")
        default:
            throw BridgeError.server(status, message(from: data) ?? "The computer returned an error (\(status)).")
        }
    }

    nonisolated private static func decode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
        do {
            return try JSONDecoder().decode(type, from: data)
        } catch {
            throw BridgeError.badResponse
        }
    }

    /// The bridge always reports failures as `{"error": "..."}`.
    nonisolated static func message(from data: Data) -> String? {
        guard
            let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let error = object["error"] as? String,
            !error.isEmpty
        else { return nil }
        return error
    }
}

/// Failures phrased for someone standing between a phone and a computer.
nonisolated enum BridgeError: LocalizedError {
    case badAddress
    case notABridge
    case badResponse
    case notLinked
    case transport(URLError)
    case server(Int, String)

    nonisolated var errorDescription: String? {
        switch self {
        case .badAddress:
            return "That doesn't look like an address. Use the one the bridge printed, like 192.168.1.42:8787"
        case .notABridge:
            return "Something answered there, but it isn't houly-pipe. Check the port."
        case .badResponse:
            return "The computer replied in a format this app doesn't understand. It may be running an older bridge."
        case .notLinked:
            return "No computer is linked yet."
        case .server(_, let message):
            return message
        case .transport(let error):
            switch error.code {
            case .cannotConnectToHost, .cannotFindHost:
                return "No answer at that address. Is the bridge running on the computer, and is the phone on the same Wi-Fi?"
            case .timedOut:
                return "The computer didn't respond in time. Check it's awake and on the same network."
            case .networkConnectionLost, .notConnectedToInternet:
                return "The connection dropped. Check the phone's Wi-Fi."
            case .appTransportSecurityRequiresSecureConnection:
                return "iOS blocked the connection. Use the local network address, not a public one."
            default:
                return "Couldn't reach the computer: \(error.localizedDescription)"
            }
        }
    }

    /// True when retrying later might work — used to keep polling instead of
    /// tearing the link down over one dropped packet.
    nonisolated var isTransient: Bool {
        switch self {
        case .transport: return true
        case .server(let code, _): return code >= 500
        default: return false
        }
    }

    /// The computer no longer trusts this phone, so the stored token is dead.
    nonisolated var isUnauthorized: Bool {
        if case .server(let code, _) = self { return code == 401 || code == 403 }
        return false
    }
}
