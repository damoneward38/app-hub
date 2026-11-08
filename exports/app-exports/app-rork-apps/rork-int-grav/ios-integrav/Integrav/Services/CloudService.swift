import Foundation
import Supabase

/// The Supabase edge of Intégrav. Every row is keyed to the signed-in Supabase
/// user and guarded by row-level security against `auth.uid()`, so the licence,
/// the rig and the audit trail follow the account rather than the handset.
/// Main-actor isolated because `Config` is: the generated environment view is
/// MainActor-bound, so reading it from a nonisolated initialiser is a data race
/// the compiler rejects. `CloudAPI` below hops here once per call, which costs
/// nothing next to the network round trip that follows.
enum Backend {
    static let isConfigured: Bool =
        !Config.EXPO_PUBLIC_SUPABASE_URL.isEmpty && !Config.EXPO_PUBLIC_SUPABASE_ANON_KEY.isEmpty

    /// `nil` when the build has no Supabase credentials — the app then stays
    /// fully local instead of crashing on a bad URL.
    static let client: SupabaseClient? = {
        guard isConfigured, let url = URL(string: Config.EXPO_PUBLIC_SUPABASE_URL) else { return nil }
        // No `accessToken` closure: on native Supabase Auth the SDK owns the
        // session, storing and refreshing it itself. Supplying a token here
        // would put the client in third-party-auth mode, where `auth.signIn`
        // and `auth.signUp` are unavailable.
        return SupabaseClient(
            supabaseURL: url,
            supabaseKey: Config.EXPO_PUBLIC_SUPABASE_ANON_KEY
        )
    }()
}

nonisolated enum CloudError: LocalizedError {
    case notConfigured
    case signedOut

    nonisolated var errorDescription: String? {
        switch self {
        case .notConfigured: return "This build has no backend credentials."
        case .signedOut: return "Sign in to sync."
        }
    }
}

// MARK: - Rows

nonisolated struct ProfileRow: Codable, Sendable {
    let id: String
    let email: String?
    let name: String?
    let avatarUrl: String?

    enum CodingKeys: String, CodingKey {
        case id, email, name
        case avatarUrl = "avatar_url"
    }
}

nonisolated struct LicenceRow: Codable, Sendable {
    let userId: String
    let plan: String
    let seats: Int
    let brandEnabled: Bool
    let brandName: String
    let brandDomain: String
    let brandAccentHex: String
    let hosting: String
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case plan, seats, hosting
        case brandEnabled = "brand_enabled"
        case brandName = "brand_name"
        case brandDomain = "brand_domain"
        case brandAccentHex = "brand_accent_hex"
        case updatedAt = "updated_at"
    }

    nonisolated var tier: PlanTier { PlanTier(rawValue: plan) ?? .enterprise }

    nonisolated var brand: BrandProfile {
        BrandProfile(
            isEnabled: brandEnabled,
            name: brandName.isEmpty ? BrandProfile.default.name : brandName,
            domain: brandDomain,
            accentHex: LicenceRow.colour(from: brandAccentHex),
            hosting: WhiteLabelHosting(rawValue: hosting) ?? .managed
        )
    }

    nonisolated static func hexString(_ value: UInt32) -> String {
        String(format: "#%06X", value & 0xFFFFFF)
    }

    nonisolated static func colour(from hex: String) -> UInt32 {
        let cleaned = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
        return UInt32(cleaned, radix: 16) ?? 0xE879F9
    }

    nonisolated init(userId: String, plan: PlanTier, seats: Int, brand: BrandProfile, updatedAt: Date = .now) {
        self.userId = userId
        self.plan = plan.rawValue
        self.seats = seats
        self.brandEnabled = brand.isEnabled
        self.brandName = brand.name
        self.brandDomain = brand.domain
        self.brandAccentHex = LicenceRow.hexString(brand.accentHex)
        self.hosting = brand.hosting.rawValue
        self.updatedAt = updatedAt
    }
}

nonisolated struct UsageRow: Codable, Sendable {
    let userId: String
    let periodStart: Date
    let calls: Int
    let executions: Int

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case periodStart = "period_start"
        case calls, executions
    }

    nonisolated var window: UsageWindow {
        UsageWindow(periodStart: periodStart, calls: calls, executions: executions)
    }
}

nonisolated struct ChainRow: Codable, Sendable {
    let id: UUID
    let userId: String
    let name: String
    let steps: [String]
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, steps
        case userId = "user_id"
        case createdAt = "created_at"
    }

    nonisolated var chain: FunctionChain {
        FunctionChain(id: id, name: name, steps: steps, createdAt: createdAt)
    }

    nonisolated init(chain: FunctionChain, userId: String) {
        self.id = chain.id
        self.userId = userId
        self.name = chain.name
        self.steps = chain.steps
        self.createdAt = chain.createdAt
    }
}

