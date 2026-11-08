import Foundation

/// How a scene is played — the emotional register the performer steps into.
///
/// Each case carries real direction: the camera, lens, movement and light that
/// the shot is normally built from. This is what turns "put me in the fight
/// scene" into something a render can actually be cut to, rather than a label.
nonisolated enum ScenePerformance: String, Codable, CaseIterable, Identifiable, Sendable {
    case romance
    case brave
    case fight
    case chase
    case reveal
    case heartbreak
    case triumph
    case menace
    case comedy
    case noir
    case wonder
    case farewell

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .romance: return "Romantic"
        case .brave: return "Brave"
        case .fight: return "Fight"
        case .chase: return "Chase"
        case .reveal: return "The reveal"
        case .heartbreak: return "Heartbreak"
        case .triumph: return "Triumph"
        case .menace: return "Menace"
        case .comedy: return "Comedy"
        case .noir: return "Noir"
        case .wonder: return "Wonder"
        case .farewell: return "Farewell"
        }
    }

    /// One line describing what the audience sees.
    nonisolated var tagline: String {
        switch self {
        case .romance: return "Two people, one breath apart"
        case .brave: return "Walking toward the thing that scares you"
        case .fight: return "Impact, recovery, impact"
        case .chase: return "Everything moving, nothing safe"
        case .reveal: return "The moment the truth lands"
        case .heartbreak: return "Holding it together, failing"
        case .triumph: return "Earned, and finally allowed"
        case .menace: return "Stillness that promises violence"
        case .comedy: return "Timing, and the face after"
        case .noir: return "Smoke, blinds, bad decisions"
        case .wonder: return "Seeing something impossible"
        case .farewell: return "The last look back"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .romance: return "heart.fill"
        case .brave: return "shield.lefthalf.filled"
        case .fight: return "bolt.fill"
        case .chase: return "figure.run"
        case .reveal: return "eye.fill"
        case .heartbreak: return "heart.slash.fill"
        case .triumph: return "trophy.fill"
        case .menace: return "flame.fill"
        case .comedy: return "theatermasks.fill"
        case .noir: return "moon.stars.fill"
        case .wonder: return "sparkles"
        case .farewell: return "hand.wave.fill"
        }
    }

    /// How to play it, in the words a director would actually use.
    nonisolated var direction: String {
        switch self {
        case .romance:
            return "Hold eye contact a beat past comfortable. Small movements. Let the silence do the work — the line matters less than the pause before it."
        case .brave:
            return "Set your jaw, breathe out, then move. Fear first, decision second. The audience needs to see the cost before the courage."
        case .fight:
            return "Sell the reaction, not the blow. Land, absorb, reset. Keep the eyeline on your opponent between hits."
        case .chase:
            return "Look back once, never twice. Push through frame rather than across it. Breathing should be audible."
        case .reveal:
            return "Take it in before you react. Two full seconds of nothing, then let it change your face."
        case .heartbreak:
            return "Fight it. The performance is the resistance, not the tears — hold the line until it breaks on its own."
        case .triumph:
            return "Exhaustion first. Let the win arrive late and quiet, then lift your head."
        case .menace:
            return "Move as little as possible. Speak under the room's volume so everyone leans in."
        case .comedy:
            return "Play it completely straight. The joke is that you mean it. Hold the reaction one beat too long."
        case .noir:
            return "Everything is a little too slow and a little too certain. Look at things, not people."
        case .wonder:
            return "Let your face arrive before your words. Eyes wide, mouth slightly open, then forget to breathe."
        case .farewell:
            return "Say it to their shoulder, not their eyes. Turn away first — the audience will follow you out."
        }
    }

    /// Shot construction, shown on the scene card as the shooting note.
    nonisolated var camera: String {
        switch self {
        case .romance: return "Close-up, eye level"
        case .brave: return "Low angle, medium"
        case .fight: return "Handheld, medium-wide"
        case .chase: return "Tracking, wide"
        case .reveal: return "Slow push-in, close"
        case .heartbreak: return "Static close-up"
        case .triumph: return "Rising crane, wide"
        case .menace: return "Locked-off medium"
        case .comedy: return "Flat wide, centred"
        case .noir: return "Dutch angle, medium"
        case .wonder: return "Low angle, wide"
        case .farewell: return "Over-the-shoulder"
        }
    }

    nonisolated var lens: String {
        switch self {
        case .romance: return "85mm f/1.4"
        case .brave: return "35mm f/2"
        case .fight: return "24mm f/2.8"
        case .chase: return "18mm f/4"
        case .reveal: return "50mm f/1.8"
        case .heartbreak: return "85mm f/2"
        case .triumph: return "24mm f/4"
        case .menace: return "50mm f/2.8"
        case .comedy: return "35mm f/5.6"
        case .noir: return "40mm f/2"
        case .wonder: return "16mm f/4"
        case .farewell: return "65mm f/2"
        }
    }

    nonisolated var lighting: String {
        switch self {
        case .romance: return "Warm key, deep falloff"
        case .brave: return "Hard backlight, rim"
        case .fight: return "Hard top light, contrast"
        case .chase: return "Available light, motion blur"
        case .reveal: return "Single source, side key"
        case .heartbreak: return "Soft window light"
        case .triumph: return "Golden hour, backlit"
        case .menace: return "Underlit, long shadow"
        case .comedy: return "Flat and bright"
        case .noir: return "Venetian slats, hard"
        case .wonder: return "Cool ambient bounce"
        case .farewell: return "Dusk, low contrast"
        }
    }

    /// Accent colour for the scene card, as hex.
    nonisolated var tintHex: String {
        switch self {
        case .romance: return "#FF4D8D"
        case .brave: return "#FFB020"
        case .fight: return "#FF3B30"
        case .chase: return "#FF7A18"
        case .reveal: return "#00D4FF"
        case .heartbreak: return "#7A5CFF"
        case .triumph: return "#FFD84D"
        case .menace: return "#B026FF"
        case .comedy: return "#FFE14D"
        case .noir: return "#8E9AAF"
        case .wonder: return "#41E0C0"
        case .farewell: return "#5B8DEF"
        }
    }

    /// Typical length of a beat played this way.
    nonisolated var defaultSeconds: Int {
        switch self {
        case .romance: return 45
        case .brave: return 30
        case .fight: return 60
        case .chase: return 50
        case .reveal: return 20
        case .heartbreak: return 40
        case .triumph: return 35
        case .menace: return 30
        case .comedy: return 25
        case .noir: return 40
        case .wonder: return 30
        case .farewell: return 35
        }
    }

    /// How this beat normally hands off to the next one.
    nonisolated var suggestedTransition: SceneTransition {
        switch self {
        case .romance, .heartbreak, .farewell: return .dissolve
        case .brave, .triumph, .wonder: return .fade
        case .fight, .chase, .comedy: return .cut
        case .reveal: return .circleOpen
        case .menace, .noir: return .slowFade
        }
    }
}

