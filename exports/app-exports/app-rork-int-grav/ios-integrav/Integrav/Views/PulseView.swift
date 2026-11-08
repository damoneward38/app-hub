import SwiftUI

/// Pulse — everything that is moving right now, on one wall.
///
/// The app's live state was scattered across five rooms: the rig on the stage,
/// the fleets in the task engine, the render on the machine, the calls in the
/// log. None of it answered "what is happening at this second". This does, and
/// every number on it is observed rather than decorative — where a figure is
/// unavailable it says so instead of showing a plausible zero.
struct PulseView: View {
    @Environment(EngineStore.self) private var engine
    @Environment(RegistryStore.self) private var registry
    @Environment(BridgeStore.self) private var bridge
    @Environment(TwinStore.self) private var twin

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.55)

            ScrollView {
                VStack(spacing: 16) {
                    RigPulsePanel()
                    vitals
                    fleetPanel
                    machinePanel
                    tapePanel
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
                .padding(.bottom, 30)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Pulse")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
    }

    // MARK: - Vitals

    private var vitals: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading("Vitals", detail: "this month")

            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
                spacing: 10
            ) {
                vital(
                    value: registry.callsToday.formatted(.number.grouping(.automatic)),
                    label: "calls today",
                    tint: Theme.magenta
                )
                vital(
                    value: "\(registry.uniqueFunctionsCalled)/\(registry.functions.count)",
                    label: "behaviours used",
                    tint: Theme.violet
                )
                vital(
                    // Measured on every invocation, not estimated.
                    value: registry.callLog.isEmpty ? "—" : "\(registry.averageLatencyMs)ms",
                    label: "avg call latency",
                    tint: Theme.success
                )
                vital(
                    value: "\(twin.lipSyncMs)ms",
                    label: "lip sync",
                    tint: Theme.success
                )
            }

            quotaBar(
                title: "Dispatches",
                used: registry.usage.calls,
                cap: registry.plan.monthlyCalls,
                fraction: registry.callsFraction
            )
            quotaBar(
                title: "Executions",
                used: registry.usage.executions,
                cap: registry.plan.monthlyExecutions,
                fraction: registry.executionsFraction
            )
        }
        .padding(14)
        .integravCard()
    }

    private func vital(value: String, label: String, tint: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(tint)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.surfaceHigh)
        )
    }

    private func quotaBar(title: String, used: Int, cap: Int?, fraction: Double) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                // An unlimited plan has no bar to fill, and pretending otherwise
                // would show a meter that can never move.
                Text(cap.map { "\(used.formatted(.number.grouping(.automatic))) / \($0.formatted(.number.grouping(.automatic)))" }
                     ?? "\(used.formatted(.number.grouping(.automatic))) · unlimited")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
            }
            if cap != nil {
                GlowBar(progress: fraction)
            }
        }
    }

    // MARK: - Fleets

    private var fleetPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading(
                "Fleets",
                detail: engine.activeCount > 0 ? "\(engine.activeCount) running" : "idle"
            )

            HStack(spacing: 10) {
                vital(
                    value: engine.runningNow.formatted(.number.grouping(.automatic)),
                    label: "slots held",
                    tint: Theme.magenta
                )
                vital(
                    value: "\(Int((engine.capacityUsed * 100).rounded()))%",
                    label: "of capacity",
                    tint: engine.capacityUsed > 0.85 ? Theme.warning : Theme.violet
                )
            }

            ForEach(engine.fleets) { fleet in
                HStack(spacing: 10) {
                    Image(systemName: fleet.kind.symbol)
                        .font(.footnote.weight(.bold))
                        .foregroundStyle(fleet.kind == .security ? Theme.magenta : Theme.violet)
                        .frame(width: 22)

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(fleet.name)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                            Spacer()
                            Text("\(fleet.concurrency.formatted(.number.grouping(.automatic))) · \(fleet.latencyMs)ms")
                                .font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(Theme.textSecondary)
                        }
                        GlowBar(progress: fleet.progress)
                    }
                }
            }
        }
        .padding(14)
        .integravCard()
    }

    // MARK: - Machine

    private var machinePanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading("Machine", detail: bridge.isLinked ? bridge.hostLabel : "not linked")

            if !bridge.isLinked {
                pulseNotice(
                    symbol: "desktopcomputer",
                    text: "No computer paired. Renders run there, not on the phone — pair one from Machine."
                )
            } else if bridge.isUnreachable {
                pulseNotice(
                    symbol: "wifi.slash",
                    text: "Paired, but not answering. Check the bridge is running and the phone is on the same Wi-Fi.",
                    tint: Theme.warning
                )
            } else if let status = bridge.status {
                if status.pipeline.isRunning {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            LiveDot()
                            Text(status.pipeline.stageLabel)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                            Spacer()
                            if let speed = status.pipeline.speed {
                                Text(speed)
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundStyle(Theme.success)
                            }
                        }
                        GlowBar(progress: status.pipeline.clampedProgress)
                        if let job = status.activeJob {
                            Text(job.title)
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                                .lineLimit(1)
                        }
                    }
                } else {
                    pulseNotice(
                        symbol: "checkmark.seal.fill",
                        text: status.queuedCount > 0
                            ? "\(status.queuedCount) job\(status.queuedCount == 1 ? "" : "s") queued, nothing rendering yet."
                            : "Linked and idle. Nothing rendering.",
                        tint: Theme.success
                    )
                }
            } else {
                pulseNotice(symbol: "hourglass", text: "Linked. Waiting for the first status report.")
            }
        }
        .padding(14)
        .integravCard()
    }

    private func pulseNotice(symbol: String, text: String, tint: Color = Theme.textSecondary) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: symbol)
                .font(.footnote.weight(.bold))
                .foregroundStyle(tint)
            Text(text)
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }

    // MARK: - Tape

    private var tapePanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading("Tape", detail: registry.callLog.isEmpty ? "empty" : "newest first")

            if registry.callLog.isEmpty {
                pulseNotice(
                    symbol: "waveform.path",
                    text: "Nothing called yet. Perform a behaviour on the Stage and it lands here."
                )
            } else {
                ForEach(registry.callLog.prefix(12)) { entry in
                    HStack(spacing: 10) {
                        Circle()
                            .fill(entry.chain == nil ? Theme.violet : Theme.magenta)
                            .frame(width: 6, height: 6)

                        Text(entry.function)
                            .font(.system(size: 11, weight: .semibold, design: .monospaced))
                            .foregroundStyle(Theme.textPrimary)
                            .lineLimit(1)

                        Spacer(minLength: 4)

                        Text(entry.source.label)
                            .font(.system(size: 9, weight: .bold, design: .monospaced))
                            .foregroundStyle(Theme.textSecondary)

                        Text("\(entry.durationMs)ms")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(Theme.success)
                            .frame(width: 46, alignment: .trailing)
                    }
                    .padding(.vertical, 3)
                }
            }
        }
        .padding(14)
        .integravCard()
    }

    private func sectionHeading(_ title: String, detail: String) -> some View {
        HStack {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Spacer()
            Text(detail)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1)
        }
    }
}

