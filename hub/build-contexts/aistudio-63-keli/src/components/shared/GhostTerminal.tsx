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
      "TYPE: play 528     — 528Hz audio preset",
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
      "PLAYING 528Hz — AUDIO PRESET",
      "WAVEFORM: BINAURAL SINE",
      "LEFT EAR:  528Hz",
      "RIGHT EAR: 568Hz (40Hz beat)",
      "",
      "GLEN REIN CLAIM — UNVERIFIED:",
      "  DNA-repair effects are not established",
      "  No biological measurements are connected",
      "  VISUALIZATION ONLY — no cellular response measured",
      "",
      "BODY MAP: visual highlight only",
      "  No organ response is measured",
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
      "RESEARCH CONTEXT — PRECLINICAL:",
      "  40Hz gamma studied in animal models",
      "  Not an established Alzheimer's treatment",
      "  No biological measurement is connected",
      "",
      "BRAIN MAP: visual highlight only",
      "  No neural response is measured",
      "",
      "● 40Hz ACTIVE — COHERENCE BUILDING",
    ],
    "play 7.83": () => [
      "PLAYING 7.83Hz — SCHUMANN RESONANCE",
      "WAVEFORM: ISOCHRONIC",
      "CARRIER:  200Hz pulsed at 7.83Hz",
      "",
      "SCHUMANN RESONANCE — EARTH-IONOSPHERE",
      "Audio preset only.",
      "No brain synchronization is measured.",
      "",
      "● 7.83Hz ACTIVE — AUDIO PRESET",
    ],
    "play 111": () => [
      "PLAYING 111Hz — PYRAMID FREQUENCY",
      "WAVEFORM: SINE",
      "",
      "HISTORICAL CLAIM — UNVERIFIED:",
      "  Sites are popularly associated with 111Hz",
      "  No measured effect on the brain",
      "",
      "● 111Hz ACTIVE — AUDIO PRESET",
    ],
    "play 432": () => [
      "PLAYING 432Hz — DAVID HARP FREQUENCY",
      "WAVEFORM: SINE",
      "",
      "HISTORICAL/TUNING PREFERENCE:",
      "  432Hz is an alternative tuning choice.",
      "  Health and DNA claims are unverified.",
      "  No biological measurement is connected.",
      "",
      "● 432Hz ACTIVE — AUDIO PRESET",
    ],
    "play 963": () => [
      "PLAYING 963Hz — CROWN PRESET",
      "WAVEFORM: SINE",
      "",
      "PINEAL/CROWN INTERPRETATION:",
      "  Audio preset and visual highlight only.",
      "  No DMT, melatonin, or pineal effect is measured.",
      "",
      "● 963Hz ACTIVE — AUDIO PRESET",
    ],
    "neshima protocol": () => [
      "LOADING NESHIMA O2 PROTOCOL...",
      "נְשִׁימָה — BREATH VISUALIZATION",
      "",
      "HBOT IS A CLINICAL PROCEDURE:",
      "  Requires qualified medical supervision.",
      "  This app does not provide oxygen therapy.",
      "  No telomere or cellular measurement is performed.",
      "",
      "ILLUSTRATIVE SESSION:",
      "  O2 DISPLAY: 21% → 100%",
      "  PRESSURE DISPLAY: 2.0 ATM",
      "  FREQUENCIES: 7.83 + 40 + 528Hz",
      "  DURATION: 60 minutes",
      "",
      "NAVIGATE TO: /healing",
      "VISUALIZATION: READY",
    ],
    "full healing protocol": () => [
      "ACTIVATING FULL HEALING PROTOCOL...",
      "כְּלִי · רְאִיַּת · נְשִׁימָה — ALL UNIFIED",
      "",
      "STAGE 1 — Ground (0-10 min):",
      "  7.83Hz preset · O2 display: 60%",
      "",
      "STAGE 2 — Activate (10-30 min):",
      "  40Hz preset · O2 display: 80%",
      "",
      "STAGE 3 — Explore (30-55 min):",
      "  528Hz + 285Hz presets · O2 display: 100%",
      "",
      "STAGE 4 — Integrate (55-60 min):",
      "  432Hz preset · O2 display: 80%",
      "",
      "ALL MODULES RUNNING:",
      "  KELI    ● 3D body visualization",
      "  REYIAT  ● 3D brain visualization",
      "  NESHIMA ● oxygen display only",
      "  RUACH   ● local AI if configured",
      "",
      "FULL SESSION: VISUALIZATION ACTIVE",
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
      "  Detox Label + Liver",
      "  Heart + Circulation",
      "  Pain Preset",
      "  Deep Sleep",
      "  Immune Preset",
      "",
      "RUACH AI: LOCAL OLLAMA IF CONFIGURED",
      "NESHER BRAIN BRIDGE: NOT CONNECTED",
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