nonisolated struct LikeRow: Codable, Sendable {
    let userId: String
    let functionName: String

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case functionName = "function_name"
    }
}

nonisolated struct RunRow: Codable, Sendable {
    let userId: String
    let functionName: String
    let runCount: Int
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case functionName = "function_name"
        case runCount = "run_count"
        case updatedAt = "updated_at"
    }
}

nonisolated struct CallRow: Codable, Sendable {
    let id: UUID
    let userId: String
    let functionName: String
    let arguments: [String: String]
    let result: String
    let source: String
    let chain: String?
    let durationMs: Int
    let calledAt: Date

    enum CodingKeys: String, CodingKey {
        case id, arguments, result, source, chain
        case userId = "user_id"
        case functionName = "function_name"
        case durationMs = "duration_ms"
        case calledAt = "called_at"
    }

    nonisolated var entry: CallLogEntry {
        CallLogEntry(
            id: id,
            function: functionName,
            arguments: arguments,
            result: result,
            source: CallSource(rawValue: source) ?? .registry,
            chain: chain,
            calledAt: calledAt,
            durationMs: durationMs
        )
    }

    nonisolated init(entry: CallLogEntry, userId: String) {
        self.id = entry.id
        self.userId = userId
        self.functionName = entry.function
        self.arguments = entry.arguments
        self.result = entry.result
        self.source = entry.source.rawValue
        self.chain = entry.chain
        self.durationMs = entry.durationMs
        self.calledAt = entry.calledAt
    }
}

nonisolated struct ClipRow: Codable, Sendable {
    let id: UUID
    let userId: String
    let name: String
    let kind: String
    let minutes: Double
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, kind, minutes
        case userId = "user_id"
        case createdAt = "created_at"
    }

    nonisolated var video: SourceVideo {
        SourceVideo(id: id, name: name, minutes: Int(minutes.rounded()), addedAt: createdAt)
    }

    nonisolated init(video: SourceVideo, userId: String, kind: String = "footage") {
        self.id = video.id
        self.userId = userId
        self.name = video.name
        self.kind = kind
        self.minutes = Double(video.minutes)
        self.createdAt = video.addedAt
    }
}

nonisolated struct FaceRow: Codable, Sendable {
    let userId: String
    let metrics: FaceMetrics
    let vertexCount: Int
    let source: String
    let capturedAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case metrics, source
        case userId = "user_id"
        case vertexCount = "vertex_count"
        case capturedAt = "captured_at"
        case updatedAt = "updated_at"
    }

    nonisolated init(record: FaceCaptureRecord, userId: String) {
        self.userId = userId
        self.metrics = record.metrics
        self.vertexCount = record.vertexCount
        self.source = record.source.rawValue
        self.capturedAt = record.capturedAt
        self.updatedAt = .now
    }
}

// MARK: - API

