import Foundation

/// Encoder presets exposed in the pipeline panel, slowest-to-fastest.
nonisolated enum EncoderPreset: String, Codable, CaseIterable, Identifiable, Sendable {
    case ultrafast
    case veryfast
    case medium
    case slow

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .ultrafast: return "Ultrafast"
        case .veryfast: return "Veryfast"
        case .medium: return "Medium"
        case .slow: return "Slow"
        }
    }

    nonisolated var note: String {
        switch self {
        case .ultrafast: return "Draft speed, largest files"
        case .veryfast: return "Quick review copies"
        case .medium: return "Balanced default"
        case .slow: return "Smallest file, longest render"
        }
    }
}

/// Delivery formats offered by the panel. Values map straight to `-s` in ffmpeg.
nonisolated enum RenderFormat: String, Codable, CaseIterable, Identifiable, Sendable {
    case uhd4K
    case fullHD
    case vertical
    case square

    nonisolated var id: String { rawValue }

    nonisolated var resolution: String {
        switch self {
        case .uhd4K: return "3840x2160"
        case .fullHD: return "1920x1080"
        case .vertical: return "1080x1920"
        case .square: return "1080x1080"
        }
    }

    nonisolated var title: String {
        switch self {
        case .uhd4K: return "4K UHD"
        case .fullHD: return "1080p"
        case .vertical: return "Vertical"
        case .square: return "Square"
        }
    }

    nonisolated var note: String {
        switch self {
        case .uhd4K: return "YouTube master"
        case .fullHD: return "Fast delivery"
        case .vertical: return "Shorts / Reels"
        case .square: return "Feed posts"
        }
    }

    nonisolated static func matching(_ resolution: String) -> RenderFormat? {
        allCases.first { $0.resolution == resolution }
    }
}

/// Screen colours the compositor can key. Names match `NAMED_COLORS` in
/// `green_machine.py`, so the config stays readable rather than carrying hex.
nonisolated enum ChromaKey: String, Codable, CaseIterable, Identifiable, Sendable {
    case green
    case blue
    case magenta

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .green: return "Green"
        case .blue: return "Blue"
        case .magenta: return "Magenta"
        }
    }

    /// The paint the compositor keys against, for the swatch in the panel.
    nonisolated var hex: String {
        switch self {
        case .green: return "#00B140"
        case .blue: return "#0047BB"
        case .magenta: return "#FF00FF"
        }
    }

    nonisolated var note: String {
        switch self {
        case .green: return "Standard cyclorama paint"
        case .blue: return "Better for green wardrobe"
        case .magenta: return "Rare, for green and blue costumes"
        }
    }
}

