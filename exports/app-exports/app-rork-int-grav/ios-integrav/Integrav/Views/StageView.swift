import SwiftUI

/// Stage — where a function stops being a log line and becomes movement.
///
/// The registry lists 300 behaviours and the twin screen talks. Neither of them
/// showed you the rig actually performing, which is why the catalog read as
/// decoration. This is the room where you fire a behaviour and watch the face
/// and the body do it, with the live channel values next to it as proof.
struct StageView: View {
    @Environment(RegistryStore.self) private var registry
    @Environment(TwinStore.self) private var twin
    @Environment(AvatarStore.self) private var avatar
    @Environment(StageStore.self) private var stage

    @State private var lens: StageLens = .face
    @State private var query: String = ""
    @State private var family: FunctionCategory?
    @FocusState private var searchFocused: Bool

    /// What the stage is pointed at.
    enum StageLens: String, CaseIterable, Identifiable {
        case face
        case body

        var id: String { rawValue }
        var title: String { self == .face ? "Face" : "Body" }
        var symbol: String { self == .face ? "face.smiling" : "figure.walk.motion" }
    }

    private var matches: [AvatarFunction] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return registry.functions.filter { fn in
            if let family, fn.category != family { return false }
            guard !trimmed.isEmpty else { return true }
            return fn.name.lowercased().contains(trimmed)
                || fn.title.lowercased().contains(trimmed)
                || fn.hotkey.contains(trimmed)
        }
    }

    var body: some View {
        ZStack {
            NeuralBackground(intensity: 0.45)

            ScrollView {
                VStack(spacing: 16) {
                    performer
                    transport
                    RigTelemetryPanel()
                    controls
                    launcher
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
                .padding(.bottom, 30)
            }
            .scrollIndicators(.hidden)
            .scrollDismissesKeyboard(.interactively)
        }
        .navigationTitle("Stage")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Theme.surface, for: .navigationBar)
        .onAppear {
            stage.start()
            // Pointing the stage at a face the user never captured would open on
            // an empty frame, so it opens on whichever half actually exists.
            lens = avatar.hasFace ? .face : .body
        }
        .onDisappear { stage.isAutopilot = false }
    }

    // MARK: - Performer

    private var performer: some View {
        VStack(spacing: 10) {
            Picker("Lens", selection: $lens) {
                ForEach(StageLens.allCases) { option in
                    Label(option.title, systemImage: option.symbol).tag(option)
                }
            }
            .pickerStyle(.segmented)

            ZStack {
                RadialGradient(
                    colors: [Theme.violet.opacity(0.30), .clear],
                    center: .center,
                    startRadius: 8,
                    endRadius: 250
                )
                // Isolated in its own view so the 50 Hz pose stream re-renders
                // the rig and nothing else on this page.
                StagePerformerView(lens: lens)
            }
            .frame(height: 320)
            .frame(maxWidth: .infinity)
            .integravCard(highlight: true)
            .overlay(alignment: .topLeading) { performerBadge }
            .overlay(alignment: .bottomLeading) { StageStatusBadge() }
        }
    }

    private var performerBadge: some View {
        HStack(spacing: 6) {
            LiveDot()
            Text(lens == .face
                 ? (avatar.hasFace ? "Your face · rigged" : "Orb · no face captured")
                 : "Procedural skeleton · 15 joints")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Theme.textSecondary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Capsule().fill(Theme.surfaceHigh))
        .padding(12)
        .allowsHitTesting(false)
    }

    // MARK: - Transport

    private var transport: some View {
        VStack(spacing: 10) {
            StageTransportBar()

            HStack(spacing: 8) {
                transportButton(
                    title: stage.isLooping ? "Looping" : "Loop",
                    symbol: "repeat",
                    tint: stage.isLooping ? Theme.magenta : Theme.textSecondary
                ) {
                    stage.isLooping.toggle()
                }

                transportButton(title: "Replay", symbol: "arrow.counterclockwise", tint: Theme.violet) {
                    guard let name = stage.recent.first,
                          let fn = registry.function(named: name) else { return }
                    registry.run(fn, on: twin, source: .registry)
                }
                // Nothing has been performed yet, so there is nothing to replay.
                .disabled(stage.recent.isEmpty)
                .opacity(stage.recent.isEmpty ? 0.4 : 1)

                transportButton(title: "Stop", symbol: "stop.fill", tint: Theme.warning) {
                    stage.stopPerformance()
                }
                .disabled(stage.current == nil && stage.queuedCount == 0)
                .opacity(stage.current == nil && stage.queuedCount == 0 ? 0.4 : 1)
            }
        }
        .padding(14)
        .integravCard()
    }

    private func transportButton(
        title: String,
        symbol: String,
        tint: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            VStack(spacing: 4) {
                Image(systemName: symbol).font(.subheadline.weight(.bold))
                Text(title).font(.caption2.weight(.semibold)).lineLimit(1)
            }
            .foregroundStyle(tint)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.surfaceHigh)
            )
        }
        .buttonStyle(PressableButtonStyle())
    }

    // MARK: - Controls

    private var controls: some View {
        VStack(spacing: 12) {
            Toggle(isOn: Binding(
                get: { stage.isAutopilot },
                set: { stage.isAutopilot = $0 }
            )) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Autopilot")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                    Text("She picks her own behaviours between cues")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
            .tint(Theme.magenta)

            Divider().overlay(Theme.border)

            HStack(spacing: 10) {
                Menu {
                    Button {
                        queue(Array(registry.functions.shuffled().prefix(12)))
                    } label: {
                        Label("12 at random", systemImage: "shuffle")
                    }

                    if !registry.likedFunctions.isEmpty {
                        Button {
                            queue(registry.likedFunctions)
                        } label: {
                            Label("Every favourite (\(registry.likedFunctions.count))", systemImage: "heart.fill")
                        }
                    }

                    Divider()

                    ForEach(FunctionCategory.allCases) { category in
                        Button {
                            queue(registry.functions.filter { $0.category == category })
                        } label: {
                            Label("\(category.title) (\(registry.count(in: category)))", systemImage: category.symbol)
                        }
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "list.bullet.indent").font(.footnote.weight(.bold))
                        Text("Queue a sweep").font(.subheadline.weight(.semibold))
                    }
                    .foregroundStyle(Theme.canvas)
                    .frame(maxWidth: .infinity)
                    .frame(height: 46)
                    .background(Capsule().fill(Theme.accentGradient))
                }

                if stage.queuedCount > 0 {
                    Button {
                        Haptics.tap()
                        stage.clearQueue()
                    } label: {
                        HStack(spacing: 6) {
                            Text("\(stage.queuedCount)")
                                .font(.subheadline.weight(.bold))
                                .monospacedDigit()
                            Image(systemName: "xmark.circle.fill").font(.footnote)
                        }
                        .foregroundStyle(Theme.textPrimary)
                        .padding(.horizontal, 16)
                        .frame(height: 46)
                        .background(Capsule().fill(Theme.surfaceHigh))
                    }
                    .buttonStyle(PressableButtonStyle())
                    .accessibilityLabel("Clear \(stage.queuedCount) queued behaviours")
                }
            }

            if let notice = registry.limitNotice {
                Text(notice)
                    .font(.caption)
                    .foregroundStyle(Theme.warning)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(14)
        .integravCard()
    }

    /// Sweeps go through the registry, so a queued run is metered and logged
    /// exactly like a tapped one — the stage is not a way around the plan.
    private func queue(_ functions: [AvatarFunction]) {
        Haptics.fire()
        guard let first = functions.first else { return }
        guard registry.run(first, on: twin, source: .registry) else { return }
        stage.enqueue(Array(functions.dropFirst()))
    }

    // MARK: - Launcher

    private var launcher: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Perform")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Text("\(matches.count) of \(registry.functions.count)")
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(Theme.textSecondary)
                    .monospacedDigit()
            }

            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                TextField(
                    "",
                    text: $query,
                    prompt: Text("Search 300 behaviours").foregroundStyle(Theme.textSecondary)
                )
                .textFieldStyle(.plain)
                .foregroundStyle(Theme.textPrimary)
                .autocorrectionDisabled()
                .focused($searchFocused)
                if !query.isEmpty {
                    Button {
                        query = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.textSecondary)
                    }
                    .accessibilityLabel("Clear search")
                }
            }
            .padding(.horizontal, 14)
            .frame(height: 44)
            .background(Capsule().fill(Theme.surface))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    familyChip(nil)
                    ForEach(FunctionCategory.allCases) { category in
                        familyChip(category)
                    }
                }
            }

            if matches.isEmpty {
                emptyMatches
            } else {
                LazyVGrid(
                    columns: [GridItem(.adaptive(minimum: 108), spacing: 8)],
                    spacing: 8
                ) {
                    ForEach(matches.prefix(90)) { fn in
                        StageFunctionChip(function: fn) {
                            registry.run(fn, on: twin, source: .registry)
                        }
                    }
                }

                if matches.count > 90 {
                    Text("Showing the first 90 — search or filter to narrow it.")
                        .font(.caption2)
                        .foregroundStyle(Theme.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 2)
                }
            }
        }
    }

    private var emptyMatches: some View {
        VStack(spacing: 6) {
            Image(systemName: "magnifyingglass")
                .font(.title3)
                .foregroundStyle(Theme.violet)
            Text("No behaviour matches that")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 26)
        .integravCard()
    }

    private func familyChip(_ category: FunctionCategory?) -> some View {
        let isOn = family == category
        return Button {
            Haptics.tap()
            family = isOn ? nil : category
        } label: {
            Text(category?.chip ?? "All")
                .font(.caption.weight(.semibold))
                .foregroundStyle(isOn ? Theme.canvas : Theme.textSecondary)
                .padding(.horizontal, 14)
                .frame(height: 32)
                .background(
                    Capsule().fill(isOn
                                   ? AnyShapeStyle(Theme.accentGradient)
                                   : AnyShapeStyle(Theme.surfaceHigh))
                )
        }
        .buttonStyle(PressableButtonStyle())
    }
}

