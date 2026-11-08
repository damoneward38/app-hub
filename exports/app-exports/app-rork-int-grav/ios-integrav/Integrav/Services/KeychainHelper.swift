import Foundation
import Security

/// Keychain storage for the things that must never sit in UserDefaults: auth
/// tokens and the master key that encrypts the local database.
///
/// Every item is written `ThisDeviceOnly`, which keeps it out of iCloud and
/// encrypted backups. A backup restored onto another phone therefore carries no
/// key and no session — exactly the property the encrypted store depends on.
nonisolated enum KeychainHelper {
    nonisolated static func set(_ key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }
        setData(key, value: data)
    }

    nonisolated static func get(_ key: String) -> String? {
        guard let data = getData(key) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    nonisolated static func setData(_ key: String, value: Data) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: value,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    nonisolated static func getData(_ key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return data
    }

    nonisolated static func delete(_ key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
