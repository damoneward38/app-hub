import CryptoKit
import Foundation

/// Encrypts everything Intégrav keeps on this device.
///
/// Two properties matter here:
///
/// 1. **Off-device access is useless.** The master key lives in the Keychain as
///    `…ThisDeviceOnly`, so it is never included in an iCloud or iTunes backup
///    and cannot be restored onto another device. A dump of the app container
///    yields ciphertext with no key anywhere in it.
/// 2. **One account cannot read another's.** The key used for a given value is
///    derived per user, so signing in as somebody else on the same phone
///    produces a different key and the previous account's records simply fail
///    to open rather than decrypting into the wrong session.
nonisolated final class SecureStore: @unchecked Sendable {
    static let shared = SecureStore()

    /// Result of trying to read a stored value.
    nonisolated enum Opened: Equatable {
        /// Written by an older build, before storage was encrypted.
        case legacyPlaintext(Data)
        /// Sealed by this identity and successfully opened.
        case decrypted(Data)
        /// Sealed by a different identity, or tampered with. Never surfaced.
        case unreadable
    }

    /// Marks a blob as one this class sealed. Anything without it predates
    /// encryption and is migrated on first read.
    nonisolated static let magic = Data([0x49, 0x47, 0x56, 0x01]) // "IGV" + version

    private static let masterKeyAccount = "integrav.vault.master.v1"
    private static let salt = Data("integrav.vault.v1".utf8)
    /// Identity used before anyone signs in.
    nonisolated static let deviceIdentity = "device-local"
    /// An identity the app can no longer sign in as, kept only so the records
    /// sealed under it can be carried to whoever signs in next.
    private static let retiredIdentityAccount = "integrav.vault.retired.v1"

    private let lock = NSLock()
    private var identity: String = SecureStore.deviceIdentity
    private var cachedKey: SymmetricKey?

    var currentIdentity: String {
        lock.lock()
        defer { lock.unlock() }
        return identity
    }

    // MARK: - Identity

    /// Records an identity the app can never produce again — currently the
    /// user id from the retired Rork Auth system.
    ///
    /// Changing sign-in systems changes the account id, and the account id is
    /// half the encryption key, so without this every twin, chain and take on
    /// the device would become permanently unreadable through no fault of the
    /// person who made them. This is not a credential: it unlocks nothing on
    /// its own, and it is useless without the device master key.
    func retire(identity: String) {
        let trimmed = identity.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, trimmed != SecureStore.deviceIdentity else { return }
        guard KeychainHelper.get(SecureStore.retiredIdentityAccount) == nil else { return }
        KeychainHelper.set(SecureStore.retiredIdentityAccount, value: trimmed)
    }

    var retiredIdentity: String? {
        KeychainHelper.get(SecureStore.retiredIdentityAccount)
    }

    private func forgetRetiredIdentity() {
        KeychainHelper.delete(SecureStore.retiredIdentityAccount)
    }

    /// Points storage at `userID`, or back at the device when signing out.
    ///
    /// Signing in for the first time carries the work done before the account
    /// existed across to the account's key. Signing out deliberately does not
    /// carry anything back: the records stay sealed under that user, so the
    /// next person to sign in on this phone starts clean instead of inheriting
    /// somebody else's twin.
    func bind(to userID: String?) {
        let next = userID.flatMap { $0.isEmpty ? nil : $0 } ?? SecureStore.deviceIdentity

        lock.lock()
        let previous = identity
        guard previous != next else {
            lock.unlock()
            return
        }
        let previousKey = resolveKeyLocked()
        identity = next
        cachedKey = nil
        let nextKey = resolveKeyLocked()
        lock.unlock()

        guard let previousKey, let nextKey else { return }
        let isFirstSignIn = previous == SecureStore.deviceIdentity
            && next != SecureStore.deviceIdentity
            && !hasReadableData(under: nextKey)
        guard isFirstSignIn else { return }

        // Records sealed under a retired identity come first. After a change of
        // sign-in system the data on disk belongs to the old account id, not to
        // the device key, so rekeying from the device key would open nothing
        // and quietly abandon everything the user had made.
        if let retired = retiredIdentity,
           let master = masterKey() {
            let retiredKey = SecureStore.derive(master: master, identity: retired)
            if hasReadableData(under: retiredKey) {
                rekeyEverything(from: retiredKey, to: nextKey)
                forgetRetiredIdentity()
                return
            }
        }

        rekeyEverything(from: previousKey, to: nextKey)
    }

    // MARK: - Sealing

    /// Encrypts `data` for the current identity. Returns `nil` only when the
    /// Keychain is unavailable, in which case the caller must not fall back to
    /// writing plaintext.
    func seal(_ data: Data) -> Data? {
        guard let key = resolveKey() else { return nil }
        return SecureStore.seal(data, with: key)
    }

    /// Reads a stored blob, reporting how it was stored so the caller can
    /// migrate legacy plaintext rather than silently dropping it.
    func open(_ stored: Data) -> Opened {
        guard stored.starts(with: SecureStore.magic) else {
            return .legacyPlaintext(stored)
        }
        guard let key = resolveKey() else { return .unreadable }
        guard let plain = SecureStore.open(stored, with: key) else { return .unreadable }
        return .decrypted(plain)
    }

    // MARK: - Pure crypto (testable without a Keychain)

    nonisolated static func seal(_ data: Data, with key: SymmetricKey) -> Data? {
        guard let sealed = try? AES.GCM.seal(data, using: key), let combined = sealed.combined else {
            return nil
        }
        return magic + combined
    }

    nonisolated static func open(_ envelope: Data, with key: SymmetricKey) -> Data? {
        guard envelope.starts(with: magic) else { return nil }
        let body = envelope.dropFirst(magic.count)
        guard let box = try? AES.GCM.SealedBox(combined: body) else { return nil }
        return try? AES.GCM.open(box, using: key)
    }

    /// Derives the key for one identity from the device master key. Two
    /// identities on the same device never share a key.
    nonisolated static func derive(master: Data, identity: String) -> SymmetricKey {
        HKDF<SHA256>.deriveKey(
            inputKeyMaterial: SymmetricKey(data: master),
            salt: salt,
            info: Data(identity.utf8),
            outputByteCount: 32
        )
    }

    // MARK: - Key material

    private func resolveKey() -> SymmetricKey? {
        lock.lock()
        defer { lock.unlock() }
        return resolveKeyLocked()
    }

    private func resolveKeyLocked() -> SymmetricKey? {
        if let cachedKey { return cachedKey }
        guard let master = masterKey() else { return nil }
        let key = SecureStore.derive(master: master, identity: identity)
        cachedKey = key
        return key
    }

    /// Fetches the device master key, generating it on first launch. Marked
    /// `ThisDeviceOnly` so it never leaves this phone through a backup.
    private func masterKey() -> Data? {
        if let existing = KeychainHelper.getData(SecureStore.masterKeyAccount), existing.count == 32 {
            return existing
        }
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else {
            return nil
        }
        let fresh = Data(bytes)
        KeychainHelper.setData(SecureStore.masterKeyAccount, value: fresh)
        // Read back rather than trusting the write: if the Keychain refused the
        // item, sealing with a key we cannot recover would destroy the data.
        guard let stored = KeychainHelper.getData(SecureStore.masterKeyAccount), stored == fresh else {
            return nil
        }
        return fresh
    }

    // MARK: - Migration

    private func hasReadableData(under key: SymmetricKey) -> Bool {
        let defaults = UserDefaults.standard
        for storeKey in StoreKey.all {
            guard let stored = defaults.data(forKey: storeKey), stored.starts(with: SecureStore.magic) else {
                continue
            }
            if SecureStore.open(stored, with: key) != nil { return true }
        }
        return false
    }

    private func rekeyEverything(from previous: SymmetricKey, to next: SymmetricKey) {
        let defaults = UserDefaults.standard
        for storeKey in StoreKey.all {
            guard let stored = defaults.data(forKey: storeKey) else { continue }
            let plain: Data?
            if stored.starts(with: SecureStore.magic) {
                plain = SecureStore.open(stored, with: previous)
            } else {
                plain = stored
            }
            guard let plain, let resealed = SecureStore.seal(plain, with: next) else { continue }
            defaults.set(resealed, forKey: storeKey)
        }
    }
}
