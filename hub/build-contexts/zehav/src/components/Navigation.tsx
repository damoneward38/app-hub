import { Page } from '../types';
import { motion } from 'motion/react';
import { Menu, X, Shield, LayoutGrid, Zap, Brain, CreditCard, FolderUp, DoorOpen, Info } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', icon: <LayoutGrid size={16} />, page: Page.Landing },
    { name: 'PDF Store', icon: <LayoutGrid size={16} />, page: Page.PDFStore },
    { name: 'SaaS Store', icon: <Zap size={16} />, page: Page.SaaSStore },
    { name: 'App Store', icon: <LayoutGrid size={16} />, page: Page.AppStore },
    { name: 'CodePulse', icon: <Zap size={16} />, page: Page.CodePulse },
    { name: 'Quantum', icon: <Brain size={16} />, page: Page.Quantum },
    { name: 'Pricing', icon: <CreditCard size={16} />, page: Page.Pricing },
    { name: 'Dashboard', icon: <LayoutGrid size={16} />, page: Page.Dashboard },
    { name: 'White Label', icon: <Zap size={16} />, page: Page.WhiteLabel },
    { name: 'Admin', icon: <LayoutGrid size={16} />, page: Page.Admin },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 py-4 bg-bg-dark/80 backdrop-blur-3xl border-b border-gold/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex flex-col cursor-pointer group"
          onClick={() => onNavigate(Page.Landing)}
        >
          <div className="text-2xl font-black tracking-[6px] text-gradient-gold group-hover:opacity-80 transition-opacity">
            ZEHAV
          </div>
          <span className="text-[10px] uppercase tracking-[3px] text-slate-500 font-bold -mt-1">
            Golden Vault
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={`text-[11px] uppercase tracking-[2px] font-bold transition-all hover:text-gold relative py-1 ${
                currentPage === link.page ? 'text-gold' : 'text-slate-500'
              }`}
            >
              {link.name}
              {currentPage === link.page && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
                />
              )}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button 
            onClick={() => onNavigate(Page.Auth)}
            className="px-5 py-2 rounded-lg border border-gold/40 text-gold text-[10px] uppercase font-black tracking-widest hover:bg-gold/10 transition-all"
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate(Page.Auth)}
            className="px-5 py-2 rounded-lg bg-linear-to-br from-gold-light to-gold text-black text-[10px] uppercase font-black tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105 transition-all"
          >
            Access Vault
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-gold" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-full left-0 right-0 bg-bg-dark border-b border-gold/10 p-6 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => { onNavigate(link.page); setIsOpen(false); }}
                className={`flex items-center gap-2 p-3 rounded-xl border ${
                  currentPage === link.page ? 'bg-gold/10 border-gold/40 text-gold' : 'border-white/5 text-slate-400'
                }`}
              >
                {link.icon}
                <span className="text-xs uppercase font-bold tracking-wider">{link.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button className="w-full py-4 rounded-xl bg-gold text-black font-black uppercase tracking-widest text-sm">
              Get Access Now
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
