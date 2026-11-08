import SwiftUI

/// Full-body mimic — the twin copies how you move, not just how you look.
///
/// Vision tracks fifteen joints from the live camera, the figure on the right
/// mirrors them, and a take can be recorded and replayed. Everything runs on
/// device and nothing recorded here is ever uploaded.
struct MimicStudioView: View {
    @Environment(MimicStore.self) private var mimic
    @Environment(AvatarStore.self) private var avatar

    @State private var showsSkeletonOverlay: Bool = true

    var body: some View {
        @Bindable var mimic = mimic

        ZStack {
            NeuralBackground(intensity: 0.7)

            ScrollView {
                VStack(spacing: 16) {
                    stageCard
                    statusCard
                    readoutGrid
                    controlsCard
                    recordCard
                    takesSection
                    privacyNote
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
                .padding(.bottom, 32)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("Full-body mimic")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .task { await mimic.start() }
        .onDisappear { mimic.stop() }
    }

    // MARK: - Stage

    /// Camera on the left, the twin figure on the right, both the same height so
    /// the mimicry is judged side by side rather than from memory.
    private var stageCard: some View {
        HStack(spacing: 12) {
            cameraPane
            figurePane
        }
        .frame(height: 300)
    }

    private var cameraPane: some View {
        Color(Theme.surfaceHigh)
            .frame(maxWidth: .infinity)
            .overlay {
                Group {
                    switch mimic.state {
                    case .live:
                        ZStack {
                            CameraPreview(session: mimic.session.session)
                            if showsSkeletonOverlay {
                                BodyFigureView(
                                    pose: overlayPose,
                                    sourceAspect: mimic.sourceAspect,
                                    fillsFrame: true,
                                    lineWidth: 4,
                                    showsHead: false,
                                    dims: true
                                )
                            }
                        }
                    case .denied:
                        cameraMessage(
                            symbol: "lock.fill",
                            title: "Camera is off",
                            detail: "Turn it on in Settings › Intégrav to track your body."
                        )
                    case .unavailable:
                        cameraMessage(
                            symbol: "video.slash",
                            title: "No camera",
                            detail: "Attach a camera to track a full body."
                        )
                    case .idle:
                        cameraMessage(
                            symbol: "figure.stand",
                            title: "Starting camera",
                            detail: "Stand back so your feet are in shot."
                        )
                    }
                }
                .allowsHitTesting(false)
            }
            .clipShape(.rect(cornerRadius: Theme.cardCorner))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
            .overlay(alignment: .topLeading) {
                Text("YOU")
                    .font(.system(size: 10, weight: .bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(.black.opacity(0.55)))
                    .padding(8)
            }
    }

    /// The overlay is drawn from the same pose the figure uses, un-mirrored when
    /// the preview itself is already mirrored — otherwise the skeleton lands on
    /// the opposite side of the body it came from.
    private var overlayPose: BodyPoseFrame? {
        guard let pose = mimic.pose else { return nil }
        return mimic.mirrors == mimic.session.previewIsMirrored ? pose : pose.mirroredHorizontally()
    }

    private var figurePane: some View {
        ZStack {
            RadialGradient(
                colors: [Theme.violet.opacity(0.3), .clear],
                center: .center,
                startRadius: 6,
                endRadius: 200
            )

            if let pose = mimic.displayedPose {
                BodyFigureView(
                    pose: pose,
                    sourceAspect: mimic.sourceAspect,
                    fillsFrame: false,
                    lineWidth: 7
                )
                .padding(8)
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "figure.walk.motion")
                        .font(.system(size: 30))
                        .foregroundStyle(Theme.violet)
                    Text("No body tracked")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Step into frame")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .integravCard(highlight: mimic.playingTakeID != nil)
        .overlay(alignment: .topLeading) {
            Text(mimic.playingTakeID != nil ? "REPLAY" : "TWIN")
                .font(.system(size: 10, weight: .bold))
                .kerning(1.2)
                .foregroundStyle(mimic.playingTakeID != nil ? Theme.canvas : Theme.textSecondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    Capsule().fill(mimic.playingTakeID != nil
                                   ? AnyShapeStyle(Theme.accentGradient)
                                   : AnyShapeStyle(Color.black.opacity(0.55)))
                )
                .padding(8)
        }
    }

    private func cameraMessage(symbol: String, title: String, detail: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: symbol)
                .font(.title2)
                .foregroundStyle(Theme.violet)
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Text(detail)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(12)
    }

    // MARK: - Status

    private var statusCard: some View {
        HStack(spacing: 10) {
            if mimic.isTracking { LiveDot() }
            Text(mimic.trackingLine)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(mimic.isTracking ? Theme.textPrimary : Theme.textSecondary)
                .lineLimit(2)
            Spacer(minLength: 0)
            if mimic.isTracking {
                Text("\(mimic.trackedJointCount)/15")
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.magenta)
                    .monospacedDigit()
            }
        }
        .padding(14)
        .integravCard()
        .accessibilityElement(children: .combine)
    }

    private var readoutGrid: some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
            spacing: 10
        ) {
            readout(
                "Arm span",
                mimic.pose?.armSpan.map { String(format: "%.2f×", $0) } ?? "—",
                "shoulder widths"
            )
            readout(
                "Height",
                mimic.pose?.standingHeight.map { String(format: "%.1f×", $0) } ?? "—",
                "nose to ankle"
            )
            readout(
                "Motion",
                mimic.motion > 0 ? String(format: "%.2f", mimic.motion) : "—",
                "widths / second"
            )
            readout(
                "Confidence",
                mimic.pose.map { "\(Int($0.confidence * 100))%" } ?? "—",
                "mean per joint"
            )
        }
    }

    private func readout(_ title: String, _ value: String, _ detail: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title.uppercased())
                .font(.system(size: 9, weight: .bold))
                .kerning(0.8)
                .foregroundStyle(Theme.textSecondary)
            Text(value)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.magenta)
                .monospacedDigit()
                .contentTransition(.numericText())
            Text(detail)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .integravCard()
    }

    // MARK: - Controls

    private var controlsCard: some View {
        @Bindable var mimic = mimic

        return VStack(alignment: .leading, spacing: 14) {
            Toggle(isOn: $mimic.mirrors) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Mirror me")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text(mimic.mirrors
                         ? "Raise your right hand, the twin raises the hand on the same side."
                         : "The twin faces you — your right is its left.")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
            .tint(Theme.magenta)

            Toggle(isOn: $showsSkeletonOverlay) {
                Text("Skeleton on camera")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
            }
            .tint(Theme.violet)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Smoothing")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Spacer()
                    Text(smoothingLabel)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.magenta)
                        .monospacedDigit()
                }
                Slider(value: $mimic.smoothing, in: 0.1...1, step: 0.05)
                    .tint(Theme.magenta)
                Text("Lower is calmer, higher is snappier and shows every twitch Vision reports.")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(16)
        .integravCard()
    }

    private var smoothingLabel: String {
        String(format: "%.0f%%", mimic.smoothing * 100)
    }

    // MARK: - Recording

    private var recordCard: some View {
        VStack(spacing: 10) {
            Button {
                if mimic.isRecording {
                    mimic.finishRecording()
                } else {
                    mimic.startRecording()
                }
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: mimic.isRecording ? "stop.circle.fill" : "record.circle")
                        .font(.title3)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(mimic.isRecording ? "Stop recording" : "Record a movement")
                            .font(.headline)
                        Text(mimic.isRecording
                             ? String(format: "%.1fs captured", mimic.recordingSeconds)
                             : "Up to \(Int(MimicStore.maximumTakeSeconds))s, replayed by your twin")
                            .font(.caption2)
                            .opacity(0.85)
                            .monospacedDigit()
                    }
                    Spacer(minLength: 0)
                }
                .foregroundStyle(mimic.isRecording ? Theme.warning : Theme.canvas)
                .padding(.horizontal, 18)
                .frame(maxWidth: .infinity, minHeight: 58, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .fill(recordButtonFill)
                )
                .glow(Theme.magenta, radius: 14, opacity: canRecordNow && !mimic.isRecording ? 0.5 : 0)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(!canRecordNow && !mimic.isRecording)

            if mimic.isRecording {
                GlowBar(progress: min(1, mimic.recordingSeconds / MimicStore.maximumTakeSeconds))
                Button("Discard") {
                    Haptics.tap()
                    mimic.cancelRecording()
                }
                .font(.caption.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)
            } else if !canRecordNow {
                Text(mimic.state == .live
                     ? "Step into frame to record."
                     : "The camera has to be running to record.")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(14)
        .integravCard(highlight: mimic.isRecording)
    }

    private var canRecordNow: Bool { mimic.canRecord }

    /// Erased to one type: a ternary between a gradient and a colour has no
    /// common concrete `ShapeStyle` for the compiler to settle on.
    private var recordButtonFill: AnyShapeStyle {
        if mimic.isRecording { return AnyShapeStyle(Theme.warning.opacity(0.15)) }
        return canRecordNow ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surfaceHigh)
    }

    // MARK: - Takes

    private var takesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("RECORDED TAKES")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                if !mimic.takes.isEmpty {
                    Text("\(mimic.takes.count)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.violet)
                }
            }

            if mimic.takes.isEmpty {
                VStack(spacing: 6) {
                    Image(systemName: "figure.dance")
                        .font(.title2)
                        .foregroundStyle(Theme.violet)
                    Text("No takes yet")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Record a wave, a walk or a gesture and the twin learns to replay it.")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 26)
                .integravCard()
            } else {
                VStack(spacing: 10) {
                    ForEach(mimic.takes) { take in
                        TakeRow(
                            take: take,
                            isPlaying: mimic.playingTakeID == take.id,
                            onPlay: {
                                Haptics.tap()
                                if mimic.playingTakeID == take.id {
                                    mimic.stopPlayback()
                                } else {
                                    mimic.play(take)
                                }
                            },
                            onDelete: {
                                Haptics.tap()
                                withAnimation(.snappy) { mimic.delete(take) }
                            }
                        )
                    }
                }
            }
        }
    }

    private var privacyNote: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "lock.shield.fill")
                .foregroundStyle(Theme.success)
            Text("Body tracking runs on this device. Takes are stored on the phone only — they are never uploaded, synced or shared, and no video is written at all.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(14)
        .integravCard()
    }
}