// MARK: - Live subviews

/// Renders the rig itself. Kept separate so the 50 Hz pose stream invalidates
/// this and nothing else on the page.
private struct StagePerformerView: View {
    @Environment(AvatarStore.self) private var avatar
    @Environment(TwinStore.self) private var twin
    @Environment(StageStore.self) private var stage

    let lens: StageView.StageLens

    var body: some View {
        switch lens {
        case .face:
            if let mesh = avatar.mesh, let texture = avatar.image {
                AvatarHeadView(
                    mesh: mesh,
                    texture: texture,
                    mouthOpen: max(stage.pose.mouthOpen, twin.speechEnvelope),
                    smile: stage.pose.smile,
                    browRaise: stage.pose.browRaise,
                    blink: stage.pose.blink,
                    yaw: stage.pose.yaw,
                    pitch: stage.pose.pitch,
                    roll: stage.pose.roll,
                    isAlive: false
                )
                .padding(.vertical, 6)
            } else {
                VStack(spacing: 12) {
                    TwinOrb(diameter: 150)
                    Text("Capture a face in Twin studio to watch it perform")
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 30)
                }
            }

        case .body:
            BodyFigureView(pose: stage.body, sourceAspect: 1, lineWidth: 8)
                .padding(14)
        }
    }
}

