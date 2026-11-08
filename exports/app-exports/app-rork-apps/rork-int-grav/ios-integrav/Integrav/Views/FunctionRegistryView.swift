import SwiftUI

/// Modal destinations in the registry. Stacked `sheet(isPresented:)` modifiers
/// leave only the last one alive, so both live behind one `sheet(item:)`.
enum RegistrySheet: String, Identifiable {
    case builder
    case callLog

    var id: String { rawValue }
}

/// The registry: every avatar behaviour Intégrav can run, searchable by name or
/// hotkey, runnable on its own, or stacked into a chain the twin performs.
struct FunctionRegistryView: View {
    @Environment(RegistryStore.self) private var registry
    @Environment(TwinStore.self) private var twin

    @State private var hotkeyDraft: String = ""
    @State private var sheet: RegistrySheet?
    @State private var showsLiveTwin: Bool = false
    @State private var isGrid: Bool = true
    @State private var editingChain: FunctionChain?
    @State private var renamingChain: FunctionChain?
    @State private var renameDraft: String = ""
    @FocusState private var searchFocused: Bool

    var body: some View {
        @Bindable var registry = registry

        NavigationStack {
            ZStack {
                NeuralBackground()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        header
                        callBar(registry: $registry)
                        categoryChips(registry: $registry)
                        savedChains
                        functionList
                    }
                    .padding(.horizontal, 18)
                    .padding(.top, 4)
                    .padding(.bottom, 26)
                }
                .scrollIndicators(.hidden)
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .navigationBar)
            .safeAreaInset(edge: .bottom) { chainDock }
        }
        .tint(Theme.magenta)
        .sheet(item: $sheet) { destination in
            switch destination {
            case .builder:
                ChainBuilderSheet(
                    onRun: { chain in
                        registry.pendingChain = chain
                        sheet = nil
                        // The cover can only take over once the sheet has
                        // finished dismissing; presenting both at once leaves
                        // the screen stuck behind a half-torn-down sheet.
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                            showsLiveTwin = true
                        }
                    },
                    editing: editingChain
                )
                .id(editingChain?.id)
            case .callLog:
                CallLogSheet()
            }
        }
        .alert("Rename chain", isPresented: Binding(
            get: { renamingChain != nil },
            set: { if !$0 { renamingChain = nil } }
        )) {
            TextField("Routine name", text: $renameDraft)
            Button("Rename") {
                if let renamingChain { registry.rename(renamingChain, to: renameDraft) }
                renamingChain = nil
            }
            Button("Cancel", role: .cancel) { renamingChain = nil }
        }
        .fullScreenCover(isPresented: $showsLiveTwin) {
            TwinPreviewView()
        }
        .overlay(alignment: .top) {
            if let notice = registry.limitNotice {
                LimitBanner(text: notice)
                    .padding(.horizontal, 18)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .task {
                        try? await Task.sleep(for: .seconds(2.6))
                        withAnimation(.easeOut) { registry.limitNotice = nil }
                    }
            }
        }
        .animation(.snappy, value: registry.limitNotice)
    }

    // MARK: - Header

    private var header: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("FUNCTION REGISTRY")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.magenta)

                Text("\(registry.functions.count) avatar behaviours")
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary)

                Text("Call one by name, press its hotkey, or chain them into a routine your twin performs.")
                    .font(.subheadline)
                    .foregroundStyle(Theme.textSecondary)
            }

            Spacer(minLength: 0)

            Button {
                Haptics.tap()
                sheet = .callLog
            } label: {
                VStack(spacing: 3) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 16, weight: .semibold))
                    Text("\(registry.callLog.count)")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                }
                .foregroundStyle(Theme.magenta)
                .frame(width: 52, height: 52)
                .background(Circle().fill(Theme.surface))
                .overlay(Circle().strokeBorder(Theme.magenta.opacity(0.45), lineWidth: 1))
            }
            .buttonStyle(PressableButtonStyle())
            .accessibilityLabel("Call log")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    // MARK: - Search + hotkey

    private func callBar(registry: Bindable<RegistryStore>) -> some View {
        HStack(spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Theme.textSecondary)
                TextField(
                    "",
                    text: registry.query,
                    prompt: Text("Search functions…").foregroundStyle(Theme.textSecondary)
                )
                .textFieldStyle(.plain)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .foregroundStyle(Theme.textPrimary)
                .font(.system(.subheadline, design: .monospaced))
                .focused($searchFocused)

                if !registry.wrappedValue.query.isEmpty {
                    Button {
                        registry.wrappedValue.query = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.textSecondary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
            .frame(height: 50)
            .background(Capsule().fill(Theme.surface))
            .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))

            HStack(spacing: 0) {
                TextField(
                    "",
                    text: $hotkeyDraft,
                    prompt: Text("#").foregroundStyle(Theme.textSecondary)
                )
                .textFieldStyle(.plain)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .font(.system(.subheadline, design: .monospaced).weight(.bold))
                .foregroundStyle(Theme.magenta)
                .frame(width: 54)
                .submitLabel(.go)
                .onSubmit(runHotkey)

                Button(action: runHotkey) {
                    Image(systemName: "play.fill")
                        .font(.footnote.weight(.bold))
                        .foregroundStyle(Theme.textPrimary)
                        .frame(width: 38, height: 50)
                }
                .buttonStyle(PressableButtonStyle())
                .accessibilityLabel("Run hotkey")
            }
            .background(Capsule().fill(Theme.surface))
            .overlay(Capsule().strokeBorder(Theme.magenta.opacity(0.65), lineWidth: 1))
        }
    }

    private func runHotkey() {
        guard let fn = registry.function(matching: hotkeyDraft) else { return }
        hotkeyDraft = ""
        fire(fn, source: .hotkey)
    }

    // MARK: - Categories

    private func categoryChips(registry: Bindable<RegistryStore>) -> some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                CategoryChip(
                    label: "All",
                    symbol: "square.grid.2x2.fill",
                    count: self.registry.functions.count,
                    tint: Theme.magenta,
                    isOn: self.registry.category == nil && !self.registry.likedOnly
                ) {
                    Haptics.tap()
                    registry.wrappedValue.category = nil
                    registry.wrappedValue.likedOnly = false
                }

                CategoryChip(
                    label: "Liked",
                    symbol: "heart.fill",
                    count: self.registry.likes.count,
                    tint: Theme.magenta,
                    isOn: self.registry.likedOnly
                ) {
                    Haptics.tap()
                    withAnimation(.snappy) { registry.wrappedValue.likedOnly.toggle() }
                }

                ForEach(FunctionCategory.allCases) { category in
                    CategoryChip(
                        label: category.chip,
                        symbol: category.symbol,
                        count: self.registry.count(in: category),
                        tint: category.accent,
                        isOn: self.registry.category == category
                    ) {
                        Haptics.tap()
                        registry.wrappedValue.category = self.registry.category == category ? nil : category
                    }
                }
            }
        }
        .scrollIndicators(.hidden)
        .contentMargins(.horizontal, 0, for: .scrollContent)
    }

    // MARK: - Saved chains

    private var savedChains: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("SAVED CHAINS")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)
                Spacer()
                Text("\(registry.chains.count)")
                    .font(.caption.weight(.bold).monospacedDigit())
                    .foregroundStyle(Theme.magenta)
            }

            if registry.chains.isEmpty {
                Text("No chains yet. Tap functions below to stack one.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .integravCard()
            } else {
                ScrollView(.horizontal) {
                    HStack(spacing: 12) {
                        ForEach(registry.chains) { chain in
                            ChainCard(
                                chain: chain,
                                isRunning: registry.runningChain?.id == chain.id,
                                onRun: {
                                    Haptics.fire()
                                    registry.pendingChain = chain
                                    showsLiveTwin = true
                                },
                                onEdit: {
                                    Haptics.tap()
                                    registry.load(chain)
                                    editingChain = chain
                                    sheet = .builder
                                },
                                onRename: {
                                    renameDraft = chain.name
                                    renamingChain = chain
                                },
                                onDelete: {
                                    withAnimation(.snappy) { registry.delete(chain) }
                                }
                            )
                        }
                    }
                    .padding(.vertical, 2)
                }
                .scrollIndicators(.hidden)
            }
        }
    }

    // MARK: - Function list

    private var functionList: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Text(registry.category?.title.uppercased() ?? (registry.likedOnly ? "LIKED" : "ALL FUNCTIONS"))
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)

                Spacer()

                Text("\(registry.filtered.count) shown")
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(Theme.textSecondary)

                layoutToggle
            }

            if registry.filtered.isEmpty {
                Text(emptyMessage)
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .integravCard()
            } else if isGrid {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], spacing: 8) {
                    ForEach(registry.filtered) { fn in
                        FunctionTile(
                            function: fn,
                            isChained: registry.isInDraft(fn),
                            isLiked: registry.isLiked(fn),
                            runCount: registry.runCount(for: fn),
                            onRun: { fire(fn) },
                            onChain: { chain(fn) },
                            onLike: { like(fn) }
                        )
                    }
                }
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(registry.filtered) { fn in
                        FunctionRow(
                            function: fn,
                            isChained: registry.isInDraft(fn),
                            isLiked: registry.isLiked(fn),
                            runCount: registry.runCount(for: fn),
                            onRun: { fire(fn) },
                            onChain: { chain(fn) },
                            onLike: { like(fn) }
                        )
                    }
                }
            }
        }
    }

    private var emptyMessage: String {
        if registry.likedOnly && registry.likes.isEmpty {
            return "Nothing liked yet. Long-press a function and tap Like to keep your favourites here."
        }
        return registry.query.isEmpty ? "Nothing here yet." : "Nothing matches “\(registry.query)”."
    }

    private var layoutToggle: some View {
        Button {
            Haptics.tap()
            withAnimation(.snappy(duration: 0.25)) { isGrid.toggle() }
        } label: {
            Image(systemName: isGrid ? "square.grid.3x3.fill" : "list.bullet")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(Theme.magenta)
                .frame(width: 30, height: 26)
                .background(Capsule().fill(Theme.surface))
                .overlay(Capsule().strokeBorder(Theme.magenta.opacity(0.4), lineWidth: 1))
        }
        .buttonStyle(PressableButtonStyle())
        .accessibilityLabel(isGrid ? "Switch to list" : "Switch to grid")
    }

    private func chain(_ fn: AvatarFunction) {
        Haptics.tap()
        withAnimation(.snappy(duration: 0.25)) { _ = registry.toggleDraft(fn) }
    }

    private func like(_ fn: AvatarFunction) {
        Haptics.tap()
        withAnimation(.snappy(duration: 0.25)) { registry.toggleLike(fn) }
    }

    private func fire(_ fn: AvatarFunction, source: CallSource = .registry) {
        Haptics.fire()
        searchFocused = false
        registry.run(fn, on: twin, source: source)
    }

    // MARK: - Chain dock

    @ViewBuilder
    private var chainDock: some View {
        VStack(spacing: 8) {
            if let lastRun = registry.lastRun, let fn = registry.function(named: lastRun) {
                HStack(spacing: 8) {
                    Image(systemName: "play.circle.fill")
                        .foregroundStyle(Theme.success)
                    Text("\(fn.signature) → sent to your twin")
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(Theme.textSecondary)
                        .lineLimit(1)
                    Spacer(minLength: 0)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Capsule().fill(Theme.surface.opacity(0.9)))
                .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }

            if !registry.draft.isEmpty {
                Button {
                    Haptics.tap()
                    editingChain = nil
                    sheet = .builder
                } label: {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Theme.accentGradient)
                            Text("\(registry.draft.count)")
                                .font(.footnote.weight(.bold).monospacedDigit())
                                .foregroundStyle(Theme.canvas)
                        }
                        .frame(width: 30, height: 30)

                        VStack(alignment: .leading, spacing: 1) {
                            Text("Chain in progress")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Theme.textPrimary)
                            Text(registry.draftFunctions.map(\.name).joined(separator: " → "))
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundStyle(Theme.textSecondary)
                                .lineLimit(1)
                        }

                        Spacer(minLength: 0)

                        Text("Open")
                            .font(.footnote.weight(.bold))
                            .foregroundStyle(Theme.canvas)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(Capsule().fill(Theme.accentGradient))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .fill(Theme.surfaceHigh)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.controlCorner, style: .continuous)
                            .strokeBorder(Theme.magenta.opacity(0.6), lineWidth: 1)
                    )
                    .glow(Theme.magenta, radius: 16, opacity: 0.35)
                }
                .buttonStyle(PressableButtonStyle())
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 6)
        .animation(.snappy(duration: 0.28), value: registry.draft)
        .animation(.easeOut(duration: 0.2), value: registry.lastRun)
    }
}

