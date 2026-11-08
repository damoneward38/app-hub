import { useState } from 'react';
import { AppItem, Page } from '../types';
import MonitorGrid from '../components/MonitorGrid';
import StripeModal from '../components/StripeModal';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, Shield } from 'lucide-react';

interface PDFStoreProps {
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function PDFStore({ triggerToast }: PDFStoreProps) {
  const [items, setItems] = useState<AppItem[]>([
    { id: 'p1', name: 'SaaS Blueprint 2025', description: 'Complete guide to launching your SaaS from zero to revenue.', price: 29, revenue: 387, unlocks: 46, live: true, icon: '📘', type: 'PDF Guide', color: 'gold' },
    { id: 'p2', name: 'Auth Systems Deep Dive', description: '247-page breakdown of every authentication method that exists.', price: 19, revenue: 247, unlocks: 28, live: true, icon: '🔐', type: 'PDF Guide', color: 'red' },
    { id: 'p3', name: 'Quantum Encryption Guide', description: 'How quantum encryption works and how to implement it.', price: 39, revenue: 156, unlocks: 12, live: true, icon: '🔮', type: 'PDF Guide', color: 'purple' },
    { id: 'p4', name: 'White Label Playbook', description: 'Step by step guide to white labeling and selling SaaS to businesses.', price: 49, revenue: 196, unlocks: 8, live: false, icon: '📋', type: 'PDF Guide', color: 'cyan' },
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
    triggerToast('✅ Payment successful! Unlocking...', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black mb-4">📄 PDF <span className="text-gold">Store</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto italic">
          Your PDF vault. Upload guides, ebooks, blueprints. Customers pay to read them right here.
        </p>
      </div>

      <MonitorGrid 
        items={items}
        type="pdf"
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
        onUploadClick={() => triggerToast('Open VaultDrop to upload new files.', 'info')}
      />

      <StripeModal 
        isOpen={showStripe}
        onClose={() => setShowStripe(false)}
        onSuccess={handlePaymentSuccess}
        itemName={selectedItem?.name || ''}
        itemPrice={selectedItem?.price || 0}
      />

      {/* PDF Viewer */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] bg-black/98 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gold/5 backdrop-blur-3xl">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-gradient-gold">Viewing: {viewingItem.name}</h3>
                <div className="px-3 py-1 rounded-full bg-green-neon/10 border border-green-neon/40 text-green-neon text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-neon animate-pulse" /> Live Session
                </div>
              </div>
              <button 
                onClick={() => setViewingItem(null)}
                className="w-10 h-10 rounded-full bg-red-neon/10 border border-red-neon/30 text-red-neon flex items-center justify-center hover:bg-red-neon hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-4xl bg-white rounded-lg p-16 shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-[#111] font-serif leading-relaxed"
              >
                <h1 className="text-4xl font-black mb-8 border-b-4 border-gold pb-4 inline-block">{viewingItem.name}</h1>
                <p className="text-xl font-bold mb-6 italic opacity-70">Confidential Vault Record — ZEHAV Q-SEAL: ACTIVE</p>
                
                <section className="space-y-6 text-lg">
                  <h2 className="text-2xl font-black mt-12 mb-4">Chapter 1: The Foundation</h2>
                  <p>In this digital empire, sovereignty is the only currency that matters. To build a vault is to define the boundaries of your own reality. Traditional encryption was a lock; ZEHAV is a new dimension.</p>
                  <p>The core philosophy of this guide rests on three pillars: Absolute Privacy, Zero Friction, and Quantum Ownership. When you lock a file in the Golden Vault, it ceases to exist in the public record and begins its life as a pure asset.</p>
                  
                  <h2 className="text-2xl font-black mt-12 mb-4">Chapter 2: Scaling the Empire</h2>
                  <p>Revenue is not an goal; it is a symptom of effective architecture. By removing the gatekeepers of traditional commerce, ZEHAV enables instantaneous value exchange across the quantum layer.</p>
                  <p>Every unlock recorded in this session has been verified against the subatomic ledger. You are seeing the live data because the laws of physics have granted you access.</p>
                  
                  <div className="bg-gold/10 p-8 rounded-2xl border-l-8 border-gold mt-12 italic">
                    "The boldest path is the one you build yourself, locked away from those who did not dare."
                  </div>
                </section>

                <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm italic">
                  <span>© 2025 ZEHAV — All Rights Reserved</span>
                  <span>Session: QX-{Math.random().toString(36).substr(2,9).toUpperCase()}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