/// How one scene hands off to the next. Values map to the pipeline's
/// `transition:` grammar, which xfade drives on the render host.
nonisolated enum SceneTransition: String, Codable, CaseIterable, Identifiable, Sendable {
    case cut
    case fade
    case slowFade
    case dissolve
    case wipeLeft
    case slideUp
    case circleOpen

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .cut: return "Cut"
        case .fade: return "Fade"
        case .slowFade: return "Slow fade"
        case .dissolve: return "Dissolve"
        case .wipeLeft: return "Wipe"
        case .slideUp: return "Slide up"
        case .circleOpen: return "Iris"
        }
    }

    /// Exactly what the pipeline reads. `green_machine`/`pipeline.py` parse
    /// "name seconds", so the spelling here is a contract, not a label.
    nonisolated var pipelineValue: String {
        switch self {
        case .cut: return "cut"
        case .fade: return "fade 1.5"
        case .slowFade: return "fade 3"
        case .dissolve: return "dissolve 1.5"
        case .wipeLeft: return "wipeleft 1"
        case .slideUp: return "slideup 0.8"
        case .circleOpen: return "circleopen 1"
        }
    }

    /// Seconds the handoff itself occupies, for the timeline maths.
    nonisolated var seconds: Double {
        switch self {
        case .cut: return 0
        case .fade: return 1.5
        case .slowFade: return 3
        case .dissolve: return 1.5
        case .wipeLeft: return 1
        case .slideUp: return 0.8
        case .circleOpen: return 1
        }
    }
}

