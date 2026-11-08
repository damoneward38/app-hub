import { motion, AnimatePresence } from 'motion/react';
import { Shield, Github, Ghost, Mail, Lock } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface AuthProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Auth({ triggerToast }: AuthProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLogged, setIsLogged] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLogged(true);
    triggerToast(`Welcome back, Vault Member!`, 'success');
  };

  if (isLogged) {
    return (
      <div className="max-w-md mx-auto p-8 bg-card-dark border border-gold/30 rounded-3xl mt-20 shadow-[0_0_80px_rgba(255,215,0,0.05)]">
        <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-gold to-green-neon text-black flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(255,215,0,0.4)]">
            Z
          </div>
          <div>
            <h3 className="text-2xl font-black">Vault Member</h3>
            <p className="text-gold text-xs font-bold uppercase tracking-[3px] mt-1 flex items-center gap-2">
              <Shield size={12} /> Quantum Secured
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Current Plan', val: 'Pro' },
            { label: 'Storage', val: '∞' },
            { label: 'Unlocks Used', val: '247' },
            { label: 'Secured', val: '100%' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xl font-black text-gradient-gold">{stat.val}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-none mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsLogged(false)}
          className="w-full py-4 rounded-xl bg-red-neon/10 border border-red-neon/30 text-red-neon font-black uppercase tracking-widest text-[11px] hover:bg-red-neon transition-all hover:text-white"
        >
          🔓 Exit The Vault
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto relative mt-12 sm:mt-24 px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card-dark border border-gold/20 rounded-[40px] p-8 sm:p-12 shadow-[0_0_100px_rgba(255,215,0,0.05)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[80px]" />
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gradient-gold mb-2 tracking-tight">ZEHAV</h2>
          <p className="text-[10px] uppercase font-bold tracking-[4px] text-slate-500">Quantum Secured Access</p>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 gap-1.5">
          <button 
            onClick={() => setTab('login')}
            className={`flex-1 py-3 rounded-xl text-[11px] uppercase font-black tracking-widest transition-all ${
              tab === 'login' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Login
          </button>
          <button 
            onClick={() => setTab('register')}
            className={`flex-1 py-3 rounded-xl text-[11px] uppercase font-black tracking-widest transition-all ${
              tab === 'register' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {tab === 'register' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">First Name</label>
                  <input required type="text" className="w-full bg-white/2 border border-white/10 p-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Last Name</label>
                  <input required type="text" className="w-full bg-white/2 border border-white/10 p-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all" placeholder="Doe" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input required type="email" className="w-full bg-white/2 border border-white/10 pl-12 pr-4 py-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all" placeholder="vault@zehav.com" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Secret Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input required type="password" minLength={8} className="w-full bg-white/2 border border-white/10 pl-12 pr-4 py-4 rounded-xl outline-none focus:border-gold focus:bg-gold/5 transition-all" placeholder="••••••••" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 rounded-2xl bg-linear-to-br from-gold-light to-gold-dark text-black font-black uppercase tracking-[4px] shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:scale-105 active:scale-95 transition-all mt-4"
          >
            {tab === 'login' ? '🔐 Enter The Vault' : '🚀 Create Vault Account'}
          </button>
        </form>

        <div className="my-10 flex items-center gap-4 text-slate-700">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] uppercase font-black tracking-widest">or continue with</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Google', icon: <Ghost size={18} /> },
            { name: 'GitHub', icon: <Github size={18} /> },
            { name: 'Apple', icon: <Shield size={18} /> }
          ].map((soc) => (
            <button key={soc.name} className="py-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all flex items-center justify-center gap-2 hover:border-gold/30">
              {soc.icon}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
