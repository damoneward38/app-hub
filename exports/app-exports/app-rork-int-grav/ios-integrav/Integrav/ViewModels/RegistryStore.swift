import Foundation
import Observation
import SwiftUI

/// Owns the avatar function registry: browsing, the chain under construction,
/// saved chains, and chain playback against the twin. Fully on-device.
@Observable
final class RegistryStore {
    let functions: [AvatarFunction] = FunctionCatalog.all

    var query: String = ""
    var category: FunctionCategory?

    private(set) var draft: [String] = []
    private(set) var chains: [FunctionChain] = []
    private(set) var runs: [String: Int] = [:]

    /// Set while cloud state is being adopted, so echoing it straight back up is skipped.
    private var isAdopting: Bool = false

    /// Name of the function that fired most recently, for the run banner.
    private(set) var lastRun: String?
    private(set) var runningChain: FunctionChain?
    private(set) var runningStep: Int = 0

    /// Audit trail of every executed call, newest first.
    private(set) var callLog: [CallLogEntry] = []

    /// Throttles chain length and monthly volume the way the server-side limits do.
    var plan: PlanTier = .enterprise {
        didSet {
            LocalStore.shared.save(plan, key: StoreKey.planTier)
            pushLicence()
        }
    }

    /// Additional users on top of the plan owner, billed per seat.
    var seats: Int = 0 {
        didSet {
            LocalStore.shared.save(seats, key: StoreKey.seats)
            pushLicence()
        }
    }

    /// White-label identity applied across the app when enabled.
    var brand: BrandProfile = .default {
        didSet {
            LocalStore.shared.save(brand, key: StoreKey.brand)
            pushLicence()
        }
    }

    /// Metered usage for the current billing month.
    private(set) var usage: UsageWindow = UsageWindow()

    /// Set when an action was refused by the plan limit; the UI shows it, then clears it.
    var limitNotice: String?

    /// Behaviours the user marked as favourites.
    private(set) var likes: Set<String> = []

    /// Restrict the browser to liked behaviours.
    var likedOnly: Bool = false

    /// Chain queued to play as soon as the live twin screen appears.
    var pendingChain: FunctionChain?

    /// Where a call goes to actually move the rig.
    ///
    /// Set by `StageStore.attach(registry:)`. Without it a function call only
    /// wrote two lines into the transcript and the avatar never moved, which is
    /// what made 300 working behaviours look dead.
    @ObservationIgnored
    var performer: ((AvatarFunction) -> Void)?

    private var chainTask: Task<Void, Never>?

    init() {
        chains = LocalStore.shared.load([FunctionChain].self, key: StoreKey.chains) ?? RegistryStore.seedChains()
        draft = LocalStore.shared.load([String].self, key: StoreKey.chainDraft) ?? []
        runs = LocalStore.shared.load([String: Int].self, key: StoreKey.functionRuns) ?? [:]
        callLog = LocalStore.shared.load([CallLogEntry].self, key: StoreKey.callLog) ?? []
        plan = LocalStore.shared.load(PlanTier.self, key: StoreKey.planTier) ?? .enterprise
        likes = Set(LocalStore.shared.load([String].self, key: StoreKey.likes) ?? [])
        seats = LocalStore.shared.load(Int.self, key: StoreKey.seats) ?? 0
        brand = LocalStore.shared.load(BrandProfile.self, key: StoreKey.brand) ?? .default
        usage = LocalStore.shared.load(UsageWindow.self, key: StoreKey.usage) ?? UsageWindow()
        rollPeriodIfNeeded()
    }

    // MARK: - Cloud

    private func pushLicence() {
        guard !isAdopting else { return }
        CloudSync.shared.pushLicence(plan: plan, seats: seats, brand: brand)
    }

    /// Adopts the licence stored against the signed-in account.
    func applyCloudLicence(tier: PlanTier, seats newSeats: Int, brand newBrand: BrandProfile) {
        isAdopting = true
        plan = tier
        seats = newSeats
        brand = newBrand
        isAdopting = false
    }

    func applyCloudUsage(_ window: UsageWindow) {
        usage = window
        LocalStore.shared.save(usage, key: StoreKey.usage)
    }

    func applyCloudChains(_ merged: [FunctionChain]) {
        chains = merged
        persistChains()
    }

    func applyCloudLikes(_ merged: Set<String>) {
        likes = merged
        LocalStore.shared.save(Array(likes).sorted(), key: StoreKey.likes)
    }