/// The overall look of a film, which sets the grade and the delivery defaults.
nonisolated enum StoryGenre: String, Codable, CaseIterable, Identifiable, Sendable {
    case action
    case romance
    case thriller
    case drama
    case epic

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .action: return "Action"
        case .romance: return "Romance"
        case .thriller: return "Thriller"
        case .drama: return "Drama"
        case .epic: return "Epic"
        }
    }

    nonisolated var symbol: String {
        switch self {
        case .action: return "flame.fill"
        case .romance: return "heart.fill"
        case .thriller: return "eye.trianglebadge.exclamationmark.fill"
        case .drama: return "theatermasks.fill"
        case .epic: return "mountain.2.fill"
        }
    }

    /// The grade note printed into the config as a comment, so the render host
    /// records the intent alongside the numbers.
    nonisolated var gradeNote: String {
        switch self {
        case .action: return "Crushed blacks, warm highlights, high micro-contrast"
        case .romance: return "Lifted blacks, soft warm skin, gentle rolloff"
        case .thriller: return "Cyan shadows, desaturated mids, hard specular"
        case .drama: return "Neutral, filmic curve, protected skin tones"
        case .epic: return "Wide latitude, teal-orange separation, deep sky"
        }
    }

    nonisolated var tintHex: String {
        switch self {
        case .action: return "#FF3B30"
        case .romance: return "#FF4D8D"
        case .thriller: return "#00D4FF"
        case .drama: return "#B08CFF"
        case .epic: return "#FFB020"
        }
    }
}

/// One beat of a film, and who is playing it.
///
/// A scene is "cast" when it points at footage that exists on this device.
/// Until then it is a plan: real direction, real timing, no performer.
nonisolated struct StoryScene: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var performance: ScenePerformance
    var seconds: Int
    /// The director's note. Seeded from the performance, then editable.
    var direction: String
    /// The clip cast into this scene, if any.
    var clipID: UUID?
    var clipName: String?
    var clipFileName: String?
    /// Poster frame from the cast take, so the board shows the performance.
    var clipThumbnailName: String?
    /// Where in the cast clip this scene starts.
    var startSeconds: Double
    var transition: SceneTransition
    /// Whether this scene is shot on a green screen and needs keying.
    var isKeyed: Bool

    nonisolated init(
        id: UUID = UUID(),
        title: String,
        performance: ScenePerformance,
        seconds: Int? = nil,
        direction: String? = nil,
        clipID: UUID? = nil,
        clipName: String? = nil,
        clipFileName: String? = nil,
        clipThumbnailName: String? = nil,
        startSeconds: Double = 0,
        transition: SceneTransition? = nil,
        isKeyed: Bool = false
    ) {
        self.id = id
        self.title = title
        self.performance = performance
        self.seconds = seconds ?? performance.defaultSeconds
        self.direction = direction ?? performance.direction
        self.clipID = clipID
        self.clipName = clipName
        self.clipFileName = clipFileName
        self.clipThumbnailName = clipThumbnailName
        self.startSeconds = startSeconds
        self.transition = transition ?? performance.suggestedTransition
        self.isKeyed = isKeyed
    }

    /// True when this scene points at footage that is still on the phone.
    ///
    /// Checked against the media container rather than trusted from the record:
    /// a clip deleted from the vault must un-cast the scenes it was in rather
    /// than leaving a storyboard that claims to be ready and cannot render.
    nonisolated var isCast: Bool { MediaLibrary.exists(clipFileName) }

    /// The file the render host must hold, derived from the clip's own name so
    /// two scenes cut from the same take reference one file.
    nonisolated var hostFile: String? {
        guard let clipName, isCast else { return nil }
        let base = PipelineSettings.slug((clipName as NSString).deletingPathExtension)
        let ext = (clipName as NSString).pathExtension.lowercased()
        let safeExtension = ext.isEmpty ? "mp4" : ext
        return "raw/\(base).\(safeExtension)"
    }

    nonisolated var endSeconds: Double { startSeconds + Double(seconds) }

    nonisolated var durationLabel: String {
        seconds < 60 ? "\(seconds)s" : String(format: "%d:%02d", seconds / 60, seconds % 60)
    }

    /// The shooting note under the title: how this beat is built.
    nonisolated var shotNote: String {
        "\(performance.camera) · \(performance.lens) · \(performance.lighting)"
    }
}

