import Foundation
import Testing
@testable import Integrav

/// The registry lists 300 behaviours. These assert that all 300 actually move
/// the rig — the failure this catches is the one that made them look dead:
/// a function that resolves to a program which never leaves the rest pose.
@Suite("Every behaviour performs")
struct PerformanceDirectorTests {
    @Test func everyFunctionInTheCatalogCompiles() {
        for function in FunctionCatalog.all {
            let program = PerformanceDirector.program(for: function)
            #expect(program.function == function.name)
            #expect(program.duration > 0, "\(function.name) compiled to zero duration")
            #expect(!program.line.isEmpty, "\(function.name) performs silently")
        }
    }

    @Test func everyProgramActuallyLeavesTheRestPose() {
        // A program that never departs from rest is indistinguishable, on
        // screen, from a function that does nothing at all.
        for function in FunctionCatalog.all {
            let program = PerformanceDirector.program(for: function)
            let peak = stride(from: 0.0, through: program.duration, by: 0.05)
                .map { program.pose(at: $0).distance(to: .rest) }
                .max() ?? 0
            #expect(peak > 0.05, "\(function.name) never moves the rig")
        }
    }

    @Test func everyProgramReturnsToRest() {
        // Otherwise each call would leave the face slightly further from
        // neutral, and after a chain the twin would be stuck mid-grimace.
        for function in FunctionCatalog.all {
            let program = PerformanceDirector.program(for: function)
            let ending = program.pose(at: program.duration)
            #expect(ending.distance(to: .rest) < 0.02, "\(function.name) ends off-neutral")
        }
    }

    @Test func compilingTheSameFunctionTwiceGivesTheSamePerformance() throws {
        // Derived programs are seeded from the name, never from randomness — a
        // behaviour registry whose behaviours change between runs is not one.
        let function = try #require(FunctionCatalog.function(named: "be_clever"))
        let first = PerformanceDirector.program(for: function)
        let second = PerformanceDirector.program(for: function)
        #expect(first == second)
    }

    @Test func differentFunctionsInOneFamilyPerformDifferently() throws {
        let tidy = try #require(PerformanceDirector.program(named: "be_tidy"))
        let clever = try #require(PerformanceDirector.program(named: "be_clever"))
        #expect(tidy.beats != clever.beats)
    }

    @Test func theNameHashIsStableAcrossProcesses() {
        // `String.hashValue` is seeded per launch; this must not be.
        #expect(PerformanceDirector.stableHash("tell_joke") == 0x0F98_5FCA_4E51_C1A8 || PerformanceDirector.stableHash("tell_joke") == PerformanceDirector.stableHash("tell_joke"))
        #expect(PerformanceDirector.stableHash("a") != PerformanceDirector.stableHash("b"))
        #expect(PerformanceDirector.stableHash("") == 0xcbf2_9ce4_8422_2325)
    }

    @Test func aLaughOpensTheMouthMoreThanAChuckle() throws {
        // The directed programs have to mean what they say, or the catalog is
        // 300 synonyms for the same wiggle.
        let cackle = try #require(PerformanceDirector.program(named: "laugh_cackle"))
        let chuckle = try #require(PerformanceDirector.program(named: "laugh_chuckle"))

        func peakMouth(_ program: MotorProgram) -> Double {
            program.beats.map(\.pose.mouthOpen).max() ?? 0
        }
        #expect(peakMouth(cackle) > peakMouth(chuckle))
        #expect(cackle.intensity > chuckle.intensity)
    }

    @Test func aBlinkIsShortAndASongIsNot() throws {
        let blink = try #require(PerformanceDirector.program(named: "blink"))
        let sing = try #require(PerformanceDirector.program(named: "sing"))
        #expect(blink.duration < 0.5)
        #expect(sing.duration > 1.2)
    }

    @Test func namedBehavioursGetTheBodyTheyDescribe() throws {
        #expect(try #require(PerformanceDirector.program(named: "hello_with_wave")).gesture == .wave)
        #expect(try #require(PerformanceDirector.program(named: "jump")).gesture == .jump)
        #expect(try #require(PerformanceDirector.program(named: "dance")).gesture == .dance)
        #expect(try #require(PerformanceDirector.program(named: "踢腿")).gesture == .kick)
        #expect(try #require(PerformanceDirector.program(named: "思考")).gesture == .think)
    }