    func applyCloudRuns(_ merged: [String: Int]) {
        runs = merged
        persistRuns()
    }

    func applyCloudCallLog(_ merged: [CallLogEntry]) {
        callLog = merged
        persistLog()
    }

    // MARK: - Licence

    /// The priced monthly licence: base plan + seats + white-label hosting.
    var quote: PlanQuote {
        PlanQuote(tier: plan, seats: seats, hosting: plan.isWhiteLabel ? brand.hosting : nil)
    }

    /// Name the app answers to — the reseller's brand when white-label is on.
    var appName: String { brand.isEnabled ? brand.displayName : BrandProfile.houseName }

    /// Accent the UI wears. Defaults to Intégrav magenta.
    var accent: Color { brand.isEnabled ? Color(hex: brand.accentHex) : Theme.magenta }

    /// Resource namespace applied to logged calls under a white-label licence.
    var namespace: String { brand.isEnabled ? brand.namespace : "" }

    func namespaced(_ name: String) -> String { namespace + name }

    /// Switching to (or away from) the White-Label tier flips branding with it.
    func select(_ tier: PlanTier) {
        plan = tier
        if tier.isWhiteLabel {
            brand.isEnabled = true
        } else if brand.isEnabled {
            brand.isEnabled = false
        }
    }

    func setBranding(_ enabled: Bool) {
        brand.isEnabled = enabled
        if enabled {
            plan = .whiteLabel
        } else if plan.isWhiteLabel {
            plan = .enterprise
        }
    }

    // MARK: - Metering

    private func rollPeriodIfNeeded() {
        guard usage.isStale() else { return }
        usage = UsageWindow()
        persistUsage()
    }

    var callsFraction: Double { usage.fraction(of: plan.monthlyCalls, used: usage.calls) }
    var executionsFraction: Double { usage.fraction(of: plan.monthlyExecutions, used: usage.executions) }

    var isOverQuota: Bool { quotaRefusal(calls: 1, executions: 1) != nil }

    /// The 429 the server would return, phrased for the UI. `nil` means allowed.
    func quotaRefusal(calls: Int, executions: Int) -> String? {
        rollPeriodIfNeeded()
        if let cap = plan.monthlyCalls, usage.calls + calls > cap {
            return "Plan quota exceeded — \(plan.title) includes \(cap.formatted(.number)) dispatches a month (\(usage.resetLabel))."
        }
        if let cap = plan.monthlyExecutions, usage.executions + executions > cap {
            return "Plan quota exceeded — \(plan.title) includes \(cap.formatted(.number)) function executions a month (\(usage.resetLabel))."
        }
        return nil
    }

    /// Wipes the meters for the current month. Local-only convenience.
    func resetUsage() {
        usage = UsageWindow()
        persistUsage()
    }

    // MARK: - Browsing