/// Green-screen compositing, written as a `composite:` block on each scene.
///
/// The backdrop defaults to a flat colour rather than a file for the same
/// reason the LUT and watermark default to off: the phone cannot see the render
/// host's disk, so a shipped default that names a file is a guaranteed failure
/// on the first run.
nonisolated struct GreenScreenSettings: Codable, Hashable, Sendable {
    var isEnabled: Bool
    var key: ChromaKey
    /// When true the backdrop is `backdropFile` on the render host, otherwise
    /// the flat colour in `backdropColor`.
    var usesHostFile: Bool
    var backdropColor: String
    var backdropFile: String
    /// Key every scene, or only the first (the usual talking-head-plus-b-roll cut).
    var appliesToEveryScene: Bool
    var tolerance: Double
    var softness: Double
    var despill: Double
    var feather: Int
    var scale: Double
    var offsetX: Double
    var offsetY: Double

    nonisolated static let `default` = GreenScreenSettings(
        isEnabled: false,
        key: .green,
        usesHostFile: false,
        backdropColor: "#101018",
        backdropFile: "raw/backdrop.png",
        appliesToEveryScene: false,
        tolerance: 0.16,
        softness: 0.08,
        despill: 0.8,
        feather: 2,
        scale: 1.0,
        offsetX: 0,
        offsetY: 0
    )

    nonisolated static let toleranceRange: ClosedRange<Double> = 0.02...0.6
    nonisolated static let softnessRange: ClosedRange<Double> = 0...0.4
    nonisolated static let despillRange: ClosedRange<Double> = 0...1
    nonisolated static let featherRange: ClosedRange<Double> = 0...12
    nonisolated static let scaleRange: ClosedRange<Double> = 0.4...2.0
    nonisolated static let offsetRange: ClosedRange<Double> = -0.5...0.5

    /// What lands in `composite.background`.
    nonisolated var backgroundValue: String {
        usesHostFile
            ? backdropFile.trimmingCharacters(in: .whitespacesAndNewlines)
            : normalisedColor
    }

    /// `#RRGGBB`, upper-cased, falling back to the default on anything unusable.
    nonisolated var normalisedColor: String {
        let raw = backdropColor
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
            .uppercased()
        let expanded = raw.count == 3 ? raw.map { "\($0)\($0)" }.joined() : raw
        let isHex = expanded.count == 6 && expanded.allSatisfy(\.isHexDigit)
        return isHex ? "#\(expanded)" : "#101018"
    }

    /// True when the settings name a file this phone cannot verify.
    nonisolated var referencesUnverifiableFile: Bool {
        isEnabled && usesHostFile
    }

    nonisolated var isValid: Bool {
        guard isEnabled else { return true }
        if usesHostFile {
            return !backdropFile.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
        return true
    }

    nonisolated var summary: String {
        guard isEnabled else { return "Off" }
        let backdrop = usesHostFile ? backdropFile : normalisedColor
        let scope = appliesToEveryScene ? "every scene" : "first scene"
        return "\(key.title) key · \(backdrop) · \(scope)"
    }

    /// The `composite:` block, indented to sit under a scene segment.
    nonisolated func yamlBlock(indent: String) -> [String] {
        guard isEnabled else { return [] }
        // The background is always quoted: an unquoted `#101018` is an empty
        // value followed by a YAML comment, which the pipeline reads as a
        // missing background.
        return [
            "\(indent)composite:",
            "\(indent)  background: \"\(PipelineSettings.escape(backgroundValue))\"",
            "\(indent)  keyColor: \(key.rawValue)",
            "\(indent)  tolerance: \(PipelineSettings.number(tolerance))",
            "\(indent)  softness: \(PipelineSettings.number(softness))",
            "\(indent)  despill: \(PipelineSettings.number(despill))",
            "\(indent)  feather: \(feather)",
            "\(indent)  size: \(PipelineSettings.number(scale))",
            "\(indent)  x: \(PipelineSettings.number(offsetX))",
            "\(indent)  y: \(PipelineSettings.number(offsetY))",
        ]
    }
}

/// The body of `POST /v1/preview-key`: one frame from the paired computer,
/// keyed with exactly these settings.
///
/// Built from the same `GreenScreenSettings` that generates the config, so the
/// preview and the render cannot disagree about tolerance, spill or placement.
/// Field names are the bridge's contract (`bridge.py` reads them verbatim).
nonisolated struct KeyPreviewRequest: Codable, Sendable {
    /// Clip on the render host, relative to the pipeline folder.
    var source: String
    /// Seconds into that clip.
    var time: Double
    var keyColor: String
    var background: String
    var tolerance: Double
    var softness: Double
    var despill: Double
    var feather: Int
    var size: Double
    var x: Double
    var y: Double

    nonisolated init(settings: GreenScreenSettings, source: String, time: Double) {
        self.source = source
        self.time = max(0, time)
        // Sent raw, exactly as the config would spell it — not reinterpreted.
        self.keyColor = settings.key.rawValue
        self.background = settings.backgroundValue
        self.tolerance = settings.tolerance
        self.softness = settings.softness
        self.despill = settings.despill
        self.feather = settings.feather
        self.size = settings.scale
        self.x = settings.offsetX
        self.y = settings.offsetY
    }
}

/// One rendered segment of a timeline: a real file, a real in/out point, and
/// the handoff to the next shot.
///
/// This is the structured form of a `sceneSegments:` entry. The storyboard
/// builds these from cast scenes, so the config that reaches the render host
/// describes an actual cut rather than placeholder clip names.
nonisolated struct SceneSegment: Hashable, Sendable {
    /// Segment id in the config — also the tmp filename on the render host.
    var id: String
    /// Path relative to the pipeline folder, e.g. `raw/take_04.mp4`.
    var file: String
    var startSeconds: Double
    var endSeconds: Double
    /// Pipeline transition grammar, e.g. `fade 1.5` or `cut`.
    var transition: String
    /// Whether this segment carries a `composite:` block.
    var isKeyed: Bool

    nonisolated var durationSeconds: Double { max(0, endSeconds - startSeconds) }

    /// `00:01:30` — the only time format the pipeline parses unambiguously.
    nonisolated static func timecode(_ seconds: Double) -> String {
        let total = max(0, Int(seconds.rounded()))
        return String(format: "%02d:%02d:%02d", total / 3600, (total % 3600) / 60, total % 60)
    }
}

/// A named starting point for the encode — the six jobs this pipeline is
/// actually asked to do, each one a real set of encoder values rather than a
/// label.
///
/// A preset only moves delivery and quality knobs. Keying, subtitles, grade,
/// watermark and publishing are decisions about *this* film, and a preset that
/// silently turned off a chroma key or flipped a video to public would be a
/// trap. Those are left exactly as the user set them.
nonisolated enum PipelinePreset: String, Codable, CaseIterable, Identifiable, Sendable {
    case master
    case archive
    case delivery
    case shorts
    case feed
    case proof

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .master: return "YouTube master"
        case .archive: return "Archive"
        case .delivery: return "Delivery"
        case .shorts: return "Shorts"
        case .feed: return "Feed square"
        case .proof: return "Proof copy"
        }
    }

    nonisolated var note: String {
        switch self {
        case .master: return "The one you upload"
        case .archive: return "Keep forever, biggest file"
        case .delivery: return "1080p, quick to send"
        case .shorts: return "Vertical, no preview"
        case .feed: return "Square, small and sharp"
        case .proof: return "Fast and rough, to check the cut"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .master: return "play.rectangle.fill"
        case .archive: return "archivebox.fill"
        case .delivery: return "paperplane.fill"
        case .shorts: return "iphone.gen3"
        case .feed: return "square.grid.2x2.fill"
        case .proof: return "bolt.fill"
        }
    }

    nonisolated var format: RenderFormat {
        switch self {
        case .master, .archive: return .uhd4K
        case .delivery, .proof: return .fullHD
        case .shorts: return .vertical
        case .feed: return .square
        }
    }

    nonisolated var fps: Int {
        switch self {
        case .master, .archive: return 60
        case .delivery, .shorts, .feed, .proof: return 30
        }
    }

    nonisolated var crf: Int {
        switch self {
        case .master: return 18
        case .archive: return 14
        case .delivery: return 20
        case .shorts: return 20
        case .feed: return 21
        case .proof: return 28
        }
    }

    nonisolated var bitrateMbps: Int {
        switch self {
        case .master: return 50
        case .archive: return 90
        case .delivery: return 24
        case .shorts: return 16
        case .feed: return 12
        case .proof: return 8
        }
    }

    nonisolated var preset: EncoderPreset {
        switch self {
        case .master: return .medium
        case .archive: return .slow
        case .delivery, .shorts, .feed: return .veryfast
        case .proof: return .ultrafast
        }
    }

    /// Vertical cuts are watched whole, and a proof copy is already the preview
    /// — a second short file from either is wasted render time.
    nonisolated var makesPreview: Bool {
        switch self {
        case .master, .archive, .delivery, .feed: return true
        case .shorts, .proof: return false
        }
    }

    nonisolated var previewSeconds: Int {
        switch self {
        case .archive: return 45
        case .feed: return 15
        default: return 30
        }
    }

    nonisolated var summary: String {
        "\(format.resolution) · \(fps)fps · CRF \(crf) · \(preset.title.lowercased())"
    }
}

