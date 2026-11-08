import Foundation
import Testing
@testable import Integrav

// MARK: - Wire format

/// Payloads copied verbatim from live gateway sessions. If the provider changes
/// shape, these fail before the microphone ever opens.
struct AgentWireTests {

    /// Exactly what `anthropic/claude-haiku-4.5` returned when asked to render
    /// and publish a video, trimmed to the fields the app reads.
    static let toolCallPayload = """
    {"choices":[{"message":{"role":"assistant","content":null,"tool_calls":[{"id":"toolu_01749hc3Jg9yJAK6WmAtA2B4","type":"function","function":{"name":"render_video","arguments":"{\\"title\\":\\"keynote video\\",\\"resolution\\":\\"3840x2160\\",\\"publish\\":true}"}}]}}]}
    """

    static let plainTextPayload = """
    {"choices":[{"message":{"role":"assistant","content":"That's rendering now — what else?"}}]}
    """

    @Test func aToolCallReplyIsDecoded() throws {
        let data = Data(AgentWireTests.toolCallPayload.utf8)
        let reply = try AgentService.decodeReply(from: data)

        #expect(reply.wantsTools)
        #expect(reply.text == nil)
        #expect(reply.toolCalls.count == 1)

        let call = try #require(reply.toolCalls.first)
        #expect(call.name == AgentToolName.renderVideo)
        #expect(call.id == "toolu_01749hc3Jg9yJAK6WmAtA2B4")
    }

    /// The provider hands arguments back as a JSON *string*, not an object.
    @Test func toolArgumentsAreParsedOutOfTheEmbeddedJSONString() throws {
        let reply = try AgentService.decodeReply(from: Data(AgentWireTests.toolCallPayload.utf8))
        let arguments = try #require(reply.toolCalls.first).arguments

        #expect(arguments["title"]?.stringValue == "keynote video")
        #expect(arguments["resolution"]?.stringValue == "3840x2160")
        #expect(arguments["publish"]?.boolValue == true)
    }

    @Test func aPlainSpokenReplyIsDecoded() throws {
        let reply = try AgentService.decodeReply(from: Data(AgentWireTests.plainTextPayload.utf8))
        #expect(!reply.wantsTools)
        #expect(reply.text == "That's rendering now — what else?")
    }

    @Test func anEmptyReplyIsAnError() {
        let payload = Data("""
        {"choices":[{"message":{"role":"assistant","content":""}}]}
        """.utf8)
        #expect(throws: AgentError.emptyReply) {
            _ = try AgentService.decodeReply(from: payload)
        }
    }

    @Test func garbageIsAnErrorRatherThanACrash() {
        #expect(throws: AgentError.emptyReply) {
            _ = try AgentService.decodeReply(from: Data("not json".utf8))
        }
    }

    /// Sending `"tool_calls": null` makes some providers reject the whole turn,
    /// so absent fields must stay absent.
    @Test func nullFieldsAreOmittedFromEncodedMessages() throws {
        let encoded = try AgentService.encode([.user("hello")])
        let message = try #require(encoded.first)

        #expect(message["role"] as? String == "user")
        #expect(message["content"] as? String == "hello")
        #expect(message["tool_calls"] == nil)
        #expect(message["tool_call_id"] == nil)
    }

    @Test func aToolResultCarriesItsCallID() throws {
        let encoded = try AgentService.encode([.toolResult(id: "toolu_1", payload: "{\"ok\":\"true\"}")])
        let message = try #require(encoded.first)

        #expect(message["role"] as? String == "tool")
        #expect(message["tool_call_id"] as? String == "toolu_1")
    }

    /// An assistant turn that requested tools must be replayed with them intact,
    /// or the follow-up round loses the thread.
    @Test func anAssistantTurnKeepsItsToolCalls() throws {
        let call = AgentToolCall(
            id: "toolu_1",
            function: .init(name: AgentToolName.checkStatus, arguments: "{}")
        )
        let encoded = try AgentService.encode([
            AgentMessage(role: "assistant", content: nil, toolCalls: [call]),
        ])
        let message = try #require(encoded.first)
        let calls = try #require(message["tool_calls"] as? [[String: Any]])

        #expect(calls.count == 1)
        #expect((calls[0]["function"] as? [String: Any])?["name"] as? String == AgentToolName.checkStatus)
    }
}

// MARK: - Argument coercion

/// Models are inconsistent about JSON types. Every accessor has to cope.
struct AgentValueTests {

    private func arguments(_ json: String) -> [String: AgentValue] {
        AgentToolCall(id: "x", function: .init(name: "n", arguments: json)).arguments
    }

