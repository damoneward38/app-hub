import Foundation

// MARK: - Chat wire format

/// One message in the OpenAI-compatible conversation sent to the gateway.
/// Optional fields are omitted rather than sent as null, because some upstream
/// providers reject explicit nulls on `tool_calls` / `tool_call_id`.
nonisolated struct AgentMessage: Codable, Equatable, Sendable {
    let role: String
    let content: String?
    let toolCalls: [AgentToolCall]?
    let toolCallID: String?

    nonisolated init(
        role: String,
        content: String?,
        toolCalls: [AgentToolCall]? = nil,
        toolCallID: String? = nil
    ) {
        self.role = role
        self.content = content
        self.toolCalls = toolCalls
        self.toolCallID = toolCallID
    }

    nonisolated static func system(_ text: String) -> AgentMessage {
        AgentMessage(role: "system", content: text)
    }

    nonisolated static func user(_ text: String) -> AgentMessage {
        AgentMessage(role: "user", content: text)
    }

    nonisolated static func assistant(_ text: String) -> AgentMessage {
        AgentMessage(role: "assistant", content: text)
    }

    /// The result of one executed tool, fed back so the model can speak about it.
    nonisolated static func toolResult(id: String, payload: String) -> AgentMessage {
        AgentMessage(role: "tool", content: payload, toolCallID: id)
    }

    enum CodingKeys: String, CodingKey {
        case role
        case content
        case toolCalls = "tool_calls"
        case toolCallID = "tool_call_id"
    }

    nonisolated func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(role, forKey: .role)
        try container.encode(content, forKey: .content)
        try container.encodeIfPresent(toolCalls, forKey: .toolCalls)
        try container.encodeIfPresent(toolCallID, forKey: .toolCallID)
    }
}

/// A tool the model asked us to run.
nonisolated struct AgentToolCall: Codable, Equatable, Sendable {
    nonisolated struct Function: Codable, Equatable, Sendable {
        let name: String
        /// JSON object encoded as a string — the provider's own format.
        let arguments: String
    }

    let id: String
    let type: String
    let function: Function

    nonisolated init(id: String, type: String = "function", function: Function) {
        self.id = id
        self.type = type
        self.function = function
    }

    nonisolated var name: String { function.name }

    /// Decodes `arguments` into a loosely-typed bag. Malformed JSON yields an
    /// empty bag rather than throwing, so one bad argument never kills the turn.
    nonisolated var arguments: [String: AgentValue] {
        guard let data = function.arguments.data(using: .utf8) else { return [:] }
        return (try? JSONDecoder().decode([String: AgentValue].self, from: data)) ?? [:]
    }
}

/// A JSON value from tool arguments. Models are inconsistent about types —
/// `"true"`, `true`, `1080` and `"1080"` all show up — so every accessor
/// coerces across representations instead of trusting one shape.
nonisolated enum AgentValue: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case null

    nonisolated init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Double.self) {
            self = .number(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else {
            self = .null
        }
    }

    nonisolated func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value): try container.encode(value)
        case .number(let value): try container.encode(value)
        case .bool(let value): try container.encode(value)
        case .null: try container.encodeNil()
        }
    }

    nonisolated var stringValue: String? {
        switch self {
        case .string(let value):
            let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
            return trimmed.isEmpty ? nil : trimmed
        case .number(let value):
            return value == value.rounded() ? String(Int(value)) : String(value)
        case .bool(let value):
            return value ? "true" : "false"
        case .null:
            return nil
        }
    }

    nonisolated var intValue: Int? {
        switch self {
        case .number(let value): return Int(value)
        case .string(let value): return Int(value.trimmingCharacters(in: .whitespacesAndNewlines))
        case .bool(let value): return value ? 1 : 0
        case .null: return nil
        }
    }

    nonisolated var boolValue: Bool? {
        switch self {
        case .bool(let value):
            return value
        case .number(let value):
            return value != 0
        case .string(let value):
            switch value.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) {
            case "true", "yes", "1": return true
            case "false", "no", "0": return false
            default: return nil
            }
        case .null:
            return nil
        }
    }
}

/// What the model returned for one round: spoken text, tool calls, or both.
nonisolated struct AgentReply: Equatable, Sendable {
    let text: String?
    let toolCalls: [AgentToolCall]

    nonisolated var wantsTools: Bool { !toolCalls.isEmpty }
}

// MARK: - Tool catalog

/// One capability exposed to the model. Every tool here maps to real work in
/// the app — nothing is decorative, and nothing pretends to have run.
nonisolated struct AgentTool: Sendable {
    let name: String
    let description: String
    /// JSON Schema for the arguments, as a nested dictionary.
    let parameters: [String: Any]

    nonisolated init(name: String, description: String, parameters: [String: Any]) {
        self.name = name
        self.description = description
        self.parameters = parameters
    }

    nonisolated var wireFormat: [String: Any] {
        [
            "type": "function",
            "function": [
                "name": name,
                "description": description,
                "parameters": parameters,
            ] as [String: Any],
        ]
    }
}

nonisolated enum AgentToolName {
    static let dispatchTask = "dispatch_task"
    static let renderVideo = "render_video"
    static let runBehaviour = "run_behaviour"
    static let runChain = "run_chain"
    static let findBehaviour = "find_behaviour"
    static let addFootage = "add_footage"
    static let checkStatus = "check_status"
    static let stopRender = "stop_render"
    static let pullRender = "pull_render"
}

