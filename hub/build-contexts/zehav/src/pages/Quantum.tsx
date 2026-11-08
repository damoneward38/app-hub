import { motion } from 'motion/react';
import { Brain, Shield, Lock, Layers, Zap, Database } from 'lucide-react';

interface QuantumProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Quantum({ triggerToast }: QuantumProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-center">
      <div className="mb-16">
        <h2 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tight">
          Quantum <span className="text-purple-neon">Brain</span> 🧠
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          The encrypted core of ZEHAV. Infinite storage. Unbreakable security. 
          Thinks at the speed of light.
        </p>
      </div>

      {/* 3D Orb Visual */}
      <div className="relative w-full h-[500px] flex items-center justify-center mb-16 px-4">
        <div className="relative">
          {/* Pulsing Rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ 
                opacity: [0.1, 0.3, 0.1], 
                scale: [1, 1.2 + i * 0.2, 1],
                rotate: i % 2 === 0 ? 360 : -360
              }}
              transition={{ 
                duration: 4 + i * 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 m-auto border rounded-full"
              style={{ 
                width: 150 + i * 100, 
                height: 150 + i * 100,
                borderColor: i === 1 ? 'rgba(255,215,0,0.2)' : i === 2 ? 'rgba(157,0,255,0.15)' : 'rgba(0,245,255,0.1)'
              }}
            />
          ))}

          {/* Main Orb */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 rounded-full bg-linear-to-br from-gold/80 via-purple-neon/60 to-bg-dark shadow-[0_0_100px_rgba(255,215,0,0.4)] relative z-10"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
          </motion.div>

          {/* Satellites */}
          {[
            { color: 'gold', r: 130, d: 4 },
            { color: 'green-neon', r: 170, d: 7 },
            { color: 'purple-neon', r: 210, d: 11 },
            { color: 'cyan-neon', r: 130, d: 5, delay: 2 }
          ].map((sat, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: sat.d, repeat: Infinity, ease: "linear", delay: sat.delay || 0 }}
              className="absolute left-1/2 top-1/2 -mt-1.5 -ml-1.5 z-20"
              style={{ width: sat.r * 2, height: sat.r * 2, transform: 'translate(-50%, -50%)' }}
            >
              <div 
                className={`w-3 h-3 rounded-full absolute top-0 left-1/2 -translate-x-1/2`}
                style={{ backgroundColor: `var(--color-${sat.color})`, boxShadow: `0 0 15px var(--color-${sat.color})` }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20 px-4">
        {[
          { label: 'Storage Capacity', value: '∞', icon: <Database /> },
          { label: 'Quantum Bits', value: '256Q', icon: <Zap /> },
          { label: 'Latency', value: '0ms', icon: <Shield /> },
          { label: 'Encryption Layers', value: '∞', icon: <Lock /> },
          { label: 'Data Ownership', value: '100%', icon: <Brain /> },
          { label: 'Breach History', value: 'Zero', icon: <Layers /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card-dark border border-white/5 hover:border-gold/30 transition-all group"
          >
            <div className="text-2xl font-black text-gradient-gold mb-1">{stat.value}</div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <motion.div 
          className="bg-card-dark border border-purple-neon/20 p-10 rounded-3xl relative overflow-hidden"
          whileHover={{ borderColor: 'var(--color-purple-neon)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-neon/5 blur-[100px]" />
          <h3 className="text-2xl font-black mb-6 text-gradient-gold">How Quantum Brain Protects You</h3>
          <p className="text-slate-400 leading-relaxed text-lg text-left mb-8">
            Regular encryption is a steel door. Quantum encryption is a door that doesn't exist in space or time. 
            Even the most powerful computers on Earth cannot crack what the laws of physics protect. 
            Your code, files, apps, and data exist in a quantum state — observable only by you, encrypted at 
            the subatomic level, stored across infinite dimensional space.
          </p>
          <button 
            onClick={() => triggerToast('🧠 Quantum Brain layer activated!', 'success')}
            className="px-10 py-4 rounded-xl bg-linear-to-br from-gold to-gold-dark text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,215,0,0.2)]"
          >
            Activate Quantum Layer
          </button>
        </motion.div>
      </div>
    </div>
  );
}
