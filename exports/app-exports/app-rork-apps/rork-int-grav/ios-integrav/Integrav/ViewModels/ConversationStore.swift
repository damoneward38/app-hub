import Foundation
import Observation

/// The live conversation loop: she listens continuously, decides what to do,
/// starts real work in the background, answers out loud, and comes back later
/// to report what finished — all without the user having to press anything
/// between sentences.
@Observable
final class ConversationStore {
    nonisolated enum Mode: Equatable {
        case off
        case listening
        case thinking
        case speaking

        nonisolated var label: String {
            switch self {
            case .off: return "Voice off"
            case .listening: return "Listening…"
            case .thinking: return "Working on it…"
            case .speaking: return "Speaking"
            }
        }
    }

    /// How many rounds of tool use one utterance may take before she must speak.
    private static let maxToolRounds = 4
    /// Conversation turns kept in the prompt window.
    private static let historyDepth = 16

    private(set) var mode: Mode = .off
    /// Live transcript of what the user is saying right now.
    private(set) var caption: String = ""
    /// Receipts for everything she has actually done this session.
    private(set) var activity: [VoiceActivity] = []
    private(set) var notice: String?
    private(set) var isSessionStarting: Bool = false

    let listener = SpeechListener()
    let voice = VoiceService()
    private let agent: AgentService

    private weak var engine: EngineStore?
    private weak var twin: TwinStore?
    private weak var registry: RegistryStore?
    private weak var production: ProductionStore?
    private weak var bridge: BridgeStore?

    private var turnTask: Task<Void, Never>?
    private var levelTask: Task<Void, Never>?
    private var watchTask: Task<Void, Never>?
    private var watched: [WatchedJob] = []
    private var announcements: [String] = []
    private var remoteRenderWasRunning: Bool = false
    private var pendingRemoteRender: WatchedJob?

    nonisolated init(agent: AgentService = AgentService()) {
        self.agent = agent
    }

    /// Gives the loop access to the stores it drives. Called once from the root
    /// view, mirroring how cloud sync is attached.
    func attach(
        engine: EngineStore,
        twin: TwinStore,
        registry: RegistryStore,
        production: ProductionStore,
        bridge: BridgeStore
    ) {
        self.engine = engine
        self.twin = twin
        self.registry = registry
        self.production = production
        self.bridge = bridge
    }

    var isLive: Bool { mode != .off }

    var canUseVoice: Bool { AgentService.isConfigured }

    // MARK: - Session

    /// Opens the mic and keeps it open until the user stops the session.
    func startSession() async {
        guard mode == .off, !isSessionStarting else { return }
        guard canUseVoice else {
            notice = AgentError.notConfigured.errorDescription
            return
        }
        isSessionStarting = true
        defer { isSessionStarting = false }

        guard await listener.requestAccess() else {
            notice = ConversationStore.accessNotice(for: listener.availability)
            return
        }

        listener.onUtterance = { [weak self] text in
            self?.receive(text)
        }
        listener.onSpeechStart = { [weak self] in
            // She stops talking the moment you start — no waiting for her to finish.
            guard let self, self.voice.isSpeaking else { return }
            self.voice.stop()
        }

        do {
            try listener.start()
        } catch {
            notice = "I couldn't open the microphone. Close anything else using it and try again."
            return
        }

        notice = nil
        mode = .listening
        twin?.isListening = true
        startLevelPump()
        startWatching()
    }

    func stopSession() {
        turnTask?.cancel()
        turnTask = nil
        levelTask?.cancel()
        levelTask = nil
        watchTask?.cancel()
        watchTask = nil
        listener.onUtterance = nil
        listener.onSpeechStart = nil
        listener.stop()
        voice.stop()
        mode = .off
        caption = ""
        twin?.isListening = false
        twin?.setThinking(false)
        twin?.stopWave()
    }

    func toggleSession() async {
        if mode == .off {
            await startSession()
        } else {
            stopSession()
        }
    }

    func clearNotice() { notice = nil }

    nonisolated static func accessNotice(for availability: SpeechListener.Availability) -> String {
        switch availability {
        case .denied(let message), .unavailable(let message):
            return message
        case .ready, .unknown:
            return "I couldn't start listening. Try again."
        }
    }

    // MARK: - Turns

