import SwiftUI

/// Operator tools. Reachable only from an account listed in `AdminRole`.
struct AdminPanelSheet: View {
    @Environment(CheckoutStore.self) private var checkout
    @Environment(RegistryStore.self) private var registry
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss

    @State private var showClearConfirm: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 18) {
                        identityCard
                        figuresStrip
                        overrideCard
                        ordersSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Operator")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.magenta)
                }
            }
            .confirmationDialog(
                "Delete every order record?",
                isPresented: $showClearConfirm,
                titleVisibility: .visible
            ) {
                Button("Delete all", role: .destructive) {
                    Haptics.tap()
                    withAnimation(.snappy) { checkout.clearAll() }
                }
            }
        }
    }

    private var identityCard: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.shield.fill")
                .font(.title3)
                .foregroundStyle(Theme.canvas)
                .frame(width: 46, height: 46)
                .background(Circle().fill(Theme.accentGradient))

            VStack(alignment: .leading, spacing: 2) {
                Text(auth.user?.email ?? "Operator")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                Text("Full licence override enabled")
                    .font(.caption2)
                    .foregroundStyle(Theme.success)
            }
            Spacer(minLength: 0)
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    private var figuresStrip: some View {
        HStack(spacing: 10) {
            figure("\(checkout.orders.count)", "orders", Theme.magenta)
            figure(Order.money(checkout.lifetimeValue), "booked", Theme.violet)
            figure("\(checkout.orders.filter(\.wasCompedByAdmin).count)", "comped", Theme.success)
        }
    }

    private func figure(_ value: String, _ label: String, _ tint: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .foregroundStyle(tint)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .integravCard()
    }

    /// Sets any tier instantly, bypassing checkout entirely.
    private var overrideCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("LICENCE OVERRIDE")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            Text("Applies a tier to this device without an order.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)

            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
                spacing: 8
            ) {
                ForEach(PlanTier.allCases) { tier in
                    let isOn = registry.plan == tier
                    Button {
                        Haptics.tap()
                        withAnimation(.snappy) { registry.select(tier) }
                    } label: {
                        Text(tier.title)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(isOn ? Theme.canvas : Theme.textPrimary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 44)
                            .background(
                                Capsule().fill(isOn
                                               ? AnyShapeStyle(Theme.accentGradient)
                                               : AnyShapeStyle(Theme.surfaceHigh))
                            )
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }

            Button {
                Haptics.tap()
                withAnimation(.snappy) { registry.resetUsage() }
            } label: {
                Text("Reset monthly meters")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.violet)
            }
        }
        .padding(16)
        .integravCard()
    }

    private var ordersSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("ORDERS")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                if !checkout.orders.isEmpty {
                    Button("Clear") { showClearConfirm = true }
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.warning)
                }
            }

            if checkout.orders.isEmpty {
                Text("No orders placed on this device yet.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .integravCard()
            } else {
                ForEach(checkout.orders) { order in
                    orderRow(order)
                }
            }
        }
    }

    private func orderRow(_ order: Order) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(order.reference)
                    .font(.system(.caption, design: .monospaced).weight(.bold))
                    .foregroundStyle(Theme.magenta)
                Spacer()
                Text(Order.money(order.monthlyTotal) + "/mo")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .monospacedDigit()
            }

            Text("\(order.tier.title) · \(order.seats) seats · \(order.termMonths)mo term")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)

            HStack(spacing: 6) {
                Text(order.placedByEmail)
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(1)
                Spacer()
                if order.wasCompedByAdmin {
                    Text("COMPED")
                        .font(.system(size: 8, weight: .black))
                        .foregroundStyle(Theme.success)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(Theme.success.opacity(0.15)))
                }
                Text(order.placedAt, format: .dateTime.day().month().hour().minute())
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(14)
        .integravCard()
        .swipeActions {
            Button(role: .destructive) {
                checkout.removeOrder(order)
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }
}
