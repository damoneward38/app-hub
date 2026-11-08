import SwiftUI

/// Screens pushed from the licence desk.
enum PlansDestination: Hashable {
    case vault
}

/// Everything the licence desk can present modally.
///
/// Folded into one enum because SwiftUI keeps only the last `sheet` modifier on
/// a view: three stacked `sheet(isPresented:)` meant only the third could ever
/// open.
enum PlansSheet: Identifiable, Hashable {
    case account
    case admin
    case checkout(PlanTier)

    var id: String {
        switch self {
        case .account: return "account"
        case .admin: return "admin"
        case .checkout(let tier): return "checkout-\(tier.rawValue)"
        }
    }
}

/// Plans tab — the licence desk. Metered usage for the month, the five tiers
/// with their real caps and SLA, per-seat add-ons, and the white-label bundle
/// that re-brands the whole app. Everything applies locally; nothing is charged.
struct PlansView: View {
    @Environment(RegistryStore.self) private var registry
    @Environment(AuthManager.self) private var auth
    @Environment(CloudSync.self) private var cloud

    @State private var showBundle: Bool = false
    @State private var sheet: PlansSheet?

    var body: some View {
        @Bindable var registry = registry

        NavigationStack {
            ZStack {
                NeuralBackground(intensity: 0.5)

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        header
                        accountCard
                        vaultLink
                        if isAdmin { adminCard }
                        usageCard
                        tierSection
                        seatCard
                        whiteLabelCard(registry: $registry)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 4)
                    .padding(.bottom, 24)
                }
                .scrollDismissesKeyboard(.interactively)
                .scrollIndicators(.hidden)
            }
            .safeAreaInset(edge: .bottom) { totalBar }
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: PlansDestination.self) { destination in
                switch destination {
                case .vault: VaultView()
                }
            }
        }
        // One `sheet(item:)`, not three stacked modifiers: SwiftUI honours only
        // the last sheet on a view, so Account and the operator panel were dead
        // buttons — they set their flag and nothing ever appeared.
        .sheet(item: $sheet) { destination in
            switch destination {
            case .account: AccountSheet()
            case .admin: AdminPanelSheet()
            case .checkout(let tier): CheckoutView(tier: tier)
            }
        }
    }

    private var isAdmin: Bool { AdminRole.isAdmin(email: auth.user?.email) }

    /// The way into the vault. Someone asking "what do you actually keep on me?"
    /// looks under their account, so the answer lives one tap from it.
    private var vaultLink: some View {
        NavigationLink(value: PlansDestination.vault) {
            HStack(spacing: 12) {
                Image(systemName: "lock.shield.fill")
                    .font(.title3)
                    .foregroundStyle(Theme.success)
                    .frame(width: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Vault")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Everything Intégrav holds on you — private, exportable, erasable")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(14)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    private var accent: Color { registry.accent }

    // MARK: - Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(registry.appName.uppercased())
                .font(.caption.weight(.bold))
                .kerning(1.4)
                .foregroundStyle(accent)

            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text("Plans & licensing")
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                Spacer(minLength: 0)
                Text(registry.plan.short)
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(Theme.canvas)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(accent))
            }

            Text("Caps apply on device. Payment rails need a server — none is wired.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
        }
        .padding(.top, 8)
    }

    // MARK: - Account

    /// The bridge between the local licence and the account that owns it.
    private var accountCard: some View {
        Button {
            Haptics.tap()
            sheet = .account
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(auth.isSignedIn ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surfaceHigh))
                        .frame(width: 44, height: 44)
                    Image(systemName: auth.isSignedIn ? "person.fill.checkmark" : "person.crop.circle.badge.plus")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(auth.isSignedIn ? Theme.canvas : accent)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(auth.user?.displayName ?? "Sign in to sync")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    HStack(spacing: 5) {
                        Image(systemName: cloud.state.symbol)
                            .font(.system(size: 9, weight: .bold))
                        Text(auth.isSignedIn
                             ? cloud.state.label
                             : "Licence, rig, chains and audit trail stay on this device")
                            .font(.system(size: 11))
                            .lineLimit(1)
                    }
                    .foregroundStyle(Theme.textSecondary)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .integravCard(highlight: auth.isSignedIn)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Usage

    private var usageCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("THIS MONTH")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                Text(registry.usage.resetLabel)
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(Theme.textSecondary)
            }

            QuotaMeter(
                label: "Dispatches",
                used: registry.usage.calls,
                cap: registry.plan.monthlyCalls,
                fraction: registry.callsFraction,
                tint: accent
            )

            QuotaMeter(
                label: "Function executions",
                used: registry.usage.executions,
                cap: registry.plan.monthlyExecutions,
                fraction: registry.executionsFraction,
                tint: Theme.violet
            )

            HStack(spacing: 10) {
                MiniFact(value: "≤ \(registry.plan.maxChainSteps)", label: "CHAIN")
                MiniFact(value: "\(registry.plan.concurrentChains)", label: "PARALLEL")
                MiniFact(value: registry.plan.uptime, label: "UPTIME")

                Button {
                    Haptics.tap()
                    withAnimation(.snappy) { registry.resetUsage() }
                } label: {
                    Text("Reset")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(Theme.surfaceHigh)
                        )
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    // MARK: - Admin

    /// Operator entry point. Only rendered for accounts in `AdminRole`.
    private var adminCard: some View {
        Button {
            Haptics.tap()
            sheet = .admin
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "checkmark.shield.fill")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(Theme.canvas)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(Theme.accentGradient))

                VStack(alignment: .leading, spacing: 2) {
                    Text("Operator panel")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Orders, comps and licence overrides")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.textSecondary)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(14)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Tiers

    private var tierSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("TIERS")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            ForEach(PlanTier.allCases) { tier in
                TierCard(
                    tier: tier,
                    isCurrent: registry.plan == tier,
                    accent: accent
                ) {
                    Haptics.fire()
                    withAnimation(.snappy(duration: 0.3)) { registry.select(tier) }
                } onCheckout: {
                    Haptics.fire()
                    sheet = .checkout(tier)
                }
            }
        }
    }

    // MARK: - Seats

    private var seatCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Additional users")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Text(registry.plan.seatPrice == 0
                         ? "Free plan includes one seat"
                         : "$\(registry.plan.seatPrice) / user / month on \(registry.plan.title)")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
                Spacer(minLength: 0)
            }

            HStack(spacing: 14) {
                StepperButton(symbol: "minus", enabled: registry.seats > 0) {
                    Haptics.tap()
                    withAnimation(.snappy) { registry.seats = max(0, registry.seats - 1) }
                }

                Text("\(registry.seats)")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary)
                    .monospacedDigit()
                    .contentTransition(.numericText())
                    .frame(minWidth: 62)

                StepperButton(symbol: "plus", enabled: registry.plan.seatPrice > 0) {
                    Haptics.tap()
                    withAnimation(.snappy) { registry.seats += 1 }
                }

                Spacer(minLength: 0)

                Text("+$\(registry.quote.seatCost)")
                    .font(.system(size: 17, weight: .bold, design: .monospaced))
                    .foregroundStyle(registry.quote.seatCost > 0 ? accent : Theme.textSecondary)
                    .contentTransition(.numericText())
            }
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - White label

    private func whiteLabelCard(registry: Bindable<RegistryStore>) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "paintpalette.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(accent)
                    .frame(width: 34, height: 34)
                    .background(RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Theme.surfaceHigh))

                VStack(alignment: .leading, spacing: 3) {
                    Text("White-label")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Text("Ship this as your own product")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }

                Spacer(minLength: 0)

                Toggle("", isOn: Binding(
                    get: { registry.wrappedValue.brand.isEnabled },
                    set: { value in
                        Haptics.fire()
                        withAnimation(.snappy(duration: 0.3)) { registry.wrappedValue.setBranding(value) }
                    }
                ))
                .labelsHidden()
                .tint(accent)
            }

            if registry.wrappedValue.brand.isEnabled {
                VStack(alignment: .leading, spacing: 14) {
                    BrandField(title: "BRAND NAME", text: registry.brand.name, placeholder: "Cooper Avatar Cloud")
                    BrandField(title: "DOMAIN", text: registry.brand.domain, placeholder: "avatars.cooper.io")

                    VStack(alignment: .leading, spacing: 8) {
                        Text("ACCENT")
                            .font(.system(size: 9, weight: .bold))
                            .kerning(1)
                            .foregroundStyle(Theme.textSecondary)

                        HStack(spacing: 10) {
                            ForEach(BrandAccent.palette) { swatch in
                                Button {
                                    Haptics.tap()
                                    withAnimation(.snappy) { registry.wrappedValue.brand.accentHex = swatch.hex }
                                } label: {
                                    Circle()
                                        .fill(Color(hex: swatch.hex))
                                        .frame(width: 30, height: 30)
                                        .overlay(
                                            Circle()
                                                .strokeBorder(
                                                    Theme.textPrimary,
                                                    lineWidth: registry.wrappedValue.brand.accentHex == swatch.hex ? 2 : 0
                                                )
                                                .padding(-4)
                                        )
                                }
                                .buttonStyle(PressableButtonStyle())
                                .accessibilityLabel(swatch.name)
                            }
                            Spacer(minLength: 0)
                        }
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("HOSTING")
                            .font(.system(size: 9, weight: .bold))
                            .kerning(1)
                            .foregroundStyle(Theme.textSecondary)

                        HStack(spacing: 8) {
                            ForEach(WhiteLabelHosting.allCases) { option in
                                HostingChip(
                                    option: option,
                                    selected: registry.wrappedValue.brand.hosting == option,
                                    accent: accent
                                ) {
                                    Haptics.tap()
                                    withAnimation(.snappy) { registry.wrappedValue.brand.hosting = option }
                                }
                            }
                        }
                    }

                    HStack(spacing: 8) {
                        Image(systemName: "terminal.fill")
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.textSecondary)
                        Text("\(registry.wrappedValue.namespace)tell_joke()")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(accent)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.canvas.opacity(0.6)))
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            Button {
                Haptics.tap()
                withAnimation(.snappy) { showBundle.toggle() }
            } label: {
                HStack(spacing: 6) {
                    Text(showBundle ? "Hide what's included" : "What's included")
                        .font(.footnote.weight(.semibold))
                    Image(systemName: showBundle ? "chevron.up" : "chevron.down")
                        .font(.system(size: 10, weight: .bold))
                }
                .foregroundStyle(accent)
            }
            .buttonStyle(PressableButtonStyle())

            if showBundle {
                VStack(spacing: 10) {
                    ForEach(BundleItem.all) { item in
                        HStack(spacing: 10) {
                            Image(systemName: item.symbol)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(accent)
                                .frame(width: 18)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(item.title)
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundStyle(Theme.textPrimary)
                                Text(item.detail)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Theme.textSecondary)
                            }
                            Spacer(minLength: 0)
                        }
                    }
                }
                .transition(.opacity)
            }
        }
        .padding(16)
        .integravCard(highlight: registry.wrappedValue.brand.isEnabled)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .strokeBorder(accent.opacity(registry.wrappedValue.brand.isEnabled ? 0.6 : 0), lineWidth: 1)
        )
    }

    // MARK: - Total

    private var totalBar: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(alignment: .leading, spacing: 2) {
                Text(registry.plan.title.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .kerning(1)
                    .foregroundStyle(Theme.textSecondary)
                Text(breakdown)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 0) {
                Text(registry.quote.totalLabel)
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary)
                    .monospacedDigit()
                    .contentTransition(.numericText())
                Text(registry.plan.termMonths > 1
                     ? "/ mo · \(registry.plan.termMonths)-mo term"
                     : "/ month")
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.textSecondary)
            }

            Button {
                Haptics.fire()
                sheet = .checkout(registry.plan)
            } label: {
                Text("Checkout")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.canvas)
                    .padding(.horizontal, 18)
                    .frame(height: 46)
                    .background(Capsule().fill(Theme.accentGradient))
                    .glow(accent, radius: 12, opacity: 0.45)
            }
            .buttonStyle(PressableButtonStyle())
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
        .background(.ultraThinMaterial)
        .overlay(alignment: .top) {
            Rectangle().fill(Theme.border.opacity(0.7)).frame(height: 1)
        }
    }

    private var breakdown: String {
        var parts: [String] = ["base $\(registry.quote.base)"]
        if registry.quote.seatCost > 0 { parts.append("\(registry.seats) seats $\(registry.quote.seatCost)") }
        if registry.quote.hostingCost > 0 {
            parts.append("\(registry.brand.hosting.title.lowercased()) $\(registry.quote.hostingCost)")
        }
        return parts.joined(separator: " + ")
    }
}

