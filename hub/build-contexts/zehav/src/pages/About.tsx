import { motion } from 'motion/react';
import { Shield, Brain, Laptop, Coins } from 'lucide-react';

interface AboutProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function About({ triggerToast }: AboutProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-20">
        <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">About <span className="text-gold">ZEHAV</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto italic font-medium">Built for creators. Secured by quantum. Owned by you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-gradient-gold leading-tight">The Golden Vault Was Built For Builders</h2>
          <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
            <p>
              ZEHAV — Hebrew for Gold — is the platform where your digital work lives forever, protected by 
              quantum encryption that physics itself enforces. Nobody can touch what's yours.
            </p>
            <p>
              Drop your apps, tools, PDFs, and creations. Set your prices individually. Watch customers 
              unlock them and use them live inside the vault. You never have to touch them again.
            </p>
            <p>
              White label it to businesses. Rent them the whole empire under their brand. Collect monthly 
              while they build on your foundation. Your code stays hidden. Your ownership stays absolute.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-10 py-4 rounded-xl bg-gold text-black font-black uppercase tracking-widest hover:scale-105 shadow-[0_0_40px_rgba(255,215,0,0.2)] transition-all">
              Get Started →
            </button>
            <button className="px-10 py-4 rounded-xl border border-gold/30 text-gold font-black uppercase tracking-widest hover:bg-gold/5 transition-all">
              Explore Vault
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-12">
          {[
            { icon: <Shield size={32} className="text-gold" />, label: 'Quantum Secured' },
            { icon: <Brain size={32} className="text-purple-neon" />, label: 'Infinite Storage' },
            { icon: <Coins size={32} className="text-green-neon" />, label: 'Passive Income' },
            { icon: <Laptop size={32} className="text-cyan-neon" />, label: 'You Own Everything' },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="p-8 rounded-3xl bg-card-dark border border-white/5 flex flex-col items-center justify-center text-center gap-4 hover:border-gold/30 transition-all"
            >
              {item.icon}
              <span className="text-[10px] uppercase font-black tracking-[2px] text-slate-300">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-xl mx-auto p-12 rounded-[40px] bg-card-dark border border-gold/20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/5 blur-[80px]" />
        <h3 className="text-3xl font-black text-center mb-10 text-gradient-gold">Contact ZEHAV</h3>
        <form className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); triggerToast('✉️ Message sent to ZEHAV team!', 'success'); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Name</label>
            <input required type="text" className="w-full bg-white/2 border border-white/10 p-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all shadow-inner" placeholder="Elias Gold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <input required type="email" className="w-full bg-white/2 border border-white/10 p-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all shadow-inner" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Request Message</label>
            <textarea required rows={4} className="w-full bg-white/2 border border-white/10 p-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all resize-none shadow-inner" placeholder="Tell us what you need in the vault..." />
          </div>
          <button className="w-full py-5 rounded-2xl bg-linear-to-br from-gold-light to-gold-dark text-black font-black uppercase tracking-[4px] shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:shadow-[0_0_60px_rgba(255,215,0,0.4)] transition-all">
            Send Message →
          </button>
        </form>
      </div>
    </div>
  );
}
