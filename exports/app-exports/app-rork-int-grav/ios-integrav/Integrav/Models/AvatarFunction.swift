import Foundation

/// A single avatar behaviour the twin can perform. Every function is local —
/// it runs on device against the trained twin, no network call.
nonisolated struct AvatarFunction: Identifiable, Hashable, Sendable {
    let index: Int
    let name: String
    let category: FunctionCategory

    nonisolated var id: String { name }

    /// `tell_joke()` — how the function is called from chat or a chain.
    nonisolated var signature: String { "\(name)()" }

    /// Three-digit hotkey shown in the registry, e.g. `042`.
    nonisolated var hotkey: String { String(format: "%03d", index) }

    nonisolated var isLatin: Bool { name.allSatisfy(\.isASCII) }

    /// Human-readable label: `laugh_chuckle` → "Laugh chuckle".
    nonisolated var title: String {
        guard isLatin else { return name }
        let spaced = name.replacingOccurrences(of: "_", with: " ")
        return spaced.prefix(1).uppercased() + spaced.dropFirst()
    }

    /// What the twin actually says or does when this function fires.
    nonisolated var performance: String {
        if let scripted = FunctionCatalog.scripted[name] { return scripted }
        switch category {
        case .humor:
            return "*\(title.lowercased())* — landed. The timing is yours, I only borrowed it."
        case .presence:
            return "*\(title.lowercased())*"
        case .voice:
            return "*\(title.lowercased()) — your timbre, rebuilt from your own footage*"
        case .expression:
            return "*\(title.lowercased())*"
        case .motion:
            return "*\(title.lowercased()), magenta trail*"
        case .cognition:
            return "\(title) → resolved on-device, no call left this phone."
        case .modes:
            return "Mode set: \(title.lowercased()). Everything after this comes out that way."
        case .delivery:
            return "\(title) — go."
        case .body, .concept:
            return "*\(name)*"
        }
    }
}

/// One row of the popularity leaderboard.
nonisolated struct FunctionUsage: Identifiable, Hashable, Sendable {
    let function: AvatarFunction
    let count: Int

    nonisolated var id: String { function.name }
}

/// Total runs for one family, for the usage breakdown bars.
nonisolated struct CategoryUsage: Identifiable, Hashable, Sendable {
    let category: FunctionCategory
    let count: Int

    nonisolated var id: String { category.rawValue }
}

/// Groups the 300 behaviours into browsable families.
nonisolated enum FunctionCategory: String, CaseIterable, Identifiable, Sendable {
    case humor
    case presence
    case voice
    case expression
    case motion
    case cognition
    case modes
    case delivery
    case body
    case concept

    nonisolated var id: String { rawValue }

    nonisolated var chip: String {
        switch self {
        case .humor: return "Humor"
        case .presence: return "Presence"
        case .voice: return "Voice"
        case .expression: return "Face"
        case .motion: return "Motion"
        case .cognition: return "Mind"
        case .modes: return "Modes"
        case .delivery: return "Delivery"
        case .body: return "身体"
        case .concept: return "意念"
        }
    }

    nonisolated var title: String {
        switch self {
        case .humor: return "Humor"
        case .presence: return "Presence & reaction"
        case .voice: return "Voice & sound"
        case .expression: return "Expression"
        case .motion: return "Motion"
        case .cognition: return "Cognition"
        case .modes: return "Modes"
        case .delivery: return "Delivery"
        case .body: return "身体 · Body"
        case .concept: return "意念 · Concepts"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .humor: return "theatermasks.fill"
        case .presence: return "hand.wave.fill"
        case .voice: return "waveform"
        case .expression: return "face.smiling.fill"
        case .motion: return "figure.walk.motion"
        case .cognition: return "brain.head.profile"
        case .modes: return "slider.horizontal.3"
        case .delivery: return "text.bubble.fill"
        case .body: return "hands.sparkles.fill"
        case .concept: return "character.book.closed.fill"
        }
    }
}
