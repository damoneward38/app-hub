import AVFoundation
import PhotosUI
import SwiftUI
import UniformTypeIdentifiers

/// A movie chosen from the photo library, staged into a temporary file so the
/// importer can read its duration and lift a poster frame from it.
nonisolated struct PickedMovie: Transferable {
    let url: URL

    nonisolated static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { movie in
            SentTransferredFile(movie.url)
        } importing: { received in
            // The received file is deleted the moment this closure returns, so
            // it has to be copied before anything else touches it.
            let staged = FileManager.default.temporaryDirectory
                .appendingPathComponent("picked-\(UUID().uuidString).\(received.file.pathExtension)")
            try? FileManager.default.removeItem(at: staged)
            try FileManager.default.copyItem(at: received.file, to: staged)
            return PickedMovie(url: staged)
        }
    }
}

/// Sheet for feeding a new source clip into the twin's training set.
///
/// Uploading real footage is the primary path: the file is copied into the app,
/// its true length is read off the asset, and a frame from the clip becomes its
/// thumbnail. Logging a clip by name and length remains available for footage
/// that lives somewhere else.
struct AddVideoSheet: View {
    @Environment(TwinStore.self) private var twin
    @Environment(\.dismiss) private var dismiss

    private enum Mode: String, CaseIterable, Identifiable {
        case upload = "Upload"
        case log = "Log by length"

        var id: String { rawValue }
    }

    @State private var mode: Mode = .upload
    @State private var pickerItem: PhotosPickerItem?
    @State private var isImporting: Bool = false
    @State private var importError: String?
    @State private var name: String = ""
    @State private var minutes: Int = 30
    @State private var kind: ClipKind = .keynote
    @FocusState private var nameFocused: Bool

    private enum ClipKind: String, CaseIterable, Identifiable {
        case keynote = "Keynote"
        case podcast = "Podcast"
        case vlog = "Vlog"
        case call = "Call"

        var id: String { rawValue }

        var suggestedName: String {
            switch self {
            case .keynote: return "keynote_\(Calendar.current.component(.year, from: .now)).mp4"
            case .podcast: return "podcast_ep.mov"
            case .vlog: return "vlog_stack.mov"
            case .call: return "call_recording.mov"
            }
        }

        var suggestedMinutes: Int {
            switch self {
            case .keynote: return 45
            case .podcast: return 72
            case .vlog: return 18
            case .call: return 30
            }
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                NeuralBackground(intensity: 0.55)

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Picker("Mode", selection: $mode) {
                            ForEach(Mode.allCases) { option in
                                Text(option.rawValue).tag(option)
                            }
                        }
                        .pickerStyle(.segmented)

                        Text(mode == .upload
                             ? "The file is copied into Intégrav and encrypted on this device. Its real length is added to your ingested training hours."
                             : "Records a clip you keep elsewhere. Its length counts toward training, but there is nothing to play back.")
                            .font(.footnote)
                            .foregroundStyle(Theme.textSecondary)

                        if mode == .upload {
                            uploadSection
                        } else {
                            logSection
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 24)
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle("Add video")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
            }
            .onChange(of: kind) { _, newValue in
                minutes = newValue.suggestedMinutes
            }
            .onChange(of: pickerItem) { _, item in
                guard let item else { return }
                Task { await importPicked(item) }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
    }

    // MARK: - Upload