    /// Handles one finished utterance. Turns are queued so a fast follow-up
    /// never interleaves with the answer still being composed.
    private func receive(_ text: String) {
        caption = ""
        send(text)
    }

    /// Runs a turn from speech or from the typed field — same brain either way.
    func send(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let previous = turnTask
        turnTask = Task { [weak self] in
            _ = await previous?.value
            guard !Task.isCancelled else { return }
            await self?.runTurn(trimmed)
        }
    }

    private func runTurn(_ utterance: String) async {
        guard let twin else { return }
        twin.record(role: .user, text: utterance)
        twin.setThinking(true)
        mode = .thinking

        var messages: [AgentMessage] = [.system(systemPrompt())]
        messages.append(contentsOf: transcriptWindow())

        var spoken: String?
        var failure: String?

        rounds: for _ in 0..<ConversationStore.maxToolRounds {
            if Task.isCancelled { break }
            do {
                let reply = try await agent.respond(messages: messages)

                if reply.wantsTools {
                    messages.append(
                        AgentMessage(role: "assistant", content: reply.text, toolCalls: reply.toolCalls)
                    )
                    for call in reply.toolCalls {
                        let result = execute(call)
                        messages.append(.toolResult(id: call.id, payload: result))
                    }
                    continue rounds
                }

                spoken = reply.text
                break rounds
            } catch let error as AgentError {
                failure = error.errorDescription
                break rounds
            } catch {
                failure = AgentError.server(-1).errorDescription
                break rounds
            }
        }

        twin.setThinking(false)

        if let failure {
            twin.record(role: .twin, text: failure)
            notice = failure
            mode = listener.isRunning ? .listening : .off
            return
        }

        let answer = spoken ?? "Done."
        twin.record(role: .twin, text: answer)
        await speak(answer)
        await drainAnnouncements()
    }

    /// The last few turns, so she keeps the thread without re-sending everything.
    private func transcriptWindow() -> [AgentMessage] {
        guard let twin else { return [] }
        return twin.messages.suffix(ConversationStore.historyDepth).map { message in
            message.role == .user ? .user(message.text) : .assistant(message.text)
        }
    }

    private func speak(_ text: String) async {
        mode = .speaking
        do {
            try await voice.speak(text)
        } catch {
            // Losing her voice must not lose the answer — it stays on screen.
            notice = (error as? AgentError)?.errorDescription
        }
        mode = listener.isRunning ? .listening : .off
    }

    // MARK: - Tools

