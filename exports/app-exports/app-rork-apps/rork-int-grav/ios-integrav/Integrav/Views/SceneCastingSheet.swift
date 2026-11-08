import AVKit
import SwiftUI

/// Puts the user into one beat of a film.
///
/// Casting means pointing a scene at footage of them that is really on this
/// device. Length-only records — clips logged before importing existed — are
/// shown but cannot be cast: a scene that points at a file which is not there
/// would render as a frozen frame on the host, hours later.
struct SceneCastingSheet: View {
    @Environment(StoryboardStore.self) private var storyboards
    @Environment(TwinStore.self) private var twin
    @Environment(\.dismiss) private var dismiss

    let boardID: UUID
    let scene: StoryScene

    @State private var selection: SourceVideo?
    @State private var startSeconds: Double = 0
    @State private var sceneSeconds: Double = 0
    @State private var isKeyed: Bool = false
    @State private var direction: String = ""
    @State private var transition: SceneTransition = .cut
    @State private var player: AVPlayer?

    /// Only footage that is genuinely on disk can carry a performance.
    private var castable: [SourceVideo] { twin.videos.filter(\.isPlayable) }
    private var unavailable: [SourceVideo] { twin.videos.filter { !$0.isPlayable } }

    private var tint: Color { Color(hexString: scene.performance.tintHex) }

