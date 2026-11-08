/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Bluetooth, ShieldAlert, Cpu, Share2, Zap, Server, ChevronRight } from 'lucide-react';

// --- Types ---
interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

interface Stat {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

// --- Components ---

const SignalVisualizer = ({ isAnomalyDetected }: { isAnomalyDetected: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number; anomaly: boolean }[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Generate next point
      const now = Date.now() / 1000;
      const baseValue = canvas.height / 2;
      const noise = (Math.sin(now * 5) * 30) + (Math.sin(now * 12) * 10);
      const anomalyPeak = isAnomalyDetected ? (Math.sin(now * 20) * 80) : 0;
      
      const nextY = baseValue + noise + anomalyPeak;
      points.current.push({ x: canvas.width, y: nextY, anomaly: isAnomalyDetected });

      if (points.current.length > 200) {
        points.current.shift();
      }

      // Update points x-position
      points.current = points.current.map(p => ({ ...p, x: p.x - 2 }));

      // Draw path
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < points.current.length; i++) {
        const p = points.current[i];
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      // Stroke style based on activity
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0)');
      gradient.addColorStop(0.5, isAnomalyDetected ? '#f59e0b' : '#7c3aed');
      gradient.addColorStop(1, isAnomalyDetected ? '#f59e0b' : '#7c3aed');
      
      ctx.strokeStyle = gradient;
      ctx.stroke();

      // Highlight anomalies
      points.current.forEach((p, i) => {
        if (p.anomaly && i % 5 === 0) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#f59e0b';
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isAnomalyDetected]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={300} 
        className="w-full h-auto opacity-80"
      />
      
      <AnimatePresence>
        {isAnomalyDetected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-2/3 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          >
            <div className="w-20 h-64 border-l-2 border-r-2 border-accent-a bg-linear-to-t from-accent-a/20 to-transparent shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-start justify-center pt-4">
              <span className="font-mono text-[10px] text-accent-a bg-black/80 px-2 py-0.5 border border-accent-a">ANOMALY</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '14:22:01', message: 'GATT Connection established', type: 'success' },
    { id: '2', timestamp: '14:22:05', message: 'Handshake sequence [OK]', type: 'info' },
    { id: '3', timestamp: '14:22:08', message: 'Inference buffer populated', type: 'info' },
  ]);
  const [isAnomalyDetected, setIsAnomalyDetected] = useState(false);
  const [stats, setStats] = useState({
    signals: 2441,
    anomalies: 14,
    precision: 99.8,
    serverLoad: 0
  });