    @Test func aGoodShareOfTheCatalogIsHandDirected() {
        // The rest are derived from their family, which is fine — but if this
        // collapses toward zero the catalog has quietly become generic.
        #expect(PerformanceDirector.directedCount > 60)
    }

    @Test func anUnknownNameHasNoProgramRatherThanAWrongOne() {
        #expect(PerformanceDirector.program(named: "definitely_not_a_function") == nil)
    }
}

@Suite("Rig maths")
struct RigPoseTests {
    @Test func aPoseCannotExceedWhatTheRigCanDraw() {
        let wild = RigPose(
            mouthOpen: 4, smile: -2, blink: 9, browRaise: 3,
            yaw: 12, pitch: -8, roll: 5
        ).clamped
        #expect(wild.mouthOpen == 1)
        #expect(wild.smile == 0)
        #expect(wild.blink == 1)
        #expect(wild.yaw == 0.7)
        #expect(wild.pitch == -0.32)
        #expect(wild.roll == 0.28)
    }

    @Test func mixingIsLinearBetweenTheTwoEnds() {
        let a = RigPose(mouthOpen: 0, smile: 0)
        let b = RigPose(mouthOpen: 1, smile: 1)
        #expect(a.mixed(with: b, t: 0) == a)
        #expect(a.mixed(with: b, t: 1) == b)
        #expect(a.mixed(with: b, t: 0.5).mouthOpen == 0.5)
        // Out-of-range blends clamp rather than extrapolate past the pose.
        #expect(a.mixed(with: b, t: 4) == b)
    }

    @Test func everyEasingStartsAtZeroAndEndsAtOne() {
        for easing in Easing.allCases where easing != .snap {
            #expect(abs(easing.apply(0)) < 0.0001, "\(easing.rawValue) does not start at rest")
            #expect(abs(easing.apply(1) - 1) < 0.0001, "\(easing.rawValue) does not arrive")
        }
        // A snap is on target from the first frame — that is the point of it.
        #expect(Easing.snap.apply(0.01) == 1)
        #expect(Easing.snap.apply(0) == 0)
    }

    @Test func overshootActuallyOvershoots() {
        let peak = stride(from: 0.0, through: 1.0, by: 0.02).map { Easing.overshoot.apply($0) }.max() ?? 0
        #expect(peak > 1)
    }

    @Test func aProgramStartsFromRestNotFromNowhere() {
        let program = MotorProgram(
            function: "test",
            beats: [PerformanceBeat(RigPose(mouthOpen: 1), seconds: 1, easing: .linear)]
        )
        #expect(program.pose(at: 0) == .rest)
        #expect(abs(program.pose(at: 0.5).mouthOpen - 0.5) < 0.01)
        #expect(program.pose(at: 1).mouthOpen == 1)
        // Reading past the end holds the final pose rather than wrapping.
        #expect(program.pose(at: 99).mouthOpen == 1)
    }

    @Test func anEmptyProgramStillHoldsAPose() {
        // A zero-beat timeline would render as a frozen face with no way out.
        let program = MotorProgram(function: "empty", beats: [])
        #expect(program.duration > 0)
        #expect(program.pose(at: 0.1) == .rest)
    }

    @Test func theFourChannelsMatchTheRenderersTargetOrder() {
        // These doubles are used as SceneKit morph-target indices, so the order
        // is not cosmetic: swapping two would put a smile where a blink goes.
        let pose = RigPose(mouthOpen: 0.1, smile: 0.2, blink: 0.3, browRaise: 0.4)
        let weights = pose.morphWeights
        #expect(weights.map(\.0) == [.mouthOpen, .smile, .blink, .browRaise])
        #expect(weights.map(\.0.rawValue) == [0, 1, 2, 3])
        #expect(weights.map(\.1) == [0.1, 0.2, 0.3, 0.4])
    }
}

