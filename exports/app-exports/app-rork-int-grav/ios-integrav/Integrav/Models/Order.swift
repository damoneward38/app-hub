import Foundation

/// A single priced row on the checkout summary.
nonisolated struct OrderLine: Codable, Hashable, Identifiable, Sendable {
    let id: UUID
    let label: String
    let detail: String
    /// Whole US dollars per month. Negative for discounts.
    let amount: Int

    nonisolated init(id: UUID = UUID(), label: String, detail: String, amount: Int) {
        self.id = id
        self.label = label
        self.detail = detail
        self.amount = amount
    }
}

/// Promotional codes the checkout accepts.
nonisolated struct PromoCode: Hashable, Sendable {
    let code: String
    let label: String
    /// Percentage off the recurring subtotal, 0…100.
    let percentOff: Int
    /// Restricted to operator accounts.
    let adminOnly: Bool

    nonisolated static let all: [PromoCode] = [
        PromoCode(code: "LAUNCH20", label: "Launch offer", percentOff: 20, adminOnly: false),
        PromoCode(code: "ANNUAL15", label: "Annual prepay", percentOff: 15, adminOnly: false),
        PromoCode(code: "INTERNAL100", label: "Operator comp", percentOff: 100, adminOnly: true),
    ]

    /// Resolves a typed code. Returns nil when unknown or not permitted.
    nonisolated static func match(_ text: String, isAdmin: Bool) -> PromoCode? {
        let normalised = text.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        guard !normalised.isEmpty else { return nil }
        guard let found = all.first(where: { $0.code == normalised }) else { return nil }
        return found.adminOnly && !isAdmin ? nil : found
    }
}

/// Billing contact captured at checkout.
nonisolated struct BillingContact: Codable, Hashable, Sendable {
    var fullName: String = ""
    var email: String = ""
    var company: String = ""
    var addressLine: String = ""
    var city: String = ""
    var postcode: String = ""
    var country: String = "United States"

    nonisolated var isComplete: Bool {
        !fullName.trimmingCharacters(in: .whitespaces).isEmpty
            && BillingContact.isValidEmail(email)
            && !addressLine.trimmingCharacters(in: .whitespaces).isEmpty
            && !city.trimmingCharacters(in: .whitespaces).isEmpty
            && !postcode.trimmingCharacters(in: .whitespaces).isEmpty
    }

    nonisolated static func isValidEmail(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 6, !trimmed.hasPrefix("@"), !trimmed.hasSuffix("@") else { return false }
        let parts = trimmed.split(separator: "@")
        guard parts.count == 2 else { return false }
        let domain = parts[1]
        return domain.contains(".") && !domain.hasPrefix(".") && !domain.hasSuffix(".")
    }
}

/// Card brands the checkout recognises from the leading digits.
nonisolated enum CardBrand: String, Codable, Sendable {
    case visa
    case mastercard
    case amex
    case discover
    case unknown

    nonisolated var title: String {
        switch self {
        case .visa: return "Visa"
        case .mastercard: return "Mastercard"
        case .amex: return "American Express"
        case .discover: return "Discover"
        case .unknown: return "Card"
        }
    }

    nonisolated var symbol: String { self == .unknown ? "creditcard" : "creditcard.fill" }

    /// Digits in a complete number for this brand.
    nonisolated var digitCount: Int { self == .amex ? 15 : 16 }

    nonisolated var cvcLength: Int { self == .amex ? 4 : 3 }

    nonisolated static func detect(_ digits: String) -> CardBrand {
        guard let first = digits.first else { return .unknown }
        let two = String(digits.prefix(2))
        if first == "4" { return .visa }
        if ["34", "37"].contains(two) { return .amex }
        if let prefix = Int(two), (51...55).contains(prefix) { return .mastercard }
        if digits.hasPrefix("6011") || two == "65" { return .discover }
        return .unknown
    }
}

