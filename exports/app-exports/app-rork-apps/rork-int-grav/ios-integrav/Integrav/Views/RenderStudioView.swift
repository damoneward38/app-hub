import AVKit
import SwiftUI
import UniformTypeIdentifiers

/// Everything the render studio can present modally.
///
/// One enum behind one `sheet(item:)`: SwiftUI keeps only the last sheet
/// modifier attached to a view, so four stacked ones left three dead buttons.
enum StudioSheet: Identifiable {
    case pipeline
    case youTube
    case computer
    case render(ImportedRender)

    var id: String {
        switch self {
        case .pipeline: return "pipeline"
        case .youTube: return "youtube"
        case .computer: return "computer"
        case .render(let render): return "render-\(render.id)"
        }
    }
}

/// Production dashboard: live progress for queued renders, plus the gallery of
/// finished masters imported from a houly-pipe `out/` folder.
struct RenderStudioView: View {
    /// When it is a tab root the tab bar must stay put; when it is pushed from
    /// another screen the tab bar is hidden to give the gallery full height.
    var isTabRoot: Bool = false

    @Environment(EngineStore.self) private var engine
    @Environment(ProductionStore.self) private var production
    @Environment(BridgeStore.self) private var bridge
    @Environment(StoryboardStore.self) private var storyboards
    @Environment(LocalRenderStore.self) private var localRender

