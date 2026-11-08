import Foundation
import Observation
import UIKit

/// Keeps the on-device state and the Supabase tables in step.
///
/// Intégrav still runs offline first: every store writes to disk immediately and
/// the cloud is a mirror. Signing in merges both directions (union for lists,
/// highest count for meters, newest for the licence and the rig) so two devices
/// on one account converge instead of clobbering each other.
@Observable
final class CloudSync {
    static let shared = CloudSync()

    enum State: Equatable {
        case unconfigured
        case signedOut
        case syncing
        case synced(Date)
        case failed(String)

        var isBusy: Bool { self == .syncing }

        var label: String {
            switch self {
            case .unconfigured: return "Local only"
            case .signedOut: return "Not signed in"
            case .syncing: return "Syncing…"
            case .synced(let date): return "Synced \(date.formatted(date: .omitted, time: .shortened))"
            case .failed(let message): return message
            }
        }

        var symbol: String {
            switch self {
            case .unconfigured: return "internaldrive"
            case .signedOut: return "icloud.slash"
            case .syncing: return "arrow.triangle.2.circlepath"
            case .synced: return "checkmark.icloud"
            case .failed: return "exclamationmark.icloud"
            }
        }
    }

    private(set) var state: State = Backend.isConfigured ? .signedOut : .unconfigured
    private(set) var userID: String?
    private(set) var inFlight: Int = 0
    /// Rows written to Supabase in this session — shown live in the account sheet.
    private(set) var rowsPushed: Int = 0
    private(set) var rowsPulled: Int = 0

    var isSignedIn: Bool { userID != nil }
    var isConfigured: Bool { Backend.isConfigured }

    private weak var registry: RegistryStore?
    private weak var twin: TwinStore?
    private weak var avatar: AvatarStore?

    private var usageTask: Task<Void, Never>?

    private init() {}

    // MARK: - Wiring

    func attach(registry: RegistryStore, twin: TwinStore, avatar: AvatarStore) {
        self.registry = registry
        self.twin = twin
        self.avatar = avatar
    }

    // MARK: - Session

    func signedIn(as user: AuthManager.User) async {
        guard Backend.isConfigured else {
            state = .unconfigured
            return
        }
        userID = user.id
        await syncNow(profile: user)
    }

    func signedOut() {
        usageTask?.cancel()
        usageTask = nil
        userID = nil
        state = Backend.isConfigured ? .signedOut : .unconfigured
    }

    /// Full two-way reconciliation. Safe to call repeatedly.
    func syncNow(profile: AuthManager.User? = nil) async {
        guard Backend.isConfigured else {
            state = .unconfigured
            return
        }
        guard let userID else {
            state = .signedOut
            return
        }

        state = .syncing
        do {
            if let profile {
                try await CloudAPI.upsertProfile(
                    id: profile.id,
                    email: profile.email,
                    name: profile.name,
                    avatarUrl: profile.picture
                )
                rowsPushed += 1
            }

            try await reconcileLicence(userID: userID)
            try await reconcileUsage(userID: userID)
            try await reconcileChains(userID: userID)
            try await reconcileLikes(userID: userID)
            try await reconcileRuns(userID: userID)
            try await reconcileCallLog(userID: userID)
            try await reconcileClips(userID: userID)
            try await reconcileFace(userID: userID)

            state = .synced(.now)
        } catch {
            state = .failed(CloudSync.message(for: error))
            #if DEBUG
            print("CloudSync failed: \(error)")
            #endif
        }
    }

    // MARK: - Reconcilers

    private func reconcileLicence(userID: String) async throws {
        guard let registry else { return }
        if let remote = try await CloudAPI.fetchLicence(userId: userID) {
            rowsPulled += 1
            registry.applyCloudLicence(tier: remote.tier, seats: remote.seats, brand: remote.brand)
        } else {
            try await CloudAPI.saveLicence(
                LicenceRow(userId: userID, plan: registry.plan, seats: registry.seats, brand: registry.brand)
            )
            rowsPushed += 1
        }
    }

    private func reconcileUsage(userID: String) async throws {
        guard let registry else { return }
        let local = registry.usage
        if let remote = try await CloudAPI.fetchUsage(userId: userID, periodStart: local.periodStart)?.window,
           remote.periodStart == local.periodStart {
            rowsPulled += 1
            let merged = UsageWindow(
                periodStart: local.periodStart,
                calls: max(local.calls, remote.calls),
                executions: max(local.executions, remote.executions)
            )
            registry.applyCloudUsage(merged)
        }
        try await CloudAPI.saveUsage(userId: userID, window: registry.usage)
        rowsPushed += 1
    }

    private func reconcileChains(userID: String) async throws {
        guard let registry else { return }
        let remote = try await CloudAPI.fetchChains(userId: userID).map(\.chain)
        rowsPulled += remote.count

        let remoteIDs = Set(remote.map(\.id))
        let localOnly = registry.chains.filter { !remoteIDs.contains($0.id) }
        for chain in localOnly {
            try await CloudAPI.saveChain(chain, userId: userID)
            rowsPushed += 1
        }

        let merged = (remote + localOnly).sorted { $0.createdAt > $1.createdAt }
        registry.applyCloudChains(merged)
    }

    private func reconcileLikes(userID: String) async throws {
        guard let registry else { return }
        let remote = Set(try await CloudAPI.fetchLikes(userId: userID))
        rowsPulled += remote.count

        for name in registry.likes.subtracting(remote) {
            try await CloudAPI.like(name, userId: userID)
            rowsPushed += 1
        }
        registry.applyCloudLikes(remote.union(registry.likes))
    }

