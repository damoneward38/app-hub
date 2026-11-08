import Foundation
import Testing
@testable import Integrav

/// Whatever the user types has to land on the right origin.
struct RemoteAddressTests {

    @Test func aBareAddressGetsSchemeAndDefaultPort() {
        let url = RemoteAddress.normalize("192.168.1.42")
        #expect(url?.absoluteString == "http://192.168.1.42:8787")
    }

    @Test func anExplicitPortIsKept() {
        #expect(RemoteAddress.normalize("192.168.1.42:9000")?.absoluteString == "http://192.168.1.42:9000")
    }

    @Test func bonjourNamesWork() {
        #expect(RemoteAddress.normalize("studio.local")?.absoluteString == "http://studio.local:8787")
    }

    @Test func surroundingSpaceAndTrailingSlashesAreForgiven() {
        #expect(RemoteAddress.normalize("  192.168.1.42:8787/  ")?.absoluteString == "http://192.168.1.42:8787")
    }

    /// Someone will paste the whole line from the terminal. Keep only the origin.
    @Test func aPastedURLIsReducedToItsOrigin() {
        let url = RemoteAddress.normalize("http://192.168.1.42:8787/v1/hello?x=1#top")
        #expect(url?.absoluteString == "http://192.168.1.42:8787")
    }

    @Test func httpsIsPreserved() {
        #expect(RemoteAddress.normalize("https://studio.example.com")?.absoluteString == "https://studio.example.com:8787")
    }

    @Test func credentialsInTheURLAreStripped() {
        let url = RemoteAddress.normalize("http://user:secret@192.168.1.42:8787")
        #expect(url?.absoluteString == "http://192.168.1.42:8787")
    }

    @Test func nonsenseIsRejectedRatherThanTurnedIntoABrokenURL() {
        #expect(RemoteAddress.normalize("") == nil)
        #expect(RemoteAddress.normalize("   ") == nil)
        #expect(RemoteAddress.normalize("my computer") == nil)
        #expect(RemoteAddress.normalize("ftp://192.168.1.42") == nil)
        #expect(RemoteAddress.normalize("http://") == nil)
    }

    @Test func codesAreReadThroughSpacesAndDashes() {
        #expect(RemoteAddress.normalizeCode("094 603") == "094603")
        #expect(RemoteAddress.normalizeCode("094-603") == "094603")
        #expect(RemoteAddress.normalizeCode("abc094603xyz") == "094603")
    }

    @Test func codeLengthIsEnforcedInBothDirections() {
        #expect(RemoteAddress.isValidCode("094603"))
        #expect(!RemoteAddress.isValidCode("09460"))
        #expect(!RemoteAddress.isValidCode(""))
        // Extra digits are trimmed to six rather than rejected outright.
        #expect(RemoteAddress.normalizeCode("09460312") == "094603")
    }

    /// Drives the warning before a pairing code leaves the local network.
    @Test func privateRangesAreRecognised() throws {
        let priv = ["192.168.1.42", "10.0.0.5", "172.16.4.1", "172.31.255.254", "127.0.0.1", "studio.local", "localhost"]
        for address in priv {
            let url = try #require(RemoteAddress.normalize(address))
            #expect(RemoteAddress.isPrivateAddress(url), "expected \(address) to be private")
        }
    }

    @Test func publicAddressesAreNotMistakenForLocalOnes() throws {
        // 172.32 is outside the private block, and a bare domain is the internet.
        for address in ["8.8.8.8", "172.32.0.1", "203.0.113.9", "example.com"] {
            let url = try #require(RemoteAddress.normalize(address))
            #expect(!RemoteAddress.isPrivateAddress(url), "expected \(address) to be public")
        }
    }

    @Test func theShortAddressDropsTheSchemeNoise() {
        let host = RemoteHost(
            address: "http://192.168.1.42:8787",
            hostName: "Studio-Mac",
            deviceID: "dev_abc123",
            pairedAt: .now
        )
        #expect(host.shortAddress == "192.168.1.42:8787")
        #expect(host.url != nil)
    }

    /// The remembered address has to survive being typed straight back into the
    /// field, so whatever `shortForm` writes must normalise to the same origin.
    @Test func theRememberedFormRoundTrips() throws {
        for typed in ["192.168.1.42", "192.168.1.42:9000", "studio.local", "http://studio.local:8787/v1/hello"] {
            let origin = try #require(RemoteAddress.normalize(typed))
            let short = RemoteAddress.shortForm(origin)
            let again = try #require(RemoteAddress.normalize(short))
            #expect(again.absoluteString == origin.absoluteString, "\(typed) did not survive the round trip")
        }
    }

