import Foundation
import Testing
@testable import Integrav

/// Only listed operator accounts get billing overrides.
struct AdminRoleTests {

    @Test func theOperatorAccountIsRecognised() {
        #expect(AdminRole.isAdmin(email: "damoneward38@gmail.com"))
    }

    @Test func matchingIgnoresCaseAndSurroundingSpace() {
        #expect(AdminRole.isAdmin(email: "  DamonEward38@Gmail.com "))
    }

    @Test func everyoneElseIsRejected() {
        #expect(!AdminRole.isAdmin(email: "someone@example.com"))
        #expect(!AdminRole.isAdmin(email: ""))
        #expect(!AdminRole.isAdmin(email: nil))
        // A lookalike domain must not pass.
        #expect(!AdminRole.isAdmin(email: "damoneward38@gmail.com.evil.com"))
    }
}

/// Pipeline parameters and the config.yaml they generate.
struct PipelineSettingsTests {

    @Test func defaultsAreAFourKMaster() {
        let settings = PipelineSettings.default
        #expect(settings.resolution == "3840x2160")
        #expect(settings.fps == 60)
    }

    // MARK: - Pipelines

    /// A preset is only useful if the panel can tell it is on — applying one has
    /// to leave the settings in a state that matches it exactly.
    @Test func everyPresetRecognisesItself() {
        for preset in PipelinePreset.allCases {
            let settings = PipelineSettings.default.applying(preset)
            #expect(settings.matches(preset), "\(preset.title) did not match itself")
            #expect(settings.matchedPreset == preset, "\(preset.title) matched \(String(describing: settings.matchedPreset))")
        }
    }

    /// Two presets that produced identical encodes would make the badge
    /// ambiguous — each one has to be a genuinely different job.
    @Test func noTwoPresetsProduceTheSameEncode() {
        var seen: [String] = []
        for preset in PipelinePreset.allCases {
            let fingerprint = PipelineSettings.default.applying(preset).summary
                + "|\(preset.makesPreview)|\(preset.previewSeconds)"
            #expect(!seen.contains(fingerprint), "\(preset.title) duplicates another pipeline")
            seen.append(fingerprint)
        }
    }

    /// The whole point of the presets is that they touch the encode and nothing
    /// else. Silently dropping a chroma key or flipping a video public would be
    /// a trap, not a shortcut.
    @Test func aPresetNeverTouchesKeyingGradeOrPublishing() {
        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        settings.greenScreen.key = .blue
        settings.greenScreen.tolerance = 0.31
        settings.applyLUT = true
        settings.watermark = true
        settings.burnSubtitles = true
        settings.uploadToYouTube = true
        settings.privacy = .unlisted

        for preset in PipelinePreset.allCases {
            let after = settings.applying(preset)
            #expect(after.greenScreen == settings.greenScreen)
            #expect(after.applyLUT)
            #expect(after.watermark)
            #expect(after.burnSubtitles)
            #expect(after.uploadToYouTube)
            #expect(after.privacy == .unlisted)
        }
    }