/// One recorded take with its own miniature figure.
struct TakeRow: View {
    let take: MimicTake
    let isPlaying: Bool
    let onPlay: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            BodyFigureView(
                pose: take.frames.first,
                fillsFrame: false,
                lineWidth: 3,
                showsHead: false,
                dims: true
            )
            .frame(width: 46, height: 62)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Theme.surfaceHigh)
            )

            VStack(alignment: .leading, spacing: 3) {
                Text(take.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                Text(take.summary)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .monospacedDigit()
                if !take.isFullBody {
                    Text("upper body only")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(Theme.warning)
                }
            }

            Spacer(minLength: 0)

            Button(action: onPlay) {
                Image(systemName: isPlaying ? "stop.fill" : "play.fill")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(isPlaying ? Theme.canvas : Theme.magenta)
                    .frame(width: 44, height: 44)
                    .background(
                        Circle().fill(isPlaying
                                      ? AnyShapeStyle(Theme.accentGradient)
                                      : AnyShapeStyle(Theme.surfaceHigh))
                    )
            }
            .buttonStyle(PressableButtonStyle())
            .accessibilityLabel(isPlaying ? "Stop \(take.name)" : "Replay \(take.name)")

            Button(role: .destructive, action: onDelete) {
                Image(systemName: "trash")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(width: 40, height: 44)
                    .contentShape(.rect)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Delete \(take.name)")
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .integravCard(highlight: isPlaying)
    }
}
