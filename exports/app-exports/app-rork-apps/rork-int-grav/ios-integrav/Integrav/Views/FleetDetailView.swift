import SwiftUI

/// Pushed detail for a single fleet — live concurrency, latency, and the
/// commands routed to it. Tab bar hidden so the fleet owns the screen.
struct FleetDetailView: View {
    @Environment(EngineStore.self) private var engine
    let fleetID: UUID

    @State private var dispatched: Bool = false

    private var fleet: TaskFleet? { engine.fleets.first { $0.id == fleetID } }

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.6)

            if let fleet {
                ScrollView {
                    VStack(spacing: 18) {
                        hero(fleet)
                        metrics(fleet)
                        dispatchButton(for: fleet.kind)
                        if fleet.kind == .render { renderQueueSection }
                        routedCommands(for: fleet.kind)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 28)
                }
            } else {
                ContentUnavailableView(
                    "Fleet offline",
                    systemImage: "bolt.slash",
                    description: Text("This fleet is no longer running.")
                )
            }
        }
        .navigationTitle(fleet?.name ?? "Fleet")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .toolbar(.hidden, for: .tabBar)
    }

    private func hero(_ fleet: TaskFleet) -> some View {
        VStack(spacing: 14) {
            KindBadge(
                kind: fleet.kind,
                size: 82,
                accent: fleet.kind == .security ? Theme.magenta : Theme.violet
            )

            Text(fleet.completedUnits.formatted(.number.grouping(.automatic)))
                .font(.system(size: 44, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.textPrimary)
                .monospacedDigit()
                .contentTransition(.numericText())

            Text("\(fleet.unit) you have run")
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)

            GlowBar(progress: fleet.progress, height: 8)
                .padding(.horizontal, 24)

            Text(fleet.concurrency > 0
                 ? "Running now · \(Int(fleet.progress * 100))% through"
                 : "Idle — dispatch something to this fleet")
                .font(.caption.weight(.medium))
                .foregroundStyle(fleet.concurrency > 0 ? Theme.magenta : Theme.textSecondary)
                .monospacedDigit()
        }
        .padding(.vertical, 24)
        .frame(maxWidth: .infinity)
        .integravCard(highlight: true)
    }

    private func metrics(_ fleet: TaskFleet) -> some View {
        HStack(spacing: 12) {
            metricTile(
                value: fleet.concurrency.formatted(.number.grouping(.automatic)),
                label: "running now",
                tint: Theme.violet
            )
            // Measured from this fleet's own finished jobs. Nothing has been
            // timed yet on a fresh install, and an em dash says so.
            metricTile(
                value: fleet.latencyMs > 0 ? "\(fleet.latencyMs)ms" : "—",
                label: "avg run time",
                tint: Theme.success
            )
        }
    }

    private func metricTile(value: String, label: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(tint)
                .monospacedDigit()
            Text(label)
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    /// Sends this fleet's standing workload straight back onto the engine.
    private func dispatchButton(for kind: TaskKind) -> some View {
        Button {
            Haptics.fire()
            engine.dispatch(command: QuickLaunch.command(for: kind))
            withAnimation(.snappy) { dispatched = true }
            Task {
                try? await Task.sleep(for: .seconds(1.6))
                withAnimation(.easeOut) { dispatched = false }
            }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: dispatched ? "checkmark" : "paperplane.fill")
                Text(dispatched ? "Dispatched" : "Dispatch to this fleet")
                    .font(.subheadline.weight(.bold))
            }
            .foregroundStyle(dispatched ? Theme.success : Theme.canvas)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(
                Capsule().fill(dispatched
                               ? AnyShapeStyle(Theme.surfaceHigh)
                               : AnyShapeStyle(Theme.accentGradient))
            )
            .glow(Theme.magenta, radius: 16, opacity: dispatched ? 0 : 0.5)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Render queue

    @ViewBuilder
    private var renderQueueSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("RENDER QUEUE")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                if engine.renderQueue.contains(where: { $0.isFinished || $0.hasFailed }) {
                    Button("Clear done") {
                        Haptics.tap()
                        withAnimation(.snappy) { engine.clearFinishedRenders() }
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.violet)
                }
            }

            if engine.renderQueue.isEmpty {
                Text("Queue is empty. Dispatch a render and every stage shows up here.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .integravCard()
            } else {
                ForEach(engine.renderQueue) { job in
                    RenderJobCard(job: job) {
                        Haptics.tap()
                        withAnimation(.snappy) { engine.removeRender(id: job.id) }
                    }
                }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: engine.renderQueue)
    }

    private func routedCommands(for kind: TaskKind) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("ROUTED COMMANDS")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            let routed = engine.feed.filter { $0.kind == kind }
            if routed.isEmpty {
                Text("Nothing dispatched to this fleet yet. Send a command from the Command tab.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .integravCard()
            } else {
                ForEach(routed) { task in
                    TaskFeedCard(task: task)
                }
            }
        }
    }
}

/// One queued render: title, format, weighted progress, and a stage tracker
/// that mirrors the houly-pipe stages.
struct RenderJobCard: View {
    let job: RenderJob
    let onRemove: () -> Void

    private var tint: Color {
        if job.hasFailed { return Theme.warning }
        return job.isFinished ? Theme.success : Theme.magenta
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(job.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(2)
                    Text("\(job.sceneCount) scenes · \(job.durationLabel) · \(job.formatLabel)")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .monospacedDigit()
                }

                Spacer(minLength: 0)

                Button(action: onRemove) {
                    Image(systemName: "xmark")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(job.isFinished ? "Remove render" : "Cancel render")
            }

            GlowBar(progress: job.overallProgress)

            HStack(spacing: 8) {
                ForEach(job.activeStages) { stage in
                    stageChip(stage)
                }
            }

            HStack {
                Label(job.statusLabel, systemImage: statusSymbol)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(tint)
                    .lineLimit(1)
                Spacer()
                Text("\(Int(job.overallProgress * 100))%")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(tint)
                    .monospacedDigit()
                    .contentTransition(.numericText())
            }
        }
        .padding(14)
        .integravCard()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(job.title), \(job.statusLabel), \(Int(job.overallProgress * 100)) percent")
    }

    private var statusSymbol: String {
        if job.hasFailed { return "exclamationmark.triangle.fill" }
        return job.isFinished ? "checkmark.circle.fill" : job.stage.symbol
    }

    private func stageChip(_ stage: RenderStage) -> some View {
        let isDone = job.isFinished || stage.order < job.stage.order
        let isCurrent = !job.isFinished && stage == job.stage
        let color: Color = isDone ? Theme.success : (isCurrent ? Theme.magenta : Theme.textSecondary)

        return VStack(spacing: 5) {
            Image(systemName: isDone ? "checkmark" : stage.symbol)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(color)
                .frame(height: 13)
            Capsule()
                .fill(color.opacity(isDone || isCurrent ? 0.9 : 0.25))
                .frame(height: 3)
        }
        .frame(maxWidth: .infinity)
        .accessibilityHidden(true)
    }
}
