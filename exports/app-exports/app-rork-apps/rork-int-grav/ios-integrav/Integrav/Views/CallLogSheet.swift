import SwiftUI

/// The audit trail: every function call the twin has executed, with the arguments
/// it received, what it returned, how long it took and where it came from.
/// Plus the plan that throttles chain length. All of it on device.
struct CallLogSheet: View {
    @Environment(RegistryStore.self) private var registry
    @Environment(\.dismiss) private var dismiss

    @State private var sourceFilter: CallSource?

    var body: some View {
        @Bindable var registry = registry

        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        stats
                        planPicker(registry: $registry)
                        leaderboard
                        usageBreakdown
                        sourceChips
                        entries
                    }
                    .padding(.horizontal, 18)
                    .padding(.top, 8)
                    .padding(.bottom, 30)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("Call log")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    // The menu itself always opens. Disabling the whole control
                    // on an empty log left a visible button that did nothing on
                    // a fresh account — the filter items below are useful
                    // immediately, and the export/clear items explain their own
                    // unavailability by being greyed inside an open menu.
                    Menu {
                        Section {
                            Button {
                                Haptics.tap()
                                withAnimation(.snappy) { sourceFilter = nil }
                            } label: {
                                Label(
                                    "All sources",
                                    systemImage: sourceFilter == nil ? "checkmark.circle.fill" : "circle"
                                )
                            }

                            ForEach(CallSource.allCases) { source in
                                Button {
                                    Haptics.tap()
                                    withAnimation(.snappy) { sourceFilter = source }
                                } label: {
                                    Label(
                                        source.title,
                                        systemImage: sourceFilter == source ? "checkmark.circle.fill" : source.symbol
                                    )
                                }
                            }
                        } header: {
                            Text("Filter")
                        }

                        Section {
                            if registry.callLog.isEmpty {
                                Label("Nothing to export yet", systemImage: "tray")
                            } else {
                                ShareLink(
                                    item: registry.exportLogJSON(),
                                    preview: SharePreview("Intégrav call log")
                                ) {
                                    Label("Export as JSON", systemImage: "square.and.arrow.up")
                                }

                                Button(role: .destructive) {
                                    Haptics.tap()
                                    withAnimation(.snappy) { registry.clearLog() }
                                } label: {
                                    Label("Clear log", systemImage: "trash")
                                }
                            }
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundStyle(Theme.magenta)
                    }
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
    }

    // MARK: - Stats

    private var stats: some View {
        HStack(spacing: 10) {
            StatTile(value: "\(registry.callLog.count)", label: "TOTAL CALLS", tint: Theme.magenta)
            StatTile(value: "\(registry.callsToday)", label: "TODAY", tint: Theme.violet)
            StatTile(value: "\(registry.uniqueFunctionsCalled)", label: "FUNCTIONS", tint: Theme.success)
            StatTile(value: "\(registry.averageLatencyMs)ms", label: "AVG", tint: Theme.warning)
        }
    }

    // MARK: - Plan

    private func planPicker(registry: Bindable<RegistryStore>) -> some View {
        let store = registry.wrappedValue

        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("LICENCE")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                Text(store.usage.resetLabel)
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(Theme.textSecondary)
            }

            Menu {
                Picker("Plan", selection: registry.plan) {
                    ForEach(PlanTier.allCases) { tier in
                        Text("\(tier.title) — $\(tier.monthlyPrice)/mo").tag(tier)
                    }
                }
            } label: {
                HStack(spacing: 8) {
                    Text(store.plan.title)
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Text(store.quote.totalLabel + "/mo")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .foregroundStyle(store.accent)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Theme.textSecondary)
                }
                .padding(.horizontal, 14)
                .frame(height: 44)
                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.surfaceHigh))
            }

            QuotaMeter(
                label: "Dispatches",
                used: store.usage.calls,
                cap: store.plan.monthlyCalls,
                fraction: store.callsFraction,
                tint: store.accent
            )

            QuotaMeter(
                label: "Function executions",
                used: store.usage.executions,
                cap: store.plan.monthlyExecutions,
                fraction: store.executionsFraction,
                tint: Theme.violet
            )

            Text(store.plan.blurb)
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .monospacedDigit()
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - Analytics

    @ViewBuilder
    private var leaderboard: some View {
        let top = registry.mostUsed(limit: 6)
        if !top.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("MOST CALLED")
                        .font(.caption.weight(.bold))
                        .kerning(1.2)
                        .foregroundStyle(Theme.textSecondary)
                    Spacer()
                    Text("\(registry.totalRuns) runs")
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(Theme.textSecondary)
                }

                VStack(spacing: 8) {
                    ForEach(Array(top.enumerated()), id: \.element.id) { rank, usage in
                        LeaderboardRow(
                            rank: rank + 1,
                            usage: usage,
                            fraction: Double(usage.count) / Double(max(1, top[0].count)),
                            isLiked: registry.isLiked(usage.function)
                        )
                    }
                }
                .padding(14)
                .integravCard()
            }
        }
    }

    @ViewBuilder
    private var usageBreakdown: some View {
        let usage = registry.usageByCategory
        if !usage.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                Text("BY FAMILY")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)

                VStack(spacing: 10) {
                    ForEach(usage) { item in
                        HStack(spacing: 10) {
                            Image(systemName: item.category.symbol)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(item.category.accent)
                                .frame(width: 16)

                            Text(item.category.chip)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(Theme.textPrimary)
                                .frame(width: 62, alignment: .leading)

                            GeometryReader { geo in
                                let ratio = Double(item.count) / Double(max(1, usage[0].count))
                                ZStack(alignment: .leading) {
                                    Capsule().fill(Theme.surfaceHigh)
                                    Capsule()
                                        .fill(item.category.accent)
                                        .frame(width: max(6, geo.size.width * ratio))
                                }
                            }
                            .frame(height: 8)

                            Text("\(item.count)")
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .foregroundStyle(Theme.textSecondary)
                                .frame(width: 30, alignment: .trailing)
                        }
                    }
                }
                .padding(14)
                .integravCard()
            }
        }
    }

    // MARK: - Filters

    private var sourceChips: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                SourceChip(title: "All", count: registry.callLog.count, selected: sourceFilter == nil) {
                    withAnimation(.snappy) { sourceFilter = nil }
                }
                ForEach([CallSource.registry, .hotkey, .chat, .chain], id: \.rawValue) { source in
                    let count = registry.callLog.filter { $0.source == source }.count
                    SourceChip(title: source.label, count: count, selected: sourceFilter == source) {
                        withAnimation(.snappy) { sourceFilter = sourceFilter == source ? nil : source }
                    }
                }
            }
        }
        .scrollIndicators(.hidden)
    }

    // MARK: - Entries

    private var visible: [CallLogEntry] {
        guard let sourceFilter else { return registry.callLog }
        return registry.callLog.filter { $0.source == sourceFilter }
    }

    @ViewBuilder
    private var entries: some View {
        if visible.isEmpty {
            VStack(spacing: 8) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: 30))
                    .foregroundStyle(Theme.magenta)
                Text("No calls logged yet")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                Text("Every function your twin performs is recorded here — arguments, result, latency.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 40)
            .frame(maxWidth: .infinity)
        } else {
            LazyVStack(spacing: 10) {
                ForEach(visible) { entry in
                    CallLogRow(entry: entry, namespace: registry.namespace)
                }
            }
        }
    }
}

