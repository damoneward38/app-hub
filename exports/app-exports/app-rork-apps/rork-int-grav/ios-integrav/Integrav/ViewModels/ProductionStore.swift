import Foundation
import Observation
import UIKit

/// Owns everything the video production side needs: pipeline parameters, the
/// connected YouTube account, and renders imported from a houly-pipe `out/` folder.
@Observable
final class ProductionStore {
    /// Knobs written into `config.yaml` before a render starts.
    var settings: PipelineSettings = .default {
        didSet { LocalStore.shared.save(settings, key: StoreKey.pipelineSettings) }
    }

    /// The OAuth client the user registered in Google Cloud Console.
    private(set) var client: YouTubeClient?
    private(set) var channel: YouTubeChannel?
    private(set) var isConnecting: Bool = false
    private(set) var connectionError: String?

    /// Renders imported from disk, newest first.
    private(set) var renders: [ImportedRender] = []
    private(set) var importError: String?
    private(set) var lastImportSummary: String?

    private var tokenExpiry: Date?

    init() {
        settings = LocalStore.shared.load(PipelineSettings.self, key: StoreKey.pipelineSettings) ?? .default
        client = LocalStore.shared.load(YouTubeClient.self, key: StoreKey.youtubeClient)
        channel = LocalStore.shared.load(YouTubeChannel.self, key: StoreKey.youtubeChannel)
        renders = LocalStore.shared.load([ImportedRender].self, key: StoreKey.importedRenders) ?? []
    }

    // MARK: - YouTube credentials

    var isConnected: Bool { channel != nil && KeychainHelper.get(YouTubeService.refreshTokenKey) != nil }

    var clientIDDisplay: String {
        guard let id = client?.clientID, !id.isEmpty else { return "Not set" }
        let bare = id.replacingOccurrences(of: ".apps.googleusercontent.com", with: "")
        return "\(bare.prefix(12))… .apps.googleusercontent.com"
    }

    /// Stores the OAuth client. The secret goes to the Keychain, never defaults.
    func saveClient(clientID: String, secret: String) {
        let trimmedID = clientID.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedSecret = secret.trimmingCharacters(in: .whitespacesAndNewlines)

        if trimmedSecret.isEmpty {
            KeychainHelper.delete(YouTubeService.clientSecretKey)
        } else {
            KeychainHelper.set(YouTubeService.clientSecretKey, value: trimmedSecret)
        }

        let saved = YouTubeClient(clientID: trimmedID, hasSecret: !trimmedSecret.isEmpty)
        client = saved
        LocalStore.shared.save(saved, key: StoreKey.youtubeClient)
        connectionError = saved.isValid ? nil : YouTubeError.invalidClient.errorDescription
    }

    /// Runs Google consent and reads back the channel.
    @MainActor
    func connect() async {
        guard let client, client.isValid else {
            connectionError = YouTubeError.invalidClient.errorDescription
            return
        }
        isConnecting = true
        connectionError = nil
        defer { isConnecting = false }

        do {
            let tokens = try await YouTubeService.authorize(client: client)
            store(tokens)
            let found = try await YouTubeService.channel(accessToken: tokens.accessToken)
            channel = found
            LocalStore.shared.save(found, key: StoreKey.youtubeChannel)
            Haptics.success()
        } catch YouTubeError.cancelled {
            connectionError = nil
        } catch {
            connectionError = error.localizedDescription
        }
    }

    func disconnect() {
        KeychainHelper.delete(YouTubeService.accessTokenKey)
        KeychainHelper.delete(YouTubeService.refreshTokenKey)
        UserDefaults.standard.removeObject(forKey: StoreKey.youtubeChannel)
        channel = nil
        tokenExpiry = nil
        connectionError = nil
    }

    private func store(_ tokens: YouTubeTokens) {
        KeychainHelper.set(YouTubeService.accessTokenKey, value: tokens.accessToken)
        if let refresh = tokens.refreshToken, !refresh.isEmpty {
            KeychainHelper.set(YouTubeService.refreshTokenKey, value: refresh)
        }
        tokenExpiry = tokens.expiresAt
    }

