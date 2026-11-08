import Foundation
import Testing
import UIKit
@testable import Integrav

/// A film is only worth anything if the cut it describes is the cut that gets
/// rendered. These assert the arithmetic and the honesty: runtime that accounts
/// for transitions, scenes that refuse to claim footage they do not have, and a
/// config whose segments name real files.
@Suite("Storyboard timing")
struct StoryboardTimingTests {
    @Test func aSceneInheritsItsPerformancesDefaults() {
        let scene = StoryScene(title: "The walk", performance: .romance)
        #expect(scene.seconds == ScenePerformance.romance.defaultSeconds)
        #expect(scene.direction == ScenePerformance.romance.direction)
        #expect(scene.transition == ScenePerformance.romance.suggestedTransition)
    }

    @Test func transitionsOverlapRatherThanAddToTheRuntime() {
        // Two 30s scenes joined by a 1.5s dissolve run 58.5s, not 61.5s — the
        // handoff is played over both shots, not between them.
        let board = Storyboard(
            title: "Two shots",
            logline: "",
            genre: .drama,
            scenes: [
                StoryScene(title: "A", performance: .romance, seconds: 30, transition: .dissolve),
                StoryScene(title: "B", performance: .romance, seconds: 30, transition: .cut),
            ]
        )
        #expect(board.runtimeSeconds == 58.5)
    }

    @Test func asingleSceneHasNoHandoffToPayFor() {
        let board = Storyboard(
            title: "One shot",
            logline: "",
            genre: .drama,
            scenes: [StoryScene(title: "A", performance: .fight, seconds: 42, transition: .fade)]
        )
        #expect(board.runtimeSeconds == 42)
    }

    @Test func runtimeNeverGoesNegativeOnLongTransitions() {
        // Short scenes joined by slow fades would otherwise subtract past zero.
        let board = Storyboard(
            title: "Impossible",
            logline: "",
            genre: .drama,
            scenes: [
                StoryScene(title: "A", performance: .noir, seconds: 1, transition: .slowFade),
                StoryScene(title: "B", performance: .noir, seconds: 1, transition: .slowFade),
            ]
        )
        #expect(board.runtimeSeconds >= 0)
    }

    @Test func timecodesAreWrittenInTheOnlyFormatThePipelineParses() {
        #expect(SceneSegment.timecode(0) == "00:00:00")
        #expect(SceneSegment.timecode(95) == "00:01:35")
        #expect(SceneSegment.timecode(3_725) == "01:02:05")
        // Negative input cannot produce a malformed timecode.
        #expect(SceneSegment.timecode(-4) == "00:00:00")
    }
}

@Suite("Casting")
struct StoryboardCastingTests {
    /// A real file in the media container, so `isCast` is answered by the disk
    /// rather than by the record claiming it.
    private func realFile() throws -> String {
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let image = UIGraphicsImageRenderer(size: CGSize(width: 4, height: 4), format: format)
            .image { context in
                UIColor.magenta.setFill()
                context.fill(CGRect(x: 0, y: 0, width: 4, height: 4))
            }
        return try MediaLibrary.importImage(image)
    }

    @Test func asceneWithNoFootageIsNotCast() {
        let scene = StoryScene(title: "The reveal", performance: .reveal)
        #expect(!scene.isCast)
        #expect(scene.hostFile == nil)
    }

    @Test func asceneNamingAmissingFileIsNotCast() {
        // The record claims a file; the disk disagrees. The disk wins.
        let scene = StoryScene(
            title: "Ghost",
            performance: .brave,
            clipName: "gone.mov",
            clipFileName: "clip-does-not-exist.mov"
        )
        #expect(!scene.isCast)
        #expect(scene.hostFile == nil)
    }

    @Test func castingPointsThesceneAtFootageOnThisDevice() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        let store = StoryboardStore()
        let board = store.createBlank(title: "Cast test", genre: .action, starring: "Tester")
        defer { store.remove(board) }
        store.addScene(.fight, title: "First blood", to: board.id)

        let scene = try #require(store.board(id: board.id)?.scenes.first)
        let clip = SourceVideo(name: "take_one.mov", minutes: 1, fileName: file, seconds: 30)

