import AVFoundation
import CoreMedia
import Foundation
import Testing
@testable import Integrav

/// Writes a real, decodable H.264 clip into the media container.
///
/// The end-to-end tests below refuse to use a stub: a renderer that is only
/// ever exercised against fakes is exactly how the last "it looks like it
/// works" bug got in.
nonisolated func writeTestClip(seconds: Double, red: UInt8, green: UInt8, blue: UInt8) async throws -> String {
    try MediaLibrary.ensureDirectory()
    let fileName = "test-\(UUID().uuidString).mp4"
    let url = MediaLibrary.url(for: fileName)
    let width = 320
    let height = 240
    let fps = 15

    nonisolated struct ClipWriteFailure: LocalizedError {
        let reason: String
        var errorDescription: String? { "Test clip could not be written: \(reason)" }
    }

    let writer = try AVAssetWriter(outputURL: url, fileType: .mp4)
    let input = AVAssetWriterInput(
        mediaType: .video,
        outputSettings: [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height
        ]
    )
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
        assetWriterInput: input,
        sourcePixelBufferAttributes: [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
            kCVPixelBufferWidthKey as String: width,
            kCVPixelBufferHeightKey as String: height
        ]
    )
    writer.add(input)
    guard writer.startWriting() else {
        throw ClipWriteFailure(reason: writer.error?.localizedDescription ?? "startWriting refused")
    }
    writer.startSession(atSourceTime: .zero)

    let frames = max(1, Int(seconds * Double(fps)))
    for frame in 0..<frames {
        while !input.isReadyForMoreMediaData {
            try await Task.sleep(for: .milliseconds(5))
        }
        guard let pool = adaptor.pixelBufferPool else { break }
        var created: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &created)
        guard let buffer = created else { break }

        CVPixelBufferLockBaseAddress(buffer, [])
        if let base = CVPixelBufferGetBaseAddress(buffer) {
            let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
            let pointer = base.assumingMemoryBound(to: UInt8.self)
            for row in 0..<CVPixelBufferGetHeight(buffer) {
                for column in 0..<CVPixelBufferGetWidth(buffer) {
                    let offset = row * bytesPerRow + column * 4
                    pointer[offset] = blue
                    pointer[offset + 1] = green
                    pointer[offset + 2] = red
                    pointer[offset + 3] = 255
                }
            }
        }
        CVPixelBufferUnlockBaseAddress(buffer, [])
        adaptor.append(
            buffer,
            withPresentationTime: CMTime(value: CMTimeValue(frame), timescale: CMTimeScale(fps))
        )
    }

    input.markAsFinished()
    await withCheckedContinuation { continuation in
        writer.finishWriting { continuation.resume() }
    }
    guard writer.status == .completed else {
        throw ClipWriteFailure(reason: writer.error?.localizedDescription ?? "status \(writer.status.rawValue)")
    }
    return fileName
}

nonisolated func castScene(
    title: String,
    seconds: Int,
    fileName: String,
    transition: SceneTransition,
    keyed: Bool = false
) -> StoryScene {
    var scene = StoryScene(title: title, performance: .romance, seconds: seconds, transition: transition)
    scene.clipID = UUID()
    scene.clipName = "\(title).mp4"
    scene.clipFileName = fileName
    scene.isKeyed = keyed
    return scene
}

// MARK: - Planning

