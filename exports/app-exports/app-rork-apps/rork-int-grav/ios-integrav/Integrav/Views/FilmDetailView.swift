import SwiftUI

/// One film, beat by beat.
///
/// This is where a story becomes theirs: every scene carries real direction and
/// a slot for footage of the user performing it. A scene with no footage says
/// so plainly — nothing here pretends a beat has been shot.
struct FilmDetailView: View {
    @Environment(StoryboardStore.self) private var storyboards
    @Environment(ProductionStore.self) private var production
    @Environment(BridgeStore.self) private var bridge

    let boardID: UUID

    @State private var castingScene: StoryScene?
    @State private var showAddScene: Bool = false
    @State private var showConfig: Bool = false
    @State private var showChecklist: Bool = false
    @State private var isDispatching: Bool = false
    @State private var isEditingOrder: Bool = false

    private var board: Storyboard? { storyboards.board(id: boardID) }

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.45)

            if let board {
                ScrollView {
                    VStack(spacing: 16) {
                        header(board)
                        dispatchPanel(board)

                        HStack {
                            Text("SCENES")
                                .font(.caption.weight(.bold))
                                .kerning(1.2)
                                .foregroundStyle(Theme.textSecondary)
                            Spacer()
                            Text("\(board.castCount)/\(board.scenes.count) cast")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(board.isReadyToRender ? Theme.success : Theme.textSecondary)
                        }
                        .padding(.top, 4)

                        ForEach(Array(board.scenes.enumerated()), id: \.element.id) { index, scene in
                            SceneCard(
                                index: index + 1,
                                scene: scene,
                                isLast: index == board.scenes.count - 1
                            ) {
                                castingScene = scene
                            }
                            .contextMenu {
                                Button {
                                    Haptics.tap()
                                    castingScene = scene
                                } label: {
                                    Label(scene.isCast ? "Recast scene" : "Cast yourself", systemImage: "person.crop.rectangle")
                                }
                                if scene.isCast {
                                    Button {
                                        Haptics.tap()
                                        withAnimation(.snappy) {
                                            storyboards.unCast(sceneID: scene.id, of: boardID)
                                        }
                                    } label: {
                                        Label("Remove footage", systemImage: "person.slash")
                                    }
                                }
                                Button(role: .destructive) {
                                    Haptics.tap()
                                    withAnimation(.snappy) {
                                        storyboards.removeScene(scene, from: boardID)
                                    }
                                } label: {
                                    Label("Delete scene", systemImage: "trash")
                                }
                            }
                        }

                        Button {
                            Haptics.tap()
                            showAddScene = true
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "plus")
                                Text("Add a beat")
                            }
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.magenta)
                            .frame(maxWidth: .infinity, minHeight: 50)
                            .background(
                                RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                    .strokeBorder(Theme.magenta.opacity(0.45), style: StrokeStyle(lineWidth: 1.2, dash: [5, 4]))
                            )
                        }
                        .buttonStyle(PressableButtonStyle())
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 6)
                    .padding(.bottom, 40)
                }
                .scrollIndicators(.hidden)
            } else {
                // The film was deleted from under this screen.
                VStack(spacing: 10) {
                    Image(systemName: "film")
                        .font(.system(size: 34))
                        .foregroundStyle(Theme.textSecondary)
                    Text("This film is no longer here.")
                        .font(.subheadline)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .navigationTitle(board?.title ?? "Film")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    if let board {
                        Button {
                            Haptics.tap()
                            showConfig = true
                        } label: {
                            Label("Preview config.yaml", systemImage: "doc.text")
                        }
                        Button {
                            Haptics.tap()
                            showChecklist = true
                        } label: {
                            Label("Footage checklist", systemImage: "checklist")
                        }
                        ShareLink(item: board.shotList()) {
                            Label("Share shot list", systemImage: "square.and.arrow.up")
                        }
                        Divider()
                        Button {
                            Haptics.tap()
                            for scene in board.scenes where scene.isCast {
                                storyboards.unCast(sceneID: scene.id, of: boardID)
                            }
                        } label: {
                            Label("Clear all casting", systemImage: "person.slash")
                        }
                        .disabled(board.castCount == 0)
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .foregroundStyle(Theme.magenta)
                }
            }
        }
        .sheet(item: $castingScene) { scene in
            SceneCastingSheet(boardID: boardID, scene: scene)
        }
        .sheet(isPresented: $showAddScene) {
            AddBeatSheet(boardID: boardID)
        }
        .sheet(isPresented: $showConfig) {
            if let board {
                FilmConfigSheet(
                    yaml: storyboards.configYAML(for: board, settings: production.settings),
                    fileName: "\(PipelineSettings.slug(board.title))_config.yaml"
                )
            }
        }
        .sheet(isPresented: $showChecklist) {
            if let board {
                FootageChecklistSheet(board: board)
            }
        }
    }

    // MARK: - Header

    private func header(_ board: Storyboard) -> some View {
        let tint = Color(hexString: board.genre.tintHex)

        return VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: board.genre.symbol)
                    .font(.title3)
                    .foregroundStyle(tint)
                VStack(alignment: .leading, spacing: 2) {
                    Text(board.title)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(2)
                    Text("\(board.genre.title) · \(board.runtimeLabel) · starring \(board.starring)")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
                Spacer(minLength: 0)
            }

            if !board.logline.isEmpty {
                Text(board.logline)
                    .font(.callout)
                    .italic()
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Label(board.genre.gradeNote, systemImage: "camera.filters")
                .font(.caption2)
                .foregroundStyle(tint)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard(highlight: true)
    }

    // MARK: - Dispatch

    private func dispatchPanel(_ board: Storyboard) -> some View {
        let blocker = storyboards.blocker(for: board, bridgeLinked: bridge.isLinked)

        return VStack(spacing: 12) {
            if let summary = storyboards.lastDispatchSummary {
                Label(summary, systemImage: "checkmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.success)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if let error = storyboards.dispatchError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(Theme.warning)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            } else if let blocker {
                Label(blocker, systemImage: "info.circle")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Button {
                Haptics.tap()
                Task {
                    isDispatching = true
                    await storyboards.dispatch(
                        board: board,
                        settings: production.settings,
                        bridge: bridge
                    )
                    isDispatching = false
                }
            } label: {
                Group {
                    if isDispatching {
                        ProgressView().tint(.white)
                    } else {
                        HStack(spacing: 8) {
                            Image(systemName: "film.stack.fill")
                            Text("Render this film")
                        }
                    }
                }
                .font(.subheadline.weight(.bold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background(
                    blocker == nil
                        ? AnyShapeStyle(Theme.accentGradient)
                        : AnyShapeStyle(Theme.surfaceHigh)
                )
                .clipShape(.rect(cornerRadius: Theme.controlCorner))
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(blocker != nil || isDispatching)
            .opacity(blocker == nil ? 1 : 0.55)
        }
        .padding(14)
        .integravCard()
    }
}

// MARK: - Scene card

/// One beat: the slate, the direction, and who is in it.
private struct SceneCard: View {
    let index: Int
    let scene: StoryScene
    let isLast: Bool
    let cast: () -> Void

    private var tint: Color { Color(hexString: scene.performance.tintHex) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                // Slate number, in the performance's colour.
                Text(String(format: "%02d", index))
                    .font(.system(size: 15, weight: .heavy, design: .monospaced))
                    .foregroundStyle(tint)
                    .frame(width: 38, height: 38)
                    .background(tint.opacity(0.14), in: .rect(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        Text(scene.title)
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(Theme.textPrimary)
                            .lineLimit(1)
                        Spacer(minLength: 0)
                        Text(scene.durationLabel)
                            .font(.caption2.monospacedDigit())
                            .foregroundStyle(Theme.textSecondary)
                    }

                    HStack(spacing: 5) {
                        Image(systemName: scene.performance.symbol)
                            .font(.system(size: 9, weight: .bold))
                        Text(scene.performance.title.uppercased())
                            .font(.system(size: 9, weight: .bold))
                            .kerning(0.7)
                    }
                    .foregroundStyle(tint)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(tint.opacity(0.12), in: .capsule)

                    Text(scene.performance.tagline)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            Text(scene.direction)
                .font(.caption)
                .foregroundStyle(Theme.textPrimary.opacity(0.85))
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 10)

            Text(scene.shotNote)
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
                .padding(.top, 8)

            // The casting strip: who is performing this beat.
            Button {
                Haptics.tap()
                cast()
            } label: {
                HStack(spacing: 10) {
                    if let thumbnail = thumbnailImage {
                        Image(uiImage: thumbnail)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 46, height: 32)
                            .clipShape(.rect(cornerRadius: 6))
                    } else {
                        Image(systemName: scene.isCast ? "person.crop.rectangle.fill" : "person.crop.rectangle.badge.plus")
                            .font(.system(size: 15))
                            .foregroundStyle(scene.isCast ? Theme.success : Theme.magenta)
                            .frame(width: 46, height: 32)
                            .background(Theme.canvas, in: .rect(cornerRadius: 6))
                    }

                    VStack(alignment: .leading, spacing: 1) {
                        Text(scene.isCast ? (scene.clipName ?? "Cast") : "Not shot yet")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(scene.isCast ? Theme.textPrimary : Theme.magenta)
                            .lineLimit(1)
                            .truncationMode(.middle)
                        Text(scene.isCast
                             ? "you, from \(Int(scene.startSeconds))s\(scene.isKeyed ? " · keyed" : "")"
                             : "Tap to put yourself in this scene")
                            .font(.caption2)
                            .foregroundStyle(Theme.textSecondary)
                            .lineLimit(1)
                    }
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.right")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Theme.textSecondary)
                }
                .padding(10)
                .background(Theme.canvas, in: .rect(cornerRadius: 10))
                .contentShape(.rect)
            }
            .buttonStyle(PressableButtonStyle())
            .padding(.top, 10)

            if !isLast {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.down")
                        .font(.system(size: 9, weight: .bold))
                    Text(scene.transition.title.uppercased())
                        .font(.system(size: 9, weight: .bold))
                        .kerning(0.8)
                }
                .foregroundStyle(Theme.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.top, 10)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .integravCard(highlight: scene.isCast)
    }

    /// Only shows a frame when the footage is genuinely still on this device.
    private var thumbnailImage: UIImage? {
        guard scene.isCast else { return nil }
        return MediaLibrary.image(named: scene.clipThumbnailName)
    }
}

// MARK: - Add a beat

private struct AddBeatSheet: View {
    @Environment(StoryboardStore.self) private var storyboards
    @Environment(\.dismiss) private var dismiss

    let boardID: UUID

    @State private var title: String = ""
    @State private var performance: ScenePerformance = .romance

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        TextField("Scene title", text: $title)
                            .textFieldStyle(.plain)
                            .font(.headline)
                            .foregroundStyle(Theme.textPrimary)
                            .padding(12)
                            .background(Theme.surface, in: .rect(cornerRadius: 12))

                        Text("HOW IS IT PLAYED?")
                            .font(.caption.weight(.bold))
                            .kerning(1.2)
                            .foregroundStyle(Theme.textSecondary)

                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 108), spacing: 10)], spacing: 10) {
                            ForEach(ScenePerformance.allCases) { option in
                                performanceChip(option)
                            }
                        }

                        directionPreview
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 30)
                }
                .scrollIndicators(.hidden)
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle("Add a beat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Add") {
                        storyboards.addScene(performance, title: title, to: boardID)
                        dismiss()
                    }
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.magenta)
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
    }

    private func performanceChip(_ option: ScenePerformance) -> some View {
        let tint = Color(hexString: option.tintHex)
        let selected = performance == option

        return Button {
            Haptics.tap()
            withAnimation(.snappy) { performance = option }
        } label: {
            VStack(spacing: 5) {
                Image(systemName: option.symbol)
                    .font(.system(size: 16, weight: .semibold))
                Text(option.title)
                    .font(.caption2.weight(.bold))
                    .lineLimit(1)
            }
            .foregroundStyle(selected ? .white : tint)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(selected ? AnyShapeStyle(tint) : AnyShapeStyle(Theme.surface))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(tint.opacity(selected ? 0 : 0.35), lineWidth: 1)
            )
        }
        .buttonStyle(PressableButtonStyle())
    }

    private var directionPreview: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Direction", systemImage: "text.quote")
                .font(.caption.weight(.bold))
                .foregroundStyle(Color(hexString: performance.tintHex))
            Text(performance.direction)
                .font(.caption)
                .foregroundStyle(Theme.textPrimary.opacity(0.9))
                .fixedSize(horizontal: false, vertical: true)
            Divider().overlay(Theme.border)
            Text("\(performance.camera) · \(performance.lens)")
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
            Text(performance.lighting)
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .integravCard()
    }
}