        #expect(store.cast(clip, into: scene.id, of: board.id))
        let updated = try #require(store.board(id: board.id)?.scenes.first)
        #expect(updated.isCast)
        #expect(updated.clipName == "take_one.mov")
        #expect(updated.hostFile == "raw/take_one.mov")
    }

    @Test func alengthOnlyRecordCannotBeCast() throws {
        let store = StoryboardStore()
        let board = store.createBlank(title: "Refusal", genre: .drama, starring: "Tester")
        defer { store.remove(board) }
        store.addScene(.heartbreak, title: "Empty room", to: board.id)
        let scene = try #require(store.board(id: board.id)?.scenes.first)

        // No file on disk: casting it would produce a board that claims to be
        // ready and then fails hours later on the render host.
        let ghost = SourceVideo(name: "podcast_ep12.mov", minutes: 72)
        #expect(!store.cast(ghost, into: scene.id, of: board.id))
        #expect(store.board(id: board.id)?.scenes.first?.isCast == false)
    }

    @Test func theInPointIsClampedInsideTheTake() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        let store = StoryboardStore()
        let board = store.createBlank(title: "Clamp", genre: .thriller, starring: "Tester")
        defer { store.remove(board) }
        store.addScene(.chase, title: "Run", to: board.id)
        let scene = try #require(store.board(id: board.id)?.scenes.first)

        let clip = SourceVideo(name: "short.mov", minutes: 1, fileName: file, seconds: 30)
        // Asking to start past the end of the take must not produce an out
        // point beyond the file, which renders as a frozen last frame.
        #expect(store.cast(clip, into: scene.id, of: board.id, startSeconds: 500))

        let updated = try #require(store.board(id: board.id)?.scenes.first)
        #expect(updated.startSeconds <= 29)
        #expect(updated.endSeconds <= 30)
    }

    @Test func deletedFootageUnCastsTheScenesItWasIn() throws {
        let file = try realFile()
        let store = StoryboardStore()
        let board = store.createBlank(title: "Vanishing", genre: .epic, starring: "Tester")
        defer { store.remove(board) }
        store.addScene(.wonder, title: "The road", to: board.id)
        let scene = try #require(store.board(id: board.id)?.scenes.first)

        let clip = SourceVideo(name: "road.mov", minutes: 1, fileName: file, seconds: 20)
        #expect(store.cast(clip, into: scene.id, of: board.id))

        // The vault erases the footage.
        MediaLibrary.remove(file)
        store.forgetMissingFootage()

        let updated = try #require(store.board(id: board.id)?.scenes.first)
        #expect(updated.clipFileName == nil)
        #expect(updated.clipName == nil)
        #expect(!updated.isCast)
    }

    @Test func unCastingClearsTheInPointToo() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        let store = StoryboardStore()
        let board = store.createBlank(title: "Undo", genre: .drama, starring: "Tester")
        defer { store.remove(board) }
        store.addScene(.farewell, title: "Last look", to: board.id)
        let scene = try #require(store.board(id: board.id)?.scenes.first)

        let clip = SourceVideo(name: "goodbye.mov", minutes: 2, fileName: file, seconds: 90)
        #expect(store.cast(clip, into: scene.id, of: board.id, startSeconds: 12))
        store.unCast(sceneID: scene.id, of: board.id)

        let updated = try #require(store.board(id: board.id)?.scenes.first)
        #expect(updated.startSeconds == 0)
        #expect(updated.clipThumbnailName == nil)
    }
}

@Suite("Films render what they describe")
struct StoryboardRenderTests {
    private func realFile() throws -> String {
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let image = UIGraphicsImageRenderer(size: CGSize(width: 4, height: 4), format: format)
            .image { context in
                UIColor.black.setFill()
                context.fill(CGRect(x: 0, y: 0, width: 4, height: 4))
            }
        return try MediaLibrary.importImage(image)
    }

    /// A board whose scenes all point at one real file.
    private func castBoard(file: String, keyedFirst: Bool = false) -> Storyboard {
        Storyboard(
            title: "Last Stand",
            logline: "Outnumbered, out of time.",
            genre: .action,
            starring: "Tester",
            scenes: [
                StoryScene(
                    title: "The line is drawn",
                    performance: .brave,
                    seconds: 30,
                    clipName: "take_one.mov",
                    clipFileName: file,
                    startSeconds: 10,
                    transition: .cut,
                    isKeyed: keyedFirst
                ),
                StoryScene(
                    title: "First blood",
                    performance: .fight,
                    seconds: 60,
                    clipName: "take_one.mov",
                    clipFileName: file,
                    startSeconds: 90,
                    transition: .cut
                ),
            ]
        )
    }