    /// http is the default and just noise — but dropping https would silently
    /// downgrade a tunnel to a port that isn't listening.
    @Test func httpsSurvivesTheShortForm() throws {
        let origin = try #require(RemoteAddress.normalize("https://studio.example.com"))
        #expect(RemoteAddress.shortForm(origin) == "https://studio.example.com:8787")

        let plain = try #require(RemoteAddress.normalize("192.168.1.42:8787"))
        #expect(RemoteAddress.shortForm(plain) == "192.168.1.42:8787")
    }

    @Test func aRememberedBridgeFallsBackToItsAddressForALabel() {
        let named = RememberedBridge(address: "192.168.1.42:8787", hostName: "Studio-Mac", seenAt: .now)
        #expect(named.label == "Studio-Mac")

        let anonymous = RememberedBridge(address: "192.168.1.42:8787", hostName: nil, seenAt: .now)
        #expect(anonymous.label == "192.168.1.42:8787")

        let blank = RememberedBridge(address: "192.168.1.42:8787", hostName: "", seenAt: .now)
        #expect(blank.label == "192.168.1.42:8787")
    }

    /// The address bar's memory is written to disk, so it has to survive the
    /// same encode/decode round trip every other record goes through.
    @Test func aRememberedBridgeSurvivesStorage() throws {
        let record = RememberedBridge(
            address: "192.168.1.42:8787",
            hostName: "Studio-Mac",
            seenAt: Date(timeIntervalSince1970: 1_780_000_000)
        )
        let data = try JSONEncoder().encode(record)
        let back = try JSONDecoder().decode(RememberedBridge.self, from: data)
        #expect(back == record)
    }

    /// A key that is missing from `all` would be left behind by the vault's
    /// erase and by re-keying on sign-in.
    @Test func theRememberedAddressIsAKeyTheVaultKnowsAbout() {
        #expect(StoreKey.all.contains(StoreKey.bridgeAddress))
    }
}

/// These payloads are copied verbatim from a live `scripts/bridge.py` session.
struct BridgeWireTests {

    @Test func theHandshakeDecodes() throws {
        let data = Data("""
        {"service": "houly-pipe", "version": "1.0", "host": "e2b.local",
         "startedAt": "2026-08-31T20:18:03+0000", "pairingOpen": true,
         "pairingSecondsLeft": 590, "pairedDevices": 0, "telegram": false}
        """.utf8)
        let hello = try JSONDecoder().decode(BridgeHello.self, from: data)
        #expect(hello.isBridge)
        #expect(hello.host == "e2b.local")
        #expect(hello.pairingOpen)
        #expect(hello.pairingSecondsLeft == 590)
    }

    /// Something else answering on the port must not be treated as a bridge.
    @Test func aStrangerOnThePortIsNotABridge() throws {
        let data = Data("""
        {"service": "nginx", "version": "1.0", "host": "x", "pairingOpen": false,
         "pairingSecondsLeft": 0, "pairedDevices": 0, "telegram": false}
        """.utf8)
        #expect(!(try JSONDecoder().decode(BridgeHello.self, from: data)).isBridge)
    }

    @Test func thePairResponseDecodes() throws {
        let data = Data("""
        {"token": "j1p_pmzyAH5ttkTjC39RBcF8Vx_1A7INixER4FEgtHc",
         "deviceId": "dev_84179af7eae2", "host": "e2b.local", "version": "1.0"}
        """.utf8)
        let pair = try JSONDecoder().decode(BridgePairResponse.self, from: data)
        #expect(pair.deviceId == "dev_84179af7eae2")
        #expect(!pair.token.isEmpty)
    }

    @Test func anIdleComputerDecodesAndReadsAsNotBusy() throws {
        let data = Data("""
        {"host": "e2b.local", "pipeline": {"state": "idle", "progress": 0.0},
         "activeJob": null, "queuedCount": 0, "recentJobs": [], "hasManifest": false}
        """.utf8)
        let status = try JSONDecoder().decode(BridgeStatus.self, from: data)
        #expect(!status.isBusy)
        #expect(status.activeJob == nil)
        #expect(!status.hasManifest)
    }

