import Foundation
import Observation
import UIKit

/// Owns the link to the user's computer: pairing, live status, and dispatch.
///
/// The token lives in the Keychain; only the host record goes to defaults. While
/// the Render Studio is on screen this polls `/v1/status` once a second, which is
/// cheap on a LAN and makes the phone a real second screen for the render.
@Observable
final class BridgeStore {
    private(set) var host: RemoteHost?
    private(set) var status: BridgeStatus?

    private(set) var isPairing: Bool = false
    private(set) var isDispatching: Bool = false
    private(set) var pairingError: String?
    private(set) var linkError: String?

    /// One keyed frame from the computer, for judging tolerance on the phone.
    /// `previewRequest` records the settings that made it, so a stale image
    /// can never pass for the current ones.
    private(set) var previewImage: UIImage?
    private(set) var previewRequest: KeyPreviewRequest?
    private(set) var isPreviewing: Bool = false
    private(set) var previewError: String?

    /// Set when the address answers but pairing hasn't happened yet — lets the
    /// sheet confirm "yes, that's your Mac" before asking for the code.
    private(set) var discovered: BridgeHello?
    private(set) var isProbing: Bool = false

    /// The last address that answered, kept so the connect screen can fill
    /// itself in. Survives an unlink — a forgotten pairing is not a forgotten IP.
    private(set) var remembered: RememberedBridge?

    /// Consecutive poll failures. The link is only declared lost after a few, so
    /// one dropped packet doesn't unlink a working computer.
    private var pollFailures: Int = 0
    private var pollTask: Task<Void, Never>?

    private static let lostThreshold = 4

    init() {
        host = LocalStore.shared.load(RemoteHost.self, key: StoreKey.remoteHost)
        remembered = LocalStore.shared.load(RememberedBridge.self, key: StoreKey.bridgeAddress)
    }

    // MARK: - Link state

    var isLinked: Bool { host != nil && token != nil }

    /// True when we're linked but the computer has stopped answering.
    var isUnreachable: Bool { isLinked && pollFailures >= BridgeStore.lostThreshold }

    var token: String? { KeychainHelper.get(BridgeService.tokenKey) }

    /// What the address field should start with: the linked computer if there
    /// is one, otherwise the last address that answered.
    var suggestedAddress: String {
        host?.shortAddress ?? remembered?.address ?? ""
    }

    var hostLabel: String {
        guard let host else { return "No computer linked" }
        return host.hostName
    }

    var statusLine: String {
        guard let host else { return "Not linked" }
        if isUnreachable { return "\(host.shortAddress) · not answering" }
        guard let status else { return host.shortAddress }
        if let job = status.activeJob, status.pipeline.isRunning {
            return "\(status.pipeline.stageLabel) · \(job.title)"
        }
        if status.queuedCount > 0 { return "\(status.queuedCount) queued" }
        return "\(host.shortAddress) · idle"
    }

    // MARK: - Probing an address

    /// Checks an address really is a bridge, before the user hunts for the code.
    @MainActor
    func probe(address: String) async {
        discovered = nil
        pairingError = nil
        guard let origin = RemoteAddress.normalize(address) else {
            pairingError = BridgeError.badAddress.errorDescription
            return
        }
        isProbing = true
        defer { isProbing = false }
        do {
            let hello = try await BridgeService.hello(at: origin)
            discovered = hello
            remember(origin, hostName: hello.host)
        } catch {
            pairingError = error.localizedDescription
            // A server that answered with a refusal still proves the address is
            // right, so it is worth remembering; a dead socket is not.
            if let bridgeError = error as? BridgeError, case .server = bridgeError {
                remember(origin, hostName: nil)
            }
        }
    }

    // MARK: - Address memory

    /// Records an address that a computer actually answered on.
    @MainActor
    private func remember(_ origin: URL, hostName: String?) {
        let record = RememberedBridge(
            address: RemoteAddress.shortForm(origin),
            // Never overwrite a known name with an anonymous answer.
            hostName: hostName ?? (remembered?.address == RemoteAddress.shortForm(origin)
                                   ? remembered?.hostName
                                   : nil),
            seenAt: .now
        )
        remembered = record
        LocalStore.shared.save(record, key: StoreKey.bridgeAddress)
    }

    /// Drops the remembered address. The link, if there is one, is untouched.
    @MainActor
    func forgetAddress() {
        remembered = nil
        LocalStore.shared.remove(key: StoreKey.bridgeAddress)
    }

    // MARK: - Pairing

    /// Exchanges the terminal code for a token and stores the link.
    @MainActor
    func pair(address: String, code: String) async {
        pairingError = nil
        guard let origin = RemoteAddress.normalize(address) else {
            pairingError = BridgeError.badAddress.errorDescription
            return
        }
        guard RemoteAddress.isValidCode(code) else {
            pairingError = "The pairing code is the six digits shown on the computer."
            return
        }

        isPairing = true
        defer { isPairing = false }

        do {
            let response = try await BridgeService.pair(
                at: origin,
                code: code,
                deviceName: UIDevice.current.name
            )
            KeychainHelper.set(BridgeService.tokenKey, value: response.token)
            let record = RemoteHost(
                address: origin.absoluteString,
                hostName: response.host,
                deviceID: response.deviceId,
                pairedAt: .now
            )
            host = record
            LocalStore.shared.save(record, key: StoreKey.remoteHost)
            remember(origin, hostName: response.host)
            pollFailures = 0
            discovered = nil
            Haptics.success()
            await refresh()
        } catch {
            pairingError = error.localizedDescription
            // A rejected code still means the bridge was there and listening.
            if let bridgeError = error as? BridgeError, case .server = bridgeError {
                remember(origin, hostName: nil)
            }
        }
    }