    @Test func segmentsCarryTheRealInAndOutPoints() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        let segments = castBoard(file: file).segments()
        #expect(segments.count == 2)
        #expect(segments[0].file == "raw/take_one.mov")
        #expect(segments[0].startSeconds == 10)
        #expect(segments[0].endSeconds == 40)
        #expect(segments[1].startSeconds == 90)
        #expect(segments[1].endSeconds == 150)
    }

    @Test func theLastSceneAlwaysFadesToBlack() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        // Both scenes ask for a hard cut; the final one must still fade, or the
        // film slams to black mid-breath.
        let segments = castBoard(file: file).segments()
        #expect(segments[0].transition == "cut")
        #expect(segments[1].transition == SceneTransition.slowFade.pipelineValue)
    }

    @Test func uncastScenesAreLeftOutOfTheRenderEntirely() {
        // A scene with no footage cannot become a segment — better a short film
        // than a config naming a file that does not exist.
        let board = Storyboard(
            title: "Half shot",
            logline: "",
            genre: .drama,
            scenes: [
                StoryScene(title: "A", performance: .romance),
                StoryScene(title: "B", performance: .fight),
            ]
        )
        #expect(board.segments().isEmpty)
        #expect(!board.isReadyToRender)
    }

    @Test func oneTakeUsedTwiceIsCopiedOnce() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        // Both scenes cut from the same take, so the checklist names one file.
        let checklist = castBoard(file: file).footageChecklist
        #expect(checklist.count == 1)
        #expect(checklist[0].hostFile == "raw/take_one.mov")
        #expect(checklist[0].sourceName == "take_one.mov")
    }

    @Test func theConfigNamesTheFilesTheHostMustHold() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        let board = castBoard(file: file)
        let store = StoryboardStore()
        let yaml = store.configYAML(for: board, settings: .default)

        #expect(yaml.contains("sceneSegments:"))
        #expect(yaml.contains("file: raw/take_one.mov"))
        #expect(yaml.contains("start: 00:00:10"))
        #expect(yaml.contains("end: 00:00:40"))
        #expect(yaml.contains("start: 00:01:30"))
        // The film's intent travels with it.
        #expect(yaml.contains("Outnumbered, out of time."))
        #expect(yaml.contains("starring Tester"))
        // No placeholder clips survive into a real timeline.
        #expect(!yaml.contains("raw/intro.mp4"))
    }

    @Test func keyingIsPerSceneRatherThanFirstSceneOnly() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        let board = castBoard(file: file, keyedFirst: true)

        let yaml = board.segments().isEmpty ? "" : settings.configYAML(
            projectTitle: board.title,
            segments: board.segments()
        )
        // Exactly one scene asked to be keyed, so exactly one composite block.
        let blocks = yaml.components(separatedBy: "composite:").count - 1
        #expect(blocks == 1)
    }

    @Test func compositeIsSkippedWhenNoSceneWasShotOnAscreen() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        let board = castBoard(file: file, keyedFirst: false)
        let yaml = settings.configYAML(projectTitle: board.title, segments: board.segments())

        #expect(!yaml.contains("composite:"))
        // And the keying stage is not paid for on the render host.
        #expect(!settings.stagesArgument(keyingAnyScene: false).contains("composite"))
        #expect(settings.stagesArgument(keyingAnyScene: true).contains("composite"))
    }

    @Test func afilmWithNoScenesSaysSoRatherThanDispatching() {
        let store = StoryboardStore()
        let board = Storyboard(title: "Empty", logline: "", genre: .drama, scenes: [])
        let blocker = store.blocker(for: board, bridgeLinked: true)
        #expect(blocker?.contains("no scenes") == true)
    }

    @Test func uncastScenesBlockTheRenderWithACount() {
        let store = StoryboardStore()
        let board = Storyboard(
            title: "Half",
            logline: "",
            genre: .drama,
            scenes: [
                StoryScene(title: "A", performance: .romance),
                StoryScene(title: "B", performance: .fight),
            ]
        )
        let blocker = try? #require(store.blocker(for: board, bridgeLinked: true))
        #expect(blocker?.contains("2 scenes") == true)
    }

    @Test func afullyCastFilmStillNeedsAcomputer() throws {
        let file = try realFile()
        defer { MediaLibrary.remove(file) }

        let store = StoryboardStore()
        let board = castBoard(file: file)
        #expect(board.isReadyToRender)
        // The phone cannot encode a film on its own, and says so.
        #expect(store.blocker(for: board, bridgeLinked: false)?.contains("computer") == true)
        #expect(store.blocker(for: board, bridgeLinked: true) == nil)
    }
}

