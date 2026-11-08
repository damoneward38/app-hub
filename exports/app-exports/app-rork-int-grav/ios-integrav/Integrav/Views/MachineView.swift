import SwiftUI

/// Machine — the paired computer, as a page.
///
/// Pairing, live pipeline status, dispatch, the job history the bridge reports
/// and the import of whatever it just finished. Previously all of this was
/// hidden inside a modal that only appeared if you found the right tile.
struct MachineView: View {
    @Environment(BridgeStore.self) private var bridge
    @Environment(ProductionStore.self) private var production
    @Environment(EngineStore.self) private var engine

    @State private var showPairing: Bool = false
    @State private var isImporting: Bool = false
    @State private var importMessage: String?

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.45)

            ScrollView {
                VStack(spacing: 16) {
                    linkCard
                    if bridge.isLinked {
                        jobCard
                        actionsCard
                        historyCard
                    } else {
                        explainerCard
                    }
                    privacyNote
                }
                .padding(.horizontal, 16)
                .padding(.top, 4)
                .padding(.bottom, 32)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Machine")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .sheet(isPresented: $showPairing) {
            ConnectComputerSheet()
        }
        .task { bridge.startPolling() }
        .onDisappear { bridge.stopPolling() }
    }

    // MARK: - Link

    private var linkCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: bridge.isLinked ? "desktopcomputer" : "desktopcomputer.trianglebadge.exclamationmark")
                    .font(.title3)
                    .foregroundStyle(statusTint)
                VStack(alignment: .leading, spacing: 2) {
                    Text(bridge.isLinked ? bridge.hostLabel : "No computer linked")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    Text(bridge.statusLine)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                }
                Spacer(minLength: 0)
                if bridge.status?.isBusy == true { LiveDot() }
            }

            HStack(spacing: 10) {
                Button {
                    Haptics.tap()
                    showPairing = true
                } label: {
                    Text(bridge.isLinked ? "Re-pair" : "Pair a computer")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(bridge.isLinked ? Theme.magenta : Theme.canvas)
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background(
                            Capsule().fill(bridge.isLinked
                                           ? AnyShapeStyle(Theme.surfaceHigh)
                                           : AnyShapeStyle(Theme.accentGradient))
                        )
                }
                .buttonStyle(PressableButtonStyle())

                if bridge.isLinked {
                    Button(role: .destructive) {
                        Haptics.tap()
                        Task { await bridge.unlink() }
                    } label: {
                        Text("Unlink")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.textSecondary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 46)
                            .background(Capsule().fill(Theme.surfaceHigh))
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }

            if let error = bridge.linkError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption2)
                    .foregroundStyle(Theme.warning)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(16)
        .integravCard(highlight: bridge.isLinked && !bridge.isUnreachable)
    }

    private var statusTint: Color {
        guard bridge.isLinked else { return Theme.textSecondary }
        return bridge.isUnreachable ? Theme.warning : Theme.success
    }

    // MARK: - Live job

    @ViewBuilder
    private var jobCard: some View {
        if let status = bridge.status, let job = status.activeJob, status.pipeline.isRunning {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text(job.title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(2)
                    Spacer(minLength: 8)
                    Text("\(Int(status.pipeline.clampedProgress * 100))%")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.magenta)
                        .monospacedDigit()
                        .contentTransition(.numericText())
                }

                GlowBar(progress: status.pipeline.clampedProgress)

                HStack {
                    Label(status.pipeline.stageLabel, systemImage: "gearshape.2.fill")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.violet)
                    Spacer()
                    if let speed = status.pipeline.speed, !speed.isEmpty {
                        Text(speed)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.textSecondary)
                            .monospacedDigit()
                    }
                }

                Button(role: .destructive) {
                    Haptics.tap()
                    Task { await bridge.cancelActive() }
                } label: {
                    Text("Stop this render")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.warning)
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .background(Theme.warning.opacity(0.12), in: .rect(cornerRadius: 12))
                }
                .buttonStyle(PressableButtonStyle())
            }
            .padding(16)
            .integravCard(highlight: true)
        }
    }

    // MARK: - Actions

    private var actionsCard: some View {
        VStack(spacing: 12) {
            Button {
                Haptics.fire()
                Task {
                    await bridge.dispatch(
                        settings: production.settings,
                        title: engine.activeRenders.first?.title ?? "Intégrav render"
                    )
                }
            } label: {
                HStack(spacing: 10) {
                    if bridge.isDispatching {
                        ProgressView().tint(.white)
                    } else {
                        Image(systemName: "paperplane.fill")
                    }
                    VStack(alignment: .leading, spacing: 1) {
                        Text("Send this look to \(bridge.hostLabel)")
                            .font(.subheadline.weight(.bold))
                            .lineLimit(1)
                        Text(production.settings.summary)
                            .font(.caption2)
                            .opacity(0.85)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    Spacer(minLength: 0)
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 16)
                .frame(maxWidth: .infinity, minHeight: 58, alignment: .leading)
                .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(bridge.isDispatching || bridge.isUnreachable)
            .opacity(bridge.isUnreachable ? 0.5 : 1)

            Button {
                Haptics.tap()
                importMessage = nil
                isImporting = true
                Task {
                    let ok = await bridge.importLatest(into: production)
                    isImporting = false
                    importMessage = ok
                        ? "Imported the latest master from \(bridge.hostLabel)."
                        : "Nothing new to import — the computer has no finished manifest."
                }
            } label: {
                HStack(spacing: 8) {
                    if isImporting {
                        ProgressView().tint(Theme.magenta)
                    } else {
                        Image(systemName: "square.and.arrow.down")
                    }
                    Text("Pull the finished master")
                        .font(.subheadline.weight(.semibold))
                    Spacer(minLength: 0)
                }
                .foregroundStyle(Theme.magenta)
                .padding(.horizontal, 16)
                .frame(maxWidth: .infinity, minHeight: 50, alignment: .leading)
                .background(Theme.surfaceHigh, in: .rect(cornerRadius: Theme.controlCorner))
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(isImporting || bridge.isUnreachable)

            if let importMessage {
                Text(importMessage)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(14)
        .integravCard()
    }

    // MARK: - History

    @ViewBuilder
    private var historyCard: some View {
        let jobs = bridge.status?.recentJobs ?? []
        VStack(alignment: .leading, spacing: 10) {
            Text("RECENT ON THIS MACHINE")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            if jobs.isEmpty {
                Text("No jobs reported yet. Anything you send from here shows up in this list with the state the computer reports.")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                ForEach(jobs) { job in
                    HStack(spacing: 10) {
                        Image(systemName: symbol(for: job.state))
                            .font(.caption)
                            .foregroundStyle(tint(for: job.state))
                            .frame(width: 20)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(job.title)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                                .lineLimit(1)
                            if let error = job.error, !error.isEmpty {
                                Text(error)
                                    .font(.caption2)
                                    .foregroundStyle(Theme.warning)
                                    .lineLimit(2)
                            }
                        }
                        Spacer(minLength: 0)
                        Text(job.state.label)
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(tint(for: job.state))
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    private func symbol(for state: BridgeJobState) -> String {
        switch state {
        case .done: return "checkmark.circle.fill"
        case .failed: return "xmark.octagon.fill"
        case .cancelled: return "slash.circle"
        case .running: return "bolt.horizontal.circle.fill"
        case .queued: return "clock"
        case .unknown: return "questionmark.circle"
        }
    }

    private func tint(for state: BridgeJobState) -> Color {
        switch state {
        case .done: return Theme.success
        case .failed: return Theme.warning
        case .running: return Theme.magenta
        default: return Theme.textSecondary
        }
    }

    // MARK: - Explainer & privacy

    private var explainerCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("What a linked computer does")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Theme.textPrimary)
            bullet("Runs FFmpeg and the keyer — the heavy work never happens on the phone.")
            bullet("Keys one test frame on demand so you can judge the chroma settings before committing to a full render.")
            bullet("Reports live progress per stage while it works.")
            bullet("Hands back the finished master and its manifest.")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    private func bullet(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Circle()
                .fill(Theme.magenta)
                .frame(width: 5, height: 5)
                .padding(.top, 6)
            Text(text)
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var privacyNote: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "lock.shield.fill")
                .foregroundStyle(Theme.success)
            Text("The phone talks to your computer directly over your own network, with a token held in the keychain. No footage passes through Intégrav's servers.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(14)
        .integravCard()
    }
}