    /// Presets write straight into the config, so their values have to be ones
    /// the pipeline and the rest of the panel actually accept.
    @Test func presetValuesStayInsideTheRangesThePanelOffers() {
        for preset in PipelinePreset.allCases {
            #expect(PipelineSettings.fpsChoices.contains(preset.fps), "\(preset.title) fps is off the dial")
            #expect(PipelineSettings.crfRange.contains(Double(preset.crf)), "\(preset.title) CRF is off the slider")
            #expect(
                PipelineSettings.bitrateRange.contains(Double(preset.bitrateMbps)),
                "\(preset.title) bitrate is off the slider"
            )
        }
    }

    @Test func aPresetReachesTheGeneratedConfig() {
        let settings = PipelineSettings.default.applying(.shorts)
        let yaml = settings.configYAML(projectTitle: "Vertical cut")
        #expect(yaml.contains("resolution: 1080x1920"))
        #expect(yaml.contains("fps: 30"))
        #expect(yaml.contains("preset: veryfast"))
        // Shorts are watched whole, so no second preview file is rendered.
        #expect(yaml.contains("preview: false"))
        #expect(!settings.stagesArgument.contains("preview"))
    }

    /// The shipped default is the master pipeline, not an unnamed set of values.
    @Test func theDefaultSettingsAreTheMasterPipeline() {
        #expect(PipelineSettings.default.matchedPreset == .master)
    }

    /// Turning one knob afterwards must clear the badge rather than keep
    /// claiming a pipeline the settings no longer describe.
    @Test func changingAKnobLeavesThePipelineCustom() {
        var settings = PipelineSettings.default.applying(.delivery)
        settings.crf = 26
        #expect(settings.matchedPreset == nil)
        #expect(!settings.matches(.delivery))
    }

    @Test func generatedYAMLCarriesEveryEncoderKnob() {
        var settings = PipelineSettings.default
        settings.format = .fullHD
        settings.fps = 30
        settings.crf = 20
        settings.bitrateMbps = 40
        settings.preset = .slow

        let yaml = settings.configYAML(projectTitle: "Launch film")
        #expect(yaml.contains("resolution: 1920x1080"))
        #expect(yaml.contains("fps: 30"))
        #expect(yaml.contains("crf: 20"))
        #expect(yaml.contains("bitrate: 40M"))
        #expect(yaml.contains("preset: slow"))
        // The intermediate encode must stay above the final one in quality.
        #expect(yaml.contains("intermediateCrf: 18"))
        #expect(yaml.contains("outputFile: out/launch_film.mp4"))
    }

    @Test func disabledStagesAreOmittedNotSetToFalse() {
        var settings = PipelineSettings.default
        settings.applyLUT = false
        settings.watermark = false
        settings.burnSubtitles = false

        let yaml = settings.configYAML(projectTitle: "Bare")
        #expect(!yaml.contains("lut:"))
        #expect(!yaml.contains("logo:"))
        #expect(!yaml.contains("subtitles:"))
    }

    /// The phone cannot see the render host's filesystem, so the shipped defaults
    /// must not name files that only exist if the operator put them there. When
    /// these defaulted to on, every out-of-the-box remote render died in stage 2.
    @Test func defaultSettingsNameNoAssetsTheRenderHostMayNotHave() {
        let yaml = PipelineSettings.default.configYAML(projectTitle: "Fresh install")
        #expect(!yaml.contains("lut:"))
        #expect(!yaml.contains("logo:"))
        #expect(!yaml.contains("subtitles:"))
    }

    // MARK: - Green screen

    /// Same rule as the LUT and watermark: a shipped default must not name a
    /// file on the render host, so keying is off and the config stays clean.
    @Test func greenScreenIsOffByDefaultAndWritesNoCompositeBlock() {
        let yaml = PipelineSettings.default.configYAML(projectTitle: "Fresh install")
        #expect(!yaml.contains("composite:"))
        #expect(!PipelineSettings.default.stagesArgument.contains("composite"))
    }

    @Test func enablingGreenScreenAddsTheCompositeStageFirst() {
        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        #expect(settings.stagesArgument.hasPrefix("composite,trim,render"))
    }

    @Test func compositeBlockCarriesEveryKnobThePipelineReads() {
        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        settings.greenScreen.key = .blue
        settings.greenScreen.tolerance = 0.22
        settings.greenScreen.softness = 0.1
        settings.greenScreen.despill = 0.5
        settings.greenScreen.feather = 4
        settings.greenScreen.scale = 1.25
        settings.greenScreen.offsetX = -0.1

        let yaml = settings.configYAML(projectTitle: "Keyed")
        #expect(yaml.contains("composite:"))
        #expect(yaml.contains("keyColor: blue"))
        #expect(yaml.contains("tolerance: 0.22"))
        #expect(yaml.contains("softness: 0.1"))
        #expect(yaml.contains("despill: 0.5"))
        #expect(yaml.contains("feather: 4"))
        #expect(yaml.contains("size: 1.25"))
        #expect(yaml.contains("x: -0.1"))
    }

    /// `background: #101018` unquoted is an empty value plus a YAML comment,
    /// which the pipeline reads as a scene with no backdrop at all.
    @Test func hexBackdropsAreQuotedSoYAMLDoesNotReadThemAsComments() {
        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true
        settings.greenScreen.backdropColor = "#101018"

        let yaml = settings.configYAML(projectTitle: "Quoted")
        #expect(yaml.contains(##"background: "#101018""##))
        #expect(!yaml.contains(##"background: #101018"##))
    }

    @Test func onlyTheFirstSceneIsKeyedUnlessEverySceneIsAsked() {
        var settings = PipelineSettings.default
        settings.greenScreen.isEnabled = true

        let single = settings.configYAML(projectTitle: "One", scenes: ["host", "broll", "outro"])
        #expect(single.components(separatedBy: "composite:").count - 1 == 1)

        settings.greenScreen.appliesToEveryScene = true
        let all = settings.configYAML(projectTitle: "All", scenes: ["host", "broll", "outro"])
        #expect(all.components(separatedBy: "composite:").count - 1 == 3)
    }

    @Test func malformedHexFallsBackRatherThanReachingThePipeline() {
        var green = GreenScreenSettings.default
        green.backdropColor = "not a colour"
        #expect(green.normalisedColor == "#101018")

        green.backdropColor = "fff"
        #expect(green.normalisedColor == "#FFFFFF")

        green.backdropColor = "  #0b3d2e "
        #expect(green.normalisedColor == "#0B3D2E")
    }

    @Test func aHostFileBackdropIsFlaggedAsUnverifiable() {
        var green = GreenScreenSettings.default
        green.isEnabled = true
        #expect(!green.referencesUnverifiableFile)

        green.usesHostFile = true
        #expect(green.referencesUnverifiableFile)
        #expect(green.isValid)

        green.backdropFile = "   "
        #expect(!green.isValid)
    }

    @Test func compactNumbersKeepTheConfigReadable() {
        #expect(PipelineSettings.number(1.0) == "1")
        #expect(PipelineSettings.number(0.16) == "0.16")
        #expect(PipelineSettings.number(-0.1) == "-0.1")
        #expect(PipelineSettings.number(0) == "0")
    }

    @Test func uploadIntentAndPrivacyReachTheYouTubeBlock() {
        var settings = PipelineSettings.default
        settings.uploadToYouTube = true
        settings.privacy = .unlisted

        let yaml = settings.configYAML(projectTitle: "Ship it")
        #expect(yaml.contains("upload: true"))
        #expect(yaml.contains("privacy: unlisted"))
    }

    /// An unescaped quote in the title would produce invalid YAML.
    @Test func titlesAreEscapedIntoTheYAMLString() {
        let settings = PipelineSettings.default
        let yaml = settings.configYAML(projectTitle: #"The "big" launch"#)
        #expect(yaml.contains(#"title: "The \"big\" launch""#))
    }

    @Test func slugsAreFilesystemSafe() {
        #expect(PipelineSettings.slug("Launch Film — 2026!") == "launch_film_2026")
        #expect(PipelineSettings.slug("") == "render")
        #expect(PipelineSettings.slug("///") == "render")
        #expect(PipelineSettings.slug(String(repeating: "a", count: 90)).count <= 48)
    }

    @Test func everyFormatMapsBackToItself() {
        for format in RenderFormat.allCases {
            #expect(RenderFormat.matching(format.resolution) == format)
        }
        #expect(RenderFormat.matching("640x480") == nil)
    }
}