/// Card entry state. The full number is never persisted — only brand and last4
/// survive past the button press, because nothing here charges anything.
nonisolated struct CardDraft: Hashable, Sendable {
    var number: String = ""
    var expiry: String = ""
    var cvc: String = ""

    nonisolated var digits: String { number.filter(\.isNumber) }
    nonisolated var brand: CardBrand { CardBrand.detect(digits) }
    nonisolated var last4: String { String(digits.suffix(4)) }

    nonisolated var isNumberValid: Bool {
        let value = digits
        guard value.count == brand.digitCount else { return false }
        return CardDraft.passesLuhn(value)
    }

    nonisolated var isExpiryValid: Bool {
        let parts = expiry.split(separator: "/")
        guard parts.count == 2, let month = Int(parts[0]), let year = Int(parts[1]) else { return false }
        guard (1...12).contains(month) else { return false }
        let calendar = Calendar(identifier: .gregorian)
        let now = Date()
        let currentYear = calendar.component(.year, from: now) % 100
        let currentMonth = calendar.component(.month, from: now)
        if year < currentYear { return false }
        if year == currentYear && month < currentMonth { return false }
        return year <= currentYear + 20
    }

    nonisolated var isCVCValid: Bool { cvc.count == brand.cvcLength && cvc.allSatisfy(\.isNumber) }

    nonisolated var isComplete: Bool { isNumberValid && isExpiryValid && isCVCValid }

    /// Standard Luhn checksum — catches typos before anything is submitted.
    nonisolated static func passesLuhn(_ digits: String) -> Bool {
        guard digits.count >= 12, digits.allSatisfy(\.isNumber) else { return false }
        var sum = 0
        for (offset, character) in digits.reversed().enumerated() {
            guard let value = character.wholeNumberValue else { return false }
            if offset % 2 == 1 {
                let doubled = value * 2
                sum += doubled > 9 ? doubled - 9 : doubled
            } else {
                sum += value
            }
        }
        return sum % 10 == 0
    }

    /// Groups digits the way the brand prints them: 4-6-5 for Amex, 4s otherwise.
    nonisolated static func format(_ raw: String) -> String {
        let value = String(raw.filter(\.isNumber).prefix(16))
        let groups: [Int] = CardBrand.detect(value) == .amex ? [4, 6, 5] : [4, 4, 4, 4]
        var result = ""
        var index = value.startIndex
        for group in groups {
            guard index < value.endIndex else { break }
            let end = value.index(index, offsetBy: group, limitedBy: value.endIndex) ?? value.endIndex
            if !result.isEmpty { result += " " }
            result += value[index..<end]
            index = end
        }
        return result
    }

    nonisolated static func formatExpiry(_ raw: String) -> String {
        let value = String(raw.filter(\.isNumber).prefix(4))
        guard value.count > 2 else { return value }
        let month = value.prefix(2)
        let year = value.dropFirst(2)
        return "\(month)/\(year)"
    }
}

/// A completed checkout. Recorded locally so the licence has provenance —
/// no money moves, and no card data is stored.
nonisolated struct Order: Codable, Hashable, Identifiable, Sendable {
    let id: UUID
    let reference: String
    let tier: PlanTier
    let seats: Int
    let hosting: WhiteLabelHosting?
    let lines: [OrderLine]
    let subtotal: Int
    let discount: Int
    let taxCents: Int
    let monthlyTotal: Int
    let termMonths: Int
    let dueToday: Int
    let promoCode: String?
    let contact: BillingContact
    let cardBrand: CardBrand
    let cardLast4: String
    let placedAt: Date
    let placedByEmail: String
    let wasCompedByAdmin: Bool

    nonisolated var termTotalLabel: String { Order.money(monthlyTotal * termMonths) }
    nonisolated var dueTodayLabel: String { Order.money(dueToday) }

    nonisolated static func money(_ dollars: Int) -> String {
        "$\(dollars.formatted(.number.grouping(.automatic)))"
    }

    /// Human reference like `INT-8F3K-2Q1D`.
    nonisolated static func makeReference() -> String {
        let alphabet = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        func block() -> String { String((0..<4).map { _ in alphabet.randomElement() ?? "X" }) }
        return "INT-\(block())-\(block())"
    }
}
