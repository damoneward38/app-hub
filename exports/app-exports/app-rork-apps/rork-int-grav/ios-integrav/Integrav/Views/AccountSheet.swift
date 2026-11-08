import SwiftUI

/// The account desk. Signing in with an email and password binds this device's
/// licence, rig, chains and audit trail to a Supabase row set that is yours
/// alone. The form itself lives on the sign-in screen, so this sheet points at
/// it rather than keeping a second copy that could drift out of step.
struct AccountSheet: View {
    @Environment(AuthManager.self) private var auth
    @Environment(CloudSync.self) private var cloud
    @Environment(RegistryStore.self) private var registry
    @Environment(TwinStore.self) private var twin
    @Environment(AvatarStore.self) private var avatar
    @Environment(\.dismiss) private var dismiss

    /// The same flag the root reads. Clearing it hands the user back to the
    /// sign-in screen instead of leaving them on a signed-out account desk
    /// with no way through to the form.
    @AppStorage("integrav.localonly.v1") private var isLocalOnly: Bool = false

    @State private var confirmSignOut: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        if auth.isLoading {
                            loading
                        } else if let user = auth.user {
                            identityCard(user)
                            syncCard
                            mirrorCard
                            signOutButton
                        } else {
                            pitch
                            signedOutActions
                            mirrorCard
                        }
                    }
                    .padding(.horizontal, 18)
                    .padding(.top, 10)
                    .padding(.bottom, 30)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
        .alert("Sign out?", isPresented: $confirmSignOut) {
            Button("Sign out", role: .destructive) {
                Task { await auth.signOut() }
            }
            Button("Stay", role: .cancel) { }
        } message: {
            Text("Your data stays on this device and in the cloud. Sign in again to reconnect them.")
        }
        .alert("Sign in failed", isPresented: Binding(
            get: { auth.showError },
            set: { if !$0 { auth.dismissError() } }
        )) {
            Button("OK") { auth.dismissError() }
        } message: {
            Text(auth.errorMessage)
        }
    }

    private var accent: Color { registry.accent }

    // MARK: - Signed out

    private var loading: some View {
        HStack(spacing: 12) {
            ProgressView().tint(accent)
            Text("Checking your session…")
                .font(.subheadline)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
    }

    private var pitch: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: "icloud.and.arrow.up")
                .font(.system(size: 26, weight: .semibold))
                .foregroundStyle(accent)

            Text("Take your twin with you")
                .font(.title2.weight(.bold))
                .foregroundStyle(Theme.textPrimary)

            Text("Intégrav runs offline first. Sign in and the same licence, rig, chains and audit trail follow you onto every device on your account.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .integravCard(highlight: true)
    }

    /// Signing in happens on the sign-in screen, which is reached by leaving
    /// device-only mode. Rebuilding the email and password form here would mean
    /// two forms to keep correct and one of them going quietly stale.
    private var signedOutActions: some View {
        VStack(spacing: 10) {
            Button {
                Haptics.tap()
                isLocalOnly = false
                dismiss()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "person.crop.circle.badge.plus")
                    Text("Sign in or create an account").font(.headline)
                }
                .foregroundStyle(Theme.canvas)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(Capsule().fill(Theme.accentGradient))
                .glow(accent, radius: 16, opacity: 0.45)
            }
            .buttonStyle(PressableButtonStyle())

            Text("You're working on this device only. Signing in keeps this work and carries it to your other phones.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: - Signed in

    private func identityCard(_ user: AuthManager.User) -> some View {
        HStack(spacing: 14) {
            avatarBubble(user)

            VStack(alignment: .leading, spacing: 3) {
                Text(user.displayName)
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                if !user.email.isEmpty {
                    Text(user.email)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                }
                Text(registry.plan.title.uppercased() + " · " + registry.quote.totalLabel + "/mo")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(accent)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    private func avatarBubble(_ user: AuthManager.User) -> some View {
        Color(Theme.surfaceHigh)
            .frame(width: 54, height: 54)
            .overlay {
                Group {
                    if let picture = user.picture, let url = URL(string: picture) {
                        AsyncImage(url: url) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: {
                            initials(user)
                        }
                    } else {
                        initials(user)
                    }
                }
                .allowsHitTesting(false)
            }
            .clipShape(Circle())
            .overlay(Circle().strokeBorder(accent.opacity(0.6), lineWidth: 1.5))
    }

    private func initials(_ user: AuthManager.User) -> some View {
        Text(String(user.displayName.prefix(1)).uppercased())
            .font(.title3.weight(.bold))
            .foregroundStyle(accent)
    }

    private var syncCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Image(systemName: cloud.state.symbol)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(statusTint)
                    .symbolEffect(.pulse, isActive: cloud.state.isBusy)

                Text(cloud.state.label)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(2)

                Spacer(minLength: 0)
            }

            HStack(spacing: 10) {
                StatTile(value: "\(cloud.rowsPushed)", label: "PUSHED", tint: accent)
                StatTile(value: "\(cloud.rowsPulled)", label: "PULLED", tint: Theme.violet)
                StatTile(value: "\(cloud.inFlight)", label: "IN FLIGHT", tint: Theme.warning)
            }

            Button {
                Haptics.tap()
                Task { await cloud.syncNow(profile: auth.user) }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.triangle.2.circlepath")
                    Text(cloud.state.isBusy ? "Syncing…" : "Sync now").font(.subheadline.weight(.bold))
                }
                .foregroundStyle(Theme.canvas)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Capsule().fill(Theme.accentGradient))
                .glow(accent, radius: 14, opacity: 0.45)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(cloud.state.isBusy)
        }
        .padding(16)
        .integravCard()
    }

    private var statusTint: Color {
        switch cloud.state {
        case .synced: return Theme.success
        case .failed: return Theme.warning
        case .syncing: return accent
        default: return Theme.textSecondary
        }
    }

    /// Exactly what leaves the device — stated plainly, no hand-waving.
    private var mirrorCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("WHAT SYNCS")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            VStack(spacing: 9) {
                mirrorRow("creditcard.fill", "Licence", "\(registry.plan.title), \(registry.seats) extra seat\(registry.seats == 1 ? "" : "s"), branding")
                mirrorRow("gauge.with.needle", "Usage meters", "\(registry.usage.calls) dispatches · \(registry.usage.executions) executions")
                mirrorRow("link", "Saved chains", "\(registry.chains.count) routine\(registry.chains.count == 1 ? "" : "s")")
                mirrorRow("heart.fill", "Likes & run counts", "\(registry.likes.count) liked · \(registry.totalRuns) runs")
                mirrorRow("clock.arrow.circlepath", "Call log", "\(registry.callLog.count) audited call\(registry.callLog.count == 1 ? "" : "s")")
                mirrorRow("film.stack", "Training clips", "\(twin.videos.count) clip\(twin.videos.count == 1 ? "" : "s")")
                mirrorRow("cube.transparent.fill", "Face model", avatar.hasFace ? "Measurements + photo, private bucket" : "Nothing captured yet")
            }
            .padding(14)
            .integravCard()

            Text("Conversations stay on this device. The face photo goes to a private bucket only you can read.")
                .font(.system(size: 11))
                .foregroundStyle(Theme.textSecondary)
        }
    }

    private func mirrorRow(_ symbol: String, _ title: String, _ detail: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: symbol)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(accent)
                .frame(width: 18)
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary)
                Text(detail)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
        }
    }

    private var signOutButton: some View {
        Button(role: .destructive) {
            Haptics.tap()
            confirmSignOut = true
        } label: {
            Text("Sign out")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Theme.warning)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Capsule().fill(Theme.surfaceHigh))
        }
        .buttonStyle(PressableButtonStyle())
    }
}
