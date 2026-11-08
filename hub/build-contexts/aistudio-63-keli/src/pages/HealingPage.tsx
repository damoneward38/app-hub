"use client";

/**
 * KELI + REYIAT + NESHIMA — Unified Healing Platform
 * Body · Brain · Oxygen · Sound · All Connected
 */

import {
  useState, useRef, useEffect,
  useCallback, useMemo, Suspense,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  Brain, Radio, Wind, Volume2,
  VolumeX, Play, Square, Zap,
  Activity, Shield, ChevronLeft,
  AlertTriangle, CheckCircle,
  Clock, Heart, Cpu, Eye, LogIn, LogOut, User as UserIcon, LayoutDashboard
} from "lucide-react";

import RealisticBrain3D from "../components/RealisticBrain3D";
import RealisticBody3D from "../components/RealisticBody3D";
import { useFirebase } from "../components/FirebaseProvider";
import { loginWithGoogle, auth } from "../lib/firebase";

/* ── Complete frequency database ─────────────────────────── */
const ALL_FREQUENCIES = [
  // Schumann / Earth
  { hz: 7.83,  name: "Schumann",        color: "#10b981", category: "earth",       effect: "Earth-ionosphere resonance. Audio preset only."               },
  { hz: 8.22,  name: "Antarctic",       color: "#38bdf8", category: "earth",       effect: "Schumann-resonance variant. Audio preset only."          },
  // Brain waves
  { hz: 0.5,   name: "Epsilon",         color: "#6366f1", category: "brainwave",   effect: "Very low-frequency audio preset. No quantum or sleep effect is measured."                 },
  { hz: 2,     name: "Delta Deep",      color: "#6366f1", category: "brainwave",   effect: "Low-frequency audio preset. No sleep or hormone effect is measured."            },
  { hz: 4,     name: "Theta Gate",      color: "#8b5cf6", category: "brainwave",   effect: "Audio preset for meditation context. No memory or subconscious effect is measured."                       },
  { hz: 10,    name: "Alpha Peak",      color: "#06b6d4", category: "brainwave",   effect: "Audio preset. No anxiety or neurotransmitter effect is measured."                   },
  { hz: 14,    name: "Beta Focus",      color: "#10b981", category: "brainwave",   effect: "Audio preset. No cognitive effect is measured."                    },
  { hz: 40,    name: "Gamma Lock",      color: "#f59e0b", category: "brainwave",   effect: "Preclinical gamma research context. Not an Alzheimer's treatment; no effect measured."   },
  // Healing
  { hz: 32,    name: "Nitric Oxide",    color: "#ef4444", category: "healing",     effect: "Audio preset. No nitric-oxide, circulation, or oxygen effect is measured."              },
  { hz: 54,    name: "Heart Resonance", color: "#f43f5e", category: "healing",     effect: "Audio preset. No cardiac or HRV effect is measured."                      },
  { hz: 111,   name: "Pyramid Gate",   color: "#fbbf24", category: "ancient",     effect: "Historical/anecdotal association. Audio preset only."            },
  { hz: 136.1, name: "OM Tone",        color: "#f97316", category: "planetary",   effect: "Audio preset. No orbital or grounding effect is measured."               },
  // Solfeggio
  { hz: 174,   name: "Pain Relief",    color: "#6366f1", category: "solfeggio",   effect: "Audio preset. No anesthetic, pain, or trauma effect is measured."          },
  { hz: 285,   name: "285Hz Preset",   color: "#06b6d4", category: "solfeggio",   effect: "Audio preset. No tissue, wound-healing, or organ effect is measured."      },
  { hz: 396,   name: "Liberation",     color: "#7c3aed", category: "solfeggio",   effect: "Audio preset. No trauma, PTSD, or grounding effect is measured."           },
  { hz: 417,   name: "Transform",      color: "#8b5cf6", category: "solfeggio",   effect: "Audio preset. No behavioral or trauma effect is measured."           },
  { hz: 432,   name: "David Harp",     color: "#fbbf24", category: "ancient",     effect: "Alternative tuning preference. No health or DNA effect is measured." },
  { hz: 528,   name: "528Hz Preset",    color: "#fbbf24", category: "solfeggio",   effect: "Biological effects are unverified; audio preset only."         },
  { hz: 639,   name: "Connection",     color: "#ec4899", category: "solfeggio",   effect: "Audio preset. No relationship or cellular effect is measured."            },
  { hz: 741,   name: "741Hz Preset",    color: "#84cc16", category: "solfeggio",   effect: "Audio preset. No detox or EMF effect is measured."           },
  { hz: 852,   name: "Intuition",      color: "#a78bfa", category: "solfeggio",   effect: "Audio preset. No intuition or 'third eye' effect is measured."               },
  { hz: 963,   name: "Crown",          color: "#f0abfc", category: "consciousness", effect: "Audio preset. No pineal or consciousness effect is measured."        },
  // Rife research
  { hz: 728,   name: "Rife General",   color: "#ef4444", category: "rife",        effect: "Historical concept with no established medical efficacy. Research only."                    },
  { hz: 784,   name: "Rife Secondary", color: "#f97316", category: "rife",        effect: "Historical concept, no established medical efficacy. Research only."                       },
  { hz: 880,   name: "Rife Tertiary",  color: "#fbbf24", category: "rife",        effect: "Historical concept, no established medical efficacy. Research only."                          },
  { hz: 1550,  name: "Rife Prostate",  color: "#3b82f6", category: "rife",        effect: "Historical concept, no established medical efficacy. Research only."                              },
  { hz: 2008,  name: "Rife Sarcoma",   color: "#a855f7", category: "rife",        effect: "Historical concept, no established medical efficacy. Research only."                               },
  { hz: 2128,  name: "Rife Carcinoma", color: "#ef4444", category: "rife",        effect: "Historical concept, no established medical efficacy. Research only."                             },
];

