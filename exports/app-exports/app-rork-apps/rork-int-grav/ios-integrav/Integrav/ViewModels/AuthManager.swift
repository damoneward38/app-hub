import Foundation
import Observation
import Supabase

/// Email and password sign-in for Intégrav, on native Supabase Auth.
///
/// The account is what turns the local licence into a synced one — every table
/// in Supabase is keyed to this user and guarded by row-level security against
/// `auth.uid()`. Supabase owns the session: it stores and refreshes the tokens
/// itself, and `authStateChanges` is the single source of truth for who is
/// signed in, so nothing here has to poll or hand-roll a refresh.
@Observable
final class AuthManager {
    static let shared = AuthManager()

    nonisolated struct User: Codable, Sendable, Equatable {
        let id: String
        let email: String
        let name: String?
        let picture: String?

        nonisolated var displayName: String {
            if let name, !name.isEmpty { return name }
            return email.isEmpty ? "Signed in" : email
        }
    }

    /// What the sign-in screen is currently asking for.
    enum Mode: String, CaseIterable, Identifiable, Sendable {
        case signIn
        case signUp

        var id: String { rawValue }

        var title: String {
            switch self {
            case .signIn: return "Sign in"
            case .signUp: return "Create account"
            }
        }

        var action: String {
            switch self {
            case .signIn: return "Sign in"
            case .signUp: return "Create account"
            }
        }
    }

    private(set) var user: User?
    private(set) var isLoading: Bool = true
    private(set) var isSigningIn: Bool = false
    var showError: Bool = false
    private(set) var errorMessage: String = ""

    /// Set when a new account exists but its email has not been confirmed yet,
    /// so the screen can say where the link went instead of looking like a
    /// sign-up that silently did nothing.
    private(set) var confirmationSentTo: String?
    /// Set after a password reset link goes out.
    private(set) var resetSentTo: String?

    var isSignedIn: Bool { user != nil }
    /// False when the build carries no Supabase credentials — the app then
    /// stays entirely local rather than showing a sign-in that cannot work.
    var isAvailable: Bool { Backend.client != nil }

    private var watchTask: Task<Void, Never>?

    /// The longest the launch screen waits on the session store before showing
    /// the sign-in screen. A modal wait needs a way out, including this one.
    private static let sessionResolveTimeout: Duration = .seconds(5)

    private init() {
        start()
    }

    // MARK: - Session

    private func start() {
        AuthManager.retireLegacyRorkSession()

        guard let client = Backend.client else {
            isLoading = false
            return
        }

        watchTask = Task { [weak self] in
            for await change in client.auth.authStateChanges {
                guard let self else { return }
                self.apply(session: change.session)
                self.isLoading = false
            }
        }

        // Supabase emits the stored session almost immediately, but launch must
        // never hang on it: an unreadable session store would otherwise leave
        // the app on the launch screen with nothing to tap.
        Task { [weak self] in
            try? await Task.sleep(for: AuthManager.sessionResolveTimeout)
            self?.isLoading = false
        }
    }

    private func apply(session: Session?) {
        guard let account = session?.user else {
            if user != nil {
                user = nil
                CloudSync.shared.signedOut()
            }
            return
        }

        // Postgres renders `auth.uid()::text` in lowercase, and every RLS
        // policy compares against it. Foundation's `uuidString` is uppercase,
        // so writing it unchanged would key every row to an id the policies
        // reject — the rows would insert as nobody's and read back as empty.
        let mapped = User(
            id: account.id.uuidString.lowercased(),
            email: account.email ?? "",
            name: nil,
            picture: nil
        )

        guard mapped != user else { return }
        user = mapped
        Task { await CloudSync.shared.signedIn(as: mapped) }
    }

    // MARK: - Email and password

    func signIn(email: String, password: String) async {
        guard let client = Backend.client else {
            setError("Sign-in isn't configured for this build.")
            return
        }
        let address = AuthManager.normalise(email)
        guard AuthManager.isValidEmail(address) else {
            setError("Enter a valid email address.")
            return
        }
        guard !password.isEmpty else {
            setError("Enter your password.")
            return
        }

        isSigningIn = true
        defer { isSigningIn = false }

        do {
            _ = try await client.auth.signIn(email: address, password: password)
            confirmationSentTo = nil
            resetSentTo = nil
            Haptics.success()
        } catch {
            setError(AuthManager.friendly(error))
        }
    }

    func signUp(email: String, password: String) async {
        guard let client = Backend.client else {
            setError("Sign-in isn't configured for this build.")
            return
        }
        let address = AuthManager.normalise(email)
        guard AuthManager.isValidEmail(address) else {
            setError("Enter a valid email address.")
            return
        }
        if let problem = AuthManager.passwordProblem(password) {
            setError(problem)
            return
        }

        isSigningIn = true
        defer { isSigningIn = false }

        do {
            let response = try await client.auth.signUp(email: address, password: password)
            resetSentTo = nil
            if response.session == nil {
                // The project requires email confirmation, so there is no
                // session yet. Saying so beats a form that appears to do
                // nothing when the button is pressed.
                confirmationSentTo = address
            } else {
                confirmationSentTo = nil
                Haptics.success()
            }
        } catch {
            setError(AuthManager.friendly(error))
        }
    }

