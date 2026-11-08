import CoreGraphics
import Foundation
import simd
import Testing
@testable import Integrav

/// Catalog integrity — the 300 behaviours must stay uniquely addressable,
/// because names and hotkeys are what chains and typed calls resolve against.
struct FunctionCatalogTests {

    @Test func catalogHasThreeHundredFunctions() {
        #expect(FunctionCatalog.all.count == 300)
    }

    @Test func everyNameIsUnique() {
        let names = FunctionCatalog.all.map(\.name)
        #expect(Set(names).count == names.count)
    }

    @Test func everyNameIsNonEmpty() {
        #expect(FunctionCatalog.all.allSatisfy { !$0.name.isEmpty })
    }

    @Test func hotkeysAreSequentialAndZeroPadded() {
        let functions = FunctionCatalog.all
        #expect(functions.first?.hotkey == "001")
        #expect(functions.last?.hotkey == "300")
        #expect(Set(functions.map(\.hotkey)).count == 300)
    }

    @Test func lookupByNameAndHotkeyAgree() throws {
        let fn = try #require(FunctionCatalog.function(hotkey: 1))
        #expect(FunctionCatalog.function(named: fn.name)?.hotkey == "001")
    }

    @Test func outOfRangeHotkeysReturnNil() {
        #expect(FunctionCatalog.function(hotkey: 0) == nil)
        #expect(FunctionCatalog.function(hotkey: 301) == nil)
    }

    @Test func everyFunctionProducesAPerformance() {
        #expect(FunctionCatalog.all.allSatisfy { !$0.performance.isEmpty })
    }

    @Test func scriptedLinesPointAtRealFunctions() {
        for name in FunctionCatalog.scripted.keys {
            #expect(FunctionCatalog.function(named: name) != nil, "scripted line for unknown function \(name)")
        }
    }

    @Test func everyCategoryHasMembers() {
        for category in FunctionCategory.allCases {
            let count = FunctionCatalog.all.filter { $0.category == category }.count
            #expect(count > 0, "\(category.rawValue) is empty")
        }
    }

    @Test func signaturesAreCallable() throws {
        let fn = try #require(FunctionCatalog.function(named: "tell_joke"))
        #expect(fn.signature == "tell_joke()")
    }
}

/// Plan tiers carry the published caps, SLA and prices, and throttle chain
/// length exactly like the server-side call limit.
struct PlanTierTests {

    @Test func chainLimitsMatchTheSheet() {
        #expect(PlanTier.free.maxChainSteps == 2)
        #expect(PlanTier.starter.maxChainSteps == 10)
        #expect(PlanTier.professional.maxChainSteps == 50)
        #expect(PlanTier.enterprise.maxChainSteps == 200)
        #expect(PlanTier.whiteLabel.maxChainSteps == 200)
    }

    @Test func pricesMatchTheSheet() {
        #expect(PlanTier.free.monthlyPrice == 0)
        #expect(PlanTier.starter.monthlyPrice == 25)
        #expect(PlanTier.professional.monthlyPrice == 95)
        #expect(PlanTier.enterprise.monthlyPrice == 350)
        #expect(PlanTier.whiteLabel.monthlyPrice == 650)
    }

    @Test func seatPricesMatchTheSheet() {
        #expect(PlanTier.free.seatPrice == 0)
        #expect(PlanTier.starter.seatPrice == 3)
        #expect(PlanTier.professional.seatPrice == 5)
        #expect(PlanTier.enterprise.seatPrice == 8)
        #expect(PlanTier.whiteLabel.seatPrice == 10)
    }

    @Test func volumeCapsAreFiniteUntilEnterprise() {
        #expect(PlanTier.free.monthlyCalls == 1_000)
        #expect(PlanTier.free.monthlyExecutions == 500)
        #expect(PlanTier.starter.monthlyExecutions == 5_000)
        #expect(PlanTier.professional.monthlyCalls == 1_000_000)
        #expect(PlanTier.enterprise.monthlyCalls == nil)
        #expect(PlanTier.whiteLabel.monthlyExecutions == nil)
        #expect(PlanTier.enterprise.callsLabel == "Unlimited")
        #expect(PlanTier.professional.callsLabel == "1M")
        #expect(PlanTier.starter.callsLabel == "10K")
    }

    @Test func whiteLabelCarriesAMinimumTerm() {
        #expect(PlanTier.whiteLabel.termMonths == 3)
        #expect(PlanTier.enterprise.termMonths == 1)
        #expect(PlanTier.whiteLabel.isWhiteLabel)
        #expect(!PlanTier.enterprise.isWhiteLabel)
    }

    @Test func limitsIncreaseWithTier() {
        let ordered: [PlanTier] = [.free, .starter, .professional, .enterprise]
        for (lhs, rhs) in zip(ordered, ordered.dropFirst()) {
            #expect(lhs.maxChainSteps < rhs.maxChainSteps)
            #expect(lhs.monthlyPrice < rhs.monthlyPrice)
            #expect(lhs.concurrentChains < rhs.concurrentChains)
        }
    }

    @Test func enterpriseAdvertisesFullCapacity() {
        #expect(PlanTier.enterprise.concurrentSlots == 100_000)
    }

    @Test func everyTierListsItsCaps() {
        for tier in PlanTier.allCases {
            #expect(tier.caps.count == 5)
            #expect(!tier.tagline.isEmpty)
            #expect(tier.uptime.hasPrefix("99."))
        }
    }
}

/// The licence quote: base plan + seats + white-label hosting.
struct PlanQuoteTests {

    @Test func seatsAddAtTheTierRate() {
        let quote = PlanQuote(tier: .professional, seats: 4, hosting: nil)
        #expect(quote.base == 95)
        #expect(quote.seatCost == 20)
        #expect(quote.hostingCost == 0)
        #expect(quote.total == 115)
    }

    @Test func whiteLabelAddsHostingAndATerm() {
        let managed = PlanQuote(tier: .whiteLabel, seats: 2, hosting: .managed)
        #expect(managed.total == 650 + 20 + 150)
        #expect(managed.termTotal == managed.total * 3)

        let selfHosted = PlanQuote(tier: .whiteLabel, seats: 0, hosting: .selfHosted)
        #expect(selfHosted.total == 660)
    }

    @Test func freeStaysFreeHoweverManySeats() {
        let quote = PlanQuote(tier: .free, seats: 25, hosting: nil)
        #expect(quote.total == 0)
        #expect(quote.totalLabel == "$0")
    }
}

/// White-label identity: naming, namespacing, accents.
struct BrandProfileTests {

    @Test func brandIDIsASafeSlug() {
        var brand = BrandProfile.default
        brand.name = "Cooper Avatar Cloud"
        #expect(brand.brandID == "cooper_avatar_cloud")
        #expect(brand.namespace == "brand.cooper_avatar_cloud.")

        brand.name = "  Acme!! 2026  "
        #expect(brand.brandID == "acme_2026")

        brand.name = ""
        #expect(brand.brandID == "brand")
    }

    @Test func displayNameFallsBackToTheHouseBrand() {
        var brand = BrandProfile.default
        #expect(brand.isEnabled == false)
        #expect(brand.displayName == BrandProfile.houseName)

        brand.isEnabled = true
        brand.name = "Nimbus"
        #expect(brand.displayName == "Nimbus")
    }

    @Test func accentPaletteIsUnique() {
        let hexes = BrandAccent.palette.map(\.hex)
        #expect(Set(hexes).count == hexes.count)
        #expect(hexes.contains(0xE879F9), "the house magenta must stay available")
    }

    @Test func hostingIsPricedBothWays() {
        #expect(WhiteLabelHosting.managed.monthlyPrice == 150)
        #expect(WhiteLabelHosting.selfHosted.monthlyPrice == 10)
    }
}

/// The metered billing month.
struct UsageWindowTests {

    @Test func aFreshWindowStartsEmptyAtTheMonthBoundary() {
        let window = UsageWindow()
        #expect(window.calls == 0)
        #expect(window.executions == 0)
        #expect(window.periodStart == UsageWindow.startOfMonth(for: .now))
        #expect(!window.isStale())
    }

