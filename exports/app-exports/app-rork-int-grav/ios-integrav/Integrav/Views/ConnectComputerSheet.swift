import SwiftUI

/// Pairs the phone with the computer that holds the footage and runs FFmpeg.
///
/// Two states: a setup flow (run the bridge → type the address → type the code)
/// and, once linked, a live panel showing what that computer is doing.
struct ConnectComputerSheet: View {
    @Environment(BridgeStore.self) private var bridge
    @Environment(ProductionStore.self) private var production
    @Environment(\.dismiss) private var dismiss

    @State private var address: String = ""
    @State private var code: String = ""
    @State private var showUnlinkConfirm: Bool = false
    @State private var isImporting: Bool = false
    @FocusState private var focus: Field?

    private enum Field: Hashable { case address, code }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        if bridge.isLinked {
                            linkedCard
                            remoteActivityCard
                            pullCard
                            unlinkCard
                        } else {
                            stepOneCard
                            stepTwoCard
                            privacyNote
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 40)
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle(bridge.isLinked ? "Your computer" : "Connect a computer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.magenta)
                }
            }
            .confirmationDialog(
                "Unlink this computer?",
                isPresented: $showUnlinkConfirm,
                titleVisibility: .visible
            ) {
                Button("Unlink", role: .destructive) {
                    Task { await bridge.unlink() }
                }
                Button("Keep it", role: .cancel) {}
            } message: {
                Text("The phone forgets the link and the computer stops trusting it. You'll need a new pairing code to reconnect.")
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        // The address is typed once. After that it comes back on its own.
        .onAppear {
            if address.isEmpty { address = bridge.suggestedAddress }
        }
    }

    // MARK: - Setup

    private var stepOneCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            stepHeader(1, "Start the bridge on your computer")

            Text("Open a terminal in the houly-pipe folder and run:")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)

            HStack(spacing: 10) {
                Text("python3 scripts/bridge.py")
                    .font(.system(size: 13, weight: .medium, design: .monospaced))
                    .foregroundStyle(Theme.magenta)
                    .textSelection(.enabled)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                Spacer(minLength: 0)

                Button {
                    UIPasteboard.general.string = "python3 scripts/bridge.py"
                    Haptics.tap()
                } label: {
                    Image(systemName: "doc.on.doc")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Theme.textSecondary)
                }
                .buttonStyle(.plain)
            }
            .padding(12)
            .background(Theme.canvas, in: .rect(cornerRadius: 12))

            Text("It prints an address and a six-digit code. Both are on that screen.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    private var stepTwoCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            stepHeader(2, "Type what it printed")

            VStack(alignment: .leading, spacing: 6) {
                Text("ADDRESS")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Theme.textSecondary)
                    .kerning(1.1)

                TextField("192.168.1.42:8787", text: $address)
                    .textFieldStyle(.plain)
                    .font(.system(size: 16, weight: .medium, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .keyboardType(.URL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($focus, equals: .address)
                    .submitLabel(.next)
                    .onSubmit { focus = .code }
                    .padding(12)
                    .background(Theme.canvas, in: .rect(cornerRadius: 12))

                rememberedRow
            }

            if isPublicAddress {
                // A pairing code typed against a tunnel or a public IP leaves
                // the building. That is a legitimate way to reach your own
                // machine from elsewhere, so it is a warning, not a block —
                // but it must never happen without the user being told.
                VStack(alignment: .leading, spacing: 4) {
                    Label("That address is on the open internet", systemImage: "globe.americas.fill")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.warning)
                    Text("The pairing code will travel outside your network. Fine for a tunnel you set up yourself — use https, and press P on the computer afterwards so the code cannot be reused.")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(10)
                .background(Theme.warning.opacity(0.1), in: .rect(cornerRadius: 10))
            }

            if let found = bridge.discovered {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(Theme.success)
                    Text("Found \(found.host)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Spacer(minLength: 0)
                    if !found.pairingOpen {
                        Text("code expired")
                            .font(.caption2)
                            .foregroundStyle(Theme.warning)
                    }
                }
                .padding(10)
                .background(Theme.success.opacity(0.1), in: .rect(cornerRadius: 10))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("PAIRING CODE")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Theme.textSecondary)
                    .kerning(1.1)

                TextField("000000", text: $code)
                    .textFieldStyle(.plain)
                    .font(.system(size: 26, weight: .bold, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .kerning(6)
                    .keyboardType(.numberPad)
                    .focused($focus, equals: .code)
                    .padding(12)
                    .background(Theme.canvas, in: .rect(cornerRadius: 12))
                    .onChange(of: code) { _, newValue in
                        let cleaned = RemoteAddress.normalizeCode(newValue)
                        if cleaned != newValue { code = cleaned }
                    }
            }

            if let error = bridge.pairingError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.warning)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: 10) {
                Button {
                    Haptics.tap()
                    focus = nil
                    Task { await bridge.probe(address: address) }
                } label: {
                    Group {
                        if bridge.isProbing {
                            ProgressView().tint(Theme.textPrimary)
                        } else {
                            Text("Check")
                        }
                    }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(Theme.surfaceHigh, in: .rect(cornerRadius: Theme.controlCorner))
                }
                .buttonStyle(PressableButtonStyle())
                .disabled(address.isEmpty || bridge.isProbing)

                Button {
                    Haptics.tap()
                    focus = nil
                    Task { await bridge.pair(address: address, code: code) }
                } label: {
                    Group {
                        if bridge.isPairing {
                            ProgressView().tint(.white)
                        } else {
                            Text("Link")
                        }
                    }
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
                }
                .buttonStyle(PressableButtonStyle())
                .disabled(!canLink)
                .opacity(canLink ? 1 : 0.5)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    /// The memory of the last computer that answered — either already filled in
    /// (with a way to forget it) or one tap away from being filled in.
    @ViewBuilder
    private var rememberedRow: some View {
        if let remembered = bridge.remembered {
            if remembered.address == address.trimmingCharacters(in: .whitespacesAndNewlines) {
                HStack(spacing: 6) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 10, weight: .semibold))
                    Text("Filled in from \(remembered.seenAt.formatted(.relative(presentation: .named)))")
                        .font(.caption2)
                    Spacer(minLength: 0)
                    Button("Forget") {
                        Haptics.tap()
                        bridge.forgetAddress()
                    }
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
                    .buttonStyle(.plain)
                }
                .foregroundStyle(Theme.textSecondary)
            } else {
                Button {
                    Haptics.tap()
                    address = remembered.address
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "desktopcomputer")
                            .font(.system(size: 10, weight: .semibold))
                        Text("Use \(remembered.label)")
                            .font(.caption2.weight(.semibold))
                            .lineLimit(1)
                        Text(remembered.address)
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(Theme.textSecondary)
                            .lineLimit(1)
                            .minimumScaleFactor(0.8)
                    }
                    .foregroundStyle(Theme.violet)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(Theme.violet.opacity(0.12), in: .capsule)
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
    }

    private var canLink: Bool {
        !address.isEmpty && RemoteAddress.isValidCode(code) && !bridge.isPairing
    }

    /// True once the typed address resolves to a host outside the local network.
    /// Reaching your own machine through a tunnel is legitimate, so this drives
    /// a warning rather than a block.
    private var isPublicAddress: Bool {
        guard let url = RemoteAddress.normalize(address) else { return false }
        return !RemoteAddress.isPrivateAddress(url)
    }

    private func stepHeader(_ number: Int, _ title: String) -> some View {
        HStack(spacing: 10) {
            Text("\(number)")
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(width: 24, height: 24)
                .background(Theme.violet, in: .circle)
            Text(title)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Theme.textPrimary)
            Spacer(minLength: 0)
        }
    }

    private var privacyNote: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("What this link can do", systemImage: "lock.shield")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.textPrimary)

            bullet("The phone talks straight to your computer. Nothing goes through Intégrav's servers.")
            bullet("The code works once, expires in ten minutes, and locks after five wrong tries.")
            bullet("Your computer only accepts this phone until you unlink it — from either end.")
            bullet("iOS will ask for permission to find devices on your network. That prompt is this feature.")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    private func bullet(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Circle()
                .fill(Theme.violet)
                .frame(width: 4, height: 4)
                .padding(.top, 6)
            Text(text)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: - Linked

    private var linkedCard: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Theme.success.opacity(0.14))
                    .frame(width: 66, height: 66)
                Image(systemName: bridge.isUnreachable ? "desktopcomputer.trianglebadge.exclamationmark" : "desktopcomputer")
                    .font(.system(size: 26, weight: .semibold))
                    .foregroundStyle(bridge.isUnreachable ? Theme.warning : Theme.success)
            }

            VStack(spacing: 4) {
                Text(bridge.hostLabel)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                Text(bridge.host?.shortAddress ?? "")
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(Theme.textSecondary)
            }

            HStack(spacing: 6) {
                Circle()
                    .fill(bridge.isUnreachable ? Theme.warning : Theme.success)
                    .frame(width: 7, height: 7)
                Text(bridge.isUnreachable ? "Not answering" : "Linked")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(bridge.isUnreachable ? Theme.warning : Theme.success)
            }

            if let error = bridge.linkError {
                Text(error)
                    .font(.caption2)
                    .foregroundStyle(Theme.warning)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .integravCard(highlight: true)
    }

    @ViewBuilder
    private var remoteActivityCard: some View {
        if let status = bridge.status {
            VStack(alignment: .leading, spacing: 12) {
                Text("RIGHT NOW")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Theme.textSecondary)
                    .kerning(1.1)

                if let job = status.activeJob, status.pipeline.isRunning {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(job.title)
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(Theme.textPrimary)
                            .lineLimit(1)

                        GlowBar(progress: status.pipeline.clampedProgress)

                        HStack {
                            Text(status.pipeline.stageLabel)
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                            Spacer()
                            Text("\(Int(status.pipeline.clampedProgress * 100))%")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(Theme.magenta)
                                .monospacedDigit()
                        }

                        Button(role: .destructive) {
                            Task { await bridge.cancelActive() }
                        } label: {
                            Text("Stop this render")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.warning)
                                .frame(maxWidth: .infinity, minHeight: 40)
                                .background(Theme.warning.opacity(0.12), in: .rect(cornerRadius: 12))
                        }
                        .buttonStyle(PressableButtonStyle())
                    }
                } else {
                    HStack(spacing: 8) {
                        Image(systemName: "moon.zzz")
                            .foregroundStyle(Theme.textSecondary)
                        Text(status.queuedCount > 0 ? "\(status.queuedCount) queued" : "Idle — nothing rendering")
                            .font(.caption)
                            .foregroundStyle(Theme.textSecondary)
                    }
                }

                if !status.recentJobs.isEmpty {
                    Divider().overlay(Theme.border)
                    ForEach(status.recentJobs.prefix(4)) { job in
                        HStack(spacing: 8) {
                            Image(systemName: symbol(for: job.state))
                                .font(.system(size: 11))
                                .foregroundStyle(tint(for: job.state))
                                .frame(width: 14)
                            Text(job.title)
                                .font(.caption2)
                                .foregroundStyle(Theme.textPrimary)
                                .lineLimit(1)
                            Spacer(minLength: 0)
                            Text(job.state.label)
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .integravCard()
        }
    }

    private func symbol(for state: BridgeJobState) -> String {
        switch state {
        case .done: return "checkmark.circle.fill"
        case .failed: return "xmark.octagon.fill"
        case .cancelled: return "minus.circle"
        case .running: return "circle.dotted"
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

    @ViewBuilder
    private var pullCard: some View {
        if bridge.status?.hasManifest == true {
            VStack(alignment: .leading, spacing: 10) {
                Text("There's a finished master on that computer.")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                Button {
                    Haptics.tap()
                    isImporting = true
                    Task {
                        _ = await bridge.importLatest(into: production)
                        isImporting = false
                    }
                } label: {
                    HStack(spacing: 8) {
                        if isImporting {
                            ProgressView().tint(.white)
                        } else {
                            Image(systemName: "square.and.arrow.down")
                        }
                        Text("Pull it into the gallery")
                    }
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
                }
                .buttonStyle(PressableButtonStyle())
                .disabled(isImporting)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .integravCard()
        }
    }

    private var unlinkCard: some View {
        Button {
            Haptics.tap()
            showUnlinkConfirm = true
        } label: {
            Text("Unlink this computer")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.warning)
                .frame(maxWidth: .infinity, minHeight: 50)
                .background(Theme.surface, in: .rect(cornerRadius: Theme.controlCorner))
        }
        .buttonStyle(PressableButtonStyle())
    }
}
