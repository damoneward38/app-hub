"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, X, ChevronRight, CornerDownLeft } from "lucide-react";

interface GhostTerminalProps {
  initialOpen?: boolean;
}

export default function GhostTerminal({ initialOpen = true }: GhostTerminalProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "KELI UNIFIED OS v4.2.0-STABLE",
    "ESTABLISHING SECURE CONNECTION...",
    "................................ 100%",
    "SYSTEMS NOMINAL. ENCRYPTED CHANNEL OPEN.",
    "TYPE 'help' FOR AVAILABLE COMMANDS.",
    "TYPE 'healing status' FOR PLATFORM REPORT.",
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const COMMANDS: Record<string, () => string[]> = {
    help: () => [
      "AVAILABLE COMMANDS:",
      "  help           - Show this menu",
      "  clear          - Clear terminal buffer",
      "  open healing   - Initialize unified platform",
      "  open body      - Initialize 3D body chamber",
      "  open brain     - Initialize 3D brain map",
      "  play [freq]    - [528, 40, 7.83, 111, 432, 963]",
      "  healing status - System health report",
      "  neshima protocol - Load O2 support",
      "  full healing protocol - Deploy unified stack",
      "  exit           - Terminal standby",
    ],
    clear: () => [],
    "open healing": () => [
      "OPENING UNIFIED HEALING PLATFORM...",
      "",
      "KELI    כְּלִי  — 3D Body Chamber    LOADING",
      "REYIAT  רְאִיַּת — 3D Brain Map       LOADING",
      "NESHIMA נְשִׁימָה — O2 Chamber        LOADING",
      "",
      "  [████████████████████] 100%",
      "",
      "ALL THREE SYSTEMS: ONLINE",
      "NAVIGATE TO: /healing",
      "",
      "TYPE: play 528     — DNA repair frequency",
      "TYPE: play 40      — Gamma brain lock",
      "TYPE: play 7.83    — Earth Schumann",
      "TYPE: open body    — 3D body map",
      "TYPE: open brain   — 3D brain map",
    ],
    "open body": () => [
      "OPENING 3D BODY MAP...",
      "KELI כְּלִי הָרְפוּאָה",
      "",
      "18 ORGANS MAPPED IN 3D:",
      "  Brain · Heart · Lungs · Liver",
      "  Kidneys · Pancreas · Stomach",
      "  Intestines · Bladder · Prostate",
      "  Ovaries · Adrenal · Spleen",
      "",
      "HEART: BEATING ANIMATION ACTIVE",
      "LUNGS: BREATHING ANIMATION ACTIVE",
      "48 TRANSDUCERS: ARMED",
      "NAVIGATE TO: /healing (Body View)",
    ],
    "open brain": () => [
      "OPENING 3D BRAIN MAP...",
      "REYIAT רְאִיַּת הַמֹּחַ",
      "",
      "19 REGIONS MAPPED IN 3D:",
      "  Prefrontal · Frontal L/R",
      "  Parietal · Temporal L/R",
      "  Occipital · Motor Cortex",
      "  Hippocampus L/R · Amygdala L/R",
      "  Thalamus · Hypothalamus",
      "  Pineal Gland · Corpus Callosum",
      "  Cerebellum · Brain Stem · Broca",
      "",
      "PINEAL GLAND: VISIBLE INSIDE",
      "CORTEX SHELL: TRANSPARENT",
      "NAVIGATE TO: /healing (Brain View)",
    ],
    "play 528": () => [
      "PLAYING 528Hz — DNA REPAIR FREQUENCY",
      "WAVEFORM: BINAURAL SINE",
      "LEFT EAR:  528Hz",
      "RIGHT EAR: 568Hz (40Hz beat)",
      "",
      "DR. GLEN REIN CONFIRMED:",
      "  UV absorption by DNA +5-9%",
      "  DNA repair enzyme activity increased",
      "  Cellular reconstruction signal active",
      "",
      "BODY MAP: Organs lighting up",
      "  Liver · DNA active",
      "  Brain · Repair signal",
      "  Heart · Coherence",
      "",
      "● 528Hz ACTIVE — PLAYING",
      "Use headphones for binaural effect",
    ],
    "play 40": () => [
      "PLAYING 40Hz — GAMMA BRAIN LOCK",
      "WAVEFORM: BINAURAL BEAT",
      "LEFT EAR:  200Hz carrier",
      "RIGHT EAR: 240Hz carrier",
      "BRAIN GENERATES: 40Hz internally",
      "",
      "MIT CONFIRMED:",
      "  Microglia activation confirmed",
      "  Immune cells activated",
      "  Amyloid plaque reduction",
      "  Alzheimer's prevention protocol",
      "",
      "BRAIN MAP: Gamma state activating",
      "  Prefrontal cortex LIGHTING UP",
      "  Hippocampus LIGHTING UP",
      "  Thalamus LIGHTING UP",
      "",
      "● 40Hz ACTIVE — COHERENCE BUILDING",
    ],
    "play 7.83": () => [
      "PLAYING 7.83Hz — SCHUMANN RESONANCE",
      "WAVEFORM: ISOCHRONIC",
      "CARRIER:  200Hz pulsed at 7.83Hz",
      "",
      "EARTH HEARTBEAT LOCKED",
      "NASA uses this in spacecraft.",
      "Astronauts get sick without it.",
      "Your brain is calibrated to this.",
      "",
      "EFFECT:",
      "  Biological clock synchronization",
      "  Immune system activation",
      "  Anti-anxiety cellular level",
      "  Cortisol reduction begins",
      "",
      "● 7.83Hz ACTIVE — EARTH LOCKED",
    ],
    "play 111": () => [
      "PLAYING 111Hz — PYRAMID FREQUENCY",
      "WAVEFORM: SINE",
      "",
      "CONFIRMED AT:",
      "  Great Pyramid King Chamber",
      "  Malta Hypogeum Oracle Chamber",
      "  Newgrange Tomb Ireland",
      "  All resonate at exactly 111Hz",
      "",
      "EFFECT:",
      "  Prefrontal cortex deactivates",
      "  Right brain activates",
      "  Serotonin and endorphins release",
      "  Altered consciousness state",
      "",
      "● 111Hz ACTIVE — PYRAMID STATE",
    ],
    "play 432": () => [
      "PLAYING 432Hz — DAVID HARP FREQUENCY",
      "WAVEFORM: SINE",
      "",
      "1 SAMUEL 16:23 — CONFIRMED:",
      "David played the Kinnor (lyre)",
      "Evil spirits left King Saul.",
      "432Hz = natural universal tuning.",
      "",
      "SCIENCE CONFIRMS:",
      "  Matches Schumann resonance harmonics",
      "  Water forms hexagonal crystals",
      "  Heart rate coherence improves",
      "  Cortisol reduced vs 440Hz",
      "",
      "● 432Hz ACTIVE — DAVID HARP TONE",
    ],
    "play 963": () => [
      "PLAYING 963Hz — CROWN ACTIVATION",
      "WAVEFORM: SINE",
      "",
      "PINEAL GLAND ACTIVATION SEQUENCE:",
      "  963Hz direct pineal resonance",
      "  DMT precursor pathway opens",
      "  Melatonin production increases",
      "  Crown consciousness state",
      "",
      "BRAIN MAP: Pineal gland",
      "  GLOWING — crown rays active",
      "  Crown activation visible in 3D",
      "",
      "WARNING: Do not drive after this.",
      "",
      "● 963Hz ACTIVE — CROWN OPEN",
    ],
    "neshima protocol": () => [
      "LOADING NESHIMA O2 PROTOCOL...",
      "נְשִׁימָה — THE BREATH THAT HEALS",
      "",
      "TEL AVIV UNIVERSITY 2020:",
      "  60 sessions HBOT",
      "  Telomere length +20-38%",
      "  Senescent cells -37%",
      "  Never achieved by any other means",
      "",
      "PROTOCOL LOADING:",
      "  O2 RAMP: 21% → 100%",
      "  PRESSURE: 2.0 ATM",
      "  FREQUENCIES: 7.83 + 40 + 528Hz",
      "  DURATION: 60 minutes",
      "",
      "CANCER NOTE:",
      "  Cancer cells are anaerobic.",
      "  They cannot survive high O2.",
      "  Sound disruption + O2 = maximum effect.",
      "",
      "NAVIGATE TO: /healing",
      "PROTOCOL: READY",
    ],
    "full healing protocol": () => [
      "ACTIVATING FULL HEALING PROTOCOL...",
      "כְּלִי · רְאִיַּת · נְשִׁימָה — ALL UNIFIED",
      "",
      "STAGE 1 — Ground (0-10 min):",
      "  7.83Hz Schumann · O2: 60%",
      "  Brain locks to Earth frequency",
      "",
      "STAGE 2 — Activate (10-30 min):",
      "  40Hz Gamma · O2: 80%",
      "  Immune system activating",
      "  Brain in peak coherence",
      "",
      "STAGE 3 — Repair (30-55 min):",
      "  528Hz DNA · 285Hz Tissue · O2: 100%",
      "  Cellular repair maximum",
      "  Telomere protection active",
      "",
      "STAGE 4 — Integrate (55-60 min):",
      "  432Hz Natural · O2: 80%",
      "  Brain and body harmonizing",
      "",
      "ALL SYSTEMS FIRING:",
      "  KELI    ● Body frequencies active",
      "  REYIAT  ● Brain monitoring active",
      "  NESHIMA ● O2 at 100%",
      "  RUACH   ● AI analyzing session",
      "",
      "FULL HEALING PROTOCOL: ACTIVE",
    ],
    "healing status": () => [
      "HEALING PLATFORM STATUS:",
      "",
      "KELI    כְּלִי  ● 3D Body Map      ONLINE",
      "REYIAT  רְאִיַּת ● 3D Brain Map     ONLINE",
      "NESHIMA נְשִׁימָה ● O2 Chamber      ONLINE",
      "",
      "FREQUENCY ENGINE:",
      "  26 frequencies loaded",
      "  Solfeggio · Schumann · Rife",
      "  Binaural · Ancient · Planetary",
      "",
      "PROTOCOLS AVAILABLE:",
      "  Full Body + Brain",
      "  Brain Quantum",
      "  Cancer Support ⚠ research only",
      "  Detox + Liver",
      "  Heart + Circulation",
      "  Pain Relief",
      "  Deep Sleep",
      "  Immune Activation",
      "",
      "RUACH AI: READY",
      "NESHER BRAIN BRIDGE: ACTIVE",
      "",
      "TYPE: full healing protocol — TO BEGIN",
      "TYPE: open healing — TO OPEN PLATFORM",
    ],
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.toLowerCase().trim();
    if (!cmd) return;

    setHistory(prev => [...prev, `> ${cmd}`]);
    setInput("");

    if (COMMANDS[cmd]) {
      const output = COMMANDS[cmd]();
      if (cmd === "clear") {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, ...output]);
      }
    } else if (cmd === "exit") {
      setIsOpen(false);
    } else {
      setHistory(prev => [...prev, `Command not found: ${cmd}`, "Type 'help' for available commands."]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex flex-col items-end">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-110 transition-transform active:scale-95"
          >
            <Terminal size={24} />
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50, x: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50, x: 50 }}
            className="w-full max-w-[580px] h-[500px] bg-black/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10"
          >
            <header className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-cyan-400">
                  Keli Unified Terminal · secure_core
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-4 font-mono text-[11px] leading-relaxed space-y-1"
            >
              {history.map((line, i) => (
                <div key={i} className={line.startsWith(">") ? "text-cyan-400 font-bold mt-2" : "text-white/70"}>
                  {line}
                </div>
              ))}
            </div>

            <form 
              onSubmit={handleCommand}
              className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center gap-3"
            >
              <ChevronRight size={14} className="text-cyan-500" />
              <input 
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 font-mono text-[11px] text-white placeholder:text-white/10"
                placeholder="EXECUTE COMMAND..."
              />
              <button type="submit" className="text-cyan-500/30 hover:text-cyan-500 transition-colors">
                <CornerDownLeft size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