/// A single logged call, rendered like a structured log line.
struct CallLogRow: View {
    let entry: CallLogEntry
    var namespace: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Text(namespace + entry.signature)
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)

                Text(entry.source.label)
                    .font(.system(size: 9, weight: .bold))
                    .kerning(0.8)
                    .foregroundStyle(Theme.violet)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Theme.violet.opacity(0.16)))

                Spacer(minLength: 0)

                Text(entry.timeLabel)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.textSecondary)
            }

            Text(entry.argumentsJSON)
                .font(.system(size: 11, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1)

            Text(entry.result)
                .font(.footnote)
                .foregroundStyle(Theme.textPrimary.opacity(0.85))
                .lineLimit(3)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 10) {
                Label("\(entry.durationMs)ms", systemImage: "bolt.fill")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Theme.success)
                    .monospacedDigit()

                if let chain = entry.chain {
                    Label(chain, systemImage: "link")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(Theme.magenta)
                        .lineLimit(1)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .integravCard()
    }
}

/// Compact metric tile used across the call log header.
struct StatTile: View {
    let value: String
    let label: String
    let tint: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 17, weight: .bold, design: .rounded))
                .foregroundStyle(tint)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(label)
                .font(.system(size: 8, weight: .bold))
                .kerning(0.6)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .integravCard()
    }
}

/// One entry of the popularity leaderboard.
struct LeaderboardRow: View {
    let rank: Int
    let usage: FunctionUsage
    let fraction: Double
    let isLiked: Bool

    var body: some View {
        HStack(spacing: 10) {
            Text("\(rank)")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(rank == 1 ? Theme.magenta : Theme.textSecondary)
                .frame(width: 14, alignment: .leading)

            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 5) {
                    Text(usage.function.signature)
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    if isLiked {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 8))
                            .foregroundStyle(Theme.magenta)
                    }
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Theme.surfaceHigh)
                        Capsule()
                            .fill(Theme.accentGradient)
                            .frame(width: max(6, geo.size.width * fraction))
                    }
                }
                .frame(height: 6)
            }

            Text("\(usage.count)×")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(Theme.success)
                .frame(width: 36, alignment: .trailing)
        }
    }
}

/// Transient warning shown when the plan refuses a call.
struct LimitBanner: View {
    let text: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.footnote.weight(.bold))
                .foregroundStyle(Theme.warning)
            Text(text)
                .font(.footnote.weight(.medium))
                .foregroundStyle(Theme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                .fill(Theme.surfaceHigh)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                .strokeBorder(Theme.warning.opacity(0.5), lineWidth: 1)
        )
        .glow(Theme.warning, radius: 14, opacity: 0.25)
    }
}

/// Filter pill for the call-log source.
struct SourceChip: View {
    let title: String
    let count: Int
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .font(.system(size: 11, weight: .bold))
                    .kerning(0.6)
                Text("\(count)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .opacity(0.7)
            }
            .foregroundStyle(selected ? Theme.canvas : Theme.textSecondary)
            .padding(.horizontal, 14)
            .frame(height: 34)
            .background(
                Capsule().fill(selected ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surface))
            )
            .overlay(Capsule().strokeBorder(Theme.border.opacity(selected ? 0 : 1), lineWidth: 1))
        }
        .buttonStyle(PressableButtonStyle())
    }
}
