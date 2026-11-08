import AVKit
import PhotosUI
import SwiftUI

/// Screens pushed from the avatar studio.
enum AvatarDestination: Hashable {
    case mimic
    case stage
}

/// Modal destinations in the avatar studio. One enum, one sheet modifier —
/// stacking `sheet(isPresented:)` leaves only the last one working.
enum AvatarSheet: Identifiable {
    case addVideo
    case faceCapture
    case play(SourceVideo)

    var id: String {
        switch self {
        case .addVideo: return "addVideo"
        case .faceCapture: return "faceCapture"
        case .play(let video): return "play-\(video.id.uuidString)"
        }
    }
}

/// Avatar tab — sculpt the twin: luminous preview, training ring, source
/// footage, and the entry point into the live conversation.
struct AvatarStudioView: View {
    @Environment(TwinStore.self) private var twin
    @Environment(AvatarStore.self) private var avatar
    @Environment(MimicStore.self) private var mimic
    @Environment(StageStore.self) private var stage

    @State private var sheet: AvatarSheet?
    @State private var showTwinPreview: Bool = false
    @State private var photoItem: PhotosPickerItem?
    @State private var isUploadingPhoto: Bool = false
    @State private var uploadError: String?

    var body: some View {
        NavigationStack {
            ZStack {
                NeuralBackground(intensity: 0.8)

                ScrollView {
                    VStack(spacing: 18) {
                        portraitPanel
                        stageLink
                        mimicLink
                        if avatar.hasFace { faceCard }
                        trainingPanel
                        sourceSection
                        actionButtons
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 30)
                }
                .scrollIndicators(.hidden)
            }
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: AvatarDestination.self) { destination in
                switch destination {
                case .mimic: MimicStudioView()
                case .stage: StageView()
                }
            }
        }
        // A full-screen cover and a sheet can coexist; two sheets cannot.
        .fullScreenCover(isPresented: $showTwinPreview) {
            TwinPreviewView()
        }
        .sheet(item: $sheet) { destination in
            switch destination {
            case .addVideo: AddVideoSheet()
            case .faceCapture: FaceCaptureSheet()
            case .play(let video): ClipPlayerSheet(video: video)
            }
        }
        .onChange(of: photoItem) { _, item in
            guard let item else { return }
            Task { await uploadPhoto(item) }
        }
    }

    /// Runs a library photo through the same landmark-and-rig pipeline the
    /// camera uses, so an uploaded picture produces a real face model rather
    /// than a decorative portrait.
    private func uploadPhoto(_ item: PhotosPickerItem) async {
        isUploadingPhoto = true
        uploadError = nil
        defer {
            isUploadingPhoto = false
            photoItem = nil
        }

        guard let data = try? await item.loadTransferable(type: Data.self) else {
            uploadError = "That photo couldn't be read."
            return
        }
        let built = await avatar.ingest(imageData: data, source: .library)
        if built {
            Haptics.fire()
        } else {
            if case .failed(let message) = avatar.stage { uploadError = message }
            avatar.resetStage()
        }
    }

    // MARK: - Portrait

    private var portraitPanel: some View {
        ZStack {
            RadialGradient(
                colors: [Theme.violet.opacity(0.35), .clear],
                center: .center,
                startRadius: 10,
                endRadius: 260
            )

            if let mesh = avatar.mesh, let texture = avatar.image {
                // `smile` used to be the constant 0.14 here, which is why every
                // one of the 300 behaviours looked like it did nothing. The
                // whole face now answers to the performance engine.
                AvatarHeadView(
                    mesh: mesh,
                    texture: texture,
                    mouthOpen: max(stage.pose.mouthOpen, twin.speechEnvelope),
                    smile: stage.pose.smile,
                    browRaise: max(stage.pose.browRaise, twin.isThinking ? 0.4 : 0),
                    blink: stage.pose.blink,
                    yaw: stage.pose.yaw,
                    pitch: stage.pose.pitch,
                    roll: stage.pose.roll,
                    isAlive: false
                )
                .frame(height: 268)
            } else {
                TwinOrb(diameter: 168)
            }
        }
        .frame(height: 280)
        .frame(maxWidth: .infinity)
        .integravCard()
        .overlay(alignment: .topLeading) { portraitBadge }
    }

    private var portraitBadge: some View {
        HStack(spacing: 6) {
            Image(systemName: avatar.hasFace ? "cube.transparent.fill" : "sparkles")
                .font(.caption2.weight(.bold))
            Text(avatar.hasFace ? "Your face · rigged" : "Stock likeness")
                .font(.caption2.weight(.semibold))
        }
        .foregroundStyle(avatar.hasFace ? Theme.canvas : Theme.textSecondary)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule().fill(avatar.hasFace
                           ? AnyShapeStyle(Theme.accentGradient)
                           : AnyShapeStyle(Theme.surfaceHigh))
        )
        .padding(12)
        .allowsHitTesting(false)
    }

    // MARK: - Stage

    /// The way to actually see the 300 behaviours move the face above. Without
    /// it the registry is a list you tap and nothing visibly happens.
    private var stageLink: some View {
        NavigationLink(value: AvatarDestination.stage) {
            HStack(spacing: 12) {
                Image(systemName: "theatermasks.fill")
                    .font(.title3)
                    .foregroundStyle(Theme.canvas)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Theme.accentGradient))

                VStack(alignment: .leading, spacing: 2) {
                    Text("Stage")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text(stage.performedCount > 0
                         ? "\(stage.performedCount) performed this session · \(stage.statusLine)"
                         : "Fire any of the 300 behaviours and watch her perform it")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(14)
            .integravCard(highlight: true)
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Mimic

    /// The face is only half a likeness. This is the way into the other half,
    /// and it sits directly under the portrait so it cannot be missed.
    private var mimicLink: some View {
        NavigationLink(value: AvatarDestination.mimic) {
            HStack(spacing: 12) {
                Image(systemName: "figure.walk.motion")
                    .font(.title3)
                    .foregroundStyle(Theme.canvas)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Theme.accentGradient))

                VStack(alignment: .leading, spacing: 2) {
                    Text("Full-body mimic")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                    Text(mimic.takes.isEmpty
                         ? "Track fifteen joints live and teach it how you move"
                         : "\(mimic.takes.count) take\(mimic.takes.count == 1 ? "" : "s") recorded")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(14)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Measured face

    private var faceCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                thumbnailOfCapture
                VStack(alignment: .leading, spacing: 3) {
                    Text("Face model")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    if let record = avatar.record {
                        Text("\(record.source.label) · \(record.vertexCount.formatted(.number.grouping(.automatic))) verts · \(FaceMorph.allCases.count) blend shapes")
                            .font(.caption)
                            .foregroundStyle(Theme.textSecondary)
                            .lineLimit(2)
                    }
                }
                Spacer(minLength: 0)
            }

            if let metrics = avatar.metrics {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 8)], spacing: 8) {
                    ForEach(metrics.readout, id: \.0) { item in
                        VStack(alignment: .leading, spacing: 1) {
                            Text(item.0)
                                .font(.caption2)
                                .foregroundStyle(Theme.textSecondary)
                            Text(item.1)
                                .font(.caption.weight(.semibold))
                                .monospaced()
                                .foregroundStyle(Theme.magenta)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 7)
                        .background(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .fill(Theme.surfaceHigh)
                        )
                    }
                }
            }

            HStack(spacing: 10) {
                Button {
                    Haptics.tap()
                    sheet = .faceCapture
                } label: {
                    Text("Recapture")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.magenta)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Capsule().fill(Theme.surfaceHigh))
                }
                .buttonStyle(PressableButtonStyle())

                Button(role: .destructive) {
                    Haptics.tap()
                    avatar.clearFace()
                } label: {
                    Text("Remove")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Capsule().fill(Theme.surfaceHigh))
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
        .padding(16)
        .integravCard()
    }

    private var thumbnailOfCapture: some View {
        Color(Theme.surfaceHigh)
            .frame(width: 54, height: 54)
            .overlay {
                Group {
                    if let image = avatar.image {
                        Image(uiImage: image)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } else {
                        Image(systemName: "person.fill")
                            .foregroundStyle(Theme.violet)
                    }
                }
                .allowsHitTesting(false)
            }
            .clipShape(.rect(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
    }

    // MARK: - Training

    private var trainingPanel: some View {
        HStack(spacing: 20) {
            ZStack {
                GlowRing(progress: twin.trainedFraction, diameter: 116, lineWidth: 11)
                VStack(spacing: -2) {
                    HStack(alignment: .top, spacing: 1) {
                        Text("\(twin.trainedPercent)")
                            .font(.system(size: 30, weight: .bold, design: .rounded))
                            .foregroundStyle(Theme.magenta)
                            .monospacedDigit()
                        Text("%")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Theme.magenta)
                            .padding(.top, 6)
                    }
                    Text("trained")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(twin.ingestedHours.formatted(.number.grouping(.automatic)))
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.textPrimary)
                        .monospacedDigit()
                        .contentTransition(.numericText())
                    Text("/ \(TwinStore.targetHours.formatted(.number.grouping(.automatic))) hrs")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Theme.textSecondary)
                }
                Text("ingested")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)

                Text(twin.isFullyTrained
                     ? "Fully trained · likeness locked"
                     : "\((TwinStore.targetHours - twin.ingestedHours).formatted(.number.grouping(.automatic))) hrs to full likeness")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(twin.isFullyTrained ? Theme.success : Theme.violet)
            }

            Spacer(minLength: 0)
        }
        .padding(18)
        .integravCard()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(twin.trainedPercent) percent trained, \(twin.ingestedHours) of 3000 hours ingested")
    }

    // MARK: - Source footage

    private var sourceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Source videos")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Text("\(twin.videos.count) video\(twin.videos.count == 1 ? "" : "s")")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.violet)
            }

            if twin.videos.isEmpty {
                VStack(spacing: 6) {
                    Image(systemName: "video.badge.plus")
                        .font(.title2)
                        .foregroundStyle(Theme.violet)
                    Text("No footage yet")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Add clips of yourself to teach the twin your face and voice.")
                        .font(.footnote)
                        .foregroundStyle(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 26)
                .integravCard()
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(twin.videos.enumerated()), id: \.element.id) { index, video in
                        SourceVideoRow(video: video) { sheet = .play($0) }
                        if index < twin.videos.count - 1 {
                            Divider().overlay(Theme.border.opacity(0.6))
                                .padding(.leading, 118)
                        }
                    }
                }
                .integravCard()
            }
        }
    }

    private var actionButtons: some View {
        VStack(spacing: 12) {
            if !avatar.hasFace {
                Button {
                    Haptics.tap()
                    sheet = .faceCapture
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "face.dashed")
                        Text("Capture your face").font(.headline)
                    }
                    .foregroundStyle(Theme.textPrimary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 54)
                    .background(Capsule().fill(Theme.accentGradient))
                    .glow(Theme.magenta, radius: 18, opacity: 0.55)
                }
                .buttonStyle(PressableButtonStyle())
            }

            // Uploading a photo was reachable only from inside the camera
            // sheet, so people with a good photo already on their phone never
            // found it. It belongs on the studio itself.
            PhotosPicker(selection: $photoItem, matching: .images, photoLibrary: .shared()) {
                HStack(spacing: 8) {
                    if isUploadingPhoto {
                        ProgressView().tint(Theme.violet)
                    } else {
                        Image(systemName: "photo.badge.plus")
                    }
                    Text(isUploadingPhoto ? "Measuring photo…" : "Upload a photo")
                        .font(.headline)
                }
                .foregroundStyle(Theme.violet)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(Capsule().fill(Theme.surface.opacity(0.6)))
                .overlay(Capsule().strokeBorder(Theme.violet.opacity(0.8), lineWidth: 1.4))
            }
            .disabled(isUploadingPhoto)

            if let uploadError {
                Text(uploadError)
                    .font(.footnote)
                    .foregroundStyle(Theme.warning)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
            }

            Button {
                sheet = .addVideo
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "plus")
                    Text("Add video").font(.headline)
                }
                .foregroundStyle(avatar.hasFace ? Theme.textPrimary : Theme.magenta)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(
                    Capsule().fill(avatar.hasFace
                                   ? AnyShapeStyle(Theme.accentGradient)
                                   : AnyShapeStyle(Theme.surface.opacity(0.6)))
                )
                .overlay(
                    Capsule().strokeBorder(
                        avatar.hasFace ? Color.clear : Theme.magenta.opacity(0.5),
                        lineWidth: 1.2
                    )
                )
            }
            .buttonStyle(PressableButtonStyle())

            Button {
                showTwinPreview = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "bubble.left.and.text.bubble.right")
                    Text("Talk to twin").font(.headline)
                }
                .foregroundStyle(Theme.magenta)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(Capsule().fill(Theme.surface.opacity(0.6)))
                .overlay(Capsule().strokeBorder(Theme.magenta.opacity(0.8), lineWidth: 1.4))
            }
            .buttonStyle(PressableButtonStyle())
        }
        .padding(.top, 4)
    }
}

