import { motion, AnimatePresence } from 'motion/react';
import { Eye, Lock, Unlock, Trash2, Edit3 } from 'lucide-react';
import { AppItem } from '../types';

interface MonitorGridProps {
  items: AppItem[];
  type: 'pdf' | 'saas' | 'app';
  onOpen: (item: AppItem) => void;
  onToggleLock: (id: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onDelete: (id: string) => void;
  onUploadClick: () => void;
}

export default function MonitorGrid({ 
  items, 
  type, 
  onOpen, 
  onToggleLock, 
  onUpdatePrice, 
  onDelete, 
  onUploadClick 
}: MonitorGridProps) {
  const emptySlots = Math.max(12 - items.length, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {items.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card-dark border border-white/5 rounded-3xl overflow-hidden group hover:border-gold/30 transition-all shadow-2xl relative"
        >
          {/* Monitor Screen */}
          <div className={`h-40 flex items-center justify-center text-5xl relative overflow-hidden ${
            item.color === 'gold' ? 'bg-gold/5' : 
            item.color === 'green' ? 'bg-green-neon/5' :
            item.color === 'purple' ? 'bg-purple-neon/5' :
            item.color === 'red' ? 'bg-red-neon/5' : 'bg-cyan-neon/5'
          }`}>
            <span className="relative z-10">{item.icon}</span>
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
              item.live ? 'bg-green-neon/10 border border-green-neon/40 text-green-neon' : 'bg-red-neon/10 border border-red-neon/40 text-red-neon'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${item.live ? 'bg-green-neon animate-pulse' : 'bg-red-neon'}`} />
              {item.live ? 'Live' : 'Offline'}
            </div>
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 text-[8px] font-bold text-slate-400 flex items-center gap-1">
              <Eye size={10} /> {Math.floor(Math.random() * 20 + 1)} Viewing
            </div>
          </div>

          <div className="p-5">
            <div className="text-[9px] uppercase font-black tracking-[2px] text-slate-500 mb-1">{item.type}</div>
            <h3 className="text-sm font-black mb-1 truncate">{item.name}</h3>
            <p className="text-[11px] text-slate-500 leading-tight mb-4 h-8 overflow-hidden line-clamp-2">{item.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-600 tracking-widest">Price ($)</span>
                <input 
                  type="number"
                  value={item.price}
                  onChange={(e) => onUpdatePrice(item.id, Number(e.target.value))}
                  className="bg-gold/5 border border-gold/20 rounded-lg px-2 py-1 text-gold font-black text-sm w-20 focus:border-gold outline-none"
                />
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase font-bold text-slate-600 tracking-widest">Revenue</span>
                <div className="text-sm font-black text-green-neon">${item.revenue.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onOpen(item)}
                className="py-2.5 rounded-xl bg-linear-to-br from-gold-light to-gold text-black font-black uppercase text-[9px] tracking-widest hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all"
              >
                Open Vault
              </button>
              <div className="flex gap-1">
                <button 
                  onClick={() => onToggleLock(item.id)}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-gold hover:border-gold/40 flex items-center justify-center transition-all"
                >
                  {item.live ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="w-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-neon hover:border-red-neon/40 flex items-center justify-center transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Empty Slots */}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <motion.div
          key={`empty-${i}`}
          onClick={onUploadClick}
          className="bg-card-dark border-2 border-dashed border-white/5 rounded-3xl min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:border-gold/30 hover:bg-gold/2 transition-all group"
        >
          <div className="text-4xl text-slate-700 group-hover:text-gold/40 transition-all mb-4">+</div>
          <div className="text-[10px] uppercase font-bold tracking-[3px] text-slate-600 group-hover:text-slate-400 text-center">
            Drop {type.toUpperCase()} Here<br />or click to upload
          </div>
        </motion.div>
      ))}
    </div>
  );
}