    @State private var sheet: StudioSheet?
    @State private var showImporter: Bool = false
    @State private var boardID: UUID?

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.55)

            ScrollView {
                VStack(spacing: 18) {
                    statsStrip
                    settingsRow
                    computerSection
                    deviceSection
                    activeSection
                    gallerySection
                }
                .padding(.horizontal, 16)
                .padding(.top, 4)
                .padding(.bottom, 32)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Render studio")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .toolbar(isTabRoot ? .visible : .hidden, for: .tabBar)
        // Four stacked sheet modifiers meant only the last survived: Pipeline,
        // YouTube and Computer all set their flag and opened nothing.
        .sheet(item: $sheet) { destination in
            switch destination {
            case .pipeline:
                RenderSettingsSheet(
                    projectTitle: engine.activeRenders.first?.title ?? "Intégrav render"
                )
            case .youTube:
                YouTubeSettingsSheet()
            case .computer:
                ConnectComputerSheet()
            case .render(let render):
                RenderDetailSheet(render: render)
            }
        }
        // Poll the paired computer only while this screen is on show.
        .task {
            bridge.startPolling()
        }
        .onDisappear {
            bridge.stopPolling()
        }
        .fileImporter(
            isPresented: $showImporter,
            allowedContentTypes: [.folder],
            allowsMultipleSelection: false
        ) { result in
            switch result {
            case .success(let urls):
                if let url = urls.first { production.importFolder(at: url) }
            case .failure(let error):
                print("Render import cancelled: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Stats

    private var statsStrip: some View {
        HStack(spacing: 10) {
            statTile(
                value: "\(production.renders.count)",
                label: "masters",
                tint: Theme.magenta
            )
            statTile(
                value: ProductionStore.durationLabel(production.totalRenderedSeconds),
                label: "delivered",
                tint: Theme.violet
            )
            statTile(
                value: production.averageRealtimeFactor > 0
                    ? String(format: "%.2f×", production.averageRealtimeFactor)
                    : "—",
                label: "avg speed",
                tint: Theme.success
            )
        }
    }

    private func statTile(value: String, label: String, tint: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(tint)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .integravCard()
    }

    // MARK: - Settings row

    private var settingsRow: some View {
        HStack(spacing: 10) {
            settingsButton(
                title: "Pipeline",
                detail: production.settings.summary,
                symbol: "slider.horizontal.3",
                tint: Theme.violet
            ) {
                sheet = .pipeline
            }

            settingsButton(
                title: "YouTube",
                detail: production.channel?.title ?? "Not connected",
                symbol: production.isConnected ? "checkmark.seal.fill" : "play.rectangle",
                tint: production.isConnected ? Theme.success : Theme.textSecondary
            ) {
                sheet = .youTube
            }

            settingsButton(
                title: "Computer",
                detail: bridge.isLinked ? bridge.hostLabel : "Not linked",
                symbol: computerSymbol,
                tint: computerTint
            ) {
                sheet = .computer
            }
        }
    }

    private var computerSymbol: String {
        guard bridge.isLinked else { return "desktopcomputer" }
        return bridge.isUnreachable ? "exclamationmark.triangle.fill" : "checkmark.seal.fill"
    }

    private var computerTint: Color {
        guard bridge.isLinked else { return Theme.textSecondary }
        return bridge.isUnreachable ? Theme.warning : Theme.success
    }

    // MARK: - Paired computer

    /// Live view of the machine actually running FFmpeg, plus one-tap dispatch.
    @ViewBuilder
    private var computerSection: some View {
        if bridge.isLinked {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 8) {
                    if bridge.status?.isBusy == true { LiveDot() }
                    Text("ON \(bridge.hostLabel.uppercased())")
                        .font(.caption.weight(.bold))
                        .kerning(1.2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                    Spacer(minLength: 0)
                    Text(bridge.statusLine)
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }

                if let status = bridge.status, let job = status.activeJob, status.pipeline.isRunning {
                    remoteJobCard(job: job, status: status.pipeline)
                } else {
                    dispatchButton
                }

                if let error = bridge.linkError {
                    Label(error, systemImage: "exclamationmark.triangle.fill")
                        .font(.caption2)
                        .foregroundStyle(Theme.warning)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.85), value: bridge.status?.activeJob)
        }
    }

    private func remoteJobCard(job: BridgeJob, status: BridgePipelineStatus) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(job.title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                Spacer(minLength: 8)
                Text("\(Int(status.clampedProgress * 100))%")
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.magenta)
                    .monospacedDigit()
            }

            GlowBar(progress: status.clampedProgress)

            HStack {
                Text(status.stageLabel)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                if let speed = status.speed, !speed.isEmpty {
                    Text(speed)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(Theme.violet)
                        .monospacedDigit()
                }
            }

            Button(role: .destructive) {
                Haptics.tap()
                Task { await bridge.cancelActive() }
            } label: {
                Text("Stop")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.warning)
                    .frame(maxWidth: .infinity, minHeight: 38)
                    .background(Theme.warning.opacity(0.12), in: .rect(cornerRadius: 12))
            }
            .buttonStyle(PressableButtonStyle())
        }
        .padding(14)
        .integravCard(highlight: true)
    }

    private var dispatchButton: some View {
        Button {
            Haptics.tap()
            Task {
                await bridge.dispatch(
                    settings: production.settings,
                    title: engine.activeRenders.first?.title ?? "Intégrav render"
                )
            }
        } label: {
            HStack(spacing: 8) {
                if bridge.isDispatching {
                    ProgressView().tint(.white)
                } else {
                    Image(systemName: "paperplane.fill")
                }
                VStack(alignment: .leading, spacing: 1) {
                    Text("Render on \(bridge.hostLabel)")
                        .font(.subheadline.weight(.bold))
                    Text(production.settings.summary)
                        .font(.caption2)
                        .opacity(0.85)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                Spacer(minLength: 0)
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity, minHeight: 58, alignment: .leading)
            .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
        }
        .buttonStyle(PressableButtonStyle())
        .disabled(bridge.isDispatching || bridge.isUnreachable)
        .opacity(bridge.isUnreachable ? 0.5 : 1)
    }

    private func settingsButton(
        title: String,
        detail: String,
        symbol: String,
        tint: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                Image(systemName: symbol)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(tint)
                Text(title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                Text(detail)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, minHeight: 96, alignment: .topLeading)
            .padding(14)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - This device

    /// The board this phone would render, defaulting to the first one that is
    /// fully cast rather than to whatever happens to be at the top.
    private var selectedBoard: Storyboard? {
        if let boardID, let found = storyboards.board(id: boardID) { return found }
        return storyboards.readyBoards.first ?? storyboards.boards.first
    }

    /// Real rendering, performed here. Not a stand-in for the computer — the
    /// same cut, encoded by this device, so a person with nothing to pair with
    /// can still finish a film.
    @ViewBuilder
    private var deviceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                if localRender.isRendering { LiveDot() }
                Text("ON THIS \(UIDevice.current.model.uppercased())")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer(minLength: 0)
                Text(production.settings.format.title + " · \(production.settings.fps)fps")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .monospacedDigit()
            }

            if let job = localRender.job {
                ActiveRenderCard(
                    job: job,
                    estimate: job.isFinished || job.hasFailed
                        ? ""
                        : production.estimateLabel(
                            forOutputSeconds: job.outputDuration * (1 - job.overallProgress)
                          )
                ) {
                    Haptics.tap()
                    if localRender.isRendering {
                        localRender.cancel()
                    } else {
                        withAnimation(.snappy) { localRender.dismiss() }
                    }
                }
            } else {
                deviceLauncher
            }

            if let summary = localRender.lastSummary {
                Label(summary, systemImage: "checkmark.seal.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.success)
                    .monospacedDigit()
            }

            ForEach(localRender.notes, id: \.self) { note in
                Label(note, systemImage: "info.circle")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if let error = localRender.error {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.warning)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: localRender.job)
    }

    @ViewBuilder
    private var deviceLauncher: some View {
        if let board = selectedBoard {
            let blocker = localRender.blocker(for: board, settings: production.settings)
            VStack(alignment: .leading, spacing: 10) {
                if storyboards.boards.count > 1 {
                    Menu {
                        ForEach(storyboards.boards) { candidate in
                            Button {
                                Haptics.tap()
                                boardID = candidate.id
                            } label: {
                                Label(
                                    "\(candidate.title) · \(candidate.castCount)/\(candidate.scenes.count) cast",
                                    systemImage: candidate.isReadyToRender ? "checkmark.circle.fill" : "circle.dashed"
                                )
                            }
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Text(board.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                                .lineLimit(1)
                            Image(systemName: "chevron.up.chevron.down")
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                            Spacer(minLength: 0)
                        }
                    }
                } else {
                    Text(board.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                }

                Text("\(board.scenes.count) scenes · \(board.runtimeLabel) · \(board.castCount)/\(board.scenes.count) cast")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .monospacedDigit()

                Button {
                    Haptics.tap()
                    localRender.render(
                        board: board,
                        settings: production.settings,
                        into: production
                    )
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "wand.and.stars")
                        Text("Render here")
                            .font(.subheadline.weight(.bold))
                        Spacer(minLength: 0)
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .frame(maxWidth: .infinity, minHeight: 50)
                    .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
                }
                .buttonStyle(PressableButtonStyle())
                .disabled(blocker != nil)
                .opacity(blocker == nil ? 1 : 0.45)

                if let blocker {
                    Text(blocker)
                        .font(.caption2)
                        .foregroundStyle(Theme.warning)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(14)
            .integravCard()
        } else {
            VStack(alignment: .leading, spacing: 6) {
                Text("No storyboard yet")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Text("Build one in Cinema and cast a clip to every scene. This device can then cut and encode the film itself, with or without a computer.")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .integravCard()
        }
    }

    // MARK: - Active renders

    @ViewBuilder
    private var activeSection: some View {
        let active = engine.activeRenders
        if !active.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 8) {
                    LiveDot()
                    Text("IN PRODUCTION")
                        .font(.caption.weight(.bold))
                        .kerning(1.2)
                        .foregroundStyle(Theme.textSecondary)
                }

                ForEach(active) { job in
                    ActiveRenderCard(
                        job: job,
                        // No estimate without a length to base it on.
                        estimate: job.outputDuration > 0
                            ? production.estimateLabel(
                                forOutputSeconds: job.outputDuration * (1 - job.overallProgress)
                              )
                            : ""
                    ) {
                        Haptics.tap()
                        withAnimation(.snappy) { engine.removeRender(id: job.id) }
                    }
                }
            }
            .animation(.spring(response: 0.4, dampingFraction: 0.85), value: active)
        }
    }

    // MARK: - Gallery

    private var gallerySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("FINISHED MASTERS")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                Button {
                    Haptics.tap()
                    showImporter = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "folder.badge.plus")
                        Text("Import out/")
                            .font(.caption.weight(.semibold))
                    }
                    .foregroundStyle(Theme.violet)
                }
            }

            if let error = production.importError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.warning)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .fill(Theme.warning.opacity(0.12))
                    )
            }

            if production.renders.isEmpty {
                emptyGallery
            } else {
                LazyVGrid(
                    columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
                    spacing: 12
                ) {
                    ForEach(production.renders) { render in
                        RenderThumbnailCard(render: render) {
                            Haptics.tap()
                            sheet = .render(render)
                        }
                    }
                }
            }
        }
    }

    private var emptyGallery: some View {
        VStack(spacing: 10) {
            Image(systemName: "film.stack")
                .font(.title)
                .foregroundStyle(Theme.violet)
            Text("No masters imported yet")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Text("Run the pipeline, then pick its out/ folder. Intégrav reads manifest.json and shows the thumbnail it generated.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .padding(.horizontal, 16)
        .integravCard()
    }
}

// MARK: - Active render card

/// A queued job with its stage tracker and a live completion estimate.
struct ActiveRenderCard: View {
    let job: RenderJob
    let estimate: String
    let onCancel: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(job.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(2)
                    // Scene count and length come from the machine that reads
                    // the project. Until it reports, the card says what it knows
                    // and nothing more.
                    Text(job.sceneCount > 0
                         ? "\(job.sceneCount) scenes · \(job.durationLabel) · \(job.formatLabel)"
                         : "\(job.formatLabel) · length reported by the machine")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .monospacedDigit()
                }
                Spacer(minLength: 0)
                Button(action: onCancel) {
                    Image(systemName: "xmark")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Cancel render")
            }

            GlowBar(progress: job.overallProgress)

            HStack {
                Label(job.statusLabel, systemImage: job.stage.symbol)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.magenta)
                Spacer()
                if !estimate.isEmpty {
                    Text("~\(estimate) left")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .monospacedDigit()
                }
                Text("\(Int(job.overallProgress * 100))%")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.magenta)
                    .monospacedDigit()
                    .contentTransition(.numericText())
            }
        }
        .padding(14)
        .integravCard(highlight: true)
    }
}