    @Test func lastMonthsWindowIsStale() throws {
        let lastMonth = try #require(Calendar.current.date(byAdding: .month, value: -2, to: .now))
        let window = UsageWindow(periodStart: UsageWindow.startOfMonth(for: lastMonth), calls: 40, executions: 90)
        #expect(window.isStale())
    }

    @Test func fractionsClampAndTreatUnlimitedAsZero() {
        let window = UsageWindow()
        #expect(window.fraction(of: 100, used: 25) == 0.25)
        #expect(window.fraction(of: 100, used: 900) == 1)
        #expect(window.fraction(of: nil, used: 900) == 0)
    }
}

/// Registry behaviour: call resolution, chain building under a plan cap,
/// and the audit trail written on every execution.
@MainActor
struct RegistryStoreTests {

    private func freshStore() -> RegistryStore {
        let store = RegistryStore()
        store.clearDraft()
        store.clearLog()
        store.resetUsage()
        store.plan = .enterprise
        store.seats = 0
        store.brand = .default
        store.likedOnly = false
        store.query = ""
        store.category = nil
        return store
    }

    @Test func resolvesTypedCallsByNameSignatureAndHotkey() {
        let store = freshStore()
        #expect(store.function(matching: "tell_joke")?.name == "tell_joke")
        #expect(store.function(matching: "tell_joke()")?.name == "tell_joke")
        #expect(store.function(matching: "  001 ")?.hotkey == "001")
        #expect(store.function(matching: "042")?.hotkey == "042")
        #expect(store.function(matching: "not_a_real_function") == nil)
        #expect(store.function(matching: "") == nil)
    }

    @Test func searchFiltersByNameAndCategory() {
        let store = freshStore()
        store.query = "joke"
        #expect(store.filtered.allSatisfy { $0.name.contains("joke") || $0.title.lowercased().contains("joke") })

        store.query = ""
        store.category = .humor
        #expect(store.filtered.allSatisfy { $0.category == .humor })
        #expect(store.filtered.count == store.count(in: .humor))
    }

    @Test func freePlanCapsTheChainAtTwoCalls() throws {
        let store = freshStore()
        store.plan = .free

        let functions = Array(FunctionCatalog.all.prefix(3))
        #expect(store.toggleDraft(functions[0]) == true)
        #expect(store.toggleDraft(functions[1]) == true)
        #expect(store.toggleDraft(functions[2]) == false, "third call must be refused on Free")
        #expect(store.draft.count == 2)
        #expect(store.limitNotice != nil)
        #expect(store.draftHeadroom == 0)

        store.clearDraft()
    }

    @Test func raisingThePlanReopensTheChain() throws {
        let store = freshStore()
        store.plan = .free
        let functions = Array(FunctionCatalog.all.prefix(3))
        _ = store.toggleDraft(functions[0])
        _ = store.toggleDraft(functions[1])
        #expect(store.toggleDraft(functions[2]) == false)

        store.plan = .starter
        #expect(store.toggleDraft(functions[2]) == true)
        #expect(store.draft.count == 3)

        store.clearDraft()
        store.plan = .enterprise
    }

    @Test func togglingTheSameFunctionRemovesItFromTheChain() throws {
        let store = freshStore()
        let fn = try #require(FunctionCatalog.function(named: "tell_joke"))
        _ = store.toggleDraft(fn)
        #expect(store.isInDraft(fn))
        _ = store.toggleDraft(fn)
        #expect(!store.isInDraft(fn))
        store.clearDraft()
    }

    @Test func runningAFunctionWritesTheCallLog() throws {
        let store = freshStore()
        let twin = TwinStore()
        let fn = try #require(FunctionCatalog.function(named: "tell_joke"))

        store.run(fn, on: twin, source: .hotkey)

        let entry = try #require(store.callLog.first)
        #expect(entry.function == "tell_joke")
        #expect(entry.source == .hotkey)
        #expect(entry.arguments["hotkey"] == fn.hotkey)
        #expect(entry.arguments["category"] == fn.category.rawValue)
        #expect(entry.result == fn.performance)
        #expect(entry.durationMs > 0)
        #expect(store.runCount(for: fn) >= 1)

        store.clearLog()
    }

    @Test func runsAccumulateIntoTheLeaderboard() throws {
        let store = freshStore()
        let twin = TwinStore()
        let fn = try #require(FunctionCatalog.function(named: "roast"))

        let before = store.runCount(for: fn)
        store.run(fn, on: twin)
        store.run(fn, on: twin)
        #expect(store.runCount(for: fn) == before + 2)
        #expect(store.mostUsed(limit: 1).first?.count ?? 0 >= 2)
        #expect(store.usageByCategory.contains { $0.category == fn.category })

        store.clearLog()
    }

    @Test func overLongChainsAreRefusedByThePlan() {
        let store = freshStore()
        let twin = TwinStore()
        store.plan = .free
        store.clearLog()

        let steps = FunctionCatalog.all.prefix(5).map(\.name)
        store.run(chain: FunctionChain(name: "Too long", steps: Array(steps)), on: twin)

        #expect(store.runningChain == nil)
        #expect(store.limitNotice != nil)
        #expect(store.callLog.isEmpty, "a refused chain must not log any calls")

        store.plan = .enterprise
    }

    @Test func likesToggleAndFilter() throws {
        let store = freshStore()
        let fn = try #require(FunctionCatalog.function(named: "flirt"))
        let wasLiked = store.isLiked(fn)

        store.toggleLike(fn)
        #expect(store.isLiked(fn) != wasLiked)

        if store.isLiked(fn) {
            store.likedOnly = true
            #expect(store.filtered.contains(fn))
            store.likedOnly = false
        }

        store.toggleLike(fn)
        #expect(store.isLiked(fn) == wasLiked)
    }

    @Test func savingADraftCreatesAChain() throws {
        let store = freshStore()
        let fn = try #require(FunctionCatalog.function(named: "greeting"))
        _ = store.toggleDraft(fn)

        let chain = try #require(store.saveDraft(as: "  Test routine  "))
        #expect(chain.name == "Test routine")
        #expect(chain.steps == [fn.name])
        #expect(store.chains.contains(chain))

        store.delete(chain)
        #expect(!store.chains.contains(chain))
        store.clearDraft()
    }

    @Test func emptyDraftsCannotBeSaved() {
        let store = freshStore()
        #expect(store.saveDraft(as: "Nothing") == nil)
    }

    @Test func runningMetersTheBillingMonth() throws {
        let store = freshStore()
        let twin = TwinStore()
        let fn = try #require(FunctionCatalog.function(named: "greeting"))

        #expect(store.usage.calls == 0)
        #expect(store.run(fn, on: twin) == true)
        #expect(store.usage.calls == 1)
        #expect(store.usage.executions == 1)

        // A chain step bills as an execution, not a second dispatch.
        #expect(store.run(fn, on: twin, source: .chain, chain: "Demo") == true)
        #expect(store.usage.calls == 1)
        #expect(store.usage.executions == 2)

        store.resetUsage()
        #expect(store.usage.executions == 0)
        store.clearLog()
    }

    @Test func quotasRefuseVolumeBeyondTheTier() {
        let store = freshStore()

        store.plan = .enterprise
        #expect(store.quotaRefusal(calls: 1, executions: 1) == nil, "unlimited tiers never refuse")

        store.plan = .free
        #expect(store.quotaRefusal(calls: 2_000, executions: 1) != nil)
        #expect(store.quotaRefusal(calls: 1, executions: 900) != nil)
        #expect(store.quotaRefusal(calls: 1, executions: 1) == nil)
        #expect(store.isOverQuota == false)

        store.plan = .enterprise
    }

    @Test func licenceQuoteTracksPlanSeatsAndHosting() {
        let store = freshStore()

        store.plan = .starter
        store.seats = 3
        #expect(store.quote.total == 25 + 9)

        store.select(.whiteLabel)
        store.brand.hosting = .selfHosted
        #expect(store.brand.isEnabled, "picking White-Label turns branding on")
        #expect(store.quote.total == 650 + 30 + 10)

        store.select(.starter)
        #expect(!store.brand.isEnabled, "leaving White-Label turns branding off")
        #expect(store.quote.hostingCost == 0)

        store.seats = 0
        store.plan = .enterprise
    }

