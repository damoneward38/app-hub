import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Database, 
  FolderGit2, 
  Settings, 
  Rocket, 
  Zap, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  CreditCard, 
  Menu, 
  X,
  Radio,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { TabType, SystemMetrics } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  metrics: SystemMetrics | null;
  isListening: boolean;
  toggleVoiceListening: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  openPricing: () => void;
  activePlan: 'free' | 'pro' | 'enterprise';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  isListening,
  toggleVoiceListening,
  isMuted,
  toggleMute,
  openPricing,
  activePlan
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'sapphire', label: 'Sapphire AI', icon: <Radio className="w-4 h-4 text-blue-400" />, badge: 'AI' },
    { id: 'openclaw', label: 'OpenClaw IDE', icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
    { id: 'brain', label: 'AI Hub (3 AIs)', icon: <Cpu className="w-4 h-4 text-purple-400" />, badge: 'Sync' },
    { id: 'memory', label: 'Memory', icon: <Database className="w-4 h-4 text-amber-400" /> },
    { id: 'files', label: 'Files', icon: <FolderGit2 className="w-4 h-4 text-sky-400" /> },
    { id: 'pipeline', label: 'Deploy', icon: <Rocket className="w-4 h-4 text-rose-400" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 text-slate-400" /> },
  ];

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Badges */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 text-base">
                  Sapphire
                </span>
                <span className="text-slate-600 font-light">+</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  OpenClaw
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">NEURAL CLOUD WORKSPACE</span>
            </div>
          </button>

          {/* Plan badge */}
          <button
            onClick={openPricing}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
          >
            <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            <span className="uppercase tracking-wider">{activePlan}</span>
          </button>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Utility Bar: Voice, Mic, Audio, Telemetry, Pricing */}
        <div className="flex items-center gap-2">
          {/* "Hey Sapphire" Wake Word Listener */}
          <button
            onClick={toggleVoiceListening}
            title={isListening ? 'Wake word "Hey Sapphire" Active (Click to mute)' : 'Activate "Hey Sapphire" Wake Word'}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isListening
                ? 'bg-red-500/10 border-red-500/40 text-red-300 animate-pulse shadow-sm shadow-red-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span className="font-mono text-[11px]">"Hey Sapphire" ON</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline font-mono text-[11px]">Voice Off</span>
              </>
            )}
          </button>

          {/* TTS Mute toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Voice Speech Muted (Click to enable TTS)' : 'Voice Speech Active (Click to mute)'}
            className={`p-2 rounded-lg text-xs border transition ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/40 border-cyan-700/40 text-cyan-300 hover:bg-cyan-900/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Share Link */}
          <button
            onClick={handleCopyLink}
            title="Share Workspace Link"
            className="p-2 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Upgrade / Pricing Button */}
          <button
            onClick={openPricing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:opacity-95 transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium border ${
                  activeTab === item.id
                    ? 'bg-slate-800 border-slate-700 text-white font-semibold'
                    : 'bg-slate-900/70 border-slate-800/80 text-slate-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
            <span className="text-slate-400">Node: {metrics?.nodeVersion || 'v22'}</span>
            <button
              onClick={() => {
                openPricing();
                setMobileMenuOpen(false);
              }}
              className="text-cyan-400 font-semibold flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
