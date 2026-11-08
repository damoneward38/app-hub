import SwiftUI

/// Full-screen live conversation with the twin — the emotional peak of the app.
struct TwinPreviewView: View {
    @Environment(TwinStore.self) private var twin
    @Environment(RegistryStore.self) private var registry
    @Environment(AvatarStore.self) private var avatar
    @Environment(ConversationStore.self) private var conversation
    @Environment(StageStore.self) private var stage
    @Environment(\.dismiss) private var dismiss

    @State private var draft: String = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        ZStack {
            Theme.canvas.ignoresSafeArea()
            portrait
            gradientScrim

            VStack(spacing: 0) {
                topBar
                Spacer(minLength: 0)
                transcript
                if !conversation.activity.isEmpty {
                    activityStrip
                        .padding(.bottom, 8)
                }
                statusChip
                    .padding(.bottom, 10)
                if let notice = conversation.notice {
                    noticeBar(notice)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 10)
                }
                captionLine
                waveform
                    .padding(.horizontal, 20)
                    .padding(.bottom, 14)
                inputRow
                    .padding(.horizontal, 18)
                    .padding(.bottom, 6)
            }
            .padding(.bottom, 8)
        }
        .preferredColorScheme(.dark)
        .task {
            guard let chain = registry.pendingChain else { return }
            registry.pendingChain = nil
            registry.run(chain: chain, on: twin)
        }
        .onAppear { stage.start() }
        .onDisappear {
            registry.stopChain()
            stage.stopPerformance()
            conversation.stopSession()
            twin.isListening = false
            twin.stopWave()
        }
    }

    // MARK: - Backdrop

    private var portrait: some View {
        GeometryReader { proxy in
            Group {
                if let mesh = avatar.mesh, let texture = avatar.image {
                    ZStack {
                        NeuralBackground(intensity: 0.6)
                        // Driven by the performance engine, so a function
                        // called mid-conversation is performed here too.
                        AvatarHeadView(
                            mesh: mesh,
                            texture: texture,
                            mouthOpen: max(stage.pose.mouthOpen, twin.speechEnvelope),
                            smile: stage.pose.smile,
                            browRaise: max(stage.pose.browRaise, twin.isThinking ? 0.45 : 0),
                            blink: stage.pose.blink,
                            yaw: stage.pose.yaw,
                            pitch: stage.pose.pitch,
                            roll: stage.pose.roll,
                            isAlive: false
                        )
                        .padding(.top, 30)
                    }
                } else if UIImage(named: "ai_woman_neon_halo") != nil {
                    Image("ai_woman_neon_halo")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } else {
                    ZStack {
                        NeuralBackground()
                        TwinOrb(diameter: 220)
                    }
                }
            }
            .frame(width: proxy.size.width, height: proxy.size.height * 0.78, alignment: .top)
            .clipped()
            .allowsHitTesting(false)
        }
        .ignoresSafeArea()
    }

    private var gradientScrim: some View {
        LinearGradient(
            colors: [
                Theme.canvas.opacity(0.1),
                Theme.canvas.opacity(0.45),
                Theme.canvas.opacity(0.95),
                Theme.canvas,
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }

    // MARK: - Chrome

    private var topBar: some View {
        HStack {
            Spacer()
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Theme.surface.opacity(0.75)))
                    .overlay(Circle().strokeBorder(Theme.border, lineWidth: 1))
            }
            .buttonStyle(PressableButtonStyle())
            .accessibilityLabel("Close live twin")
        }
        .padding(.horizontal, 18)
        .padding(.top, 6)
    }

    private var transcript: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 10) {
                    ForEach(twin.messages) { message in
                        ChatBubble(message: message)
                            .id(message.id)
                    }
                    if twin.isThinking {
                        ThinkingBubble().id("thinking")
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 8)
            }
            .frame(maxHeight: 220)
            .scrollIndicators(.hidden)
            .scrollDismissesKeyboard(.interactively)
            .onChange(of: twin.messages.count) { _, _ in
                withAnimation(.easeOut(duration: 0.3)) {
                    proxy.scrollTo(twin.messages.last?.id, anchor: .bottom)
                }
            }
        }
    }

    /// Receipts for work she actually started — a spoken claim you can check.
    private var activityStrip: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                ForEach(conversation.activity.prefix(6)) { entry in
                    HStack(spacing: 6) {
                        Image(systemName: entry.symbol)
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(entry.outcome == .failed ? Theme.warning
                                             : entry.outcome == .done ? Theme.success : Theme.magenta)
                        Text("\(entry.tool) \(entry.detail)")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(Theme.textSecondary)
                            .lineLimit(1)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(Capsule().fill(Theme.surface.opacity(0.85)))
                    .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))
                }
            }
        }
        .scrollIndicators(.hidden)
        .contentMargins(.horizontal, 20)
        .frame(height: 34)
    }

    /// What she is hearing right now, before the sentence is finished.
    @ViewBuilder
    private var captionLine: some View {
        if !conversation.caption.isEmpty {
            Text(conversation.caption)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.textPrimary.opacity(0.85))
                .lineLimit(2)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 24)
                .padding(.bottom, 10)
                .transition(.opacity)
        }
    }

    private func noticeBar(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.caption)
                .foregroundStyle(Theme.warning)
            Text(text)
                .font(.caption)
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(3)
            Spacer(minLength: 0)
            Button {
                conversation.clearNotice()
            } label: {
                Image(systemName: "xmark")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Theme.textSecondary)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Theme.surface.opacity(0.9))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(Theme.warning.opacity(0.45), lineWidth: 1)
        )
    }

    private var statusChip: some View {
        HStack(spacing: 8) {
            LiveDot()
            Text(statusText)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Theme.textPrimary)
                .monospacedDigit()
                .lineLimit(1)

            if registry.runningChain != nil {
                Button {
                    Haptics.tap()
                    registry.stopChain()
                } label: {
                    Image(systemName: "stop.fill")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.magenta)
                }
                .buttonStyle(PressableButtonStyle())
                .accessibilityLabel("Stop chain")
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 9)
        .background(Capsule().fill(Theme.surface.opacity(0.85)))
        .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))
    }

    private var statusText: String {
        if let chain = registry.runningChain {
            let step = min(registry.runningStep + 1, chain.steps.count)
            let name = registry.runningFunction?.signature ?? chain.name
            return "\(chain.name) · \(step)/\(chain.steps.count) · \(name)"
        }
        if conversation.isSessionStarting { return "Opening the mic…" }
        if conversation.isLive { return conversation.mode.label }
        return "Live · Lip sync \(twin.lipSyncMs)ms"
    }

    private var waveform: some View {
        HStack(alignment: .center, spacing: 3) {
            ForEach(Array(twin.levels.enumerated()), id: \.offset) { _, level in
                Capsule()
                    .fill(Theme.accentGradient)
                    .frame(width: 3, height: max(3, level * 54))
            }
        }
        .frame(height: 62)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 12)
        .background(
            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                .fill(Theme.surface.opacity(0.55))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                .strokeBorder(Theme.border.opacity(0.8), lineWidth: 1)
        )
        .animation(.easeOut(duration: 0.08), value: twin.levels)
        .accessibilityHidden(true)
    }

    private var inputRow: some View {
        HStack(spacing: 12) {
            TextField(
                "",
                text: $draft,
                prompt: Text("Say something…").foregroundStyle(Theme.textSecondary)
            )
            .textFieldStyle(.plain)
            .foregroundStyle(Theme.textPrimary)
            .focused($inputFocused)
            .submitLabel(.send)
            .onSubmit(send)
            .padding(.horizontal, 20)
            .frame(height: 56)
            .background(Capsule().fill(Theme.surface.opacity(0.8)))
            .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))

            VStack(spacing: 4) {
                Button {
                    if hasDraft {
                        send()
                    } else {
                        Haptics.fire()
                        Task { await conversation.toggleSession() }
                    }
                } label: {
                    Image(systemName: micSymbol)
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                        .frame(width: 56, height: 56)
                        .background(
                            Circle().fill(conversation.isLive
                                          ? AnyShapeStyle(Theme.accentGradient)
                                          : AnyShapeStyle(Theme.surface.opacity(0.8)))
                        )
                        .overlay(Circle().strokeBorder(Theme.magenta, lineWidth: 1.6))
                        .glow(Theme.magenta, radius: conversation.isLive ? 22 : 10, opacity: 0.7)
                        .scaleEffect(conversation.mode == .speaking ? 1.06 : 1)
                        .animation(
                            .easeInOut(duration: 0.45).repeatForever(autoreverses: true),
                            value: conversation.mode == .speaking
                        )
                }
                .buttonStyle(PressableButtonStyle())
                .disabled(conversation.isSessionStarting)
                .accessibilityLabel(conversation.isLive ? "End voice conversation" : "Start talking to your twin")

                Text(hasDraft ? "Send" : (conversation.isLive ? "End" : "Talk"))
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(Theme.magenta)
            }
        }
    }

    private var hasDraft: Bool {
        !draft.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private var micSymbol: String {
        if hasDraft { return "arrow.up" }
        switch conversation.mode {
        case .off: return "mic.fill"
        case .listening: return "waveform"
        case .thinking: return "gearshape.2.fill"
        case .speaking: return "speaker.wave.2.fill"
        }
    }

    /// Typing `tell_joke()` — or a bare hotkey like `042` — calls the function
    /// directly. Anything else goes to the same brain the voice loop uses, so a
    /// typed instruction can start real work exactly like a spoken one.
    private func send() {
        let text = draft
        draft = ""
        inputFocused = false
        if let fn = registry.function(matching: text) {
            Haptics.fire()
            registry.run(fn, on: twin, source: .chat)
        } else if conversation.canUseVoice {
            conversation.send(text)
        } else {
            twin.send(text)
        }
    }
}

/// One line of conversation, tinted by who said it.
struct ChatBubble: View {
    let message: TwinMessage

    var body: some View {
        HStack {
            if message.role == .user { Spacer(minLength: 40) }

            Text(message.text)
                .font(.subheadline)
                .foregroundStyle(Theme.textPrimary)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(message.role == .twin
                              ? Theme.surface.opacity(0.85)
                              : Theme.violet.opacity(0.35))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .strokeBorder(
                            message.role == .twin ? Theme.magenta.opacity(0.45) : Theme.violet.opacity(0.7),
                            lineWidth: 1
                        )
                )

            if message.role == .twin { Spacer(minLength: 40) }
        }
    }
}

/// Animated placeholder while the twin composes a reply.
struct ThinkingBubble: View {
    @State private var phase: Int = 0

    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<3, id: \.self) { index in
                Circle()
                    .fill(Theme.magenta)
                    .frame(width: 7, height: 7)
                    .opacity(phase == index ? 1 : 0.3)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Theme.surface.opacity(0.85))
        )
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(280))
                withAnimation(.easeInOut(duration: 0.2)) { phase = (phase + 1) % 3 }
            }
        }
        .accessibilityLabel("Twin is replying")
    }
}