/// A row of ingested footage. Imported clips show a frame lifted from the
/// footage itself and play on tap; length-only records say so plainly rather
/// than offering a play button that would do nothing.
struct SourceVideoRow: View {
    @Environment(TwinStore.self) private var twin
    let video: SourceVideo
    let onPlay: (SourceVideo) -> Void

    private var poster: UIImage? { MediaLibrary.image(named: video.thumbnailName) }

    var body: some View {
        HStack(spacing: 14) {
            if video.isPlayable {
                Button {
                    Haptics.tap()
                    onPlay(video)
                } label: {
                    thumbnail
                }
                .buttonStyle(PressableButtonStyle())
                .accessibilityLabel("Play \(video.name)")
            } else {
                thumbnail
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(video.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    Text(video.durationLabel)
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                    if !video.isPlayable {
                        Text("length only")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(Theme.textSecondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Capsule().fill(Theme.surfaceHigh))
                    }
                }
            }

            Spacer(minLength: 4)

            Button(role: .destructive) {
                twin.removeVideo(video)
            } label: {
                Image(systemName: "trash")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(Theme.textSecondary)
                    .frame(width: 44, height: 44)
                    .contentShape(.rect)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Remove \(video.name)")
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 14)
    }

    /// No stock portrait here. Showing the same shipped model photo on every
    /// clip made unrelated footage look like it had been ingested and viewed —
    /// so this is either the clip's own frame, or nothing.
    private var thumbnail: some View {
        Color(Theme.surfaceHigh)
            .frame(width: 92, height: 58)
            .overlay {
                Group {
                    if let poster {
                        Image(uiImage: poster)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } else {
                        Image(systemName: "waveform")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Theme.violet.opacity(0.7))
                    }
                }
                .allowsHitTesting(false)
            }
            .overlay {
                if video.isPlayable {
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.5), radius: 4)
                        .allowsHitTesting(false)
                }
            }
            .overlay(alignment: .bottomTrailing) {
                Text(video.stampLabel)
                    .font(.caption2.weight(.semibold))
                    .monospacedDigit()
                    .foregroundStyle(Theme.textPrimary)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.black.opacity(0.7)))
                    .padding(4)
            }
            .clipShape(.rect(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
    }
}
