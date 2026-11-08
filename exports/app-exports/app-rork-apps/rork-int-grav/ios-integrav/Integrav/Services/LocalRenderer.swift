import AVFoundation
import CoreImage
import CoreMedia
import Foundation
import UIKit

/// One shot of the finished cut: a real file in this device's media container,
/// a real in-point, a real length, and the transition that carries it into the
/// next shot.
nonisolated struct RenderCut: Identifiable, Hashable, Sendable {
    let id: UUID
    let title: String
    let fileName: String
    let start: Double
    let seconds: Double
    /// Transition *into the next* cut. The last cut's transition is unused.
    let transition: SceneTransition
    let isKeyed: Bool

    nonisolated var url: URL { MediaLibrary.url(for: fileName) }
}

/// Everything a finished on-device render measured about itself.
///
/// Nothing here is estimated: the duration is read back off the encoded file,
/// the byte count off the file system, and the seconds off the clock.
nonisolated struct LocalRenderOutput: Sendable {
    let fileName: String
    let url: URL
    let duration: Double
    let sizeBytes: Int
    let renderSeconds: Double
    let resolution: String
    let fps: Int
    /// Read out of the encoded file's format description, not assumed.
    let codec: String
    let scenes: [ManifestScene]
    let thumbnailData: Data?
    /// Places where the device renderer differs from the desktop pipeline.
    /// Shown to the user rather than quietly swallowed.
    let notes: [String]
}

nonisolated enum LocalRenderError: LocalizedError, Equatable {
    case noScenes
    case notCast(Int)
    case missingFootage([String])
    case unreadable(String)
    case backdropOnComputer
    case noEncoder
    case exportFailed(String)
    case cancelled

    nonisolated var errorDescription: String? {
        switch self {
        case .noScenes:
            return "This storyboard has no scenes yet."
        case .notCast(let count):
            return count == 1
                ? "1 scene still has no footage cast to it."
                : "\(count) scenes still have no footage cast to them."
        case .missingFootage(let names):
            let list = names.prefix(3).joined(separator: ", ")
            let extra = names.count > 3 ? " and \(names.count - 3) more" : ""
            return "Footage missing from this phone: \(list)\(extra). Re-import the clip or cast another."
        case .unreadable(let title):
            return "\(title) could not be decoded on this device."
        case .backdropOnComputer:
            return "The backdrop is a file on the paired computer, which this phone cannot read. Pick a colour to render here."
        case .noEncoder:
            return "This device could not start a video encoder."
        case .exportFailed(let reason):
            return reason
        case .cancelled:
            return "Render cancelled."
        }
    }
}

/// Lets the caller stop an export that has already started.
///
/// `AVAssetExportSession` is not `Sendable`, so the reference lives behind a
/// lock and only `cancelExport()` is ever reached across threads.
nonisolated final class RenderHandle: @unchecked Sendable {
    private let lock = NSLock()
    private var session: AVAssetExportSession?
    private var cancelled: Bool = false

    nonisolated init() {}

    nonisolated var isCancelled: Bool {
        lock.lock()
        defer { lock.unlock() }
        return cancelled
    }

    /// Cancels immediately if `cancel()` already landed while the composition
    /// was still being built.
    nonisolated func attach(_ session: AVAssetExportSession) {
        lock.lock()
        defer { lock.unlock() }
        if cancelled {
            session.cancelExport()
        } else {
            self.session = session
        }
    }

    nonisolated func cancel() {
        lock.lock()
        defer { lock.unlock() }
        cancelled = true
        session?.cancelExport()
    }
}