/// A film: an ordered set of beats, and the person starring in them.
nonisolated struct Storyboard: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var title: String
    var logline: String
    var genre: StoryGenre
    /// Who the film says it stars. Defaults to the signed-in performer.
    var starring: String
    var scenes: [StoryScene]
    let createdAt: Date
    var updatedAt: Date

    nonisolated init(
        id: UUID = UUID(),
        title: String,
        logline: String,
        genre: StoryGenre,
        starring: String = "You",
        scenes: [StoryScene],
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.logline = logline
        self.genre = genre
        self.starring = starring
        self.scenes = scenes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    /// Runtime of the finished cut, transitions included.
    ///
    /// Every transition except a cut overlaps the two shots it joins, so the
    /// finished film is shorter than the sum of its scenes — counting them as
    /// additive would overstate the runtime on every board.
    nonisolated var runtimeSeconds: Double {
        let raw = scenes.reduce(0.0) { $0 + Double($1.seconds) }
        guard scenes.count > 1 else { return raw }
        let overlap = scenes.dropLast().reduce(0.0) { $0 + $1.transition.seconds }
        return max(0, raw - overlap)
    }

    nonisolated var runtimeLabel: String {
        let total = Int(runtimeSeconds.rounded())
        if total < 60 { return "\(total)s" }
        return String(format: "%d:%02d", total / 60, total % 60)
    }

    nonisolated var castCount: Int { scenes.filter(\.isCast).count }

    nonisolated var isReadyToRender: Bool { !scenes.isEmpty && castCount == scenes.count }

    /// How far the board is from being shootable, 0...1.
    nonisolated var castProgress: Double {
        guard !scenes.isEmpty else { return 0 }
        return Double(castCount) / Double(scenes.count)
    }

    /// Files the render host needs in its `raw/` folder, deduplicated.
    ///
    /// The phone cannot push media to the computer — the bridge deliberately has
    /// no upload route — so the honest thing is to name exactly what has to be
    /// copied across rather than dispatching a render that will fail.
    nonisolated var footageChecklist: [FootageRequirement] {
        var seen: Set<String> = []
        var required: [FootageRequirement] = []
        for scene in scenes {
            guard let host = scene.hostFile, let source = scene.clipName else { continue }
            if seen.insert(host).inserted {
                required.append(FootageRequirement(hostFile: host, sourceName: source))
            }
        }
        return required
    }

    /// The segments the pipeline renders, in order.
    nonisolated func segments() -> [SceneSegment] {
        scenes.enumerated().compactMap { index, scene in
            guard let host = scene.hostFile else { return nil }
            return SceneSegment(
                id: "\(String(format: "%02d", index + 1))_\(PipelineSettings.slug(scene.title))",
                file: host,
                startSeconds: scene.startSeconds,
                endSeconds: scene.endSeconds,
                // The last scene's transition means "fade to black", so a hard
                // cut at the end of a film would slam to black mid-breath.
                transition: index == scenes.count - 1 ? SceneTransition.slowFade.pipelineValue : scene.transition.pipelineValue,
                isKeyed: scene.isKeyed
            )
        }
    }

    /// The shot list, as plain text worth sharing with a crew.
    nonisolated func shotList() -> String {
        var lines: [String] = []
        lines.append(title.uppercased())
        lines.append(logline)
        lines.append("\(genre.title) · \(runtimeLabel) · starring \(starring)")
        lines.append("Grade: \(genre.gradeNote)")
        lines.append("")
        for (index, scene) in scenes.enumerated() {
            lines.append("\(index + 1). \(scene.title.uppercased())  [\(scene.performance.title)]  \(scene.durationLabel)")
            lines.append("   Shot: \(scene.performance.camera), \(scene.performance.lens)")
            lines.append("   Light: \(scene.performance.lighting)")
            lines.append("   Direction: \(scene.direction)")
            if let clip = scene.clipName {
                lines.append("   Cast: \(clip)\(scene.startSeconds > 0 ? String(format: " from %.0fs", scene.startSeconds) : "")")
            } else {
                lines.append("   Cast: — not yet shot —")
            }
            lines.append("   Out: \(scene.transition.title)")
            lines.append("")
        }
        return lines.joined(separator: "\n")
    }
}

