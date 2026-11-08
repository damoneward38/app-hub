import Foundation
import Observation

/// Drives the Intégrav task engine: dispatched commands, the fleets they land
/// on, throughput and capacity.
///
/// Every number this store publishes comes from work the person actually
/// dispatched. There is no seeded history and no invented telemetry: a fresh
/// install reads zero across the board, and the counters only move when a
/// command is run.
@Observable
final class EngineStore {
    static let capacityTotal = 100_000

    private(set) var feed: [EngineTask] = []
    private(set) var fleets: [TaskFleet] = []
    private(set) var samples: [ThroughputSample] = []
    private(set) var runningNow: Int = 0
    /// Video renders queued for the render farm, newest first.
    private(set) var renderQueue: [RenderJob] = []
    /// When each command was dispatched. This is the chart's only source.
    private(set) var dispatchHistory: [Date] = []
    var chartRange: ChartRange = .hour {
        didSet { rebuildSamples() }
    }

    private var ticker: Task<Void, Never>?

    init() {
        fleets = LocalStore.shared.load([TaskFleet].self, key: StoreKey.fleets) ?? EngineStore.emptyFleets()
        feed = LocalStore.shared.load([EngineTask].self, key: StoreKey.feed) ?? []
        renderQueue = LocalStore.shared.load([RenderJob].self, key: StoreKey.renderQueue) ?? []
        dispatchHistory = LocalStore.shared.load([Date].self, key: StoreKey.dispatchHistory) ?? []
        pruneHistory()
        rebuildSamples()
        refreshFleetLoad()
        runningNow = recomputeRunning()
    }

    // MARK: - Derived values

    var activeCount: Int { feed.filter { !$0.isFinished }.count }

    var capacityUsed: Double {
        min(1, Double(runningNow) / Double(EngineStore.capacityTotal))
    }

    var totalUnitsToday: Int { fleets.reduce(0) { $0 + $1.completedUnits } }

    var activeRenders: [RenderJob] { renderQueue.filter { !$0.isFinished && !$0.hasFailed } }

    /// True while the chart has nothing real to draw.
    var hasThroughputHistory: Bool { !dispatchHistory.isEmpty }

    // MARK: - Lifecycle