// MARK: - Rows & chips

/// One behaviour: hotkey, signature, category, and its two actions.
struct FunctionRow: View {
    let function: AvatarFunction
    let isChained: Bool
    let isLiked: Bool
    let runCount: Int
    let onRun: () -> Void
    let onChain: () -> Void
    let onLike: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Text(function.hotkey)
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
                .frame(width: 30, alignment: .leading)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(function.signature)
                        .font(.system(size: 15, weight: .semibold, design: .monospaced))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    if isLiked {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 9))
                            .foregroundStyle(Theme.magenta)
                    }
                }

                HStack(spacing: 6) {
                    Image(systemName: function.category.symbol)
                        .font(.system(size: 9, weight: .bold))
                    Text(function.category.chip)
                        .font(.system(size: 10, weight: .semibold))
                    if runCount > 0 {
                        Text("· ran \(runCount)×")
                            .font(.system(size: 10, weight: .medium).monospacedDigit())
                            .foregroundStyle(Theme.textSecondary)
                    }
                }
                .foregroundStyle(function.category.accent)
            }

            Spacer(minLength: 0)

            Button(action: onChain) {
                Image(systemName: isChained ? "checkmark" : "plus")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(isChained ? Theme.canvas : Theme.magenta)
                    .frame(width: 34, height: 34)
                    .background(
                        Circle().fill(isChained ? AnyShapeStyle(Theme.accentGradient) : AnyShapeStyle(Theme.surfaceHigh))
                    )
                    .overlay(Circle().strokeBorder(Theme.magenta.opacity(isChained ? 0 : 0.5), lineWidth: 1))
            }
            .buttonStyle(PressableButtonStyle())
            .accessibilityLabel(isChained ? "Remove \(function.name) from chain" : "Add \(function.name) to chain")

            Button(action: onRun) {
                Image(systemName: "play.fill")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .frame(width: 34, height: 34)
                    .background(Circle().fill(Theme.surfaceHigh))
                    .overlay(Circle().strokeBorder(Theme.border, lineWidth: 1))
            }
            .buttonStyle(PressableButtonStyle())
            .accessibilityLabel("Run \(function.name)")
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .integravCard(highlight: isChained)
        .contextMenu {
            Button(action: onLike) {
                Label(isLiked ? "Unlike" : "Like", systemImage: isLiked ? "heart.slash" : "heart")
            }
            Button(action: onChain) {
                Label(
                    isChained ? "Remove from chain" : "Add to chain",
                    systemImage: isChained ? "minus.circle" : "plus.circle"
                )
            }
        }
    }
}