/// One file the render host needs before a board can be rendered.
nonisolated struct FootageRequirement: Identifiable, Hashable, Sendable {
    var hostFile: String
    var sourceName: String

    nonisolated var id: String { hostFile }
}

/// Ready-made story arcs. Each one is a real five-beat structure, so a user who
/// has never written a shot list still ends up with a film that has a shape.
nonisolated enum StoryTemplate: String, CaseIterable, Identifiable, Sendable {
    case lastStand
    case firstLight
    case theInformant
    case theComeback
    case longWayHome

    nonisolated var id: String { rawValue }

    nonisolated var title: String {
        switch self {
        case .lastStand: return "Last Stand"
        case .firstLight: return "First Light"
        case .theInformant: return "The Informant"
        case .theComeback: return "The Comeback"
        case .longWayHome: return "The Long Way Home"
        }
    }

    nonisolated var logline: String {
        switch self {
        case .lastStand: return "Outnumbered, out of time, and finally out of excuses."
        case .firstLight: return "Two strangers, one night, and everything they don't say."
        case .theInformant: return "The only way out is to tell the truth to the wrong person."
        case .theComeback: return "Everyone stopped watching. That was the easy part."
        case .longWayHome: return "You can go back. You just can't arrive the same."
        }
    }

    nonisolated var genre: StoryGenre {
        switch self {
        case .lastStand: return .action
        case .firstLight: return .romance
        case .theInformant: return .thriller
        case .theComeback: return .drama
        case .longWayHome: return .epic
        }
    }

    /// The beats, in order.
    nonisolated var beats: [(String, ScenePerformance)] {
        switch self {
        case .lastStand:
            return [
                ("Calm before", .menace),
                ("The line is drawn", .brave),
                ("First blood", .fight),
                ("Everything breaks", .chase),
                ("Still standing", .triumph),
            ]
        case .firstLight:
            return [
                ("Across the room", .wonder),
                ("The walk", .romance),
                ("What she doesn't say", .heartbreak),
                ("Three in the morning", .romance),
                ("Last look", .farewell),
            ]
        case .theInformant:
            return [
                ("The meeting", .noir),
                ("Someone is listening", .menace),
                ("The file", .reveal),
                ("Run", .chase),
                ("Nowhere left", .brave),
            ]
        case .theComeback:
            return [
                ("Empty room", .heartbreak),
                ("The offer", .reveal),
                ("Nobody's watching", .brave),
                ("The set", .comedy),
                ("Standing ovation", .triumph),
            ]
        case .longWayHome:
            return [
                ("Leaving", .farewell),
                ("The road", .wonder),
                ("What happened out there", .heartbreak),
                ("Turning back", .brave),
                ("The door", .romance),
            ]
        }
    }

    /// Builds a fresh board from this template.
    nonisolated func makeStoryboard(starring: String) -> Storyboard {
        Storyboard(
            title: title,
            logline: logline,
            genre: genre,
            starring: starring,
            scenes: beats.map { StoryScene(title: $0.0, performance: $0.1) }
        )
    }
}