/// The rig's live readout, isolated so the 50 Hz pose stream re-renders this
/// strip and leaves the rest of the wall alone.
private struct RigPulsePanel: View {
    @Environment(StageStore.self) private var stage

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 7) {
                    if stage.isMoving { LiveDot() }
                    Text("Rig")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                }
                Spacer()
                Text(stage.isRunning ? "\(Int(stage.frameRate.rounded())) fps" : "asleep")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundStyle(stage.frameRate > 30 ? Theme.success : Theme.warning)
            }

            Text(stage.statusLine)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1)
                .truncationMode(.middle)

            // Four real morph weights, drawn as a live equaliser.
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(stage.channels, id: \.0) { channel, value in
                    VStack(spacing: 5) {
                        GeometryReader { proxy in
                            VStack(spacing: 0) {
                                Spacer(minLength: 0)
                                RoundedRectangle(cornerRadius: 3, style: .continuous)
                                    .fill(Theme.accentGradient)
                                    .frame(height: max(2, proxy.size.height * value))
                            }
                        }
                        .frame(height: 46)
                        Text(channel.name.replacingOccurrences(of: "_", with: " "))
                            .font(.system(size: 8, design: .monospaced))
                            .foregroundStyle(Theme.textSecondary)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 4)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.surfaceHigh)
            )

            HStack(spacing: 10) {
                stat("\(stage.performedCount)", "performed")
                stat("\(stage.queuedCount)", "queued")
                stat("\(stage.trackedJoints)", "joints")
            }
        }
        .padding(14)
        .integravCard(highlight: stage.isMoving)
    }

    private func stat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.violet)
                .monospacedDigit()
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 7)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Theme.surfaceHigh)
        )
    }
}