/// The tool surface handed to the model on every turn.
nonisolated enum AgentToolbox {
    private nonisolated static func object(
        _ properties: [String: Any],
        required: [String] = []
    ) -> [String: Any] {
        [
            "type": "object",
            "properties": properties,
            "required": required,
        ]
    }

    nonisolated static let all: [AgentTool] = [
        AgentTool(
            name: AgentToolName.dispatchTask,
            description: """
            Start a long-running job on the task engine and return immediately. \
            Use for security scans, writing code, API pipelines and twin training. \
            The job keeps running in the background while the conversation continues; \
            you will be told separately when it finishes.
            """,
            parameters: object(
                [
                    "command": [
                        "type": "string",
                        "description": "What the job should do, in the user's own words.",
                    ],
                ],
                required: ["command"]
            )
        ),
        AgentTool(
            name: AgentToolName.renderVideo,
            description: """
            Start a video render in the background. If the user's computer is linked, \
            this runs the real houly-pipe render there; otherwise it is queued on the \
            in-app render farm. Returns immediately.
            """,
            parameters: object(
                [
                    "title": [
                        "type": "string",
                        "description": "What is being rendered.",
                    ],
                    "resolution": [
                        "type": "string",
                        "enum": ["3840x2160", "1920x1080", "1080x1920"],
                        "description": "4K, 1080p, or vertical. Defaults to 4K.",
                    ],
                    "fps": [
                        "type": "integer",
                        "description": "Frames per second, 24 to 60. Defaults to 60.",
                    ],
                    "publish": [
                        "type": "boolean",
                        "description": "True only if the user asked to upload or publish to YouTube.",
                    ],
                ],
                required: ["title"]
            )
        ),
        AgentTool(
            name: AgentToolName.runBehaviour,
            description: """
            Perform one of the 300 avatar behaviours immediately, by exact name \
            (for example tell_joke, roast, be_brief, analyze). Use find_behaviour first \
            if unsure of the name.
            """,
            parameters: object(
                [
                    "name": [
                        "type": "string",
                        "description": "Exact behaviour name, such as tell_joke.",
                    ],
                ],
                required: ["name"]
            )
        ),
        AgentTool(
            name: AgentToolName.runChain,
            description: "Play a saved routine of behaviours end to end, by its name.",
            parameters: object(
                [
                    "name": [
                        "type": "string",
                        "description": "Name of the saved chain, such as 'Warm open'.",
                    ],
                ],
                required: ["name"]
            )
        ),
        AgentTool(
            name: AgentToolName.findBehaviour,
            description: """
            Search the 300 behaviours by keyword and return matching names. \
            Use this before run_behaviour whenever the exact name is not obvious.
            """,
            parameters: object(
                [
                    "query": [
                        "type": "string",
                        "description": "Keyword to search for, such as 'laugh' or 'brief'.",
                    ],
                ],
                required: ["query"]
            )
        ),
        AgentTool(
            name: AgentToolName.addFootage,
            description: "Register a source clip against the twin's training set.",
            parameters: object(
                [
                    "name": [
                        "type": "string",
                        "description": "Clip filename or title.",
                    ],
                    "minutes": [
                        "type": "integer",
                        "description": "Length of the clip in minutes.",
                    ],
                ],
                required: ["name", "minutes"]
            )
        ),
        AgentTool(
            name: AgentToolName.checkStatus,
            description: """
            Read the current state of everything: running jobs, fleet throughput, \
            the render queue, the linked computer, and training progress. \
            Call this whenever the user asks how something is going.
            """,
            parameters: object([:])
        ),
        AgentTool(
            name: AgentToolName.stopRender,
            description: "Stop the render currently running on the linked computer.",
            parameters: object([:])
        ),
        AgentTool(
            name: AgentToolName.pullRender,
            description: "Pull the finished master's details from the linked computer into the gallery.",
            parameters: object([:])
        ),
    ]

    nonisolated static var wireFormat: [[String: Any]] { all.map(\.wireFormat) }

    nonisolated static func tool(named name: String) -> AgentTool? {
        all.first { $0.name == name }
    }
}

// MARK: - Activity receipts

/// A visible record of something the avatar actually did, so a spoken claim can
/// always be checked against a real action.
nonisolated struct VoiceActivity: Identifiable, Equatable, Sendable {
    nonisolated enum Outcome: String, Equatable, Sendable {
        case started
        case done
        case failed
    }

    let id: UUID
    let tool: String
    let detail: String
    var outcome: Outcome
    let at: Date

    nonisolated init(
        id: UUID = UUID(),
        tool: String,
        detail: String,
        outcome: Outcome = .started,
        at: Date = .now
    ) {
        self.id = id
        self.tool = tool
        self.detail = detail
        self.outcome = outcome
        self.at = at
    }

    nonisolated var symbol: String {
        switch outcome {
        case .started: return "bolt.horizontal.circle.fill"
        case .done: return "checkmark.circle.fill"
        case .failed: return "exclamationmark.triangle.fill"
        }
    }
}

/// A background job the avatar started and promised to report back on.
nonisolated struct WatchedJob: Identifiable, Equatable, Sendable {
    nonisolated enum Kind: Equatable, Sendable {
        case engineTask
        case localRender
        case remoteRender
    }

    let id: UUID
    let kind: Kind
    let label: String
    /// Index into the activity list, so the receipt can be closed out on finish.
    let activityID: UUID

    nonisolated init(id: UUID, kind: Kind, label: String, activityID: UUID) {
        self.id = id
        self.kind = kind
        self.label = label
        self.activityID = activityID
    }
}
