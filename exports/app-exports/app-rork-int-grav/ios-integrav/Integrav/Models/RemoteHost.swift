import Foundation

/// A computer this phone has been paired with.
///
/// The bearer token is **not** in here — it lives in the Keychain. This record
/// is only what is safe to show on screen and keep in defaults.
nonisolated struct RemoteHost: Codable, Hashable, Sendable {
    /// Normalised origin, e.g. `http://192.168.1.42:8787`.
    let address: String
    /// The computer's own name, as it reported it during pairing.
    let hostName: String
    let deviceID: String
    let pairedAt: Date

    nonisolated var url: URL? { URL(string: address) }

    /// `192.168.1.42:8787` — the address without the scheme noise.
    nonisolated var shortAddress: String {
        guard let url = URL(string: address) else { return address }
        return RemoteAddress.shortForm(url)
    }
}

/// The last bridge address that actually answered.
///
/// This is the address bar's memory, not a link: no token, no trust, nothing
/// the computer would honour. It exists so the address is typed once rather
/// than every session, and it outlives an unlink on purpose — forgetting the
/// pairing should not mean hunting for the IP again.
nonisolated struct RememberedBridge: Codable, Hashable, Sendable {
    /// Short form, exactly as it goes back into the field.
    let address: String
    /// What the computer called itself, when it answered far enough to say.
    let hostName: String?
    let seenAt: Date

    nonisolated var label: String {
        guard let hostName, !hostName.isEmpty else { return address }
        return hostName
    }
}

/// Turns whatever the user typed into an address the app can actually call.
nonisolated enum RemoteAddress {
    /// The port `scripts/bridge.py` listens on unless told otherwise.
    nonisolated static let defaultPort = 8787

    /// Normalises free text into a bridge origin URL.
    ///
    /// People type `192.168.1.42`, `192.168.1.42:8787`, `studio.local`, or paste
    /// a whole `http://…/v1/hello`. All of those should land on the same origin.
    /// Anything without a usable host returns nil rather than a broken URL.
    nonisolated static func normalize(_ raw: String) -> URL? {
        var text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return nil }
        // A space inside means it isn't an address, it's a sentence.
        guard !text.contains(" ") else { return nil }

        let lower = text.lowercased()
        if lower.hasPrefix("http://") || lower.hasPrefix("https://") {
            // keep the scheme the user gave
        } else if text.contains("://") {
            return nil // some other protocol — not ours
        } else {
            text = "http://" + text
        }

        guard var components = URLComponents(string: text) else { return nil }
        guard let host = components.host, !host.isEmpty, host != "." else { return nil }

        // Only the origin matters; drop any path, query or fragment that came
        // along from a pasted URL.
        components.path = ""
        components.query = nil
        components.fragment = nil
        components.user = nil
        components.password = nil
        if components.port == nil { components.port = defaultPort }

        guard let url = components.url, url.host != nil else { return nil }
        return url
    }

    /// The way an address is written back into the field: host and port, with
    /// the scheme dropped unless it is `https`, since http is the default and
    /// re-typing it is noise — but an https tunnel would break without it.
    nonisolated static func shortForm(_ url: URL) -> String {
        guard
            let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
            let host = components.host, !host.isEmpty
        else {
            return url.absoluteString
        }
        let scheme = components.scheme == "https" ? "https://" : ""
        guard let port = components.port else { return scheme + host }
        return "\(scheme)\(host):\(port)"
    }

    /// Six digits, however the user spaced or dashed them.
    nonisolated static func normalizeCode(_ raw: String) -> String {
        String(raw.filter(\.isNumber).prefix(6))
    }

    nonisolated static func isValidCode(_ raw: String) -> Bool {
        normalizeCode(raw).count == 6
    }

    /// True for addresses that stay inside the home/office network.
    ///
    /// Used to warn before sending a pairing code across the open internet, and
    /// to explain the local-network permission prompt.
    nonisolated static func isPrivateAddress(_ url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        if host == "localhost" || host.hasSuffix(".local") { return true }

        let parts = host.split(separator: ".").compactMap { Int($0) }
        guard parts.count == 4, parts.allSatisfy({ (0...255).contains($0) }) else { return false }
        switch (parts[0], parts[1]) {
        case (127, _), (10, _):
            return true
        case (192, 168):
            return true
        case (172, let second) where (16...31).contains(second):
            return true
        default:
            return false
        }
    }
}

// MARK: - Wire types

/// Unauthenticated handshake — proves an address really is a houly-pipe bridge.
nonisolated struct BridgeHello: Decodable, Sendable {
    let service: String
    let version: String
    let host: String
    let pairingOpen: Bool
    let pairingSecondsLeft: Int
    let pairedDevices: Int
    let telegram: Bool

    nonisolated var isBridge: Bool { service == "houly-pipe" }
}

nonisolated struct BridgePairResponse: Decodable, Sendable {
    let token: String
    let deviceId: String
    let host: String
    let version: String
}

/// Lifecycle of a render the phone dispatched to the computer.
nonisolated enum BridgeJobState: String, Codable, Sendable {
    case queued
    case running
    case done
    case failed
    case cancelled
    case unknown

    nonisolated init(from decoder: Decoder) throws {
        let raw = try decoder.singleValueContainer().decode(String.self)
        self = BridgeJobState(rawValue: raw) ?? .unknown
    }

    nonisolated var isFinished: Bool {
        self == .done || self == .failed || self == .cancelled
    }

    nonisolated var label: String {
        switch self {
        case .queued: return "Queued"
        case .running: return "Rendering"
        case .done: return "Finished"
        case .failed: return "Failed"
        case .cancelled: return "Cancelled"
        case .unknown: return "Unknown"
        }
    }
}

nonisolated struct BridgeJob: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let title: String
    let state: BridgeJobState
    let createdAt: String
    let startedAt: String?
    let finishedAt: String?
    let error: String?
}

/// The pipeline's own `status.json`, relayed by the bridge.
nonisolated struct BridgePipelineStatus: Decodable, Hashable, Sendable {
    let state: String
    let stage: String?
    let progress: Double?
    let stageProgress: Double?
    let speed: String?
    let elapsedSeconds: Double?
    let label: String?
    let error: String?

    nonisolated var isRunning: Bool { state == "running" }

    nonisolated var clampedProgress: Double {
        min(max(progress ?? 0, 0), 1)
    }

    /// "Rendering" rather than "render" — the stage as a person would say it.
    nonisolated var stageLabel: String {
        switch stage {
        case "trim": return "Trimming clips"
        case "render": return "Rendering master"
        case "preview": return "Making preview"
        case "upload": return "Uploading"
        default: return label ?? "Working"
        }
    }
}

nonisolated struct BridgeStatus: Decodable, Sendable {
    let host: String
    let pipeline: BridgePipelineStatus
    let activeJob: BridgeJob?
    let queuedCount: Int
    let recentJobs: [BridgeJob]
    let hasManifest: Bool

    /// True when the computer is genuinely working, not just holding a stale file.
    nonisolated var isBusy: Bool { activeJob != nil && pipeline.isRunning }
}

nonisolated struct BridgeDeviceList: Decodable, Sendable {
    nonisolated struct Device: Decodable, Identifiable, Sendable {
        let id: String
        let name: String
        let platform: String
        let pairedAt: String
        let lastSeen: String
    }
    let devices: [Device]
    let you: String
}