/// The running program and how far through it the rig is.
private struct StageTransportBar: View {
    @Environment(StageStore.self) private var stage

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: stage.current == nil ? "moon.zzz.fill" : "waveform.path")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(stage.current == nil ? Theme.textSecondary : Theme.magenta)
                Text(stage.statusLine)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                    .truncationMode(.middle)
                Spacer(minLength: 0)
                if let current = stage.current {
                    Text(current.isDirected ? "DIRECTED" : "DERIVED")
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundStyle(current.isDirected ? Theme.canvas : Theme.textSecondary)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(
                            Capsule().fill(current.isDirected
                                           ? AnyShapeStyle(Theme.accentGradient)
                                           : AnyShapeStyle(Theme.surfaceHigh))
                        )
                }
            }

            GlowBar(progress: stage.progress)
        }
    }
}

/// The badge on the performer panel: what is playing, right now.
private struct StageStatusBadge: View {
    @Environment(StageStore.self) private var stage

    var body: some View {
        Group {
            if let current = stage.current {
                HStack(spacing: 6) {
                    Image(systemName: "figure.wave")
                        .font(.caption2.weight(.bold))
                    Text(current.gesture.title)
                        .font(.caption2.weight(.semibold))
                }
                .foregroundStyle(Theme.canvas)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Capsule().fill(Theme.accentGradient))
            }
        }
        .padding(12)
        .allowsHitTesting(false)
    }
}

/// Live rig values — the four real morph weights and the three euler angles.
struct RigTelemetryPanel: View {
    @Environment(StageStore.self) private var stage

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Rig")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Text("\(Int(stage.frameRate.rounded())) fps · \(stage.trackedJoints) joints")
                    .font(.system(size: 10, weight: .medium, design: .monospaced))
                    .foregroundStyle(stage.frameRate > 30 ? Theme.success : Theme.warning)
            }

            ForEach(stage.channels, id: \.0) { channel, value in
                HStack(spacing: 8) {
                    Text(channel.name)
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(width: 78, alignment: .leading)

                    GeometryReader { proxy in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Theme.surfaceHigh)
                            Capsule()
                                .fill(Theme.accentGradient)
                                .frame(width: max(2, proxy.size.width * value))
                        }
                    }
                    .frame(height: 6)

                    Text(String(format: "%.2f", value))
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .frame(width: 34, alignment: .trailing)
                }
            }

            HStack(spacing: 8) {
                angleReadout("yaw", stage.headAngles.yaw)
                angleReadout("pitch", stage.headAngles.pitch)
                angleReadout("roll", stage.headAngles.roll)
            }
            .padding(.top, 2)
        }
        .padding(14)
        .integravCard()
    }

    private func angleReadout(_ label: String, _ radians: Double) -> some View {
        VStack(spacing: 2) {
            Text(String(format: "%+.0f°", radians * 180 / .pi))
                .font(.system(size: 13, weight: .bold, design: .monospaced))
                .foregroundStyle(Theme.violet)
            Text(label)
                .font(.system(size: 9, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 7)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Theme.surfaceHigh)
        )
    }
}

/// One tappable behaviour on the stage.
private struct StageFunctionChip: View {
    let function: AvatarFunction
    let action: () -> Void

    var body: some View {
        Button {
            Haptics.fire()
            action()
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: function.category.symbol)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Theme.magenta)
                    Text(function.hotkey)
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundStyle(Theme.textSecondary)
                }
                Text(function.name)
                    .font(.system(size: 11, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 10)
            .padding(.vertical, 9)
            .background(
                RoundedRectangle(cornerRadius: 11, style: .continuous).fill(Theme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 11, style: .continuous)
                    .strokeBorder(Theme.border, lineWidth: 1)
            )
        }
        .buttonStyle(PressableButtonStyle())
        .accessibilityLabel("Perform \(function.title)")
    }
}