    @Test func aRunningRenderCarriesStageAndProgress() throws {
        let data = Data("""
        {"host": "studio", "pipeline": {"state": "running", "stage": "render",
          "progress": 0.63, "stageProgress": 0.4, "speed": "2.1x",
          "elapsedSeconds": 88.5, "label": "render"},
         "activeJob": {"id": "job_1a2b3c4d5e", "title": "Launch film",
          "state": "running", "createdAt": "2026-08-31T20:20:00+0000",
          "startedAt": "2026-08-31T20:20:01+0000", "finishedAt": null, "error": null},
         "queuedCount": 1, "recentJobs": [], "hasManifest": true}
        """.utf8)
        let status = try JSONDecoder().decode(BridgeStatus.self, from: data)
        #expect(status.isBusy)
        #expect(status.activeJob?.state == .running)
        #expect(status.pipeline.stageLabel == "Rendering master")
        #expect(abs(status.pipeline.clampedProgress - 0.63) < 0.0001)
        #expect(status.queuedCount == 1)
    }

    /// A newer bridge could add a state this build has never heard of.
    @Test func anUnknownJobStateDoesNotBreakDecoding() throws {
        let data = Data("""
        {"id": "job_1", "title": "x", "state": "teleporting",
         "createdAt": "2026-08-31T20:20:00+0000", "startedAt": null,
         "finishedAt": null, "error": null}
        """.utf8)
        let job = try JSONDecoder().decode(BridgeJob.self, from: data)
        #expect(job.state == .unknown)
        #expect(!job.state.isFinished)
    }

    @Test func finishedStatesAreClassified() {
        #expect(BridgeJobState.done.isFinished)
        #expect(BridgeJobState.failed.isFinished)
        #expect(BridgeJobState.cancelled.isFinished)
        #expect(!BridgeJobState.running.isFinished)
        #expect(!BridgeJobState.queued.isFinished)
    }