// MARK: - Gallery tile

/// One finished master: the pipeline's own thumbnail with its stats overlaid.
struct RenderThumbnailCard: View {
    @Environment(ProductionStore.self) private var production
    let render: ImportedRender
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                Color(Theme.surfaceHigh)
                    .frame(height: 96)
                    .overlay {
                        if let image = production.thumbnailImage(for: render) {
                            Image(uiImage: image)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .allowsHitTesting(false)
                        } else {
                            Image(systemName: "film")
                                .font(.title2)
                                .foregroundStyle(Theme.textSecondary)
                                .allowsHitTesting(false)
                        }
                    }
                    .clipped()
                    .overlay(alignment: .bottomTrailing) {
                        Text(render.manifest.durationLabel)
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Capsule().fill(.black.opacity(0.65)))
                            .padding(6)
                    }
                    .overlay(alignment: .topLeading) {
                        if render.publishState == .published {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.caption)
                                .foregroundStyle(Theme.success)
                                .padding(6)
                        }
                    }

                VStack(alignment: .leading, spacing: 3) {
                    Text(render.manifest.output)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    Text("\(render.manifest.formatLabel) · \(render.manifest.sizeLabel)")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(10)
            }
            .background(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .fill(Theme.surface)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .strokeBorder(Theme.border.opacity(0.55), lineWidth: 1)
            )
        }
        .buttonStyle(PressableButtonStyle())
        .accessibilityLabel("\(render.manifest.output), \(render.manifest.durationLabel)")
    }
}

