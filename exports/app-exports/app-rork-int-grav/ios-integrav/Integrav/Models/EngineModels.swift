import Foundation

/// The kinds of work the Intégrav engine can dispatch.
nonisolated enum TaskKind: String, Codable, CaseIterable, Identifiable, Sendable {
    case security
    case code
    case pipeline
    case training
    case render

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .security: return "Security scan"
        case .code: return "Write code"
        case .pipeline: return "Run pipeline"
        case .training: return "Train twin"
        case .render: return "Render video"
        }
    }

    nonisolated var fleetName: String {
        switch self {
        case .security: return "Pen-test fleet"
        case .code: return "Code gen"
        case .pipeline: return "API pipelines"
        case .training: return "Twin training"
        case .render: return "Render farm"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .security: return "shield.lefthalf.filled"
        case .code: return "chevron.left.forwardslash.chevron.right"
        case .pipeline: return "point.3.filled.connected.trianglepath.dotted"
        case .training: return "brain.head.profile"
        case .render: return "film.stack"
        }
    }

    /// Plural noun for the unit of work this kind produces.
    nonisolated var unit: String {
        switch self {
        case .security: return "scans"
        case .code: return "functions"
        case .pipeline: return "chains"
        case .training: return "clips"
        case .render: return "masters"
        }
    }

    nonisolated var completionPhrase: String {
        switch self {
        case .security: return "security scans finished"
        case .code: return "functions written"
        case .pipeline: return "services linked"
        case .training: return "clips ingested"
        case .render: return "masters delivered"
        }
    }

    /// Singular version, for one finished job rather than a running total.
    nonisolated var deliveredPhrase: String {
        switch self {
        case .security: return "scan finished"
        case .code: return "code written"
        case .pipeline: return "chain linked"
        case .training: return "clip ingested"
        case .render: return "master delivered"
        }
    }

    /// Keyword routing so a free-form command lands on the right fleet.
    nonisolated static func infer(from command: String) -> TaskKind {
        let text = command.lowercased()
        let table: [(TaskKind, [String])] = [
            (.security, ["secur", "hack", "pen", "vuln", "exploit", "scan", "audit", "firewall", "threat"]),
            (.code, ["code", "function", "refactor", "detect", "refresh", "extend", "swift", "python", "bug", "write"]),
            (.pipeline, ["pipeline", "api", "chain", "integrat", "webhook", "deploy", "connect", "endpoint"]),
            (.render, ["render", "edit", "cut", "footage", "export", "transition", "timeline", "youtube", "upload", "master", "grade", "subtitle"]),
            (.training, ["train", "twin", "avatar", "ingest", "voice", "likeness", "video"]),
        ]
        for (kind, keys) in table where keys.contains(where: { text.contains($0) }) {
            return kind
        }
        return .pipeline
    }
}

/// A single dispatched job shown in the Command feed.
///
/// There is no invented "14,203 scans" figure here any more. One dispatch is one
/// job, and the only number it reports is the time it actually took.
nonisolated struct EngineTask: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    let kind: TaskKind
    let command: String
    var progress: Double
    let startedAt: Date
    var finishedAt: Date?

    nonisolated init(
        id: UUID = UUID(),
        kind: TaskKind,
        command: String,
        progress: Double = 0,
        startedAt: Date = .now,
        finishedAt: Date? = nil
    ) {
        self.id = id
        self.kind = kind
        self.command = command
        self.progress = progress
        self.startedAt = startedAt
        self.finishedAt = finishedAt
    }

    nonisolated var isFinished: Bool { finishedAt != nil }

    /// Measured run time, once there is one.
    nonisolated var durationSeconds: Double? {
        guard let finishedAt else { return nil }
        return max(0, finishedAt.timeIntervalSince(startedAt))
    }

    /// The headline on a finished card: how long it took.
    nonisolated var headline: String {
        guard let seconds = durationSeconds else { return "" }
        if seconds < 60 { return String(format: "%.1fs", seconds) }
        return "\(Int(seconds) / 60)m \(Int(seconds) % 60)s"
    }

    nonisolated var subtitle: String { kind.deliveredPhrase }
}

/// One of the always-on fleets on the Tasks dashboard.
nonisolated struct TaskFleet: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    let kind: TaskKind
    var completedUnits: Int
    var progress: Double
    var concurrency: Int
    var latencyMs: Int

    nonisolated var name: String { kind.fleetName }
    nonisolated var unit: String { kind.unit }
}

/// A throughput sample for the Tasks chart.
nonisolated struct ThroughputSample: Identifiable, Hashable, Sendable {
    let id = UUID()
    let date: Date
    var value: Int
}

/// Ranges offered by the throughput chart picker.
nonisolated enum ChartRange: String, CaseIterable, Identifiable, Sendable {
    case hour = "1H"
    case sixHours = "6H"
    case day = "24H"

    nonisolated var id: String { rawValue }

    nonisolated var sampleCount: Int {
        switch self {
        case .hour: return 60
        case .sixHours: return 72
        case .day: return 96
        }
    }

    nonisolated var stride: TimeInterval {
        switch self {
        case .hour: return 60
        case .sixHours: return 300
        case .day: return 900
        }
    }
}