    @Test func progressIsClampedEvenIfThePipelineOvershoots() throws {
        let over = Data(#"{"state":"running","progress":1.4}"#.utf8)
        let under = Data(#"{"state":"running","progress":-0.2}"#.utf8)
        let missing = Data(#"{"state":"idle"}"#.utf8)
        let decoder = JSONDecoder()
        #expect(try decoder.decode(BridgePipelineStatus.self, from: over).clampedProgress == 1)
        #expect(try decoder.decode(BridgePipelineStatus.self, from: under).clampedProgress == 0)
        #expect(try decoder.decode(BridgePipelineStatus.self, from: missing).clampedProgress == 0)
    }

    @Test func everyStageGetsAReadableLabel() throws {
        let decoder = JSONDecoder()
        for (stage, expected) in [
            ("trim", "Trimming clips"),
            ("render", "Rendering master"),
            ("preview", "Making preview"),
            ("upload", "Uploading"),
        ] {
            let data = Data(#"{"state":"running","stage":"\#(stage)"}"#.utf8)
            let status = try decoder.decode(BridgePipelineStatus.self, from: data)
            #expect(status.stageLabel == expected)
        }
    }

    @Test func theDeviceListDecodes() throws {
        let data = Data("""
        {"devices": [{"id": "dev_84179af7eae2", "name": "Damon iPhone",
          "platform": "ios", "pairedAt": "2026-08-31T20:19:38+0000",
          "lastSeen": "2026-08-31T20:19:49+0000"}], "you": "dev_84179af7eae2"}
        """.utf8)
        let list = try JSONDecoder().decode(BridgeDeviceList.self, from: data)
        #expect(list.devices.count == 1)
        #expect(list.you == list.devices[0].id)
    }

    /// The bridge reports every failure as {"error": "..."}.
    @Test func serverErrorTextIsLiftedOutForTheUser() {
        let data = Data(#"{"error": "Wrong pairing code. 4 attempts left."}"#.utf8)
        #expect(BridgeService.message(from: data) == "Wrong pairing code. 4 attempts left.")
        #expect(BridgeService.message(from: Data("not json".utf8)) == nil)
        #expect(BridgeService.message(from: Data(#"{"error": ""}"#.utf8)) == nil)
    }
}

/// Error classification decides whether the app retries or unlinks.
struct BridgeErrorTests {

    @Test func aRefusedTokenIsTreatedAsUnauthorized() {
        #expect(BridgeError.server(401, "nope").isUnauthorized)
        #expect(BridgeError.server(403, "nope").isUnauthorized)
        #expect(!BridgeError.server(500, "boom").isUnauthorized)
    }

    /// A dropped packet must not tear down a working link.
    @Test func networkBlipsAreTransientButRefusalsAreNot() {
        #expect(BridgeError.transport(URLError(.timedOut)).isTransient)
        #expect(BridgeError.server(503, "busy").isTransient)
        #expect(!BridgeError.server(401, "nope").isTransient)
        #expect(!BridgeError.badAddress.isTransient)
    }

    @Test func everyFailureExplainsItselfInPlainWords() {
        let cases: [BridgeError] = [
            .badAddress,
            .notABridge,
            .badResponse,
            .notLinked,
            .transport(URLError(.cannotConnectToHost)),
            .server(500, "Something broke"),
        ]
        for error in cases {
            let text = error.errorDescription ?? ""
            #expect(!text.isEmpty)
            // No raw error codes or type names leaking into the UI.
            #expect(!text.contains("Error Domain"))
        }
    }

    @Test func aDeadComputerSuggestsTheActualFix() {
        let text = BridgeError.transport(URLError(.cannotConnectToHost)).errorDescription ?? ""
        #expect(text.contains("bridge"))
        #expect(text.localizedCaseInsensitiveContains("wi-fi"))
    }
}

/// Only the stages the settings ask for should run on the remote machine.
struct RemoteStagesTests {

    @Test func aLocalOnlyMasterSkipsUpload() {
        var settings = PipelineSettings.default
        settings.makePreview = true
        settings.uploadToYouTube = false
        #expect(settings.stagesArgument == "trim,render,preview")
    }

    @Test func publishingAddsTheUploadStage() {
        var settings = PipelineSettings.default
        settings.uploadToYouTube = true
        #expect(settings.stagesArgument.hasSuffix("upload"))
    }

    @Test func turningOffPreviewDropsItFromTheRun() {
        var settings = PipelineSettings.default
        settings.makePreview = false
        settings.uploadToYouTube = false
        #expect(settings.stagesArgument == "trim,render")
    }

    /// Trim and render are the job — they can never be skipped.
    @Test func theCoreStagesAreAlwaysPresent() {
        var settings = PipelineSettings.default
        settings.makePreview = false
        settings.uploadToYouTube = false
        #expect(settings.stagesArgument.contains("trim"))
        #expect(settings.stagesArgument.contains("render"))
    }
}

/// The preview request is the bridge's contract: field names and values must
/// match what `bridge.py` reads, or the phone would preview something other
/// than what it renders.
struct KeyPreviewRequestTests {

    @Test func theBodyCarriesEveryKnobTheKeyerNeeds() throws {
        var settings = GreenScreenSettings.default
        settings.isEnabled = true
        settings.key = .blue
        settings.tolerance = 0.2
        settings.softness = 0.1
        settings.despill = 0.6
        settings.feather = 4
        settings.scale = 1.25
        settings.offsetX = 0.08
        settings.offsetY = -0.05

        let body = KeyPreviewRequest(settings: settings, source: "raw/take.mp4", time: 7.5)
        let object = try #require(
            JSONSerialization.jsonObject(with: JSONEncoder().encode(body)) as? [String: Any]
        )

        #expect(object["source"] as? String == "raw/take.mp4")
        #expect(object["time"] as? Double == 7.5)
        #expect(object["keyColor"] as? String == "blue")
        #expect(object["background"] as? String == "#101018")
        #expect(object["tolerance"] as? Double == 0.2)
        #expect(object["softness"] as? Double == 0.1)
        #expect(object["despill"] as? Double == 0.6)
        #expect(object["feather"] as? Int == 4)
        #expect(object["size"] as? Double == 1.25)
        #expect(object["x"] as? Double == 0.08)
        #expect(object["y"] as? Double == -0.05)
    }

    /// A negative time would make the keyer fail; clamp it at the source.
    @Test func aNegativeTimeIsClampedBeforeItLeavesThePhone() throws {
        let body = KeyPreviewRequest(settings: .default, source: "raw/t.mp4", time: -4)
        let object = try #require(
            JSONSerialization.jsonObject(with: JSONEncoder().encode(body)) as? [String: Any]
        )
        #expect(object["time"] as? Double == 0)
    }

    /// A file backdrop travels as its path — the host resolves it, the same as
    /// in the config.
    @Test func aHostFileBackdropTravelsAsItsPath() throws {
        var settings = GreenScreenSettings.default
        settings.usesHostFile = true
        settings.backdropFile = "raw/backdrop.png"
        let body = KeyPreviewRequest(settings: settings, source: "raw/t.mp4", time: 0)
        let object = try #require(
            JSONSerialization.jsonObject(with: JSONEncoder().encode(body)) as? [String: Any]
        )
        #expect(object["background"] as? String == "raw/backdrop.png")
    }

    /// The preview and the render must not be able to disagree about which
    /// screen is being keyed.
    @Test func theKeyColourMatchesWhatTheConfigWouldSay() {
        var settings = GreenScreenSettings.default
        settings.key = .magenta
        let body = KeyPreviewRequest(settings: settings, source: "raw/t.mp4", time: 0)
        #expect(body.keyColor == "magenta")
    }
}
