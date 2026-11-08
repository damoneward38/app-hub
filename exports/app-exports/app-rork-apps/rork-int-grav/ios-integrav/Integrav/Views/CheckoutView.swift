import SwiftUI

/// The full checkout: order summary, term, promo, billing contact, card entry,
/// and confirmation. No processor is contacted and no card is stored — placing
/// an order records the licence against the account.
struct CheckoutView: View {
    @Environment(RegistryStore.self) private var registry
    @Environment(CheckoutStore.self) private var checkout
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss

    let tier: PlanTier

    @State private var seats: Int = 0
    @State private var hosting: WhiteLabelHosting = .managed
    @State private var promoText: String = ""
    @State private var promo: PromoCode?
    @State private var promoError: String?
    @State private var contact = BillingContact()
    @State private var card = CardDraft()
    @State private var agreedToTerms: Bool = false
    @State private var placed: Order?
    @State private var isPlacing: Bool = false

    private var isAdmin: Bool { AdminRole.isAdmin(email: auth.user?.email) }

    private var effectiveHosting: WhiteLabelHosting? { tier.isWhiteLabel ? hosting : nil }

    private var quote: CheckoutQuote {
        CheckoutStore.quote(tier: tier, seats: seats, hosting: effectiveHosting, promo: promo)
    }

    /// A zero-dollar checkout needs no card — Free tier, or a 100% comp.
    private var requiresCard: Bool { quote.dueToday > 0 }

    private var canPlace: Bool {
        contact.isComplete && agreedToTerms && (!requiresCard || card.isComplete) && !isPlacing
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                if let placed {
                    ConfirmationPanel(order: placed) { dismiss() }
                } else {
                    ScrollView {
                        VStack(spacing: 18) {
                            if isAdmin { adminBanner }
                            summaryCard
                            if tier.seatPrice > 0 { seatsCard }
                            if tier.isWhiteLabel { hostingCard }
                            promoCard
                            totalsCard
                            contactCard
                            if requiresCard { cardCard } else { noCardCard }
                            termsCard
                            placeButton
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationTitle(placed == nil ? "Checkout" : "Order placed")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    if placed == nil {
                        Button("Cancel") { dismiss() }
                            .foregroundStyle(Theme.textSecondary)
                    }
                }
            }
            .onAppear {
                seats = registry.seats
                hosting = registry.brand.hosting
                contact.email = auth.user?.email ?? ""
                contact.fullName = auth.user?.name ?? ""
            }
        }
    }

    // MARK: - Admin

