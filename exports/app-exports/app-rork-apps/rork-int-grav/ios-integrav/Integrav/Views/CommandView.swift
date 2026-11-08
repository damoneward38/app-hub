import SwiftUI

/// Command tab — one glowing command bar over the violet void, the twin orb
/// above it, quick launches, and the live feed of dispatched work.
struct CommandView: View {
    @Environment(EngineStore.self) private var engine
    @Environment(TwinStore.self) private var twin
    @Environment(RegistryStore.self) private var registry
    @Environment(BridgeStore.self) private var bridge
    @Binding var selectedTab: AppTab

    @State private var command: String = ""
    @State private var justDispatched: Bool = false
    @State private var showLiveVoice: Bool = false
    @State private var sheet: CommandSheet?
    @State private var path: [CommandDestination] = []
    @FocusState private var commandFocused: Bool

    var body: some View {
        NavigationStack(path: $path) {
            ZStack {
                NeuralBackground()

                ScrollView {
                    VStack(spacing: 22) {
                        header
                        commandBar
                        quickLaunches
                        hubSection
                        feedSection
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 4)
                    .padding(.bottom, 28)
                }
                .scrollIndicators(.hidden)
                .scrollDismissesKeyboard(.interactively)
            }
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: CommandDestination.self) { destination in
                switch destination {
                case .tasks: TaskEngineView()
                case .studio: RenderStudioView()
                case .mimic: MimicStudioView()
                case .machine: MachineView()
                case .vault: VaultView()
                case .stage: StageView()
                case .pulse: PulseView()
                }
            }
        }
        .fullScreenCover(isPresented: $showLiveVoice) {
            TwinPreviewView()
        }
        // One `sheet(item:)`, not several `sheet(isPresented:)` — stacking more
        // than one sheet modifier on the same view silently drops all but the
        // last, which turns the others into dead buttons.
        .sheet(item: $sheet) { destination in
            switch destination {
            case .computer: ConnectComputerSheet()
            case .callLog: CallLogSheet()
            case .checkout: CheckoutView(tier: registry.plan)
            }
        }
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 10) {
            TwinOrb(diameter: 148)
                .frame(height: 176)

            HStack(spacing: 8) {
                LiveDot()
                Text(twin.statusLine)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Theme.textSecondary)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Twin online, \(twin.ingestedHours) hours trained")

            talkButton
                .padding(.top, 2)
        }
    }

    /// The shortest path to the thing the app is for: start talking, keep talking.
    private var talkButton: some View {
        Button {
            Haptics.fire()
            showLiveVoice = true
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "waveform")
                    .font(.subheadline.weight(.bold))
                Text("Talk to her")
                    .font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(Theme.canvas)
            .padding(.horizontal, 22)
            .frame(height: 46)
            .background(Capsule().fill(Theme.accentGradient))
            .glow(Theme.magenta, radius: 16, opacity: 0.5)
        }
        .buttonStyle(PressableButtonStyle())
        .accessibilityHint("Opens a live voice conversation with your twin")
    }

    // MARK: - Command bar

    private var commandBar: some View {
        HStack(spacing: 10) {
            TextField(
                "",
                text: $command,
                prompt: Text("Tell \(registry.appName) what to do…")
                    .foregroundStyle(Theme.textSecondary)
            )
            .textFieldStyle(.plain)
            .font(.body)
            .foregroundStyle(Theme.textPrimary)
            .submitLabel(.go)
            .focused($commandFocused)
            .onSubmit(dispatch)
            .padding(.leading, 20)
            .accessibilityLabel("Command")

            Button(action: dispatch) {
                HStack(spacing: 6) {
                    Text("Run").font(.headline)
                    Image(systemName: "paperplane.fill").font(.footnote)
                }
                .foregroundStyle(Theme.textPrimary)
                .padding(.horizontal, 18)
                .frame(height: 46)
                .background(
                    Capsule().fill(
                        command.trimmingCharacters(in: .whitespaces).isEmpty
                            ? AnyShapeStyle(Theme.surfaceHigh)
                            : AnyShapeStyle(Theme.accentGradient)
                    )
                )
                .glow(Theme.magenta, radius: 12, opacity: command.isEmpty ? 0 : 0.6)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(command.trimmingCharacters(in: .whitespaces).isEmpty)
            .padding(.trailing, 7)
        }
        .frame(height: 60)
        .background(
            Capsule().fill(Theme.surface.opacity(0.9))
        )
        .overlay(
            Capsule()
                .strokeBorder(Theme.accentGradient, lineWidth: 1.6)
        )
        .glow(Theme.magenta, radius: justDispatched ? 30 : 16, opacity: 0.7)
        .scaleEffect(justDispatched ? 1.015 : 1)
        .animation(.spring(response: 0.35, dampingFraction: 0.6), value: justDispatched)
    }

    private var quickLaunches: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(TaskKind.allCases) { kind in
                    Button {
                        command = QuickLaunch.command(for: kind)
                        commandFocused = true
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: kind.symbol)
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundStyle(kind == .security ? Theme.magenta : Theme.violet)
                            Text(kind.title)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                        }
                        .frame(width: 104, height: 78)
                        .integravCard()
                    }
                    .buttonStyle(PressableButtonStyle())
                }
            }
            .padding(.vertical, 2)
        }
        .contentMargins(.horizontal, 0, for: .scrollContent)
    }

    // MARK: - Hub

    /// Every destination in one glance. Without this the render pipeline, the
    /// paired computer and the call log sit two or three levels deep and read as
    /// missing features.
    private var hubSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Everything")
                .font(.title3.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)

            LazyVGrid(
                columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
                spacing: 12
            ) {
                HubCard(
                    title: "Live voice",
                    subtitle: "Hands-free talk",
                    symbol: "waveform.circle.fill",
                    tint: Theme.magenta
                ) { showLiveVoice = true }

                HubCard(
                    title: "Stage",
                    subtitle: "Watch her perform",
                    symbol: "theatermasks.fill",
                    tint: Theme.magenta
                ) { path.append(.stage) }

                HubCard(
                    title: "Pulse",
                    subtitle: "Everything live",
                    symbol: "waveform.path.ecg",
                    tint: Theme.success
                ) { path.append(.pulse) }

                HubCard(
                    title: "Full-body mimic",
                    subtitle: "Move, it copies you",
                    symbol: "figure.walk.motion",
                    tint: Theme.magenta
                ) { path.append(.mimic) }

                HubCard(
                    title: "Cinema",
                    subtitle: "Green screen & look",
                    symbol: "film.stack.fill",
                    tint: Theme.magenta
                ) { selectedTab = .cinema }

                HubCard(
                    title: "Render studio",
                    subtitle: "Queue & masters",
                    symbol: "square.stack.3d.down.right.fill",
                    tint: Theme.violet
                ) { path.append(.studio) }

                HubCard(
                    title: "Machine",
                    subtitle: bridge.isLinked ? bridge.hostLabel : "Pair a computer",
                    symbol: "desktopcomputer",
                    tint: bridge.isLinked ? Theme.success : Theme.magenta
                ) { path.append(.machine) }

                HubCard(
                    title: "Task engine",
                    subtitle: "Fleets & capacity",
                    symbol: "gauge.with.dots.needle.67percent",
                    tint: Theme.violet
                ) { path.append(.tasks) }

                HubCard(
                    title: "Twin studio",
                    subtitle: "Face & training",
                    symbol: "person.crop.circle.fill",
                    tint: Theme.violet
                ) { selectedTab = .avatar }

                HubCard(
                    title: "Call log",
                    subtitle: "Every receipt",
                    symbol: "list.bullet.rectangle.portrait",
                    tint: Theme.violet
                ) { sheet = .callLog }

                HubCard(
                    title: "Vault",
                    subtitle: "Private to you",
                    symbol: "lock.shield.fill",
                    tint: Theme.success
                ) { path.append(.vault) }

                // Checkout was only reachable by opening Account and then a
                // plan card, which is why it read as a missing page.
                HubCard(
                    title: "Checkout",
                    subtitle: "Plan, seats & billing",
                    symbol: "creditcard.fill",
                    tint: Theme.magenta
                ) { sheet = .checkout }
            }
        }
    }

    // MARK: - Feed

    private var feedSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(engine.activeCount > 0 ? "Running & completed" : "Just completed")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                Button {
                    path.append(.tasks)
                } label: {
                    HStack(spacing: 4) {
                        Text("See all").font(.subheadline.weight(.semibold))
                        Image(systemName: "chevron.right").font(.caption2.weight(.bold))
                    }
                    .foregroundStyle(Theme.violet)
                }
                .buttonStyle(PressableButtonStyle())
            }

            if engine.feed.isEmpty {
                emptyFeed
            } else {
                LazyVStack(spacing: 12) {
                    ForEach(engine.feed) { task in
                        TaskFeedCard(task: task)
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }
                }
                // Animate when a card is added or removed — NOT on every value
                // in the feed. The heartbeat rewrites each running task's
                // progress every 900ms, and animating on the whole array
                // restarted a spring across the scroll content roughly once a
                // second, which cancelled any drag in flight and left the first
                // screen feeling like it would not scroll.
                .animation(
                    .spring(response: 0.4, dampingFraction: 0.8),
                    value: engine.feed.map(\.id)
                )
            }
        }
    }

    private var emptyFeed: some View {
        VStack(spacing: 8) {
            Image(systemName: "sparkles")
                .font(.title2)
                .foregroundStyle(Theme.violet)
            Text("Nothing dispatched yet")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.textPrimary)
            Text("Type a command above and the fleets pick it up.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
        .integravCard()
    }

    private func dispatch() {
        guard engine.dispatch(command: command) != nil else { return }
        command = ""
        commandFocused = false
        justDispatched = true
        Task {
            try? await Task.sleep(for: .milliseconds(320))
            justDispatched = false
        }
    }
}