    @Test func brandingRenamesAndNamespacesTheApp() {
        let store = freshStore()
        #expect(store.appName == BrandProfile.houseName)
        #expect(store.namespace.isEmpty)
        #expect(store.namespaced("tell_joke") == "tell_joke")

        store.brand.name = "Nimbus Twin"
        store.setBranding(true)
        #expect(store.plan == .whiteLabel)
        #expect(store.appName == "Nimbus Twin")
        #expect(store.namespaced("tell_joke") == "brand.nimbus_twin.tell_joke")

        store.setBranding(false)
        #expect(store.plan == .enterprise)
        #expect(store.appName == BrandProfile.houseName)
        store.brand = .default
    }

    @Test func seededChainsReferenceRealFunctions() {
        let store = freshStore()
        for chain in store.chains {
            for step in chain.steps {
                #expect(FunctionCatalog.function(named: step) != nil, "chain \(chain.name) references unknown \(step)")
            }
        }
    }
}

/// Face measurements must survive bad detections without producing a broken head.
struct FaceMetricsTests {

    @Test func neutralMetricsAreAlreadySane() {
        let metrics = FaceMetrics.neutral
        #expect(metrics.sanitized() == metrics)
    }

    @Test func sanitizingClampsWildValues() {
        var metrics = FaceMetrics.neutral
        metrics.interocular = 9
        metrics.jawWidth = -4
        metrics.eyeLine = 12
        metrics.roll = 3
        metrics.confidence = 5

        let clean = metrics.sanitized()
        #expect(clean.interocular <= 0.58)
        #expect(clean.jawWidth >= 0.55)
        #expect(clean.eyeLine <= 0.8)
        #expect(abs(clean.roll) <= 0.5)
        #expect(clean.confidence <= 1)
    }

    @Test func landmarkLinesStayInAnatomicalOrder() {
        var metrics = FaceMetrics.neutral
        metrics.mouthLine = 0.4
        metrics.noseLine = 0.3
        metrics.eyeLine = 0.5

        let clean = metrics.sanitized()
        #expect(clean.mouthLine < clean.noseLine, "the mouth sits below the nose")
        #expect(clean.noseLine < clean.eyeLine, "the nose sits below the eyes")
    }

    @Test func tinyOrUnconfidentFacesAreRejected() {
        var metrics = FaceMetrics.neutral
        metrics.confidence = 0.9
        #expect(metrics.isUsable)

        metrics.boxWidth = 0.02
        #expect(!metrics.isUsable)

        metrics.boxWidth = 0.5
        metrics.confidence = 0.05
        #expect(!metrics.isUsable)
    }

    @Test func readoutCoversEveryHeadline() {
        let labels = FaceMetrics.neutral.readout.map(\.0)
        #expect(labels.contains("interocular"))
        #expect(labels.contains("jaw"))
        #expect(labels.contains("confidence"))
    }
}

/// The generated head must be watertight, textured and rigged — every time.
struct FaceMeshBuilderTests {

    @Test func meshHasTheExpectedTopology() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        let expectedVertices = (FaceMeshBuilder.rows + 1) * (FaceMeshBuilder.columns + 1)
        #expect(mesh.vertexCount == expectedVertices)
        #expect(mesh.normals.count == expectedVertices)
        #expect(mesh.uvs.count == expectedVertices)
        #expect(mesh.triangleCount == FaceMeshBuilder.rows * FaceMeshBuilder.columns * 2)
    }

    @Test func everyIndexAddressesARealVertex() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        let count = Int32(mesh.vertexCount)
        #expect(mesh.indices.allSatisfy { $0 >= 0 && $0 < count })
        #expect(mesh.indices.count % 3 == 0)
    }

    @Test func geometryIsFiniteAndBounded() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        for position in mesh.positions {
            #expect(position.x.isFinite && position.y.isFinite && position.z.isFinite)
            #expect(abs(position.y) <= 0.75)
            #expect(abs(position.x) <= 0.75)
        }
    }

    @Test func normalsAreUnitLength() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        for normal in mesh.normals {
            let length = (normal.x * normal.x + normal.y * normal.y + normal.z * normal.z).squareRoot()
            #expect(abs(length - 1) < 0.001)
        }
    }

    @Test func textureCoordinatesStayInsideThePhoto() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        #expect(mesh.uvs.allSatisfy { $0.x >= 0 && $0.x <= 1 && $0.y >= 0 && $0.y <= 1 })
    }

    @Test func everyBlendShapeIsPresentAndMatchesTheBase() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        #expect(mesh.morphs.count == FaceMorph.allCases.count)
        for (index, morph) in FaceMorph.allCases.enumerated() {
            #expect(mesh.morphs[index].morph == morph, "morph order must match FaceMorph raw values")
            #expect(mesh.morphs[index].positions.count == mesh.vertexCount)
            #expect(mesh.morphs[index].normals.count == mesh.vertexCount)
        }
    }

    @Test func everyBlendShapeActuallyMovesGeometry() {
        let mesh = FaceMeshBuilder.build(from: .neutral)
        for target in mesh.morphs {
            let moved = zip(target.positions, mesh.positions).contains { deformed, base in
                simd_distance(deformed, base) > 0.001
            }
            #expect(moved, "\(target.morph.name) deforms nothing")
        }
    }

    @Test func openingTheMouthOnlyMovesTheJaw() throws {
        let metrics = FaceMetrics.neutral
        let mesh = FaceMeshBuilder.build(from: metrics)
        let shape = HeadShape(metrics: metrics)
        let target = try #require(mesh.morphs.first { $0.morph == .mouthOpen })

        for (index, base) in mesh.positions.enumerated() where base.y > shape.eyeY + 0.05 {
            #expect(simd_distance(target.positions[index], base) < 0.0011,
                    "the forehead must not move when the jaw drops")
        }

        let chinIndex = try #require(
            mesh.positions.indices.min { lhs, rhs in mesh.positions[lhs].y < mesh.positions[rhs].y }
        )
        #expect(target.positions[chinIndex].y < mesh.positions[chinIndex].y, "the chin drops")
    }

    @Test func aWiderFaceProducesAWiderHead() {
        var narrow = FaceMetrics.neutral
        narrow.boxWidth = 0.4
        narrow.boxHeight = 0.68

        var wide = FaceMetrics.neutral
        wide.boxWidth = 0.6
        wide.boxHeight = 0.62

        let narrowShape = HeadShape(metrics: narrow.sanitized())
        let wideShape = HeadShape(metrics: wide.sanitized())
        #expect(wideShape.radiusX > narrowShape.radiusX)
    }

    @Test func landmarkLinesLandOnTheHeadInOrder() {
        let shape = HeadShape(metrics: .neutral)
        #expect(shape.mouthY < shape.noseY)
        #expect(shape.noseY < shape.eyeY)
        #expect(shape.eyeY < FaceMeshBuilder.browY)
        #expect(shape.mouthY > FaceMeshBuilder.chinY)
    }

    @Test func theNoseProtrudesFurtherThanTheCheek() {
        let shape = HeadShape(metrics: .neutral)
        let phi = acos((shape.noseY / shape.radiusY).clamped(to: -1...1))
        let nose = shape.point(phi: phi, theta: 0)
        let cheek = shape.point(phi: phi, theta: 0.6)
        #expect(nose.z > cheek.z)
    }

    @Test func metricsSurviveARoundTripThroughStorage() throws {
        let record = FaceCaptureRecord(
            imageFile: "face_test.jpg",
            metrics: .neutral,
            capturedAt: .now,
            source: .camera,
            vertexCount: 3_185
        )
        let data = try JSONEncoder().encode(record)
        let decoded = try JSONDecoder().decode(FaceCaptureRecord.self, from: data)
        #expect(decoded.metrics == record.metrics)
        #expect(decoded.source == .camera)
        #expect(decoded.vertexCount == 3_185)
    }
}

