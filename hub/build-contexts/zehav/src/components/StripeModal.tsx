import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Shield, X, Lock } from 'lucide-react';
import { useState } from 'react';

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemName: string;
  itemPrice: number;
}

export default function StripeModal({ isOpen, onClose, onSuccess, itemName, itemPrice }: StripeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md bg-card-dark border border-gold/30 rounded-[32px] p-8 shadow-[0_0_80px_rgba(255,215,0,0.1)] relative overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="text-2xl font-black text-gradient-gold tracking-[6px] mb-1">ZEHAV PAY</div>
            <div className="text-[9px] uppercase font-bold tracking-[3px] text-slate-500">Powered by Stripe</div>
          </div>

          <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 flex items-center justify-between mb-8">
            <div className="font-bold text-slate-300">{itemName}</div>
            <div className="text-2xl font-black text-gradient-gold">${itemPrice}</div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black tracking-widest text-slate-600 ml-1">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input 
                  type="text" 
                  placeholder="4242 4242 4242 4242" 
                  className="w-full bg-black/40 border border-white/10 p-3.5 pl-12 rounded-xl outline-none focus:border-gold/50 transition-all text-sm font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-widest text-slate-600 ml-1">Expiry</label>
                <input 
                  type="text" 
                  placeholder="MM / YY" 
                  className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl outline-none focus:border-gold/50 transition-all text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-black tracking-widest text-slate-600 ml-1">CVC</label>
                <input 
                  type="text" 
                  placeholder="•••" 
                  className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl outline-none focus:border-gold/50 transition-all text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-6">
            <Shield size={12} className="text-green-neon" /> 256-bit Quantum Encrypted
          </div>

          <button 
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-[#635BFF] flex items-center justify-center gap-2 text-white font-black uppercase text-xs tracking-[3px] shadow-[0_0_30px_rgba(99,91,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Pay & Unlock Now <Lock size={14} /></>
            )}
          </button>

          <div className="mt-8 text-[9px] text-slate-700 text-center uppercase font-bold tracking-widest">
            Your ownership is immediate and permanent.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