/// Screens pushed from the Command tab.
enum CommandDestination: Hashable {
    case tasks
    case studio
    case mimic
    case machine
    case vault
    case stage
    case pulse
}

/// Sheets presented from the Command tab.
enum CommandSheet: String, Identifiable {
    case computer
    case callLog
    case checkout

    var id: String { rawValue }
}

/// One tile in the Command hub grid.
struct HubCard: View {
    let title: String
    let subtitle: String
    let symbol: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button {
            Haptics.tap()
            action()
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: symbol)
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(tint)
                    .frame(height: 26)

                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)

                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .integravCard()
        }
        .buttonStyle(PressableButtonStyle())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title), \(subtitle)")
    }
}

/// Prefilled commands for the quick-launch chips.
enum QuickLaunch {
    static func command(for kind: TaskKind) -> String {
        switch kind {
        case .security: return "Run a legal pen-test sweep across every customer app"
        case .code: return "Write, detect, refresh and extend the payments module"
        case .pipeline: return "Chain the CRM, billing and analytics APIs end to end"
        case .training: return "Train my twin on the newest source clips"
        case .render: return "Render the launch film in 4K and upload it to YouTube"
        }
    }
}

/// One card in the Command feed: running with a live bar, or finished with a check.
struct TaskFeedCard: View {
    let task: EngineTask