@Suite("On-device render planning")
struct LocalRenderPlanTests {
    @Test func anEmptyBoardCannotBeRendered() {
        let board = Storyboard(title: "Nothing", logline: "", genre: .drama, scenes: [])
        #expect(throws: LocalRenderError.noScenes) {
            _ = try LocalRenderer.cuts(for: board)
        }
    }

    @Test func uncastScenesAreCountedRatherThanSkipped() {
        // Silently dropping an uncast scene would render a shorter film than
        // the board describes and never say why.
        let board = Storyboard(
            title: "Half cast",
            logline: "",
            genre: .drama,
            scenes: [
                StoryScene(title: "A", performance: .romance),
                StoryScene(title: "B", performance: .fight)
            ]
        )
        #expect(throws: LocalRenderError.notCast(2)) {
            _ = try LocalRenderer.cuts(for: board)
        }
    }

    @Test func footageMissingFromDiskIsNamed() {
        let board = Storyboard(
            title: "Ghost",
            logline: "",
            genre: .drama,
            scenes: [castScene(title: "A", seconds: 3, fileName: "not-here.mp4", transition: .cut)]
        )
        do {
            _ = try LocalRenderer.cuts(for: board)
            Issue.record("A board pointing at a deleted file must not plan a render")
        } catch let error as LocalRenderError {
            #expect(error == .missingFootage(["A.mp4"]))
            #expect(error.errorDescription?.contains("A.mp4") == true)
        } catch {
            Issue.record("Unexpected error \(error)")
        }
    }

    @Test func aBackdropOnTheComputerBlocksADeviceRender() async throws {
        let clip = try await writeTestClip(seconds: 1, red: 20, green: 200, blue: 60)
        defer { MediaLibrary.remove(clip) }

        let board = Storyboard(
            title: "Keyed",
            logline: "",
            genre: .drama,
            scenes: [castScene(title: "A", seconds: 1, fileName: clip, transition: .cut, keyed: true)]
        )
        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        settings.greenScreen.usesHostFile = true

        // The phone cannot read a file that lives on the paired computer, so it
        // must say so rather than render a black plate.
        let blocker = LocalRenderer.blocker(for: board, settings: settings)
        #expect(blocker?.contains("computer") == true)

        settings.greenScreen.usesHostFile = false
        #expect(LocalRenderer.blocker(for: board, settings: settings) == nil)
    }

    @Test func differencesFromTheDesktopPipelineAreDeclared() {
        let iris = [
            RenderCut(id: UUID(), title: "A", fileName: "a.mp4", start: 0, seconds: 2, transition: .circleOpen, isKeyed: false),
            RenderCut(id: UUID(), title: "B", fileName: "b.mp4", start: 0, seconds: 2, transition: .cut, isKeyed: false)
        ]
        #expect(LocalRenderer.notes(for: iris, keying: .default).count == 1)

        var keying = GreenScreenSettings.default
        keying.isEnabled = true
        let keyed = [
            RenderCut(id: UUID(), title: "A", fileName: "a.mp4", start: 0, seconds: 2, transition: .dissolve, isKeyed: true)
        ]
        #expect(LocalRenderer.isKeyedRender(cuts: keyed, keying: keying))
        #expect(LocalRenderer.notes(for: keyed, keying: keying).first?.contains("cut") == true)
        // Keying that is switched off cannot change how a film is rendered.
        #expect(!LocalRenderer.isKeyedRender(cuts: keyed, keying: .default))
    }
}

// MARK: - Geometry and colour

@Suite("Render maths")
struct LocalRenderMathsTests {
    private func covers(naturalSize: CGSize, preferred: CGAffineTransform, target: CGSize) -> Bool {
        let transform = LocalRenderer.fillTransform(
            naturalSize: naturalSize,
            preferred: preferred,
            target: target
        )
        let rect = CGRect(origin: .zero, size: naturalSize).applying(transform)
        return rect.minX <= 0.01 && rect.minY <= 0.01
            && rect.maxX >= target.width - 0.01
            && rect.maxY >= target.height - 0.01
    }

    @Test func everyFormatIsFilledEdgeToEdge() {
        // A gap at any edge is a black bar in the delivered film.
        for format in RenderFormat.allCases {
            let target = LocalRenderer.pixelSize(for: format)
            #expect(covers(naturalSize: CGSize(width: 1920, height: 1080), preferred: .identity, target: target))
            #expect(covers(naturalSize: CGSize(width: 1080, height: 1920), preferred: .identity, target: target))
            #expect(covers(naturalSize: CGSize(width: 640, height: 640), preferred: .identity, target: target))
        }
    }

