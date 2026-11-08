import SwiftUI

/// Vault — every piece of information Intégrav holds about you, where it lives,
/// and the two buttons that matter: take it with you, or erase it.
///
/// The rule this page exists to make visible: nothing here is shared with
/// anyone. Local rows never leave the phone. Account rows are keyed to your user
/// id and readable only by that signed-in user.
struct VaultView: View {
    @Environment(TwinStore.self) private var twin
    @Environment(AvatarStore.self) private var avatar
    @Environment(RegistryStore.self) private var registry
    @Environment(ProductionStore.self) private var production
    @Environment(MimicStore.self) private var mimic
    @Environment(BridgeStore.self) private var bridge
    @Environment(AuthManager.self) private var auth
    @Environment(CloudSync.self) private var cloud

    @State private var showsEraseConfirmation: Bool = false
    @State private var eraseSummary: String?

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.4)

            ScrollView {
                VStack(spacing: 16) {
                    headerCard
                    onDeviceCard
                    accountCard
                    exportCard
                    eraseCard
                }
                .padding(.horizontal, 16)
                .padding(.top, 4)
                .padding(.bottom, 32)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Vault")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .confirmationDialog(
            "Erase everything on this phone?",
            isPresented: $showsEraseConfirmation,
            titleVisibility: .visible
        ) {
            Button("Erase everything", role: .destructive) { erase() }
            Button("Keep it", role: .cancel) {}
        } message: {
            Text("Your face model, mimic takes, training clips, conversation, call receipts and imported masters are deleted from this device. This cannot be undone.")
        }
    }

    // MARK: - Header

    private var headerCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 30))
                .foregroundStyle(Theme.success)

            Text("Private to you")
                .font(.title3.weight(.bold))
                .foregroundStyle(Theme.textPrimary)

            Text(auth.isSignedIn
                 ? "Signed in as \(auth.user?.displayName ?? "you"). Everything below belongs to that account and no one else can read it."
                 : "You are not signed in, so every item below exists only on this phone.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)

            encryptionNote
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .integravCard(highlight: true)
    }

    /// States the actual guarantee, in the terms someone worried about a lost
    /// or seized phone would ask about.
    private var encryptionNote: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "key.fill")
                .font(.caption)
                .foregroundStyle(Theme.success)
            Text(auth.isSignedIn
                 ? "Records are encrypted with a key derived from your account and a device key that is never backed up. Lifting this phone's storage, or signing in as somebody else, yields unreadable data."
                 : "Records are encrypted with a key held only by this device and never included in a backup. Lifting this phone's storage yields unreadable data.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(12)
        .background(Theme.success.opacity(0.10), in: .rect(cornerRadius: Theme.controlCorner))
    }

    // MARK: - On device

    private var onDeviceCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader("ON THIS PHONE", detail: "encrypted, never uploaded")

            row("Uploaded footage", mediaFootprint, "externaldrive.badge.checkmark")

            row("Face model", avatar.hasFace ? "1 rigged mesh + photo" : "none", "face.dashed")
            row("Mimic takes", mimic.takes.isEmpty ? "none" : "\(mimic.takes.count) recorded", "figure.walk.motion")
            row("Conversation", twin.messages.isEmpty ? "none" : "\(twin.messages.count) messages", "bubble.left.and.text.bubble.right")
            row("Imported masters", production.renders.isEmpty ? "none" : "\(production.renders.count) files", "film.stack")
            row(
                "Paired computer",
                bridge.isLinked ? "\(bridge.hostLabel) · token in keychain" : "none",
                "desktopcomputer"
            )
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - Account

    private var accountCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(
                "IN YOUR ACCOUNT",
                detail: cloud.isConfigured ? "only you can read it" : "sync is off"
            )

            if !cloud.isConfigured {
                Text("No backend is configured for this build, so nothing syncs anywhere. Every row above is on the phone and nowhere else.")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            } else if !auth.isSignedIn {
                Text("Sign in from Account to keep these in step across your own devices. Until then nothing is sent.")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                row("Training clips", "\(twin.videos.count)", "video.badge.plus")
                row("Chains", "\(registry.chains.count)", "link")
                row("Call receipts", "\(registry.callLog.count)", "list.bullet.rectangle.portrait")
                row("Liked functions", "\(registry.likes.count)", "heart.fill")
                row("Face measurements", avatar.hasFace ? "1 row" : "none", "ruler")

                HStack(spacing: 8) {
                    Image(systemName: cloud.state.symbol)
                        .font(.caption)
                        .foregroundStyle(Theme.violet)
                    Text(cloud.state.label)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                    Spacer(minLength: 0)
                    Text("↑\(cloud.rowsPushed) ↓\(cloud.rowsPulled)")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.textSecondary)
                }
                .padding(.top, 2)
            }

            Divider().overlay(Theme.border)

            Label(
                "Every row is stamped with your user id and fetched with your own session. There is no shared feed, no public profile and no other reader.",
                systemImage: "person.badge.shield.checkmark"
            )
            .font(.caption2)
            .foregroundStyle(Theme.textSecondary)
            .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - Export

    private var exportCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader("TAKE IT WITH YOU", detail: nil)
            Text("A readable copy of what this phone holds — counts, settings and your call receipts. Yours to keep.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)

            ShareLink(item: exportText, preview: SharePreview("integrav-vault.txt")) {
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up")
                    Text("Export my data")
                        .font(.subheadline.weight(.semibold))
                    Spacer(minLength: 0)
                }
                .foregroundStyle(Theme.magenta)
                .padding(.horizontal, 16)
                .frame(maxWidth: .infinity, minHeight: 50, alignment: .leading)
                .background(Theme.surfaceHigh, in: .rect(cornerRadius: Theme.controlCorner))
            }
        }
        .padding(16)
        .integravCard()
    }

    /// Plain text rather than JSON: this is for the person, not for a machine.
    private var exportText: String {
        var lines: [String] = []
        lines.append("Intégrav — what this phone holds")
        lines.append("Exported \(Date.now.formatted(date: .abbreviated, time: .shortened))")
        lines.append("")
        lines.append("Account: \(auth.user?.displayName ?? "not signed in")")
        lines.append("Face model: \(avatar.hasFace ? "captured" : "none")")
        lines.append("Mimic takes: \(mimic.takes.count)")
        for take in mimic.takes {
            lines.append("  · \(take.name) — \(take.summary)")
        }
        lines.append("Training clips: \(twin.videos.count) (\(twin.ingestedHours) hours ingested)")
        for video in twin.videos {
            lines.append("  · \(video.name) — \(video.durationLabel)")
        }
        lines.append("Conversation messages: \(twin.messages.count)")
        lines.append("Chains: \(registry.chains.count)")
        lines.append("Call receipts: \(registry.callLog.count)")
        lines.append("Imported masters: \(production.renders.count)")
        lines.append("Pipeline: \(production.settings.summary)")
        return lines.joined(separator: "\n")
    }

    // MARK: - Erase

    private var eraseCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader("ERASE", detail: nil)
            Text("Deletes the face model, mimic takes, training clips, conversation, call receipts and imported masters from this device, and unlinks the paired computer.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)

            Button(role: .destructive) {
                Haptics.tap()
                showsEraseConfirmation = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "trash.fill")
                    Text("Erase everything")
                        .font(.subheadline.weight(.bold))
                    Spacer(minLength: 0)
                }
                .foregroundStyle(Theme.warning)
                .padding(.horizontal, 16)
                .frame(maxWidth: .infinity, minHeight: 50, alignment: .leading)
                .background(Theme.warning.opacity(0.12), in: .rect(cornerRadius: Theme.controlCorner))
            }
            .buttonStyle(PressableButtonStyle())

            if let eraseSummary {
                Label(eraseSummary, systemImage: "checkmark.seal.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.success)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(16)
        .integravCard()
    }

    private func erase() {
        let removed = avatar.hasFace ? 1 : 0
        let takes = mimic.takes.count
        let clips = twin.videos.count
        let receipts = registry.callLog.count
        let masters = production.renders.count

        mimic.deleteAllTakes()
        avatar.clearFace()
        for video in twin.videos { twin.removeVideo(video) }
        twin.clearConversation()
        registry.clearLog()
        for render in production.renders { production.remove(render) }
        if bridge.isLinked {
            Task { await bridge.unlink() }
        }
        // Erase means erase: the imported files and every sealed record go too,
        // not just the rows the screens happen to display.
        MediaLibrary.removeEverything()
        LocalStore.shared.removeAll()

        Haptics.success()
        eraseSummary = "Erased \(removed) face model, \(takes) takes, \(clips) clips, \(receipts) receipts and \(masters) masters."
    }

    /// How much space the uploaded pictures and clips actually take.
    private var mediaFootprint: String {
        let bytes = MediaLibrary.bytesOnDisk()
        guard bytes > 0 else { return "none" }
        return ByteCountFormatter.string(fromByteCount: bytes, countStyle: .file)
    }

    // MARK: - Pieces

    private func sectionHeader(_ title: String, detail: String?) -> some View {
        HStack {
            Text(title)
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)
            Spacer()
            if let detail {
                Text(detail)
                    .font(.caption2)
                    .foregroundStyle(Theme.success)
            }
        }
    }

    private func row(_ title: String, _ value: String, _ symbol: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: symbol)
                .font(.caption)
                .foregroundStyle(Theme.violet)
                .frame(width: 22)
            Text(title)
                .font(.subheadline)
                .foregroundStyle(Theme.textPrimary)
            Spacer(minLength: 8)
            Text(value)
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(1)
                .truncationMode(.middle)
        }
        .accessibilityElement(children: .combine)
    }
}