/// A metered quota with a bar, used in Plans and the call log.
struct QuotaMeter: View {
    let label: String
    let used: Int
    let cap: Int?
    let fraction: Double
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(label)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Text(capLabel)
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundStyle(isFull ? Theme.warning : Theme.textSecondary)
                    .contentTransition(.numericText())
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.canvas.opacity(0.7))
                    Capsule()
                        .fill(isFull ? AnyShapeStyle(Theme.warning) : AnyShapeStyle(tint))
                        .frame(width: max(4, geo.size.width * displayFraction))
                }
            }
            .frame(height: 7)
        }
    }

    private var isFull: Bool { cap != nil && fraction >= 1 }

    private var displayFraction: Double {
        cap == nil ? min(1, Double(used) / 400) : fraction
    }

    private var capLabel: String {
        guard let cap else { return "\(used.formatted(.number)) / ∞" }
        return "\(used.formatted(.number)) / \(cap.formatted(.number))"
    }
}

/// One priced tier, selectable.
struct TierCard: View {
    let tier: PlanTier
    let isCurrent: Bool
    let accent: Color
    let action: () -> Void
    let onCheckout: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(tier.title)
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)

                    if isCurrent {
                        Text("CURRENT")
                            .font(.system(size: 8, weight: .bold))
                            .kerning(0.8)
                            .foregroundStyle(Theme.canvas)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(Capsule().fill(accent))
                    }

                    Spacer(minLength: 0)

                    Text(tier.monthlyPrice == 0 ? "$0" : "$\(tier.monthlyPrice)")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(isCurrent ? accent : Theme.textPrimary)
                        .monospacedDigit()
                    Text("/mo")
                        .font(.system(size: 10))
                        .foregroundStyle(Theme.textSecondary)
                }

                Text(tier.tagline)
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)

                VStack(alignment: .leading, spacing: 5) {
                    ForEach(tier.caps, id: \.self) { cap in
                        HStack(spacing: 7) {
                            Image(systemName: "checkmark")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundStyle(isCurrent ? accent : Theme.textSecondary)
                                .frame(width: 10)
                            Text(cap)
                                .font(.system(size: 12))
                                .foregroundStyle(Theme.textPrimary.opacity(0.85))
                        }
                    }
                }

                HStack(spacing: 6) {
                    Text(tier.seatPrice == 0 ? "No extra seats" : "+$\(tier.seatPrice) / extra user")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Theme.textSecondary)
                    if tier.termMonths > 1 {
                        Text("· \(tier.termMonths)-month minimum")
                            .font(.system(size: 11))
                            .foregroundStyle(Theme.warning)
                    }
                }

                Button(action: onCheckout) {
                    Text(isCurrent ? "Review & checkout" : "Choose \(tier.title)")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(isCurrent ? Theme.canvas : accent)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(
                            Capsule().fill(isCurrent
                                           ? AnyShapeStyle(Theme.accentGradient)
                                           : AnyShapeStyle(Theme.surfaceHigh))
                        )
                        .overlay(
                            Capsule().strokeBorder(accent.opacity(isCurrent ? 0 : 0.5), lineWidth: 1)
                        )
                }
                .buttonStyle(PressableButtonStyle())
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .integravCard(highlight: isCurrent)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .strokeBorder(accent.opacity(isCurrent ? 0.8 : 0), lineWidth: 1.5)
            )
            .glow(accent, radius: 16, opacity: isCurrent ? 0.22 : 0)
        }
        .buttonStyle(PressableButtonStyle())
    }
}