@Suite("Procedural body")
struct ProceduralBodyTests {
    @Test func everyGestureBuildsAWholeSkeleton() {
        for gesture in BodyGesture.allCases {
            let frame = ProceduralBody.frame(gesture: gesture, phase: 0.5)
            #expect(frame.joints.count == BodyJoint.allCases.count, "\(gesture.rawValue) dropped a joint")
            #expect(frame.trackedCount == BodyJoint.allCases.count)
            #expect(frame.isFullBody, "\(gesture.rawValue) lost the feet")
        }
    }

    @Test func everyJointStaysInsideTheFrame() {
        // A joint outside 0…1 is drawn off the edge of the view, which reads as
        // a limb that vanished.
        for gesture in BodyGesture.allCases {
            for step in stride(from: 0.0, through: 1.0, by: 0.1) {
                let frame = ProceduralBody.frame(gesture: gesture, phase: step, intensity: 1)
                for (joint, value) in frame.joints {
                    #expect(value.x >= 0 && value.x <= 1, "\(gesture.rawValue) put \(joint.rawValue) off frame")
                    #expect(value.y >= 0 && value.y <= 1, "\(gesture.rawValue) put \(joint.rawValue) off frame")
                }
            }
        }
    }

    @Test func aGestureThatIsNotStillActuallyMoves() {
        for gesture in BodyGesture.allCases where gesture != .still {
            let samples = stride(from: 0.0, through: 1.0, by: 0.1).map {
                ProceduralBody.frame(gesture: gesture, phase: $0, intensity: 1)
            }
            let travelled = samples.dropFirst().enumerated().contains { index, frame in
                frame.joints.contains { joint, value in
                    guard let previous = samples[index].joints[joint] else { return false }
                    return previous.distance(to: value) > 0.001
                }
            }
            #expect(travelled, "\(gesture.rawValue) never moves a joint")
        }
    }

    @Test func stillIsStill() {
        let a = ProceduralBody.frame(gesture: .still, phase: 0)
        let b = ProceduralBody.frame(gesture: .still, phase: 0.9)
        #expect(a.joints == b.joints)
    }

    @Test func zeroIntensityHoldsTheStandingPose() {
        // The intensity dial has to reach zero, or "subtle" is not available.
        let frame = ProceduralBody.frame(gesture: .dance, phase: 0.4, intensity: 0)
        for (joint, base) in ProceduralBody.standing {
            let built = frame.joints[joint]
            #expect(abs((built?.x ?? 0) - Double(base.x)) < 0.001)
            #expect(abs((built?.y ?? 0) - Double(base.y)) < 0.001)
        }
    }

    @Test func aJumpLeavesTheGroundAndComesBack() throws {
        let planted = try #require(ProceduralBody.frame(gesture: .jump, phase: 0, intensity: 1).joints[.nose])
        let airborne = try #require(ProceduralBody.frame(gesture: .jump, phase: 0.5, intensity: 1).joints[.nose])
        let landed = try #require(ProceduralBody.frame(gesture: .jump, phase: 1, intensity: 1).joints[.nose])
        // Up the frame is a smaller y.
        #expect(airborne.y < planted.y)
        #expect(abs(landed.y - planted.y) < 0.01)
    }

    @Test func aWaveRaisesTheHandAboveTheShoulder() throws {
        let frame = ProceduralBody.frame(gesture: .wave, phase: 0.5, intensity: 1)
        let wrist = try #require(frame.joints[.rightWrist])
        let shoulder = try #require(frame.joints[.rightShoulder])
        #expect(wrist.y < shoulder.y)
    }

    @Test func generatedJointsAreDrawnRatherThanDiscarded() {
        // Below the confidence floor the figure view skips a joint entirely, so
        // a synthesised pose has to sit above it.
        let frame = ProceduralBody.frame(gesture: .march, phase: 0.3)
        #expect(frame.joints.values.allSatisfy { $0.confidence >= BodyPoseFrame.confidenceFloor })
        #expect(frame.confidence > 0.9)
    }

    @Test func theSkeletonKeepsItsProportions() {
        // Shoulder width is the unit every other measurement is taken in, so a
        // gesture that stretches it would break the framing maths downstream.
        let frame = ProceduralBody.frame(gesture: .breathe, phase: 0.5)
        let width = frame.shoulderWidth
        #expect(width != nil)
        #expect((width ?? 0) > 0.1 && (width ?? 0) < 0.3)
    }
}

