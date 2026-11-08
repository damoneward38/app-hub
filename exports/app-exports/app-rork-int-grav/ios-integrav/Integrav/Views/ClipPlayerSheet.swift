import AVKit
import SwiftUI

/// Plays an imported clip.
///
/// The audio route is opened explicitly before playback starts — without it the
/// session falls back to the category the ring switch silences, which is how a
/// clip ends up playing with no sound at all.
struct ClipPlayerSheet: View {
    let video: SourceVideo

    @Environment(\.dismiss) private var dismiss
    @State private var player: AVPlayer?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                if let player {
                    VideoPlayer(player: player)
                        .ignoresSafeArea(edges: .bottom)
                } else {
                    VStack(spacing: 10) {
                        Image(systemName: "film.stack")
                            .font(.largeTitle)
                            .foregroundStyle(Theme.violet)
                        Text("This clip is no longer on this device")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Theme.textPrimary)
                        Text("The record is still counted in your training hours.")
                            .font(.caption)
                            .foregroundStyle(Theme.textSecondary)
                    }
                }
            }
            .navigationTitle(video.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.textPrimary)
                }
            }
        }
        .onAppear {
            guard let url = video.url else { return }
            AudioRoute.prepareForPlayback()
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
