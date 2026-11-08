import SwiftUI

/// The first thing the app shows.
///
/// Signing in is what makes the work durable: records are encrypted under a key
/// derived from the account, and the twin, face and licence follow that account
/// rather than this handset. Carrying on without an account stays possible —
/// being unable to reach a sign-in server should never lock somebody out of
/// their own device — but it says plainly what that costs.
struct SignInView: View {
    @Environment(AuthManager.self) private var auth

    /// Set when the user chooses to work without an account.
    @Binding var isLocalOnly: Bool

    private enum Field: Hashable {
        case email
        case password
    }

    @State private var mode: AuthManager.Mode = .signIn
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var isPasswordVisible: Bool = false
    @FocusState private var focus: Field?

    private var canSubmit: Bool {
        !email.isEmpty && !password.isEmpty && !auth.isSigningIn
    }

    var body: some View {
        ZStack {
            NeuralBackground()

            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: 28)

                    TwinOrb(diameter: 108)
                        .frame(height: 138)

                    Text("Intégrav")
                        .font(.system(size: 38, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.textPrimary)
                        .padding(.top, 4)

                    Text("Your twin, your fleets, your footage —\nsigned in and encrypted to you.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 8)

                    if auth.isAvailable {
                        modePicker
                            .padding(.top, 26)

                        credentialsCard
                            .padding(.top, 14)

                        noticeCard
                            .padding(.top, 12)

                        submitButton
                            .padding(.top, 16)

                        if mode == .signIn {
                            resetButton
                                .padding(.top, 4)
                        }
                    } else {
                        unavailableCard
                            .padding(.top, 26)
                    }

                    assurances
                        .padding(.top, 24)

                    Button {
                        Haptics.tap()
                        focus = nil
                        isLocalOnly = true
                    } label: {
                        Text("Use on this device only")
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(Theme.textSecondary)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(PressableButtonStyle())
                    .padding(.top, 10)
                    .accessibilityHint("Your work stays on this phone and is not saved to an account")

                    Text("Without an account your work stays on this phone. Lose the phone and it is gone.")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)

                    Spacer(minLength: 30)
                }
                .padding(.horizontal, 24)
                .frame(maxWidth: .infinity)
            }
            .scrollIndicators(.hidden)
            .scrollDismissesKeyboard(.interactively)
        }
        .preferredColorScheme(.dark)
        .animation(.easeInOut(duration: 0.2), value: mode)
        .animation(.easeInOut(duration: 0.2), value: auth.confirmationSentTo)
        .animation(.easeInOut(duration: 0.2), value: auth.resetSentTo)
        .alert("Sign in", isPresented: signInErrorBinding) {
            Button("OK") { auth.dismissError() }
        } message: {
            Text(auth.errorMessage)
        }
    }

    private var signInErrorBinding: Binding<Bool> {
        Binding(
            get: { auth.showError },
            set: { if !$0 { auth.dismissError() } }
        )
    }

    // MARK: - Form

    private var modePicker: some View {
        HStack(spacing: 4) {
            ForEach(AuthManager.Mode.allCases) { option in
                Button {
                    guard mode != option else { return }
                    Haptics.tap()
                    mode = option
                    auth.clearNotices()
                } label: {
                    Text(option.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(mode == option ? Theme.canvas : Theme.textSecondary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 40)
                        .background {
                            if mode == option {
                                Capsule().fill(Theme.accentGradient)
                            }
                        }
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
        .padding(4)
        .background(Capsule().fill(Theme.surface))
        .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))
    }

    private var credentialsCard: some View {
        VStack(spacing: 12) {
            fieldLabel("Email")
            TextField("", text: $email, prompt: prompt("you@studio.com"))
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .submitLabel(.next)
                .focused($focus, equals: .email)
                .onSubmit { focus = .password }
                .fieldChrome()

            fieldLabel("Password")
            HStack(spacing: 8) {
                Group {
                    if isPasswordVisible {
                        TextField("", text: $password, prompt: prompt("At least \(AuthManager.minimumPasswordLength) characters"))
                    } else {
                        SecureField("", text: $password, prompt: prompt("At least \(AuthManager.minimumPasswordLength) characters"))
                    }
                }
                .textContentType(mode == .signUp ? .newPassword : .password)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .submitLabel(.go)
                .focused($focus, equals: .password)
                .onSubmit { submit() }

                Button {
                    Haptics.tap()
                    isPasswordVisible.toggle()
                } label: {
                    Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                        .font(.footnote)
                        .foregroundStyle(Theme.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(PressableButtonStyle())
                .accessibilityLabel(isPasswordVisible ? "Hide password" : "Show password")
            }
            .fieldChrome(trailingInset: 0)

            if mode == .signUp, !password.isEmpty, let problem = AuthManager.passwordProblem(password) {
                Text(problem)
                    .font(.caption)
                    .foregroundStyle(Theme.warning)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(16)
        .integravCard()
        .onChange(of: email) { _, _ in auth.clearNotices() }
    }

    private func fieldLabel(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .foregroundStyle(Theme.textSecondary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func prompt(_ text: String) -> Text {
        Text(text).foregroundStyle(Theme.textSecondary.opacity(0.7))
    }

    // MARK: - Notices

    @ViewBuilder
    private var noticeCard: some View {
        if let address = auth.confirmationSentTo {
            notice(
                symbol: "envelope.badge.fill",
                title: "Confirm your email",
                detail: "We sent a link to \(address). Open it, then come back and sign in."
            )
        } else if let address = auth.resetSentTo {
            notice(
                symbol: "key.horizontal.fill",
                title: "Reset link sent",
                detail: "Check \(address) for a link to set a new password."
            )
        }
    }

    private func notice(symbol: String, title: String, detail: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: symbol)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.magenta)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .integravCard(highlight: true)
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    private var unavailableCard: some View {
        VStack(spacing: 8) {
            Image(systemName: "icloud.slash")
                .font(.title2)
                .foregroundStyle(Theme.textSecondary)
            Text("Accounts aren't configured in this build.")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Text("Everything still works on this device.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .integravCard()
    }

    // MARK: - Actions

    private var submitButton: some View {
        Button {
            submit()
        } label: {
            HStack(spacing: 10) {
                if auth.isSigningIn {
                    ProgressView()
                        .tint(Theme.canvas)
                } else {
                    Image(systemName: mode == .signIn ? "arrow.right.circle.fill" : "person.badge.plus")
                        .font(.headline)
                }
                Text(auth.isSigningIn ? "Working…" : mode.action)
                    .font(.headline)
            }
            .foregroundStyle(Theme.canvas)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Capsule().fill(Theme.accentGradient))
            .opacity(canSubmit ? 1 : 0.5)
            .glow(Theme.magenta, radius: 18, opacity: canSubmit ? 0.5 : 0)
        }
        .buttonStyle(PressableButtonStyle())
        .disabled(!canSubmit)
    }

    private var resetButton: some View {
        Button {
            Haptics.tap()
            focus = nil
            Task { await auth.sendPasswordReset(email: email) }
        } label: {
            Text("Forgot your password?")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)
                .padding(.vertical, 10)
        }
        .buttonStyle(PressableButtonStyle())
        .disabled(auth.isSigningIn)
    }

    private func submit() {
        guard canSubmit else { return }
        Haptics.tap()
        focus = nil
        let address = email
        let secret = password
        Task {
            switch mode {
            case .signIn: await auth.signIn(email: address, password: secret)
            case .signUp: await auth.signUp(email: address, password: secret)
            }
        }
    }

    // MARK: - Assurances

    private var assurances: some View {
        VStack(alignment: .leading, spacing: 10) {
            assurance(
                symbol: "lock.shield.fill",
                text: "Everything on this device is encrypted with a key only this device holds."
            )
            assurance(
                symbol: "icloud.and.arrow.up",
                text: "Your twin, face model and licence are saved to your account."
            )
            assurance(
                symbol: "figure.walk.motion",
                text: "Recorded body takes never leave this phone, signed in or not."
            )
        }
        .padding(16)
        .integravCard()
    }

    private func assurance(symbol: String, text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: symbol)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Theme.magenta)
                .frame(width: 20)
            Text(text)
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }
}

private extension View {
    /// The one input treatment used by both fields, so the reveal button can
    /// sit inside the same capsule as the password without a second style.
    func fieldChrome(trailingInset: CGFloat = 14) -> some View {
        self
            .font(.subheadline)
            .foregroundStyle(Theme.textPrimary)
            .tint(Theme.magenta)
            .padding(.leading, 14)
            .padding(.trailing, trailingInset)
            .frame(height: 48)
            .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(Theme.surfaceHigh))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
    }
}
