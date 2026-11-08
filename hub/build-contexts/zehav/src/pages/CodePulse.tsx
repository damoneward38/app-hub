import { motion } from 'motion/react';
import { Zap, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function CodePulse() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isFixing, setIsFixing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['▸ CodePulse ready. Paste broken code and hit RUN.']);

  const handleFix = async () => {
    if (!inputCode.trim()) return;
    setIsFixing(true);
    setOutputCode('');
    setLogs(['▸ Sending code to local Ollama (llama3.2)...']);

    const messages = [
      { role: 'system', content: 'You are a code repair engine. Return only the corrected code, no commentary and no markdown fences.' },
      { role: 'user', content: inputCode }
    ];

    let repaired = '';
    try {
      const bridge = (window as any).OllamaAI;
      if (bridge && typeof bridge.chat === 'function') {
        repaired = await bridge.chat(messages, { model: 'llama3.2', temperature: 0.1 });
      } else {
        const res = await fetch('http://localhost:8780/api/ai/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages, stream: false, model: 'llama3.2', options: { temperature: 0.1 } })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
        repaired = (data.message && data.message.content) || '';
      }
    } catch (error: any) {
      setLogs(['✗ Local Ollama unavailable: ' + (error.message || error)]);
      setIsFixing(false);
      return;
    }

    if (!repaired) {
      setLogs(['✗ Ollama returned an empty repair.']);
      setIsFixing(false);
      return;
    }

    setLogs(['▸ Repair generated. Streaming result...']);
    let i = 0;
    const interval = setInterval(() => {
      setOutputCode((prev) => prev + repaired[i]);
      i++;
      if (i >= repaired.length) {
        clearInterval(interval);
        setIsFixing(false);
        setLogs(['✓ Successfully repaired with llama3.2.']);
      }
    }, 5);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">Code<span className="text-green-neon">Pulse</span> ⚡</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Drop broken code. Watch AI repair it live. Character by character. Right before your eyes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Panel: Input */}
        <div className="bg-card-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-neon/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-neon/40" />
              </div>
              <span className="text-[10px] font-bold text-red-neon uppercase tracking-widest ml-3 flex items-center gap-2">
                <AlertTriangle size={12} /> Broken Code — Input
              </span>
            </div>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full h-[400px] bg-black/40 p-6 font-mono text-sm text-slate-300 resize-none outline-none placeholder:text-slate-700"
            placeholder="// Paste your broken code here...
function getData(url) {
  fetch(url
    .then(res => res.json()
    .then(data => {
      consol.log(data)
      return dat
    })
  })
}"
          />
        </div>

        {/* Right Panel: Output */}
        <div className="bg-card-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-neon/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-neon/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-neon/40" />
              </div>
              <span className="text-[10px] font-bold text-green-neon uppercase tracking-widest ml-3 flex items-center gap-2">
                <CheckCircle size={12} /> Fixed Code — Output
              </span>
            </div>
          </div>
          <textarea
            readOnly
            value={outputCode}
            className="w-full h-[400px] bg-black/40 p-6 font-mono text-sm text-green-neon resize-none outline-none"
            placeholder="// Fixed code will appear here live..."
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-10">
        <div className="relative">
          <div className={`w-24 h-24 rounded-full border-4 border-green-neon flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,106,0.3)] ${isFixing ? 'animate-pulse scale-110' : ''}`}>
            <Zap className="text-green-neon fill-green-neon" />
          </div>
          {isFixing && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-green-neon/30 rounded-full"
            />
          )}
        </div>

        <button 
          onClick={handleFix}
          disabled={isFixing}
          className="px-12 py-5 rounded-2xl bg-linear-to-br from-green-neon to-emerald-600 text-black font-black uppercase tracking-[4px] shadow-[0_0_50px_rgba(0,255,106,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          ⚡ Run CodePulse Fix
        </button>

        {/* Live Repair Log */}
        <div className="w-full max-w-4xl bg-card-dark border border-white/5 rounded-2xl p-6 font-mono relative overflow-hidden">
          {isFixing && (
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-linear-to-r from-transparent via-green-neon/5 to-transparent z-0"
            />
          )}
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-4 relative z-10 flex items-center gap-2">
            <Terminal size={14} /> LIVE REPAIR LOG
          </h4>
          <div className="space-y-1 relative z-10">
            {logs.map((log, i) => (
              <p key={i} className={`text-xs ${log.startsWith('✓') ? 'text-green-neon' : log.startsWith('▸') ? 'text-slate-400' : 'text-red-neon'}`}>
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