/* ── Healing protocols ───────────────────────────────────── */
const PROTOCOLS = [
  {
    name:    "Full Body + Brain",
    hebrew:  "גּוּף וּמֹחַ שָׁלֵם",
    color:   "#10b981",
    freqs:   [7.83, 40, 528, 285, 432, 174],
    o2:      90,
    duration: 60,
    desc:    "Audio and oxygen concepts for education only; no cellular response is measured.",
    targets: ["brain","heart","liver","lung-left","lung-right"],
  },
  {
    name:    "Brain Quantum",
    hebrew:  "מֹחַ קְוַנְטִי",
    color:   "#7c3aed",
    freqs:   [40, 7.83, 528, 963],
    o2:      100,
    duration: 45,
    desc:    "40Hz audio preset with a visual highlight. No neural or pineal effect is measured.",
    targets: ["brain"],
  },
  {
    name:    "Cancer Support (Research Only)",
    hebrew:  "תְּמִיכָה בְּסַרְטָן",
    color:   "#ef4444",
    freqs:   [728, 528, 285, 40, 7.83],
    o2:      100,
    duration: 60,
    desc:    "Experimental audio presets only. Clinical benefit is not established; consult a licensed clinician for medical concerns.",
    targets: ["liver","lung-left","lung-right","brain"],
    warning: true,
  },
  {
    name:    "Detox Label + Liver",
    hebrew:  "נִקּוּי כָּבֵד",
    color:   "#f97316",
    freqs:   [741, 528, 396, 432, 285],
    o2:      80,
    duration: 45,
    desc:    "741Hz audio preset. No detox or organ-restoration effect is measured.",
    targets: ["liver","kidney-left","kidney-right"],
  },
  {
    name:    "Heart + Circulation",
    hebrew:  "לֵב וּזְרִימַת דָּם",
    color:   "#ef4444",
    freqs:   [54, 32, 432, 528],
    o2:      100,
    duration: 30,
    desc:    "Audio presets. No nitric-oxide, blood-vessel, or circulation effect is measured.",
    targets: ["heart"],
  },
  {
    name:    "Pain Preset",
    hebrew:  "הַקְלָעַת כְּאֵב",
    color:   "#06b6d4",
    freqs:   [174, 285, 432, 7.83],
    o2:      70,
    duration: 30,
    desc:    "174Hz audio preset. No anesthetic or pain-relief effect is measured.",
    targets: ["brain","small-intestine"],
  },
  {
    name:    "Deep Sleep",
    hebrew:  "שֵׁנָה עֲמֻקָּה",
    color:   "#6366f1",
    freqs:   [0.5, 2, 174, 7.83],
    o2:      60,
    duration: 45,
    desc:    "Low-frequency audio preset. No sleep or brainstem effect is measured.",
    targets: ["brain","brainstem"],
  },
  {
    name:    "Immune Preset",
    hebrew:  "הַפְעָלַת חִיסּוּן",
    color:   "#a855f7",
    freqs:   [528, 40, 7.83, 285],
    o2:      100,
    duration: 45,
    desc:    "Audio presets. No microglia, DNA, or immune effect is measured.",
    targets: ["spleen","brain","lymph"],
  },
];