    @Test func numbersSurviveAsBothNumberAndString() {
        let numeric = arguments(#"{"fps":60}"#)
        #expect(numeric["fps"]?.intValue == 60)

        let stringly = arguments(#"{"fps":"60"}"#)
        #expect(stringly["fps"]?.intValue == 60)
    }

    @Test func boolsSurviveAsBothBoolAndString() {
        #expect(arguments(#"{"publish":true}"#)["publish"]?.boolValue == true)
        #expect(arguments(#"{"publish":"true"}"#)["publish"]?.boolValue == true)
        #expect(arguments(#"{"publish":"no"}"#)["publish"]?.boolValue == false)
        #expect(arguments(#"{"publish":0}"#)["publish"]?.boolValue == false)
    }

    @Test func anIntegerReadsBackWithoutADecimalPoint() {
        #expect(arguments(#"{"fps":60}"#)["fps"]?.stringValue == "60")
    }

    @Test func blankStringsCountAsMissingRatherThanEmpty() {
        #expect(arguments(#"{"title":"   "}"#)["title"]?.stringValue == nil)
    }

    @Test func nullIsMissing() {
        #expect(arguments(#"{"title":null}"#)["title"]?.stringValue == nil)
    }

    /// One malformed argument must not take down the turn.
    @Test func malformedArgumentsYieldAnEmptyBagRatherThanThrowing() {
        #expect(arguments("{not json").isEmpty)
    }
}

// MARK: - Tool catalog

struct AgentToolboxTests {

    @Test func everyToolNameIsUnique() {
        let names = AgentToolbox.all.map(\.name)
        #expect(Set(names).count == names.count)
    }

    @Test func everyRequiredArgumentIsActuallyDeclared() throws {
        for tool in AgentToolbox.all {
            let properties = try #require(tool.parameters["properties"] as? [String: Any])
            let required = try #require(tool.parameters["required"] as? [String])
            for key in required {
                #expect(properties[key] != nil, "\(tool.name) requires undeclared '\(key)'")
            }
        }
    }

    @Test func theWireFormatMatchesTheOpenAIToolShape() throws {
        let entry = try #require(AgentToolbox.wireFormat.first)
        #expect(entry["type"] as? String == "function")
        let function = try #require(entry["function"] as? [String: Any])
        #expect(function["name"] is String)
        #expect(function["description"] is String)
        #expect(function["parameters"] is [String: Any])
    }

    /// The tools that act on the world must be present — this is the contract
    /// that makes "she can actually do it" true rather than a claim.
    @Test func theActingToolsAreAllExposed() {
        let names = Set(AgentToolbox.all.map(\.name))
        #expect(names.contains(AgentToolName.dispatchTask))
        #expect(names.contains(AgentToolName.renderVideo))
        #expect(names.contains(AgentToolName.runBehaviour))
        #expect(names.contains(AgentToolName.checkStatus))
    }

    @Test func toolsWithoutArgumentsStillDeclareAnObjectSchema() throws {
        let status = try #require(AgentToolbox.tool(named: AgentToolName.checkStatus))
        #expect(status.parameters["type"] as? String == "object")
        #expect((status.parameters["required"] as? [String])?.isEmpty == true)
    }
}

// MARK: - Tool results

struct ToolPayloadTests {

    @Test func successPayloadsAreValidJSONAndFlaggedOK() throws {
        let payload = ConversationStore.success(["status": "running_in_background"])
        let decoded = try #require(
            try JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: String]
        )
        #expect(decoded["ok"] == "true")
        #expect(decoded["status"] == "running_in_background")
    }

    @Test func failurePayloadsCarryTheReason() throws {
        let payload = ConversationStore.failure("No computer is linked.")
        let decoded = try #require(
            try JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: String]
        )
        #expect(decoded["ok"] == "false")
        #expect(decoded["error"] == "No computer is linked.")
    }

    @Test func quotesInAReasonDoNotBreakTheJSON() throws {
        let payload = ConversationStore.failure(#"There is no behaviour called "wave"."#)
        let decoded = try JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: String]
        #expect(decoded?["ok"] == "false")
    }
}

// MARK: - Speech

struct SpeechListenerTests {

    @Test func realSentencesAreAccepted() {
        #expect(SpeechListener.isMeaningful("render the keynote in 4k"))
        #expect(SpeechListener.isMeaningful("ok"))
    }