/// The Supabase row shapes must survive the trip in both directions, because
/// every one of them is what a second device rebuilds the app from.
@MainActor
struct CloudMappingTests {

    @Test func licenceRowCarriesTierSeatsAndBranding() {
        var brand = BrandProfile.default
        brand.isEnabled = true
        brand.name = "Nimbus Twin"
        brand.domain = "twin.nimbus.io"
        brand.accentHex = 0xA3E635
        brand.hosting = .selfHosted

        let row = LicenceRow(userId: "usr_1", plan: .whiteLabel, seats: 4, brand: brand)
        #expect(row.plan == "whiteLabel")
        #expect(row.tier == .whiteLabel)
        #expect(row.seats == 4)
        #expect(row.brandAccentHex == "#A3E635")
        #expect(row.brand == brand)
    }

    @Test func unknownPlanFallsBackInsteadOfCrashing() {
        let row = LicenceRow(userId: "usr_1", plan: .starter, seats: 0, brand: .default)
        #expect(row.tier == .starter)
        #expect(LicenceRow.colour(from: "nonsense") == 0xE879F9)
        #expect(LicenceRow.colour(from: "#22D3EE") == 0x22D3EE)
        #expect(LicenceRow.colour(from: "22D3EE") == 0x22D3EE)
    }

    @Test func chainSurvivesTheRoundTrip() {
        let chain = FunctionChain(name: "Warm open", steps: ["greeting", "tell_joke"])
        let restored = ChainRow(chain: chain, userId: "usr_1").chain
        #expect(restored.id == chain.id)
        #expect(restored.name == chain.name)
        #expect(restored.steps == chain.steps)
    }

    @Test func loggedCallSurvivesTheRoundTrip() {
        let entry = CallLogEntry(
            function: "tell_joke",
            arguments: ["hotkey": "001", "category": "humor"],
            result: "Here's one.",
            source: .chain,
            chain: "Warm open",
            durationMs: 84
        )
        let restored = CallRow(entry: entry, userId: "usr_1").entry
        #expect(restored == entry)
    }

    @Test func unknownCallSourceDegradesToRegistry() throws {
        let json = """
        {"id":"3F2504E0-4F89-11D3-9A0C-0305E82C3301","user_id":"usr_1","function_name":"greeting",\
        "arguments":{},"result":"Hi","source":"telepathy","chain":null,"duration_ms":12,\
        "called_at":"2026-08-31T10:00:00Z"}
        """
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let row = try decoder.decode(CallRow.self, from: Data(json.utf8))
        #expect(row.entry.source == .registry)
    }

    @Test func clipSurvivesTheRoundTrip() {
        let video = SourceVideo(name: "keynote.mp4", minutes: 42)
        let restored = ClipRow(video: video, userId: "usr_1").video
        #expect(restored.id == video.id)
        #expect(restored.minutes == 42)
    }

    @Test func faceRowKeepsEveryMeasurement() {
        let record = FaceCaptureRecord(
            imageFile: "face.jpg",
            metrics: .neutral,
            capturedAt: .now,
            source: .library,
            vertexCount: 3_185
        )
        let row = FaceRow(record: record, userId: "usr_1")
        #expect(row.metrics == record.metrics)
        #expect(row.source == "library")
        #expect(row.vertexCount == 3_185)
    }

    @Test func syncStatesReadAsPlainEnglish() {
        #expect(CloudSync.State.signedOut.label == "Not signed in")
        #expect(CloudSync.State.syncing.isBusy)
        #expect(!CloudSync.State.unconfigured.isBusy)
        #expect(CloudSync.State.failed("Sync failed").label == "Sync failed")
        #expect(CloudSync.State.synced(.now).symbol == "checkmark.icloud")
    }

    @Test func syncIsInertUntilSomebodySignsIn() {
        let cloud = CloudSync.shared
        #expect(!cloud.isSignedIn, "tests never hold a session")
        // Pushes from an unauthenticated app must be no-ops, not crashes.
        cloud.pushLicence(plan: .starter, seats: 1, brand: .default)
        cloud.pushUsage(UsageWindow())
        cloud.removeFace()
        #expect(cloud.inFlight == 0)
    }
}

/// Cloud state must land in the stores without echoing straight back up.
@MainActor
struct CloudAdoptionTests {

    /// A store with the persisted state wiped, so assertions start from zero.
    private func freshStore() -> RegistryStore {
        let defaults = UserDefaults.standard
        for key in [
            StoreKey.chains,
            StoreKey.chainDraft,
            StoreKey.functionRuns,
            StoreKey.callLog,
            StoreKey.likes,
            StoreKey.usage,
            StoreKey.planTier,
            StoreKey.seats,
            StoreKey.brand,
        ] {
            defaults.removeObject(forKey: key)
        }
        return RegistryStore()
    }

    @Test func adoptingALicenceReplacesTheLocalOne() {
        let store = freshStore()
        var brand = BrandProfile.default
        brand.isEnabled = true
        brand.name = "Nimbus Twin"

        store.applyCloudLicence(tier: .whiteLabel, seats: 6, brand: brand)
        #expect(store.plan == .whiteLabel)
        #expect(store.seats == 6)
        #expect(store.appName == "Nimbus Twin")

        store.applyCloudLicence(tier: .enterprise, seats: 0, brand: .default)
        #expect(store.appName == BrandProfile.houseName)
    }

    @Test func adoptingChainsLikesAndRunsMerges() {
        let store = freshStore()
        let remote = FunctionChain(name: "Remote routine", steps: ["greeting"])

        store.applyCloudChains([remote])
        #expect(store.chains == [remote])

        store.applyCloudLikes(["greeting", "tell_joke"])
        #expect(store.likes.count == 2)
        #expect(store.likedFunctions.count == 2)

        store.applyCloudRuns(["greeting": 9])
        #expect(store.totalRuns == 9)

        store.applyCloudCallLog([])
        #expect(store.callLog.isEmpty)
    }

    @Test func renamingAndReSteppingAChainEditsInPlace() throws {
        let store = freshStore()
        let fn = try #require(FunctionCatalog.function(named: "greeting"))
        _ = store.toggleDraft(fn)
        let chain = try #require(try? store.saveDraft(as: "Draft one"))
        let countBefore = store.chains.count

        store.rename(chain, to: "  Board demo v2  ")
        store.update(chain, steps: ["greeting", "tell_joke"])

        let edited = try #require(store.chains.first { $0.id == chain.id })
        #expect(edited.name == "Board demo v2")
        #expect(edited.steps == ["greeting", "tell_joke"])
        #expect(store.chains.count == countBefore, "editing must not duplicate the routine")

        store.rename(chain, to: "   ")
        #expect(store.chains.first { $0.id == chain.id }?.name == "Board demo v2", "blank names are refused")

        store.delete(chain)
        store.clearDraft()
    }

    @Test func exportedLogIsValidJSON() throws {
        let store = freshStore()
        let twin = TwinStore()
        let fn = try #require(FunctionCatalog.function(named: "greeting"))
        #expect(store.run(fn, on: twin))

        let json = store.exportLogJSON()
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let decoded = try decoder.decode([CallLogEntry].self, from: Data(json.utf8))
        #expect(decoded.first?.function == "greeting")

        store.clearLog()
        let emptied = try decoder.decode([CallLogEntry].self, from: Data(store.exportLogJSON().utf8))
        #expect(emptied.isEmpty)
    }

    @Test func adoptedClipsFeedTheTrainingRing() {
        let twin = TwinStore()
        twin.applyCloudClips([SourceVideo(name: "remote.mov", minutes: 60)])
        #expect(twin.videos.count == 1)
        let before = twin.ingestedHours

        let added = twin.addVideo(name: "local.mov", minutes: 120)
        #expect(twin.ingestedHours == before + 2)

        twin.removeVideo(added)
        #expect(twin.ingestedHours == before)
    }
}

/// Reading the identity out of the retired session, so the records it once
/// encrypted can be carried onto the account that replaces it.
struct AuthTokenTests {