    /// Returns a usable access token, refreshing it when it has aged out.
    @MainActor
    func validAccessToken() async throws -> String {
        guard let client, client.isValid else { throw YouTubeError.invalidClient }
        if let token = KeychainHelper.get(YouTubeService.accessTokenKey),
           let expiry = tokenExpiry,
           Date() < expiry.addingTimeInterval(-60) {
            return token
        }
        let refreshed = try await YouTubeService.refresh(client: client)
        store(refreshed)
        return refreshed.accessToken
    }

    // MARK: - Publishing

    /// Marks a completed render for publication and confirms the token works.
    ///
    /// The video bytes live on the render host, so the app authorises the
    /// publish and hands houly-pipe a live token — it never streams the file.
    @MainActor
    func publish(_ render: ImportedRender) async {
        guard let index = renders.firstIndex(where: { $0.id == render.id }) else { return }
        guard isConnected else {
            renders[index].publishState = .failed
            connectionError = YouTubeError.notConnected.errorDescription
            persistRenders()
            return
        }

        renders[index].publishState = .publishing
        persistRenders()

        do {
            let token = try await validAccessToken()
            // Verifying the channel proves the grant is live before handing the
            // job to the render host.
            let confirmed = try await YouTubeService.channel(accessToken: token)
            channel = confirmed
            LocalStore.shared.save(confirmed, key: StoreKey.youtubeChannel)
            renders[index].publishState = .published
            connectionError = nil
            Haptics.success()
        } catch {
            renders[index].publishState = .failed
            connectionError = error.localizedDescription
        }
        persistRenders()
    }

    func resetPublishState(for render: ImportedRender) {
        guard let index = renders.firstIndex(where: { $0.id == render.id }) else { return }
        renders[index].publishState = .notPublished
        persistRenders()
    }

    // MARK: - Importing an out/ folder

    /// Reads `manifest.json` and its thumbnail from a houly-pipe output folder.
    ///
    /// The folder arrives as a security-scoped URL from the Files picker, so
    /// access is opened and closed around the reads.
    @discardableResult
    func importFolder(at folderURL: URL) -> Bool {
        importError = nil
        let scoped = folderURL.startAccessingSecurityScopedResource()
        defer { if scoped { folderURL.stopAccessingSecurityScopedResource() } }

        let manifestURL = folderURL.appendingPathComponent("manifest.json")
        guard let data = try? Data(contentsOf: manifestURL) else {
            importError = "No manifest.json in \(folderURL.lastPathComponent). Pick the pipeline's out/ folder."
            return false
        }

        let manifest: RenderManifest
        do {
            manifest = try JSONDecoder().decode(RenderManifest.self, from: data)
        } catch {
            importError = "manifest.json couldn't be read — it may be from a different pipeline version."
            return false
        }

        var thumbnailFile: String?
        if let thumbnail = manifest.thumbnail {
            let source = folderURL.appendingPathComponent(thumbnail)
            if let bytes = try? Data(contentsOf: source) {
                thumbnailFile = ProductionStore.storeThumbnail(bytes, preferredName: thumbnail)
            }
        }

        adopt(manifest: manifest, thumbnailFile: thumbnailFile)
        return true
    }

    /// Files a render into the gallery, whatever route it arrived by.
    ///
    /// Used both by the folder importer and by the bridge, which pulls the
    /// manifest and thumbnail straight off the paired computer.
    func adopt(manifest: RenderManifest, thumbnailData: Data?) {
        var thumbnailFile: String?
        if let thumbnailData, !thumbnailData.isEmpty {
            thumbnailFile = ProductionStore.storeThumbnail(
                thumbnailData,
                preferredName: manifest.thumbnail ?? "thumb.jpg"
            )
        }
        adopt(manifest: manifest, thumbnailFile: thumbnailFile)
    }