/// Grid form of a behaviour — one key in the 300-button pad.
struct FunctionTile: View {
    let function: AvatarFunction
    let isChained: Bool
    let isLiked: Bool
    let runCount: Int
    let onRun: () -> Void
    let onChain: () -> Void
    let onLike: () -> Void

    var body: some View {
        Button(action: onRun) {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 4) {
                    Text(function.hotkey)
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundStyle(function.category.accent)

                    Spacer(minLength: 0)

                    if isLiked {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 8))
                            .foregroundStyle(Theme.magenta)
                    }
                    if isChained {
                        Image(systemName: "link")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(Theme.magenta)
                    }
                }

                Text(function.name)
                    .font(.system(size: 11, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Spacer(minLength: 0)

                Text(runCount > 0 ? "\(runCount)×" : function.category.chip)
                    .font(.system(size: 8, weight: .bold).monospacedDigit())
                    .foregroundStyle(runCount > 0 ? Theme.success : Theme.textSecondary)
                    .lineLimit(1)
            }
            .padding(10)
            .frame(height: 80, alignment: .topLeading)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isChained ? Theme.surfaceHigh : Theme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(
                        isChained ? Theme.magenta.opacity(0.7) : function.category.accent.opacity(0.22),
                        lineWidth: 1
                    )
            )
        }
        .buttonStyle(PressableButtonStyle())
        .accessibilityLabel("Run \(function.name)")
        .contextMenu {
            Button(action: onLike) {
                Label(isLiked ? "Unlike" : "Like", systemImage: isLiked ? "heart.slash" : "heart")
            }
            Button(action: onChain) {
                Label(
                    isChained ? "Remove from chain" : "Add to chain",
                    systemImage: isChained ? "minus.circle" : "plus.circle"
                )
            }
        }
    }
}