    nonisolated private func token(sub: String, expiresIn: TimeInterval) -> String {
        let payload = """
        {"sub":"\(sub)","email":"founder@integrav.app","name":"Founder",\
        "picture":null,"exp":\(Date().addingTimeInterval(expiresIn).timeIntervalSince1970)}
        """
        let body = Data(payload.utf8).base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
        return "header.\(body).signature"
    }

    @Test func aTokenYieldsTheIdentityItSealedRecordsUnder() throws {
        let subject = try #require(AuthManager.subject(fromToken: token(sub: "usr_42", expiresIn: 3_600)))
        #expect(subject == "usr_42")
    }

    /// The whole point of the carry-forward: the retired session is always long
    /// expired by the time anyone runs this build, and refusing it would strand
    /// exactly the people it exists to rescue.
    @Test func anExpiredTokenStillYieldsItsIdentity() throws {
        let subject = try #require(AuthManager.subject(fromToken: token(sub: "usr_42", expiresIn: -60_000)))
        #expect(subject == "usr_42")
    }

    @Test func garbageIsRefused() {
        #expect(AuthManager.subject(fromToken: "not-a-token") == nil)
        #expect(AuthManager.subject(fromToken: "a.b.c") == nil)
        #expect(AuthManager.subject(fromToken: "") == nil)
    }

    @Test func displayNameFallsBackToTheEmail() {
        let user = AuthManager.User(id: "usr_1", email: "a@b.co", name: nil, picture: nil)
        #expect(user.displayName == "a@b.co")
    }
}

/// The email and password rules the sign-in screen enforces before anything
/// touches the network.
struct CredentialValidationTests {

    @Test func ordinaryAddressesAreAccepted() {
        #expect(AuthManager.isValidEmail("founder@integrav.app"))
        #expect(AuthManager.isValidEmail("a.b+tag@sub.domain.co.uk"))
    }

    @Test func brokenAddressesAreRefused() {
        #expect(!AuthManager.isValidEmail("founder"))
        #expect(!AuthManager.isValidEmail("founder@"))
        #expect(!AuthManager.isValidEmail("@integrav.app"))
        #expect(!AuthManager.isValidEmail("founder@integrav"))
        #expect(!AuthManager.isValidEmail("two@at@signs.com"))
        #expect(!AuthManager.isValidEmail("has space@integrav.app"))
    }

    /// Typed addresses arrive with stray capitals and a trailing space from the
    /// keyboard. The account they resolve to must not depend on either, or the
    /// same person signs up twice and wonders where their twin went.
    @Test func addressesAreNormalisedBeforeUse() {
        #expect(AuthManager.normalise("  Founder@Integrav.App ") == "founder@integrav.app")
    }

    @Test func shortPasswordsAreRefusedBeforeTheServerSeesThem() {
        #expect(AuthManager.passwordProblem("short") != nil)
        let oneShort = String(repeating: "a", count: AuthManager.minimumPasswordLength - 1)
        #expect(AuthManager.passwordProblem(oneShort) != nil)
    }

    @Test func aLongEnoughPasswordPasses() {
        let allowed = String(repeating: "a", count: AuthManager.minimumPasswordLength)
        #expect(AuthManager.passwordProblem(allowed) == nil)
    }
}

/// Server English is rewritten into something a person can act on.
struct AuthErrorMessageTests {

    nonisolated private struct ServerError: LocalizedError {
        let text: String
        var errorDescription: String? { text }
    }

    @Test func aWrongPasswordSaysSoAndOffersTheWayOut() {
        let message = AuthManager.friendly(ServerError(text: "Invalid login credentials"))
        #expect(message.lowercased().contains("don't match"))
        #expect(message.lowercased().contains("create an account"))
    }

    @Test func anUnconfirmedEmailPointsAtTheInbox() {
        let message = AuthManager.friendly(ServerError(text: "Email not confirmed"))
        #expect(message.lowercased().contains("inbox"))
    }

    @Test func aTakenAddressSuggestsSigningInInstead() {
        let message = AuthManager.friendly(ServerError(text: "User already registered"))
        #expect(message.lowercased().contains("sign in"))
    }

    @Test func anUnreachableServerKeepsTheDeviceOnlyOptionVisible() {
        let message = AuthManager.friendly(ServerError(text: "The request timed out."))
        #expect(message.lowercased().contains("this device only"))
    }

    /// An error nobody anticipated is passed through rather than replaced with
    /// a reassuring lie about what went wrong.
    @Test func anUnknownFailureIsReportedVerbatim() {
        #expect(AuthManager.friendly(ServerError(text: "Teapot refused")) == "Teapot refused")
    }
}

/// The mouth blend shape is driven by the twin's own level meter.
@MainActor
struct SpeechEnvelopeTests {

    @Test func silenceKeepsTheMouthClosed() {
        let twin = TwinStore()
        twin.stopWave()
        #expect(twin.speechEnvelope == 0)
    }

    @Test func envelopeStaysInsideBlendShapeRange() async {
        let twin = TwinStore()
        twin.startWave()
        try? await Task.sleep(for: .milliseconds(180))
        let envelope = twin.speechEnvelope
        twin.stopWave()
        #expect(envelope >= 0 && envelope <= 1)
    }
}

/// Render farm: stage weighting must match houly-pipe, and a job that never
/// uploads must still be able to reach 100%.
struct RenderJobTests {

    @Test func uploadIsSkippedUnlessRequested() {
        let local = RenderJob(title: "Cut the launch film", sceneCount: 4, outputDuration: 600)
        #expect(local.activeStages == [.trim, .render, .preview])

        let published = RenderJob(
            title: "Cut and publish",
            sceneCount: 4,
            outputDuration: 600,
            uploadsToYouTube: true,
            usesGreenScreen: true
        )
        #expect(published.activeStages == RenderStage.allCases)
    }

    /// Keying is the slowest stage, so a job that does not key must not carry
    /// its weight — the bar would crawl through a stage that never runs.
    @Test func compositeStageOnlyAppearsWhenTheJobKeys() {
        let plain = RenderJob(title: "No key", sceneCount: 2, outputDuration: 60)
        #expect(!plain.activeStages.contains(.composite))

        let keyed = RenderJob(
            title: "Keyed",
            sceneCount: 2,
            outputDuration: 60,
            usesGreenScreen: true
        )
        #expect(keyed.activeStages.first == .composite)
        #expect(keyed.activeStages == [.composite, .trim, .render, .preview])
    }

    @Test func aKeyedJobStillReachesFullProgressOnItsLastStage() {
        var job = RenderJob(
            title: "Keyed master",
            sceneCount: 3,
            outputDuration: 300,
            usesGreenScreen: true
        )
        job.stage = .preview
        job.stageProgress = 1
        #expect(abs(job.overallProgress - 1) < 0.0001)
    }

    /// A queue persisted before green screen existed must still decode.
    @Test func jobsSavedBeforeGreenScreenExistedStillDecode() throws {
        let legacy = """
        {"id":"\(UUID().uuidString)","title":"Old job","sceneCount":3,\
        "outputDuration":120,"resolution":"1920x1080","fps":30,"stage":"trim",\
        "stageProgress":0.5,"uploadsToYouTube":false,"queuedAt":760000000}
        """
        let data = try #require(legacy.data(using: .utf8))
        let decoder = JSONDecoder()
        let job = try decoder.decode(RenderJob.self, from: data)
        #expect(!job.usesGreenScreen)
        #expect(!job.activeStages.contains(.composite))
    }

    @Test func spokenCommandsTurnOnKeyingOnlyWhenTheyMeanIt() {
        #expect(EngineStore.mentionsGreenScreen("render the intro on a green screen"))
        #expect(EngineStore.mentionsGreenScreen("key out the chroma backdrop"))
        #expect(EngineStore.mentionsGreenScreen("shoot was on a blue screen"))
        #expect(!EngineStore.mentionsGreenScreen("render the green valley documentary"))
        #expect(!EngineStore.mentionsGreenScreen("render the film"))
    }