    @Test func footageShotOnItsSideIsPulledBackIntoFrame() {
        // A rotation puts the frame into negative space; forgetting to undo it
        // renders a black picture, which is the classic version of this bug.
        let rotated = CGAffineTransform(rotationAngle: .pi / 2)
        #expect(
            covers(
                naturalSize: CGSize(width: 1920, height: 1080),
                preferred: rotated,
                target: CGSize(width: 1080, height: 1920)
            )
        )
    }

    @Test func formatStringsParseToRealPixelSizes() {
        #expect(LocalRenderer.pixelSize(for: .uhd4K) == CGSize(width: 3840, height: 2160))
        #expect(LocalRenderer.pixelSize(for: .vertical) == CGSize(width: 1080, height: 1920))
        #expect(LocalRenderer.pixelSize(for: .square) == CGSize(width: 1080, height: 1080))
    }

    @Test func theKeyHueComesFromTheDeclaredSwatch() {
        // Cube and swatch read the same constant, so they cannot drift apart.
        #expect(abs(LocalRenderer.hue(ofHex: ChromaKey.green.hex) - 0.394) < 0.02)
        #expect(abs(LocalRenderer.hue(ofHex: ChromaKey.blue.hex) - 0.603) < 0.02)
        #expect(abs(LocalRenderer.hue(ofHex: ChromaKey.magenta.hex) - 0.833) < 0.02)
    }

    private func alpha(in data: Data, dimension: Int, red: Double, green: Double, blue: Double) -> Float {
        let clampIndex: (Double) -> Int = { value in
            max(0, min(dimension - 1, Int((value * Double(dimension - 1)).rounded())))
        }
        let offset = (
            clampIndex(blue) * dimension * dimension
            + clampIndex(green) * dimension
            + clampIndex(red)
        ) * 4 + 3
        return data.withUnsafeBytes { raw in
            raw.bindMemory(to: Float.self)[offset]
        }
    }

    @Test func theCubeDropsTheKeyAndKeepsTheSubject() {
        let dimension = LocalRenderer.chromaCubeSize
        let data = LocalRenderer.chromaKeyCube(
            key: .green,
            tolerance: 0.16,
            softness: 0.08,
            despill: 0.8
        )
        #expect(data.count == dimension * dimension * dimension * 4 * MemoryLayout<Float>.size)

        // The cyclorama itself goes.
        #expect(alpha(in: data, dimension: dimension, red: 0, green: 0.69, blue: 0.25) == 0)
        // Skin, hair and a white shirt stay.
        #expect(alpha(in: data, dimension: dimension, red: 0.85, green: 0.65, blue: 0.55) == 1)
        #expect(alpha(in: data, dimension: dimension, red: 0.15, green: 0.12, blue: 0.10) == 1)
        #expect(alpha(in: data, dimension: dimension, red: 1, green: 1, blue: 1) == 1)
    }

    @Test func aBlueKeyLeavesGreenAlone() {
        let dimension = LocalRenderer.chromaCubeSize
        let data = LocalRenderer.chromaKeyCube(key: .blue, tolerance: 0.16, softness: 0.08, despill: 0.8)
        #expect(alpha(in: data, dimension: dimension, red: 0, green: 0.28, blue: 0.73) == 0)
        #expect(alpha(in: data, dimension: dimension, red: 0, green: 0.69, blue: 0.25) == 1)
    }

    @Test func timecodesMatchTheManifestShape() {
        #expect(LocalRenderer.timecode(0) == "0:00:00.00")
        #expect(LocalRenderer.timecode(3.5) == "0:00:03.50")
        #expect(LocalRenderer.timecode(3661.25) == "1:01:01.25")
        #expect(LocalRenderer.timecode(-4) == "0:00:00.00")
        #expect(LocalRenderer.timecode(.nan) == "0:00:00.00")
    }
}

// MARK: - End to end

@Suite("The device really renders", .serialized)
struct LocalRenderEndToEndTests {
    @Test func twoClipsBecomeOneEncodedFilm() async throws {
        let first = try await writeTestClip(seconds: 2, red: 220, green: 40, blue: 90)
        let second = try await writeTestClip(seconds: 2, red: 30, green: 80, blue: 220)
        defer {
            MediaLibrary.remove(first)
            MediaLibrary.remove(second)
        }

        let board = Storyboard(
            title: "Two shots",
            logline: "",
            genre: .drama,
            scenes: [
                castScene(title: "A", seconds: 2, fileName: first, transition: .dissolve),
                castScene(title: "B", seconds: 2, fileName: second, transition: .cut)
            ]
        )
        let cuts = try LocalRenderer.cuts(for: board)
        #expect(cuts.count == 2)

        var stages: [RenderStage] = []
        let output = try await LocalRenderer.render(
            cuts: cuts,
            title: board.title,
            format: .square,
            fps: 30,
            keying: .default,
            handle: RenderHandle(),
            progress: { stage, _ in
                if stages.last != stage { stages.append(stage) }
            }
        )
        defer { LocalRenderer.removeOutput(named: output.fileName) }

        // A file that exists, with bytes in it, that decodes.
        #expect(FileManager.default.fileExists(atPath: output.url.path))
        #expect(output.sizeBytes > 1_000)
        #expect(output.renderSeconds > 0)
        #expect(output.codec == "h264" || output.codec == "hevc")
        #expect(output.thumbnailData != nil)

        // Two shots of two seconds joined by a dissolve capped at half the
        // shorter shot: three seconds of film, measured off the encoded asset.
        #expect(abs(output.duration - 3.0) < 0.35, "measured \(output.duration)s")
        #expect(output.scenes.count == 2)
        #expect(output.scenes[0].transition == SceneTransition.dissolve.pipelineValue)
        #expect(output.scenes[0].file == first)

        // The tracker moved through real stages, in order, ending on preview.
        #expect(stages.first == .trim)
        #expect(stages.contains(.render))
        #expect(stages.last == .preview)

        let written = AVURLAsset(url: output.url)
        let tracks = try await written.loadTracks(withMediaType: .video)
        #expect(tracks.count == 1)
        let size = try await tracks[0].load(.naturalSize)
        #expect(size == CGSize(width: 1080, height: 1080))
    }