/// Every knob the render panel writes into `config.yaml` before houly-pipe runs.
///
/// The field names and value formats here are the pipeline's contract — changing
/// one means changing `houly-pipe/config.yaml` too.
nonisolated struct PipelineSettings: Codable, Hashable, Sendable {
    var format: RenderFormat
    var fps: Int
    /// Ceiling in megabits per second, applied as `-maxrate`.
    var bitrateMbps: Int
    /// Constant Rate Factor for the final encode. Lower is better quality.
    var crf: Int
    var preset: EncoderPreset
    var burnSubtitles: Bool
    var applyLUT: Bool
    var watermark: Bool
    var makePreview: Bool
    var previewSeconds: Int
    var uploadToYouTube: Bool
    var privacy: YouTubePrivacy
    var greenScreen: GreenScreenSettings

    /// Subtitles, LUT and watermark default to off on purpose: each one writes a
    /// path (`assets/logo.png`, `assets/grade.cube`, `raw/merged.vtt`) into the
    /// config, and the phone cannot know whether that file exists on the render
    /// host. Defaulting them on made every out-of-the-box remote render fail.
    nonisolated static let `default` = PipelineSettings(
        format: .uhd4K,
        fps: 60,
        bitrateMbps: 50,
        crf: 18,
        preset: .medium,
        burnSubtitles: false,
        applyLUT: false,
        watermark: false,
        makePreview: true,
        previewSeconds: 30,
        uploadToYouTube: false,
        privacy: .privateVideo,
        greenScreen: .default
    )

    nonisolated static let fpsChoices: [Int] = [24, 25, 30, 50, 60]
    nonisolated static let crfRange: ClosedRange<Double> = 12...32
    nonisolated static let bitrateRange: ClosedRange<Double> = 5...120

    nonisolated var resolution: String { format.resolution }

    /// The preset these settings currently match, if any. Turning a single knob
    /// afterwards clears the badge rather than lying about which one is on.
    nonisolated var matchedPreset: PipelinePreset? {
        PipelinePreset.allCases.first { matches($0) }
    }

    nonisolated func matches(_ preset: PipelinePreset) -> Bool {
        format == preset.format
            && fps == preset.fps
            && crf == preset.crf
            && bitrateMbps == preset.bitrateMbps
            && self.preset == preset.preset
            && makePreview == preset.makesPreview
            && (!makePreview || previewSeconds == preset.previewSeconds)
    }

    /// Applies a preset's encode values, leaving keying, grade, subtitles,
    /// watermark and publishing exactly where the user left them.
    nonisolated mutating func apply(_ preset: PipelinePreset) {
        format = preset.format
        fps = preset.fps
        crf = preset.crf
        bitrateMbps = preset.bitrateMbps
        self.preset = preset.preset
        makePreview = preset.makesPreview
        previewSeconds = preset.previewSeconds
    }

    nonisolated func applying(_ preset: PipelinePreset) -> PipelineSettings {
        var copy = self
        copy.apply(preset)
        return copy
    }

    /// The `--stages` argument for a remote run.
    ///
    /// Skipping a stage the settings disabled saves real minutes on the render
    /// host, and keeps the bridge's progress weighting honest.
    nonisolated var stagesArgument: String {
        var stages: [String] = []
        if greenScreen.isEnabled { stages.append("composite") }
        stages.append(contentsOf: ["trim", "render"])
        if makePreview { stages.append("preview") }
        if uploadToYouTube { stages.append("upload") }
        return stages.joined(separator: ",")
    }

    /// Human summary shown under the panel title.
    nonisolated var summary: String {
        let base = "\(format.resolution) · \(fps)fps · CRF \(crf) · ≤\(bitrateMbps)M · \(preset.title.lowercased())"
        return greenScreen.isEnabled ? base + " · keyed" : base
    }

    /// Rough guide so the user knows what a knob costs before rendering.
    nonisolated var estimatedGigabytesPerHour: Double {
        // Capped-CRF output lands near the ceiling on complex footage.
        Double(bitrateMbps) * 3600 / 8 / 1024 * 0.62
    }

    /// The exact `config.yaml` houly-pipe consumes.
    ///
    /// Scene segments are emitted as commented placeholders because the clips
    /// live on the render host, not on the phone — everything above them is
    /// ready to run as written.
    nonisolated func configYAML(projectTitle: String, scenes: [String] = []) -> String {
        var lines: [String] = []
        lines.append("# Generated by Intégrav · \(Self.stamp())")
        lines.append("# Drop this next to scripts/ and run: python3 scripts/pipeline.py")
        lines.append("")
        lines.append("pipeline:")
        lines.append("  resolution: \(format.resolution)")
        lines.append("  fps: \(fps)")
        lines.append("  codec: libx264")
        lines.append("  crf: \(crf)")
        lines.append("  preset: \(preset.rawValue)")
        lines.append("  bitrate: \(bitrateMbps)M")
        lines.append("  intermediateCrf: \(max(12, crf - 2))")
        if applyLUT { lines.append("  lut: assets/grade.cube") }
        if watermark {
            lines.append("  logo: assets/logo.png")
            lines.append("  logoScale: 0.08")
            lines.append("  logoSeconds: 8")
        }
        if burnSubtitles { lines.append("  subtitles: raw/merged.vtt") }
        lines.append("  fadeInFromBlack: 1")
        lines.append("  tmpDir: tmp")
        lines.append("  outputFile: out/\(Self.slug(projectTitle)).mp4")
        lines.append("  preview: \(makePreview)")
        if makePreview { lines.append("  previewSeconds: \(previewSeconds)") }
        lines.append("  thumbnailAt: 00:00:05")
        lines.append("")
        lines.append("sceneSegments:")
        if scenes.isEmpty {
            lines.append("  # Replace with your clips — start/end accept 00:00:00 or 90s / 3m40s.")
            lines.append("  - id: intro")
            lines.append("    file: raw/intro.mp4")
            lines.append("    start: 00:00:00")
            lines.append("    end: 00:00:30")
            lines.append("    transition: fade 1.5")
            lines.append(contentsOf: compositeLines(sceneIndex: 0))
            lines.append("  - id: body")
            lines.append("    file: raw/body.mp4")
            lines.append("    start: 00:00:00")
            lines.append("    end: 00:04:00")
            lines.append("    transition: cut")
            lines.append(contentsOf: compositeLines(sceneIndex: 1))
        } else {
            for (index, scene) in scenes.enumerated() {
                lines.append("  - id: \(Self.slug(scene))")
                lines.append("    file: raw/\(Self.slug(scene)).mp4")
                lines.append("    start: 00:00:00")
                lines.append("    end: 00:01:00")
                lines.append("    transition: \(index == scenes.count - 1 ? "fade 2" : "fade 1.5")")
                lines.append(contentsOf: compositeLines(sceneIndex: index))
            }
        }
        lines.append("")
        lines.append("youtube:")
        lines.append("  upload: \(uploadToYouTube)")
        lines.append("  title: \"\(Self.escape(projectTitle))\"")
        lines.append("  privacy: \(privacy.rawValue)")
        lines.append("  categoryId: \"22\"")
        lines.append("  tags: [integrav, render]")
        lines.append("")
        return lines.joined(separator: "\n")
    }

    /// The exact `config.yaml` for a real timeline.
    ///
    /// Unlike the placeholder form above, every segment here names a file the
    /// render host is expected to hold, with in and out points taken from the
    /// storyboard. `header` carries the film's intent (logline, grade) as
    /// comments so the config explains itself on the render machine.
    nonisolated func configYAML(
        projectTitle: String,
        segments: [SceneSegment],
        header: [String] = []
    ) -> String {
        var lines: [String] = []
        lines.append("# Generated by Int\u{00E9}grav \u{00B7} \(Self.stamp())")
        for note in header where !note.isEmpty {
            lines.append("# \(note)")
        }
        lines.append("# Drop this next to scripts/ and run: python3 scripts/pipeline.py")
        lines.append("")
        lines.append("pipeline:")
        lines.append("  resolution: \(format.resolution)")
        lines.append("  fps: \(fps)")
        lines.append("  codec: libx264")
        lines.append("  crf: \(crf)")
        lines.append("  preset: \(preset.rawValue)")
        lines.append("  bitrate: \(bitrateMbps)M")
        lines.append("  intermediateCrf: \(max(12, crf - 2))")
        if applyLUT { lines.append("  lut: assets/grade.cube") }
        if watermark {
            lines.append("  logo: assets/logo.png")
            lines.append("  logoScale: 0.08")
            lines.append("  logoSeconds: 8")
        }
        if burnSubtitles { lines.append("  subtitles: raw/merged.vtt") }
        lines.append("  fadeInFromBlack: 1")
        lines.append("  tmpDir: tmp")
        lines.append("  outputFile: out/\(Self.slug(projectTitle)).mp4")
        lines.append("  preview: \(makePreview)")
        if makePreview { lines.append("  previewSeconds: \(previewSeconds)") }
        lines.append("  thumbnailAt: 00:00:05")
        lines.append("")
        lines.append("sceneSegments:")
        for (index, segment) in segments.enumerated() {
            lines.append("  - id: \(segment.id)")
            lines.append("    file: \(segment.file)")
            lines.append("    start: \(SceneSegment.timecode(segment.startSeconds))")
            lines.append("    end: \(SceneSegment.timecode(segment.endSeconds))")
            lines.append("    transition: \(segment.transition)")
            // Keying is per segment here rather than "first scene only": a
            // storyboard knows exactly which beats were shot on the cyclorama.
            if greenScreen.isEnabled && segment.isKeyed {
                lines.append(contentsOf: greenScreen.yamlBlock(indent: "    "))
            }
            _ = index
        }
        lines.append("")
        lines.append("youtube:")
        lines.append("  upload: \(uploadToYouTube)")
        lines.append("  title: \"\(Self.escape(projectTitle))\"")
        lines.append("  privacy: \(privacy.rawValue)")
        lines.append("  categoryId: \"22\"")
        lines.append("  tags: [integrav, render]")
        lines.append("")
        return lines.joined(separator: "\n")
    }

    /// Stage list for a storyboard run, which keys whichever scenes ask for it
    /// rather than following the panel's "first scene only" rule.
    nonisolated func stagesArgument(keyingAnyScene: Bool) -> String {
        var stages: [String] = []
        if greenScreen.isEnabled && keyingAnyScene { stages.append("composite") }
        stages.append(contentsOf: ["trim", "render"])
        if makePreview { stages.append("preview") }
        if uploadToYouTube { stages.append("upload") }
        return stages.joined(separator: ",")
    }

    /// The `composite:` block for one scene, empty when it is not keyed.
    ///
    /// Keying is opt-in per scene rather than global: a talking head shot on a
    /// cyclorama and a b-roll insert live in the same timeline, and running the
    /// b-roll through a keyer would punch holes in whatever happens to be green.
    nonisolated private func compositeLines(sceneIndex: Int) -> [String] {
        guard greenScreen.isEnabled else { return [] }
        guard greenScreen.appliesToEveryScene || sceneIndex == 0 else { return [] }
        return greenScreen.yamlBlock(indent: "    ")
    }

    nonisolated static func slug(_ text: String) -> String {
        let lowered = text.lowercased()
        let mapped = lowered.map { character -> Character in
            character.isLetter || character.isNumber ? character : "_"
        }
        let collapsed = String(mapped)
            .split(separator: "_", omittingEmptySubsequences: true)
            .joined(separator: "_")
        let trimmed = collapsed.isEmpty ? "render" : collapsed
        return String(trimmed.prefix(48))
    }

    /// Compact YAML number: `1.0` becomes `1`, `0.16` stays `0.16`.
    nonisolated static func number(_ value: Double) -> String {
        let rounded = (value * 1000).rounded() / 1000
        if rounded == rounded.rounded() { return String(Int(rounded)) }
        return String(rounded)
    }

    nonisolated static func escape(_ text: String) -> String {
        text.replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
    }

    nonisolated private static func stamp() -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        return formatter.string(from: .now)
    }
}