    private var adminBanner: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.shield.fill")
                .foregroundStyle(Theme.canvas)
            VStack(alignment: .leading, spacing: 2) {
                Text("Operator account")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.canvas)
                Text("INTERNAL100 comps this order in full.")
                    .font(.caption2)
                    .foregroundStyle(Theme.canvas.opacity(0.85))
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .fill(Theme.accentGradient)
        )
    }

    // MARK: - Summary

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text(tier.title)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text(tier.tagline)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
                Spacer()
                Text(tier.short)
                    .font(.caption2.weight(.black))
                    .foregroundStyle(Theme.canvas)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(Theme.accentGradient))
            }

            Divider().overlay(Theme.border)

            ForEach(tier.caps, id: \.self) { cap in
                HStack(spacing: 8) {
                    Image(systemName: "checkmark")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Theme.success)
                    Text(cap)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    private var seatsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionTitle("TEAM SEATS")
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(seats) additional \(seats == 1 ? "seat" : "seats")")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("$\(tier.seatPrice) per seat / month")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
                Spacer()
                Stepper("", value: $seats, in: 0...500)
                    .labelsHidden()
                    .tint(Theme.magenta)
            }
        }
        .padding(16)
        .integravCard()
    }

    private var hostingCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionTitle("HOSTING")
            ForEach(WhiteLabelHosting.allCases) { option in
                Button {
                    Haptics.tap()
                    withAnimation(.snappy) { hosting = option }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: hosting == option ? "largecircle.fill.circle" : "circle")
                            .foregroundStyle(hosting == option ? Theme.magenta : Theme.textSecondary)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(option.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                            Text(option.note)
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                        }
                        Spacer()
                        Text("$\(option.monthlyPrice)/mo")
                            .font(.footnote.weight(.bold))
                            .foregroundStyle(Theme.textPrimary)
                            .monospacedDigit()
                    }
                    .contentShape(.rect)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - Promo

    private var promoCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionTitle("PROMO CODE")

            if let promo {
                HStack(spacing: 10) {
                    Image(systemName: "tag.fill")
                        .foregroundStyle(Theme.success)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(promo.code) applied")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.textPrimary)
                        Text("\(promo.label) · \(promo.percentOff)% off")
                            .font(.caption2)
                            .foregroundStyle(Theme.success)
                    }
                    Spacer()
                    Button("Remove") {
                        Haptics.tap()
                        withAnimation(.snappy) {
                            self.promo = nil
                            promoText = ""
                        }
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
                }
            } else {
                HStack(spacing: 8) {
                    TextField("Enter code", text: $promoText)
                        .textFieldStyle(.plain)
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .textInputAutocapitalization(.characters)
                        .autocorrectionDisabled()
                        .padding(12)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .fill(Theme.surfaceHigh)
                        )

                    Button("Apply") {
                        Haptics.tap()
                        applyPromo()
                    }
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.canvas)
                    .padding(.horizontal, 18)
                    .frame(height: 44)
                    .background(Capsule().fill(Theme.accentGradient))
                    .buttonStyle(PressableButtonStyle())
                }

                if let promoError {
                    Text(promoError)
                        .font(.caption2)
                        .foregroundStyle(Theme.warning)
                }
            }
        }
        .padding(16)
        .integravCard()
    }

    private func applyPromo() {
        promoError = nil
        guard let found = PromoCode.match(promoText, isAdmin: isAdmin) else {
            promoError = "That code isn't valid for this account."
            return
        }
        withAnimation(.snappy) { promo = found }
    }

    // MARK: - Totals

    private var totalsCard: some View {
        VStack(spacing: 10) {
            ForEach(quote.lines) { line in
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(line.label)
                            .font(.subheadline)
                            .foregroundStyle(Theme.textPrimary)
                        Text(line.detail)
                            .font(.caption2)
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer()
                    Text(Order.money(line.amount))
                        .font(.subheadline)
                        .foregroundStyle(Theme.textPrimary)
                        .monospacedDigit()
                }
            }

            Divider().overlay(Theme.border)

            totalRow("Subtotal", Order.money(quote.subtotal), muted: true)
            if quote.discount > 0 {
                totalRow("Discount", "−\(Order.money(quote.discount))", tint: Theme.success)
            }
            totalRow("Estimated tax", Order.money(quote.tax), muted: true)

            Divider().overlay(Theme.border)

            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Monthly total")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Text(tier.termMonths > 1
                         ? "\(tier.termMonths)-month minimum term"
                         : "Cancel any time")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
                Spacer()
                Text(Order.money(quote.monthlyTotal))
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.magenta)
                    .monospacedDigit()
                    .contentTransition(.numericText())
            }

            if tier.termMonths > 1 {
                HStack {
                    Text("Due today (\(tier.termMonths) months)")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Spacer()
                    Text(Order.money(quote.dueToday))
                        .font(.footnote.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                        .monospacedDigit()
                }
            }
        }
        .padding(16)
        .integravCard()
        .animation(.snappy, value: quote)
    }

    private func totalRow(_ label: String, _ value: String, muted: Bool = false, tint: Color? = nil) -> some View {
        HStack {
            Text(label)
                .font(.footnote)
                .foregroundStyle(muted ? Theme.textSecondary : Theme.textPrimary)
            Spacer()
            Text(value)
                .font(.footnote)
                .foregroundStyle(tint ?? (muted ? Theme.textSecondary : Theme.textPrimary))
                .monospacedDigit()
        }
    }

    // MARK: - Contact

    private var contactCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("BILLING CONTACT")

            field("Full name", text: $contact.fullName, content: .name)
            field("Email", text: $contact.email, content: .emailAddress, keyboard: .emailAddress)
            if !contact.email.isEmpty && !BillingContact.isValidEmail(contact.email) {
                Text("Enter a valid email address.")
                    .font(.caption2)
                    .foregroundStyle(Theme.warning)
            }
            field("Company (optional)", text: $contact.company, content: .organizationName)
            field("Address", text: $contact.addressLine, content: .fullStreetAddress)

            HStack(spacing: 10) {
                field("City", text: $contact.city, content: .addressCity)
                field("Postcode", text: $contact.postcode, content: .postalCode)
            }

            field("Country", text: $contact.country, content: .countryName)
        }
        .padding(16)
        .integravCard()
    }

    private func field(
        _ placeholder: String,
        text: Binding<String>,
        content: UITextContentType? = nil,
        keyboard: UIKeyboardType = .default
    ) -> some View {
        TextField(placeholder, text: text)
            .textFieldStyle(.plain)
            .font(.subheadline)
            .foregroundStyle(Theme.textPrimary)
            .textContentType(content)
            .keyboardType(keyboard)
            .textInputAutocapitalization(keyboard == .emailAddress ? .never : .words)
            .autocorrectionDisabled(keyboard == .emailAddress)
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                    .fill(Theme.surfaceHigh)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
    }

    // MARK: - Card

    private var cardCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                sectionTitle("PAYMENT METHOD")
                Spacer()
                Image(systemName: card.brand.symbol)
                    .foregroundStyle(card.digits.isEmpty ? Theme.textSecondary : Theme.magenta)
                Text(card.digits.isEmpty ? "" : card.brand.title)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
            }

            VStack(alignment: .leading, spacing: 4) {
                TextField("Card number", text: Binding(
                    get: { card.number },
                    set: { card.number = CardDraft.format($0) }
                ))
                .textFieldStyle(.plain)
                .font(.system(.subheadline, design: .monospaced))
                .foregroundStyle(Theme.textPrimary)
                .keyboardType(.numberPad)
                .textContentType(.creditCardNumber)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .fill(Theme.surfaceHigh)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .strokeBorder(numberBorder, lineWidth: 1)
                )

                if !card.digits.isEmpty && !card.isNumberValid && card.digits.count >= card.brand.digitCount {
                    Text("That card number fails its checksum — check for a typo.")
                        .font(.caption2)
                        .foregroundStyle(Theme.warning)
                }
            }

            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    TextField("MM/YY", text: Binding(
                        get: { card.expiry },
                        set: { card.expiry = CardDraft.formatExpiry($0) }
                    ))
                    .textFieldStyle(.plain)
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .keyboardType(.numberPad)
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .fill(Theme.surfaceHigh)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .strokeBorder(
                                card.expiry.count >= 5 && !card.isExpiryValid ? Theme.warning : Theme.border,
                                lineWidth: 1
                            )
                    )
                    if card.expiry.count >= 5 && !card.isExpiryValid {
                        Text("Expired or invalid")
                            .font(.caption2)
                            .foregroundStyle(Theme.warning)
                    }
                }

                SecureField("CVC", text: Binding(
                    get: { card.cvc },
                    set: { card.cvc = String($0.filter(\.isNumber).prefix(card.brand.cvcLength)) }
                ))
                .textFieldStyle(.plain)
                .font(.system(.subheadline, design: .monospaced))
                .foregroundStyle(Theme.textPrimary)
                .keyboardType(.numberPad)
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .fill(Theme.surfaceHigh)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .strokeBorder(Theme.border, lineWidth: 1)
                )
            }

            Label(
                "Nothing is charged. Intégrav takes no payments — only the brand and last four digits are kept.",
                systemImage: "lock.shield.fill"
            )
            .font(.caption2)
            .foregroundStyle(Theme.textSecondary)
        }
        .padding(16)
        .integravCard()
    }

    private var numberBorder: Color {
        if card.digits.isEmpty { return Theme.border }
        return card.isNumberValid ? Theme.success : Theme.border
    }

    private var noCardCard: some View {
        HStack(spacing: 10) {
            Image(systemName: "gift.fill")
                .foregroundStyle(Theme.success)
            VStack(alignment: .leading, spacing: 2) {
                Text("No payment method needed")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Text(quote.discount > 0 ? "This order is fully comped." : "This tier is free.")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - Terms

    private var termsCard: some View {
        Toggle(isOn: $agreedToTerms) {
            Text(tier.termMonths > 1
                 ? "I agree to the \(tier.termMonths)-month minimum term and the service terms."
                 : "I agree to the service terms.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
        }
        .tint(Theme.magenta)
        .padding(16)
        .integravCard()
    }

    private var placeButton: some View {
        VStack(spacing: 8) {
            Button {
                Haptics.fire()
                place()
            } label: {
                HStack(spacing: 8) {
                    if isPlacing {
                        ProgressView().tint(Theme.canvas)
                    } else {
                        Image(systemName: "checkmark.circle.fill")
                    }
                    Text(quote.dueToday == 0
                         ? "Activate \(tier.title)"
                         : "Place order · \(Order.money(quote.dueToday))")
                        .font(.subheadline.weight(.bold))
                }
                .foregroundStyle(canPlace ? Theme.canvas : Theme.textSecondary)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(
                    Capsule().fill(canPlace
                                   ? AnyShapeStyle(Theme.accentGradient)
                                   : AnyShapeStyle(Theme.surfaceHigh))
                )
                .glow(Theme.magenta, radius: 16, opacity: canPlace ? 0.5 : 0)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(!canPlace)

            if !canPlace && !isPlacing {
                Text(blockingReason)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .multilineTextAlignment(.center)
            }
        }
    }

    private var blockingReason: String {
        if !contact.isComplete { return "Complete the billing contact to continue." }
        if requiresCard && !card.isComplete { return "Enter a valid card to continue." }
        if !agreedToTerms { return "Accept the terms to continue." }
        return ""
    }

    private func place() {
        isPlacing = true
        let order = checkout.placeOrder(
            tier: tier,
            seats: seats,
            hosting: effectiveHosting,
            promo: promo,
            contact: contact,
            card: card,
            placedByEmail: auth.user?.email ?? contact.email,
            isAdmin: isAdmin
        )
        // Applying the licence is what the order actually buys.
        registry.select(tier)
        registry.seats = seats
        if tier.isWhiteLabel { registry.brand.hosting = hosting }
        card = CardDraft()
        isPlacing = false
        Haptics.success()
        withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) { placed = order }
    }

    private func sectionTitle(_ text: String) -> some View {
        Text(text)
            .font(.caption.weight(.bold))
            .kerning(1.2)
            .foregroundStyle(Theme.textSecondary)
    }
}

/// Post-purchase receipt.
struct ConfirmationPanel: View {
    let order: Order
    let onDone: () -> Void

    @State private var appeared: Bool = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ZStack {
                    Circle()
                        .fill(Theme.accentGradient)
                        .frame(width: 88, height: 88)
                        .glow(Theme.magenta, radius: 26, opacity: 0.6)
                    Image(systemName: "checkmark")
                        .font(.system(size: 38, weight: .bold))
                        .foregroundStyle(Theme.canvas)
                }
                .scaleEffect(appeared ? 1 : 0.6)
                .opacity(appeared ? 1 : 0)

                VStack(spacing: 6) {
                    Text("\(order.tier.title) is active")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text(order.reference)
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(Theme.magenta)
                        .textSelection(.enabled)
                }

                VStack(spacing: 10) {
                    receiptRow("Plan", order.tier.title)
                    if order.seats > 0 { receiptRow("Seats", "\(order.seats)") }
                    if let hosting = order.hosting { receiptRow("Hosting", hosting.title) }
                    if let promo = order.promoCode { receiptRow("Promo", promo) }
                    receiptRow("Monthly", Order.money(order.monthlyTotal))
                    receiptRow("Term", "\(order.termMonths) month\(order.termMonths == 1 ? "" : "s")")
                    receiptRow("Due today", order.dueTodayLabel)
                    if !order.cardLast4.isEmpty {
                        receiptRow("Card", "\(order.cardBrand.title) •••• \(order.cardLast4)")
                    }
                    receiptRow("Account", order.placedByEmail)
                }
                .padding(16)
                .integravCard(highlight: true)

                if order.wasCompedByAdmin {
                    Label("Comped by operator", systemImage: "checkmark.shield.fill")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.success)
                }

                Label(
                    "No payment was taken. This receipt records the licence on this account.",
                    systemImage: "info.circle"
                )
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)

                Button {
                    Haptics.tap()
                    onDone()
                } label: {
                    Text("Done")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.canvas)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Capsule().fill(Theme.accentGradient))
                }
                .buttonStyle(PressableButtonStyle())
            }
            .padding(.horizontal, 16)
            .padding(.top, 24)
            .padding(.bottom, 40)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) { appeared = true }
        }
    }

    private func receiptRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
            Spacer()
            Text(value)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(1)
                .truncationMode(.middle)
        }
    }
}