/// The pipeline's own manifest.json must decode exactly as Python writes it.
struct RenderManifestTests {

    /// The shape houly-pipe actually emits, copied from a real run.
    private let sample = Data("""
    {
      "generatedAt": "2026-08-31T19:38:17+0000",
      "output": "final_render.mp4",
      "duration": 12.5,
      "durationLabel": "0:00:12.500",
      "resolution": "1280x720",
      "fps": 30.0,
      "codec": "h264",
      "sizeBytes": 2094425,
      "sizeLabel": "2.0 MB",
      "renderSeconds": 7.0,
      "scenes": [
        {
          "id": "intro",
          "file": "intro.mp4",
          "start": "0:00:00.000",
          "end": "0:00:05.000",
          "duration": 5.0,
          "transition": "fade 1.5s"
        }
      ],
      "preview": "final_render_preview.mp4",
      "thumbnail": "final_render_thumb.jpg"
    }
    """.utf8)

    @Test func aRealManifestDecodes() throws {
        let manifest = try JSONDecoder().decode(RenderManifest.self, from: sample)
        #expect(manifest.output == "final_render.mp4")
        #expect(manifest.scenes.count == 1)
        #expect(manifest.scenes.first?.transition == "fade 1.5s")
        #expect(manifest.formatLabel == "1280x720 @ 30")
    }