    func sendPasswordReset(email: String) async {
        guard let client = Backend.client else {
            setError("Sign-in isn't configured for this build.")
            return
        }
        let address = AuthManager.normalise(email)
        guard AuthManager.isValidEmail(address) else {
            setError("Enter your email address first, then tap reset.")
            return
        }

        isSigningIn = true
        defer { isSigningIn = false }

        do {
            try await client.auth.resetPasswordForEmail(address)
            resetSentTo = address
        } catch {
            setError(AuthManager.friendly(error))
        }
    }

    func signOut() async {
        if let client = Backend.client {
            try? await client.auth.signOut()
        }
        user = nil
        confirmationSentTo = nil
        resetSentTo = nil
        CloudSync.shared.signedOut()
    }

    func dismissError() {
        showError = false
        errorMessage = ""
    }

    /// Clears the "check your inbox" notices when the user edits the form.
    func clearNotices() {
        confirmationSentTo = nil
        resetSentTo = nil
    }

    // MARK: - Validation

    nonisolated static func normalise(_ email: String) -> String {
        email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }

    nonisolated static func isValidEmail(_ email: String) -> Bool {
        // One @, something either side, and a dot in the domain. Deliberately
        // loose: the confirmation email is the real check, and a strict regex
        // mostly succeeds at rejecting valid addresses.
        let parts = email.split(separator: "@", omittingEmptySubsequences: false)
        guard parts.count == 2, !parts[0].isEmpty else { return false }
        let domain = parts[1]
        guard domain.contains("."), !domain.hasPrefix("."), !domain.hasSuffix(".") else { return false }
        return !email.contains(" ")
    }

    /// Supabase's own floor is six characters; eight is this app's, stated up
    /// front rather than discovered by having the server refuse the form.
    nonisolated static let minimumPasswordLength = 8

    nonisolated static func passwordProblem(_ password: String) -> String? {
        if password.count < minimumPasswordLength {
            return "Use at least \(minimumPasswordLength) characters for your password."
        }
        return nil
    }

    // MARK: - Leaving Rork Auth behind

    /// Retires the previous Rork Auth session, once, on first launch after the
    /// move to Supabase Auth.
    ///
    /// The old tokens are useless now — Supabase no longer accepts them — but
    /// the id inside one is not: every record on this device was encrypted
    /// under it. It is handed to `SecureStore` so the first sign-in on the new
    /// system can carry that work forward instead of stranding it, and the
    /// tokens themselves are deleted rather than left lying in the Keychain.
    private static func retireLegacyRorkSession() {
        let legacyAccessToken = "access_token"
        let legacyRefreshToken = "refresh_token"

        if let token = KeychainHelper.get(legacyAccessToken),
           let subject = AuthManager.subject(fromToken: token) {
            SecureStore.shared.retire(identity: subject)
        }

        KeychainHelper.delete(legacyAccessToken)
        KeychainHelper.delete(legacyRefreshToken)
        UserDefaults.standard.removeObject(forKey: "RORK_AUTH_REFRESH_TOKEN")
    }

    /// Reads the `sub` claim out of a JWT, ignoring expiry.
    ///
    /// Expiry is irrelevant here: the token is being retired either way, and
    /// the only thing wanted from it is the identity its records were sealed
    /// under. Refusing an expired token would strand exactly the users this
    /// exists to rescue.
    nonisolated static func subject(fromToken token: String) -> String? {
        let parts = token.split(separator: ".")
        guard parts.count == 3 else { return nil }

        var base64 = String(parts[1])
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        while base64.count % 4 != 0 { base64.append("=") }

        guard let data = Data(base64Encoded: base64),
              let payload = try? JSONDecoder().decode(JWTSubject.self, from: data),
              !payload.sub.isEmpty else { return nil }
        return payload.sub
    }

    // MARK: - Errors

    private func setError(_ message: String) {
        errorMessage = message
        showError = true
    }

    /// Supabase reports failures in server English. These are the ones a person
    /// can actually act on, rewritten as instructions rather than diagnoses.
    nonisolated static func friendly(_ error: Error) -> String {
        let text = error.localizedDescription.lowercased()

        if text.contains("invalid login credentials") {
            return "That email and password don't match an account. Check the password, or create an account."
        }
        if text.contains("email not confirmed") {
            return "Confirm your email first — the link is in your inbox."
        }
        if text.contains("already registered") || text.contains("already exists") {
            return "There's already an account with that email. Sign in instead."
        }
        if text.contains("password should be at least") || text.contains("weak password") {
            return "Use at least \(minimumPasswordLength) characters for your password."
        }
        if text.contains("rate limit") || text.contains("too many") || text.contains("security purposes") {
            return "Too many attempts just now. Wait a minute and try again."
        }
        if text.contains("offline") || text.contains("network") || text.contains("internet") || text.contains("timed out") {
            return "Couldn't reach the sign-in server. Check your connection, or use the app on this device only."
        }
        return error.localizedDescription
    }
}

// MARK: - Wire types

nonisolated private struct JWTSubject: Codable, Sendable {
    let sub: String
}