/* ── Audio engine ────────────────────────────────────────── */
function useAudioEngine() {
  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscsRef   = useRef<Map<number, { oscs: OscillatorNode[]; gain: GainNode }>>(new Map());
  const [playing, setPlaying]    = useState<Set<number>>(new Set());
  const [volume,  setVolumeState] = useState(0.65);
  const [muted,   setMuted]       = useState(false);
  const [ready,   setReady]       = useState(false);

  const init = useCallback(() => {
    if (ctxRef.current) return;
    const ctx      = new AudioContext();
    const master   = ctx.createGain();
    const analyser = ctx.createAnalyser();
    const comp     = ctx.createDynamicsCompressor();

    analyser.fftSize = 2048;
    master.gain.value = 0.65;

    master.connect(comp);
    comp.connect(analyser);
    analyser.connect(ctx.destination);

    ctxRef.current    = ctx;
    masterRef.current = master;
    analyserRef.current = analyser;
    setReady(true);
  }, []);

  const play = useCallback((hz: number) => {
    init();
    const ctx    = ctxRef.current!;
    const master = masterRef.current!;

    if (oscsRef.current.has(hz)) {
      const e = oscsRef.current.get(hz)!;
      e.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
      setTimeout(() => {
        e.oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
        e.gain.disconnect();
      }, 400);
      oscsRef.current.delete(hz);
      setPlaying(prev => { const n = new Set(prev); n.delete(hz); return n; });
      return;
    }

    const gain   = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);

    const merger = ctx.createChannelMerger(2);
    merger.connect(gain);

    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    const gL   = ctx.createGain();
    const gR   = ctx.createGain();

    oscL.type = oscR.type = "sine";
    const carrier = hz < 20 ? 200 : hz;
    oscL.frequency.value = carrier;
    oscR.frequency.value = hz < 20
      ? carrier + hz * 2
      : carrier + Math.min(carrier * 0.2, 2);

    gL.gain.value = gR.gain.value = 0.5;
    oscL.connect(gL); gL.connect(merger, 0, 0);
    oscR.connect(gR); gR.connect(merger, 0, 1);
    oscL.start(); oscR.start();

    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.8);
    oscsRef.current.set(hz, { oscs: [oscL, oscR], gain });
    setPlaying(prev => new Set(prev).add(hz));
  }, [init]);

  const stopAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    oscsRef.current.forEach(e => {
      e.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
      setTimeout(() => {
        e.oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
        e.gain.disconnect();
      }, 400);
    });
    oscsRef.current.clear();
    setPlaying(new Set());
  }, []);

  const playStack = useCallback((freqs: number[]) => {
    stopAll();
    freqs.forEach((hz, i) => {
      setTimeout(() => play(hz), i * 320);
    });
  }, [stopAll, play]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(
        muted ? 0 : v, ctxRef.current.currentTime + 0.1
      );
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    const m = !muted;
    setMuted(m);
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(
        m ? 0 : volume, ctxRef.current.currentTime + 0.1
      );
    }
  }, [muted, volume]);

  const getWaveform = useCallback((): Uint8Array | null => {
    if (!analyserRef.current) return null;
    const data = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(data);
    return data;
  }, []);

  const getSpectrum = useCallback((): Float32Array | null => {
    if (!analyserRef.current) return null;
    const data = new Float32Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getFloatFrequencyData(data);
    return data;
  }, []);

  useEffect(() => () => { stopAll(); }, [stopAll]);

  return {
    playing, volume, muted, ready,
    play, stopAll, playStack,
    setVolume, toggleMute,
    getWaveform, getSpectrum,
    analyser: analyserRef.current,
    init,
  };
}