    /// Longest this scene can run given where it starts in the take.
    private var maximumSeconds: Double {
        guard let selection else { return 600 }
        let available = Double(selection.seconds ?? (selection.minutes * 60))
        return max(1, available - startSeconds)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        directionCard

                        if castable.isEmpty {
                            noFootageCard
                        } else {
                            Text("YOUR TAKES")
                                .font(.caption.weight(.bold))
                                .kerning(1.2)
                                .foregroundStyle(Theme.textSecondary)

                            ForEach(castable) { clip in
                                takeRow(clip)
                            }

                            if selection != nil {
                                trimCard
                                performanceOptions
                            }
                        }

                        if !unavailable.isEmpty {
                            unavailableNote
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 36)
                }
                .scrollIndicators(.hidden)
            }
            .navigationTitle(scene.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cast") { commit() }
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(selection == nil ? Theme.textSecondary.opacity(0.5) : Theme.magenta)
                        .disabled(selection == nil)
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
        .onAppear(perform: restoreExistingCasting)
        .onDisappear { player?.pause() }
    }

    // MARK: - Direction

    private var directionCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: scene.performance.symbol)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(tint)
                Text(scene.performance.title.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .kerning(1)
                    .foregroundStyle(tint)
                Spacer(minLength: 0)
            }

            Text(scene.performance.tagline)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)

            Text(direction.isEmpty ? scene.direction : direction)
                .font(.caption)
                .foregroundStyle(Theme.textPrimary.opacity(0.85))
                .fixedSize(horizontal: false, vertical: true)

            Divider().overlay(Theme.border)

            Text("\(scene.performance.camera) · \(scene.performance.lens)")
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
            Text(scene.performance.lighting)
                .font(.system(size: 10, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .integravCard(highlight: true)
    }

    // MARK: - Takes

    private func takeRow(_ clip: SourceVideo) -> some View {
        let selected = selection?.id == clip.id

        return Button {
            Haptics.tap()
            withAnimation(.snappy) {
                selection = clip
                startSeconds = 0
                sceneSeconds = min(Double(scene.seconds), Double(clip.seconds ?? (clip.minutes * 60)))
            }
            loadPlayer(for: clip)
        } label: {
            HStack(spacing: 10) {
                if let thumbnail = MediaLibrary.image(named: clip.thumbnailName) {
                    Image(uiImage: thumbnail)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 62, height: 42)
                        .clipShape(.rect(cornerRadius: 7))
                } else {
                    Image(systemName: "film")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(width: 62, height: 42)
                        .background(Theme.surfaceHigh, in: .rect(cornerRadius: 7))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(clip.name)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                    Text(clip.durationLabel)
                        .font(.caption2.monospacedDigit())
                        .foregroundStyle(Theme.textSecondary)
                }

                Spacer(minLength: 0)

                Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 18))
                    .foregroundStyle(selected ? tint : Theme.textSecondary.opacity(0.5))
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(selected ? tint.opacity(0.10) : Theme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(selected ? tint.opacity(0.5) : Color.clear, lineWidth: 1.2)
            )
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Trim

    private var trimCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let player {
                VideoPlayer(player: player)
                    .frame(height: 190)
                    .clipShape(.rect(cornerRadius: 12))
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("STARTS AT")
                        .font(.system(size: 10, weight: .bold))
                        .kerning(1)
                        .foregroundStyle(Theme.textSecondary)
                    Spacer()
                    Text(timecode(startSeconds))
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundStyle(tint)
                }
                Slider(value: $startSeconds, in: 0...max(1, takeLength - 1), step: 1)
                    .tint(tint)
                    .onChange(of: startSeconds) { _, value in
                        player?.seek(to: CMTime(seconds: value, preferredTimescale: 600))
                        if sceneSeconds > maximumSeconds { sceneSeconds = maximumSeconds }
                    }
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("SCENE RUNS")
                        .font(.system(size: 10, weight: .bold))
                        .kerning(1)
                        .foregroundStyle(Theme.textSecondary)
                    Spacer()
                    Text(timecode(sceneSeconds))
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundStyle(tint)
                }
                Slider(value: $sceneSeconds, in: 1...max(2, maximumSeconds), step: 1)
                    .tint(tint)
            }

            Text("Cuts \(timecode(startSeconds)) → \(timecode(startSeconds + sceneSeconds)) out of this take.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
        .padding(14)
        .integravCard()
    }

    private var takeLength: Double {
        guard let selection else { return 60 }
        return Double(selection.seconds ?? (selection.minutes * 60))
    }

    // MARK: - Options

    private var performanceOptions: some View {
        VStack(alignment: .leading, spacing: 14) {
            Toggle(isOn: $isKeyed) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Shot on a green screen")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Keys this scene against the backdrop set in Cinema")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
            .tint(tint)

            VStack(alignment: .leading, spacing: 6) {
                Text("CUTS TO THE NEXT SCENE WITH")
                    .font(.system(size: 10, weight: .bold))
                    .kerning(1)
                    .foregroundStyle(Theme.textSecondary)
                Picker("Transition", selection: $transition) {
                    ForEach(SceneTransition.allCases) { option in
                        Text(option.title).tag(option)
                    }
                }
                .pickerStyle(.menu)
                .tint(tint)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("YOUR DIRECTION NOTE")
                    .font(.system(size: 10, weight: .bold))
                    .kerning(1)
                    .foregroundStyle(Theme.textSecondary)
                TextField("How you played it", text: $direction, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.caption)
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(2...5)
                    .padding(10)
                    .background(Theme.canvas, in: .rect(cornerRadius: 10))
            }
        }
        .padding(14)
        .integravCard()
    }

    // MARK: - Empty states

    private var noFootageCard: some View {
        VStack(spacing: 10) {
            Image(systemName: "video.badge.plus")
                .font(.system(size: 32))
                .foregroundStyle(Theme.magenta.opacity(0.8))
            Text("No footage of you yet")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Theme.textPrimary)
            Text("Import a clip on the Twin tab — a take of you performing this beat — and it will appear here ready to cast.")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 28)
        .padding(.horizontal, 20)
        .integravCard()
    }

    private var unavailableNote: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("\(unavailable.count) clip\(unavailable.count == 1 ? "" : "s") can't be cast", systemImage: "exclamationmark.triangle")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.warning)
            Text("These are length-only records with no file on this device, so there is nothing to cut into a scene.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Theme.warning.opacity(0.10), in: .rect(cornerRadius: Theme.controlCorner))
    }

    // MARK: - Behaviour

    /// Reopens the sheet on whatever this scene is already cast with.
    private func restoreExistingCasting() {
        direction = scene.direction
        transition = scene.transition
        isKeyed = scene.isKeyed
        sceneSeconds = Double(scene.seconds)
        startSeconds = scene.startSeconds

        if let existing = castable.first(where: { $0.id == scene.clipID }) {
            selection = existing
            loadPlayer(for: existing)
        }
    }

    private func loadPlayer(for clip: SourceVideo) {
        guard let url = clip.url else {
            player = nil
            return
        }
        AudioRoute.prepareForPlayback()
        let item = AVPlayerItem(url: url)
        let created = AVPlayer(playerItem: item)
        created.seek(to: CMTime(seconds: startSeconds, preferredTimescale: 600))
        player = created
    }

    private func commit() {
        guard let selection else { return }

        var updated = scene
        updated.seconds = max(1, Int(sceneSeconds.rounded()))
        updated.direction = direction.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? scene.performance.direction
            : direction
        updated.transition = transition
        updated.isKeyed = isKeyed
        storyboards.updateScene(updated, in: boardID)

        storyboards.cast(
            selection,
            into: scene.id,
            of: boardID,
            startSeconds: startSeconds
        )
        dismiss()
    }

    private func timecode(_ seconds: Double) -> String {
        let total = max(0, Int(seconds.rounded()))
        return String(format: "%02d:%02d", total / 60, total % 60)
    }
}