    private func reconcileRuns(userID: String) async throws {
        guard let registry else { return }
        let remote = try await CloudAPI.fetchRuns(userId: userID)
        rowsPulled += remote.count

        var merged = registry.runs
        for (name, count) in remote {
            merged[name] = max(merged[name] ?? 0, count)
        }
        registry.applyCloudRuns(merged)

        let changed = merged.filter { remote[$0.key] != $0.value }
        try await CloudAPI.saveRuns(changed, userId: userID)
        rowsPushed += changed.count
    }

    private func reconcileCallLog(userID: String) async throws {
        guard let registry else { return }
        let remote = try await CloudAPI.fetchCalls(userId: userID).map(\.entry)
        rowsPulled += remote.count

        let remoteIDs = Set(remote.map(\.id))
        let localOnly = Array(registry.callLog.filter { !remoteIDs.contains($0.id) }.prefix(200))
        try await CloudAPI.saveCalls(localOnly, userId: userID)
        rowsPushed += localOnly.count

        let merged = (remote + localOnly)
            .sorted { $0.calledAt > $1.calledAt }
            .prefix(400)
        registry.applyCloudCallLog(Array(merged))
    }

    private func reconcileClips(userID: String) async throws {
        guard let twin else { return }
        let remote = try await CloudAPI.fetchClips(userId: userID).map(\.video)
        rowsPulled += remote.count

        let remoteIDs = Set(remote.map(\.id))
        let localOnly = twin.videos.filter { !remoteIDs.contains($0.id) }
        try await CloudAPI.saveClips(localOnly, userId: userID)
        rowsPushed += localOnly.count

        let merged = (remote + localOnly).sorted { $0.addedAt > $1.addedAt }
        twin.applyCloudClips(merged)
    }

    private func reconcileFace(userID: String) async throws {
        guard let avatar else { return }

        if let local = avatar.record {
            let remote = try await CloudAPI.fetchFace(userId: userID)
            if remote == nil || remote!.capturedAt < local.capturedAt {
                let data = AvatarStore.imageData(named: local.imageFile)
                try await CloudAPI.saveFace(local, imageData: data, userId: userID)
                rowsPushed += 1
            }
            return
        }

        guard let remote = try await CloudAPI.fetchFace(userId: userID) else { return }
        rowsPulled += 1
        let data = try await CloudAPI.downloadFaceImage(userId: userID)
        avatar.adoptCloudFace(
            metrics: remote.metrics,
            capturedAt: remote.capturedAt,
            source: FaceCaptureRecord.CaptureSource(rawValue: remote.source) ?? .camera,
            imageData: data
        )
    }

    // MARK: - Pushes (fire and forget, no-ops when signed out)

    func pushLicence(plan: PlanTier, seats: Int, brand: BrandProfile) {
        write { userID in
            try await CloudAPI.saveLicence(LicenceRow(userId: userID, plan: plan, seats: seats, brand: brand))
        }
    }

    /// Meters change on every call — coalesce them into one write per second.
    func pushUsage(_ window: UsageWindow) {
        guard isSignedIn else { return }
        usageTask?.cancel()
        usageTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(1))
            guard !Task.isCancelled, let self, let userID = self.userID else { return }
            do {
                try await CloudAPI.saveUsage(userId: userID, window: window)
                self.rowsPushed += 1
                self.markSynced()
            } catch {
                self.state = .failed(CloudSync.message(for: error))
            }
        }
    }

    func pushChain(_ chain: FunctionChain) {
        write { userID in try await CloudAPI.saveChain(chain, userId: userID) }
    }

    func removeChain(_ chain: FunctionChain) {
        write { _ in try await CloudAPI.deleteChain(id: chain.id) }
    }

    func pushLike(_ name: String, liked: Bool) {
        write { userID in
            if liked {
                try await CloudAPI.like(name, userId: userID)
            } else {
                try await CloudAPI.unlike(name, userId: userID)
            }
        }
    }

    func pushCall(_ entry: CallLogEntry, runCount: Int) {
        write { userID in
            try await CloudAPI.saveCalls([entry], userId: userID)
            try await CloudAPI.saveRun(name: entry.function, count: runCount, userId: userID)
        }
    }

    func clearCloudLog() {
        write { userID in try await CloudAPI.clearCalls(userId: userID) }
    }

    func pushClip(_ video: SourceVideo) {
        write { userID in try await CloudAPI.saveClips([video], userId: userID) }
    }

    func removeClip(_ video: SourceVideo) {
        write { _ in try await CloudAPI.deleteClip(id: video.id) }
    }

    func pushFace(_ record: FaceCaptureRecord, imageData: Data?) {
        write { userID in try await CloudAPI.saveFace(record, imageData: imageData, userId: userID) }
    }

    func removeFace() {
        write { userID in try await CloudAPI.deleteFace(userId: userID) }
    }

    // MARK: - Plumbing

    private func write(_ operation: @escaping @Sendable (String) async throws -> Void) {
        guard Backend.isConfigured, let userID else { return }
        inFlight += 1
        Task { [weak self] in
            defer { self?.inFlight = max(0, (self?.inFlight ?? 1) - 1) }
            do {
                try await operation(userID)
                self?.rowsPushed += 1
                self?.markSynced()
            } catch {
                self?.state = .failed(CloudSync.message(for: error))
                #if DEBUG
                print("CloudSync write failed: \(error)")
                #endif
            }
        }
    }

    private func markSynced() {
        if case .syncing = state { return }
        state = .synced(.now)
    }

    nonisolated private static func message(for error: Error) -> String {
        if error is CloudError { return error.localizedDescription }
        let text = error.localizedDescription
        return text.count > 120 ? "Sync failed — check the connection." : "Sync failed — \(text)"
    }
}