/* ── Waveform visualizer ─────────────────────────────────── */
function WaveformViz({
  playing, getSpectrum, getWaveform,
}: {
  playing:     Set<number>;
  getSpectrum: () => Float32Array | null;
  getWaveform: () => Uint8Array | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W;
        canvas.height = H;
      }

      ctx.fillStyle = "rgba(0,5,8,0.25)";
      ctx.fillRect(0, 0, W, H);

      const spec = getSpectrum();
      const wave = getWaveform();

      if (spec && playing.size > 0) {
        const barW = W / (spec.length / 4);
        let x = 0;
        for (let i = 0; i < spec.length / 4; i++) {
          const pct = Math.max(0, (spec[i] + 100) / 100);
          const bH  = pct * H * 0.7;
          const hue = (i / (spec.length / 4)) * 200 + 160;
          ctx.fillStyle   = `hsla(${hue},80%,60%,${0.4 + pct * 0.4})`;
          ctx.fillRect(x, H - bH, barW - 0.5, bH);
          x += barW;
        }
      }

      if (wave) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(6,182,212,0.6)";
        ctx.lineWidth   = 1.5;
        for(let i=0; i<wave.length; i++) {
          const wx = (i / wave.length) * W;
          const wy = ((wave[i] / 128) - 1) * (H * 0.25) + H * 0.5;
          i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing.size, getSpectrum, getWaveform]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{
        height:     72,
        background: "rgba(0,5,8,0.95)",
        border:     "1px solid rgba(6,182,212,0.12)",
      }}
    />
  );
}