    /// The bug worth guarding: with upload skipped the remaining weights sum to
    /// 0.88, so an un-normalised progress bar would stall short of full.
    @Test func aLocalOnlyJobReachesFullProgressOnItsLastStage() {
        var job = RenderJob(title: "Local master", sceneCount: 3, outputDuration: 300)
        job.stage = .preview
        job.stageProgress = 1
        #expect(abs(job.overallProgress - 1) < 0.0001)
    }

    @Test func progressAccumulatesEarlierStageWeights() {
        var job = RenderJob(
            title: "Published master",
            sceneCount: 6,
            outputDuration: 900,
            uploadsToYouTube: true
        )
        job.stage = .render
        job.stageProgress = 0.5
        // trim (0.24) + half of render (0.30) over a total weight of 1.0
        #expect(abs(job.overallProgress - 0.54) < 0.0001)
    }

    @Test func progressIsMonotonicAcrossEveryStage() {
        var job = RenderJob(title: "Sweep", sceneCount: 5, outputDuration: 120, uploadsToYouTube: true)
        var last = -1.0
        for stage in job.activeStages {
            for fraction in [0.0, 0.5, 0.999] {
                job.stage = stage
                job.stageProgress = fraction
                let value = job.overallProgress
                #expect(value >= last)
                #expect(value >= 0 && value <= 1)
                last = value
            }
        }
    }

    @Test func finishedJobsPinToOneRegardlessOfStage() {
        var job = RenderJob(title: "Done", sceneCount: 2, outputDuration: 90)
        job.stage = .trim
        job.stageProgress = 0
        job.finishedAt = .now
        #expect(job.overallProgress == 1)
        #expect(job.isFinished)
        #expect(job.statusLabel == "Master ready")
    }

    @Test func outOfRangeStageProgressIsClamped() {
        var job = RenderJob(title: "Clamp", sceneCount: 2, outputDuration: 90)
        job.stage = .trim
        job.stageProgress = 4
        #expect(job.overallProgress <= 1)
        job.stageProgress = -3
        #expect(job.overallProgress >= 0)
    }

    @Test func durationLabelSwitchesToHoursForLongMasters() {
        #expect(RenderJob(title: "a", sceneCount: 1, outputDuration: 252).durationLabel == "4:12")
        #expect(RenderJob(title: "b", sceneCount: 1, outputDuration: 3_732).durationLabel == "1:02:12")
    }

    @Test func failureTakesOverTheStatusLine() {
        var job = RenderJob(title: "Broken", sceneCount: 1, outputDuration: 60)
        job.failure = "LUT not found"
        #expect(job.hasFailed)
        #expect(job.statusLabel == "LUT not found")
    }
}

/// Render commands must route to the render farm and land a real job on the queue.
@MainActor
struct RenderQueueTests {

    private func freshEngine() -> EngineStore {
        UserDefaults.standard.removeObject(forKey: StoreKey.renderQueue)
        UserDefaults.standard.removeObject(forKey: StoreKey.feed)
        UserDefaults.standard.removeObject(forKey: StoreKey.fleets)
        return EngineStore()
    }

    @Test func everyFleetKindHasALiveFleet() {
        let engine = freshEngine()
        for kind in TaskKind.allCases {
            #expect(engine.fleets.contains { $0.kind == kind })
        }
    }

    @Test func renderWordsRouteToTheRenderFarm() {
        #expect(TaskKind.infer(from: "Render the launch film in 4K") == .render)
        #expect(TaskKind.infer(from: "Cut the footage and export a master") == .render)
        #expect(TaskKind.infer(from: "Upload it to YouTube") == .render)
        // Existing routing must not regress.
        #expect(TaskKind.infer(from: "Run a pen-test sweep") == .security)
        #expect(TaskKind.infer(from: "Train my twin on new clips") == .training)
    }

    @Test func dispatchingARenderQueuesAJob() throws {
        let engine = freshEngine()
        #expect(engine.renderQueue.isEmpty)
        let task = try #require(engine.dispatch(command: "Render the launch film in 4K and upload to YouTube"))
        #expect(task.kind == .render)
        let job = try #require(engine.renderQueue.first)
        #expect(job.uploadsToYouTube)
        #expect(job.resolution == "3840x2160")
        #expect(job.stage == .trim)
    }

    @Test func nonRenderCommandsLeaveTheQueueAlone() {
        let engine = freshEngine()
        engine.dispatch(command: "Run a legal pen-test sweep")
        #expect(engine.renderQueue.isEmpty)
    }

    @Test func formatIsInferredFromTheCommand() {
        let engine = freshEngine()
        #expect(engine.enqueueRender(from: "Render a vertical short").resolution == "1080x1920")
        #expect(engine.enqueueRender(from: "Render it in 1080p").resolution == "1920x1080")
        #expect(engine.enqueueRender(from: "Render the film at 30fps").fps == 30)
        #expect(engine.enqueueRender(from: "Render the film").fps == 60)
        #expect(!engine.enqueueRender(from: "Render the film").uploadsToYouTube)
    }

    @Test func theQueueIsCappedSoItCannotGrowForever() {
        let engine = freshEngine()
        for index in 0..<30 { engine.enqueueRender(from: "Render clip \(index)") }
        #expect(engine.renderQueue.count == 12)
    }

    @Test func cancellingRemovesExactlyOneJob() throws {
        let engine = freshEngine()
        engine.enqueueRender(from: "Render one")
        let target = engine.enqueueRender(from: "Render two")
        engine.enqueueRender(from: "Render three")
        engine.removeRender(id: target.id)
        #expect(engine.renderQueue.count == 2)
        #expect(!engine.renderQueue.contains { $0.id == target.id })
    }

    @Test func clearingDoneKeepsRunningJobs() {
        let engine = freshEngine()
        engine.enqueueRender(from: "Render running")
        engine.clearFinishedRenders()
        #expect(engine.renderQueue.count == 1)
    }
}

// MARK: - Full-body mimic

/// A tracked body is geometry, and geometry is testable without a camera.
struct BodyPoseTests {

    /// A full standing body: shoulders 0.2 apart, wrists 0.5 apart, feet at 0.95.
    private func standing(timestamp: TimeInterval = 0, confidence: Double = 0.9) -> BodyPoseFrame {
        let points: [BodyJoint: (Double, Double)] = [
            .nose: (0.50, 0.10),
            .neck: (0.50, 0.20),
            .leftShoulder: (0.40, 0.22),
            .rightShoulder: (0.60, 0.22),
            .leftElbow: (0.32, 0.38),
            .rightElbow: (0.68, 0.38),
            .leftWrist: (0.25, 0.52),
            .rightWrist: (0.75, 0.52),
            .root: (0.50, 0.52),
            .leftHip: (0.44, 0.54),
            .rightHip: (0.56, 0.54),
            .leftKnee: (0.44, 0.75),
            .rightKnee: (0.56, 0.75),
            .leftAnkle: (0.45, 0.95),
            .rightAnkle: (0.55, 0.95),
        ]
        var joints: [BodyJoint: TrackedJoint] = [:]
        for (joint, point) in points {
            joints[joint] = TrackedJoint(x: point.0, y: point.1, confidence: confidence)
        }
        return BodyPoseFrame(timestamp: timestamp, joints: joints)
    }

    @Test func everyJointIsMappedFromVision() {
        // A joint with no Vision counterpart would silently never be tracked.
        let mapped = Set(BodyPoseService.jointMap.values)
        #expect(mapped.count == BodyJoint.allCases.count)
        for joint in BodyJoint.allCases {
            #expect(mapped.contains(joint))
        }
    }

    @Test func lowConfidenceJointsAreNotDrawn() {
        var frame = standing()
        frame.joints[.leftWrist] = TrackedJoint(x: 0.25, y: 0.52, confidence: 0.05)
        #expect(frame.confident(.leftWrist) == nil)
        #expect(frame.confident(.rightWrist) != nil)
        #expect(frame.trackedCount == BodyJoint.allCases.count - 1)
    }

