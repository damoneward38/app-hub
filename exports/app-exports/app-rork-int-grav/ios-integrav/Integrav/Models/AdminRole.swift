import Foundation

/// Who may use the operator tools.
///
/// Admin is granted by email address on the signed-in Rork account. It unlocks
/// billing overrides and the operator panel; it does not bypass authentication.
nonisolated enum AdminRole: Sendable {
    /// Accounts with operator rights, lowercased for comparison.
    nonisolated static let adminEmails: Set<String> = ["damoneward38@gmail.com"]

    nonisolated static func isAdmin(email: String?) -> Bool {
        guard let email else { return false }
        let normalised = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !normalised.isEmpty else { return false }
        return adminEmails.contains(normalised)
    }
}
