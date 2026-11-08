import Charts
import SwiftUI

/// The scale screen: live concurrency counter, throughput chart, active fleets,
/// and the 100,000-slot capacity gauge. Pushed from Command, so it draws inside
/// that stack rather than owning one — nesting NavigationStacks breaks pushes.
struct TaskEngineView: View {
    @Environment(EngineStore.self) private var engine
    @Environment(RegistryStore.self) private var registry
    @State private var showStudio: Bool = false

    var body: some View {
        @Bindable var engine = engine

        ZStack {
            NeuralBackground(intensity: 0.65)

            ScrollView {
                VStack(spacing: 18) {
                    counterHeader
                    chartCard(range: $engine.chartRange)
                    studioCard
                    fleetSection
                    capacityCard
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
                .padding(.bottom, 28)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Task engine")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
        .navigationDestination(for: TaskFleet.self) { fleet in
            FleetDetailView(fleetID: fleet.id)
        }
        .navigationDestination(isPresented: $showStudio) {
            RenderStudioView()
        }
    }

    // MARK: - Header

    private var counterHeader: some View {
        VStack(spacing: 4) {
            HStack(alignment: .center, spacing: 12) {
                LiveCounter(value: engine.runningNow)
                HStack(spacing: 6) {
                    LiveDot()
                    Text("Live")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.success)
                }
            }
            Text("running now")
                .font(.title3)
                .foregroundStyle(Theme.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(engine.runningNow) tasks running now")
    }

    // MARK: - Chart

    private func chartCard(range: Binding<ChartRange>) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Tasks started per minute")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Picker("Range", selection: range) {
                    ForEach(ChartRange.allCases) { option in
                        Text(option.rawValue).tag(option)
                    }
                }
                .pickerStyle(.menu)
                .tint(Theme.textPrimary)
            }

            // An empty chart is the honest answer before anything has been
            // dispatched. Drawing a plausible line for work nobody ran is how a
            // dashboard starts lying on first launch.
            if !engine.hasThroughputHistory {
                VStack(spacing: 6) {
                    Image(systemName: "chart.bar")
                        .font(.title2)
                        .foregroundStyle(Theme.violet)
                    Text("Nothing dispatched yet")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Every command you run is counted here.")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 168)
            } else {
                Chart(engine.samples) { sample in
                    BarMark(
                        x: .value("Time", sample.date),
                        y: .value("Tasks", sample.value)
                    )
                    .foregroundStyle(Theme.accentGradient)
                    .cornerRadius(2)
                }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisGridLine().foregroundStyle(Theme.border.opacity(0.5))
                    AxisValueLabel {
                        if let intValue = value.as(Int.self) {
                            Text(shortNumber(intValue))
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 5)) { value in
                    AxisValueLabel {
                        if let date = value.as(Date.self) {
                            Text(date, format: .dateTime.hour().minute())
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                        }
                    }
                }
            }
                .frame(height: 168)
            }
        }
        .padding(16)
        .integravCard()
    }

    private func shortNumber(_ value: Int) -> String {
        value >= 1_000 ? "\(value / 1_000)K" : "\(value)"
    }

    // MARK: - Studio

    /// Entry point to the video production surface.
    private var studioCard: some View {
        Button {
            Haptics.tap()
            showStudio = true
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Theme.accentGradient)
                        .frame(width: 46, height: 46)
                    Image(systemName: "film.stack")
                        .font(.system(size: 19, weight: .semibold))
                        .foregroundStyle(Theme.canvas)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text("Render studio")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Text(activeRenderLabel)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)

                if !engine.activeRenders.isEmpty {
                    LiveDot()
                }

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

    private var activeRenderLabel: String {
        let active = engine.activeRenders.count
        if active > 0 {
            return "\(active) render\(active == 1 ? "" : "s") in production"
        }
        return "Pipeline settings, masters and publishing"
    }

    // MARK: - Fleets

    private var fleetSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ACTIVE TASK FLEETS")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            VStack(spacing: 12) {
                ForEach(engine.fleets) { fleet in
                    NavigationLink(value: fleet) {
                        FleetRow(fleet: fleet)
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }
        }
    }

    // MARK: - Capacity

    private var capacityCard: some View {
        let slots = registry.plan.concurrentSlots
        let used = min(1, Double(engine.runningNow) / Double(max(1, slots)))
        let atCapacity = used >= 0.995
        let tint = atCapacity ? Theme.warning : registry.accent

        return HStack(spacing: 16) {
            ZStack {
                GlowRing(progress: used, diameter: 76, lineWidth: 8)
                Image(systemName: "server.rack")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(tint)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("\(registry.plan.title) capacity")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                Text("\(slots.formatted(.number.grouping(.automatic))) concurrent slots · chain ≤ \(registry.plan.maxChainSteps)")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                GlowBar(progress: used)
                Text(atCapacity ? "At capacity — raise the plan" : "\(Int(used * 100))% in use")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(tint)
                    .monospacedDigit()
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .integravCard(highlight: true)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(registry.plan.title) capacity, \(Int(used * 100)) percent of \(slots) concurrent slots in use")
    }
}

/// One fleet row: icon, name, units delivered, progress, and completion share.
struct FleetRow: View {
    let fleet: TaskFleet

    var body: some View {
        HStack(spacing: 14) {
            KindBadge(
                kind: fleet.kind,
                size: 48,
                accent: fleet.kind == .security ? Theme.magenta : Theme.violet
            )

            VStack(alignment: .leading, spacing: 6) {
                Text(fleet.name)
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                Text("\(fleet.completedUnits.formatted(.number.grouping(.automatic))) \(fleet.unit)")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .monospacedDigit()
                GlowBar(progress: fleet.progress)
            }

            Text("\(Int(fleet.progress * 100))%")
                .font(.title3.weight(.bold))
                .foregroundStyle(fleet.kind == .security ? Theme.magenta : Theme.violet)
                .monospacedDigit()

            Image(systemName: "chevron.right")
                .font(.footnote.weight(.bold))
                .foregroundStyle(Theme.textSecondary)
        }
        .padding(14)
        .integravCard()
        .contentShape(.rect)
    }
}
