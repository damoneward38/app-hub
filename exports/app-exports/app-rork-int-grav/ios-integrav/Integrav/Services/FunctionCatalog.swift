import Foundation

/// The 300 avatar behaviours Intégrav can run on the twin. Names are stable
/// identifiers — chains are stored as lists of these names.
nonisolated enum FunctionCatalog {
    static let all: [AvatarFunction] = build()

    nonisolated static func function(named name: String) -> AvatarFunction? {
        all.first { $0.name == name }
    }

    nonisolated static func function(hotkey: Int) -> AvatarFunction? {
        guard hotkey >= 1, hotkey <= all.count else { return nil }
        return all[hotkey - 1]
    }

    private nonisolated static func build() -> [AvatarFunction] {
        let names = blockA + blockB + blockC + blockD + blockE + blockF
        return names.enumerated().map { offset, name in
            AvatarFunction(index: offset + 1, name: name, category: category(for: offset + 1))
        }
    }

    private nonisolated static func category(for index: Int) -> FunctionCategory {
        switch index {
        case 10...16, 32, 33, 72, 73, 89: return .presence
        case 1...9, 30, 31, 84...88: return .humor
        case 17...29, 43...45, 196...201, 204: return .voice
        case 34...42: return .expression
        case 46...56: return .motion
        case 57...83, 90...99: return .cognition
        case 100...140: return .modes
        case 141...164: return .delivery
        case 165...195, 202, 203: return .body
        default: return .concept
        }
    }

    // MARK: - Names 1–50

    private static let blockA: [String] = [
        "tell_joke", "punchline", "dad_joke", "standup", "one_liner",
        "knock_knock", "meme_reaction", "sarcasm", "sarcastic_reply", "greeting",
        "latched_greeting", "hello_with_wave", "good_bad_news", "feign_oblivious", "overreact",
        "underreact", "mimic_voice", "echo", "replay", "imitate_tone",
        "sound_effect", "laugh_cackle", "laugh_chuckle", "laugh_in_loud", "giggle",
        "snort", "sneeze", "grumble", "complaint", "roast",
        "flirt", "testimonial", "listener", "emotion_face", "sad_face",
        "happy_face", "surprised_face", "angry_face", "confused_face", "wittily_smirched",
        "raising_eyebrows", "blink", "whistle", "sing", "burp",
        "poof", "stomp", "tango_move", "brisk_step", "cuddle",
    ]

    // MARK: - Names 51–100

    private static let blockB: [String] = [
        "spin", "shake", "turn", "jump", "hop",
        "dance", "talkback", "waste", "smart_response", "canned_reply",
        "explain", "cryptic_message", "arbitrary_encrypt", "anti_cryptic", "snake_eyes",
        "light_lag", "no_ack", "yes", "roll_dice", "draw_arch",
        "art_smooth", "altruistic_gift", "apology", "reason", "assertion",
        "memory_idle", "memory_check", "memory_off", "memory_on", "made_up_fact",
        "random_fact", "nonsense", "pseudocode", "humor_by_type", "puns",
        "wordplay", "meta", "meta_joke", "golden_rule", "random_response",
        "freeform", "limited", "idk", "touched", "analyze",
        "analyze_forecast", "analysis_short", "concise", "detailed", "be_quiet",
    ]

    // MARK: - Names 101–150

    private static let blockC: [String] = [
        "be_brief", "be_witty", "be_politely", "be_frank", "be_pitch",
        "be_yours", "be_not", "be_unexpected", "be_surprise", "be_all",
        "be_extra", "be_total", "be_dynamic", "be_operational", "be_adaptive",
        "be_real", "be_smart", "be_humorous", "be_interesting", "be_valid",
        "be_reliable", "be_nice", "be_spiritual", "be_upbeat", "be_caustic",
        "be_brisk", "be_suspect", "be_truth", "be_sharp", "be_explain",
        "be_tidy", "be_creative", "be_clever", "be_smooth", "be_rude",
        "be_quick", "be_codg", "be_time", "be_action", "be_mark",
        "compress", "see", "feel", "hide", "expose",
        "grand", "some", "try", "speak", "drift",
    ]

    // MARK: - Names 151–200

    private static let blockD: [String] = [
        "dovetail", "predict", "caution", "notify", "on_the_spot",
        "tell", "count", "narrate", "conversation", "dialogue",
        "ban", "talk", "parrot", "stutter", "发型",
        "反问", "春風", "微笑", "握手", "抚摸",
        "抱緊", "體育", "翻滚", "踢腿", "熱情",
        "低声", "手势", "无言", "流下泪", "打喷嚏",
        "轻轻摇头", "慢慢走", "加速", "前进", "横向",
        "转身", "叹息", "思考", "矢神", "警醒",
        "冷静", "引导", "劝导", "悯惜", "收紧",
        "欢笑", "大笑", "惨笑", "逗笑", "惊笑",
    ]

    // MARK: - Names 201–250

    private static let blockE: [String] = [
        "哼哼", "抬头", "苦略", "喘口气", "当然",
        "买单", "试试", "你们", "往真话", "得道",
        "够力", "孜孜不倦", "百分比", "微信号", "先前",
        "漏影", "听你", "名义", "微八", "全身",
        "指出", "敏感点", "国家", "主推", "多色",
        "为先", "坐标", "从常数", "这也", "相主",
        "无碍", "星座", "延长高度", "致别", "恐怖",
        "想法", "个人日记", "军火", "加强", "别貌",
        "慢跑", "向上", "莱文", "议员", "族系",
        "智能化", "正反比", "股东", "清算", "祈犇",
    ]

    // MARK: - Names 251–300

    private static let blockF: [String] = [
        "咀嚼", "神", "增量", "总体", "公共",
        "多眼", "主机", "善意", "主要", "惹人喜爱装束",
        "多处", "剩余零散", "新兴", "莫说", "唤捐资",
        "导入", "同步", "素材", "看似教育", "旁观",
        "没有点输出", "掌握", "制造", "先行者", "证明",
        "盘算", "弹性", "外延", "超出", "负长违",
        "设想", "实际值", "思路", "侧写", "科普",
        "旋转", "识别", "文化", "相对", "适配",
        "毒虫", "剧场", "精密", "职业", "公诉",
        "翻译", "兼容", "掌控", "面外", "全都一样",
    ]

    // MARK: - Scripted performances

    /// Hand-written lines for the behaviours people try first. Everything else
    /// falls back to a category performance.
    static let scripted: [String: String] = [
        "tell_joke": "I asked my twin to write my set. It shipped 40,000 punchlines and one apology.",
        "dad_joke": "I'd tell you a UDP joke, but you might not get it.",
        "knock_knock": "Knock knock. — Who's there? — Latency. — Latency wh—  exactly.",
        "one_liner": "I don't have imposter syndrome. I have 2,847 hours of receipts.",
        "punchline": "…and that's why the pen-test fleet still won't speak to the intern.",
        "standup": "Two minutes, no notes: you, on a stage, funnier than you were at 2am.",
        "sarcasm": "Oh absolutely. Nothing has ever gone wrong at 100,000 concurrent anything.",
        "sarcastic_reply": "Bold of you to assume I wasn't already three fleets ahead of that.",
        "roast": "Your commit messages are just 'fix' with increasing desperation.",
        "flirt": "You built me out of your own face and I still think you're the good-looking one.",
        "greeting": "I'm here. Same face, fewer sleep requirements.",
        "hello_with_wave": "*waves* — online and listening.",
        "apology": "That one's on me. Re-running it properly.",
        "random_fact": "Octopuses have three hearts and two of them stop when they swim. Relatable.",
        "made_up_fact": "Flagged as fabricated: 'violet is the fastest colour.' Do not quote me.",
        "roll_dice": "Rolled a 4 and a 3. Seven. The engine says go.",
        "idk": "I don't know. I'd rather say that than sound confident and be wrong.",
        "yes": "Yes.",
        "no_ack": "…",
        "be_quiet": "…",
        "explain": "Short version first, then the version with the edge cases.",
        "pseudocode": "for clip in footage: ingest(clip); while likeness < 1.0: keep_going()",
        "analyze": "Reading the last run: throughput steady, zero failed batches, latency inside budget.",
        "analyze_forecast": "At this ingest rate you hit full likeness in about nine more hours of footage.",
        "sing": "♪ two thousand eight hundred forty-seven hours of you ♪",
        "whistle": "*a clean four-note whistle*",
        "memory_on": "Memory on. I'll keep this thread.",
        "memory_off": "Memory off. This one evaporates when you close it.",
        "memory_check": "Holding your last 40 lines, 3 source clips and every chain you've saved.",
        "meta_joke": "This is the part where I pretend function 088 was the funny one.",
        "freeform": "No constraints. Say anything and I'll go where you go.",
        "speak": "Speaking as you — cadence borrowed, opinions yours.",
        "predict": "My call: it holds. Run it as a task so you get proof instead of a hunch.",
        "testimonial": "\"It sounds like him. That's the unsettling part.\" — everyone, once.",
        "golden_rule": "Rule one: never say something as you that you wouldn't sign.",
    ]
}
