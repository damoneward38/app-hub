import Foundation
import Observation
import SwiftUI

/// Owns the user's films: the boards, the casting, and the hand-off to the
/// render host.
///
/// Casting is the whole point — a scene becomes "theirs" when it points at
/// footage of them on this device. Nothing here fabricates a performance: a
/// board with uncast scenes says so, and refuses to dispatch.
@Observable
final class StoryboardStore {
    private(set) var boards: [Storyboard] = []
    private(set) var lastDispatchSummary: String?
    private(set) var dispatchError: String?

    init() {
        boards = LocalStore.shared.load([Storyboard].self, key: StoreKey.storyboards) ?? []
    }

    // MARK: - Boards

    var hasBoards: Bool { !boards.isEmpty }

    /// Boards with every scene cast, newest first — the ones that can render.
    var readyBoards: [Storyboard] { boards.filter(\.isReadyToRender) }

    var totalScenes: Int { boards.reduce(0) { $0 + $1.scenes.count } }

    var totalCastScenes: Int { boards.reduce(0) { $0 + $1.castCount } }

    /// Combined runtime of every film, for the Cinema read-out.
    var totalRuntimeLabel: String {
        let total = Int(boards.reduce(0.0) { $0 + $1.runtimeSeconds }.rounded())
        if total < 60 { return "\(total)s" }
        if total < 3600 { return String(format: "%d:%02d", total / 60, total % 60) }
        return String(format: "%dh %02dm", total / 3600, (total % 3600) / 60)
    }

    func board(id: UUID) -> Storyboard? { boards.first { $0.id == id } }

    @discardableResult
    func create(from template: StoryTemplate, starring: String) -> Storyboard {
        let board = template.makeStoryboard(starring: starring)
        boards.insert(board, at: 0)
        persist()
        Haptics.success()
        return board
    }

    @discardableResult
    func createBlank(title: String, genre: StoryGenre, starring: String) -> Storyboard {
        let cleaned = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let board = Storyboard(
            title: cleaned.isEmpty ? "Untitled film" : cleaned,
            logline: "",
            genre: genre,
            starring: starring,
            scenes: []
        )
        boards.insert(board, at: 0)
        persist()
        Haptics.success()
        return board
    }

    func update(_ board: Storyboard) {
        guard let index = boards.firstIndex(where: { $0.id == board.id }) else { return }
        var updated = board
        updated.updatedAt = .now
        boards[index] = updated
        persist()
    }

    func remove(_ board: Storyboard) {
        boards.removeAll { $0.id == board.id }
        persist()
    }

    @discardableResult
    func duplicate(_ board: Storyboard) -> Storyboard {
        // A fresh id per scene as well as per board: sharing scene ids would
        // make casting one film silently recast the other.
        let copy = Storyboard(
            title: "\(board.title) (copy)",
            logline: board.logline,
            genre: board.genre,
            starring: board.starring,
            scenes: board.scenes.map { scene in
                StoryScene(
                    title: scene.title,
                    performance: scene.performance,
                    seconds: scene.seconds,
                    direction: scene.direction,
                    clipID: scene.clipID,
                    clipName: scene.clipName,
                    clipFileName: scene.clipFileName,
                    clipThumbnailName: scene.clipThumbnailName,
                    startSeconds: scene.startSeconds,
                    transition: scene.transition,
                    isKeyed: scene.isKeyed
                )
            }
        )
        boards.insert(copy, at: 0)
        persist()
        return copy
    }

    // MARK: - Scenes

    func addScene(_ performance: ScenePerformance, title: String, to boardID: UUID) {
        guard let index = boards.firstIndex(where: { $0.id == boardID }) else { return }
        let cleaned = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let scene = StoryScene(
            title: cleaned.isEmpty ? performance.title : cleaned,
            performance: performance
        )
        boards[index].scenes.append(scene)
        boards[index].updatedAt = .now
        persist()
        Haptics.tap()
    }

    func updateScene(_ scene: StoryScene, in boardID: UUID) {
        guard let boardIndex = boards.firstIndex(where: { $0.id == boardID }),
              let sceneIndex = boards[boardIndex].scenes.firstIndex(where: { $0.id == scene.id })
        else { return }
        boards[boardIndex].scenes[sceneIndex] = scene
        boards[boardIndex].updatedAt = .now
        persist()
    }

    func removeScene(_ scene: StoryScene, from boardID: UUID) {
        guard let index = boards.firstIndex(where: { $0.id == boardID }) else { return }
        boards[index].scenes.removeAll { $0.id == scene.id }
        boards[index].updatedAt = .now
        persist()
    }

    func moveScenes(in boardID: UUID, from offsets: IndexSet, to destination: Int) {
        guard let index = boards.firstIndex(where: { $0.id == boardID }) else { return }
        boards[index].scenes.move(fromOffsets: offsets, toOffset: destination)
        boards[index].updatedAt = .now
        persist()
    }

    // MARK: - Casting