// MARK: - Detail

/// Full manifest read-out for one master, with one-click publishing.
struct RenderDetailSheet: View {
    @Environment(ProductionStore.self) private var production
    @Environment(\.dismiss) private var dismiss

    let render: ImportedRender

    @State private var isPlaying: Bool = false

    /// A film rendered on this device is a file this device can open. One
    /// imported from a computer is only a manifest, so it cannot offer play.
    private var playableURL: URL? {
        guard LocalRenderer.exists(current.manifest.output) else { return nil }
        return LocalRenderer.directory.appendingPathComponent(current.manifest.output)
    }

    /// Re-read from the store so publish state changes are reflected live.
    private var current: ImportedRender {
        production.renders.first { $0.id == render.id } ?? render
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 18) {
                        posterCard
                        statsGrid
                        publishCard
                        scenesCard
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 32)
                }
            }
            .fullScreenCover(isPresented: $isPlaying) {
                if let playableURL {
                    FilmPlayerView(url: playableURL, title: current.manifest.output)
                }
            }
            .navigationTitle(current.manifest.output)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .destructiveAction) {
                    Button(role: .destructive) {
                        Haptics.tap()
                        production.remove(current)
                        dismiss()
                    } label: {
                        Image(systemName: "trash")
                            .foregroundStyle(Theme.warning)
                    }
                }
            }
        }
    }

    private var posterCard: some View {
        Color(Theme.surfaceHigh)
            .frame(height: 190)
            .overlay {
                if let image = production.thumbnailImage(for: current) {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .allowsHitTesting(false)
                } else {
                    Image(systemName: "film")
                        .font(.largeTitle)
                        .foregroundStyle(Theme.textSecondary)
                        .allowsHitTesting(false)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous))
            .overlay(alignment: .bottomTrailing) {
                if playableURL != nil {
                    Button {
                        Haptics.tap()
                        isPlaying = true
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "play.fill")
                            Text("Watch")
                                .font(.caption.weight(.bold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .frame(height: 40)
                        .background(.ultraThinMaterial, in: .capsule)
                    }
                    .buttonStyle(PressableButtonStyle())
                    .padding(12)
                }
            }
    }

    private var statsGrid: some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
            spacing: 10
        ) {
            stat("Duration", current.manifest.durationLabel)
            stat("Format", current.manifest.formatLabel)
            stat("Size", current.manifest.sizeLabel)
            stat("Codec", current.manifest.codec)
            stat("Render time", ProductionStore.durationLabel(current.manifest.renderSeconds))
            stat("Speed", current.manifest.speedLabel)
        }
    }

    private func stat(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .bold))
                .kerning(0.8)
                .foregroundStyle(Theme.textSecondary)
            Text(value)
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.textPrimary)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .integravCard()
    }

    private var publishCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("PUBLISH")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            switch current.publishState {
            case .published:
                HStack(spacing: 10) {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(Theme.success)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Authorised for \(production.channel?.title ?? "your channel")")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.textPrimary)
                        Text("The render host uploads the file with this grant.")
                            .font(.caption2)
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer(minLength: 0)
                }
                Button("Undo") {
                    Haptics.tap()
                    production.resetPublishState(for: current)
                }
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)

            case .publishing:
                HStack(spacing: 10) {
                    ProgressView().tint(Theme.magenta)
                    Text("Authorising with YouTube…")
                        .font(.subheadline)
                        .foregroundStyle(Theme.textPrimary)
                    Spacer(minLength: 0)
                }

            case .notPublished, .failed:
                Button {
                    Haptics.fire()
                    Task { await production.publish(current) }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "icloud.and.arrow.up.fill")
                        Text(production.isConnected ? "Publish to YouTube" : "Connect a channel first")
                            .font(.subheadline.weight(.bold))
                    }
                    .foregroundStyle(production.isConnected ? Theme.canvas : Theme.textSecondary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(
                        Capsule().fill(production.isConnected
                                       ? AnyShapeStyle(Theme.accentGradient)
                                       : AnyShapeStyle(Theme.surfaceHigh))
                    )
                }
                .buttonStyle(PressableButtonStyle())
                .disabled(!production.isConnected)

                if current.publishState == .failed, let error = production.connectionError {
                    Text(error)
                        .font(.caption2)
                        .foregroundStyle(Theme.warning)
                }
            }
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    private var scenesCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("SCENES · \(current.manifest.scenes.count)")
                .font(.caption.weight(.bold))
                .kerning(1.2)
                .foregroundStyle(Theme.textSecondary)

            ForEach(current.manifest.scenes) { scene in
                HStack(spacing: 10) {
                    Text(scene.id)
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundStyle(Theme.magenta)
                        .frame(width: 62, alignment: .leading)
                        .lineLimit(1)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(scene.file)
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(Theme.textPrimary)
                            .lineLimit(1)
                        Text("\(scene.start) → \(scene.end)")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer(minLength: 0)
                    Text(scene.transition)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(scene.transition == "cut" ? Theme.textSecondary : Theme.success)
                }
                .padding(.vertical, 4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }
}

// MARK: - Player

/// Full-screen playback of a film this device rendered.
struct FilmPlayerView: View {
    @Environment(\.dismiss) private var dismiss

    let url: URL
    let title: String

    @State private var player: AVPlayer?

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            if let player {
                VideoPlayer(player: player)
                    .ignoresSafeArea()
            }
        }
        .overlay(alignment: .topTrailing) {
            Button {
                Haptics.tap()
                player?.pause()
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(.ultraThinMaterial, in: .circle)
            }
            .buttonStyle(PressableButtonStyle())
            .padding(.trailing, 16)
            .padding(.top, 8)
            .accessibilityLabel("Close player")
        }
        .task {
            let created = AVPlayer(url: url)
            player = created
            created.play()
        }
        .onDisappear {
            player?.pause()
            player = nil
        }
    }
}
