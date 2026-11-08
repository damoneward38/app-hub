import { useState } from 'react';
import { AppItem } from '../types';
import MonitorGrid from '../components/MonitorGrid';
import StripeModal from '../components/StripeModal';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Shield, Zap, Terminal, BarChart3 } from 'lucide-react';

interface AppStoreProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AppStore({ triggerToast }: AppStoreProps) {
  const [items, setItems] = useState<AppItem[]>([
    { id: 'a1', name: 'VaultX Mobile App', description: 'Full mobile-ready auth app. Opens full screen. Zero downloads needed.', price: 49, revenue: 637, unlocks: 24, live: true, icon: '📱', type: 'Web App', color: 'gold' },
    { id: 'a2', name: 'ZEHAV Marketplace', description: 'Complete digital marketplace app. Sell anything from inside your vault.', price: 79, revenue: 553, unlocks: 17, live: true, icon: '🏪', type: 'Web App', color: 'green' },
    { id: 'a3', name: 'CodePulse Lite', description: 'Lightweight code fixer app. Perfect for quick repairs on the go.', price: 29, revenue: 261, unlocks: 13, live: true, icon: '💻', type: 'Web App', color: 'purple' },
  ]);

  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [showStripe, setShowStripe] = useState(false);
  const [viewingItem, setViewingItem] = useState<AppItem | null>(null);

  const handleOpen = (item: AppItem) => {
    setSelectedItem(item);
    setShowStripe(true);
  };

  const handlePaymentSuccess = () => {
    setShowStripe(false);
    setViewingItem(selectedItem);
    triggerToast('✅ App Unlocked via ZEHAV!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">📱 App <span className="text-green-neon">Store</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto italic">
          Your app vault. Drop every app you built. Customers unlock and use them full screen.
        </p>
      </div>

      <MonitorGrid 
        items={items}
        type="app"
        onOpen={handleOpen}
        onToggleLock={(id) => {
          setItems(items.map(it => it.id === id ? { ...it, live: !it.live } : it));
          triggerToast('Lock status updated.');
        }}
        onUpdatePrice={(id, price) => {
          setItems(items.map(it => it.id === id ? { ...it, price } : it));
        }}
        onDelete={(id) => {
          setItems(items.filter(it => it.id !== id));
          triggerToast('Item removed from vault.', 'error');
        }}
        onUploadClick={() => triggerToast('Open VaultDrop to upload new apps.', 'info')}
      />

      <StripeModal 
        isOpen={showStripe}
        onClose={() => setShowStripe(false)}
        onSuccess={handlePaymentSuccess}
        itemName={selectedItem?.name || ''}
        itemPrice={selectedItem?.price || 0}
      />

      {/* App Viewer (Multi-Window Mode) */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/98 flex flex-col p-4 sm:p-6"
          >
            <div className="flex items-center justify-between p-4 mb-4">
              <h3 className="text-xl font-black text-gradient-gold">Running: {viewingItem.name}</h3>
              <button 
                onClick={() => setViewingItem(null)}
                className="px-6 py-2 rounded-xl bg-red-neon/10 border border-red-neon/30 text-red-neon font-black uppercase text-[10px] tracking-widest hover:bg-red-neon hover:text-white transition-all outline-none"
              >
                ✕ Close App
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Window 1: Main */}
              <motion.div 
                initial={{ transform: 'scale(0.9)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-card-dark border border-green-neon/30 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="bg-green-neon/5 px-4 py-2 flex items-center justify-between border-b border-green-neon/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-neon">Application — Main</span>
                  <Smartphone size={14} className="text-green-neon" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,rgba(0,255,106,0.05)_0%,transparent_70%)]">
                  <div className="text-6xl mb-6">{viewingItem.icon}</div>
                  <h4 className="text-2xl font-black mb-2">{viewingItem.name}</h4>
                  <p className="text-slate-500 text-sm max-w-xs">{viewingItem.description}</p>
                </div>
              </motion.div>

              {/* Window 2: Analytics */}
              <motion.div 
                initial={{ transform: 'scale(0.9)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-card-dark border border-gold/30 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="bg-gold/5 px-4 py-2 flex items-center justify-between border-b border-gold/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold">Vault Analytics</span>
                  <BarChart3 size={14} className="text-gold" />
                </div>
                <div className="flex-1 p-6 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Metric {i}X</span>
                        <span className="text-gold">8{i}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${80 + i * 5}%` }} 
                          className="h-full bg-linear-to-r from-gold-dark to-gold" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Window 3: Security */}
              <motion.div 
                initial={{ transform: 'scale(0.9)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card-dark border border-purple-neon/30 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="bg-purple-neon/5 px-4 py-2 flex items-center justify-between border-b border-purple-neon/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-neon">Quantum Shield</span>
                  <Shield size={14} className="text-purple-neon" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-purple-neon/40 flex items-center justify-center mb-4 relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-[-4px] border-t-2 border-purple-neon rounded-full"
                    />
                    <Lock size={24} className="text-purple-neon" />
                  </div>
                  <div className="text-[10px] font-mono text-purple-neon uppercase tracking-widest">
                    Encryption Token: {Math.random().toString(36).substr(2,8).toUpperCase()}
                  </div>
                </div>
              </motion.div>

              {/* Window 4: Console */}
              <motion.div 
                initial={{ transform: 'scale(0.9)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Console</span>
                  <Terminal size={14} className="text-slate-500" />
                </div>
                <div className="flex-1 p-4 font-mono text-[10px] text-green-neon/70 space-y-1">
                  <p>&gt; ZEHAV App Container active.</p>
                  <p>&gt; Connection: 256.44.12.19</p>
                  <p>&gt; Quantum layer verified.</p>
                  <p>&gt; Session started for {viewingItem.name}</p>
                  <div className="flex items-center gap-1">
                    <Zap size={8} fill="currentColor" /> System: Stable.
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
