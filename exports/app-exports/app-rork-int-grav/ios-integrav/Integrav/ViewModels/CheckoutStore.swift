import Foundation
import Observation

/// Owns placed orders and the pricing maths behind the checkout page.
///
/// Nothing here charges money — no processor, no card storage. An order is a
/// signed-off record of which licence the account chose and what it would cost.
@Observable
final class CheckoutStore {
    /// Estimated sales tax applied to the recurring subtotal.
    static let taxRate: Double = 0.0875

    private(set) var orders: [Order] = []

    init() {
        orders = LocalStore.shared.load([Order].self, key: StoreKey.orders) ?? []
    }

    /// The licence currently in force, if one was ever checked out.
    var activeOrder: Order? { orders.first }

    var lifetimeValue: Int { orders.reduce(0) { $0 + $1.monthlyTotal * $1.termMonths } }

    // MARK: - Pricing

    /// Builds the priced summary for a tier without placing anything.
    static func lines(tier: PlanTier, seats: Int, hosting: WhiteLabelHosting?) -> [OrderLine] {
        var lines: [OrderLine] = [
            OrderLine(
                label: "\(tier.title) licence",
                detail: "\(tier.callsLabel) dispatches · chain ≤ \(tier.maxChainSteps)",
                amount: tier.monthlyPrice
            )
        ]
        if seats > 0 {
            lines.append(
                OrderLine(
                    label: "Additional seats",
                    detail: "\(seats) × $\(tier.seatPrice)/mo",
                    amount: seats * tier.seatPrice
                )
            )
        }
        if let hosting {
            lines.append(
                OrderLine(
                    label: hosting.title,
                    detail: hosting.note,
                    amount: hosting.monthlyPrice
                )
            )
        }
        return lines
    }

    static func subtotal(tier: PlanTier, seats: Int, hosting: WhiteLabelHosting?) -> Int {
        lines(tier: tier, seats: seats, hosting: hosting).reduce(0) { $0 + $1.amount }
    }

    /// Whole-dollar discount for a promo, rounded down so it never over-credits.
    static func discount(subtotal: Int, promo: PromoCode?) -> Int {
        guard let promo else { return 0 }
        return subtotal * promo.percentOff / 100
    }

    static func tax(on amount: Int) -> Int {
        Int((Double(max(0, amount)) * taxRate).rounded())
    }

    /// Full pricing breakdown for the summary panel.
    static func quote(
        tier: PlanTier,
        seats: Int,
        hosting: WhiteLabelHosting?,
        promo: PromoCode?
    ) -> CheckoutQuote {
        let sub = subtotal(tier: tier, seats: seats, hosting: hosting)
        let off = discount(subtotal: sub, promo: promo)
        let discounted = max(0, sub - off)
        let taxAmount = tax(on: discounted)
        let monthly = discounted + taxAmount
        return CheckoutQuote(
            lines: lines(tier: tier, seats: seats, hosting: hosting),
            subtotal: sub,
            discount: off,
            tax: taxAmount,
            monthlyTotal: monthly,
            termMonths: tier.termMonths,
            dueToday: monthly * tier.termMonths
        )
    }

    // MARK: - Placing

    @discardableResult
    func placeOrder(
        tier: PlanTier,
        seats: Int,
        hosting: WhiteLabelHosting?,
        promo: PromoCode?,
        contact: BillingContact,
        card: CardDraft,
        placedByEmail: String,
        isAdmin: Bool
    ) -> Order {
        let quote = CheckoutStore.quote(tier: tier, seats: seats, hosting: hosting, promo: promo)
        let order = Order(
            id: UUID(),
            reference: Order.makeReference(),
            tier: tier,
            seats: seats,
            hosting: hosting,
            lines: quote.lines,
            subtotal: quote.subtotal,
            discount: quote.discount,
            taxCents: quote.tax,
            monthlyTotal: quote.monthlyTotal,
            termMonths: quote.termMonths,
            dueToday: quote.dueToday,
            promoCode: promo?.code,
            contact: contact,
            cardBrand: card.brand,
            // Only the last four digits survive. The PAN is never persisted.
            cardLast4: card.last4,
            placedAt: .now,
            placedByEmail: placedByEmail,
            wasCompedByAdmin: isAdmin && (promo?.percentOff ?? 0) >= 100
        )
        orders.insert(order, at: 0)
        if orders.count > 40 { orders.removeLast(orders.count - 40) }
        persist()
        return order
    }

    func removeOrder(_ order: Order) {
        orders.removeAll { $0.id == order.id }
        persist()
    }

    func clearAll() {
        orders = []
        persist()
    }

    private func persist() { LocalStore.shared.save(orders, key: StoreKey.orders) }
}

/// A fully priced checkout, ready to render.
nonisolated struct CheckoutQuote: Equatable, Sendable {
    let lines: [OrderLine]
    let subtotal: Int
    let discount: Int
    let tax: Int
    let monthlyTotal: Int
    let termMonths: Int
    let dueToday: Int

    nonisolated var isFree: Bool { dueToday == 0 }
}