    private var uploadSection: some View {
        VStack(spacing: 16) {
            PhotosPicker(
                selection: $pickerItem,
                matching: .any(of: [.videos, .slomoVideos]),
                photoLibrary: .shared()
            ) {
                VStack(spacing: 10) {
                    Image(systemName: isImporting ? "arrow.down.circle" : "square.and.arrow.up.on.square.fill")
                        .font(.system(size: 34, weight: .semibold))
                        .foregroundStyle(Theme.magenta)
                        .symbolEffect(.pulse, isActive: isImporting)

                    Text(isImporting ? "Importing…" : "Choose a video")
                        .font(.headline)
                        .foregroundStyle(Theme.textPrimary)

                    Text(isImporting
                         ? "Reading its length and lifting a thumbnail"
                         : "From your camera roll")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
                .background(
                    RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                        .fill(Theme.surface)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                        .strokeBorder(
                            Theme.magenta.opacity(isImporting ? 0.3 : 0.75),
                            style: StrokeStyle(lineWidth: 1.6, dash: [7, 5])
                        )
                )
            }
            .disabled(isImporting)
            .accessibilityLabel("Choose a video from your library")

            if let importError {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(Theme.warning)
                    Text(importError)
                        .font(.footnote)
                        .foregroundStyle(Theme.textPrimary)
                    Spacer(minLength: 0)
                }
                .padding(14)
                .integravCard()
                .transition(.opacity)
            }

            if !twin.videos.filter(\.isPlayable).isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("\(twin.videos.filter(\.isPlayable).count) clip\(twin.videos.filter(\.isPlayable).count == 1 ? "" : "s") stored on this device")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.textSecondary)
                    Text("Tap any clip in the studio to play it back.")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: importError)
    }

    // MARK: - Log by length

    private var logSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 10) {
                fieldLabel("Clip type")
                Picker("Clip type", selection: $kind) {
                    ForEach(ClipKind.allCases) { option in
                        Text(option.rawValue).tag(option)
                    }
                }
                .pickerStyle(.segmented)
            }

            VStack(alignment: .leading, spacing: 10) {
                fieldLabel("File name")
                TextField(
                    "",
                    text: $name,
                    prompt: Text(kind.suggestedName).foregroundStyle(Theme.textSecondary)
                )
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($nameFocused)
                .foregroundStyle(Theme.textPrimary)
                .padding(.horizontal, 16)
                .frame(height: 52)
                .background(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .fill(Theme.surface)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .strokeBorder(nameFocused ? Theme.magenta : Theme.border, lineWidth: 1.2)
                )
            }

            VStack(alignment: .leading, spacing: 10) {
                fieldLabel("Length")
                HStack {
                    Text(lengthLabel)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.magenta)
                        .monospacedDigit()
                    Spacer()
                    Stepper("Length", value: $minutes, in: 1...600, step: 1)
                        .labelsHidden()
                }
                Slider(value: minuteBinding, in: 1...600, step: 1)
                    .tint(Theme.magenta)
            }
            .padding(18)
            .integravCard()

            Button(action: add) {
                HStack(spacing: 8) {
                    Image(systemName: "wand.and.stars")
                    Text("Log clip").font(.headline)
                }
                .foregroundStyle(Theme.textPrimary)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(Capsule().fill(Theme.accentGradient))
                .glow(Theme.magenta, radius: 16, opacity: 0.5)
            }
            .buttonStyle(PressableButtonStyle())
        }
    }

    // MARK: - Actions

    private func importPicked(_ item: PhotosPickerItem) async {
        isImporting = true
        importError = nil
        defer {
            isImporting = false
            pickerItem = nil
        }

        do {
            guard let movie = try await item.loadTransferable(type: PickedMovie.self) else {
                importError = MediaError.unreadable.localizedDescription
                return
            }
            defer { try? FileManager.default.removeItem(at: movie.url) }

            let clip = try await MediaLibrary.importVideo(from: movie.url, preferredName: nil)
            twin.addImportedClip(clip)
            Haptics.fire()
            dismiss()
        } catch let error as MediaError {
            importError = error.localizedDescription
        } catch {
            importError = "That video couldn't be imported."
        }
    }

    private var minuteBinding: Binding<Double> {
        Binding(
            get: { Double(minutes) },
            set: { minutes = Int($0) }
        )
    }

    private var lengthLabel: String {
        if minutes < 60 { return "\(minutes) min" }
        return String(format: "%d:%02d hrs", minutes / 60, minutes % 60)
    }

    private func fieldLabel(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.caption2.weight(.bold))
            .kerning(1.1)
            .foregroundStyle(Theme.textSecondary)
    }

    private func add() {
        let finalName = name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? kind.suggestedName
            : name
        twin.addVideo(name: finalName, minutes: minutes)
        dismiss()
    }
}
