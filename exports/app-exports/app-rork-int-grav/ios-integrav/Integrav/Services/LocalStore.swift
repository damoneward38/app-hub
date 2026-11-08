import Foundation

/// Tiny local persistence layer. Everything Intégrav keeps lives on device —
/// no server, no API keys — and every value is encrypted before it is written.
///
/// The bytes in UserDefaults are AES-GCM envelopes sealed with a key derived
/// from a Keychain master key that never leaves this device, so lifting the app
/// container off the phone yields nothing readable. See `SecureStore`.
nonisolated struct LocalStore: Sendable {
    nonisolated static let shared = LocalStore()

    private var defaults: UserDefaults { UserDefaults.standard }

    /// Requires `Codable` rather than `Decodable` because reading a value that
    /// predates encryption immediately rewrites it sealed.
    nonisolated func load<T: Codable>(_ type: T.Type, key: String) -> T? {
        guard let stored = defaults.data(forKey: key) else { return nil }

        switch SecureStore.shared.open(stored) {
        case .decrypted(let plain):
            return decode(type, from: plain, key: key)
        case .legacyPlaintext(let plain):
            // Written before storage was encrypted. Read it, then immediately
            // rewrite it sealed so it is only ever exposed once.
            let value = decode(type, from: plain, key: key)
            if let value { save(value, key: key) }
            return value
        case .unreadable:
            // Sealed by a different account on this device. Not ours to read.
            return nil
        }
    }

    nonisolated func save<T: Encodable>(_ value: T, key: String) {
        do {
            let data = try JSONEncoder().encode(value)
            guard let sealed = SecureStore.shared.seal(data) else {
                // Never silently downgrade to plaintext: dropping the write is
                // recoverable, leaking the record is not.
                #if DEBUG
                print("LocalStore refused to write \(key) unencrypted")
                #endif
                return
            }
            defaults.set(sealed, forKey: key)
        } catch {
            #if DEBUG
            print("LocalStore encode failed for \(key)")
            #endif
        }
    }

    nonisolated func remove(key: String) {
        defaults.removeObject(forKey: key)
    }

    /// Wipes every record this app owns. Used by the vault's erase button.
    nonisolated func removeAll() {
        for key in StoreKey.all { defaults.removeObject(forKey: key) }
    }

    private func decode<T: Codable>(_ type: T.Type, from data: Data, key: String) -> T? {
        do {
            return try JSONDecoder().decode(type, from: data)
        } catch {
            #if DEBUG
            print("LocalStore decode failed for \(key)")
            #endif
            return nil
        }
    }
}

nonisolated enum StoreKey {
    static let feed = "integrav.feed.v1"
    static let fleets = "integrav.fleets.v1"
    static let videos = "integrav.videos.v1"
    static let messages = "integrav.messages.v1"
    static let chains = "integrav.chains.v1"
    static let chainDraft = "integrav.chaindraft.v1"
    static let functionRuns = "integrav.functionruns.v1"
    static let callLog = "integrav.calllog.v1"
    static let planTier = "integrav.plan.v2"
    static let likes = "integrav.likes.v1"
    static let seats = "integrav.seats.v1"
    static let brand = "integrav.brand.v1"
    static let usage = "integrav.usage.v1"
    static let faceCapture = "integrav.face.v1"
    static let renderQueue = "integrav.renderqueue.v1"
    static let pipelineSettings = "integrav.pipeline.v1"
    static let youtubeClient = "integrav.youtube.client.v1"
    static let youtubeChannel = "integrav.youtube.channel.v1"
    static let importedRenders = "integrav.renders.v1"
    static let orders = "integrav.orders.v1"
    static let remoteHost = "integrav.remotehost.v1"
    /// The last bridge address that answered — remembered so it is typed once.
    static let bridgeAddress = "integrav.bridgeaddress.v1"
    /// Recorded body-mimic takes. Local only — never synced, never uploaded.
    static let mimicTakes = "integrav.mimictakes.v1"
    /// Timestamps of real dispatches, the only source for the throughput chart.
    static let dispatchHistory = "integrav.dispatchhistory.v1"
    /// Films: the scene beats, the direction, and which take is cast in each.
    static let storyboards = "integrav.storyboards.v1"

    /// Every key the app owns. Re-keying on sign-in and the vault's erase both
    /// walk this list, so a new key that is missing here would be left behind
    /// in the previous account's encryption — add to it when adding a store.
    static let all: [String] = [
        feed, fleets, videos, messages, chains, chainDraft, functionRuns,
        callLog, planTier, likes, seats, brand, usage, faceCapture,
        renderQueue, pipelineSettings, youtubeClient, youtubeChannel,
        importedRenders, orders, remoteHost, bridgeAddress, mimicTakes,
        dispatchHistory, storyboards,
    ]
}