    @Test func speedIsDurationOverRenderTime() throws {
        let manifest = try JSONDecoder().decode(RenderManifest.self, from: sample)
        #expect(abs(manifest.realtimeFactor - (12.5 / 7.0)) < 0.0001)
        #expect(manifest.speedLabel == "1.79×")
    }

    @Test func theTimestampParses() throws {
        let manifest = try JSONDecoder().decode(RenderManifest.self, from: sample)
        #expect(manifest.renderedAt != .distantPast)
    }

    /// `preview: false` omits both artifacts, so they must stay optional.
    @Test func manifestsWithoutArtifactsStillDecode() throws {
        let trimmed = Data("""
        {"generatedAt":"2026-08-31T19:38:17+0000","output":"a.mp4","duration":1,
         "durationLabel":"0:00:01","resolution":"1920x1080","fps":24,"codec":"h264",
         "sizeBytes":10,"sizeLabel":"10 B","renderSeconds":1,"scenes":[]}
        """.utf8)
        let manifest = try JSONDecoder().decode(RenderManifest.self, from: trimmed)
        #expect(manifest.thumbnail == nil)
        #expect(manifest.preview == nil)
        #expect(manifest.scenes.isEmpty)
    }
}

/// Google client ids drive the redirect scheme, so they must be validated.
struct YouTubeClientTests {

    private let valid = "123456789012-abcdefghijklmnop.apps.googleusercontent.com"

    @Test func aWellFormedClientIDIsAccepted() {
        #expect(YouTubeClient(clientID: valid, hasSecret: false).isValid)
    }

    @Test func junkIsRejected() {
        #expect(!YouTubeClient(clientID: "", hasSecret: false).isValid)
        #expect(!YouTubeClient(clientID: "not-a-client", hasSecret: false).isValid)
        #expect(!YouTubeClient(clientID: "short.apps.googleusercontent.com", hasSecret: false).isValid)
    }

    @Test func theRedirectIsTheReversedClientID() throws {
        let client = YouTubeClient(clientID: valid, hasSecret: false)
        let redirect = try #require(client.redirectURI)
        #expect(redirect == "com.googleusercontent.apps.123456789012-abcdefghijklmnop:/oauth2redirect")
    }

    @Test func anInvalidClientHasNoRedirect() {
        #expect(YouTubeClient(clientID: "nope", hasSecret: false).redirectURI == nil)
    }

    @Test func formEncodingEscapesReservedCharacters() {
        #expect(YouTubeService.formEncode(["a": "x y", "b": "p/q+r"]) == "a=x%20y&b=p%2Fq%2Br")
    }
}

/// Card entry has to reject typos before anything is submitted.
struct CardDraftTests {