    var filtered: [AvatarFunction] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return functions.filter { fn in
            if likedOnly, !likes.contains(fn.name) { return false }
            if let category, fn.category != category { return false }
            guard !trimmed.isEmpty else { return true }
            return fn.name.lowercased().contains(trimmed)
                || fn.title.lowercased().contains(trimmed)
                || fn.hotkey.contains(trimmed)
                || fn.category.chip.lowercased().contains(trimmed)
        }
    }

    func count(in category: FunctionCategory) -> Int {
        functions.filter { $0.category == category }.count
    }

    func function(named name: String) -> AvatarFunction? { FunctionCatalog.function(named: name) }

    /// Matches a typed call such as `tell_joke()`, `tell_joke` or `042`.
    func function(matching text: String) -> AvatarFunction? {
        var token = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !token.isEmpty else { return nil }
        if token.hasSuffix("()") { token = String(token.dropLast(2)) }
        if let hotkey = Int(token), let fn = FunctionCatalog.function(hotkey: hotkey) { return fn }
        return FunctionCatalog.function(named: token)
    }

    func runCount(for fn: AvatarFunction) -> Int { runs[fn.name] ?? 0 }

    // MARK: - Likes

    func isLiked(_ fn: AvatarFunction) -> Bool { likes.contains(fn.name) }

    func toggleLike(_ fn: AvatarFunction) {
        let liked: Bool
        if likes.contains(fn.name) {
            likes.remove(fn.name)
            liked = false
        } else {
            likes.insert(fn.name)
            liked = true
        }
        LocalStore.shared.save(Array(likes).sorted(), key: StoreKey.likes)
        CloudSync.shared.pushLike(fn.name, liked: liked)
    }

    var likedFunctions: [AvatarFunction] { functions.filter { likes.contains($0.name) } }

    // MARK: - Analytics

    /// Most-run behaviours, highest first. Ties break alphabetically so the
    /// leaderboard is stable between renders.
    func mostUsed(limit: Int = 8) -> [FunctionUsage] {
        runs.sorted { lhs, rhs in
            lhs.value == rhs.value ? lhs.key < rhs.key : lhs.value > rhs.value
        }
        .prefix(limit)
        .compactMap { entry in
            guard let fn = FunctionCatalog.function(named: entry.key) else { return nil }
            return FunctionUsage(function: fn, count: entry.value)
        }
    }

    /// Total runs per family, for the usage breakdown bars.
    var usageByCategory: [CategoryUsage] {
        var totals: [FunctionCategory: Int] = [:]
        for (name, count) in runs {
            guard let fn = FunctionCatalog.function(named: name) else { continue }
            totals[fn.category, default: 0] += count
        }
        return FunctionCategory.allCases
            .compactMap { category in
                let count = totals[category] ?? 0
                return count > 0 ? CategoryUsage(category: category, count: count) : nil
            }
            .sorted { $0.count > $1.count }
    }

    var totalRuns: Int { runs.values.reduce(0, +) }

    // MARK: - Chain building

    var draftFunctions: [AvatarFunction] { draft.compactMap { FunctionCatalog.function(named: $0) } }

    func isInDraft(_ fn: AvatarFunction) -> Bool { draft.contains(fn.name) }

    /// Steps still available in the current chain under this plan.
    var draftHeadroom: Int { max(0, plan.maxChainSteps - draft.count) }

    @discardableResult
    func toggleDraft(_ fn: AvatarFunction) -> Bool {
        if let index = draft.firstIndex(of: fn.name) {
            draft.remove(at: index)
        } else {
            guard draft.count < plan.maxChainSteps else {
                limitNotice = "\(plan.title) runs \(plan.maxChainSteps) calls per chain. Raise the plan in Plans."
                return false
            }
            draft.append(fn.name)
        }
        persistDraft()
        return true
    }

    func removeDraft(at offsets: IndexSet) {
        draft.remove(atOffsets: offsets)
        persistDraft()
    }

    func moveDraft(from source: IndexSet, to destination: Int) {
        draft.move(fromOffsets: source, toOffset: destination)
        persistDraft()
    }

    func clearDraft() {
        draft = []
        persistDraft()
    }

    func load(_ chain: FunctionChain) {
        draft = chain.steps
        persistDraft()
    }

    @discardableResult
    func saveDraft(as name: String) -> FunctionChain? {
        guard !draft.isEmpty else { return nil }
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let title = trimmed.isEmpty ? "Chain \(chains.count + 1)" : trimmed
        let chain = FunctionChain(name: title, steps: draft)
        chains.insert(chain, at: 0)
        persistChains()
        CloudSync.shared.pushChain(chain)
        return chain
    }

    func delete(_ chain: FunctionChain) {
        chains.removeAll { $0.id == chain.id }
        persistChains()
        CloudSync.shared.removeChain(chain)
    }

    /// Renames a saved routine in place, on device and in the cloud.
    func rename(_ chain: FunctionChain, to newName: String) {
        let trimmed = newName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let index = chains.firstIndex(where: { $0.id == chain.id }) else { return }
        chains[index].name = trimmed
        persistChains()
        CloudSync.shared.pushChain(chains[index])
    }

    /// Replaces a saved routine's steps with the current draft.
    func update(_ chain: FunctionChain, steps: [String]) {
        guard let index = chains.firstIndex(where: { $0.id == chain.id }), !steps.isEmpty else { return }
        chains[index].steps = steps
        persistChains()
        CloudSync.shared.pushChain(chains[index])
    }

    // MARK: - Running

    /// Fires a single function at the twin and writes it to the call log.
    /// Returns false when the plan quota refuses the call.
    @discardableResult
    func run(_ fn: AvatarFunction, on twin: TwinStore, source: CallSource = .registry, chain: String? = nil) -> Bool {
        let isChainStep = chain != nil
        if let refusal = quotaRefusal(calls: isChainStep ? 0 : 1, executions: 1) {
            limitNotice = refusal
            return false
        }

        let started = Date()
        let performance = fn.performance
        // The rig first, so the motion starts on the same frame as the tap
        // rather than after the transcript has been written.
        performer?(fn)
        twin.invoke(signature: fn.signature, response: performance)
        runs[fn.name, default: 0] += 1
        lastRun = fn.name
        persistRuns()

        let entry = CallLogEntry(
            function: fn.name,
            arguments: ["hotkey": fn.hotkey, "category": fn.category.rawValue],
            result: performance,
            source: source,
            chain: chain,
            calledAt: started,
            // Measured, not invented: how long this invocation actually took.
            durationMs: max(1, Int(Date().timeIntervalSince(started) * 1_000))
        )
        callLog.insert(entry, at: 0)
        if callLog.count > 400 { callLog.removeLast(callLog.count - 400) }
        persistLog()

        usage.calls += isChainStep ? 0 : 1
        usage.executions += 1
        persistUsage()
        CloudSync.shared.pushCall(entry, runCount: runs[fn.name] ?? 1)
        return true
    }

    /// Plays a chain step by step so the twin performs it as one sequence.
    func run(chain: FunctionChain, on twin: TwinStore) {
        guard chain.steps.count <= plan.maxChainSteps else {
            limitNotice = "\(chain.name) is \(chain.steps.count) calls — \(plan.title) runs \(plan.maxChainSteps). Raise the plan in Plans."
            return
        }
        if let refusal = quotaRefusal(calls: 1, executions: chain.steps.count) {
            limitNotice = refusal
            return
        }
        usage.calls += 1
        persistUsage()
        chainTask?.cancel()
        runningChain = chain
        runningStep = 0

        chainTask = Task { [weak self] in
            guard let self else { return }
            for (offset, name) in chain.steps.enumerated() {
                if Task.isCancelled { break }
                self.runningStep = offset
                if let fn = FunctionCatalog.function(named: name) {
                    guard self.run(fn, on: twin, source: .chain, chain: chain.name) else { break }
                }
                try? await Task.sleep(for: .milliseconds(1_150))
            }
            if !Task.isCancelled {
                self.runningStep = max(0, chain.steps.count - 1)
            }
            self.runningChain = nil
            self.chainTask = nil
        }
    }

    func stopChain() {
        chainTask?.cancel()
        chainTask = nil
        runningChain = nil
    }

    var runningFunction: AvatarFunction? {
        guard let runningChain, runningStep < runningChain.steps.count else { return nil }
        return FunctionCatalog.function(named: runningChain.steps[runningStep])
    }

    // MARK: - Persistence & seeds

    private func persistDraft() { LocalStore.shared.save(draft, key: StoreKey.chainDraft) }
    private func persistChains() { LocalStore.shared.save(chains, key: StoreKey.chains) }
    private func persistRuns() { LocalStore.shared.save(runs, key: StoreKey.functionRuns) }
    private func persistLog() { LocalStore.shared.save(callLog, key: StoreKey.callLog) }
    private func persistUsage() {
        LocalStore.shared.save(usage, key: StoreKey.usage)
        CloudSync.shared.pushUsage(usage)
    }

    // MARK: - Call log

    func clearLog() {
        callLog = []
        persistLog()
        CloudSync.shared.clearCloudLog()
    }

    /// The whole audit trail as pretty JSON — what the White-Label bundle calls
    /// "audit export". Returned as text so the share sheet can hand it off.
    func exportLogJSON() -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(callLog), let text = String(data: data, encoding: .utf8) else {
            return "[]"
        }
        return text
    }

    var callsToday: Int {
        let start = Calendar.current.startOfDay(for: .now)
        return callLog.filter { $0.calledAt >= start }.count
    }

    var uniqueFunctionsCalled: Int { Set(callLog.map(\.function)).count }

    var averageLatencyMs: Int {
        guard !callLog.isEmpty else { return 0 }
        return callLog.reduce(0) { $0 + $1.durationMs } / callLog.count
    }

    private static func seedChains() -> [FunctionChain] {
        [
            FunctionChain(
                name: "Warm open",
                steps: ["greeting", "hello_with_wave", "be_upbeat", "tell_joke", "laugh_chuckle"]
            ),
            FunctionChain(
                name: "Roast me",
                steps: ["be_frank", "roast", "sarcastic_reply", "大笑", "apology"]
            ),
            FunctionChain(
                name: "Board demo",
                steps: ["be_brief", "analyze", "analysis_short", "predict", "testimonial"]
            ),
        ]
    }
}