    /// Drops the link. Also asks the computer to forget this phone, so a lost
    /// device can't be used again — but unlinks locally even if that call fails.
    @MainActor
    func unlink() async {
        if let host, let token, let origin = host.url {
            try? await BridgeService.revoke(at: origin, token: token, deviceID: host.deviceID)
        }
        stopPolling()
        KeychainHelper.delete(BridgeService.tokenKey)
        UserDefaults.standard.removeObject(forKey: StoreKey.remoteHost)
        host = nil
        status = nil
        discovered = nil
        linkError = nil
        pollFailures = 0
    }

    // MARK: - Live status

    /// Polls while the studio is visible. Safe to call twice.
    @MainActor
    func startPolling(interval: Duration = .seconds(1)) {
        guard isLinked, pollTask == nil else { return }
        pollTask = Task { [weak self] in
            while !Task.isCancelled {
                await self?.refresh()
                try? await Task.sleep(for: interval)
            }
        }
    }

    func stopPolling() {
        pollTask?.cancel()
        pollTask = nil
    }

    @MainActor
    func refresh() async {
        guard let host, let token, let origin = host.url else { return }
        do {
            status = try await BridgeService.status(at: origin, token: token)
            pollFailures = 0
            linkError = nil
        } catch let error as BridgeError {
            if error.isUnauthorized {
                // The computer revoked this phone — stop pretending we're linked.
                stopPolling()
                KeychainHelper.delete(BridgeService.tokenKey)
                UserDefaults.standard.removeObject(forKey: StoreKey.remoteHost)
                self.host = nil
                status = nil
                linkError = "This computer no longer recognises the phone. Pair it again."
            } else {
                pollFailures += 1
                if pollFailures >= BridgeStore.lostThreshold {
                    linkError = error.localizedDescription
                }
            }
        } catch {
            pollFailures += 1
        }
    }

    // MARK: - Dispatch

    /// Sends a render to the computer using the app's own pipeline settings.
    @MainActor
    @discardableResult
    func dispatch(settings: PipelineSettings, title: String) async -> Bool {
        await dispatch(
            configYAML: settings.configYAML(projectTitle: title),
            title: title,
            stages: settings.stagesArgument,
            limitSeconds: nil
        )
    }

    /// Sends a config the caller has already written.
    ///
    /// The storyboard builds a real timeline — named files, in and out points,
    /// per-scene keying — which the settings-only form above cannot express.
    @MainActor
    @discardableResult
    func dispatch(
        configYAML: String,
        title: String,
        stages: String,
        limitSeconds: Double?
    ) async -> Bool {
        guard let host, let token, let origin = host.url else {
            linkError = BridgeError.notLinked.errorDescription
            return false
        }
        isDispatching = true
        defer { isDispatching = false }

        do {
            _ = try await BridgeService.submit(
                at: origin,
                token: token,
                title: title,
                configYAML: configYAML,
                stages: stages,
                limitSeconds: limitSeconds
            )
            Haptics.success()
            linkError = nil
            await refresh()
            return true
        } catch {
            linkError = error.localizedDescription
            return false
        }
    }

    @MainActor
    func cancelActive() async {
        guard
            let host, let token, let origin = host.url,
            let job = status?.activeJob
        else { return }
        do {
            try await BridgeService.cancel(at: origin, token: token, jobID: job.id)
            Haptics.tap()
            await refresh()
        } catch {
            linkError = error.localizedDescription
        }
    }

    /// Pulls the finished master's manifest — and its thumbnail — into the
    /// gallery, so a render made on the computer shows up on the phone.
    @MainActor
    func importLatest(into production: ProductionStore) async -> Bool {
        guard let host, let token, let origin = host.url else {
            linkError = BridgeError.notLinked.errorDescription
            return false
        }
        do {
            let manifest = try await BridgeService.manifest(at: origin, token: token)
            let thumbnail = try? await BridgeService.thumbnail(at: origin, token: token)
            production.adopt(manifest: manifest, thumbnailData: thumbnail)
            linkError = nil
            Haptics.success()
            return true
        } catch {
            linkError = error.localizedDescription
            return false
        }
    }

    func clearErrors() {
        pairingError = nil
        linkError = nil
    }

    // MARK: - Key preview

    /// Grabs one keyed frame from the computer so the tolerance can be judged
    /// before a full render is committed to.
    @MainActor
    func previewKey(settings: GreenScreenSettings, source: String, time: Double) async {
        guard let host, let token, let origin = host.url else {
            previewError = "Connect a computer in Render Studio first."
            return
        }
        let trimmed = source.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            previewError = "Name the clip on the computer, like raw/green_take.mp4."
            return
        }

        let payload = KeyPreviewRequest(settings: settings, source: trimmed, time: time)

        isPreviewing = true
        defer { isPreviewing = false }
        do {
            let data = try await BridgeService.previewKey(
                at: origin,
                token: token,
                request: payload
            )
            guard let image = UIImage(data: data) else {
                previewError = "The computer answered with something that isn't an image."
                return
            }
            previewImage = image
            previewRequest = payload
            previewError = nil
            Haptics.success()
        } catch {
            previewImage = nil
            previewRequest = nil
            previewError = error.localizedDescription
        }
    }

    /// Drops the preview when the settings it was made with are gone.
    func clearPreview() {
        previewImage = nil
        previewRequest = nil
        previewError = nil
    }
}