/// Small labelled fact used under the usage meters.
struct MiniFact: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 13, weight: .bold, design: .monospaced))
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label)
                .font(.system(size: 8, weight: .bold))
                .kerning(0.6)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 44)
        .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.canvas.opacity(0.5)))
    }
}

/// Round ± control for the seat stepper.
struct StepperButton: View {
    let symbol: String
    let enabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(enabled ? Theme.textPrimary : Theme.textSecondary.opacity(0.4))
                .frame(width: 46, height: 46)
                .background(Circle().fill(Theme.surfaceHigh))
                .overlay(Circle().strokeBorder(Theme.border, lineWidth: 1))
        }
        .buttonStyle(PressableButtonStyle())
        .disabled(!enabled)
    }
}

/// Labelled text field used for brand name and domain.
struct BrandField: View {
    let title: String
    @Binding var text: String
    let placeholder: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 9, weight: .bold))
                .kerning(1)
                .foregroundStyle(Theme.textSecondary)

            TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Theme.textSecondary))
                .textFieldStyle(.plain)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Theme.textPrimary)
                .padding(.horizontal, 14)
                .frame(height: 44)
                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.canvas.opacity(0.6)))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Theme.border, lineWidth: 1)
                )
        }
    }
}

/// Hosting option pill inside the white-label card.
struct HostingChip: View {
    let option: WhiteLabelHosting
    let selected: Bool
    let accent: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 5) {
                    Text(option.title)
                        .font(.system(size: 12, weight: .bold))
                    Spacer(minLength: 0)
                    Text("$\(option.monthlyPrice)")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                }
                Text(option.note)
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }
            .foregroundStyle(selected ? Theme.textPrimary : Theme.textSecondary)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(selected ? Theme.surfaceHigh : Theme.canvas.opacity(0.5))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(selected ? accent.opacity(0.8) : Theme.border, lineWidth: 1)
            )
        }
        .buttonStyle(PressableButtonStyle())
    }
}