  const addLog = (message: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-GB', { hour12: false }).split(' ')[0];
    setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp, message, type }, ...prev].slice(0, 15));
  };

  // Simulate periodic activity
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, signals: prev.signals + Math.floor(Math.random() * 5) }));
      
      // Randomly trigger anomaly
      if (Math.random() > 0.95 && !isAnomalyDetected) {
        setIsAnomalyDetected(true);
        setStats(prev => ({ ...prev, anomalies: prev.anomalies + 1 }));
        addLog('RECON_ERR > 0.85 Threshold', 'warning');
        addLog('FLAG: SIGNAL_ANOMALY_DETECTED', 'warning');
        
        setTimeout(() => {
          setIsAnomalyDetected(false);
          addLog('Resuming AI monitor', 'info');
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnomalyDetected]);

  return (
    <div className="relative w-full h-screen bg-bg text-[#e8e0ff] select-none">
      <div className="atmosphere" />
      <div className="grid-overlay" />

      {/* Main Container */}
      <div className="relative z-10 grid grid-cols-[280px_1fr_280px] grid-rows-[80px_1fr_100px] h-full p-6 gap-5">
        
        {/* Header */}
        <header className="col-span-3 flex justify-between items-center border-b border-glass-border pb-4">
          <div className="flex flex-col">
            <div className="text-2xl font-black tracking-[0.2em] text-white flex items-center gap-2">
              <span className="text-accent-p">ANO</span>SERA
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="text-xl font-serif text-accent-a tracking-wider" dir="rtl">
              אָנוֹסֵרָה
            </div>
            <div className="font-mono text-xs text-accent-c flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
              </span>
              SYSTEM STATUS: <span className="text-[#00ff88] font-bold">WATCHING</span>
            </div>
          </div>
        </header>

        {/* Left Sidebar: Specs */}
        <aside className="flex flex-col gap-4 overflow-y-auto pr-2">
          <section className="panel space-y-4">
            <h3 className="panel-title flex items-center gap-2">
              <Cpu size={14} /> AI Engine Specs
            </h3>
            <div className="space-y-3">
              <div className="group">
                <span className="spec-label">Model Architecture</span>
                <span className="spec-value group-hover:text-accent-p transition-colors">LSTM-Autoencoder</span>
              </div>
              <div className="group">
                <span className="spec-label">Framework</span>
                <span className="spec-value group-hover:text-accent-c transition-colors">TensorFlow.js 4.2</span>
              </div>
              <div className="group">
                <span className="spec-label">Inference Time</span>
                <span className="spec-value group-hover:text-accent-a transition-colors">0.012ms avg</span>
              </div>
            </div>
          </section>

          <section className="panel space-y-4">
            <h3 className="panel-title flex items-center gap-2">
              <Bluetooth size={14} /> BLE Interface
            </h3>
            <div className="space-y-3">
              <div className="group">
                <span className="spec-label">Protocol</span>
                <span className="spec-value group-hover:text-accent-p transition-colors">Bluetooth 5.3 L.E.</span>
              </div>
              <div className="group">
                <span className="spec-label">Sampling Rate</span>
                <span className="spec-value group-hover:text-accent-c transition-colors">1000 Hz / sec</span>
              </div>
              <div className="group">
                <span className="spec-label">Channel</span>
                <span className="spec-value group-hover:text-accent-a transition-colors">GATT-SEC-9</span>
              </div>
            </div>
          </section>

          <section className="panel flex-1 flex flex-col justify-center items-center text-center p-6 border-dashed border-accent-p/30 group cursor-pointer hover:bg-accent-p/5">
             <Share2 className="text-accent-p mb-2 group-hover:scale-110 transition-transform" size={24} />
             <span className="font-mono text-[10px] text-accent-p uppercase tracking-widest">Share Signal Data</span>
          </section>
        </aside>

        {/* Center: Hero Viz */}
        <main className="relative flex flex-col justify-center items-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-96 h-96 rounded-full bg-linear-to-br from-accent-p/20 to-accent-c/20 blur-[60px]"
            />
          </div>
          
          <SignalVisualizer isAnomalyDetected={isAnomalyDetected} />

          <div className="mt-8 text-center max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-light tracking-tight text-white mb-4"
            >
              Reveal the <span className="font-bold text-accent-p">Hidden</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-sm leading-relaxed"
            >
              The first browser-based AI engine that detects sub-perceptual anomalies 
              in hardware sensor signals before they manifest as failure.
              Running entirely on the edge via WebBluetooth.
            </motion.p>
          </div>
        </main>

        {/* Right Sidebar: Activity Feed */}
        <aside className="flex flex-col gap-4">
          <section className="panel flex-1 flex flex-col overflow-hidden">
            <h3 className="panel-title flex items-center gap-2 shrink-0">
              <Activity size={14} /> Live Signal Log
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="feed-item"
                  >
                    <span className="feed-ts">[{log.timestamp}]</span>
                    <span className={`feed-msg ${log.type === 'warning' ? 'feed-msg-warning' : ''}`}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <section className="panel min-h-[120px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="font-mono text-[9px] text-accent-c tracking-tighter uppercase">Inference Buffer</div>
               <div className="h-4 w-12 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['20%', '80%', '40%', '90%', '20%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-accent-c"
                  />
               </div>
            </div>
            <div className="text-2xl font-mono text-white flex items-baseline gap-1">
              98.2<span className="text-[10px] text-white/40">MSE</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full mt-2">
               <div className="h-full bg-white/20 w-1/3 rounded-full" />
            </div>
          </section>
        </aside>

        {/* Footer: Stats */}
        <footer className="col-span-3 flex justify-around items-center bg-accent-p/5 rounded-[50px] border border-glass-border px-8">
          <div className="text-center group cursor-default">
            <span className="block text-2xl font-bold text-white group-hover:text-accent-p transition-colors">
              {stats.signals.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-accent-c group-hover:opacity-80 transition-opacity">Signals Scanned</span>
          </div>

          <div className="text-center group cursor-default">
            <motion.span 
              animate={isAnomalyDetected ? { color: '#f59e0b', scale: 1.1 } : { color: '#ffffff', scale: 1 }}
              className="block text-2xl font-bold text-white"
            >
              {stats.anomalies}
            </motion.span>
            <span className="text-[10px] uppercase tracking-widest text-accent-c group-hover:opacity-80 transition-opacity">Anomalies Caught</span>
          </div>

          <button className="bg-accent-p text-white px-10 py-3.5 rounded-lg font-mono font-bold text-sm tracking-widest cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-3">
            DEPLOY SENSOR <ChevronRight size={16} />
          </button>

          <div className="text-center group cursor-default">
            <span className="block text-2xl font-bold text-white group-hover:text-accent-p transition-colors">{stats.precision}%</span>
            <span className="text-[10px] uppercase tracking-widest text-accent-c group-hover:opacity-80 transition-opacity">Precision Rate</span>
          </div>

          <div className="text-center group cursor-default">
            <span className="block text-2xl font-bold text-white group-hover:text-accent-p transition-colors">{stats.serverLoad}KB</span>
            <span className="text-[10px] uppercase tracking-widest text-accent-c group-hover:opacity-80 transition-opacity">Server Load</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
