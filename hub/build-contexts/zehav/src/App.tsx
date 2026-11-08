import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import PDFStore from './pages/PDFStore';
import SaaSStore from './pages/SaaSStore';
import AppStore from './pages/AppStore';
import CodePulse from './pages/CodePulse';
import Quantum from './pages/Quantum';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import WhiteLabel from './pages/WhiteLabel';
import Admin from './pages/Admin';
import VaultDrop from './pages/VaultDrop';
import Auth from './pages/Auth';
import About from './pages/About';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setShowToast({ message, type });
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Landing: return <Landing onNavigate={setCurrentPage} />;
      case Page.PDFStore: return <PDFStore triggerToast={triggerToast} />;
      case Page.SaaSStore: return <SaaSStore triggerToast={triggerToast} />;
      case Page.AppStore: return <AppStore triggerToast={triggerToast} />;
      case Page.CodePulse: return <CodePulse />;
      case Page.Quantum: return <Quantum triggerToast={triggerToast} />;
      case Page.Pricing: return <Pricing triggerToast={triggerToast} />;
      case Page.Dashboard: return <Dashboard />;
      case Page.WhiteLabel: return <WhiteLabel triggerToast={triggerToast} />;
      case Page.Admin: return <Admin triggerToast={triggerToast} />;
      case Page.VaultDrop: return <VaultDrop />;
      case Page.Auth: return <Auth triggerToast={triggerToast} />;
      case Page.About: return <About triggerToast={triggerToast} />;
      default: return <Landing onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(8,8,24,1)_0%,rgba(1,0,8,1)_100%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(var(--color-gold) 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
      </div>

      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="relative z-10 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 font-bold letter-spacing-1 ${
              showToast.type === 'success' ? 'bg-green-neon/10 border-green-neon/40 text-green-neon' :
              showToast.type === 'error' ? 'bg-red-neon/10 border-red-neon/40 text-red-neon' :
              'bg-gold/10 border-gold/40 text-gold'
            }`}
          >
            <span className="text-xl">
              {showToast.type === 'success' ? '⚡' : showToast.type === 'error' ? '🛡️' : '✨'}
            </span>
            {showToast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