    /// A live mic emits stray blips between sentences; they must never become
    /// a turn.
    @Test func blipsAndSilenceAreRejected() {
        #expect(!SpeechListener.isMeaningful(""))
        #expect(!SpeechListener.isMeaningful("   "))
        #expect(!SpeechListener.isMeaningful("a"))
        #expect(!SpeechListener.isMeaningful("."))
        #expect(!SpeechListener.isMeaningful("--"))
    }
}

// MARK: - Voice

struct VoiceServiceTests {

    @Test func base64AudioIsDecoded() throws {
        let original = Data([0xFF, 0xFB, 0x90, 0x00])
        let payload = Data(#"{"audio":"\#(original.base64EncodedString())"}"#.utf8)
        #expect(try VoiceService.decodeAudio(from: payload) == original)
    }

    @Test func anEmptyAudioFieldIsAnError() {
        #expect(throws: AgentError.emptyReply) {
            _ = try VoiceService.decodeAudio(from: Data(#"{"audio":""}"#.utf8))
        }
    }

    @Test func aMissingAudioFieldIsAnError() {
        #expect(throws: AgentError.emptyReply) {
            _ = try VoiceService.decodeAudio(from: Data(#"{"warnings":[]}"#.utf8))
        }
    }

    /// The jaw must rest closed between words rather than idling half-open.
    @Test func quietAudioProducesNoJawMovement() {
        #expect(VoiceService.normalize(decibels: -60) == 0)
        #expect(VoiceService.normalize(decibels: -42) == 0)
        #expect(VoiceService.normalize(decibels: -.infinity) == 0)
    }

    @Test func loudAudioSaturatesAtFullyOpen() {
        #expect(VoiceService.normalize(decibels: 0) == 1)
        #expect(VoiceService.normalize(decibels: 12) == 1)
    }

    @Test func normalLevelsLandBetweenTheExtremes() {
        let mid = VoiceService.normalize(decibels: -21)
        #expect(mid > 0.4 && mid < 0.6)
    }

    /// The behaviour catalog writes stage directions like `*waves*`; she must
    /// never read the punctuation out loud.
    @Test func stageDirectionMarkupIsNotSpoken() {
        #expect(VoiceService.spoken(from: "*waves* — online and listening.")
            == "waves — online and listening.")
    }

    @Test func underscoredFunctionNamesAreSpokenAsWords() {
        #expect(VoiceService.spoken(from: "tell_joke") == "tell joke")
    }

    @Test func collapsedWhitespaceKeepsTheDeliveryClean() {
        #expect(VoiceService.spoken(from: "  too    many   spaces  ") == "too many spaces")
    }

    @Test func emptyTextStaysEmptySoNothingIsSpoken() {
        #expect(VoiceService.spoken(from: "***").isEmpty)
    }
}

// MARK: - Errors

struct AgentErrorTests {

    @Test func everyErrorSaysSomethingAPersonCanActOn() {
        for error in [
            AgentError.notConfigured,
            .unauthorized,
            .outOfCredit,
            .rateLimited,
            .server(500),
            .emptyReply,
            .offline,
        ] {
            let message = error.errorDescription ?? ""
            #expect(!message.isEmpty)
            #expect(!message.contains("Error Domain"))
        }
    }

    /// Retrying only helps for some failures; retrying an auth failure forever
    /// would just burn the user's battery.
    @Test func onlyRecoverableFailuresAreMarkedTransient() {
        #expect(AgentError.rateLimited.isTransient)
        #expect(AgentError.offline.isTransient)
        #expect(AgentError.server(503).isTransient)
        #expect(!AgentError.unauthorized.isTransient)
        #expect(!AgentError.outOfCredit.isTransient)
        #expect(!AgentError.notConfigured.isTransient)
    }
}

// MARK: - Session state

struct ConversationModeTests {

    @Test func everyModeHasASpokenStatusLabel() {
        for mode in [
            ConversationStore.Mode.off,
            .listening,
            .thinking,
            .speaking,
        ] {
            #expect(!mode.label.isEmpty)
        }
    }

    @Test func aDeniedMicExplainsHowToFixIt() {
        let notice = ConversationStore.accessNotice(
            for: .denied("The microphone is off. Turn it on in Settings to talk to her.")
        )
        #expect(notice.contains("Settings"))
    }

    @Test func activityReceiptsCarryADistinctSymbolPerOutcome() {
        let started = VoiceActivity(tool: "Dispatched", detail: "scan", outcome: .started)
        let done = VoiceActivity(tool: "Dispatched", detail: "scan", outcome: .done)
        let failed = VoiceActivity(tool: "Dispatched", detail: "scan", outcome: .failed)
        #expect(Set([started.symbol, done.symbol, failed.symbol]).count == 3)
    }
}
