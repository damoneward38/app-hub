import SwiftUI

/// Every film-grade control in one place: delivery format, chroma key, quality,
/// stages and publishing. Everything here lands in the `config.yaml` that
/// houly-pipe reads, and the generated file can be shared straight to the host.
///
/// Plain content with no chrome of its own, so the Cinema page and the render
/// studio's quick sheet can both host it without either copy drifting from the
/// other.
struct PipelineControlsView: View {
    @Environment(ProductionStore.self) private var production
    @Environment(BridgeStore.self) private var bridge

    /// Optional job title so the generated config names its own output file.
    var projectTitle: String = "Intégrav render"
    /// The host page may already show a summary of its own.
    var showsSummary: Bool = true

    @State private var showConfig: Bool = false
    // Transient: which clip on the computer to sample, and how far into it.
    @State private var previewSource: String = "raw/intro.mp4"
    @State private var previewTime: String = "5"

    var body: some View {
        @Bindable var production = production

        VStack(spacing: 18) {
            if showsSummary { summaryCard }
            presetsCard(settings: $production.settings)
            formatCard(settings: $production.settings)
            greenScreenCard(settings: $production.settings)
            qualityCard(settings: $production.settings)
            stagesCard(settings: $production.settings)
            publishCard(settings: $production.settings)
            configCard
        }
        .sheet(isPresented: $showConfig) {
            ConfigPreviewSheet(
                yaml: production.settings.configYAML(projectTitle: projectTitle),
                fileName: "\(PipelineSettings.slug(projectTitle))_config.yaml"
            )
        }
    }

    // MARK: - Summary