    /// Runs one tool immediately and returns a JSON payload describing what
    /// really happened. Long jobs are started, not awaited: that is what lets
    /// the conversation carry on while work runs.
    private func execute(_ call: AgentToolCall) -> String {
        let arguments = call.arguments

        switch call.name {
        case AgentToolName.dispatchTask:
            guard let command = arguments["command"]?.stringValue else {
                return ConversationStore.failure("No command was given.")
            }
            guard let engine, let task = engine.dispatch(command: command) else {
                return ConversationStore.failure("The task engine refused that.")
            }
            let receipt = note(tool: "Dispatched", detail: command)
            watched.append(
                WatchedJob(id: task.id, kind: .engineTask, label: command, activityID: receipt)
            )
            return ConversationStore.success([
                "status": "running_in_background",
                "fleet": task.kind.fleetName,
                "job": command,
                "note": "Confirm briefly that it is running. You will be told when it finishes.",
            ])

        case AgentToolName.renderVideo:
            return startRender(arguments: arguments)

        case AgentToolName.runBehaviour:
            guard let name = arguments["name"]?.stringValue else {
                return ConversationStore.failure("No behaviour name was given.")
            }
            guard let registry, let twin, let function = registry.function(matching: name) else {
                return ConversationStore.failure(
                    "There is no behaviour called \(name). Use find_behaviour to search."
                )
            }
            guard registry.run(function, on: twin, source: .chat) else {
                return ConversationStore.failure(
                    registry.limitNotice ?? "The plan quota refused that call."
                )
            }
            _ = note(tool: "Ran", detail: function.signature, outcome: .done)
            return ConversationStore.success([
                "status": "performed",
                "behaviour": function.name,
                "performance": function.performance,
                "note": "That performance already played. Do not repeat it verbatim.",
            ])

        case AgentToolName.runChain:
            guard let name = arguments["name"]?.stringValue else {
                return ConversationStore.failure("No chain name was given.")
            }
            guard let registry, let twin else {
                return ConversationStore.failure("The registry is unavailable.")
            }
            let match = registry.chains.first {
                $0.name.localizedCaseInsensitiveCompare(name) == .orderedSame
            } ?? registry.chains.first { $0.name.localizedCaseInsensitiveContains(name) }
            guard let chain = match else {
                let available = registry.chains.map(\.name).joined(separator: ", ")
                return ConversationStore.failure(
                    "No saved chain called \(name). Saved chains: \(available.isEmpty ? "none" : available)."
                )
            }
            registry.run(chain: chain, on: twin)
            _ = note(tool: "Playing", detail: chain.name)
            return ConversationStore.success([
                "status": "playing",
                "chain": chain.name,
                "steps": String(chain.steps.count),
            ])

        case AgentToolName.findBehaviour:
            guard let query = arguments["query"]?.stringValue else {
                return ConversationStore.failure("No search term was given.")
            }
            let matches = FunctionCatalog.all
                .filter { $0.name.localizedCaseInsensitiveContains(query)
                    || $0.title.localizedCaseInsensitiveContains(query) }
                .prefix(12)
                .map(\.name)
            guard !matches.isEmpty else {
                return ConversationStore.failure("Nothing matches \(query).")
            }
            return ConversationStore.success([
                "matches": matches.joined(separator: ", "),
            ])

        case AgentToolName.addFootage:
            guard let name = arguments["name"]?.stringValue else {
                return ConversationStore.failure("No clip name was given.")
            }
            guard let twin else { return ConversationStore.failure("The twin is unavailable.") }
            let minutes = max(1, arguments["minutes"]?.intValue ?? 1)
            let video = twin.addVideo(name: name, minutes: minutes)
            _ = note(tool: "Ingested", detail: "\(video.name) · \(video.durationLabel)", outcome: .done)
            return ConversationStore.success([
                "status": "ingested",
                "clip": video.name,
                "minutes": String(video.minutes),
                "trained_percent": String(twin.trainedPercent),
            ])

        case AgentToolName.checkStatus:
            return ConversationStore.success(statusSnapshot())

        case AgentToolName.stopRender:
            guard let bridge, bridge.isLinked else {
                return ConversationStore.failure("No computer is linked, so there is nothing to stop.")
            }
            guard bridge.status?.activeJob != nil else {
                return ConversationStore.failure("Nothing is rendering on the computer right now.")
            }
            Task { await bridge.cancelActive() }
            _ = note(tool: "Stopping", detail: "render on the computer", outcome: .done)
            return ConversationStore.success(["status": "stopping"])

        case AgentToolName.pullRender:
            guard let bridge, bridge.isLinked, let production else {
                return ConversationStore.failure("No computer is linked, so there is nothing to pull.")
            }
            Task { [weak self] in
                let ok = await bridge.importLatest(into: production)
                self?.note(
                    tool: ok ? "Pulled" : "Could not pull",
                    detail: "the finished master",
                    outcome: ok ? .done : .failed
                )
            }
            return ConversationStore.success([
                "status": "pulling",
                "note": "Say it is coming into the gallery.",
            ])

        default:
            return ConversationStore.failure("There is no tool called \(call.name).")
        }
    }