/// Every call the app makes against Supabase, in one place.
nonisolated enum CloudAPI {
    nonisolated static let faceBucket = "faces"

    nonisolated private static func client() async throws -> SupabaseClient {
        guard let client = await Backend.client else { throw CloudError.notConfigured }
        return client
    }

    // Profile

    nonisolated static func upsertProfile(id: String, email: String, name: String?, avatarUrl: String?) async throws {
        try await client()
            .from("profiles")
            .upsert(ProfileRow(id: id, email: email, name: name, avatarUrl: avatarUrl))
            .execute()
    }

    // Licence

    nonisolated static func fetchLicence(userId: String) async throws -> LicenceRow? {
        let rows: [LicenceRow] = try await client()
            .from("licences")
            .select()
            .eq("user_id", value: userId)
            .limit(1)
            .execute()
            .value
        return rows.first
    }

    nonisolated static func saveLicence(_ row: LicenceRow) async throws {
        try await client().from("licences").upsert(row).execute()
    }

    // Usage

    nonisolated static func fetchUsage(userId: String, periodStart: Date) async throws -> UsageRow? {
        let rows: [UsageRow] = try await client()
            .from("usage_windows")
            .select()
            .eq("user_id", value: userId)
            .order("period_start", ascending: false)
            .limit(1)
            .execute()
            .value
        return rows.first
    }

    nonisolated static func saveUsage(userId: String, window: UsageWindow) async throws {
        let row = UsageRow(
            userId: userId,
            periodStart: window.periodStart,
            calls: window.calls,
            executions: window.executions
        )
        try await client().from("usage_windows").upsert(row).execute()
    }

    // Chains

    nonisolated static func fetchChains(userId: String) async throws -> [ChainRow] {
        try await client()
            .from("chains")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    nonisolated static func saveChain(_ chain: FunctionChain, userId: String) async throws {
        try await client().from("chains").upsert(ChainRow(chain: chain, userId: userId)).execute()
    }

    nonisolated static func deleteChain(id: UUID) async throws {
        try await client().from("chains").delete().eq("id", value: id.uuidString).execute()
    }

    // Likes

    nonisolated static func fetchLikes(userId: String) async throws -> [String] {
        let rows: [LikeRow] = try await client()
            .from("function_likes")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value
        return rows.map(\.functionName)
    }

    nonisolated static func like(_ name: String, userId: String) async throws {
        try await client()
            .from("function_likes")
            .upsert(LikeRow(userId: userId, functionName: name))
            .execute()
    }

    nonisolated static func unlike(_ name: String, userId: String) async throws {
        try await client()
            .from("function_likes")
            .delete()
            .eq("user_id", value: userId)
            .eq("function_name", value: name)
            .execute()
    }

    // Run counts

    nonisolated static func fetchRuns(userId: String) async throws -> [String: Int] {
        let rows: [RunRow] = try await client()
            .from("function_runs")
            .select()
            .eq("user_id", value: userId)
            .execute()
            .value
        return Dictionary(rows.map { ($0.functionName, $0.runCount) }, uniquingKeysWith: max)
    }

    nonisolated static func saveRun(name: String, count: Int, userId: String) async throws {
        let row = RunRow(userId: userId, functionName: name, runCount: count, updatedAt: .now)
        try await client().from("function_runs").upsert(row).execute()
    }

    nonisolated static func saveRuns(_ runs: [String: Int], userId: String) async throws {
        guard !runs.isEmpty else { return }
        let rows = runs.map { RunRow(userId: userId, functionName: $0.key, runCount: $0.value, updatedAt: .now) }
        try await client().from("function_runs").upsert(rows).execute()
    }

    // Call log

    nonisolated static func fetchCalls(userId: String, limit: Int = 400) async throws -> [CallRow] {
        try await client()
            .from("call_log")
            .select()
            .eq("user_id", value: userId)
            .order("called_at", ascending: false)
            .limit(limit)
            .execute()
            .value
    }

    nonisolated static func saveCalls(_ entries: [CallLogEntry], userId: String) async throws {
        guard !entries.isEmpty else { return }
        let rows = entries.map { CallRow(entry: $0, userId: userId) }
        try await client().from("call_log").upsert(rows).execute()
    }

    nonisolated static func clearCalls(userId: String) async throws {
        try await client().from("call_log").delete().eq("user_id", value: userId).execute()
    }

    // Training clips

    nonisolated static func fetchClips(userId: String) async throws -> [ClipRow] {
        try await client()
            .from("training_clips")
            .select()
            .eq("user_id", value: userId)
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    nonisolated static func saveClips(_ videos: [SourceVideo], userId: String) async throws {
        guard !videos.isEmpty else { return }
        let rows = videos.map { ClipRow(video: $0, userId: userId) }
        try await client().from("training_clips").upsert(rows).execute()
    }

    nonisolated static func deleteClip(id: UUID) async throws {
        try await client().from("training_clips").delete().eq("id", value: id.uuidString).execute()
    }

    // Face model + photo

    nonisolated static func fetchFace(userId: String) async throws -> FaceRow? {
        let rows: [FaceRow] = try await client()
            .from("face_models")
            .select()
            .eq("user_id", value: userId)
            .limit(1)
            .execute()
            .value
        return rows.first
    }

    nonisolated static func saveFace(_ record: FaceCaptureRecord, imageData: Data?, userId: String) async throws {
        let client = try await client()
        if let imageData {
            try await client.storage
                .from(faceBucket)
                .upload(
                    "\(userId)/face.jpg",
                    data: imageData,
                    options: FileOptions(contentType: "image/jpeg", upsert: true)
                )
        }
        try await client.from("face_models").upsert(FaceRow(record: record, userId: userId)).execute()
    }

    nonisolated static func downloadFaceImage(userId: String) async throws -> Data {
        try await client().storage.from(faceBucket).download(path: "\(userId)/face.jpg")
    }

    nonisolated static func deleteFace(userId: String) async throws {
        let client = try await client()
        // The photo may already be gone; the row is what must be removed.
        _ = try? await client.storage.from(faceBucket).remove(paths: ["\(userId)/face.jpg"])
        try await client.from("face_models").delete().eq("user_id", value: userId).execute()
    }
}
