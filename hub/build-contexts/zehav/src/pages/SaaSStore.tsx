import { useState } from 'react';
import { AppItem } from '../types';
import MonitorGrid from '../components/MonitorGrid';
import StripeModal from '../components/StripeModal';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Terminal, Zap } from 'lucide-react';

interface SaaSStoreProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function SaaSStore({ triggerToast }: SaaSStoreProps) {
  const [items, setItems] = useState<AppItem[]>([
    { id: 's1', name: 'VaultX Auth Platform', description: 'Full authentication system with 2FA, OAuth, dashboard. Deploy ready.', price: 99, revenue: 1188, unlocks: 47, live: true, icon: '🔐', type: 'SaaS Tool', color: 'cyan' },
    { id: 's2', name: 'CodePulse AI Engine', description: 'Live AI code repair. Drop broken code, watch it fix itself in real time.', price: 79, revenue: 948, unlocks: 32, live: true, icon: '⚡', type: 'SaaS Tool', color: 'green' },
    { id: 's3', name: 'Quantum Dashboard', description: 'Full analytics, inventory, real-time alerts and Stripe billing dashboard.', price: 129, revenue: 516, unlocks: 18, live: false, icon: '📊', type: 'SaaS Tool', color: 'purple' },
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
    triggerToast('✅ SaaS Access Granted!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">⚙️ SaaS <span className="text-cyan-neon">Store</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto italic">
          Your SaaS vault. Upload your platforms and tools. They run live inside ZEHAV. Forever.
        </p>
      </div>

      <MonitorGrid 
        items={items}
        type="saas"
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
        onUploadClick={() => triggerToast('Open VaultDrop to upload new tools.', 'info')}
      />

      <StripeModal 
        isOpen={showStripe}
        onClose={() => setShowStripe(false)}
        onSuccess={handlePaymentSuccess}
        itemName={selectedItem?.name || ''}
        itemPrice={selectedItem?.price || 0}
      />

      {/* SaaS Viewer (Browser Mode) */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/98 flex flex-col p-4 sm:p-8"
          >
            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col bg-card-dark border border-cyan-neon/30 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,245,255,0.1)]">
              {/* Browser Bar */}
              <div className="bg-cyan-neon/5 border-b border-cyan-neon/20 px-6 py-4 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-neon/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gold/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-neon/40" />
                </div>
                <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-cyan-neon font-mono flex items-center gap-2">
                  <Globe size={14} /> zehav.io/vault/session/{viewingItem.id}
                </div>
                <button 
                  onClick={() => setViewingItem(null)}
                  className="w-10 h-10 rounded-xl bg-red-neon/10 border border-red-neon/30 text-red-neon flex items-center justify-center hover:bg-red-neon hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-8 flex items-center justify-center text-center">
                  <div className="max-w-xl">
                    <div className="text-7xl mb-8">{viewingItem.icon}</div>
                    <h2 className="text-4xl font-black text-gradient-gold mb-4">{viewingItem.name}</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                      SaaS instance running live via ZEHAV Quantum Bridge. 
                      Your changes are persisted locally and synced across the vault.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="px-8 py-4 rounded-xl bg-cyan-neon text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-all">
                        Launch Dashboard
                      </button>
                      <button className="px-8 py-4 rounded-xl border border-cyan-neon/40 text-cyan-neon font-black uppercase tracking-widest text-sm hover:bg-cyan-neon/10 transition-all">
                        View API
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-terminal */}
                <div className="h-48 border-t border-cyan-neon/20 bg-black/60 p-6 font-mono text-xs text-cyan-neon/70 space-y-1 overflow-y-auto">
                  <div className="flex items-center gap-2 text-cyan-neon font-bold mb-2">
                    <Terminal size={14} /> ZEHAV QUANTUM LOGS
                  </div>
                  <p>&gt; Initializing bridge for {viewingItem.name}...</p>
                  <p>&gt; Encrypted tunnel established: ID-7734-QX</p>
                  <p>&gt; Synced state recovered from vault.</p>
                  <p>&gt; SaaS Ready. Monitoring active.</p>
                  <div className="flex items-center gap-2 text-green-neon">
                    <Zap size={10} fill="currentColor" /> System Optimal.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
