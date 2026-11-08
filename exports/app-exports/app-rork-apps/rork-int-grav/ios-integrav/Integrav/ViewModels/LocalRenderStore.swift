import Foundation
import Observation

/// Drives a real render performed by this device.
///
/// The job it publishes is the same `RenderJob` the desktop pipeline fills in,
/// carrying the same five stages — but every value in it is measured here:
/// the stage is where the encoder actually is, and the progress is the fraction
/// AVFoundation reports, not a clock pretending to be one.
@Observable
final class LocalRenderStore {
    private(set) var job: RenderJob?
    private(set) var error: String?
    /// Where this renderer differs from the desktop pipeline, said plainly.
    private(set) var notes: [String] = []
    private(set) var lastSummary: String?

    private var handle: RenderHandle?
    private var task: Task<Void, Never>?

    var isRendering: Bool {
        guard let job else { return false }
        return !job.isFinished && !job.hasFailed
    }

    /// Why this board cannot be rendered here, or `nil` if it can.
    func blocker(for board: Storyboard, settings: PipelineSettings) -> String? {
        LocalRenderer.blocker(for: board, settings: settings)
    }

    // MARK: - Render

    func render(board: Storyboard, settings: PipelineSettings, into production: ProductionStore) {
        guard !isRendering else { return }
        error = nil
        notes = []
        lastSummary = nil

        let cuts: [RenderCut]
        do {
            cuts = try LocalRenderer.cuts(for: board)
        } catch {
            self.error = (error as? LocalRenderError)?.errorDescription ?? error.localizedDescription
            return
        }

        let keying = settings.greenScreen
        let keyed = LocalRenderer.isKeyedRender(cuts: cuts, keying: keying)
        notes = LocalRenderer.notes(for: cuts, keying: keying)

        job = RenderJob(
            title: board.title,
            sceneCount: cuts.count,
            // The board's runtime is the honest expectation until the file
            // exists; it is replaced by the measured length on completion.
            outputDuration: board.runtimeSeconds,
            resolution: settings.format.resolution,
            fps: settings.fps,
            stage: keyed ? .composite : .trim,
            stageProgress: 0,
            uploadsToYouTube: false,
            usesGreenScreen: keyed
        )

        let handle = RenderHandle()
        self.handle = handle
        let format = settings.format
        let fps = settings.fps
        let title = board.title

        task = Task { [weak self] in
            do {
                let output = try await LocalRenderer.render(
                    cuts: cuts,
                    title: title,
                    format: format,
                    fps: fps,
                    keying: keying,
                    handle: handle,
                    progress: { stage, fraction in
                        await self?.advance(stage: stage, fraction: fraction)
                    }
                )
                await self?.finish(output: output, into: production)
            } catch {
                await self?.fail(error)
            }
        }
    }

    func cancel() {
        handle?.cancel()
        task?.cancel()
    }

    /// Clears a finished or failed card off the screen.
    func dismiss() {
        guard !isRendering else { return }
        job = nil
        error = nil
        notes = []
    }

    // MARK: - Progress

    private func advance(stage: RenderStage, fraction: Double) {
        guard var current = job, !current.isFinished, !current.hasFailed else { return }
        current.stage = stage
        current.stageProgress = min(1, max(0, fraction))
        job = current
    }

    private func finish(output: LocalRenderOutput, into production: ProductionStore) {
        guard var current = job else { return }
        current.stage = current.activeStages.last ?? .render
        current.stageProgress = 1
        current.outputDuration = output.duration
        current.finishedAt = .now
        job = current
        notes = output.notes

        production.adopt(manifest: manifest(from: output), thumbnailData: output.thumbnailData)

        let speed = output.renderSeconds > 0 ? output.duration / output.renderSeconds : 0
        lastSummary = String(
            format: "%@ · %@ in %@ (%.2f×)",
            output.resolution,
            ProductionStore.durationLabel(output.duration),
            ProductionStore.durationLabel(output.renderSeconds),
            speed
        )
        handle = nil
        task = nil
    }

    private func fail(_ error: Error) {
        let message = (error as? LocalRenderError)?.errorDescription ?? error.localizedDescription
        if case LocalRenderError.cancelled = error {
            job = nil
        } else if var current = job {
            current.failure = message
            job = current
        }
        self.error = message
        handle = nil
        task = nil
    }

    // MARK: - Manifest

    /// The same shape `manifest.json` has on the computer, so a film rendered
    /// here and one rendered there sit in the gallery as equals.
    private func manifest(from output: LocalRenderOutput) -> RenderManifest {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"

        let total = Int(output.duration.rounded())
        let durationLabel = total >= 3600
            ? String(format: "%d:%02d:%02d", total / 3600, (total % 3600) / 60, total % 60)
            : String(format: "%d:%02d", total / 60, total % 60)

        return RenderManifest(
            generatedAt: formatter.string(from: .now),
            output: output.fileName,
            duration: output.duration,
            durationLabel: durationLabel,
            resolution: output.resolution,
            fps: Double(output.fps),
            codec: output.codec,
            sizeBytes: output.sizeBytes,
            sizeLabel: ProductionStore.byteLabel(output.sizeBytes),
            renderSeconds: output.renderSeconds,
            scenes: output.scenes,
            preview: nil,
            thumbnail: output.thumbnailData == nil ? nil : "thumb.jpg"
        )
    }
}
