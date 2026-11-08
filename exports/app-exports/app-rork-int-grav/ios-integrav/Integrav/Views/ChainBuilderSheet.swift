import SwiftUI

/// Chain editor: order the steps, name the routine, save it, and hand it to the
/// twin to perform end to end.
struct ChainBuilderSheet: View {
    @Environment(RegistryStore.self) private var registry
    @Environment(\.dismiss) private var dismiss

    /// Called with the chain that should play on the live twin screen.
    let onRun: (FunctionChain) -> Void

    /// Set when an existing routine was opened for editing — saving then updates
    /// that chain in place instead of creating a duplicate.
    var editing: FunctionChain?

    @State private var chainName: String = ""
    @State private var savedFlash: Bool = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.canvas.ignoresSafeArea()

                VStack(spacing: 0) {
                    nameField
                        .padding(.horizontal, 18)
                        .padding(.top, 6)
                        .padding(.bottom, 12)

                    if registry.draft.isEmpty {
                        emptyState
                    } else {
                        stepList
                    }

                    actions
                        .padding(.horizontal, 18)
                        .padding(.top, 10)
                        .padding(.bottom, 8)
                }
            }
            .navigationTitle(editing == nil ? "Build chain" : "Edit chain")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Theme.surface, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(Theme.textSecondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Clear") {
                        Haptics.tap()
                        withAnimation(.snappy) { registry.clearDraft() }
                    }
                    .foregroundStyle(registry.draft.isEmpty ? Theme.textSecondary.opacity(0.5) : Theme.magenta)
                    .disabled(registry.draft.isEmpty)
                }
            }
        }
        .presentationDetents([.large])
        .presentationContentInteraction(.scrolls)
        .presentationBackground(Theme.canvas)
        .preferredColorScheme(.dark)
        .onAppear {
            if let editing, chainName.isEmpty { chainName = editing.name }
        }
    }

    // MARK: - Pieces

    private var nameField: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Text("ROUTINE NAME")
                    .font(.caption.weight(.bold))
                    .kerning(1.2)
                    .foregroundStyle(Theme.textSecondary)

                Spacer(minLength: 0)

                Text("\(registry.draft.count) / \(registry.plan.maxChainSteps)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundStyle(registry.draftHeadroom == 0 ? Theme.warning : Theme.textSecondary)

                Text(registry.plan.title.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .kerning(0.8)
                    .foregroundStyle(Theme.violet)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(Theme.violet.opacity(0.16)))
            }

            TextField(
                "",
                text: $chainName,
                prompt: Text("Warm open, Board demo…").foregroundStyle(Theme.textSecondary)
            )
            .textFieldStyle(.plain)
            .foregroundStyle(Theme.textPrimary)
            .padding(.horizontal, 16)
            .frame(height: 50)
            .background(Capsule().fill(Theme.surface))
            .overlay(Capsule().strokeBorder(Theme.border, lineWidth: 1))
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "link.badge.plus")
                .font(.system(size: 34))
                .foregroundStyle(Theme.magenta)
            Text("No steps yet")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
            Text("Add functions from the registry and they stack here in order.")
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var stepList: some View {
        List {
            ForEach(Array(registry.draftFunctions.enumerated()), id: \.element.id) { index, fn in
                ChainStepRow(step: index + 1, function: fn)
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                    .listRowInsets(EdgeInsets(top: 4, leading: 18, bottom: 4, trailing: 18))
            }
            .onMove { source, destination in
                registry.moveDraft(from: source, to: destination)
            }
            .onDelete { offsets in
                Haptics.tap()
                registry.removeDraft(at: offsets)
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .environment(\.editMode, .constant(.active))
    }

    private var actions: some View {
        VStack(spacing: 10) {
            Button(action: save) {
                Text(savedFlash ? "Saved" : (editing == nil ? "Save chain" : "Update chain"))
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(savedFlash ? Theme.success : Theme.magenta)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Capsule().fill(Theme.surface))
                    .overlay(Capsule().strokeBorder(
                        (savedFlash ? Theme.success : Theme.magenta).opacity(0.7),
                        lineWidth: 1.4
                    ))
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(registry.draft.isEmpty)
            .opacity(registry.draft.isEmpty ? 0.5 : 1)

            Button {
                Haptics.fire()
                let chain = FunctionChain(
                    id: editing?.id ?? UUID(),
                    name: chainName.isEmpty ? (editing?.name ?? "Untitled chain") : chainName,
                    steps: registry.draft
                )
                onRun(chain)
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "play.fill")
                    Text("Run on twin · \(registry.draft.count)")
                        .monospacedDigit()
                }
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Theme.canvas)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(Capsule().fill(Theme.accentGradient))
                .glow(Theme.magenta, radius: 18, opacity: 0.55)
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(registry.draft.isEmpty)
            .opacity(registry.draft.isEmpty ? 0.5 : 1)
        }
    }

    /// Saves a new routine, or writes the edits back to the one being edited.
    private func save() {
        if let editing {
            registry.update(editing, steps: registry.draft)
            registry.rename(editing, to: chainName.isEmpty ? editing.name : chainName)
        } else {
            guard registry.saveDraft(as: chainName) != nil else { return }
            chainName = ""
        }
        Haptics.success()
        withAnimation(.snappy) { savedFlash = true }
        Task {
            try? await Task.sleep(for: .seconds(1.6))
            withAnimation(.easeOut) { savedFlash = false }
        }
    }
}

/// One numbered step inside the chain editor.
struct ChainStepRow: View {
    let step: Int
    let function: AvatarFunction

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .strokeBorder(Theme.magenta.opacity(0.6), lineWidth: 1.2)
                Text("\(step)")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundStyle(Theme.magenta)
            }
            .frame(width: 30, height: 30)

            VStack(alignment: .leading, spacing: 2) {
                Text(function.signature)
                    .font(.system(size: 15, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Theme.textPrimary)
                Text(function.category.title)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(function.category.accent)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .integravCard()
    }
}
