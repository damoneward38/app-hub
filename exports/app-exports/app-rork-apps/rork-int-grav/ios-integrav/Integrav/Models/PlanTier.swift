import Foundation

/// Commercial tiers. Intégrav still runs entirely on device — the tier is a
/// local licence model: it throttles chain length and monthly volume, and it
/// prices seats and white-label branding. No payment is ever taken in-app.
nonisolated enum PlanTier: String, CaseIterable, Codable, Identifiable, Sendable {
    case free
    case starter
    case professional
    case enterprise
    case whiteLabel

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .free: return "Free"
        case .starter: return "Starter"
        case .professional: return "Professional"
        case .enterprise: return "Enterprise"
        case .whiteLabel: return "White-Label"
        }
    }

    nonisolated var short: String {
        switch self {
        case .free: return "FREE"
        case .starter: return "START"
        case .professional: return "PRO"
        case .enterprise: return "ENT"
        case .whiteLabel: return "WL"
        }
    }

    /// List price per month, in whole US dollars.
    nonisolated var monthlyPrice: Int {
        switch self {
        case .free: return 0
        case .starter: return 25
        case .professional: return 95
        case .enterprise: return 350
        case .whiteLabel: return 650
        }
    }

    /// Price per additional user, per month.
    nonisolated var seatPrice: Int {
        switch self {
        case .free: return 0
        case .starter: return 3
        case .professional: return 5
        case .enterprise: return 8
        case .whiteLabel: return 10
        }
    }

    /// Minimum commitment in months.
    nonisolated var termMonths: Int { self == .whiteLabel ? 3 : 1 }

    /// Maximum function calls in one chain.
    nonisolated var maxChainSteps: Int {
        switch self {
        case .free: return 2
        case .starter: return 10
        case .professional: return 50
        case .enterprise, .whiteLabel: return 200
        }
    }

    /// Dispatches per month. `nil` is unlimited.
    nonisolated var monthlyCalls: Int? {
        switch self {
        case .free: return 1_000
        case .starter: return 10_000
        case .professional: return 1_000_000
        case .enterprise, .whiteLabel: return nil
        }
    }

    /// Individual function executions per month. `nil` is unlimited.
    nonisolated var monthlyExecutions: Int? {
        switch self {
        case .free: return 500
        case .starter: return 5_000
        case .professional: return 500_000
        case .enterprise, .whiteLabel: return nil
        }
    }

    /// Chains that may be in flight at the same time.
    nonisolated var concurrentChains: Int {
        switch self {
        case .free: return 1
        case .starter: return 3
        case .professional: return 10
        case .enterprise, .whiteLabel: return 50
        }
    }

    nonisolated var uptime: String {
        switch self {
        case .free: return "99.7%"
        case .starter: return "99.9%"
        case .professional: return "99.99%"
        case .enterprise, .whiteLabel: return "99.995%"
        }
    }

    /// Concurrent task slots the engine advertises for this tier.
    nonisolated var concurrentSlots: Int {
        switch self {
        case .free: return 1_000
        case .starter: return 10_000
        case .professional: return 50_000
        case .enterprise, .whiteLabel: return 100_000
        }
    }

    nonisolated var tagline: String {
        switch self {
        case .free: return "Hobbyists and internal pilots"
        case .starter: return "SMBs building their first automations"
        case .professional: return "Data-centric teams and platform builders"
        case .enterprise: return "Large orgs and infra-critical pipelines"
        case .whiteLabel: return "Resellers shipping this as their own product"
        }
    }

    nonisolated var isWhiteLabel: Bool { self == .whiteLabel }

    /// Human caps line used in compact places.
    nonisolated var blurb: String {
        "\(maxChainSteps) calls per chain · \(concurrentSlots.formatted(.number)) task slots"
    }

    nonisolated var callsLabel: String { PlanTier.volume(monthlyCalls) }
    nonisolated var executionsLabel: String { PlanTier.volume(monthlyExecutions) }

    nonisolated static func volume(_ value: Int?) -> String {
        guard let value else { return "Unlimited" }
        if value >= 1_000_000 { return "\(value / 1_000_000)M" }
        if value >= 1_000 { return "\(value / 1_000)K" }
        return "\(value)"
    }

    /// Bullet list shown on the tier card.
    nonisolated var caps: [String] {
        [
            "\(callsLabel) dispatches / mo",
            "\(executionsLabel) function executions / mo",
            "Chain length ≤ \(maxChainSteps)",
            "\(concurrentChains) concurrent chain\(concurrentChains == 1 ? "" : "s")",
            "\(uptime) uptime target",
        ]
    }
}

/// How a white-label deployment is hosted. Priced as an add-on to the bundle.
nonisolated enum WhiteLabelHosting: String, CaseIterable, Codable, Identifiable, Sendable {
    case managed
    case selfHosted

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .managed: return "Managed SaaS"
        case .selfHosted: return "Self-hosted"
        }
    }

    nonisolated var monthlyPrice: Int {
        switch self {
        case .managed: return 150
        case .selfHosted: return 10
        }
    }

    nonisolated var note: String {
        switch self {
        case .managed: return "We run it, 24/7 support included"
        case .selfHosted: return "Your infra, optional IoT gateway"
        }
    }
}

/// A fully priced monthly licence: base plan + seats + white-label hosting.
nonisolated struct PlanQuote: Equatable, Sendable {
    let tier: PlanTier
    let seats: Int
    let hosting: WhiteLabelHosting?

    nonisolated var base: Int { tier.monthlyPrice }
    nonisolated var seatCost: Int { seats * tier.seatPrice }
    nonisolated var hostingCost: Int { hosting?.monthlyPrice ?? 0 }
    nonisolated var total: Int { base + seatCost + hostingCost }
    nonisolated var termTotal: Int { total * tier.termMonths }

    nonisolated var totalLabel: String { "$\(total.formatted(.number.grouping(.automatic)))" }
}