@Suite("Story templates")
struct StoryTemplateTests {
    @Test func everyTemplateIsAfiveBeatFilm() {
        for template in StoryTemplate.allCases {
            #expect(template.beats.count == 5, "\(template.title) is not five beats")
            #expect(!template.logline.isEmpty)
        }
    }

    @Test func atemplateBuildsAboardThatIsPlannedButNotShot() {
        let board = StoryTemplate.firstLight.makeStoryboard(starring: "Tester")
        #expect(board.scenes.count == 5)
        #expect(board.starring == "Tester")
        #expect(board.genre == .romance)
        // Every beat carries direction; none of them claim footage.
        #expect(board.scenes.allSatisfy { !$0.direction.isEmpty })
        #expect(board.castCount == 0)
        #expect(!board.isReadyToRender)
    }

    @Test func duplicatingAfilmDoesNotShareSceneIdentity() {
        let store = StoryboardStore()
        let original = store.create(from: .lastStand, starring: "Tester")
        let copy = store.duplicate(original)
        defer {
            store.remove(original)
            store.remove(copy)
        }

        #expect(copy.id != original.id)
        let originalIDs = Set(original.scenes.map(\.id))
        let copyIDs = Set(copy.scenes.map(\.id))
        // Shared scene ids would make casting one film silently recast the other.
        #expect(originalIDs.isDisjoint(with: copyIDs))
    }

    @Test func everyPerformanceCarriesRealDirection() {
        for performance in ScenePerformance.allCases {
            #expect(!performance.direction.isEmpty)
            #expect(!performance.camera.isEmpty)
            #expect(!performance.lens.isEmpty)
            #expect(!performance.lighting.isEmpty)
            #expect(performance.defaultSeconds > 0)
            // The tint has to be a colour the card can actually draw.
            #expect(performance.tintHex.count == 7)
            #expect(performance.tintHex.hasPrefix("#"))
        }
    }

    @Test func transitionsSpellThePipelineGrammarExactly() {
        #expect(SceneTransition.cut.pipelineValue == "cut")
        #expect(SceneTransition.fade.pipelineValue == "fade 1.5")
        #expect(SceneTransition.dissolve.pipelineValue == "dissolve 1.5")
        #expect(SceneTransition.wipeLeft.pipelineValue == "wipeleft 1")
        #expect(SceneTransition.slideUp.pipelineValue == "slideup 0.8")
        #expect(SceneTransition.circleOpen.pipelineValue == "circleopen 1")
        // A cut occupies no time; everything else does.
        #expect(SceneTransition.cut.seconds == 0)
        #expect(SceneTransition.allCases.filter { $0 != .cut }.allSatisfy { $0.seconds > 0 })
    }

    @Test func ashotListReadsAsSomethingAcrewCouldShoot() {
        let board = StoryTemplate.theInformant.makeStoryboard(starring: "Tester")
        let list = board.shotList()
        #expect(list.contains("THE INFORMANT"))
        #expect(list.contains("Shot:"))
        #expect(list.contains("Direction:"))
        // Uncast beats are named as unshot rather than quietly omitted.
        #expect(list.contains("not yet shot"))
    }
}

@Suite("Call log sources")
struct CallSourceTests {
    @Test func everySourceCanBeListedAndLabelled() {
        // The overflow menu iterates these; a missing case would be an
        // unreachable filter.
        #expect(CallSource.allCases.count == 4)
        for source in CallSource.allCases {
            #expect(!source.title.isEmpty)
            #expect(!source.symbol.isEmpty)
            #expect(source.id == source.rawValue)
            #expect(source.label == source.label.uppercased())
        }
    }
}
