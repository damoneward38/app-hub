import { motion } from 'motion/react';
import { useState } from 'react';
import { Shield, Globe, Type, Palette, Zap } from 'lucide-react';

interface WhiteLabelProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function WhiteLabel({ triggerToast }: WhiteLabelProps) {
  const [brandName, setBrandName] = useState('YOURBRAND');
  const [tagline, setTagline] = useState('Your tagline here');
  const [domain, setDomain] = useState('vault.yourbrand.com');
  const [primaryColor, setPrimaryColor] = useState('gold');

  const colors = [
    { name: 'gold', class: 'bg-gold' },
    { name: 'cyan', class: 'bg-cyan-neon' },
    { name: 'purple', class: 'bg-purple-neon' },
    { name: 'green', class: 'bg-green-neon' },
    { name: 'red', class: 'bg-red-neon' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">👑 White <span className="text-purple-neon">Label</span> ZEHAV</h2>
        <p className="text-slate-400 max-w-lg mx-auto italic">
          Your brand. Your domain. ZEHAV power underneath. Code stays hidden. You own it all.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-24">
        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="text-[10px] uppercase font-black tracking-[4px] text-slate-500 ml-4 mb-2 flex items-center gap-2">
            <Zap size={12} className="text-purple-neon" /> Live Branding Preview
          </div>
          <motion.div 
            className="bg-card-dark border-2 border-purple-neon/30 rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(157,0,255,0.1)]"
          >
            {/* Mock Browser Bar */}
            <div className="bg-purple-neon/5 border-b border-purple-neon/20 px-6 py-4 flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-neon/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-neon/40" />
              </div>
              <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-1.5 text-[10px] text-purple-neon font-mono">
                {domain}
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-12 text-center aspect-video flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(157,0,255,0.05)_0%,transparent_70%)]">
              <h3 className={`text-5xl font-black tracking-[8px] mb-2 uppercase ${
                primaryColor === 'gold' ? 'text-gold' : 
                primaryColor === 'cyan' ? 'text-cyan-neon' :
                primaryColor === 'purple' ? 'text-purple-neon' :
                primaryColor === 'green' ? 'text-green-neon' : 'text-red-neon'
              }`}>
                {brandName}
              </h3>
              <p className="text-slate-500 font-bold tracking-[2px] uppercase text-xs mb-10">{tagline}</p>
              <div className="flex gap-3">
                <button className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest ${
                  primaryColor === 'gold' ? 'bg-gold text-black' : 
                  primaryColor === 'cyan' ? 'bg-cyan-neon text-black' :
                  primaryColor === 'purple' ? 'bg-purple-neon text-white' :
                  primaryColor === 'green' ? 'bg-green-neon text-black' : 'bg-red-neon text-white'
                }`}>
                  Enter Vault
                </button>
                <button className="px-6 py-3 rounded-xl border border-white/10 text-white font-black uppercase text-[10px] tracking-widest">
                  About Us
                </button>
              </div>
              <div className="mt-8 text-[8px] text-slate-800 uppercase font-black tracking-[4px]">
                Powered by ZEHAV Quantum Core
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          <div className="bg-card-dark border border-white/5 rounded-3xl p-8 space-y-8">
            {/* Brand Identity */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[3px] text-slate-500 flex items-center gap-2">
                <Type size={14} className="text-purple-neon" /> Brand Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Brand Name</label>
                  <input 
                    type="text" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value.toUpperCase())}
                    className="w-full bg-white/2 border border-white/10 p-3.5 rounded-xl outline-none focus:border-purple-neon transition-all text-sm font-black tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Domain</label>
                  <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-white/2 border border-white/10 p-3.5 rounded-xl outline-none focus:border-purple-neon transition-all text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Tagline</label>
                <input 
                  type="text" 
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white/2 border border-white/10 p-3.5 rounded-xl outline-none focus:border-purple-neon transition-all text-sm"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[3px] text-slate-500 flex items-center gap-2">
                <Palette size={14} className="text-purple-neon" /> Theme Colors
              </h4>
              <div className="flex gap-4">
                {colors.map((c) => (
                  <button 
                    key={c.name}
                    onClick={() => setPrimaryColor(c.name)}
                    className={`w-10 h-10 rounded-xl transition-all ${c.class} ${
                      primaryColor === c.name ? 'ring-4 ring-white/10 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'opacity-40 hover:opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={() => triggerToast('👑 White Label settings locked in!', 'success')}
              className="w-full py-5 rounded-2xl bg-linear-to-br from-purple-neon to-cyan-neon text-white font-black uppercase tracking-[4px] shadow-[0_0_40px_rgba(157,0,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              DEPLOY BRANDED VAULT
            </button>
          </div>

          <div className="bg-purple-neon/5 border border-purple-neon/20 rounded-3xl p-8 text-center">
            <h4 className="text-lg font-black text-white mb-2">Need More Power?</h4>
            <p className="text-slate-500 text-sm mb-6">Upgrade to Pipeline License to rent the entire architecture to businesses under their brand.</p>
            <button className="px-8 py-3 rounded-xl border border-purple-neon/40 text-purple-neon font-black uppercase text-[10px] tracking-widest hover:bg-purple-neon/10 transition-all">
              Request Pipeline Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
