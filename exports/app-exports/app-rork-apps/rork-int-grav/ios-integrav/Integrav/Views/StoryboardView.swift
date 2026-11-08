import SwiftUI

/// The film shelf: every story the user is building, and how close each one is
/// to being shot.
struct StoryboardView: View {
    @Environment(StoryboardStore.self) private var storyboards
    @Environment(TwinStore.self) private var twin

    /// Pushes a film onto the Cinema navigation stack.
    var openFilm: (UUID) -> Void

    @State private var showNewFilm: Bool = false

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.4)

            ScrollView {
                VStack(spacing: 16) {
                    if storyboards.hasBoards {
                        summary
                    }

                    Button {
                        Haptics.tap()
                        showNewFilm = true
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: "plus.circle.fill")
                                .font(.headline)
                            Text("Start a film")
                                .font(.headline)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 54)
                        .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
                        .glow(Theme.magenta, radius: 16, opacity: 0.45)
                    }
                    .buttonStyle(PressableButtonStyle())

                    if storyboards.hasBoards {
                        ForEach(storyboards.boards) { board in
                            FilmCard(board: board) { openFilm(board.id) }
                                .contextMenu {
                                    Button {
                                        Haptics.tap()
                                        let copy = storyboards.duplicate(board)
                                        openFilm(copy.id)
                                    } label: {
                                        Label("Duplicate", systemImage: "doc.on.doc")
                                    }
                                    ShareLink(item: board.shotList()) {
                                        Label("Share shot list", systemImage: "square.and.arrow.up")
                                    }
                                    Button(role: .destructive) {
                                        Haptics.tap()
                                        withAnimation(.snappy) { storyboards.remove(board) }
                                    } label: {
                                        Label("Delete film", systemImage: "trash")
                                    }
                                }
                        }
                    } else {
                        emptyState
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
                .padding(.bottom, 36)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Films")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .sheet(isPresented: $showNewFilm) {
            NewFilmSheet { board in
                showNewFilm = false
                openFilm(board.id)
            }
        }
        .onAppear {
            // Footage deleted from the vault must not leave scenes claiming a
            // performer they no longer have.
            storyboards.forgetMissingFootage()
        }
    }

    private var summary: some View {
        HStack(spacing: 10) {
            StatTile(value: "\(storyboards.boards.count)", label: "FILMS", tint: Theme.magenta)
            StatTile(
                value: "\(storyboards.totalCastScenes)/\(storyboards.totalScenes)",
                label: "SCENES CAST",
                tint: Theme.violet
            )
            StatTile(value: storyboards.totalRuntimeLabel, label: "RUNTIME", tint: Theme.success)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "film.stack")
                .font(.system(size: 42))
                .foregroundStyle(Theme.magenta.opacity(0.7))
            Text("No films yet")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
            Text("Pick a story, cast yourself in every scene, and send the whole thing to your render machine as one cut.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 34)
        .padding(.horizontal, 22)
        .integravCard()
    }
}

/// One film on the shelf.
private struct FilmCard: View {
    let board: Storyboard
    let open: () -> Void

    private var tint: Color { Color(hexString: board.genre.tintHex) }