    /// Puts the user into a scene, using footage that exists on this device.
    ///
    /// Refuses a clip whose file has gone: casting a record that cannot play
    /// would produce a board that claims to be ready and then fails on the
    /// render host, which is the worst possible place to find out.
    @discardableResult
    func cast(_ clip: SourceVideo, into sceneID: UUID, of boardID: UUID, startSeconds: Double = 0) -> Bool {
        guard clip.isPlayable, let fileName = clip.fileName else { return false }
        guard let boardIndex = boards.firstIndex(where: { $0.id == boardID }),
              let sceneIndex = boards[boardIndex].scenes.firstIndex(where: { $0.id == sceneID })
        else { return false }

        var scene = boards[boardIndex].scenes[sceneIndex]
        scene.clipID = clip.id
        scene.clipName = clip.name
        scene.clipFileName = fileName
        scene.clipThumbnailName = clip.thumbnailName

        // Clamp the in-point so the scene cannot start past the end of its own
        // take — an out-point beyond the file renders as a frozen last frame.
        let available = Double(clip.seconds ?? (clip.minutes * 60))
        let longest = max(0, available - 1)
        scene.startSeconds = min(max(0, startSeconds), longest)
        if available > 0 {
            scene.seconds = max(1, min(scene.seconds, Int(available - scene.startSeconds)))
        }

        boards[boardIndex].scenes[sceneIndex] = scene
        boards[boardIndex].updatedAt = .now
        persist()
        Haptics.success()
        return true
    }

    func unCast(sceneID: UUID, of boardID: UUID) {
        guard let boardIndex = boards.firstIndex(where: { $0.id == boardID }),
              let sceneIndex = boards[boardIndex].scenes.firstIndex(where: { $0.id == sceneID })
        else { return }
        boards[boardIndex].scenes[sceneIndex].clipID = nil
        boards[boardIndex].scenes[sceneIndex].clipName = nil
        boards[boardIndex].scenes[sceneIndex].clipFileName = nil
        boards[boardIndex].scenes[sceneIndex].clipThumbnailName = nil
        boards[boardIndex].scenes[sceneIndex].startSeconds = 0
        boards[boardIndex].updatedAt = .now
        persist()
    }

    /// Drops casting that points at footage which has since been deleted.
    ///
    /// Called when the vault removes a clip: leaving the reference behind would
    /// show a scene as cast while `isCast` reports false, which reads as the
    /// storyboard being broken rather than the footage being gone.
    func forgetMissingFootage() {
        var changed = false
        for boardIndex in boards.indices {
            for sceneIndex in boards[boardIndex].scenes.indices {
                let scene = boards[boardIndex].scenes[sceneIndex]
                guard scene.clipFileName != nil, !scene.isCast else { continue }
                boards[boardIndex].scenes[sceneIndex].clipID = nil
                boards[boardIndex].scenes[sceneIndex].clipName = nil
                boards[boardIndex].scenes[sceneIndex].clipFileName = nil
                boards[boardIndex].scenes[sceneIndex].clipThumbnailName = nil
                changed = true
            }
        }
        if changed { persist() }
    }

    // MARK: - Rendering

    /// The config the render host runs for this film.
    func configYAML(for board: Storyboard, settings: PipelineSettings) -> String {
        settings.configYAML(
            projectTitle: board.title,
            segments: board.segments(),
            header: [
                board.logline,
                "\(board.genre.title) · starring \(board.starring) · \(board.runtimeLabel)",
                "Grade: \(board.genre.gradeNote)",
            ]
        )
    }

    /// Why this board cannot be sent yet, or nil when it can.
    func blocker(for board: Storyboard, bridgeLinked: Bool) -> String? {
        if board.scenes.isEmpty {
            return "This film has no scenes yet. Add a beat to get started."
        }
        let uncast = board.scenes.count - board.castCount
        if uncast > 0 {
            return "\(uncast) scene\(uncast == 1 ? "" : "s") still need footage of you. Cast every scene before rendering."
        }
        if !bridgeLinked {
            return "Connect the computer that runs the render — the phone can't encode a film on its own."
        }
        return nil
    }

    /// Sends a finished board to the paired computer.
    ///
    /// Returns false and leaves a reason in `dispatchError` rather than throwing:
    /// every caller here is a button, and a button needs a message, not a stack.
    @MainActor
    @discardableResult
    func dispatch(
        board: Storyboard,
        settings: PipelineSettings,
        bridge: BridgeStore
    ) async -> Bool {
        dispatchError = nil

        if let blocker = blocker(for: board, bridgeLinked: bridge.isLinked) {
            dispatchError = blocker
            return false
        }

        let segments = board.segments()
        guard !segments.isEmpty else {
            dispatchError = "None of the cast footage is still on this device."
            return false
        }

        let sent = await bridge.dispatch(
            configYAML: configYAML(for: board, settings: settings),
            title: board.title,
            stages: settings.stagesArgument(keyingAnyScene: board.scenes.contains(where: \.isKeyed)),
            limitSeconds: nil
        )

        if sent {
            lastDispatchSummary = "\(board.title) · \(segments.count) scenes · \(board.runtimeLabel) sent to \(bridge.hostLabel)"
        } else {
            dispatchError = bridge.linkError ?? "The computer refused the render."
        }
        return sent
    }

    func clearDispatchMessages() {
        dispatchError = nil
        lastDispatchSummary = nil
    }

    // MARK: - Storage

    private func persist() { LocalStore.shared.save(boards, key: StoreKey.storyboards) }
}