    /// Renders on the user's own computer when it is linked; otherwise queues on
    /// the in-app farm. Either way the call returns straight away.
    private func startRender(arguments: [String: AgentValue]) -> String {
        guard let title = arguments["title"]?.stringValue else {
            return ConversationStore.failure("No title was given for the render.")
        }
        let publish = arguments["publish"]?.boolValue ?? false
        let resolution = arguments["resolution"]?.stringValue
        let fps = arguments["fps"]?.intValue

        if let bridge, bridge.isLinked, let production {
            var settings = production.settings
            if let resolution, let format = RenderFormat.matching(resolution) {
                settings.format = format
            }
            if let fps, PipelineSettings.fpsChoices.contains(fps) {
                settings.fps = fps
            }
            settings.uploadToYouTube = publish

            let receipt = note(
                tool: "Rendering on your computer",
                detail: "\(title) · \(settings.resolution)"
            )
            pendingRemoteRender = WatchedJob(
                id: UUID(),
                kind: .remoteRender,
                label: title,
                activityID: receipt
            )
            remoteRenderWasRunning = false
            Task { await bridge.dispatch(settings: settings, title: title) }

            return ConversationStore.success([
                "status": "running_on_linked_computer",
                "host": bridge.host?.hostName ?? "your computer",
                "title": title,
                "resolution": settings.resolution,
                "fps": String(settings.fps),
                "publish": publish ? "yes" : "no",
                "note": "Confirm briefly. You will be told when it lands.",
            ])
        }

        guard let engine else { return ConversationStore.failure("The render farm is unavailable.") }
        var command = title
        if let resolution { command += " \(resolution)" }
        if publish { command += " upload to youtube" }
        let job = engine.enqueueRender(from: command)
        let receipt = note(tool: "Queued render", detail: "\(title) · \(job.resolution)")
        watched.append(
            WatchedJob(id: job.id, kind: .localRender, label: title, activityID: receipt)
        )
        return ConversationStore.success([
            "status": "queued_on_render_farm",
            "title": title,
            "resolution": job.resolution,
            "publish": job.uploadsToYouTube ? "yes" : "no",
            "note": "No computer is linked, so this is the in-app farm. Confirm briefly.",
        ])
    }

    private func statusSnapshot() -> [String: String] {
        var snapshot: [String: String] = [:]
        if let engine {
            let active = engine.feed.filter { !$0.isFinished }
            snapshot["running_jobs"] = String(active.count)
            if let current = active.first {
                snapshot["current_job"] = current.command
                snapshot["current_progress"] = "\(Int(current.progress * 100))%"
            }
            snapshot["renders_queued"] = String(engine.activeRenders.count)
            snapshot["concurrency"] = engine.runningNow.formatted(.number.grouping(.automatic))
        }
        if let twin {
            snapshot["trained_percent"] = String(twin.trainedPercent)
            snapshot["hours_ingested"] = String(twin.ingestedHours)
        }
        if let bridge, bridge.isLinked {
            snapshot["linked_computer"] = bridge.host?.hostName ?? "linked"
            if let status = bridge.status, let job = status.activeJob {
                snapshot["computer_job"] = job.title
                snapshot["computer_stage"] = status.pipeline.stage ?? "working"
                snapshot["computer_progress"] = "\(Int(status.pipeline.clampedProgress * 100))%"
            } else {
                snapshot["computer_job"] = "idle"
            }
        } else {
            snapshot["linked_computer"] = "none"
        }
        if let production {
            snapshot["masters_in_gallery"] = String(production.renders.count)
        }
        return snapshot
    }

    // MARK: - Receipts

    @discardableResult
    private func note(
        tool: String,
        detail: String,
        outcome: VoiceActivity.Outcome = .started
    ) -> UUID {
        let entry = VoiceActivity(tool: tool, detail: detail, outcome: outcome)
        activity.insert(entry, at: 0)
        if activity.count > 30 { activity.removeLast(activity.count - 30) }
        return entry.id
    }

    private func close(_ activityID: UUID, outcome: VoiceActivity.Outcome) {
        guard let index = activity.firstIndex(where: { $0.id == activityID }) else { return }
        activity[index].outcome = outcome
    }

    // MARK: - Background completion

