import Foundation

/// The five stages a houly-pipe render moves through, in order.
///
/// These mirror the Python pipeline exactly
/// (`--stages composite,trim,render,preview,upload`) so a job tracked here reads
/// the same as a job tailed in a terminal.
nonisolated enum RenderStage: String, Codable, CaseIterable, Identifiable, Sendable {
    case composite
    case trim
    case render
    case preview
    case upload

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .composite: return "Green screen"
        case .trim: return "Trim & normalise"
        case .render: return "Render master"
        case .preview: return "Preview & thumbnail"
        case .upload: return "Upload"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .composite: return "person.and.background.dotted"
        case .trim: return "scissors"
        case .render: return "wand.and.stars"
        case .preview: return "photo.on.rectangle.angled"
        case .upload: return "icloud.and.arrow.up"
        }
    }

    nonisolated var order: Int {
        switch self {
        case .composite: return 0
        case .trim: return 1
        case .render: return 2
        case .preview: return 3
        case .upload: return 4
        }
    }

    /// Share of total wall time this stage takes. Weighted from real pipeline
    /// runs — the single filtergraph render dominates everything else.
    nonisolated var weight: Double {
        switch self {
        // Keying is per-frame work in Python rather than one ffmpeg pass, so it
        // is dear next to a trim. Matches STAGE_WEIGHTS in pipeline.py.
        case .composite: return 0.30
        case .trim: return 0.24
        case .render: return 0.60
        case .preview: return 0.04
        case .upload: return 0.12
        }
    }
}

/// One queued video render. Mirrors a `config.yaml` handed to houly-pipe.
nonisolated struct RenderJob: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var sceneCount: Int
    /// Length of the finished master, in seconds.
    var outputDuration: TimeInterval
    var resolution: String
    var fps: Int
    var stage: RenderStage
    /// Progress inside the current stage, 0…1.
    var stageProgress: Double
    var uploadsToYouTube: Bool
    /// Whether this job keys a green screen before cutting.
    var usesGreenScreen: Bool
    let queuedAt: Date
    var finishedAt: Date?
    /// Set when a stage fails; the job stops advancing and shows this reason.
    var failure: String?

    nonisolated init(
        id: UUID = UUID(),
        title: String,
        sceneCount: Int,
        outputDuration: TimeInterval,
        resolution: String = "3840x2160",
        fps: Int = 60,
        stage: RenderStage = .trim,
        stageProgress: Double = 0,
        uploadsToYouTube: Bool = false,
        usesGreenScreen: Bool = false,
        queuedAt: Date = .now,
        finishedAt: Date? = nil,
        failure: String? = nil
    ) {
        self.id = id
        self.title = title
        self.sceneCount = sceneCount
        self.outputDuration = outputDuration
        self.resolution = resolution
        self.fps = fps
        self.stage = stage
        self.stageProgress = stageProgress
        self.uploadsToYouTube = uploadsToYouTube
        self.usesGreenScreen = usesGreenScreen
        self.queuedAt = queuedAt
        self.finishedAt = finishedAt
        self.failure = failure
    }

    /// Stages this job will actually run.
    ///
    /// A stage nobody asked for must be absent rather than shown at zero: the
    /// progress bar normalises over this list, so an inert stage would hold the
    /// bar back from 100% on a job that is genuinely finished.
    nonisolated var activeStages: [RenderStage] {
        RenderStage.allCases.filter { stage in
            switch stage {
            case .composite: return usesGreenScreen
            case .upload: return uploadsToYouTube
            default: return true
            }
        }
    }

    nonisolated var isFinished: Bool { finishedAt != nil }

    nonisolated var hasFailed: Bool { failure != nil }

    /// Weighted progress across every active stage, 0…1.
    nonisolated var overallProgress: Double {
        if isFinished { return 1 }
        let stages = activeStages
        let total = stages.reduce(0.0) { $0 + $1.weight }
        guard total > 0 else { return 0 }
        let clamped = min(1, max(0, stageProgress))
        let done = stages.reduce(0.0) { running, candidate in
            if candidate.order < stage.order { return running + candidate.weight }
            if candidate == stage { return running + candidate.weight * clamped }
            return running
        }
        return min(1, done / total)
    }

    /// Decoding tolerates jobs persisted before green screen existed.
    nonisolated enum CodingKeys: String, CodingKey {
        case id, title, sceneCount, outputDuration, resolution, fps, stage
        case stageProgress, uploadsToYouTube, usesGreenScreen, queuedAt, finishedAt, failure
    }

    nonisolated init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        sceneCount = try container.decode(Int.self, forKey: .sceneCount)
        outputDuration = try container.decode(TimeInterval.self, forKey: .outputDuration)
        resolution = try container.decode(String.self, forKey: .resolution)
        fps = try container.decode(Int.self, forKey: .fps)
        stage = try container.decode(RenderStage.self, forKey: .stage)
        stageProgress = try container.decode(Double.self, forKey: .stageProgress)
        uploadsToYouTube = try container.decode(Bool.self, forKey: .uploadsToYouTube)
        usesGreenScreen = try container.decodeIfPresent(Bool.self, forKey: .usesGreenScreen) ?? false
        queuedAt = try container.decode(Date.self, forKey: .queuedAt)
        finishedAt = try container.decodeIfPresent(Date.self, forKey: .finishedAt)
        failure = try container.decodeIfPresent(String.self, forKey: .failure)
    }

    nonisolated var statusLabel: String {
        if let failure { return failure }
        if isFinished { return uploadsToYouTube ? "Uploaded" : "Master ready" }
        return stage.title
    }

    /// `0:04:12` style label for the finished master length.
    nonisolated var durationLabel: String {
        let total = Int(outputDuration.rounded())
        let hours = total / 3600
        let minutes = (total % 3600) / 60
        let seconds = total % 60
        return hours > 0
            ? String(format: "%d:%02d:%02d", hours, minutes, seconds)
            : String(format: "%d:%02d", minutes, seconds)
    }

    nonisolated var formatLabel: String { "\(resolution) @ \(fps)" }
}