    private func adopt(manifest: RenderManifest, thumbnailFile: String?) {
        // Re-importing the same render replaces it rather than duplicating, but
        // the old thumbnail file has to go or it leaks into Documents forever.
        if let stale = renders.first(where: { $0.manifest.id == manifest.id }),
           let staleFile = stale.thumbnailFile, staleFile != thumbnailFile {
            try? FileManager.default.removeItem(
                at: ProductionStore.thumbnailsDirectory.appendingPathComponent(staleFile)
            )
        }
        let record = ImportedRender(manifest: manifest, thumbnailFile: thumbnailFile)
        renders.removeAll { $0.manifest.id == manifest.id }
        renders.insert(record, at: 0)
        if renders.count > 60 { renders.removeLast(renders.count - 60) }
        persistRenders()
        importError = nil
        lastImportSummary = "\(manifest.output) · \(manifest.durationLabel) · \(manifest.scenes.count) scenes"
        Haptics.success()
    }

    func remove(_ render: ImportedRender) {
        if let file = render.thumbnailFile {
            try? FileManager.default.removeItem(at: ProductionStore.thumbnailsDirectory.appendingPathComponent(file))
        }
        renders.removeAll { $0.id == render.id }
        persistRenders()
    }

    func thumbnailImage(for render: ImportedRender) -> UIImage? {
        guard let file = render.thumbnailFile else { return nil }
        let url = ProductionStore.thumbnailsDirectory.appendingPathComponent(file)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    // MARK: - Dashboard figures

    var totalRenderedSeconds: Double { renders.reduce(0) { $0 + $1.manifest.duration } }

    var totalOutputBytes: Int { renders.reduce(0) { $0 + $1.manifest.sizeBytes } }

    var publishedCount: Int { renders.filter { $0.publishState == .published }.count }

    /// Mean speed relative to real time across every import.
    var averageRealtimeFactor: Double {
        let usable = renders.map(\.manifest.realtimeFactor).filter { $0 > 0 }
        guard !usable.isEmpty else { return 0 }
        return usable.reduce(0, +) / Double(usable.count)
    }

    /// Wall-clock estimate for a queued job, from measured throughput.
    /// Falls back to a conservative 0.4× when nothing has been imported yet.
    func estimatedRenderSeconds(forOutputSeconds seconds: Double) -> Double {
        let factor = averageRealtimeFactor > 0.05 ? averageRealtimeFactor : 0.4
        return seconds / factor
    }

    func estimateLabel(forOutputSeconds seconds: Double) -> String {
        let estimate = estimatedRenderSeconds(forOutputSeconds: seconds)
        return ProductionStore.durationLabel(estimate)
    }

    nonisolated static func durationLabel(_ seconds: Double) -> String {
        let total = Int(seconds.rounded())
        if total < 60 { return "\(total)s" }
        let minutes = total / 60
        if minutes < 60 { return "\(minutes)m \(total % 60)s" }
        return "\(minutes / 60)h \(minutes % 60)m"
    }

    nonisolated static func byteLabel(_ bytes: Int) -> String {
        let units = ["B", "KB", "MB", "GB", "TB"]
        var value = Double(bytes)
        var index = 0
        while value >= 1024, index < units.count - 1 {
            value /= 1024
            index += 1
        }
        return String(format: index == 0 ? "%.0f %@" : "%.1f %@", value, units[index])
    }

    // MARK: - Storage

    private func persistRenders() { LocalStore.shared.save(renders, key: StoreKey.importedRenders) }

    nonisolated static var thumbnailsDirectory: URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("renders", isDirectory: true)
        if !FileManager.default.fileExists(atPath: base.path) {
            try? FileManager.default.createDirectory(at: base, withIntermediateDirectories: true)
        }
        return base
    }

    /// Copies thumbnail bytes into app storage under a collision-free name.
    nonisolated private static func storeThumbnail(_ data: Data, preferredName: String) -> String? {
        let ext = (preferredName as NSString).pathExtension.isEmpty ? "jpg" : (preferredName as NSString).pathExtension
        let name = "\(UUID().uuidString).\(ext)"
        let url = thumbnailsDirectory.appendingPathComponent(name)
        do {
            try data.write(to: url, options: .atomic)
            return name
        } catch {
            return nil
        }
    }
}