/// Filter pill for one function family.
struct CategoryChip: View {
    let label: String
    let symbol: String
    let count: Int
    let tint: Color
    let isOn: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: symbol)
                    .font(.system(size: 10, weight: .bold))
                Text(label)
                    .font(.footnote.weight(.semibold))
                Text("\(count)")
                    .font(.system(size: 10, weight: .bold).monospacedDigit())
                    .opacity(0.7)
            }
            .foregroundStyle(isOn ? Theme.canvas : tint)
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(
                Capsule().fill(isOn ? AnyShapeStyle(tint) : AnyShapeStyle(Theme.surface))
            )
            .overlay(Capsule().strokeBorder(tint.opacity(isOn ? 0 : 0.45), lineWidth: 1))
        }
        .buttonStyle(PressableButtonStyle())
    }
}

/// A saved routine, with run / edit / delete.
struct ChainCard: View {
    let chain: FunctionChain
    let isRunning: Bool
    let onRun: () -> Void
    let onEdit: () -> Void
    let onRename: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "link")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.magenta)
                Text(chain.name)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(1)
            }

            Text(chain.steps.joined(separator: " → "))
                .font(.system(size: 11, design: .monospaced))
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 8) {
                Text(chain.stepLabel)
                    .font(.system(size: 10, weight: .semibold).monospacedDigit())
                    .foregroundStyle(Theme.textSecondary)

                Spacer(minLength: 0)

                Button(action: onEdit) {
                    Image(systemName: "slider.horizontal.3")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.textSecondary)
                        .frame(width: 30, height: 30)
                        .background(Circle().fill(Theme.surfaceHigh))
                }
                .buttonStyle(PressableButtonStyle())
                .accessibilityLabel("Edit \(chain.name)")

                Button(action: onRun) {
                    HStack(spacing: 5) {
                        Image(systemName: isRunning ? "waveform" : "play.fill")
                            .font(.system(size: 10, weight: .bold))
                        Text(isRunning ? "Live" : "Run")
                            .font(.caption.weight(.bold))
                    }
                    .foregroundStyle(Theme.canvas)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(Capsule().fill(Theme.accentGradient))
                    .glow(Theme.magenta, radius: 10, opacity: 0.5)
                }
                .buttonStyle(PressableButtonStyle())
            }
        }
        .padding(14)
        .frame(width: 240, alignment: .leading)
        .integravCard(highlight: isRunning)
        .contextMenu {
            Button(action: onEdit) {
                Label("Edit steps", systemImage: "slider.horizontal.3")
            }
            Button(action: onRename) {
                Label("Rename", systemImage: "pencil")
            }
            Button(role: .destructive, action: onDelete) {
                Label("Delete chain", systemImage: "trash")
            }
        }
    }
}

extension FunctionCategory {
    /// Registry tint, drawn only from the Intégrav palette.
    var accent: Color {
        switch self {
        case .humor: return Theme.magenta
        case .presence: return Theme.violet
        case .voice: return Color(hex: 0xFDA4F5)
        case .expression: return Theme.warning
        case .motion: return Theme.success
        case .cognition: return Theme.violet
        case .modes: return Theme.magenta
        case .delivery: return Theme.success
        case .body: return Color(hex: 0xFDA4F5)
        case .concept: return Theme.warning
        }
    }
}