/// Renders a storyboard into a real video file using this device's own encoder.
///
/// This is the same cut the desktop pipeline would produce — real trims, real
/// transitions, real chroma keying, real H.264 — performed by AVFoundation on
/// the phone instead of by ffmpeg on a paired computer. It exists so a person
/// with no computer to pair can still finish a film, and so the studio screen
/// never has to show progress for work nobody is doing.
nonisolated enum LocalRenderer {
    /// Below this a cut is not a shot, it is a glitch.
    nonisolated static let minimumCutSeconds: Double = 0.4
    nonisolated static let timescale: CMTimeScale = 600

    // MARK: - Planning

    /// Turns a board into the cut list, refusing anything it cannot actually render.
    nonisolated static func cuts(for board: Storyboard) throws -> [RenderCut] {
        guard !board.scenes.isEmpty else { throw LocalRenderError.noScenes }

        var missing: [String] = []
        var uncast = 0
        var cuts: [RenderCut] = []
        for scene in board.scenes {
            // A scene that was cast to footage since deleted is a different
            // problem from one nobody has cast yet, and deserves to be told
            // apart: one needs the file back, the other needs a decision.
            guard let file = scene.clipFileName, MediaLibrary.exists(file) else {
                if scene.clipID != nil || scene.clipFileName != nil {
                    missing.append(scene.clipName ?? scene.title)
                } else {
                    uncast += 1
                }
                continue
            }
            cuts.append(
                RenderCut(
                    id: scene.id,
                    title: scene.title,
                    fileName: file,
                    start: max(0, scene.startSeconds),
                    seconds: max(minimumCutSeconds, Double(scene.seconds)),
                    transition: scene.transition,
                    isKeyed: scene.isKeyed
                )
            )
        }
        guard missing.isEmpty else { throw LocalRenderError.missingFootage(missing) }
        guard uncast == 0 else { throw LocalRenderError.notCast(uncast) }
        return cuts
    }

    /// What this board would cost to render here, before starting.
    nonisolated static func blocker(for board: Storyboard, settings: PipelineSettings) -> String? {
        do {
            _ = try cuts(for: board)
        } catch {
            return (error as? LocalRenderError)?.errorDescription ?? error.localizedDescription
        }
        if settings.greenScreen.isEnabled,
           settings.greenScreen.usesHostFile,
           board.scenes.contains(where: \.isKeyed) {
            return LocalRenderError.backdropOnComputer.errorDescription
        }
        return nil
    }

    /// Differences between this renderer and the desktop pipeline, stated up front.
    nonisolated static func notes(for cuts: [RenderCut], keying: GreenScreenSettings) -> [String] {
        var notes: [String] = []
        if isKeyedRender(cuts: cuts, keying: keying) {
            notes.append("Keyed scenes cut rather than dissolve on device — the key and the cut share one pass here.")
        } else if cuts.dropLast().contains(where: { $0.transition == .circleOpen }) {
            notes.append("Iris renders as a dissolve on device.")
        }
        return notes
    }

    nonisolated static func isKeyedRender(cuts: [RenderCut], keying: GreenScreenSettings) -> Bool {
        keying.isEnabled && cuts.contains(where: \.isKeyed)
    }

    // MARK: - Render

    /// Composes, encodes and measures the film. Progress is reported per stage
    /// so the caller can drive the same tracker the desktop pipeline drives.
    nonisolated static func render(
        cuts: [RenderCut],
        title: String,
        format: RenderFormat,
        fps: Int,
        keying: GreenScreenSettings,
        handle: RenderHandle,
        progress: @Sendable @escaping (RenderStage, Double) async -> Void
    ) async throws -> LocalRenderOutput {
        guard !cuts.isEmpty else { throw LocalRenderError.noScenes }
        let clock = Date()
        let size = pixelSize(for: format)
        let keyed = isKeyedRender(cuts: cuts, keying: keying)
        if keyed && keying.usesHostFile { throw LocalRenderError.backdropOnComputer }

        await progress(keyed ? .composite : .trim, 0.05)
        let timeline = try await buildTimeline(cuts: cuts, size: size, keyed: keyed)
        if handle.isCancelled { throw LocalRenderError.cancelled }
        await progress(keyed ? .composite : .trim, 1)

        let videoComposition: AVMutableVideoComposition
        if keyed {
            videoComposition = try await keyedVideoComposition(
                composition: timeline.composition,
                placements: timeline.placements,
                size: size,
                fps: fps,
                keying: keying
            )
        } else {
            videoComposition = layeredVideoComposition(
                placements: timeline.placements,
                size: size,
                fps: fps
            )
        }
        if handle.isCancelled { throw LocalRenderError.cancelled }

        await progress(.render, 0)
        let destination = try outputURL(for: title)
        try? FileManager.default.removeItem(at: destination)

        guard let session = AVAssetExportSession(
            asset: timeline.composition,
            presetName: AVAssetExportPresetHighestQuality
        ) else {
            throw LocalRenderError.noEncoder
        }
        session.videoComposition = videoComposition
        session.audioMix = timeline.audioMix
        session.shouldOptimizeForNetworkUse = true
        handle.attach(session)

        // Grab the sequence before the task: it is Sendable, the session is not.
        let states = session.states(updateInterval: 0.2)
        let monitor = Task {
            for await state in states {
                if case .exporting(let fraction) = state {
                    await progress(.render, fraction.fractionCompleted)
                }
            }
        }
        defer { monitor.cancel() }

        do {
            try await session.export(to: destination, as: .mp4)
        } catch {
            try? FileManager.default.removeItem(at: destination)
            if handle.isCancelled { throw LocalRenderError.cancelled }
            throw LocalRenderError.exportFailed(error.localizedDescription)
        }
        monitor.cancel()
        await progress(.render, 1)

        // Everything below is measured off the artefact, never predicted.
        await progress(.preview, 0.2)
        let written = AVURLAsset(url: destination)
        let measured = (try? await written.load(.duration).seconds) ?? timeline.duration
        let bytes = (try? FileManager.default.attributesOfItem(atPath: destination.path)[.size] as? Int) ?? nil
        let codec = await codecName(for: written)
        let thumbnail = await posterFrame(for: destination)
        await progress(.preview, 1)

        try? FileManager.default.setAttributes(
            [.protectionKey: FileProtectionType.complete],
            ofItemAtPath: destination.path
        )

        return LocalRenderOutput(
            fileName: destination.lastPathComponent,
            url: destination,
            duration: measured.isFinite ? measured : timeline.duration,
            sizeBytes: bytes ?? 0,
            renderSeconds: Date().timeIntervalSince(clock),
            resolution: format.resolution,
            fps: fps,
            codec: codec,
            scenes: timeline.scenes,
            thumbnailData: thumbnail,
            notes: notes(for: cuts, keying: keying)
        )
    }

    // MARK: - Timeline

    /// A cut once it has been placed on the composition timeline.
    nonisolated private struct Placement {
        let cut: RenderCut
        let track: AVMutableCompositionTrack
        let range: CMTimeRange
        /// Overlap shared with the next cut. Zero for a hard cut.
        let overlapOut: CMTime
        let transform: CGAffineTransform
        let naturalSize: CGSize
    }

    nonisolated private struct Timeline {
        let composition: AVMutableComposition
        let placements: [Placement]
        let audioMix: AVMutableAudioMix?
        let duration: Double
        let scenes: [ManifestScene]
    }

    /// Lays every cut onto the composition, overlapping neighbours by exactly
    /// the transition length so the finished film matches the runtime the
    /// storyboard has been promising all along.
    nonisolated private static func buildTimeline(
        cuts: [RenderCut],
        size: CGSize,
        keyed: Bool
    ) async throws -> Timeline {
        let composition = AVMutableComposition()
        // One track for a keyed render (the filter pass sees a single frame at a
        // time), two for A/B transitions.
        let trackCount = keyed ? 1 : 2
        var videoTracks: [AVMutableCompositionTrack] = []
        for _ in 0..<trackCount {
            guard let video = composition.addMutableTrack(
                withMediaType: .video,
                preferredTrackID: kCMPersistentTrackID_Invalid
            ) else { throw LocalRenderError.noEncoder }
            videoTracks.append(video)
        }
        // Audio tracks are created only when a clip actually carries sound. An
        // empty track in the composition fails the whole export (-11800), which
        // is how a perfectly good silent clip used to kill a render.
        var audioTracks: [Int: AVMutableCompositionTrack] = [:]

        // First pass: read what each source really contains.
        nonisolated struct Resolved {
            let cut: RenderCut
            let sourceRange: CMTimeRange
            let length: Double
            let videoTrack: AVAssetTrack
            let audioTrack: AVAssetTrack?
            /// Sound rarely covers exactly the same span as picture; this is the
            /// part that does exist, and where it sits relative to the frame.
            let audioRange: CMTimeRange?
            let audioOffset: CMTime
            let transform: CGAffineTransform
            let naturalSize: CGSize
        }

        var resolved: [Resolved] = []
        for cut in cuts {
            let asset = AVURLAsset(url: cut.url)
            guard let videoTrack = try? await asset.loadTracks(withMediaType: .video).first else {
                throw LocalRenderError.unreadable(cut.title)
            }
            // The track's own span is the only trustworthy bound. An asset's
            // duration can run past its video track — asking for that extra
            // fraction of a second fails the insert and kills the whole render.
            let assetDuration = ((try? await asset.load(.duration)) ?? .zero)
            let videoRange = (try? await videoTrack.load(.timeRange))
                ?? CMTimeRange(start: .zero, duration: assetDuration)
            let available = videoRange.duration.seconds
            guard available.isFinite, available > 0.05 else {
                throw LocalRenderError.unreadable(cut.title)
            }

            // An in-point past the end of the clip would render nothing at all.
            let start = min(max(0, cut.start), max(0, available - minimumCutSeconds))
            let length = min(cut.seconds, max(0, available - start))
            guard length >= 0.1 else { throw LocalRenderError.unreadable(cut.title) }

            let requested = CMTimeRange(
                start: CMTimeAdd(videoRange.start, CMTime(seconds: start, preferredTimescale: timescale)),
                duration: CMTime(seconds: length, preferredTimescale: timescale)
            )
            let sourceRange = requested.intersection(videoRange)
            guard sourceRange.duration.seconds >= 0.1 else {
                throw LocalRenderError.unreadable(cut.title)
            }

            let naturalSize = (try? await videoTrack.load(.naturalSize)) ?? size
            let preferred = (try? await videoTrack.load(.preferredTransform)) ?? .identity
            let audioTrack = try? await asset.loadTracks(withMediaType: .audio).first ?? nil

            var audioRange: CMTimeRange?
            var audioOffset = CMTime.zero
            if let audioTrack {
                let span = (try? await audioTrack.load(.timeRange)) ?? sourceRange
                let overlap = sourceRange.intersection(span)
                if overlap.duration.seconds > 0.05 {
                    audioRange = overlap
                    audioOffset = CMTimeSubtract(overlap.start, sourceRange.start)
                }
            }

            resolved.append(
                Resolved(
                    cut: cut,
                    sourceRange: sourceRange,
                    length: sourceRange.duration.seconds,
                    videoTrack: videoTrack,
                    audioTrack: audioTrack,
                    audioRange: audioRange,
                    audioOffset: audioOffset,
                    transform: fillTransform(naturalSize: naturalSize, preferred: preferred, target: size),
                    naturalSize: naturalSize
                )
            )
        }

        // Second pass: place them, overlapping by the transition.
        var placements: [Placement] = []
        var scenes: [ManifestScene] = []
        var cursor = CMTime.zero
        for (index, item) in resolved.enumerated() {
            let trackIndex = keyed ? 0 : index % 2
            let videoTrack = videoTracks[trackIndex]
            do {
                try videoTrack.insertTimeRange(item.sourceRange, of: item.videoTrack, at: cursor)
            } catch {
                // Name the clip rather than surface an AVFoundation code.
                throw LocalRenderError.unreadable(item.cut.title)
            }
            if let sourceAudio = item.audioTrack, let audioRange = item.audioRange {
                let audioTrack = audioTracks[trackIndex] ?? composition.addMutableTrack(
                    withMediaType: .audio,
                    preferredTrackID: kCMPersistentTrackID_Invalid
                )
                if let audioTrack {
                    audioTracks[trackIndex] = audioTrack
                    // A clip with unreadable audio must not kill the picture.
                    try? audioTrack.insertTimeRange(
                        audioRange,
                        of: sourceAudio,
                        at: CMTimeAdd(cursor, item.audioOffset)
                    )
                }
            }

            let range = CMTimeRange(start: cursor, duration: item.sourceRange.duration)
            var overlap = CMTime.zero
            if !keyed, index + 1 < resolved.count, item.cut.transition != .cut {
                let next = resolved[index + 1]
                // Never eat more than half of either shot, or the transition
                // would consume a neighbour whole.
                let seconds = min(item.cut.transition.seconds, item.length * 0.5, next.length * 0.5)
                if seconds > 0.05 {
                    overlap = CMTime(seconds: seconds, preferredTimescale: timescale)
                }
            }

            placements.append(
                Placement(
                    cut: item.cut,
                    track: videoTrack,
                    range: range,
                    overlapOut: overlap,
                    transform: item.transform,
                    naturalSize: item.naturalSize
                )
            )
            scenes.append(
                ManifestScene(
                    id: item.cut.id.uuidString,
                    file: item.cut.fileName,
                    start: timecode(range.start.seconds),
                    end: timecode(range.end.seconds),
                    duration: item.length,
                    transition: keyed && item.cut.transition != .cut
                        ? SceneTransition.cut.pipelineValue
                        : item.cut.transition.pipelineValue
                )
            )

            cursor = CMTimeSubtract(range.end, overlap)
        }

        // A single-scene film leaves the B track empty, and a clip whose audio
        // could not be read leaves an audio track empty. Either one fails the
        // export outright, so nothing empty survives to the encoder.
        for track in composition.tracks where track.segments.isEmpty {
            composition.removeTrack(track)
        }

        let audioMix = keyed
            ? nil
            : crossfadeMix(placements: placements, audioTracks: audioTracks)

        return Timeline(
            composition: composition,
            placements: placements,
            audioMix: audioMix,
            duration: composition.duration.seconds,
            scenes: scenes
        )
    }

    // MARK: - Video composition (transitions)

    /// Builds the instruction list: a solo pass per shot and a real transition
    /// instruction over every overlap.
    nonisolated private static func layeredVideoComposition(
        placements: [Placement],
        size: CGSize,
        fps: Int
    ) -> AVMutableVideoComposition {
        let videoComposition = AVMutableVideoComposition()
        videoComposition.renderSize = size
        videoComposition.frameDuration = CMTime(value: 1, timescale: CMTimeScale(max(1, fps)))

        var instructions: [AVMutableVideoCompositionInstruction] = []
        for (index, placement) in placements.enumerated() {
            let overlapIn = index > 0 ? placements[index - 1].overlapOut : .zero
            let soloStart = CMTimeAdd(placement.range.start, overlapIn)
            let soloEnd = CMTimeSubtract(placement.range.end, placement.overlapOut)

            if CMTimeCompare(soloEnd, soloStart) > 0 {
                let instruction = AVMutableVideoCompositionInstruction()
                instruction.timeRange = CMTimeRange(start: soloStart, end: soloEnd)
                instruction.backgroundColor = UIColor.black.cgColor
                let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: placement.track)
                layer.setTransform(placement.transform, at: soloStart)
                instruction.layerInstructions = [layer]
                instructions.append(instruction)
            }

            if CMTimeCompare(placement.overlapOut, .zero) > 0, index + 1 < placements.count {
                let instruction = AVMutableVideoCompositionInstruction()
                instruction.timeRange = CMTimeRange(start: soloEnd, duration: placement.overlapOut)
                instruction.backgroundColor = UIColor.black.cgColor
                instruction.layerInstructions = transitionLayers(
                    outgoing: placement,
                    incoming: placements[index + 1],
                    range: instruction.timeRange,
                    size: size
                )
                instructions.append(instruction)
            }
        }
        videoComposition.instructions = instructions
        return videoComposition
    }

    /// The transition itself. Front layer first, as AVFoundation composites.
    nonisolated private static func transitionLayers(
        outgoing: Placement,
        incoming: Placement,
        range: CMTimeRange,
        size: CGSize
    ) -> [AVMutableVideoCompositionLayerInstruction] {
        let out = AVMutableVideoCompositionLayerInstruction(assetTrack: outgoing.track)
        out.setTransform(outgoing.transform, at: range.start)
        let incomingLayer = AVMutableVideoCompositionLayerInstruction(assetTrack: incoming.track)
        incomingLayer.setTransform(incoming.transform, at: range.start)

        switch outgoing.cut.transition {
        case .cut:
            return [out, incomingLayer]

        case .dissolve, .circleOpen:
            // An iris needs a shaped matte, which layer instructions cannot
            // describe; it dissolves here and the caller says so.
            out.setOpacityRamp(fromStartOpacity: 1, toEndOpacity: 0, timeRange: range)
            return [out, incomingLayer]

        case .fade, .slowFade:
            // Down to black, then up: two ramps inside the same window, so the
            // film keeps the runtime the storyboard promised.
            let half = CMTimeMultiplyByFloat64(range.duration, multiplier: 0.5)
            out.setOpacityRamp(
                fromStartOpacity: 1,
                toEndOpacity: 0,
                timeRange: CMTimeRange(start: range.start, duration: half)
            )
            incomingLayer.setOpacity(0, at: range.start)
            incomingLayer.setOpacityRamp(
                fromStartOpacity: 0,
                toEndOpacity: 1,
                timeRange: CMTimeRange(start: CMTimeAdd(range.start, half), duration: half)
            )
            return [out, incomingLayer]

        case .wipeLeft:
            // Crop is applied in source coordinates, before the transform.
            let full = CGRect(origin: .zero, size: outgoing.naturalSize)
            let closed = CGRect(x: 0, y: 0, width: 1, height: outgoing.naturalSize.height)
            out.setCropRectangleRamp(
                fromStartCropRectangle: full,
                toEndCropRectangle: closed,
                timeRange: range
            )
            return [out, incomingLayer]

        case .slideUp:
            // The incoming shot travels over the outgoing one, so it leads.
            let below = incoming.transform.concatenating(
                CGAffineTransform(translationX: 0, y: size.height)
            )
            incomingLayer.setTransformRamp(
                fromStart: below,
                toEnd: incoming.transform,
                timeRange: range
            )
            return [incomingLayer, out]
        }
    }

    /// Volume ramps that match the picture overlaps, so sound crosses with image.
    nonisolated private static func crossfadeMix(
        placements: [Placement],
        audioTracks: [Int: AVMutableCompositionTrack]
    ) -> AVMutableAudioMix? {
        // Both sides have to carry sound before there is a crossfade to make.
        guard let sideA = audioTracks[0], let sideB = audioTracks[1] else { return nil }
        let parameters = [
            AVMutableAudioMixInputParameters(track: sideA),
            AVMutableAudioMixInputParameters(track: sideB)
        ]
        var used = false

        for (index, placement) in placements.enumerated() {
            let side = index % 2
            parameters[side].setVolume(1, at: placement.range.start)
            guard CMTimeCompare(placement.overlapOut, .zero) > 0, index + 1 < placements.count else { continue }
            let range = CMTimeRange(
                start: CMTimeSubtract(placement.range.end, placement.overlapOut),
                duration: placement.overlapOut
            )
            parameters[side].setVolumeRamp(fromStartVolume: 1, toEndVolume: 0, timeRange: range)
            parameters[1 - side].setVolumeRamp(fromStartVolume: 0, toEndVolume: 1, timeRange: range)
            used = true
        }
        guard used else { return nil }

        let mix = AVMutableAudioMix()
        mix.inputParameters = parameters
        return mix
    }

    // MARK: - Chroma key

    /// The keyed path: one filter pass per frame, keying the shots that asked
    /// for it and laying them over the chosen backdrop.
    nonisolated private static func keyedVideoComposition(
        composition: AVMutableComposition,
        placements: [Placement],
        size: CGSize,
        fps: Int,
        keying: GreenScreenSettings
    ) async throws -> AVMutableVideoComposition {
        let cube = chromaKeyCube(
            key: keying.key,
            tolerance: keying.tolerance,
            softness: keying.softness,
            despill: keying.despill
        )
        let cubeSize = chromaCubeSize
        let backdrop = ciColor(fromHex: keying.normalisedColor)
        // Only the windows that actually asked to be keyed.
        let keyedWindows: [ClosedRange<Double>] = placements
            .filter(\.cut.isKeyed)
            .map { $0.range.start.seconds...$0.range.end.seconds }
        let feather = max(0, min(12, keying.feather))
        let scale = max(0.4, min(2.0, keying.scale))
        let offsetX = max(-0.5, min(0.5, keying.offsetX))
        let offsetY = max(-0.5, min(0.5, keying.offsetY))
        let target = size

        let videoComposition = try await AVMutableVideoComposition.videoComposition(
            with: composition
        ) { request in
            let frame = CGRect(origin: .zero, size: target)
            let source = request.sourceImage
            let time = request.compositionTime.seconds
            let shouldKey = keyedWindows.contains { $0.contains(time) }

            var image = source
            if shouldKey {
                if let filter = CIFilter(name: "CIColorCube", parameters: [
                    "inputCubeDimension": cubeSize,
                    "inputCubeData": cube,
                    kCIInputImageKey: source
                ]), let keyed = filter.outputImage {
                    image = keyed
                }
                if feather > 0 {
                    let blurred = image
                        .clampedToExtent()
                        .applyingGaussianBlur(sigma: Double(feather) * 0.5)
                        .cropped(to: image.extent)
                    image = blurred
                }
            }

            // Fill the delivery frame from whatever the source frame measures.
            let extent = image.extent
            var output = image
            if extent.width > 0, extent.height > 0 {
                let fill = max(frame.width / extent.width, frame.height / extent.height) * (shouldKey ? scale : 1)
                var transform = CGAffineTransform(translationX: -extent.midX, y: -extent.midY)
                transform = transform.concatenating(CGAffineTransform(scaleX: fill, y: fill))
                transform = transform.concatenating(
                    CGAffineTransform(
                        translationX: frame.midX + CGFloat(offsetX) * frame.width * (shouldKey ? 1 : 0),
                        y: frame.midY - CGFloat(offsetY) * frame.height * (shouldKey ? 1 : 0)
                    )
                )
                output = image.transformed(by: transform)
            }

            if shouldKey {
                let plate = CIImage(color: backdrop).cropped(to: frame)
                output = output.composited(over: plate)
            }
            request.finish(with: output.cropped(to: frame), context: nil)
        }

        videoComposition.renderSize = size
        videoComposition.frameDuration = CMTime(value: 1, timescale: CMTimeScale(max(1, fps)))
        return videoComposition
    }

    nonisolated static let chromaCubeSize: Int = 32

    /// A colour cube that drops the key hue and pulls its spill out of what is left.
    ///
    /// Data is premultiplied, which is what `CIColorCube` expects: the RGB of a
    /// fully keyed cell has to go to zero along with its alpha, or the matte
    /// edge fringes with the key colour.
    nonisolated static func chromaKeyCube(
        key: ChromaKey,
        tolerance: Double,
        softness: Double,
        despill: Double,
        dimension: Int = LocalRenderer.chromaCubeSize
    ) -> Data {
        let keyHue = hue(ofHex: key.hex)
        let radius = max(0.01, tolerance) * 0.5
        let falloff = max(0.001, softness)
        let spill = max(0, min(1, despill))
        var cube: [Float] = []
        cube.reserveCapacity(dimension * dimension * dimension * 4)

        for blueIndex in 0..<dimension {
            for greenIndex in 0..<dimension {
                for redIndex in 0..<dimension {
                    let divisor = Double(dimension - 1)
                    let red = Double(redIndex) / divisor
                    var green = Double(greenIndex) / divisor
                    var blue = Double(blueIndex) / divisor
                    let (pixelHue, saturation, value) = hsv(red: red, green: green, blue: blue)

                    var alpha = 1.0
                    // Greys carry no hue worth trusting, so they always stay.
                    if saturation > 0.15, value > 0.15 {
                        var distance = abs(pixelHue - keyHue)
                        if distance > 0.5 { distance = 1 - distance }
                        if distance < radius {
                            alpha = 0
                        } else if distance < radius + falloff {
                            alpha = (distance - radius) / falloff
                        }
                    }

                    if alpha > 0, spill > 0 {
                        // Bleed of the key colour onto the subject's edges.
                        switch key {
                        case .green:
                            let neutral = (red + blue) * 0.5
                            if green > neutral { green += (neutral - green) * spill }
                        case .blue:
                            let neutral = (red + green) * 0.5
                            if blue > neutral { blue += (neutral - blue) * spill }
                        case .magenta:
                            let neutral = (red + blue) * 0.5
                            if green < neutral { green += (neutral - green) * spill }
                        }
                    }

                    cube.append(Float(red * alpha))
                    cube.append(Float(green * alpha))
                    cube.append(Float(blue * alpha))
                    cube.append(Float(alpha))
                }
            }
        }
        return cube.withUnsafeBufferPointer { Data(buffer: $0) }
    }

    // MARK: - Maths

    /// Aspect-fill into the delivery frame, honouring how the camera held itself.
    nonisolated static func fillTransform(
        naturalSize: CGSize,
        preferred: CGAffineTransform,
        target: CGSize
    ) -> CGAffineTransform {
        let bounds = CGRect(origin: .zero, size: naturalSize).applying(preferred)
        guard bounds.width > 0, bounds.height > 0, target.width > 0, target.height > 0 else {
            return preferred
        }
        // A rotation can push the frame into negative space; pull it back first.
        var transform = preferred.concatenating(
            CGAffineTransform(translationX: -bounds.minX, y: -bounds.minY)
        )
        let scale = max(target.width / bounds.width, target.height / bounds.height)
        transform = transform.concatenating(CGAffineTransform(scaleX: scale, y: scale))
        let scaled = CGSize(width: bounds.width * scale, height: bounds.height * scale)
        return transform.concatenating(
            CGAffineTransform(
                translationX: (target.width - scaled.width) / 2,
                y: (target.height - scaled.height) / 2
            )
        )
    }

    nonisolated static func pixelSize(for format: RenderFormat) -> CGSize {
        let parts = format.resolution.split(separator: "x")
        guard parts.count == 2,
              let width = Double(parts[0]),
              let height = Double(parts[1]) else {
            return CGSize(width: 1920, height: 1080)
        }
        // Encoders want even dimensions; every listed format already is.
        return CGSize(width: width, height: height)
    }

    nonisolated static func hsv(red: Double, green: Double, blue: Double) -> (Double, Double, Double) {
        let maximum = max(red, green, blue)
        let minimum = min(red, green, blue)
        let delta = maximum - minimum
        guard delta > 0.0001 else { return (0, 0, maximum) }

        var hue: Double
        if maximum == red {
            hue = (green - blue) / delta
            if hue < 0 { hue += 6 }
        } else if maximum == green {
            hue = 2 + (blue - red) / delta
        } else {
            hue = 4 + (red - green) / delta
        }
        return (hue / 6, maximum > 0 ? delta / maximum : 0, maximum)
    }

    /// Hue of a `#RRGGBB` string, 0…1. The key colours are declared once, in
    /// `ChromaKey`, so the cube and the swatch can never disagree.
    nonisolated static func hue(ofHex hex: String) -> Double {
        let (red, green, blue) = channels(ofHex: hex)
        return hsv(red: red, green: green, blue: blue).0
    }

    nonisolated static func channels(ofHex hex: String) -> (Double, Double, Double) {
        let cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
        guard cleaned.count == 6, let value = Int(cleaned, radix: 16) else { return (0, 0, 0) }
        return (
            Double((value >> 16) & 0xFF) / 255,
            Double((value >> 8) & 0xFF) / 255,
            Double(value & 0xFF) / 255
        )
    }

    nonisolated static func ciColor(fromHex hex: String) -> CIColor {
        let (red, green, blue) = channels(ofHex: hex)
        return CIColor(red: red, green: green, blue: blue)
    }

    /// `0:00:03.50`, the shape the pipeline writes into `manifest.json`.
    nonisolated static func timecode(_ seconds: Double) -> String {
        guard seconds.isFinite, seconds >= 0 else { return "0:00:00.00" }
        let whole = Int(seconds)
        let fraction = Int(((seconds - Double(whole)) * 100).rounded())
        return String(
            format: "%d:%02d:%02d.%02d",
            whole / 3600,
            (whole % 3600) / 60,
            whole % 60,
            min(99, fraction)
        )
    }

    // MARK: - Files

    nonisolated static var directory: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Renders", isDirectory: true)
    }

    nonisolated static func outputURL(for title: String) throws -> URL {
        let directory = self.directory
        if !FileManager.default.fileExists(atPath: directory.path) {
            try FileManager.default.createDirectory(
                at: directory,
                withIntermediateDirectories: true,
                attributes: [.protectionKey: FileProtectionType.complete]
            )
        }
        let slug = title
            .lowercased()
            .map { $0.isLetter || $0.isNumber ? String($0) : "-" }
            .joined()
            .split(separator: "-")
            .joined(separator: "-")
        let stem = slug.isEmpty ? "film" : String(slug.prefix(40))
        return directory.appendingPathComponent("\(stem)-\(Int(Date().timeIntervalSince1970)).mp4")
    }

    nonisolated static func removeOutput(named fileName: String?) {
        guard let fileName, !fileName.isEmpty else { return }
        try? FileManager.default.removeItem(at: directory.appendingPathComponent(fileName))
    }

    nonisolated static func exists(_ fileName: String?) -> Bool {
        guard let fileName, !fileName.isEmpty else { return false }
        return FileManager.default.fileExists(
            atPath: directory.appendingPathComponent(fileName).path
        )
    }

    /// The codec the encoder actually chose, from the file's format description.
    nonisolated private static func codecName(for asset: AVURLAsset) async -> String {
        guard let track = try? await asset.loadTracks(withMediaType: .video).first,
              let descriptions = try? await track.load(.formatDescriptions),
              let description = descriptions.first else { return "h264" }
        let subType = CMFormatDescriptionGetMediaSubType(description)
        let characters = [24, 16, 8, 0].map { shift -> Character in
            Character(UnicodeScalar(UInt8((subType >> UInt32(shift)) & 0xFF)))
        }
        switch String(characters) {
        case "avc1": return "h264"
        case "hvc1", "hev1": return "hevc"
        default: return String(characters)
        }
    }

    /// A frame from the film itself, a little way in so it is not the head fade.
    nonisolated private static func posterFrame(for url: URL) async -> Data? {
        let asset = AVURLAsset(url: url)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 1280, height: 1280)

        let seconds = ((try? await asset.load(.duration).seconds) ?? 0)
        let target = seconds > 2 ? min(2, seconds * 0.15) : 0
        guard let image = try? await generator.image(
            at: CMTime(seconds: target, preferredTimescale: timescale)
        ).image else { return nil }
        return UIImage(cgImage: image).jpegData(compressionQuality: 0.9)
    }
}