    @Test func mirroringFlipsPositionAndSwapsSides() throws {
        let frame = standing()
        let mirrored = frame.mirroredHorizontally()
        let leftWrist = try #require(mirrored.confident(.leftWrist))
        // The right wrist was at 0.75; mirrored it becomes the left wrist at 0.25.
        #expect(abs(leftWrist.x - 0.25) < 0.0001)
        #expect(abs(leftWrist.y - 0.52) < 0.0001)
        // Mirroring twice is the identity.
        let back = mirrored.mirroredHorizontally()
        let original = try #require(frame.confident(.rightWrist))
        let round = try #require(back.confident(.rightWrist))
        #expect(abs(round.x - original.x) < 0.0001)
    }

    @Test func armSpanAndHeightAreMeasuredInShoulderWidths() throws {
        let frame = standing()
        let span = try #require(frame.armSpan)
        let height = try #require(frame.standingHeight)
        // Wrists 0.5 apart over shoulders 0.2 apart.
        #expect(abs(span - 2.5) < 0.001)
        // Nose 0.10 to ankles 0.95 over 0.2.
        #expect(abs(height - 4.25) < 0.001)
    }

    @Test func feetOutOfShotIsNotAFullBody() {
        var frame = standing()
        frame.joints.removeValue(forKey: .leftAnkle)
        frame.joints.removeValue(forKey: .rightAnkle)
        // Framing that crops at the shins still tracks legs — the knees are
        // there — but it is not a full body, and the two are different claims.
        #expect(!frame.isFullBody)
        #expect(frame.missingGroups.isEmpty)
        #expect(frame.groupsTracked().contains(.legs))
    }

    @Test func missingLimbsAreReportedByGroup() {
        var frame = standing()
        for joint in BodyJoint.allCases where joint.group == .legs {
            frame.joints.removeValue(forKey: joint)
        }
        #expect(frame.missingGroups == [.legs])
        #expect(frame.groupsTracked().contains(.arms))
    }

    @Test func smoothingEasesTowardsTheNewReading() throws {
        let first = standing()
        var second = standing(timestamp: 0.1)
        second.joints[.leftWrist] = TrackedJoint(x: 0.45, y: 0.52, confidence: 0.9)

        let blended = first.smoothed(towards: second, factor: 0.5)
        let wrist = try #require(blended.confident(.leftWrist))
        // Halfway between 0.25 and 0.45.
        #expect(abs(wrist.x - 0.35) < 0.0001)
        #expect(blended.timestamp == 0.1)
    }

    @Test func aJointThatWasNotTrackedIsAdoptedOutright() throws {
        var first = standing()
        first.joints.removeValue(forKey: .leftWrist)
        let second = standing(timestamp: 0.1)

        let blended = first.smoothed(towards: second, factor: 0.2)
        let wrist = try #require(blended.confident(.leftWrist))
        // Easing in from nowhere would drag a phantom limb across the frame.
        #expect(abs(wrist.x - 0.25) < 0.0001)
    }

    @Test func motionIsTravelPerSecondInShoulderWidths() {
        let first = standing(timestamp: 1)
        var second = standing(timestamp: 2)
        // Move every joint 0.02 to the right over one second: 0.1 shoulder widths.
        for (joint, value) in second.joints {
            second.joints[joint] = TrackedJoint(x: value.x + 0.02, y: value.y, confidence: value.confidence)
        }
        let motion = second.motion(since: first)
        #expect(abs(motion - 0.1) < 0.001)
    }

    @Test func aStillBodyReportsNoMotion() {
        let first = standing(timestamp: 1)
        let second = standing(timestamp: 2)
        #expect(second.motion(since: first) < 0.0001)
    }

    @Test func framesSurviveARoundTripThroughStorage() throws {
        let frame = standing(timestamp: 12.5)
        let data = try JSONEncoder().encode(frame)
        let decoded = try JSONDecoder().decode(BodyPoseFrame.self, from: data)
        #expect(decoded.timestamp == 12.5)
        #expect(decoded.joints.count == frame.joints.count)
        let wrist = try #require(decoded.confident(.leftWrist))
        #expect(abs(wrist.x - 0.25) < 0.0001)
    }

    @Test func aTakeReportsItsOwnLengthAndFrameRate() {
        let frames = (0..<11).map { standing(timestamp: Double($0) * 0.1) }
        let take = MimicTake(name: "Wave", frames: frames)
        #expect(abs(take.duration - 1.0) < 0.0001)
        #expect(abs(take.frameRate - 10) < 0.001)
        #expect(take.isFullBody)
        #expect(take.summary.contains("11 frames"))
    }

    @Test func playbackPicksTheFrameOnScreenAtThatMoment() throws {
        let frames = (0..<11).map { index -> BodyPoseFrame in
            var frame = standing(timestamp: Double(index) * 0.1)
            frame.joints[.leftWrist] = TrackedJoint(
                x: 0.25 + Double(index) * 0.01,
                y: 0.52,
                confidence: 0.9
            )
            return frame
        }
        let take = MimicTake(name: "Wave", frames: frames)

        let midway = try #require(take.frame(at: 0.55))
        let wrist = try #require(midway.confident(.leftWrist))
        // 0.55s lands on the frame stamped 0.5, the fifth one.
        #expect(abs(wrist.x - 0.30) < 0.0001)
        #expect(take.frame(at: -1) == nil || take.frame(at: 0) != nil)
    }

    @Test func aTakeCroppedAtTheWaistIsFlagged() {
        var cropped = standing()
        cropped.joints.removeValue(forKey: .leftAnkle)
        cropped.joints.removeValue(forKey: .rightAnkle)
        let take = MimicTake(name: "Seated", frames: [cropped, cropped, cropped])
        #expect(!take.isFullBody)
    }
}

/// The skeleton has to land on the body, which means matching the preview's
/// aspect-fill maths exactly.
struct PoseProjectorTests {

    @Test func fillMatchesAspectFillCropping() {
        // A 16:9 buffer (aspect 1.78) shown in a 300x600 portrait view fills the
        // height and overflows the width, so the centre stays centred.
        let projector = PoseProjector(
            size: CGSize(width: 300, height: 600),
            sourceAspect: 16.0 / 9.0,
            mode: .fill
        )
        let centre = projector.point(x: 0.5, y: 0.5)
        #expect(abs(centre.x - 150) < 0.001)
        #expect(abs(centre.y - 300) < 0.001)

        // The buffer's left edge is cropped off screen, so x=0 is negative.
        let left = projector.point(x: 0, y: 0.5)
        #expect(left.x < 0)
    }

    @Test func fillWithMatchingAspectFillsExactly() {
        let projector = PoseProjector(
            size: CGSize(width: 300, height: 600),
            sourceAspect: 0.5,
            mode: .fill
        )
        let topLeft = projector.point(x: 0, y: 0)
        let bottomRight = projector.point(x: 1, y: 1)
        #expect(abs(topLeft.x) < 0.001)
        #expect(abs(topLeft.y) < 0.001)
        #expect(abs(bottomRight.x - 300) < 0.001)
        #expect(abs(bottomRight.y - 600) < 0.001)
    }

    @Test func boundingBoxLeavesRoomAboveTheNose() {
        var frame = BodyPoseFrame(timestamp: 0)
        frame.joints[.nose] = TrackedJoint(x: 0.5, y: 0.2, confidence: 0.9)
        frame.joints[.leftAnkle] = TrackedJoint(x: 0.5, y: 0.8, confidence: 0.9)

        let box = PoseProjector.boundingBox(of: frame)
        // The nose is not the top of the head: the box must start above it.
        #expect(box.minY < 0.2)
        #expect(box.maxY >= 0.8)
    }

    @Test func boundingBoxIgnoresJointsTheCameraNeverSaw() {
        var frame = BodyPoseFrame(timestamp: 0)
        frame.joints[.nose] = TrackedJoint(x: 0.5, y: 0.3, confidence: 0.9)
        frame.joints[.leftAnkle] = TrackedJoint(x: 0.5, y: 0.7, confidence: 0.9)
        frame.joints[.rightWrist] = TrackedJoint(x: 0.99, y: 0.99, confidence: 0.01)

        let box = PoseProjector.boundingBox(of: frame)
        #expect(box.maxX < 0.9)
    }

