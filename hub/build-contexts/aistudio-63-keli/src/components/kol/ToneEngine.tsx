"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { 
  Play, Square, Volume2, VolumeX, Maximize2, 
  Zap, Radio, Activity, Sparkles 
} from "lucide-react";

/* ── Frequency Database ──────────────────────────────────── */
const FREQUENCIES = [
  { hz: 7.83,  name: "Schumann",   color: "#10b981", effect: "Earth baseline" },
  { hz: 40,    name: "Gamma Lock", color: "#f59e0b", effect: "Brain coherence" },
  { hz: 111,   name: "Pyramid",    color: "#fbbf24", effect: "King's Chamber" },
  { hz: 174,   name: "Pain Relief",color: "#6366f1", effect: "Natural anesthetic" },
  { hz: 285,   name: "Tissue",     color: "#06b6d4", effect: "Restoration" },
  { hz: 432,   name: "Natural",    color: "#fbbf24", effect: "Harmonic tuning" },
  { hz: 528,   name: "DNA Repair", color: "#fbbf24", effect: "Regeneration" },
  { hz: 963,   name: "Crown",      color: "#f0abfc", effect: "Pineal activation" },
];

export default function ToneEngine() {
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  const [playing, setPlaying] = useState<Set<number>>(new Set());
  const [volume, setVolume] = useState(0.5);
  const oscsRef = useRef<Map<number, { oscs: OscillatorNode[]; gain: GainNode }>>(new Map());
  const masterRef = useRef<GainNode | null>(null);

  const init = useCallback(() => {
    if (ctx) return ctx;
    const newCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const master = newCtx.createGain();
    master.connect(newCtx.destination);
    master.gain.value = volume;
    setCtx(newCtx);
    masterRef.current = master;
    return newCtx;
  }, [ctx, volume]);

  const toggleFreq = (hz: number) => {
    const audioCtx = init();
    if (playing.has(hz)) {
      const entry = oscsRef.current.get(hz);
      if (entry) {
        entry.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        setTimeout(() => {
          entry.oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
          entry.gain.disconnect();
        }, 350);
      }
      oscsRef.current.delete(hz);
      setPlaying(prev => {
        const next = new Set(prev);
        next.delete(hz);
        return next;
      });
    } else {
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      gain.connect(masterRef.current!);

      const merger = audioCtx.createChannelMerger(2);
      merger.connect(gain);

      const oscL = audioCtx.createOscillator();
      const oscR = audioCtx.createOscillator();
      
      oscL.type = "sine";
      oscR.type = "sine";
      
      const carrier = hz < 20 ? 200 : hz;
      oscL.frequency.value = carrier;
      oscR.frequency.value = hz < 20 ? carrier + hz : carrier + 0.5;

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      
      oscL.start();
      oscR.start();

      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.5);
      oscsRef.current.set(hz, { oscs: [oscL, oscR], gain });
      setPlaying(prev => new Set(prev).add(hz));
    }
  };

  useEffect(() => {
    if (masterRef.current && ctx) {
      masterRef.current.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
    }
  }, [volume, ctx]);

  useEffect(() => {
    return () => {
      oscsRef.current.forEach(entry => {
        entry.oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
        entry.gain.disconnect();
      });
    };
  }, []);

  return (
    <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
      
      <header className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Volume2 className="text-cyan-400" size={20} />
            Acoustic Resonance Engine
          </h3>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mt-1">
            24-Bit Float · Quantum Entrainment · Phase Aligned
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
          <VolumeX size={14} className="text-white/20" />
          <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
          />
          <Volume2 size={14} className="text-white/20" />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {FREQUENCIES.map((f) => (
          <motion.button
            key={f.hz}
            onClick={() => toggleFreq(f.hz)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-2xl border text-left transition-all ${
              playing.has(f.hz)
                ? "bg-white/10 border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                : "bg-white/5 border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-black text-2xl" style={{ color: f.color }}>
                {f.hz}
              </span>
              <div className={`w-2 h-2 rounded-full ${playing.has(f.hz) ? "animate-pulse" : "opacity-20"}`} style={{ backgroundColor: f.color }} />
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">{f.name}</div>
            <div className="text-[9px] text-white/40 uppercase font-mono">{f.effect}</div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/20">
            <Activity size={12} className="text-cyan-500" />
            Live Spectral Analysis
          </div>
          <div className="text-[9px] font-mono text-cyan-500/40">
            {playing.size > 0 ? "RESONANCE ACTIVE" : "ENGINE STANDBY"}
          </div>
        </div>
        
        <div className="h-20 flex items-end gap-1 px-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ 
                backgroundColor: i % 2 === 0 ? "#06b6d4" : "#7c3aed",
                opacity: playing.size > 0 ? 0.4 : 0.05
              }}
              animate={{ 
                height: playing.size > 0 
                  ? [2, Math.random() * 60 + 10, 2] 
                  : 2 
              }}
              transition={{ 
                duration: 0.6 + Math.random() * 0.4, 
                repeat: Infinity,
                delay: i * 0.01
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