/* ── O2 chamber visual ───────────────────────────────────── */
function O2Chamber({
  level, active,
}: {
  level: number; active: boolean;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer"
         style={{
           background: "rgba(0,5,8,0.85)",
           border:     `1px solid rgba(56,189,248,${active ? 0.4 : 0.15})`,
           padding:    "16px",
         }}>
      <Link to="/oxygen" className="block">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind size={16} style={{ color: "#38bdf8" }} />
            <span className="font-bold text-white text-sm">O₂ Chamber</span>
          </div>
          <motion.div
            className="font-mono font-bold text-2xl"
            style={{
              color:      "#38bdf8",
              textShadow: active ? "0 0 20px rgba(56,189,248,0.8)" : "none",
            }}
            animate={active ? {
              textShadow: [
                "0 0 10px rgba(56,189,248,0.5)",
                "0 0 30px rgba(56,189,248,1)",
                "0 0 10px rgba(56,189,248,0.5)",
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level}%
          </motion.div>
        </div>

        <div className="h-3 rounded-full overflow-hidden mb-3"
             style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, #0284c7, #38bdf8)`,
              boxShadow:  active ? "0 0 10px rgba(56,189,248,0.5)" : "none",
            }}
            animate={{ width: `${level}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="relative h-16 overflow-hidden rounded-xl"
             style={{ background: "rgba(0,13,20,0.6)" }}>
          {active && Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width:     Math.random() * 6 + 2,
                height:    Math.random() * 6 + 2,
                left:      `${5 + i * 8}%`,
                background: "rgba(56,189,248,0.5)",
                boxShadow:  "0 0 6px rgba(56,189,248,0.8)",
              }}
              animate={{
                y:       [0, -70],
                opacity: [0.8, 0],
                scale:   [1, 0.3],
              }}
              transition={{
                duration:    1.5 + Math.random() * 1.5,
                delay:       i * 0.2,
                repeat:      Infinity,
                ease:        "easeOut",
              }}
            />
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[10px] font-mono"
                   style={{ color: "rgba(56,189,248,0.4)" }}>
                {active ? "PRESSURIZING" : "STANDBY"}
              </div>
              <div className="text-xs font-mono font-bold mt-0.5"
                   style={{ color: "#38bdf8" }}>
                {active ? `${level}% O₂ ACTIVE` : "21% AMBIENT"}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ── Ghost AI (Ruach AI) panel ────────────────────────────── */
function GhostAI({
  selectedOrgan, selectedBrain,
  activeFreqs, brainState, o2Level,
}: {
  selectedOrgan: any;
  selectedBrain: any;
  activeFreqs:   number[];
  brainState:    string;
  o2Level:       number;
}) {
  const insight = useMemo(() => {
    if (activeFreqs.length === 0) {
      return "No frequencies active. Select a protocol or click an organ to begin.";
    }

    const freqList = activeFreqs.slice(0, 3).map(hz => `${hz}Hz`).join(", ");
    const target   = selectedOrgan?.name ?? selectedBrain?.name ?? "full body";

    if (activeFreqs.includes(40)) {
      return `${freqList} active → ${target}. 40Hz audio preset active. Preclinical gamma research is not an established immune therapy; no effect is measured.`;
    }
    if (activeFreqs.includes(528)) {
      return `${freqList} active → ${target}. 528 Hz audio preset active. Visualization only — no cellular response is measured.`;
    }
    if (activeFreqs.includes(7.83)) {
      return `${freqList} active → ${target}. Schumann audio preset active. No brain synchronization is measured.`;
    }
    return `${freqList} active → ${target}. Frequencies broadcasting. O₂ at ${o2Level}%. Brain state: ${brainState}.`;
  }, [activeFreqs, selectedOrgan, selectedBrain, brainState, o2Level]);

  return (
    <div className="rounded-2xl p-4"
         style={{
           background:     "rgba(0,0,8,0.85)",
           backdropFilter: "blur(20px)",
           border:         "1px solid rgba(124,58,237,0.2)",
         }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center relative overflow-hidden"
             style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
          <motion.div 
            className="absolute inset-0 bg-white"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror", repeatDelay: 3 }}
          />
          <Cpu size={14} className="text-white relative z-10" />
        </div>
        <div>
          <motion.div 
            className="text-xs font-bold text-white tracking-widest"
            animate={{ opacity: [1, 0.6, 1], x: [0, 1, -1, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            GHOST AI
          </motion.div>
        </div>
      </div>

      <motion.p
        key={insight.slice(0, 20)}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs leading-relaxed"
        style={{ color: "rgba(226,232,240,0.55)" }}
      >
        {insight}
      </motion.p>
    </div>
  );
}

/* ── Session timer ───────────────────────────────────────── */
function SessionTimer({
  active, time, protocol,
}: {
  active:   boolean;
  time:     number;
  protocol: any;
}) {
  const pct = protocol
    ? Math.min(100, (time / (protocol.duration * 60)) * 100)
    : 0;

  const formatTime = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="rounded-2xl p-4"
         style={{
           background:     "rgba(0,5,8,0.85)",
           backdropFilter: "blur(20px)",
           border:         `1px solid ${active ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
         }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: active ? "#22c55e" : "rgba(226,232,240,0.3)" }} />
          <span className="text-xs font-bold"
                style={{ color: active ? "white" : "rgba(226,232,240,0.4)" }}>
            Session
          </span>
        </div>
        <motion.div
          className="font-mono font-bold text-xl"
          style={{ color: active ? "#22c55e" : "rgba(226,232,240,0.25)" }}
        >
          {formatTime(time)}
        </motion.div>
      </div>

      {protocol && (
        <>
          <div className="text-[9px] font-mono mb-1"
               style={{ color: "rgba(226,232,240,0.3)" }}>
            {protocol.name} · {protocol.duration} min
          </div>
          <div className="h-1.5 rounded-full overflow-hidden"
               style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: protocol.color }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sound Deck (Music/Sound Player) ─────────────────────── */
function SoundDeck({
  playing, stopAll, play, freqData,
}: {
  playing:     Set<number>;
  stopAll:     () => void;
  play:        (hz: number) => void;
  freqData:    any[];
}) {
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse">
            <Volume2 size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest leading-none">Acoustic Mastery</h3>
            <p className="text-[10px] text-white/30 font-mono mt-1">Multi-Channel Frequency Deck</p>
          </div>
        </div>
        <button
          onClick={stopAll}
          className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold uppercase border border-red-500/20 hover:bg-red-500/20 transition-all"
        >
          Silence All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from(playing).map(hz => {
          const data = freqData.find(f => f.hz === hz);
          return (
            <motion.div
              key={hz}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-cyan-400">{hz}Hz</span>
                <button
                  onClick={() => play(hz)}
                  className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/40 text-white/40 hover:text-white transition-all"
                >
                  <Square size={8} fill="currentColor" />
                </button>
              </div>
              <div className="text-[9px] font-bold text-white/60 truncate">{data?.name || "Active Core"}</div>
              <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: Math.random() }}
                  style={{ width: "100%" }}
                />
              </div>
            </motion.div>
          );
        })}
        {playing.size === 0 && (
          <div className="col-span-4 py-12 text-center">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Audio Engine Standby · Selective Frequency Matrix Offline
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HealingPage() {
  const [view, setView] = useState<"split"|"brain"|"body">("split");
  const [sessionActive,  setSessionActive]  = useState(false);
  const [sessionTime,    setSessionTime]    = useState(0);
  const [oxygenLevel,    setOxygenLevel]    = useState(21);
  const [activeProtocol, setActiveProtocol] = useState<number | null>(null);
  const [selectedOrgan,  setSelectedOrgan]  = useState<any>(null);
  const [selectedBrain,  setSelectedBrain]  = useState<any>(null);
  const [brainState,     setBrainState]     = useState("Balanced");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [freqSearch,     setFreqSearch]     = useState("");
  const { user, loading, isAdmin } = useFirebase();

  const audio = useAudioEngine();

  useEffect(() => {
    if (!sessionActive) return;
    const iv = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive) { setOxygenLevel(21); return; }
    const target = activeProtocol !== null
      ? PROTOCOLS[activeProtocol].o2 : 80;
    const iv = setInterval(() => {
      setOxygenLevel(prev => {
        if (prev >= target) { clearInterval(iv); return target; }
        return Math.min(prev + 1, target);
      });
    }, 300);
    return () => clearInterval(iv);
  }, [sessionActive, activeProtocol]);

  const startSession = useCallback(() => {
    setSessionActive(true);
    setSessionTime(0);
    audio.init();
  }, [audio]);

  const stopSession = useCallback(() => {
    setSessionActive(false);
    audio.stopAll();
    setOxygenLevel(21);
    setActiveProtocol(null);
  }, [audio]);

  const playProtocol = useCallback((index: number) => {
    if (activeProtocol === index) {
      audio.stopAll();
      setActiveProtocol(null);
      return;
    }
    const proto = PROTOCOLS[index];
    audio.playStack(proto.freqs);
    setActiveProtocol(index);
  }, [activeProtocol, audio]);

  const filteredFreqs = useMemo(() => {
    let list = ALL_FREQUENCIES;
    if (activeCategory !== "all") {
      list = list.filter(f => f.category === activeCategory);
    }
    if (freqSearch) {
      list = list.filter(f =>
        f.name.toLowerCase().includes(freqSearch.toLowerCase()) ||
        f.hz.toString().includes(freqSearch)
      );
    }
    return list;
  }, [activeCategory, freqSearch]);

  const currentProtocol = activeProtocol !== null
    ? PROTOCOLS[activeProtocol] : null;

  return (
    <div className="flex flex-col gap-6 p-6 pb-32">
      <header className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Chamber Interface</h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Live Resonance Field · Multi-Dimensional</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
            {[
              { id: "brain" as const, label: "Brain",  icon: <Brain size={14} /> },
              { id: "split" as const, label: "Unified", icon: <LayoutDashboard size={14} /> },
              { id: "body"  as const, label: "Body",  icon: <UserIcon size={14} /> },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  view === v.id ? "bg-white/10 text-cyan-400 shadow-inner" : "text-white/40 hover:text-white"
                }`}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={sessionActive ? stopSession : startSession}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              sessionActive ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-cyan-500 text-black hover:bg-cyan-400"
            }`}
          >
            {sessionActive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {sessionActive ? "End Session" : "Start Session"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)] overflow-hidden">
        <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 min-h-0 relative">
            <AnimatePresence mode="wait">
              {view === "brain" && (
                <motion.div key="brain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <RealisticBrain3D activeFrequencies={Array.from(audio.playing)} onRegionSelect={setSelectedBrain} />
                </motion.div>
              )}
              {view === "body" && (
                <motion.div key="body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <RealisticBody3D activeFrequencies={Array.from(audio.playing)} onOrganSelect={setSelectedOrgan} sessionActive={sessionActive} />
                </motion.div>
              )}
              {view === "split" && (
                <motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full grid grid-cols-2 gap-4">
                  <RealisticBrain3D activeFrequencies={Array.from(audio.playing)} onRegionSelect={setSelectedBrain} />
                  <RealisticBody3D activeFrequencies={Array.from(audio.playing)} onOrganSelect={setSelectedOrgan} sessionActive={sessionActive} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-24">
            <WaveformViz playing={audio.playing} getSpectrum={audio.getSpectrum} getWaveform={audio.getWaveform} />
          </div>
          <SoundDeck playing={audio.playing} stopAll={audio.stopAll} play={audio.play} freqData={ALL_FREQUENCIES} />
        </div>

        <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-32">
          <SessionTimer active={sessionActive} time={sessionTime} protocol={currentProtocol} />
          <O2Chamber level={oxygenLevel} active={sessionActive} />
          <GhostAI selectedOrgan={selectedOrgan} selectedBrain={selectedBrain} activeFreqs={Array.from(audio.playing)} brainState={brainState} o2Level={oxygenLevel} />
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Zap size={16} className="text-emerald-500" />
              Healing Protocols
            </h2>
            <div className="space-y-2">
              {PROTOCOLS.map((proto, i) => (
                <button
                  key={proto.name}
                  onClick={() => playProtocol(i)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    activeProtocol === i ? "bg-white/10 border-emerald-500/50" : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm" style={{ color: proto.color }}>{proto.name}</span>
                    <span className="text-[10px] font-mono opacity-40">{proto.duration}m</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">{proto.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">Frequencies</h2>
              <input 
                type="text" placeholder="Search..." value={freqSearch} onChange={(e) => setFreqSearch(e.target.value)}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-[10px] outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {filteredFreqs.map(f => (
                <button
                  key={f.hz}
                  onClick={() => audio.play(f.hz)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    audio.playing.has(f.hz) ? "bg-cyan-500 border-cyan-400 text-white" : "bg-white/5 border-transparent hover:bg-white/10 text-white/40"
                  }`}
                >
                  <div className="text-[10px] font-bold">{f.hz}Hz</div>
                  <div className="text-[8px] opacity-60 truncate">{f.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
