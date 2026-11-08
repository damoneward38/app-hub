import SwiftUI

/// Top-level destinations of Intégrav. Five tabs is the iOS maximum before the
/// system collapses the rest behind a "More" list, so the deeper rooms — mimic,
/// render studio, machine, task engine, vault — are pushed from the tab that
/// owns them and every one of them is also one tap away in the Command hub.
enum AppTab: Hashable {
    case command
    case avatar
    case cinema
    case registry
    case plans
}

/// Decides who is using the app before any of their records are opened.
///
/// The session below is rebuilt from scratch when the identity changes, because
/// every store loads its data in its initialiser and those records are
/// encrypted per account — keeping the old stores alive across a sign-in would
/// leave one account looking at another's data.
struct ContentView: View {
    @State private var auth = AuthManager.shared
    @AppStorage("integrav.localonly.v1") private var isLocalOnly: Bool = false

    var body: some View {
        Group {
            if auth.isLoading {
                LaunchView()
            } else if let user = auth.user {
                SessionView(identity: user.id)
                    .id(user.id)
            } else if isLocalOnly {
                SessionView(identity: nil)
                    .id(SecureStore.deviceIdentity)
            } else {
                SignInView(isLocalOnly: $isLocalOnly)
            }
        }
        .environment(auth)
        .preferredColorScheme(.dark)
        .animation(.easeInOut(duration: 0.25), value: auth.user)
        .onChange(of: auth.user) { _, user in
            // Signing in adopts the local-only escape hatch rather than leaving
            // it armed behind the account.
            if user != nil { isLocalOnly = false }
        }
    }
}

/// The signed-in (or device-local) app.
struct SessionView: View {
    @Environment(\.scenePhase) private var scenePhase
    @Environment(AuthManager.self) private var auth

    @State private var engine: EngineStore
    @State private var twin: TwinStore
    @State private var registry: RegistryStore
    @State private var avatar: AvatarStore
    @State private var production: ProductionStore
    @State private var checkout: CheckoutStore
    @State private var bridge: BridgeStore
    @State private var mimic: MimicStore
    @State private var conversation: ConversationStore
    @State private var storyboards: StoryboardStore
    @State private var stage = StageStore()
    @State private var localRender = LocalRenderStore()
    @State private var cloud = CloudSync.shared
    @State private var selectedTab: AppTab = .command

    /// Binds storage to this identity *before* any store is built, so every
    /// `load` below reads through the right key.
    init(identity: String?) {
        SecureStore.shared.bind(to: identity)
        _engine = State(initialValue: EngineStore())
        _twin = State(initialValue: TwinStore())
        _registry = State(initialValue: RegistryStore())
        _avatar = State(initialValue: AvatarStore())
        _production = State(initialValue: ProductionStore())
        _checkout = State(initialValue: CheckoutStore())
        _bridge = State(initialValue: BridgeStore())
        _mimic = State(initialValue: MimicStore())
        _conversation = State(initialValue: ConversationStore())
        _storyboards = State(initialValue: StoryboardStore())
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            CommandView(selectedTab: $selectedTab)
                .tabItem {
                    Label("Command", systemImage: "house.fill")
                }
                .tag(AppTab.command)

            AvatarStudioView()
                .tabItem {
                    Label("Twin", systemImage: "person.crop.circle.fill")
                }
                .tag(AppTab.avatar)

            CinemaView()
                .tabItem {
                    Label("Cinema", systemImage: "film.stack")
                }
                .tag(AppTab.cinema)

            FunctionRegistryView()
                .tabItem {
                    Label("Functions", systemImage: "function")
                }
                .tag(AppTab.registry)

            PlansView()
                .tabItem {
                    Label("Account", systemImage: "creditcard.fill")
                }
                .tag(AppTab.plans)
        }
        .tint(registry.accent)
        .environment(engine)
        .environment(twin)
        .environment(registry)
        .environment(avatar)
        .environment(production)
        .environment(checkout)
        .environment(bridge)
        .environment(mimic)
        .environment(conversation)
        .environment(storyboards)
        .environment(stage)
        .environment(localRender)
        .environment(cloud)
        .preferredColorScheme(.dark)
        // The heartbeat mutates four observed collections every 900ms, which
        // invalidates most of the view tree. It has no business running while
        // the app is off screen.
        // The heartbeat and the 50 Hz rig loop both have no business running
        // while the app is off screen.
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                engine.startTicking()
                stage.start()
            } else {
                engine.stopTicking()
                stage.stop()
            }
        }
        .task {
            engine.startTicking()
            // Every function call from anywhere in the app now moves the rig.
            stage.attach(registry: registry)
            stage.start()
            cloud.attach(registry: registry, twin: twin, avatar: avatar)
            conversation.attach(
                engine: engine,
                twin: twin,
                registry: registry,
                production: production,
                bridge: bridge
            )
            if let user = auth.user {
                await cloud.signedIn(as: user)
            }
        }
    }
}

/// Shown for the moment it takes to work out whether there is a live session.
struct LaunchView: View {
    var body: some View {
        ZStack {
            NeuralBackground()
            VStack(spacing: 18) {
                TwinOrb(diameter: 120)
                ProgressView()
                    .tint(Theme.magenta)
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
}