    @Test func brandsAreDetectedFromTheLeadingDigits() {
        #expect(CardBrand.detect("4242424242424242") == .visa)
        #expect(CardBrand.detect("5555555555554444") == .mastercard)
        #expect(CardBrand.detect("378282246310005") == .amex)
        #expect(CardBrand.detect("6011111111111117") == .discover)
        #expect(CardBrand.detect("") == .unknown)
    }

    @Test func luhnAcceptsRealTestNumbersAndRejectsTypos() {
        #expect(CardDraft.passesLuhn("4242424242424242"))
        #expect(CardDraft.passesLuhn("378282246310005"))
        // One transposed digit must fail.
        #expect(!CardDraft.passesLuhn("4242424242424243"))
        #expect(!CardDraft.passesLuhn("abcd"))
    }

    @Test func amexGroupsFourSixFiveAndTakesAFourDigitCVC() {
        var card = CardDraft()
        card.number = CardDraft.format("378282246310005")
        #expect(card.number == "3782 822463 10005")
        #expect(card.brand == .amex)
        #expect(card.brand.cvcLength == 4)
        card.cvc = "1234"
        #expect(card.isCVCValid)
    }

    @Test func visaGroupsInFours() {
        #expect(CardDraft.format("4242424242424242") == "4242 4242 4242 4242")
    }

    @Test func expiryFormattingInsertsTheSlash() {
        #expect(CardDraft.formatExpiry("12") == "12")
        #expect(CardDraft.formatExpiry("1230") == "12/30")
        #expect(CardDraft.formatExpiry("12/30") == "12/30")
    }

    @Test func pastAndNonsenseExpiriesAreRejected() {
        var card = CardDraft()
        card.expiry = "01/20"
        #expect(!card.isExpiryValid)
        card.expiry = "13/40"
        #expect(!card.isExpiryValid)
        card.expiry = "12/40"
        #expect(card.isExpiryValid)
    }

    @Test func aCompleteCardNeedsAllThreeFields() {
        var card = CardDraft()
        card.number = CardDraft.format("4242424242424242")
        #expect(!card.isComplete)
        card.expiry = "12/40"
        #expect(!card.isComplete)
        card.cvc = "123"
        #expect(card.isComplete)
        #expect(card.last4 == "4242")
    }
}

/// Billing contact validation and promo resolution.
struct CheckoutInputTests {

    @Test func emailValidationCatchesTheCommonMistakes() {
        #expect(BillingContact.isValidEmail("a@b.co"))
        #expect(!BillingContact.isValidEmail("a@b"))
        #expect(!BillingContact.isValidEmail("@b.co"))
        #expect(!BillingContact.isValidEmail("ab.co"))
        #expect(!BillingContact.isValidEmail(""))
    }

    @Test func contactIsIncompleteUntilEveryRequiredFieldIsSet() {
        var contact = BillingContact()
        #expect(!contact.isComplete)
        contact.fullName = "Damon Eward"
        contact.email = "damoneward38@gmail.com"
        contact.addressLine = "1 Market St"
        contact.city = "San Francisco"
        #expect(!contact.isComplete)
        contact.postcode = "94105"
        #expect(contact.isComplete)
    }

    @Test func promoCodesAreCaseAndSpaceInsensitive() {
        #expect(PromoCode.match(" launch20 ", isAdmin: false)?.percentOff == 20)
        #expect(PromoCode.match("nope", isAdmin: false) == nil)
    }

    /// The 100% comp must be unreachable from a normal account.
    @Test func theOperatorCompIsGatedToAdmins() {
        #expect(PromoCode.match("INTERNAL100", isAdmin: false) == nil)
        #expect(PromoCode.match("INTERNAL100", isAdmin: true)?.percentOff == 100)
    }
}

/// Checkout pricing: line items, discounts, tax and the committed term.
@MainActor
struct CheckoutStoreTests {

    private func freshCheckout() -> CheckoutStore {
        UserDefaults.standard.removeObject(forKey: StoreKey.orders)
        return CheckoutStore()
    }

