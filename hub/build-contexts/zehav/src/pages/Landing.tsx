import { motion } from 'motion/react';
import { Page } from '../types';
import { Shield, Zap, Brain, ArrowRight } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: Page) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/5 text-gold text-[10px] sm:text-[12px] uppercase font-black tracking-[4px] mb-8 shadow-[0_0_30px_rgba(255,215,0,0.15)] pulse"
        >
          <Shield size={14} /> Quantum Secured Digital Empire
        </motion.div>

        <motion.h1 
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-[-4px] leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-gradient-gold block">ZEHAV</span>
          <span className="block text-[0.4em] uppercase tracking-[12px] md:tracking-[24px] text-green-neon font-display mt-2">
            The Golden Vault
          </span>
        </motion.h1>

        <motion.p 
          className="max-w-xl text-slate-400 text-lg md:text-xl leading-relaxed mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Drop your apps. Lock your files. Sell everything. Quantum encrypted. 
          Nobody touches what's yours.
        </motion.p>

        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={() => onNavigate(Page.PDFStore)}
            className="px-8 py-4 rounded-xl bg-linear-to-br from-gold-light to-gold text-black font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:scale-105 transition-all"
          >
            Enter The Vault <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => onNavigate(Page.VaultDrop)}
            className="px-8 py-4 rounded-xl border-2 border-green-neon text-green-neon font-black uppercase tracking-widest hover:bg-green-neon/10 transition-all"
          >
            Upload Apps
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-y border-white/5 py-12 w-full max-w-5xl">
          {[
            { label: 'Unlimited Storage', value: '∞' },
            { label: 'Quantum Bits', value: '256Q' },
            { label: 'Breaches Ever', value: '0' },
            { label: 'To Start', value: '$0' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <span className="text-4xl md:text-5xl font-black text-gradient-gold">{stat.value}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-2">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 px-6 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'App Marketplace',
            desc: 'Upload unlimited apps and PDFs. Customers pay to unlock and use them live.',
            icon: <LayoutGrid className="text-gold" />,
            color: 'gold',
            page: Page.PDFStore
          },
          {
            title: 'CodePulse AI',
            desc: 'Drop broken code in. Watch AI fix every error live in real time.',
            icon: <Zap className="text-green-neon" />,
            color: 'green',
            page: Page.CodePulse
          },
          {
            title: 'Quantum Brain',
            desc: 'The encrypted core powering everything. Unbreakable. Infinite. Forever yours.',
            icon: <Brain className="text-purple-neon" />,
            color: 'purple',
            page: Page.Quantum
          },
          {
            title: 'White Label',
            desc: 'Rent ZEHAV to businesses under their own brand. They pay monthly.',
            icon: <Shield className="text-cyan-neon" />,
            color: 'cyan',
            page: Page.Pricing
          }
        ].map((feat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            onClick={() => onNavigate(feat.page)}
            className="group p-8 rounded-2xl bg-card-dark border border-white/5 hover:border-gold/40 transition-all cursor-pointer overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[100px] group-hover:bg-gold/20 transition-all" />
            <div className="mb-6 text-4xl">{feat.icon}</div>
            <h3 className="text-xl font-black mb-4 tracking-tight">{feat.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

function LayoutGrid(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