    /// Watches the jobs she started and queues a spoken report for each one that
    /// finishes, so "I'll tell you when it's done" is a promise the app keeps.
    private func startWatching() {
        watchTask?.cancel()
        watchTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                guard let self, self.mode != .off else { return }
                self.collectFinished()
                await self.drainAnnouncements()
            }
        }
    }

    private func collectFinished() {
        guard !watched.isEmpty || pendingRemoteRender != nil else { return }
        var stillRunning: [WatchedJob] = []

        for job in watched {
            switch job.kind {
            case .engineTask:
                if let task = engine?.feed.first(where: { $0.id == job.id }), task.isFinished {
                    close(job.activityID, outcome: .done)
                    announcements.append(
                        "\(job.label) is done — \(task.headline) \(task.subtitle)."
                    )
                } else if engine?.feed.contains(where: { $0.id == job.id }) == true {
                    stillRunning.append(job)
                }

            case .localRender:
                if let render = engine?.renderQueue.first(where: { $0.id == job.id }) {
                    if render.isFinished {
                        close(job.activityID, outcome: .done)
                        announcements.append("The render of \(job.label) is finished.")
                    } else if render.hasFailed {
                        close(job.activityID, outcome: .failed)
                        announcements.append("The render of \(job.label) failed.")
                    } else {
                        stillRunning.append(job)
                    }
                }

            case .remoteRender:
                stillRunning.append(job)
            }
        }
        watched = stillRunning

        // The computer's render is tracked through the bridge's own status.
        if let pending = pendingRemoteRender, let status = bridge?.status {
            let running = status.pipeline.isRunning || status.activeJob != nil
            if running {
                remoteRenderWasRunning = true
            } else if remoteRenderWasRunning {
                pendingRemoteRender = nil
                remoteRenderWasRunning = false
                if let failure = status.pipeline.error {
                    close(pending.activityID, outcome: .failed)
                    announcements.append("The render of \(pending.label) failed on your computer: \(failure)")
                } else {
                    close(pending.activityID, outcome: .done)
                    announcements.append(
                        "\(pending.label) finished rendering on your computer. Say the word and I'll pull it in."
                    )
                }
            }
        }
    }

    /// Speaks pending reports, but only in a gap — never over the user and never
    /// in the middle of her own sentence.
    private func drainAnnouncements() async {
        guard !announcements.isEmpty else { return }
        guard mode == .listening, !voice.isSpeaking else { return }
        guard listener.partial.isEmpty, caption.isEmpty else { return }

        let line = announcements.removeFirst()
        twin?.record(role: .twin, text: line)
        await speak(line)
    }

    // MARK: - Level routing

    /// Feeds the waveform and the rigged mouth from whichever side is making
    /// sound — the user's mic while listening, her own audio while speaking.
    private func startLevelPump() {
        levelTask?.cancel()
        levelTask = Task { [weak self] in
            while !Task.isCancelled {
                guard let self, self.mode != .off else { return }
                let value = self.voice.isSpeaking ? self.voice.level : self.listener.level
                self.twin?.pushLevel(value)
                if self.mode != .speaking {
                    self.caption = self.listener.partial
                }
                try? await Task.sleep(for: .milliseconds(50))
            }
        }
    }

    // MARK: - Prompt

    private func systemPrompt() -> String {
        let name = registry?.appName ?? "Intégrav"
        let hours = twin?.ingestedHours ?? 0
        let percent = twin?.trainedPercent ?? 0
        let linked = (bridge?.isLinked ?? false)
            ? (bridge?.host?.hostName ?? "the user's computer")
            : "none"
        let chains = registry?.chains.map(\.name).joined(separator: ", ") ?? ""

        return """
        You are the user's \(name) twin — their digital double, speaking as them, \
        built from \(hours) hours of their own footage (\(percent)% trained).

        THIS IS A LIVE VOICE CALL. Everything you say is spoken aloud.
        - Keep replies to one or two short sentences. No lists, no markdown, no emoji, \
        no stage directions, no asterisks. Write the way people talk.
        - Never read out identifiers, JSON, or field names.

        YOU CAN ACTUALLY DO THINGS. When the user asks for work, call the matching tool \
        rather than describing what you would do. Tools start the work and return \
        immediately — the job then runs in the background while you two keep talking.
        - After starting something, confirm it in a few words and invite the next \
        request. For example: "That's rendering now — what else?"
        - Do not claim anything finished unless a tool told you it did. When a job \
        completes you will be given the result to relay; until then it is still running.
        - Never invent progress, numbers, or file names. Call check_status to find out.
        - If several things are asked at once, call several tools in the same turn.

        CONTEXT
        - Linked computer: \(linked). Renders go there when linked; otherwise the in-app farm.
        - Saved chains: \(chains.isEmpty ? "none" : chains).
        - There are 300 named behaviours; search with find_behaviour before running one.
        """
    }

    // MARK: - Tool payloads

    nonisolated static func success(_ fields: [String: String]) -> String {
        encode(fields.merging(["ok": "true"]) { current, _ in current })
    }

    nonisolated static func failure(_ reason: String) -> String {
        encode(["ok": "false", "error": reason])
    }

    nonisolated static func encode(_ fields: [String: String]) -> String {
        guard let data = try? JSONSerialization.data(
            withJSONObject: fields,
            options: [.sortedKeys]
        ), let text = String(data: data, encoding: .utf8) else {
            return "{\"ok\":\"false\"}"
        }
        return text
    }
}