    @Test func seatsAndHostingBecomeTheirOwnLines() {
        let lines = CheckoutStore.lines(tier: .whiteLabel, seats: 3, hosting: .managed)
        #expect(lines.count == 3)
        #expect(lines[0].amount == 650)
        #expect(lines[1].amount == 30)   // 3 × $10
        #expect(lines[2].amount == 150)
    }

    @Test func aSoloFreePlanIsASingleZeroLine() {
        let lines = CheckoutStore.lines(tier: .free, seats: 0, hosting: nil)
        #expect(lines.count == 1)
        #expect(CheckoutStore.subtotal(tier: .free, seats: 0, hosting: nil) == 0)
    }

    @Test func discountAndTaxCompose() {
        // Professional $95 + 2 seats × $5 = $105
        let quote = CheckoutStore.quote(
            tier: .professional,
            seats: 2,
            hosting: nil,
            promo: PromoCode.match("LAUNCH20", isAdmin: false)
        )
        #expect(quote.subtotal == 105)
        #expect(quote.discount == 21)
        // Tax applies to the discounted amount, not the list price.
        #expect(quote.tax == CheckoutStore.tax(on: 84))
        #expect(quote.monthlyTotal == 84 + quote.tax)
    }

    /// A full comp must reach exactly zero, so no card is ever required.
    @Test func aFullCompCostsNothing() {
        let quote = CheckoutStore.quote(
            tier: .whiteLabel,
            seats: 5,
            hosting: .managed,
            promo: PromoCode.match("INTERNAL100", isAdmin: true)
        )
        #expect(quote.discount == quote.subtotal)
        #expect(quote.monthlyTotal == 0)
        #expect(quote.dueToday == 0)
        #expect(quote.isFree)
    }

    @Test func whiteLabelBillsItsThreeMonthTermUpFront() {
        let quote = CheckoutStore.quote(tier: .whiteLabel, seats: 0, hosting: .selfHosted, promo: nil)
        #expect(quote.termMonths == 3)
        #expect(quote.dueToday == quote.monthlyTotal * 3)
    }

    @Test func monthlyTiersBillOneMonth() {
        let quote = CheckoutStore.quote(tier: .starter, seats: 0, hosting: nil, promo: nil)
        #expect(quote.termMonths == 1)
        #expect(quote.dueToday == quote.monthlyTotal)
    }

    @Test func placingAnOrderKeepsOnlyTheLastFourDigits() throws {
        let checkout = freshCheckout()
        var card = CardDraft()
        card.number = CardDraft.format("4242424242424242")
        card.expiry = "12/40"
        card.cvc = "123"

        let order = checkout.placeOrder(
            tier: .professional,
            seats: 1,
            hosting: nil,
            promo: nil,
            contact: BillingContact(),
            card: card,
            placedByEmail: "someone@example.com",
            isAdmin: false
        )

        #expect(order.cardLast4 == "4242")
        #expect(order.cardBrand == .visa)
        // The full number must not survive anywhere on the persisted record.
        let encoded = try JSONEncoder().encode(order)
        let text = try #require(String(data: encoded, encoding: .utf8))
        #expect(!text.contains("4242424242424242"))
        #expect(checkout.orders.count == 1)
    }

    @Test func compedOrdersAreFlaggedOnlyForAdmins() {
        let checkout = freshCheckout()
        let order = checkout.placeOrder(
            tier: .enterprise,
            seats: 0,
            hosting: nil,
            promo: PromoCode.match("INTERNAL100", isAdmin: true),
            contact: BillingContact(),
            card: CardDraft(),
            placedByEmail: "damoneward38@gmail.com",
            isAdmin: true
        )
        #expect(order.wasCompedByAdmin)
        #expect(order.dueToday == 0)
    }

    @Test func referencesAreUniqueAndWellFormed() throws {
        let references = (0..<200).map { _ in Order.makeReference() }
        #expect(Set(references).count > 195)
        let sample = try #require(references.first)
        #expect(sample.hasPrefix("INT-"))
        #expect(sample.count == 13)
    }
}
