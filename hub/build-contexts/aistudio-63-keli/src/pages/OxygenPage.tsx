"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Wind, ChevronLeft, Activity, Shield, Zap, Info, Clock, AlertTriangle, Play } from "lucide-react";

export default function OxygenPage() {
  const [pressure, setPressure] = useState(1.0);
  const [oxygen, setOxygen] = useState(21);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) {
      setPressure(1.0);
      setOxygen(21);
      return;
    }
    const iv = setInterval(() => {
      setPressure(p => Math.min(p + 0.01, 2.5));
      setOxygen(o => Math.min(o + 1, 98));
    }, 100);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div className="p-6 pb-32 max-w-7xl">
      <header className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-tight">Atmospheric Control</h1>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">O₂ Saturation · Pressure Gradient · Hyperbaric Simulation</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Chamber Control */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="aspect-video relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-black/40 flex items-center justify-center">
            {/* Visual representation of O2 atoms */}
            <div className="absolute inset-0 overflow-hidden">
               {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-cyan-400/40"
                  animate={active ? {
                    x: [Math.random() * 800, Math.random() * 800],
                    y: [Math.random() * 500, Math.random() * 500],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  } : {}}
                  transition={{ duration: 5 + Math.random() * 10, repeat: Infinity }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                animate={active ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-48 h-48 rounded-full border-4 border-cyan-500/20 flex flex-col items-center justify-center p-8 bg-cyan-500/5 backdrop-blur-3xl"
              >
                <div className="text-6xl font-black text-cyan-400">{oxygen}%</div>
                <div className="text-xs font-mono text-cyan-500/50 mt-2 tracking-widest uppercase">SATURATION</div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-white/30 uppercase mb-2">Pressure</div>
              <div className="text-2xl font-bold">{pressure.toFixed(2)} <span className="text-sm font-normal text-white/30">ATA</span></div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-white/30 uppercase mb-2">Temperature</div>
              <div className="text-2xl font-bold">22.4 <span className="text-sm font-normal text-white/30">°C</span></div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-white/30 uppercase mb-2">Humidity</div>
              <div className="text-2xl font-bold">45 <span className="text-sm font-normal text-white/30">%</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-cyan-500 text-black">
            <h2 className="text-2xl font-black mb-4 uppercase leading-none">Chamber Control</h2>
            <p className="text-sm mb-8 opacity-80">Manual overwrite for atmospheric optimization. Warning: High O₂ increases cellular conductivity.</p>
            
            <button
               onClick={() => setActive(!active)}
               className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
            >
              {active ? <Zap size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {active ? "VENT CHAMBER" : "INITIATE O2"}
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
              <Activity size={16} className="text-cyan-400" />
              Physiological Impact
            </h3>
            <div className="space-y-4">
              {[
                { label: "Conductivity", val: "+45%", status: "High" },
                { label: "Metabolism", val: "+12%", status: "Active" },
                { label: "Neural Flow", val: "Optimal", status: "Active" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <span className="text-xs text-white/40">{stat.label}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">{stat.val}</div>
                    <div className="text-[8px] font-mono text-cyan-400 uppercase">{stat.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-xs text-red-500/60 leading-relaxed">
            <div className="flex items-center gap-2 mb-2 font-bold uppercase text-red-500 tracking-widest">
              <AlertTriangle size={14} /> Safety Warning
            </div>
            Maintain pressure below 3.0 ATA for long sessions. Extended oxygen exposure requires monitoring by a qualified clinician.
          </div>
        </div>
      </div>
    </div>
  );
}