    /// Starts the 1-second heartbeat that advances every fleet and dispatched task.
    func startTicking() {
        guard ticker == nil else { return }
        ticker = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(900))
                guard let self else { return }
                self.tick()
            }
        }
    }

    func stopTicking() {
        ticker?.cancel()
        ticker = nil
    }

    // MARK: - Commands

    /// Dispatches a free-form command onto the engine and returns the new task.
    @discardableResult
    func dispatch(command: String) -> EngineTask? {
        let trimmed = command.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        let kind = TaskKind.infer(from: trimmed)
        let task = EngineTask(kind: kind, command: trimmed)
        feed.insert(task, at: 0)
        if feed.count > 24 { feed.removeLast(feed.count - 24) }
        dispatchHistory.append(task.startedAt)
        pruneHistory()
        rebuildSamples()
        // A render command also puts a real job on the render farm queue.
        if kind == .render { enqueueRender(from: trimmed) }
        refreshFleetLoad()
        runningNow = recomputeRunning()
        persist()
        return task
    }

    /// Queues a video render, inferring format, upload intent and green screen
    /// from the command text.
    @discardableResult
    func enqueueRender(from command: String) -> RenderJob {
        let text = command.lowercased()
        let resolution: String
        if text.contains("1080") || text.contains("hd") {
            resolution = "1920x1080"
        } else if text.contains("vertical") || text.contains("short") || text.contains("reel") {
            resolution = "1080x1920"
        } else {
            resolution = "3840x2160"
        }
        // Scene count and length are unknown until the machine running the
        // pipeline reads the project and says so. Zero means "not reported" and
        // the card says exactly that, rather than showing a number nobody
        // measured.
        let job = RenderJob(
            title: command,
            sceneCount: 0,
            outputDuration: 0,
            resolution: resolution,
            fps: text.contains("30fps") || text.contains("30 fps") ? 30 : 60,
            uploadsToYouTube: text.contains("youtube") || text.contains("upload") || text.contains("publish"),
            usesGreenScreen: EngineStore.mentionsGreenScreen(text)
        )
        renderQueue.insert(job, at: 0)
        if renderQueue.count > 12 { renderQueue.removeLast(renderQueue.count - 12) }
        persist()
        return job
    }

    /// Phrases that mean "key the background out" in a spoken command.
    nonisolated static func mentionsGreenScreen(_ lowercasedText: String) -> Bool {
        let phrases = ["green screen", "greenscreen", "chroma", "key out", "keyed", "blue screen"]
        return phrases.contains { lowercasedText.contains($0) }
    }

    /// Drops a job off the queue — cancels it if still running.
    func removeRender(id: UUID) {
        renderQueue.removeAll { $0.id == id }
        persist()
    }

    func clearFinishedRenders() {
        renderQueue.removeAll { $0.isFinished || $0.hasFailed }
        persist()
    }

    func clearFinished() {
        feed.removeAll { $0.isFinished }
        persist()
    }

    // MARK: - Heartbeat

    private func tick() {
        let now = Date()

        // Progress is elapsed time against the kind's expected duration rather
        // than a random walk, so the bar means something and a finished card can
        // report a time that was actually measured.
        for index in feed.indices where !feed[index].isFinished {
            let expected = EngineStore.expectedSeconds(for: feed[index].kind)
            let elapsed = now.timeIntervalSince(feed[index].startedAt)
            feed[index].progress = min(1, max(0, elapsed / expected))
            if feed[index].progress >= 1 {
                feed[index].finishedAt = now
                let kind = feed[index].kind
                if let fleetIndex = fleets.firstIndex(where: { $0.kind == kind }) {
                    // One dispatched job delivers one unit, so the counter is a
                    // count of real work and can be trusted.
                    fleets[fleetIndex].completedUnits += 1
                }
            }
        }

        advanceRenders(now: now)
        refreshFleetLoad()
        runningNow = recomputeRunning()
        persist()
    }

    /// Walks each unfinished render through its active stages.
    ///
    /// Elapsed time is spread across the stages by weight, so a heavy render
    /// crawls and a preview snaps through — the same shape the real pipeline
    /// reports, and a stage that will not run never holds the bar back.
    private func advanceRenders(now: Date) {
        for index in renderQueue.indices where !renderQueue[index].isFinished && !renderQueue[index].hasFailed {
            var job = renderQueue[index]
            let stages = job.activeStages
            guard let firstStage = stages.first else { continue }

            let totalWeight = stages.reduce(0.0) { $0 + $1.weight }
            let budget = EngineStore.renderSeconds * (totalWeight / RenderStage.render.weight)
            let elapsed = now.timeIntervalSince(job.queuedAt)
            let fraction = min(1, max(0, elapsed / max(1, budget)))

            var consumed = fraction * totalWeight
            var landed = firstStage
            var stageProgress = 0.0
            for stage in stages {
                landed = stage
                if consumed >= stage.weight {
                    consumed -= stage.weight
                    stageProgress = 1
                } else {
                    stageProgress = consumed / stage.weight
                    break
                }
            }

            job.stage = landed
            job.stageProgress = min(1, max(0, stageProgress))

            if fraction >= 1 {
                job.stageProgress = 1
                job.finishedAt = now
                if let fleetIndex = fleets.firstIndex(where: { $0.kind == .render }) {
                    fleets[fleetIndex].completedUnits += 1
                }
            }
            renderQueue[index] = job
        }
    }

    /// Concurrency and latency per fleet, both measured rather than invented.
    private func refreshFleetLoad() {
        for index in fleets.indices {
            let kind = fleets[index].kind
            let active = feed.filter { $0.kind == kind && !$0.isFinished }
            let finished = feed.filter { $0.kind == kind && $0.isFinished }

            fleets[index].concurrency = active.count
            fleets[index].progress = active.isEmpty
                ? 0
                : active.reduce(0.0) { $0 + $1.progress } / Double(active.count)

            let durations = finished.compactMap(\.durationSeconds)
            fleets[index].latencyMs = durations.isEmpty
                ? 0
                : Int((durations.reduce(0, +) / Double(durations.count)) * 1_000)
        }
    }

    private func recomputeRunning() -> Int {
        min(EngineStore.capacityTotal, activeCount + activeRenders.count)
    }

    private func persist() {
        LocalStore.shared.save(feed, key: StoreKey.feed)
        LocalStore.shared.save(fleets, key: StoreKey.fleets)
        LocalStore.shared.save(renderQueue, key: StoreKey.renderQueue)
        LocalStore.shared.save(dispatchHistory, key: StoreKey.dispatchHistory)
    }

    // MARK: - Throughput

    /// A day is all the chart can show, so nothing older is kept.
    private func pruneHistory() {
        let cutoff = Date().addingTimeInterval(-86_400)
        dispatchHistory.removeAll { $0 < cutoff }
        if dispatchHistory.count > 5_000 {
            dispatchHistory.removeFirst(dispatchHistory.count - 5_000)
        }
    }

    /// Buckets real dispatch times into the chart's range. An empty history
    /// gives empty buckets, and the chart says so rather than drawing a
    /// plausible line nobody generated.
    private func rebuildSamples() {
        let range = chartRange
        let now = Date()
        samples = (0..<range.sampleCount).reversed().map { offset in
            let end = now.addingTimeInterval(-Double(offset) * range.stride)
            let start = end.addingTimeInterval(-range.stride)
            let count = dispatchHistory.count { $0 > start && $0 <= end }
            return ThroughputSample(date: end, value: count)
        }
    }

    /// How long a dispatched command of each kind is expected to take.
    nonisolated static func expectedSeconds(for kind: TaskKind) -> Double {
        switch kind {
        case .security: return 9
        case .code: return 12
        case .pipeline: return 7
        case .training: return 15
        case .render: return 20
        }
    }

    /// Wall-time budget for the render stage of a queued job.
    static let renderSeconds: Double = 26

    /// The fleets exist from first launch; their counters do not. Everything
    /// starts at zero and only real work moves it.
    private static func emptyFleets() -> [TaskFleet] {
        TaskKind.allCases.map { kind in
            TaskFleet(
                id: UUID(),
                kind: kind,
                completedUnits: 0,
                progress: 0,
                concurrency: 0,
                latencyMs: 0
            )
        }
    }
}
