import PhotosUI
import SwiftUI

/// Capture the user's real face: live viewfinder, alignment guide, and a photo
/// fallback. The pipeline runs the instant a frame lands — landmarks, then rig.
struct FaceCaptureSheet: View {
    @Environment(AvatarStore.self) private var avatar
    @Environment(\.dismiss) private var dismiss

    @State private var camera = CameraController()
    @State private var pickerItem: PhotosPickerItem?
    @State private var isWorking: Bool = false
    @State private var notice: String?

    var body: some View {
        ZStack {
            Theme.canvas.ignoresSafeArea()

            VStack(spacing: 0) {
                header
                viewfinder
                    .padding(.horizontal, 16)
                    .padding(.top, 6)
                pipelineStrip
                    .padding(.horizontal, 16)
                    .padding(.top, 14)
                Spacer(minLength: 8)
                controls
                    .padding(.horizontal, 16)
                    .padding(.bottom, 10)
            }
        }
        .preferredColorScheme(.dark)
        .task { await camera.start() }
        .onDisappear { camera.stop() }
        .onChange(of: pickerItem) { _, item in
            guard let item else { return }
            Task { await loadFromLibrary(item) }
        }
    }

    // MARK: - Chrome

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Capture your face")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Text("On-device · nothing leaves this phone")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
            }
            Spacer()
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Theme.surface))
                    .overlay(Circle().strokeBorder(Theme.border, lineWidth: 1))
            }
            .buttonStyle(PressableButtonStyle())
            .accessibilityLabel("Close capture")
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 10)
    }

    private var viewfinder: some View {
        Color(Theme.surface)
            .frame(height: 380)
            .overlay {
                Group {
                    switch camera.state {
                    case .live:
                        CameraPreview(session: camera.session.session)
                    case .denied:
                        stateBlock(
                            icon: "lock.slash",
                            title: "Camera access is off",
                            body: "Turn it on in Settings, or pick a photo from your library below."
                        )
                    case .unavailable:
                        stateBlock(
                            icon: "camera.badge.ellipsis",
                            title: "No camera attached",
                            body: "Use a library photo — the pipeline is identical from here on."
                        )
                    case .idle:
                        ProgressView().tint(Theme.magenta)
                    }
                }
                .allowsHitTesting(false)
            }
            .overlay {
                if camera.state == .live { alignmentGuide }
            }
            .clipShape(.rect(cornerRadius: Theme.cardCorner))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
            .overlay(alignment: .top) {
                if let notice {
                    Text(notice)
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(Theme.textPrimary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(Theme.warning.opacity(0.9)))
                        .padding(.top, 12)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.35, dampingFraction: 0.8), value: notice)
    }

    private var alignmentGuide: some View {
        ZStack {
            Ellipse()
                .strokeBorder(Theme.magenta.opacity(0.75), style: StrokeStyle(lineWidth: 2, dash: [7, 7]))
                .frame(width: 210, height: 280)
                .glow(Theme.magenta, radius: 14, opacity: 0.5)
            VStack {
                Spacer()
                Text("Fill the oval · face the lens · even light")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Theme.textPrimary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(Capsule().fill(Color.black.opacity(0.55)))
                    .padding(.bottom, 14)
            }
        }
        .allowsHitTesting(false)
    }

    /// Shows the four real stages so the user can see where a capture failed.
    private var pipelineStrip: some View {
        HStack(spacing: 8) {
            stageChip("Frame", active: stageIndex >= 1)
            connector
            stageChip("Landmarks", active: stageIndex >= 2)
            connector
            stageChip("Fit", active: stageIndex >= 3)
            connector
            stageChip("Rig", active: stageIndex >= 4)
        }
    }

    private var connector: some View {
        Rectangle()
            .fill(Theme.border)
            .frame(height: 1)
            .frame(maxWidth: .infinity)
    }

    private var stageIndex: Int {
        switch avatar.stage {
        case .idle: return isWorking ? 1 : 0
        case .measuring: return 2
        case .building: return 3
        case .ready: return 4
        case .failed: return 1
        }
    }

    private func stageChip(_ title: String, active: Bool) -> some View {
        Text(title)
            .font(.caption2.weight(.semibold))
            .monospaced()
            .foregroundStyle(active ? Theme.canvas : Theme.textSecondary)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(
                Capsule().fill(active ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surface))
            )
            .overlay(Capsule().strokeBorder(active ? Color.clear : Theme.border, lineWidth: 1))
    }

    private func stateBlock(icon: String, title: String, body: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.largeTitle)
                .foregroundStyle(Theme.magenta)
            Text(title)
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
            Text(body)
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 28)
        }
    }

    // MARK: - Controls

    private var controls: some View {
        VStack(spacing: 12) {
            Button {
                Task { await shoot() }
            } label: {
                HStack(spacing: 8) {
                    if isWorking {
                        ProgressView().tint(Theme.textPrimary)
                    } else {
                        Image(systemName: "camera.fill")
                    }
                    Text(isWorking ? workingLabel : "Capture")
                        .font(.headline)
                }
                .foregroundStyle(Theme.textPrimary)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Capsule().fill(Theme.accentGradient))
                .glow(Theme.magenta, radius: 20, opacity: camera.state == .live ? 0.6 : 0.2)
                .opacity(camera.state == .live && !isWorking ? 1 : 0.55)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(camera.state != .live || isWorking)

            PhotosPicker(selection: $pickerItem, matching: .images, photoLibrary: .shared()) {
                HStack(spacing: 8) {
                    Image(systemName: "photo.on.rectangle.angled")
                    Text("Use a photo instead").font(.headline)
                }
                .foregroundStyle(Theme.magenta)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(Capsule().fill(Theme.surface))
                .overlay(Capsule().strokeBorder(Theme.magenta.opacity(0.8), lineWidth: 1.4))
            }
            .disabled(isWorking)

            Text("Vision measures 76 landmarks, the head is fitted to your proportions, then your photo is projected onto it.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 12)
        }
    }

    private var workingLabel: String {
        switch avatar.stage {
        case .measuring: return "Finding landmarks…"
        case .building: return "Fitting mesh…"
        default: return "Working…"
        }
    }

    // MARK: - Actions

    private func shoot() async {
        isWorking = true
        defer { isWorking = false }
        guard let data = await camera.capture() else {
            show("Capture failed — try again.")
            return
        }
        await finish(data: data, source: .camera)
    }

    private func loadFromLibrary(_ item: PhotosPickerItem) async {
        isWorking = true
        defer {
            isWorking = false
            pickerItem = nil
        }
        guard let data = try? await item.loadTransferable(type: Data.self) else {
            show("That photo could not be read.")
            return
        }
        await finish(data: data, source: .library)
    }

    private func finish(data: Data, source: FaceCaptureRecord.CaptureSource) async {
        let built = await avatar.ingest(imageData: data, source: source)
        if built {
            Haptics.fire()
            dismiss()
        } else {
            if case .failed(let message) = avatar.stage { show(message) }
            avatar.resetStage()
        }
    }

    private func show(_ message: String) {
        notice = message
        Task {
            try? await Task.sleep(for: .seconds(3))
            if notice == message { notice = nil }
        }
    }
}