    @Test func fitKeepsProportionsInASquareView() {
        var frame = BodyPoseFrame(timestamp: 0)
        frame.joints[.leftShoulder] = TrackedJoint(x: 0.4, y: 0.3, confidence: 0.9)
        frame.joints[.rightShoulder] = TrackedJoint(x: 0.6, y: 0.3, confidence: 0.9)
        frame.joints[.leftAnkle] = TrackedJoint(x: 0.5, y: 0.9, confidence: 0.9)

        let projector = PoseProjector(
            size: CGSize(width: 200, height: 200),
            sourceAspect: 0.5,
            mode: .fit(box: PoseProjector.boundingBox(of: frame), padding: 0)
        )
        let left = projector.point(x: 0.4, y: 0.3)
        let right = projector.point(x: 0.6, y: 0.3)
        // Shoulders stay level and apart, and inside the view.
        #expect(right.x > left.x)
        #expect(abs(left.y - right.y) < 0.001)
        #expect(left.x >= -0.001)
        #expect(right.x <= 200.001)
    }
}

/// Mimic takes are private, local, and only saved when they hold a movement.
@MainActor
struct MimicStoreTests {

    private func freshStore() -> MimicStore {
        UserDefaults.standard.removeObject(forKey: StoreKey.mimicTakes)
        return MimicStore()
    }

    private func pose(_ timestamp: TimeInterval, x: Double) -> BodyPoseFrame {
        var frame = BodyPoseFrame(timestamp: timestamp)
        frame.joints[.leftShoulder] = TrackedJoint(x: x, y: 0.3, confidence: 0.9)
        frame.joints[.rightShoulder] = TrackedJoint(x: x + 0.2, y: 0.3, confidence: 0.9)
        frame.joints[.nose] = TrackedJoint(x: x + 0.1, y: 0.15, confidence: 0.9)
        return frame
    }

    @Test func aFreshStoreHoldsNothing() {
        let store = freshStore()
        #expect(store.takes.isEmpty)
        #expect(store.pose == nil)
        #expect(!store.isTracking)
    }

    @Test func nobodyInFrameDropsThePose() {
        let store = freshStore()
        store.ingest(pose(0, x: 0.4), aspect: 0.5)
        #expect(store.isTracking)

        // Holding the last pose would read as tracking that still works.
        store.ingest(nil, aspect: 0.5)
        #expect(store.pose == nil)
        #expect(store.motion == 0)
    }

    @Test func theAspectOfTheCameraIsRemembered() {
        let store = freshStore()
        store.ingest(pose(0, x: 0.4), aspect: 1.78)
        #expect(abs(store.sourceAspect - 1.78) < 0.0001)
    }

    @Test func mirrorModeFlipsWhatTheFigureDraws() throws {
        let store = freshStore()
        store.mirrors = true
        store.ingest(pose(0, x: 0.4), aspect: 0.5)
        let mirrored = try #require(store.pose?.confident(.rightShoulder))
        // The left shoulder at 0.4 becomes the right shoulder at 0.6.
        #expect(abs(mirrored.x - 0.6) < 0.0001)

        let plain = freshStore()
        plain.mirrors = false
        plain.ingest(pose(0, x: 0.4), aspect: 0.5)
        let straight = try #require(plain.pose?.confident(.leftShoulder))
        #expect(abs(straight.x - 0.4) < 0.0001)
    }

    @Test func recordingIsRefusedWithoutALiveCamera() {
        let store = freshStore()
        store.ingest(pose(0, x: 0.4), aspect: 0.5)
        // The camera never started in a test, so there is nothing to record.
        #expect(!store.canRecord)
        store.startRecording()
        #expect(!store.isRecording)
    }

    @Test func deletingEverythingLeavesNoTakes() {
        let store = freshStore()
        store.deleteAllTakes()
        #expect(store.takes.isEmpty)
        // And nothing was left behind on disk for the next launch.
        #expect(LocalStore.shared.load([MimicTake].self, key: StoreKey.mimicTakes)?.isEmpty ?? true)
    }

    @Test func takesRoundTripThroughLocalStorageOnly() throws {
        let frames = (0..<5).map { pose(Double($0) * 0.1, x: 0.4) }
        let take = MimicTake(name: "Wave", frames: frames)
        LocalStore.shared.save([take], key: StoreKey.mimicTakes)

        let store = MimicStore()
        #expect(store.takes.count == 1)
        #expect(store.takes.first?.name == "Wave")
        #expect(store.takes.first?.frames.count == 5)

        store.deleteAllTakes()
    }

    @Test func trackingLineNamesWhatIsMissing() {
        let store = freshStore()
        #expect(store.trackingLine == "Camera off")
    }
}

/// Nothing on a fresh install may claim work that never happened.
@MainActor
struct NoInventedDataTests {

    private func freshEngine() -> EngineStore {
        UserDefaults.standard.removeObject(forKey: StoreKey.feed)
        UserDefaults.standard.removeObject(forKey: StoreKey.fleets)
        UserDefaults.standard.removeObject(forKey: StoreKey.renderQueue)
        UserDefaults.standard.removeObject(forKey: StoreKey.dispatchHistory)
        return EngineStore()
    }

    @Test func aFreshEngineHasRunNothing() {
        let engine = freshEngine()
        #expect(engine.feed.isEmpty)
        #expect(engine.renderQueue.isEmpty)
        #expect(engine.totalUnitsToday == 0)
        #expect(engine.runningNow == 0)
        #expect(!engine.hasThroughputHistory)
    }

    @Test func everyFleetStartsAtZero() {
        let engine = freshEngine()
        #expect(engine.fleets.count == TaskKind.allCases.count)
        for fleet in engine.fleets {
            #expect(fleet.completedUnits == 0)
            #expect(fleet.concurrency == 0)
            #expect(fleet.latencyMs == 0)
            #expect(fleet.progress == 0)
        }
    }

    @Test func theChartIsEmptyUntilSomethingIsDispatched() {
        let engine = freshEngine()
        #expect(engine.samples.allSatisfy { $0.value == 0 })

        engine.dispatch(command: "Chain the CRM and billing APIs")
        #expect(engine.hasThroughputHistory)
        // The dispatch lands in the most recent bucket, not spread across history.
        #expect(engine.samples.reduce(0) { $0 + $1.value } == 1)
        #expect(engine.samples.last?.value == 1)
    }

    @Test func dispatchingMovesTheRunningCount() throws {
        let engine = freshEngine()
        #expect(engine.runningNow == 0)
        _ = try #require(engine.dispatch(command: "Write the payments module"))
        // One real job, not a fabricated few thousand.
        #expect(engine.runningNow == 1)
        #expect(engine.fleets.first { $0.kind == .code }?.concurrency == 1)
    }

    @Test func aQueuedRenderClaimsNoLengthItWasNeverTold() throws {
        let engine = freshEngine()
        let job = engine.enqueueRender(from: "Render the launch film in 4K")
        // Scene count and duration come from the machine that reads the project.
        #expect(job.sceneCount == 0)
        #expect(job.outputDuration == 0)
        #expect(job.resolution == "3840x2160")
    }

    @Test func aFinishedTaskReportsMeasuredTimeNotAnInventedTally() {
        let started = Date().addingTimeInterval(-12)
        let task = EngineTask(
            kind: .security,
            command: "Sweep the portal",
            progress: 1,
            startedAt: started,
            finishedAt: started.addingTimeInterval(9.4)
        )
        #expect(task.headline == "9.4s")
        #expect(task.subtitle == "scan finished")
        #expect(abs((task.durationSeconds ?? 0) - 9.4) < 0.001)
    }

    @Test func anUnfinishedTaskHasNoDurationToShow() {
        let task = EngineTask(kind: .code, command: "Write the module")
        #expect(task.durationSeconds == nil)
        #expect(task.headline.isEmpty)
    }

    @Test func everyKindHasAnExpectedRunTime() {
        for kind in TaskKind.allCases {
            #expect(EngineStore.expectedSeconds(for: kind) > 0)
        }
    }
}
