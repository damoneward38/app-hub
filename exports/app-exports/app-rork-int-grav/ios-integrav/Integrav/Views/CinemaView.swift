import SwiftUI

/// Screens pushed from Cinema.
enum CinemaDestination: Hashable {
    case studio
    case machine
    case films
    case film(UUID)
}

/// Cinema — the film-grade page.
///
/// Chroma key with a real keyed preview, delivery format, encode quality, the
/// stage list and publishing all live here as a page you can scroll, instead of
/// a settings sheet buried two taps inside the render studio.
struct CinemaView: View {
    @Environment(ProductionStore.self) private var production
    @Environment(EngineStore.self) private var engine
    @Environment(BridgeStore.self) private var bridge
    @Environment(StoryboardStore.self) private var storyboards

    @State private var path: [CinemaDestination] = []

    private var projectTitle: String {
        engine.activeRenders.first?.title ?? "Intégrav render"
    }

    var body: some View {
        @Bindable var production = production

        NavigationStack(path: $path) {
            ZStack {
                NeuralBackground(intensity: 0.5)

                ScrollView {
                    VStack(spacing: 18) {
                        marquee
                        filmsBanner
                        shortcutRow
                        PipelineControlsView(projectTitle: projectTitle, showsSummary: false)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 4)
                    .padding(.bottom, 32)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("Cinema")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Reset") {
                        Haptics.tap()
                        withAnimation(.snappy) { production.settings = .default }
                    }
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
                }
            }
            .navigationDestination(for: CinemaDestination.self) { destination in
                switch destination {
                case .studio: RenderStudioView()
                case .machine: MachineView()
                case .films: StoryboardView { path.append(.film($0)) }
                case .film(let id): FilmDetailView(boardID: id)
                }
            }
        }
    }

    /// The way into the storyboards — given its own banner rather than a
    /// shortcut tile, because casting yourself into a film is the reason most
    /// people open this tab at all.
    private var filmsBanner: some View {
        Button {
            Haptics.tap()
            path.append(.films)
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Theme.magenta.opacity(0.16))
                        .frame(width: 46, height: 46)
                    Image(systemName: "person.crop.rectangle.stack.fill")
                        .font(.system(size: 19, weight: .semibold))
                        .foregroundStyle(Theme.magenta)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text("Star in a film")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Text(filmsDetail)
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .integravCard(highlight: true)
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    private var filmsDetail: String {
        if storyboards.boards.isEmpty {
            return "Pick a story, cast yourself in every scene, render the cut"
        }
        let ready = storyboards.readyBoards.count
        let base = "\(storyboards.boards.count) film\(storyboards.boards.count == 1 ? "" : "s") · \(storyboards.totalCastScenes)/\(storyboards.totalScenes) scenes cast"
        return ready > 0 ? base + " · \(ready) ready" : base
    }

    // MARK: - Marquee

    /// The headline numbers for the current look, so the page opens with what
    /// the pipeline will actually deliver rather than a wall of controls.
    private var marquee: some View {
        VStack(spacing: 14) {
            HStack(spacing: 10) {
                Image(systemName: "film.stack.fill")
                    .font(.title3)
                    .foregroundStyle(Theme.magenta)
                VStack(alignment: .leading, spacing: 2) {
                    Text(production.settings.format.title)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text(production.settings.summary)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                }
                Spacer(minLength: 0)
            }

            HStack(spacing: 10) {
                marqueeFigure(
                    value: production.settings.greenScreen.isEnabled ? "ON" : "OFF",
                    label: "chroma key",
                    tint: production.settings.greenScreen.isEnabled ? Theme.success : Theme.textSecondary
                )
                marqueeFigure(
                    value: String(format: "%.1f GB", production.settings.estimatedGigabytesPerHour),
                    label: "per hour",
                    tint: Theme.violet
                )
                marqueeFigure(
                    value: production.estimateLabel(forOutputSeconds: 600),
                    label: "per 10 min",
                    tint: Theme.magenta
                )
            }
        }
        .padding(16)
        .integravCard(highlight: true)
    }

    private func marqueeFigure(value: String, label: String, tint: Color) -> some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 17, weight: .bold, design: .rounded))
                .foregroundStyle(tint)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Theme.surfaceHigh)
        )
    }

    private var shortcutRow: some View {
        HStack(spacing: 10) {
            shortcut(
                title: "Render studio",
                detail: production.renders.isEmpty
                    ? "Queue & masters"
                    : "\(production.renders.count) master\(production.renders.count == 1 ? "" : "s")",
                symbol: "square.stack.3d.down.right.fill",
                tint: Theme.violet
            ) { path.append(.studio) }

            shortcut(
                title: "Machine",
                detail: bridge.isLinked ? bridge.hostLabel : "Not linked",
                symbol: bridge.isLinked ? "checkmark.seal.fill" : "desktopcomputer",
                tint: bridge.isLinked ? Theme.success : Theme.magenta
            ) { path.append(.machine) }
        }
    }

    private func shortcut(
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
            HStack(spacing: 10) {
                Image(systemName: symbol)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(tint)
                VStack(alignment: .leading, spacing: 1) {
                    Text(title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    Text(detail)
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }
                Spacer(minLength: 0)
            }
            .padding(12)
            .frame(maxWidth: .infinity, minHeight: 62)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }
}
