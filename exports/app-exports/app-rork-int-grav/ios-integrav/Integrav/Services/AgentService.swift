import Foundation

/// Failures the voice loop can hit, phrased the way the avatar should say them.
nonisolated enum AgentError: LocalizedError, Equatable {
    case notConfigured
    case unauthorized
    case outOfCredit
    case rateLimited
    case server(Int)
    case emptyReply
    case offline

    nonisolated var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "Voice isn't configured in this build yet."
        case .unauthorized:
            return "My connection was refused. Restart the app and I'll try again."
        case .outOfCredit:
            return "I'm out of cloud credit, so I can't think out loud right now."
        case .rateLimited:
            return "Too many requests at once — give me a second and say that again."
        case .server:
            return "That didn't come back cleanly. Say it again and I'll retry."
        case .emptyReply:
            return "I heard you, but I came back empty. Try that once more."
        case .offline:
            return "I can't reach the network, so I can't answer out loud."
        }
    }

    /// Whether saying it again is likely to work.
    nonisolated var isTransient: Bool {
        switch self {
        case .rateLimited, .server, .emptyReply, .offline: return true
        case .notConfigured, .unauthorized, .outOfCredit: return false
        }
    }
}

/// Talks to the chat model through the Rork toolkit proxy. One round trip per
/// call — the orchestrator drives the tool loop, so this stays stateless.
nonisolated struct AgentService: Sendable {
    /// Fast enough to feel conversational, strong enough to pick tools well.
    static let model = "anthropic/claude-haiku-4.5"
    /// Used automatically by the gateway if the primary model is unavailable.
    static let fallbackModels = ["openai/gpt-4.1-mini", "google/gemini-2.5-flash"]

    /// Shared so constructing an `AgentService` stays free — the store that owns
    /// it is rebuilt on every update of the view that holds it.
    private nonisolated static let sharedSession: URLSession = {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 30
        configuration.waitsForConnectivity = false
        return URLSession(configuration: configuration)
    }()

    private let session: URLSession

    nonisolated init(session: URLSession? = nil) {
        self.session = session ?? AgentService.sharedSession
    }

    nonisolated static var isConfigured: Bool {
        !Config.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY.isEmpty && !toolkitBase.isEmpty
    }

    nonisolated static var toolkitBase: String {
        let raw = Config.EXPO_PUBLIC_TOOLKIT_URL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !raw.isEmpty else { return "https://toolkit.rork.com" }
        return raw.hasSuffix("/") ? String(raw.dropLast()) : raw
    }

    /// Sends the conversation and returns the model's next move: spoken text,
    /// tool calls, or both.
    nonisolated func respond(
        messages: [AgentMessage],
        tools: [[String: Any]] = AgentToolbox.wireFormat
    ) async throws -> AgentReply {
        guard AgentService.isConfigured else { throw AgentError.notConfigured }
        guard let url = URL(string: "\(AgentService.toolkitBase)/v2/vercel/v1/chat/completions") else {
            throw AgentError.notConfigured
        }

        var body: [String: Any] = [
            "model": AgentService.model,
            "messages": try AgentService.encode(messages),
            "temperature": 0.6,
            "max_tokens": 700,
            "providerOptions": [
                "gateway": ["models": AgentService.fallbackModels],
            ],
        ]
        if !tools.isEmpty { body["tools"] = tools }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(
            "Bearer \(Config.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY)",
            forHTTPHeaderField: "Authorization"
        )
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let error as URLError where error.code == .notConnectedToInternet {
            throw AgentError.offline
        } catch {
            throw AgentError.offline
        }

        guard let http = response as? HTTPURLResponse else { throw AgentError.server(-1) }
        switch http.statusCode {
        case 200: break
        case 401, 403: throw AgentError.unauthorized
        case 402: throw AgentError.outOfCredit
        case 429: throw AgentError.rateLimited
        default: throw AgentError.server(http.statusCode)
        }

        return try AgentService.decodeReply(from: data)
    }

    // MARK: - Wire helpers

    /// Encodes the message array into plain JSON objects so it can sit inside a
    /// `JSONSerialization` body alongside the tool schemas.
    nonisolated static func encode(_ messages: [AgentMessage]) throws -> [[String: Any]] {
        let encoder = JSONEncoder()
        return try messages.map { message in
            let data = try encoder.encode(message)
            guard let object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                return ["role": message.role, "content": message.content ?? ""]
            }
            return object
        }
    }

    nonisolated static func decodeReply(from data: Data) throws -> AgentReply {
        nonisolated struct Envelope: Decodable {
            nonisolated struct Choice: Decodable {
                nonisolated struct Message: Decodable {
                    let content: String?
                    let toolCalls: [AgentToolCall]?

                    enum CodingKeys: String, CodingKey {
                        case content
                        case toolCalls = "tool_calls"
                    }
                }
                let message: Message
            }
            let choices: [Choice]
        }

        guard let envelope = try? JSONDecoder().decode(Envelope.self, from: data),
              let message = envelope.choices.first?.message else {
            throw AgentError.emptyReply
        }

        let text = message.content?.trimmingCharacters(in: .whitespacesAndNewlines)
        let calls = message.toolCalls ?? []
        guard !(text ?? "").isEmpty || !calls.isEmpty else { throw AgentError.emptyReply }
        return AgentReply(text: (text?.isEmpty ?? true) ? nil : text, toolCalls: calls)
    }
}