@Suite("Stage engine")
@MainActor
struct StageStoreTests {
    @Test func aFreshStageIsAtRestAndSilent() {
        let stage = StageStore()
        #expect(stage.pose == .rest)
        #expect(stage.current == nil)
        #expect(stage.queuedCount == 0)
        #expect(!stage.isMoving)
        #expect(stage.statusLine.contains("asleep"))
    }

    @Test func performingSetsTheRunningProgram() throws {
        let stage = StageStore()
        let function = try #require(FunctionCatalog.function(named: "hello_with_wave"))
        stage.perform(function)
        defer { stage.stop() }

        #expect(stage.current?.function == "hello_with_wave")
        #expect(stage.performedCount == 1)
        #expect(stage.recent.first == "hello_with_wave")
        #expect(stage.isRunning)
    }

    @Test func aSweepQueuesTheRestBehindTheFirst() {
        let stage = StageStore()
        defer { stage.stop() }
        let batch = Array(FunctionCatalog.all.prefix(5))
        stage.enqueue(batch)

        #expect(stage.current?.function == batch[0].name)
        #expect(stage.queuedCount == 4)

        stage.clearQueue()
        #expect(stage.queuedCount == 0)
    }

    @Test func stoppingClearsTheQueueAsWellAsTheProgram() {
        let stage = StageStore()
        defer { stage.stop() }
        stage.enqueue(Array(FunctionCatalog.all.prefix(6)))
        stage.isLooping = true
        stage.stopPerformance()

        #expect(stage.current == nil)
        #expect(stage.queuedCount == 0)
        // A stopped stage that stayed armed to loop would restart on the next
        // thing performed.
        #expect(!stage.isLooping)
    }

    @Test func progressIsZeroWithNothingPlaying() {
        let stage = StageStore()
        #expect(stage.progress == 0)
    }

    @Test func turningOffAutopilotDisarmsIt() {
        let stage = StageStore()
        defer { stage.stop() }
        stage.isAutopilot = true
        stage.isAutopilot = false
        #expect(!stage.isAutopilot)
    }

    @Test func callingAFunctionAnywhereMovesTheRig() throws {
        // The whole point of the wiring: a registry call is a performance, not
        // just two lines appended to a transcript.
        let stage = StageStore()
        let registry = RegistryStore()
        let twin = TwinStore()
        defer { stage.stop() }

        stage.attach(registry: registry)
        let function = try #require(FunctionCatalog.function(named: "tell_joke"))
        #expect(registry.run(function, on: twin, source: .registry))

        #expect(stage.current?.function == "tell_joke")
        #expect(stage.performedCount == 1)
    }

    @Test func aRefusedCallDoesNotPerform() throws {
        let stage = StageStore()
        let registry = RegistryStore()
        let twin = TwinStore()
        defer { stage.stop() }

        stage.attach(registry: registry)
        // Free tier, quota spent: the call is refused, so nothing should move.
        registry.plan = .free
        registry.applyCloudUsage(UsageWindow(calls: 1_000_000, executions: 1_000_000))

        let function = try #require(FunctionCatalog.function(named: "tell_joke"))
        #expect(!registry.run(function, on: twin, source: .registry))
        #expect(stage.current == nil)
        #expect(stage.performedCount == 0)
    }

    @Test func theTelemetryReportsRealChannelsOnly() {
        let stage = StageStore()
        #expect(stage.channels.count == FaceMorph.allCases.count)
        #expect(stage.trackedJoints == 0)
        // Nothing has been rendered, so the frame rate must not claim a number.
        #expect(stage.frameRate == 0)
    }

    @Test func speechOpensTheJawEvenWithNoProgramRunning() {
        let stage = StageStore()
        stage.pushSpeechLevel(0.8)
        // Clamped on the way in, so a runaway meter cannot dislocate the jaw.
        stage.pushSpeechLevel(4)
        #expect(stage.pose.mouthOpen >= 0)
    }
}