    var body: some View {
        Button {
            Haptics.tap()
            open()
        } label: {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 10) {
                    Image(systemName: board.genre.symbol)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(tint)
                        .frame(width: 34, height: 34)
                        .background(tint.opacity(0.14), in: .circle)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(board.title)
                            .font(.headline)
                            .foregroundStyle(Theme.textPrimary)
                            .lineLimit(1)
                        Text("\(board.genre.title) · \(board.scenes.count) scenes · \(board.runtimeLabel)")
                            .font(.caption2)
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Spacer(minLength: 0)

                    if board.isReadyToRender {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(Theme.success)
                    }
                }

                if !board.logline.isEmpty {
                    Text(board.logline)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }

                // The strip: one cell per scene, filled when that beat has been
                // shot. It reads as a film strip and as a progress bar at once.
                HStack(spacing: 3) {
                    ForEach(board.scenes) { scene in
                        RoundedRectangle(cornerRadius: 2, style: .continuous)
                            .fill(
                                scene.isCast
                                    ? AnyShapeStyle(Color(hexString: scene.performance.tintHex))
                                    : AnyShapeStyle(Theme.surfaceHigh)
                            )
                            .frame(height: 8)
                    }
                    if board.scenes.isEmpty {
                        RoundedRectangle(cornerRadius: 2, style: .continuous)
                            .fill(Theme.surfaceHigh)
                            .frame(height: 8)
                    }
                }

                HStack(spacing: 6) {
                    Text(board.isReadyToRender
                         ? "Ready to render"
                         : "\(board.castCount) of \(board.scenes.count) scenes cast")
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(board.isReadyToRender ? Theme.success : Theme.textSecondary)
                    Spacer(minLength: 0)
                    Text("starring \(board.starring)")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .integravCard(highlight: board.isReadyToRender)
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }
}

/// Picks a story shape to start from.
private struct NewFilmSheet: View {
    @Environment(StoryboardStore.self) private var storyboards
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss

    let created: (Storyboard) -> Void

    @State private var customTitle: String = ""
    @State private var customGenre: StoryGenre = .drama

    private var starring: String {
        auth.user?.displayName ?? "You"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("PICK A STORY")
                            .font(.caption.weight(.bold))
                            .kerning(1.2)
                            .foregroundStyle(Theme.textSecondary)

                        ForEach(StoryTemplate.allCases) { template in
                            templateCard(template)
                        }

                        Text("OR START EMPTY")
                            .font(.caption.weight(.bold))
                            .kerning(1.2)
                            .foregroundStyle(Theme.textSecondary)
                            .padding(.top, 6)

                        blankCard
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 36)
                }
                .scrollIndicators(.hidden)
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle("New film")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
    }

    private func templateCard(_ template: StoryTemplate) -> some View {
        let tint = Color(hexString: template.genre.tintHex)

        return Button {
            Haptics.tap()
            created(storyboards.create(from: template, starring: starring))
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) {
                    Image(systemName: template.genre.symbol)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(tint)
                    Text(template.title)
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)
                    Spacer(minLength: 0)
                    Text(template.genre.title.uppercased())
                        .font(.system(size: 9, weight: .bold))
                        .kerning(0.8)
                        .foregroundStyle(tint)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(tint.opacity(0.14), in: .capsule)
                }

                Text(template.logline)
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                // The beats, so the shape of the film is visible before it is
                // created rather than after.
                HStack(spacing: 5) {
                    ForEach(Array(template.beats.enumerated()), id: \.offset) { _, beat in
                        HStack(spacing: 3) {
                            Image(systemName: beat.1.symbol)
                                .font(.system(size: 8, weight: .bold))
                            Text(beat.1.title)
                                .font(.system(size: 9, weight: .semibold))
                        }
                        .foregroundStyle(Color(hexString: beat.1.tintHex))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 4)
                        .background(Theme.surfaceHigh, in: .rect(cornerRadius: 6))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .fixedSize(horizontal: false, vertical: true)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    private var blankCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            TextField("Film title", text: $customTitle)
                .textFieldStyle(.plain)
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
                .padding(12)
                .background(Theme.canvas, in: .rect(cornerRadius: 12))

            Picker("Genre", selection: $customGenre) {
                ForEach(StoryGenre.allCases) { genre in
                    Text(genre.title).tag(genre)
                }
            }
            .pickerStyle(.segmented)

            Button {
                Haptics.tap()
                created(storyboards.createBlank(
                    title: customTitle,
                    genre: customGenre,
                    starring: starring
                ))
            } label: {
                Text("Create empty film")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(Theme.accentGradient, in: .rect(cornerRadius: Theme.controlCorner))
            }
            .buttonStyle(PressableButtonStyle())
        }
        .padding(14)
        .integravCard()
    }
}