// MARK: - Footage checklist

/// What the render machine needs before this film can be cut.
///
/// The bridge has no upload route by design, so the phone cannot push footage.
/// Naming the files exactly is the difference between a render that works and
/// one that fails five minutes in on someone else's computer.
private struct FootageChecklistSheet: View {
    @Environment(\.dismiss) private var dismiss

    let board: Storyboard

    private var checklist: [FootageRequirement] { board.footageChecklist }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Your phone holds this footage, but the render runs on your computer — and the bridge deliberately has no upload route. Copy these files into the pipeline's raw/ folder under exactly these names.")
                            .font(.caption)
                            .foregroundStyle(Theme.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)

                        ForEach(checklist) { item in
                            VStack(alignment: .leading, spacing: 5) {
                                Text(item.hostFile)
                                    .font(.system(size: 13, weight: .semibold, design: .monospaced))
                                    .foregroundStyle(Theme.magenta)
                                    .textSelection(.enabled)
                                Text("from \(item.sourceName)")
                                    .font(.caption2)
                                    .foregroundStyle(Theme.textSecondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .integravCard()
                        }

                        if checklist.isEmpty {
                            Text("No scenes are cast yet, so there is nothing to copy.")
                                .font(.caption)
                                .foregroundStyle(Theme.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 26)
                                .integravCard()
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 30)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("Footage checklist")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.magenta)
                }
            }
        }
        .presentationDetents([.medium, .large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
    }
}

// MARK: - Config preview

private struct FilmConfigSheet: View {
    @Environment(\.dismiss) private var dismiss

    let yaml: String
    let fileName: String

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()
                ScrollView {
                    Text(yaml)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle("config.yaml")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    ShareLink(item: yaml, preview: SharePreview(fileName)) {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundStyle(Theme.magenta)
                    }
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
    }
}
