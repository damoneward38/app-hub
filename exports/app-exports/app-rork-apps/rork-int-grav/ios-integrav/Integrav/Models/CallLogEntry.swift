import Foundation

/// Where a function call came from — the registry equivalent of a request source.
nonisolated enum CallSource: String, Codable, CaseIterable, Identifiable, Sendable {
    case registry
    case hotkey
    case chat
    case chain

    nonisolated var id: String { rawValue }

    /// Chip styling: short and shouty.
    nonisolated var label: String {
        switch self {
        case .registry: return "REGISTRY"
        case .hotkey: return "HOTKEY"
        case .chat: return "CHAT"
        case .chain: return "CHAIN"
        }
    }

    /// Sentence case, for menus and anywhere the shouting would be wrong.
    nonisolated var title: String {
        switch self {
        case .registry: return "Registry"
        case .hotkey: return "Hotkey"
        case .chat: return "Chat"
        case .chain: return "Chain"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .registry: return "function"
        case .hotkey: return "number"
        case .chat: return "bubble.left.and.bubble.right.fill"
        case .chain: return "link"
        }
    }
}

/// One executed function call, kept on device. This is Intégrav's audit trail:
/// what was called, with what arguments, what came back, and when.
nonisolated struct CallLogEntry: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    let function: String
    let arguments: [String: String]
    let result: String
    let source: CallSource
    let chain: String?
    let calledAt: Date
    let durationMs: Int

    nonisolated init(
        id: UUID = UUID(),
        function: String,
        arguments: [String: String],
        result: String,
        source: CallSource,
        chain: String? = nil,
        calledAt: Date = .now,
        durationMs: Int
    ) {
        self.id = id
        self.function = function
        self.arguments = arguments
        self.result = result
        self.source = source
        self.chain = chain
        self.calledAt = calledAt
        self.durationMs = durationMs
    }

    nonisolated var signature: String { "\(function)()" }

    /// `{"hotkey": "042", "category": "humor"}` — arguments rendered like the log line they are.
    nonisolated var argumentsJSON: String {
        guard !arguments.isEmpty else { return "{}" }
        let body = arguments
            .sorted { $0.key < $1.key }
            .map { "\"\($0.key)\": \"\($0.value)\"" }
            .joined(separator: ", ")
        return "{ \(body) }"
    }

    nonisolated var timeLabel: String {
        calledAt.formatted(date: .omitted, time: .standard)
    }
}
