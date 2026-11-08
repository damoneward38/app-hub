import SwiftUI

/// Where the user registers their own Google OAuth client and connects a
/// YouTube channel. Credentials are theirs — nothing is baked into the binary.
struct YouTubeSettingsSheet: View {
    @Environment(ProductionStore.self) private var production
    @Environment(\.dismiss) private var dismiss

    @State private var clientID: String = ""
    @State private var clientSecret: String = ""
    @State private var showSecret: Bool = false
    @State private var showDisconnectConfirm: Bool = false

    private var isClientValid: Bool { YouTubeClient.looksLikeClientID(clientID) }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 18) {
                        if let channel = production.channel {
                            connectedCard(channel)
                        } else {
                            introCard
                        }

                        credentialsCard
                        connectCard

                        if let error = production.connectionError {
                            errorCard(error)
                        }

                        quotaCard
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("YouTube")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.magenta)
                }
            }
            .onAppear {
                clientID = production.client?.clientID ?? ""
                clientSecret = KeychainHelper.get(YouTubeService.clientSecretKey) ?? ""
            }
            .confirmationDialog(
                "Disconnect this channel?",
                isPresented: $showDisconnectConfirm,
                titleVisibility: .visible
            ) {
                Button("Disconnect", role: .destructive) {
                    Haptics.tap()
                    production.disconnect()
                }
            } message: {
                Text("Tokens are erased from the Keychain. Your client id stays saved.")
            }
        }
    }

    // MARK: - Cards

    private var introCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Bring your own OAuth client", systemImage: "key.horizontal.fill")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
            Text("Create an OAuth client in Google Cloud Console, enable the YouTube Data API v3, and paste the client id below. Uploads are charged against your own quota, not ours.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
            Link(destination: URL(string: "https://console.cloud.google.com/apis/credentials")!) {
                HStack(spacing: 5) {
                    Text("Open Google Cloud Console")
                        .font(.footnote.weight(.semibold))
                    Image(systemName: "arrow.up.right.square")
                        .font(.caption)
                }
                .foregroundStyle(Theme.violet)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    private func connectedCard(_ channel: YouTubeChannel) -> some View {
        VStack(spacing: 14) {
            HStack(spacing: 14) {
                avatar(channel)

                VStack(alignment: .leading, spacing: 4) {
                    Text(channel.title)
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    HStack(spacing: 6) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.caption2)
                            .foregroundStyle(Theme.success)
                        Text("Connected")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.success)
                    }
                    if let subscribers = channel.subscriberLabel {
                        Text("\(subscribers) subscribers · \(channel.videoCount ?? "0") videos")
                            .font(.caption)
                            .foregroundStyle(Theme.textSecondary)
                            .monospacedDigit()
                    }
                }

                Spacer(minLength: 0)
            }

            Button {
                showDisconnectConfirm = true
            } label: {
                Text("Disconnect")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.warning)
                    .frame(maxWidth: .infinity)
                    .frame(height: 46)
                    .background(Capsule().fill(Theme.surfaceHigh))
            }
            .buttonStyle(PressableButtonStyle())
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    @ViewBuilder
    private func avatar(_ channel: YouTubeChannel) -> some View {
        if let urlString = channel.thumbnailURL, let url = URL(string: urlString) {
            AsyncImage(url: url) { phase in
                if let image = phase.image {
                    image.resizable().aspectRatio(contentMode: .fill)
                } else {
                    Circle().fill(Theme.surfaceHigh)
                }
            }
            .frame(width: 54, height: 54)
            .clipShape(.circle)
        } else {
            Image(systemName: "play.rectangle.fill")
                .font(.title2)
                .foregroundStyle(Theme.magenta)
                .frame(width: 54, height: 54)
                .background(Circle().fill(Theme.surfaceHigh))
        }
    }

    private var credentialsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("OAUTH CLIENT")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            VStack(alignment: .leading, spacing: 6) {
                Text("Client ID")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                TextField("000000.apps.googleusercontent.com", text: $clientID)
                    .textFieldStyle(.plain)
                    .font(.system(.footnote, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .fill(Theme.surfaceHigh)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .strokeBorder(
                                clientID.isEmpty ? Theme.border : (isClientValid ? Theme.success : Theme.warning),
                                lineWidth: 1
                            )
                    )
                if !clientID.isEmpty && !isClientValid {
                    Text("Must end in .apps.googleusercontent.com")
                        .font(.caption2)
                        .foregroundStyle(Theme.warning)
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Client secret")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                    Spacer()
                    Text("Desktop clients only")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary.opacity(0.7))
                }
                HStack(spacing: 8) {
                    Group {
                        if showSecret {
                            TextField("GOCSPX-…", text: $clientSecret)
                        } else {
                            SecureField("GOCSPX-…", text: $clientSecret)
                        }
                    }
                    .textFieldStyle(.plain)
                    .font(.system(.footnote, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                    Button {
                        showSecret.toggle()
                    } label: {
                        Image(systemName: showSecret ? "eye.slash" : "eye")
                            .font(.footnote)
                            .foregroundStyle(Theme.textSecondary)
                            .frame(width: 44, height: 44)
                            .contentShape(.rect)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(showSecret ? "Hide secret" : "Show secret")
                }
                .padding(.leading, 12)
                .background(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .fill(Theme.surfaceHigh)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .strokeBorder(Theme.border, lineWidth: 1)
                )

                Label("Stored in the Keychain, never in a backup-readable file.", systemImage: "lock.shield")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }

            Button {
                Haptics.tap()
                production.saveClient(clientID: clientID, secret: clientSecret)
            } label: {
                Text("Save credentials")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(isClientValid ? Theme.canvas : Theme.textSecondary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(
                        Capsule().fill(isClientValid
                                       ? AnyShapeStyle(Theme.accentGradient)
                                       : AnyShapeStyle(Theme.surfaceHigh))
                    )
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(!isClientValid)
        }
        .padding(16)
        .integravCard()
    }

    private var connectCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("CONNECTION")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            if let redirect = production.client?.redirectURI {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Redirect URI")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                    Text(redirect)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(Theme.violet)
                        .textSelection(.enabled)
                        .lineLimit(2)
                    Text("Add this to your client's authorised redirect URIs.")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }

            Button {
                Haptics.fire()
                Task { await production.connect() }
            } label: {
                HStack(spacing: 8) {
                    if production.isConnecting {
                        ProgressView().tint(Theme.canvas)
                    } else {
                        Image(systemName: production.isConnected ? "arrow.triangle.2.circlepath" : "play.rectangle.fill")
                    }
                    Text(production.isConnecting
                         ? "Waiting for Google…"
                         : (production.isConnected ? "Reconnect channel" : "Connect YouTube channel"))
                        .font(.subheadline.weight(.bold))
                }
                .foregroundStyle(canConnect ? Theme.canvas : Theme.textSecondary)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(
                    Capsule().fill(canConnect
                                   ? AnyShapeStyle(Theme.accentGradient)
                                   : AnyShapeStyle(Theme.surfaceHigh))
                )
                .glow(Theme.magenta, radius: 14, opacity: canConnect ? 0.45 : 0)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(!canConnect)

            if !canConnect {
                Text("Save a valid client id first.")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(16)
        .integravCard()
    }

    private var canConnect: Bool {
        (production.client?.isValid ?? false) && !production.isConnecting
    }

    private func errorCard(_ message: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(Theme.warning)
            Text(message)
                .font(.footnote)
                .foregroundStyle(Theme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .fill(Theme.warning.opacity(0.12))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .strokeBorder(Theme.warning.opacity(0.4), lineWidth: 1)
        )
    }

    private var quotaCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Upload quota", systemImage: "gauge.with.needle")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Text("Each upload costs about 1,600 units of the default 10,000/day allowance — roughly six videos. Unverified API projects have uploads forced to private regardless of the privacy you pick.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }
}