    @Test func aKeyedRenderProducesAFilmToo() async throws {
        let clip = try await writeTestClip(seconds: 1.5, red: 0, green: 177, blue: 64)
        defer { MediaLibrary.remove(clip) }

        let board = Storyboard(
            title: "Keyed shot",
            logline: "",
            genre: .drama,
            scenes: [castScene(title: "A", seconds: 1, fileName: clip, transition: .cut, keyed: true)]
        )
        var keying = GreenScreenSettings.default
        keying.isEnabled = true
        keying.backdropColor = "#101018"

        let output = try await LocalRenderer.render(
            cuts: try LocalRenderer.cuts(for: board),
            title: board.title,
            format: .vertical,
            fps: 30,
            keying: keying,
            handle: RenderHandle()
        ) { _, _ in }
        defer { LocalRenderer.removeOutput(named: output.fileName) }

        #expect(output.sizeBytes > 1_000)
        #expect(output.duration > 0.5)
        #expect(output.resolution == "1080x1920")
    }

    @Test func aClipShorterThanTheSceneRendersWhatExists() async throws {
        // The board asks for eight seconds; the clip holds one. The render must
        // deliver the second it has rather than a frozen frame or a failure.
        let clip = try await writeTestClip(seconds: 1, red: 200, green: 200, blue: 200)
        defer { MediaLibrary.remove(clip) }

        let board = Storyboard(
            title: "Overrun",
            logline: "",
            genre: .drama,
            scenes: [castScene(title: "A", seconds: 8, fileName: clip, transition: .cut)]
        )
        let output = try await LocalRenderer.render(
            cuts: try LocalRenderer.cuts(for: board),
            title: board.title,
            format: .square,
            fps: 30,
            keying: .default,
            handle: RenderHandle()
        ) { _, _ in }
        defer { LocalRenderer.removeOutput(named: output.fileName) }

        #expect(output.duration < 2)
        #expect(output.duration > 0.5)
    }

    @Test func cancellingBeforeTheEncoderStartsThrowsCancelled() async throws {
        let clip = try await writeTestClip(seconds: 1, red: 10, green: 10, blue: 10)
        defer { MediaLibrary.remove(clip) }

        let board = Storyboard(
            title: "Stopped",
            logline: "",
            genre: .drama,
            scenes: [castScene(title: "A", seconds: 1, fileName: clip, transition: .cut)]
        )
        let handle = RenderHandle()
        handle.cancel()
        #expect(handle.isCancelled)

        await #expect(throws: LocalRenderError.cancelled) {
            _ = try await LocalRenderer.render(
                cuts: try LocalRenderer.cuts(for: board),
                title: board.title,
                format: .square,
                fps: 30,
                keying: .default,
                handle: handle
            ) { _, _ in }
        }
    }
}

// MARK: - Store

@Suite("Local render store")
struct LocalRenderStoreTests {
    @Test func aBoardWithNothingCastNeverStartsAJob() {
        let store = LocalRenderStore()
        let production = ProductionStore()
        let board = Storyboard(
            title: "Empty",
            logline: "",
            genre: .drama,
            scenes: [StoryScene(title: "A", performance: .romance)]
        )

        store.render(board: board, settings: .default, into: production)
        // No job card may appear for work that was never begun.
        #expect(store.job == nil)
        #expect(store.isRendering == false)
        #expect(store.error?.isEmpty == false)
    }

    @Test func aFinishedFilmLandsInTheGalleryWithMeasuredFigures() async throws {
        let clip = try await writeTestClip(seconds: 1.5, red: 120, green: 40, blue: 200)
        defer { MediaLibrary.remove(clip) }

        let store = LocalRenderStore()
        let production = ProductionStore()
        let before = production.renders.count
        let board = Storyboard(
            title: "Gallery test",
            logline: "",
            genre: .drama,
            scenes: [castScene(title: "A", seconds: 1, fileName: clip, transition: .cut)]
        )

        store.render(board: board, settings: .default, into: production)
        #expect(store.isRendering)

        // Wait on the real encode rather than a fixed sleep.
        for _ in 0..<200 where store.isRendering {
            try await Task.sleep(for: .milliseconds(100))
        }
        #expect(!store.isRendering)
        #expect(store.error == nil)

        let job = try #require(store.job)
        #expect(job.isFinished)
        #expect(job.overallProgress == 1)
        #expect(job.sceneCount == 1)
        #expect(job.outputDuration > 0)

        #expect(production.renders.count == before + 1)
        let adopted = try #require(production.renders.first)
        #expect(adopted.manifest.duration > 0)
        #expect(adopted.manifest.sizeBytes > 0)
        #expect(adopted.manifest.renderSeconds > 0)
        #expect(adopted.manifest.realtimeFactor > 0)
        #expect(adopted.manifest.resolution == PipelineSettings.default.format.resolution)
        // The film is on this device, so it can actually be watched.
        #expect(LocalRenderer.exists(adopted.manifest.output))

        production.remove(adopted)
        LocalRenderer.removeOutput(named: adopted.manifest.output)
    }
}
