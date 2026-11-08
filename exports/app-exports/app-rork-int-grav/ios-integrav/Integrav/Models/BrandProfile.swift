import Foundation

/// White-label identity. When enabled, the app answers to the reseller's name,
/// wears their accent colour, and namespaces every logged call under
/// `brand.{brand_id}.` so usage can be attributed per brand.
nonisolated struct BrandProfile: Codable, Equatable, Sendable {
    var isEnabled: Bool
    var name: String
    var domain: String
    var accentHex: UInt32
    var hosting: WhiteLabelHosting

    nonisolated static let houseName = "Intégrav"

    nonisolated static let `default` = BrandProfile(
        isEnabled: false,
        name: "Cooper Avatar Cloud",
        domain: "avatars.cooper.io",
        accentHex: 0x22D3EE,
        hosting: .managed
    )

    /// Slug used for resource namespacing, mirroring the server-side `brand_id`.
    nonisolated var brandID: String {
        let lowered = name.lowercased()
        let mapped = lowered.map { character -> Character in
            character.isLetter || character.isNumber ? character : "_"
        }
        let slug = String(mapped)
            .split(separator: "_", omittingEmptySubsequences: true)
            .joined(separator: "_")
        return slug.isEmpty ? "brand" : slug
    }

    /// Prefix prepended to every function name in the audit trail.
    nonisolated var namespace: String { "brand.\(brandID)." }

    nonisolated var displayName: String { isEnabled ? name : BrandProfile.houseName }
}

/// Accent colours offered to a white-label customer.
nonisolated struct BrandAccent: Identifiable, Equatable, Sendable {
    let name: String
    let hex: UInt32

    nonisolated var id: UInt32 { hex }

    nonisolated static let palette: [BrandAccent] = [
        BrandAccent(name: "Intégrav", hex: 0xE879F9),
        BrandAccent(name: "Signal", hex: 0x22D3EE),
        BrandAccent(name: "Lime", hex: 0xA3E635),
        BrandAccent(name: "Ember", hex: 0xF97316),
        BrandAccent(name: "Coral", hex: 0xFB7185),
        BrandAccent(name: "Iris", hex: 0x818CF8),
    ]
}

/// What the White-Label bundle ships with, straight from the licence sheet.
nonisolated struct BundleItem: Identifiable, Sendable {
    let symbol: String
    let title: String
    let detail: String

    nonisolated var id: String { title }

    nonisolated static let all: [BundleItem] = [
        BundleItem(symbol: "paintbrush.pointed.fill", title: "Re-brand UI", detail: "Name, accent, custom domain"),
        BundleItem(symbol: "switch.2", title: "Feature flags", detail: "Turn any of the 300 behaviours on or off"),
        BundleItem(symbol: "key.fill", title: "Dedicated key", detail: "Per-brand usage metering"),
        BundleItem(symbol: "doc.text.fill", title: "Brand terms", detail: "Own contract, NDA, retention policy"),
        BundleItem(symbol: "person.2.fill", title: "100-hour kickoff", detail: "Technical account manager, 2 weeks"),
        BundleItem(symbol: "puzzlepiece.extension.fill", title: "Plugin SDK", detail: "Write your own adapters"),
        BundleItem(symbol: "square.and.arrow.up.fill", title: "Audit export", detail: "Full call log as JSON"),
        BundleItem(symbol: "bolt.shield.fill", title: "Priority support", detail: "2-hour response, shared channel"),
    ]
}