    private var summaryCard: some View {
        VStack(spacing: 10) {
            Text(production.settings.summary)
                .font(.system(.subheadline, design: .monospaced).weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
                .multilineTextAlignment(.center)

            HStack(spacing: 18) {
                figure(
                    value: String(format: "%.1f GB", production.settings.estimatedGigabytesPerHour),
                    label: "per hour"
                )
                figure(
                    value: production.estimateLabel(forOutputSeconds: 600),
                    label: "to render 10 min"
                )
            }
        }
        .frame(maxWidth: .infinity)
        .padding(18)
        .integravCard(highlight: true)
    }

    private func figure(value: String, label: String) -> some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.magenta)
                .monospacedDigit()
            Text(label)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
    }

    // MARK: - Pipelines

    /// The six jobs this pipeline is actually asked to do. One tap moves every
    /// encode knob at once; the cards below still show — and can still change —
    /// each individual value.
    private func presetsCard(settings: Binding<PipelineSettings>) -> some View {
        let active = settings.wrappedValue.matchedPreset

        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                sectionTitle("PIPELINE")
                Spacer(minLength: 0)
                Text(active?.title.uppercased() ?? "CUSTOM")
                    .font(.system(size: 10, weight: .bold))
                    .kerning(0.8)
                    .foregroundStyle(active == nil ? Theme.textSecondary : Theme.magenta)
            }

            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
                spacing: 10
            ) {
                ForEach(PipelinePreset.allCases) { preset in
                    let isOn = active == preset
                    Button {
                        Haptics.tap()
                        withAnimation(.snappy) { settings.wrappedValue.apply(preset) }
                    } label: {
                        VStack(alignment: .leading, spacing: 5) {
                            HStack(spacing: 6) {
                                Image(systemName: preset.symbol)
                                    .font(.system(size: 11, weight: .semibold))
                                Text(preset.title)
                                    .font(.caption.weight(.bold))
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.8)
                            }
                            .foregroundStyle(isOn ? Theme.canvas : Theme.textPrimary)

                            Text(preset.summary)
                                .font(.system(size: 9, design: .monospaced))
                                .foregroundStyle(isOn ? Theme.canvas.opacity(0.8) : Theme.textSecondary)
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)

                            Text(preset.note)
                                .font(.system(size: 10))
                                .foregroundStyle(isOn ? Theme.canvas.opacity(0.75) : Theme.textSecondary)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(11)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .fill(isOn ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surfaceHigh))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .strokeBorder(Theme.border.opacity(isOn ? 0 : 0.6), lineWidth: 1)
                        )
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }

            Text("Presets move the encode only. Your key, grade, subtitles and publishing stay as you set them.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .integravCard()
    }

    // MARK: - Format

    private func formatCard(settings: Binding<PipelineSettings>) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionTitle("DELIVERY FORMAT")

            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(RenderFormat.allCases) { format in
                    let isOn = settings.wrappedValue.format == format
                    Button {
                        Haptics.tap()
                        withAnimation(.snappy) { settings.wrappedValue.format = format }
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(format.title)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(isOn ? Theme.canvas : Theme.textPrimary)
                            Text(format.resolution)
                                .font(.system(.caption2, design: .monospaced))
                                .foregroundStyle(isOn ? Theme.canvas.opacity(0.8) : Theme.textSecondary)
                            Text(format.note)
                                .font(.caption2)
                                .foregroundStyle(isOn ? Theme.canvas.opacity(0.7) : Theme.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .fill(isOn ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surfaceHigh))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .strokeBorder(Theme.border.opacity(isOn ? 0 : 0.6), lineWidth: 1)
                        )
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Frame rate")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                HStack(spacing: 8) {
                    ForEach(PipelineSettings.fpsChoices, id: \.self) { value in
                        let isOn = settings.wrappedValue.fps == value
                        Button {
                            Haptics.tap()
                            withAnimation(.snappy) { settings.wrappedValue.fps = value }
                        } label: {
                            Text("\(value)")
                                .font(.footnote.weight(.bold))
                                .monospacedDigit()
                                .foregroundStyle(isOn ? Theme.canvas : Theme.textPrimary)
                                .frame(maxWidth: .infinity)
                                .frame(height: 42)
                                .background(
                                    Capsule().fill(isOn
                                                   ? AnyShapeStyle(Theme.accentGradient)
                                                   : AnyShapeStyle(Theme.surfaceHigh))
                                )
                        }
                        .buttonStyle(PressableButtonStyle())
                    }
                }
            }
        }
        .padding(16)
        .integravCard()
    }

    // MARK: - Green screen

    private func greenScreenCard(settings: Binding<PipelineSettings>) -> some View {
        let green = settings.greenScreen
        let value = settings.wrappedValue.greenScreen

        return VStack(alignment: .leading, spacing: 14) {
            HStack {
                sectionTitle("GREEN SCREEN")
                Spacer()
                Toggle("", isOn: green.isEnabled)
                    .labelsHidden()
                    .tint(Theme.magenta)
            }

            Text(value.isEnabled
                 ? "Each keyed scene is cut out and placed over your backdrop before anything else runs."
                 : "Drop the talent onto a new background before the timeline is cut.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)

            if value.isEnabled {
                keyColorRow(green: green, selected: value.key)
                backdropRow(green: green, value: value)
                scopeRow(green: green, everyScene: value.appliesToEveryScene)

                DisclosureGroup {
                    VStack(alignment: .leading, spacing: 14) {
                        slider(
                            title: "Spill removal",
                            value: green.despill,
                            range: GreenScreenSettings.despillRange,
                            display: String(format: "%.0f%%", value.despill * 100),
                            note: "Pulls the screen's colour back out of hair and shoulders."
                        )
                        slider(
                            title: "Key tolerance",
                            value: green.tolerance,
                            range: GreenScreenSettings.toleranceRange,
                            display: String(format: "%.2f", value.tolerance),
                            note: "Raise it if the screen shows through; lower it if the subject is eaten."
                        )
                        slider(
                            title: "Edge softness",
                            value: green.softness,
                            range: GreenScreenSettings.softnessRange,
                            display: String(format: "%.2f", value.softness),
                            note: "Width of the see-through ramp at the cut-out's edge."
                        )
                        slider(
                            title: "Feather",
                            value: Binding(
                                get: { Double(value.feather) },
                                set: { green.wrappedValue.feather = Int($0.rounded()) }
                            ),
                            range: GreenScreenSettings.featherRange,
                            display: "\(value.feather)px",
                            note: "Blurs the matte edge so the join is not a razor line."
                        )
                        slider(
                            title: "Subject size",
                            value: green.scale,
                            range: GreenScreenSettings.scaleRange,
                            display: String(format: "%.2f×", value.scale),
                            note: "1.00× keeps the original framing."
                        )
                        slider(
                            title: "Nudge across",
                            value: green.offsetX,
                            range: GreenScreenSettings.offsetRange,
                            display: String(format: "%+.2f", value.offsetX),
                            note: "Fraction of the frame width, so it holds at any resolution."
                        )
                        slider(
                            title: "Nudge up/down",
                            value: green.offsetY,
                            range: GreenScreenSettings.offsetRange,
                            display: String(format: "%+.2f", value.offsetY),
                            note: "Negative moves the subject up the frame."
                        )
                    }
                    .padding(.top, 10)
                } label: {
                    Text("Fine tuning")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                }
                .tint(Theme.magenta)
            }

            keyPreviewSection(value: value)
        }
        .padding(16)
        .integravCard(highlight: value.isEnabled)
    }

    // MARK: - Key preview

    /// One keyed frame straight from the paired computer, so the tolerance is
    /// judged on real pixels before a full render is committed to.
    private func keyPreviewSection(value: GreenScreenSettings) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                sectionTitle("CHECK THE KEY")
                Spacer()
                if bridge.isPreviewing {
                    ProgressView()
                        .controlSize(.small)
                        .tint(Theme.magenta)
                }
            }

            HStack(spacing: 8) {
                TextField("raw/green_take.mp4", text: $previewSource)
                    .font(.system(.footnote, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                TextField("5", text: $previewTime)
                    .font(.system(.footnote, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 52)
                Text("sec in")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                    .fill(Theme.surfaceHigh)
            )

            Button {
                grabPreviewFrame(settings: value)
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: bridge.isPreviewing ? "hourglass" : "camera.viewfinder")
                    Text(bridge.isPreviewing
                         ? "Keying one frame…"
                         : "Grab a test frame from \(bridge.hostLabel)")
                        .font(.subheadline.weight(.semibold))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(
                    Capsule().fill(canPreview
                                   ? AnyShapeStyle(Theme.accentGradient)
                                   : AnyShapeStyle(Theme.surfaceHigh))
                )
                .foregroundStyle(canPreview ? Theme.canvas : Theme.textSecondary)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(!canPreview || bridge.isPreviewing)

            if bridge.isLinked {
                Text("One frame from that clip, keyed on the computer with exactly these settings. A full render keys the whole scene with them.")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            } else {
                Label("Connect a computer in Render Studio to preview the key.",
                      systemImage: "info.circle")
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }

            if let error = bridge.previewError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption2)
                    .foregroundStyle(Theme.warning)
            }

            if let image = bridge.previewImage, let made = bridge.previewRequest {
                VStack(alignment: .leading, spacing: 6) {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .clipShape(.rect(cornerRadius: Theme.controlCorner, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .strokeBorder(Theme.border.opacity(0.6), lineWidth: 1)
                        )
                    Text("Keyed on \(bridge.hostLabel) at \(Self.secondsLabel(made.time)) · " +
                         "tolerance \(String(format: "%.2f", made.tolerance)) · " +
                         "size \(String(format: "%.2f", made.size))×")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
    }

    private var canPreview: Bool {
        bridge.isLinked
            && !previewSource.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func grabPreviewFrame(settings: GreenScreenSettings) {
        Haptics.tap()
        let seconds = Double(previewTime.replacingOccurrences(of: ",", with: ".")) ?? 0
        Task {
            await bridge.previewKey(settings: settings, source: previewSource, time: seconds)
        }
    }

    /// `5` stays "5", `7.5` stays "7.5" — no float noise in the caption.
    private static func secondsLabel(_ value: Double) -> String {
        value == value.rounded() ? "\(Int(value))s" : String(format: "%.1fs", value)
    }

    private func keyColorRow(green: Binding<GreenScreenSettings>, selected: ChromaKey) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Screen colour")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
            HStack(spacing: 8) {
                ForEach(ChromaKey.allCases) { key in
                    let isOn = selected == key
                    Button {
                        Haptics.tap()
                        withAnimation(.snappy) { green.wrappedValue.key = key }
                    } label: {
                        VStack(spacing: 6) {
                            Circle()
                                .fill(Color(hexString: key.hex))
                                .frame(width: 22, height: 22)
                                .overlay(
                                    Circle().strokeBorder(
                                        isOn ? Theme.canvas : Theme.border.opacity(0.6),
                                        lineWidth: 2
                                    )
                                )
                            Text(key.title)
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(isOn ? Theme.canvas : Theme.textPrimary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                                .fill(isOn ? AnyShapeStyle(Theme.accentGradient)
                                           : AnyShapeStyle(Theme.surfaceHigh))
                        )
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }
            Text(selected.note)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
    }

    private func backdropRow(
        green: Binding<GreenScreenSettings>,
        value: GreenScreenSettings
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Backdrop")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)

            Picker("Backdrop", selection: green.usesHostFile) {
                Text("Colour").tag(false)
                Text("File on computer").tag(true)
            }
            .pickerStyle(.segmented)

            if value.usesHostFile {
                TextField("raw/backdrop.png", text: green.backdropFile)
                    .font(.system(.footnote, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .fill(Theme.surfaceHigh)
                    )
                Label(
                    value.isValid
                        ? "Relative to the pipeline folder on the paired computer. The phone cannot check it exists — the render host reports it before keying starts."
                        : "Enter a path, or switch back to a colour.",
                    systemImage: value.isValid ? "info.circle" : "exclamationmark.triangle.fill"
                )
                .font(.caption2)
                .foregroundStyle(value.isValid ? Theme.textSecondary : Theme.warning)
            } else {
                HStack(spacing: 8) {
                    ForEach(PipelineControlsView.backdropSwatches, id: \.self) { hex in
                        let isOn = value.normalisedColor.caseInsensitiveCompare(hex) == .orderedSame
                        Button {
                            Haptics.tap()
                            withAnimation(.snappy) { green.wrappedValue.backdropColor = hex }
                        } label: {
                            RoundedRectangle(cornerRadius: 9, style: .continuous)
                                .fill(Color(hexString: hex))
                                .frame(height: 34)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 9, style: .continuous)
                                        .strokeBorder(isOn ? Theme.magenta : Theme.border.opacity(0.5),
                                                      lineWidth: isOn ? 2 : 1)
                                )
                        }
                        .buttonStyle(PressableButtonStyle())
                    }
                }
                HStack(spacing: 8) {
                    Text("Hex")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                    TextField("#101018", text: green.backdropColor)
                        .font(.system(.footnote, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Circle()
                        .fill(Color(hexString: value.normalisedColor))
                        .frame(width: 20, height: 20)
                        .overlay(Circle().strokeBorder(Theme.border, lineWidth: 1))
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                        .fill(Theme.surfaceHigh)
                )
            }
        }
    }

    private func scopeRow(green: Binding<GreenScreenSettings>, everyScene: Bool) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Apply to")
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
            Picker("Apply to", selection: green.appliesToEveryScene) {
                Text("First scene").tag(false)
                Text("Every scene").tag(true)
            }
            .pickerStyle(.segmented)
            Text(everyScene
                 ? "Every clip is keyed — only pick this when the whole shoot is on the screen."
                 : "Only the opening clip is keyed, so b-roll passes through untouched.")
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
    }

    private static let backdropSwatches: [String] = [
        "#101018", "#1A1029", "#0B3D2E", "#3A1220", "#F2EFE6",
    ]

    // MARK: - Quality

    private func qualityCard(settings: Binding<PipelineSettings>) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionTitle("QUALITY")

            slider(
                title: "Quality (CRF)",
                value: Binding(
                    get: { Double(settings.wrappedValue.crf) },
                    set: { settings.wrappedValue.crf = Int($0.rounded()) }
                ),
                range: PipelineSettings.crfRange,
                display: "\(settings.wrappedValue.crf)",
                note: crfNote(settings.wrappedValue.crf)
            )

            slider(
                title: "Bitrate ceiling",
                value: Binding(
                    get: { Double(settings.wrappedValue.bitrateMbps) },
                    set: { settings.wrappedValue.bitrateMbps = Int($0.rounded()) }
                ),
                range: PipelineSettings.bitrateRange,
                display: "\(settings.wrappedValue.bitrateMbps) Mb/s",
                note: "Applied as -maxrate, so quality drives the encode but nothing spikes past this."
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("Encoder preset")
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                Picker("Preset", selection: settings.preset) {
                    ForEach(EncoderPreset.allCases) { preset in
                        Text(preset.title).tag(preset)
                    }
                }
                .pickerStyle(.segmented)
                Text(settings.wrappedValue.preset.note)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .padding(16)
        .integravCard()
    }

    private func crfNote(_ crf: Int) -> String {
        switch crf {
        case ..<16: return "Visually lossless, very large files"
        case 16...20: return "Broadcast master quality"
        case 21...25: return "Good for review copies"
        default: return "Visible compression on detailed footage"
        }
    }

    private func slider(
        title: String,
        value: Binding<Double>,
        range: ClosedRange<Double>,
        display: String,
        note: String
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                Text(display)
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Theme.magenta)
                    .monospacedDigit()
                    .contentTransition(.numericText())
            }
            Slider(value: value, in: range, step: 1)
                .tint(Theme.magenta)
            Text(note)
                .font(.caption2)
                .foregroundStyle(Theme.textSecondary)
        }
    }

    // MARK: - Stages

    private func stagesCard(settings: Binding<PipelineSettings>) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("STAGES")

            toggle("Burn in subtitles", detail: "raw/merged.vtt", isOn: settings.burnSubtitles)
            toggle("Apply colour LUT", detail: "assets/grade.cube", isOn: settings.applyLUT)
            toggle("Watermark", detail: "assets/logo.png for the first 8s", isOn: settings.watermark)
            toggle("Build preview clip", detail: "Short cut for review", isOn: settings.makePreview)

            if settings.wrappedValue.makePreview {
                Stepper(
                    "Preview length · \(settings.wrappedValue.previewSeconds)s",
                    value: settings.previewSeconds,
                    in: 5...120,
                    step: 5
                )
                .font(.footnote)
                .foregroundStyle(Theme.textPrimary)
                .tint(Theme.magenta)
            }
        }
        .padding(16)
        .integravCard()
    }

    private func publishCard(settings: Binding<PipelineSettings>) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("PUBLISH")

            toggle(
                "Upload to YouTube",
                detail: production.isConnected
                    ? "Channel: \(production.channel?.title ?? "connected")"
                    : "Connect a channel in YouTube settings first",
                isOn: settings.uploadToYouTube
            )

            if settings.wrappedValue.uploadToYouTube {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Visibility")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                    Picker("Privacy", selection: settings.privacy) {
                        ForEach(YouTubePrivacy.allCases) { privacy in
                            Text(privacy.title).tag(privacy)
                        }
                    }
                    .pickerStyle(.segmented)
                    Text(settings.wrappedValue.privacy.note)
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }

                if !production.isConnected {
                    Label(
                        "No channel connected — the pipeline will render but skip the upload stage.",
                        systemImage: "exclamationmark.triangle.fill"
                    )
                    .font(.caption2)
                    .foregroundStyle(Theme.warning)
                }
            }
        }
        .padding(16)
        .integravCard()
    }

    private func toggle(_ title: String, detail: String, isOn: Binding<Bool>) -> some View {
        Toggle(isOn: isOn) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.textPrimary)
                Text(detail)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
            }
        }
        .tint(Theme.magenta)
    }

    private var configCard: some View {
        Button {
            Haptics.tap()
            showConfig = true
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "doc.text.fill")
                    .foregroundStyle(Theme.violet)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Preview config.yaml")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("Export it to the render host")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .padding(16)
            .integravCard()
            .contentShape(.rect)
        }
        .buttonStyle(PressableButtonStyle())
    }

    private func sectionTitle(_ text: String) -> some View {
        Text(text)
            .font(.caption.weight(.bold))
            .kerning(1.2)
            .foregroundStyle(Theme.textSecondary)
    }
}

/// The same controls as a quick sheet, for reaching them without leaving the
/// render studio. The Cinema page is their real home.
struct RenderSettingsSheet: View {
    @Environment(ProductionStore.self) private var production
    @Environment(\.dismiss) private var dismiss

    var projectTitle: String = "Intégrav render"

    var body: some View {
        @Bindable var production = production

        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView {
                    PipelineControlsView(projectTitle: projectTitle)
                        .padding(.horizontal, 16)
                        .padding(.bottom, 32)
                }
            }
            .navigationTitle("Pipeline")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Reset") {
                        Haptics.tap()
                        withAnimation(.snappy) { production.settings = .default }
                    }
                    .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Theme.magenta)
                }
            }
        }
    }
}

/// Read-only look at the generated YAML, with a share sheet so it can go
/// straight to the machine running the pipeline.
struct ConfigPreviewSheet: View {
    let yaml: String
    let fileName: String

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                ScrollView([.horizontal, .vertical]) {
                    Text(yaml)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .textSelection(.enabled)
                        .padding(16)
                }
            }
            .navigationTitle("config.yaml")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    ShareLink(item: yaml, preview: SharePreview(fileName)) {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundStyle(Theme.magenta)
                    }
                }
            }
        }
    }
}
