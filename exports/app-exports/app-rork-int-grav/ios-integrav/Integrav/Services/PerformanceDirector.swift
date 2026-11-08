import Foundation

/// Compiles a catalog function into motion the rig performs.
///
/// Every one of the 300 behaviours resolves to a program — there is no silent
/// "nothing happens" path. Around a third are hand-directed below because their
/// meaning is specific (a wave is a wave, 大笑 is not a chuckle); the rest are
/// derived from their family and their own name, deterministically, so the same
/// function always performs the same way without a 300-entry table of guesses.
nonisolated enum PerformanceDirector {
    /// Compiles one function. Never returns nil: an unknown name still gets its
    /// family's motion rather than a frozen face.
    nonisolated static func program(for function: AvatarFunction) -> MotorProgram {
        if let directed = directed(function) { return directed }
        return derived(function)
    }

    nonisolated static func program(named name: String) -> MotorProgram? {
        guard let fn = FunctionCatalog.function(named: name) else { return nil }
        return program(for: fn)
    }

    /// How many of the catalog are hand-directed — shown in the stage readout so
    /// the split between authored and derived motion is never hidden.
    nonisolated static var directedCount: Int {
        FunctionCatalog.all.count { directed($0) != nil }
    }

    // MARK: - Hand-directed

    // swiftlint:disable:next cyclomatic_complexity function_body_length
    private nonisolated static func directed(_ fn: AvatarFunction) -> MotorProgram? {
        let line = fn.performance

        func make(
            _ beats: [PerformanceBeat],
            _ gesture: BodyGesture,
            _ intensity: Double
        ) -> MotorProgram {
            MotorProgram(
                function: fn.name,
                beats: beats,
                gesture: gesture,
                line: line,
                intensity: intensity,
                isDirected: true
            )
        }

        switch fn.name {
        // -- Humor: the laugh family, graded by how hard it lands ------------
        case "tell_joke", "one_liner", "dad_joke", "punchline", "standup":
            return make([
                PerformanceBeat(RigPose(smile: 0.30, browRaise: 0.45, yaw: 0.10), seconds: 0.32),
                PerformanceBeat(RigPose(mouthOpen: 0.55, smile: 0.85, browRaise: 0.30), seconds: 0.28, easing: .overshoot),
                PerformanceBeat(RigPose(mouthOpen: 0.20, smile: 0.70, pitch: 0.06), seconds: 0.5),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .nod, 0.55)

        case "laugh_cackle", "laugh_in_loud", "大笑", "惊笑":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.92, smile: 0.95, blink: 0.65, browRaise: 0.55, pitch: -0.14), seconds: 0.20, easing: .overshoot),
                PerformanceBeat(RigPose(mouthOpen: 0.55, smile: 0.90, blink: 0.35, pitch: 0.10), seconds: 0.16),
                PerformanceBeat(RigPose(mouthOpen: 0.88, smile: 0.95, blink: 0.60, pitch: -0.12), seconds: 0.18),
                PerformanceBeat(RigPose(mouthOpen: 0.45, smile: 0.85, pitch: 0.08), seconds: 0.20),
                PerformanceBeat(RigPose(smile: 0.55), seconds: 0.5),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .bounce, 0.95)

        case "laugh_chuckle", "giggle", "欢笑", "逗笑":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.28, smile: 0.72, blink: 0.30, yaw: -0.08), seconds: 0.18),
                PerformanceBeat(RigPose(mouthOpen: 0.12, smile: 0.62, yaw: 0.05), seconds: 0.16),
                PerformanceBeat(RigPose(mouthOpen: 0.26, smile: 0.70, blink: 0.25), seconds: 0.16),
                PerformanceBeat(RigPose(smile: 0.45), seconds: 0.4),
                PerformanceBeat(.rest, seconds: 0.3),
            ], .breathe, 0.42)

        case "snort", "burp", "打喷嚏", "sneeze":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.10, browRaise: 0.70, pitch: -0.18), seconds: 0.34, easing: .easeIn),
                PerformanceBeat(RigPose(mouthOpen: 0.85, smile: 0.20, blink: 1.0, pitch: 0.26), seconds: 0.10, easing: .snap),
                PerformanceBeat(RigPose(mouthOpen: 0.15, blink: 0.40, pitch: 0.10), seconds: 0.30),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .recoil, 0.8)

        case "roast", "be_caustic", "sarcasm", "sarcastic_reply", "wittily_smirched", "苦略":
            return make([
                PerformanceBeat(RigPose(smile: 0.55, browRaise: 0.20, yaw: 0.22, roll: 0.10), seconds: 0.34),
                PerformanceBeat(RigPose(mouthOpen: 0.30, smile: 0.48, browRaise: 0.05, yaw: 0.14, roll: 0.08), seconds: 0.55, easing: .linear),
                PerformanceBeat(RigPose(smile: 0.62, yaw: 0.18, roll: 0.12), seconds: 0.4),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .fold, 0.5)

        // -- Presence --------------------------------------------------------
        case "greeting", "latched_greeting", "hello_with_wave":
            return make([
                PerformanceBeat(RigPose(smile: 0.60, browRaise: 0.55, pitch: -0.06), seconds: 0.26, easing: .overshoot),
                PerformanceBeat(RigPose(mouthOpen: 0.34, smile: 0.72, browRaise: 0.40), seconds: 0.40),
                PerformanceBeat(RigPose(smile: 0.55, browRaise: 0.15), seconds: 0.45),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .wave, 0.75)

        case "握手":
            return make([
                PerformanceBeat(RigPose(smile: 0.52, browRaise: 0.30, pitch: 0.08), seconds: 0.30),
                PerformanceBeat(RigPose(smile: 0.60, pitch: 0.12), seconds: 0.55),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .point, 0.55)

        case "抱緊", "cuddle", "抚摸", "悯惜", "altruistic_gift":
            return make([
                PerformanceBeat(RigPose(smile: 0.48, blink: 0.35, pitch: 0.14, roll: 0.08), seconds: 0.45, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.55, blink: 0.20, pitch: 0.10, roll: 0.06), seconds: 0.7),
                PerformanceBeat(.rest, seconds: 0.5),
            ], .fold, 0.45)

        case "yes", "当然", "assertion", "golden_rule":
            return make([
                PerformanceBeat(RigPose(smile: 0.35, browRaise: 0.30, pitch: 0.18), seconds: 0.20, easing: .easeOut),
                PerformanceBeat(RigPose(smile: 0.40, pitch: -0.08), seconds: 0.18),
                PerformanceBeat(RigPose(smile: 0.38, pitch: 0.16), seconds: 0.18),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .nod, 0.6)

        case "no_ack", "ban", "无碍", "轻轻摇头", "idk":
            return make([
                PerformanceBeat(RigPose(smile: 0.05, browRaise: 0.25, yaw: -0.28), seconds: 0.22),
                PerformanceBeat(RigPose(smile: 0.05, browRaise: 0.25, yaw: 0.28), seconds: 0.24),
                PerformanceBeat(RigPose(smile: 0.08, yaw: -0.16), seconds: 0.22),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .shake, 0.55)

        case "shrug", "无言", "limited", "freeform":
            return make([
                PerformanceBeat(RigPose(smile: 0.22, browRaise: 0.65, roll: 0.10), seconds: 0.30, easing: .easeOut),
                PerformanceBeat(RigPose(smile: 0.25, browRaise: 0.55, roll: 0.08), seconds: 0.5),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .shrug, 0.6)

        // -- Expression ------------------------------------------------------
        case "happy_face", "微笑", "be_upbeat", "be_nice", "春風":
            return make([
                PerformanceBeat(RigPose(smile: 0.82, blink: 0.15, browRaise: 0.30), seconds: 0.35, easing: .easeOut),
                PerformanceBeat(RigPose(smile: 0.78, browRaise: 0.20), seconds: 0.8),
                PerformanceBeat(.rest, seconds: 0.45),
            ], .breathe, 0.35)

        case "sad_face", "流下泪", "heartbreak", "叹息", "grumble", "complaint":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.08, smile: 0.0, blink: 0.45, browRaise: 0.35, pitch: 0.20), seconds: 0.45, easing: .easeIn),
                PerformanceBeat(RigPose(smile: 0.0, blink: 0.30, browRaise: 0.28, pitch: 0.22), seconds: 0.8),
                PerformanceBeat(.rest, seconds: 0.5),
            ], .bow, 0.35)

        case "surprised_face", "overreact", "惊", "be_surprise", "be_unexpected":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.70, smile: 0.15, blink: 0.0, browRaise: 1.0, pitch: -0.16), seconds: 0.12, easing: .snap),
                PerformanceBeat(RigPose(mouthOpen: 0.50, browRaise: 0.85, pitch: -0.10), seconds: 0.45),
                PerformanceBeat(RigPose(mouthOpen: 0.10, browRaise: 0.35), seconds: 0.4),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .recoil, 0.85)

        case "angry_face", "be_rude", "警醒", "收紧", "恐怖":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.18, smile: 0.0, blink: 0.35, browRaise: 0.0, pitch: -0.10), seconds: 0.20, easing: .snap),
                PerformanceBeat(RigPose(mouthOpen: 0.30, smile: 0.0, blink: 0.30, pitch: -0.12, roll: -0.06), seconds: 0.55),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .still, 0.7)

        case "confused_face", "反问", "nonsense", "cryptic_message", "snake_eyes":
            return make([
                PerformanceBeat(RigPose(smile: 0.10, browRaise: 0.60, yaw: -0.16, roll: 0.14), seconds: 0.30),
                PerformanceBeat(RigPose(mouthOpen: 0.14, smile: 0.08, browRaise: 0.45, yaw: -0.10, roll: 0.12), seconds: 0.6),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .think, 0.4)

        case "raising_eyebrows", "be_suspect", "多眼":
            return make([
                PerformanceBeat(RigPose(smile: 0.18, browRaise: 0.95, pitch: -0.06), seconds: 0.16, easing: .easeOut),
                PerformanceBeat(RigPose(smile: 0.20, browRaise: 0.70), seconds: 0.5),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .still, 0.3)

        case "blink":
            return make([
                PerformanceBeat(RigPose(blink: 1.0), seconds: 0.07, easing: .snap),
                PerformanceBeat(RigPose(blink: 0.0), seconds: 0.11),
                PerformanceBeat(.rest, seconds: 0.15),
            ], .still, 0.15)

        case "flirt", "熱情", "惹人喜爱装束":
            return make([
                PerformanceBeat(RigPose(smile: 0.60, blink: 0.20, browRaise: 0.40, yaw: 0.24, roll: 0.12), seconds: 0.35),
                PerformanceBeat(RigPose(smile: 0.70, blink: 1.0, browRaise: 0.25, yaw: 0.20, roll: 0.10), seconds: 0.12, easing: .snap),
                PerformanceBeat(RigPose(smile: 0.65, blink: 0.0, yaw: 0.18, roll: 0.10), seconds: 0.45),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .sway, 0.45)

        // -- Voice -----------------------------------------------------------
        case "sing", "whistle", "低声", "hum":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.45, smile: 0.40, browRaise: 0.30, pitch: -0.10), seconds: 0.35, easing: .easeInOut),
                PerformanceBeat(RigPose(mouthOpen: 0.72, smile: 0.35, browRaise: 0.45, pitch: -0.14, roll: 0.06), seconds: 0.40),
                PerformanceBeat(RigPose(mouthOpen: 0.30, smile: 0.42, roll: -0.05), seconds: 0.40),
                PerformanceBeat(RigPose(mouthOpen: 0.58, smile: 0.38, pitch: -0.08), seconds: 0.35),
                PerformanceBeat(.rest, seconds: 0.45),
            ], .sway, 0.55)

        case "mimic_voice", "echo", "replay", "imitate_tone", "parrot":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.55, smile: 0.25, browRaise: 0.30), seconds: 0.22),
                PerformanceBeat(RigPose(mouthOpen: 0.15, smile: 0.20), seconds: 0.16),
                PerformanceBeat(RigPose(mouthOpen: 0.50, smile: 0.25, browRaise: 0.25), seconds: 0.22),
                PerformanceBeat(RigPose(mouthOpen: 0.12, smile: 0.22), seconds: 0.16),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .nod, 0.4)

        case "stutter":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.35, browRaise: 0.40), seconds: 0.09, easing: .snap),
                PerformanceBeat(RigPose(mouthOpen: 0.05, browRaise: 0.42), seconds: 0.08),
                PerformanceBeat(RigPose(mouthOpen: 0.38, browRaise: 0.45), seconds: 0.09, easing: .snap),
                PerformanceBeat(RigPose(mouthOpen: 0.06, browRaise: 0.40), seconds: 0.08),
                PerformanceBeat(RigPose(mouthOpen: 0.42, browRaise: 0.30), seconds: 0.30),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .still, 0.3)

        case "be_quiet", "无声", "memory_off":
            return make([
                PerformanceBeat(RigPose(smile: 0.10, blink: 0.50, pitch: 0.10), seconds: 0.35, easing: .easeIn),
                PerformanceBeat(RigPose(smile: 0.08, blink: 0.20, pitch: 0.08), seconds: 0.7),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .still, 0.15)

        // -- Motion ----------------------------------------------------------
        case "jump", "hop", "向上":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.30, smile: 0.55, browRaise: 0.70, pitch: -0.18), seconds: 0.22, easing: .easeOut),
                PerformanceBeat(RigPose(mouthOpen: 0.45, smile: 0.60, browRaise: 0.50), seconds: 0.30),
                PerformanceBeat(RigPose(smile: 0.40, blink: 0.30, pitch: 0.10), seconds: 0.25),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .jump, 0.95)

        case "dance", "tango_move", "體育":
            return make([
                PerformanceBeat(RigPose(smile: 0.62, browRaise: 0.35, yaw: -0.18, roll: 0.12), seconds: 0.35, easing: .easeInOut),
                PerformanceBeat(RigPose(mouthOpen: 0.22, smile: 0.70, yaw: 0.20, roll: -0.12), seconds: 0.40),
                PerformanceBeat(RigPose(smile: 0.65, yaw: -0.14, roll: 0.10), seconds: 0.40),
                PerformanceBeat(RigPose(mouthOpen: 0.18, smile: 0.68, yaw: 0.16, roll: -0.08), seconds: 0.40),
                PerformanceBeat(.rest, seconds: 0.45),
            ], .dance, 0.85)

        case "spin", "turn", "转身", "翻滚":
            return make([
                PerformanceBeat(RigPose(smile: 0.40, browRaise: 0.30, yaw: -0.60), seconds: 0.30, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.45, yaw: 0.60), seconds: 0.45, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.42, yaw: 0.0), seconds: 0.30),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .spin, 0.9)

        case "shake":
            return make([
                PerformanceBeat(RigPose(blink: 0.30, roll: 0.16), seconds: 0.10, easing: .snap),
                PerformanceBeat(RigPose(blink: 0.20, roll: -0.16), seconds: 0.10, easing: .snap),
                PerformanceBeat(RigPose(blink: 0.25, roll: 0.12), seconds: 0.10, easing: .snap),
                PerformanceBeat(RigPose(roll: -0.08), seconds: 0.14),
                PerformanceBeat(.rest, seconds: 0.3),
            ], .bounce, 0.7)

        case "stomp", "踢腿":
            return make([
                PerformanceBeat(RigPose(smile: 0.10, browRaise: 0.20, pitch: -0.08), seconds: 0.24),
                PerformanceBeat(RigPose(mouthOpen: 0.20, blink: 0.45, pitch: 0.14), seconds: 0.14, easing: .snap),
                PerformanceBeat(.rest, seconds: 0.4),
            ], fn.name == "踢腿" ? .kick : .stomp, 0.9)

        case "brisk_step", "慢慢走", "慢跑", "前进", "march", "加速":
            return make([
                PerformanceBeat(RigPose(smile: 0.30, browRaise: 0.25, pitch: -0.06), seconds: 0.35, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.32, pitch: -0.04), seconds: 0.9, easing: .linear),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .march, 0.75)

        case "手势", "point", "指出", "引导", "notify":
            return make([
                PerformanceBeat(RigPose(smile: 0.25, browRaise: 0.45, yaw: 0.16), seconds: 0.26, easing: .easeOut),
                PerformanceBeat(RigPose(mouthOpen: 0.24, smile: 0.28, browRaise: 0.35, yaw: 0.12), seconds: 0.55),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .point, 0.65)

        case "抬头", "reach", "grand", "triumph":
            return make([
                PerformanceBeat(RigPose(smile: 0.55, browRaise: 0.70, pitch: -0.24), seconds: 0.38, easing: .easeOut),
                PerformanceBeat(RigPose(mouthOpen: 0.35, smile: 0.70, browRaise: 0.55, pitch: -0.20), seconds: 0.55),
                PerformanceBeat(.rest, seconds: 0.45),
            ], .reach, 0.85)

        case "致别", "farewell", "bow", "apology":
            return make([
                PerformanceBeat(RigPose(smile: 0.30, blink: 0.40, pitch: 0.26), seconds: 0.40, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.28, blink: 0.25, pitch: 0.22), seconds: 0.45),
                PerformanceBeat(.rest, seconds: 0.45),
            ], .bow, 0.6)

        case "clap", "testimonial", "祈犇":
            return make([
                PerformanceBeat(RigPose(smile: 0.65, browRaise: 0.45), seconds: 0.25, easing: .easeOut),
                PerformanceBeat(RigPose(mouthOpen: 0.25, smile: 0.72, browRaise: 0.35), seconds: 0.7),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .clap, 0.7)

        // -- Cognition -------------------------------------------------------
        case "思考", "analyze", "reason", "analyze_forecast", "predict", "想法":
            return make([
                PerformanceBeat(RigPose(smile: 0.08, blink: 0.35, browRaise: 0.30, yaw: -0.22, pitch: -0.08), seconds: 0.40, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.10, blink: 0.15, browRaise: 0.22, yaw: -0.18, pitch: -0.06), seconds: 0.75, easing: .linear),
                PerformanceBeat(RigPose(smile: 0.35, browRaise: 0.55, yaw: 0.0, pitch: 0.08), seconds: 0.30, easing: .easeOut),
                PerformanceBeat(.rest, seconds: 0.4),
            ], .think, 0.4)

        case "memory_check", "memory_idle", "memory_on", "同步", "导入":
            return make([
                PerformanceBeat(RigPose(smile: 0.12, blink: 0.55, browRaise: 0.25, yaw: 0.14), seconds: 0.30),
                PerformanceBeat(RigPose(smile: 0.15, blink: 0.10, browRaise: 0.35, yaw: -0.10), seconds: 0.45),
                PerformanceBeat(RigPose(smile: 0.30, browRaise: 0.20), seconds: 0.35),
                PerformanceBeat(.rest, seconds: 0.35),
            ], .still, 0.3)

        case "冷静", "be_calm", "be_smooth", "be_reliable":
            return make([
                PerformanceBeat(RigPose(smile: 0.25, blink: 0.30, pitch: 0.04), seconds: 0.55, easing: .easeInOut),
                PerformanceBeat(RigPose(smile: 0.28, blink: 0.10), seconds: 0.9, easing: .linear),
                PerformanceBeat(.rest, seconds: 0.5),
            ], .breathe, 0.2)

        case "喘口气", "breathe", "drift":
            return make([
                PerformanceBeat(RigPose(mouthOpen: 0.35, smile: 0.10, blink: 0.50, browRaise: 0.20, pitch: -0.10), seconds: 0.55, easing: .easeIn),
                PerformanceBeat(RigPose(mouthOpen: 0.10, smile: 0.18, blink: 0.20, pitch: 0.12), seconds: 0.65, easing: .easeOut),
                PerformanceBeat(.rest, seconds: 0.45),
            ], .breathe, 0.25)

        default:
            return nil
        }
    }

    // MARK: - Derived

    /// Builds a program from the function's family and its own name.
    ///
    /// The name seeds the variation, so `be_tidy` and `be_clever` read as
    /// different performances and each one is identical every time it runs —
    /// randomising here would make the twin's behaviour unrepeatable, which is
    /// exactly what a behaviour registry must not be.
    private nonisolated static func derived(_ fn: AvatarFunction) -> MotorProgram {
        let seed = stableHash(fn.name)
        /// 0…1, stable per name and per channel.
        func dial(_ channel: Int) -> Double {
            Double((seed >> (channel * 5)) & 0x1F) / 31.0
        }

        let swing = (dial(0) - 0.5) * 2       // -1…1
        let tilt = (dial(1) - 0.5) * 2
        let brightness = dial(2)              // 0…1
        let energy = 0.32 + dial(3) * 0.55
        let beatCount = 2 + Int(dial(4) * 2)  // 2…3 travelling beats

        let shape = family(fn.category)
        var beats: [PerformanceBeat] = []

        for index in 0..<beatCount {
            let step = beatCount > 1 ? Double(index) / Double(beatCount - 1) : 0
            // The first beat overshoots into the pose, later beats settle out of
            // it, which is what gives derived motion an arc instead of a wobble.
            let travel = index == 0 ? 1.0 : 1.0 - step * 0.45
            beats.append(
                PerformanceBeat(
                    RigPose(
                        mouthOpen: shape.mouth * travel * (0.6 + brightness * 0.6),
                        smile: shape.smileFloor + shape.smile * brightness * travel,
                        blink: index == 1 ? shape.blink : shape.blink * 0.3,
                        browRaise: shape.brow * travel * (0.5 + brightness * 0.7),
                        yaw: shape.yaw * swing * travel,
                        pitch: shape.pitch * tilt * travel,
                        roll: shape.roll * swing * travel * 0.8
                    ),
                    seconds: shape.beatSeconds * (0.75 + dial(5 + index) * 0.6),
                    easing: index == 0 ? .easeOut : .easeInOut
                )
            )
        }
        beats.append(PerformanceBeat(.rest, seconds: 0.38))

        return MotorProgram(
            function: fn.name,
            beats: beats,
            gesture: shape.gestures[Int(dial(7) * Double(shape.gestures.count - 1) + 0.5)],
            line: fn.performance,
            intensity: energy,
            isDirected: false
        )
    }

    /// The motion signature of a family — what a cognition function looks like
    /// versus a delivery one, before the individual name varies it.
    private nonisolated struct FamilyShape: Sendable {
        var mouth: Double
        var smile: Double
        var smileFloor: Double
        var blink: Double
        var brow: Double
        var yaw: Double
        var pitch: Double
        var roll: Double
        var beatSeconds: Double
        var gestures: [BodyGesture]
    }

    private nonisolated static func family(_ category: FunctionCategory) -> FamilyShape {
        switch category {
        case .humor:
            return FamilyShape(
                mouth: 0.52, smile: 0.55, smileFloor: 0.30, blink: 0.35, brow: 0.50,
                yaw: 0.18, pitch: 0.10, roll: 0.12, beatSeconds: 0.30,
                gestures: [.bounce, .nod, .sway]
            )
        case .presence:
            return FamilyShape(
                mouth: 0.26, smile: 0.45, smileFloor: 0.22, blink: 0.25, brow: 0.45,
                yaw: 0.20, pitch: 0.12, roll: 0.08, beatSeconds: 0.34,
                gestures: [.wave, .nod, .point]
            )
        case .voice:
            return FamilyShape(
                mouth: 0.62, smile: 0.25, smileFloor: 0.15, blink: 0.20, brow: 0.35,
                yaw: 0.10, pitch: 0.10, roll: 0.06, beatSeconds: 0.26,
                gestures: [.breathe, .sway, .nod]
            )
        case .expression:
            return FamilyShape(
                mouth: 0.30, smile: 0.60, smileFloor: 0.10, blink: 0.45, brow: 0.70,
                yaw: 0.14, pitch: 0.10, roll: 0.12, beatSeconds: 0.32,
                gestures: [.still, .breathe, .recoil]
            )
        case .motion:
            return FamilyShape(
                mouth: 0.28, smile: 0.40, smileFloor: 0.18, blink: 0.30, brow: 0.35,
                yaw: 0.34, pitch: 0.20, roll: 0.20, beatSeconds: 0.30,
                gestures: [.march, .bounce, .dance, .jump]
            )
        case .cognition:
            return FamilyShape(
                mouth: 0.14, smile: 0.20, smileFloor: 0.08, blink: 0.40, brow: 0.40,
                yaw: 0.24, pitch: 0.12, roll: 0.06, beatSeconds: 0.42,
                gestures: [.think, .still, .fold]
            )
        case .modes:
            // A mode is a state change, not a performance: it settles into a new
            // baseline rather than playing an action.
            return FamilyShape(
                mouth: 0.10, smile: 0.35, smileFloor: 0.14, blink: 0.50, brow: 0.30,
                yaw: 0.12, pitch: 0.08, roll: 0.05, beatSeconds: 0.38,
                gestures: [.still, .breathe, .fold]
            )
        case .delivery:
            return FamilyShape(
                mouth: 0.55, smile: 0.30, smileFloor: 0.16, blink: 0.20, brow: 0.42,
                yaw: 0.16, pitch: 0.10, roll: 0.06, beatSeconds: 0.28,
                gestures: [.point, .nod, .breathe]
            )
        case .body:
            return FamilyShape(
                mouth: 0.24, smile: 0.35, smileFloor: 0.14, blink: 0.28, brow: 0.32,
                yaw: 0.30, pitch: 0.22, roll: 0.22, beatSeconds: 0.34,
                gestures: [.sway, .march, .stomp, .reach, .clap]
            )
        case .concept:
            return FamilyShape(
                mouth: 0.20, smile: 0.28, smileFloor: 0.12, blink: 0.35, brow: 0.45,
                yaw: 0.22, pitch: 0.14, roll: 0.10, beatSeconds: 0.36,
                gestures: [.think, .reach, .fold, .sway]
            )
        }
    }

    /// FNV-1a over the name's UTF-8.
    ///
    /// `String.hashValue` is seeded per process, so the same function would
    /// perform differently after every relaunch. This does not.
    nonisolated static func stableHash(_ text: String) -> UInt64 {
        var hash: UInt64 = 0xcbf2_9ce4_8422_2325
        for byte in text.utf8 {
            hash ^= UInt64(byte)
            hash = hash &* 0x1000_0000_01b3
        }
        return hash
    }
}