    var body: some View {
        HStack(spacing: 14) {
            KindBadge(
                kind: task.kind,
                size: 56,
                accent: task.kind == .security ? Theme.magenta : Theme.violet
            )

            VStack(alignment: .leading, spacing: 5) {
                if task.isFinished {
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text(task.headline)
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundStyle(Theme.magenta)
                            .monospacedDigit()
                        Text(task.subtitle)
                            .font(.subheadline)
                            .foregroundStyle(Theme.textPrimary)
                            .lineLimit(2)
                    }
                } else {
                    Text(task.kind.fleetName)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.textPrimary)
                }

                Text(task.command)
                    .font(.caption)
                    .foregroundStyle(Theme.textSecondary)
                    .lineLimit(2)

                if !task.isFinished {
                    GlowBar(progress: task.progress)
                        .padding(.top, 2)
                }
            }

            Spacer(minLength: 4)

            VStack(alignment: .trailing, spacing: 8) {
                Text(task.isFinished ? relativeLabel : "\(Int(task.progress * 100))%")
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(Theme.textSecondary)
                    .monospacedDigit()

                Image(systemName: task.isFinished ? "checkmark.circle.fill" : "bolt.horizontal.circle.fill")
                    .font(.title3)
                    .foregroundStyle(task.isFinished ? Theme.success : Theme.warning)
            }
        }
        .padding(14)
        .integravCard(highlight: !task.isFinished)
        .accessibilityElement(children: .combine)
    }

    private var relativeLabel: String {
        let reference = task.finishedAt ?? task.startedAt
        let seconds = Int(Date.now.timeIntervalSince(reference))
        if seconds < 60 { return "just now" }
        if seconds < 3_600 { return "\(seconds / 60)m ago" }
        return "\(seconds / 3_600)h ago"
    }
}

/// Shared press feedback for every custom button in the app.
struct PressableButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .animation(.spring(response: 0.28, dampingFraction: 0.65), value: configuration.isPressed)
    }
}
