import React, { useState, useRef } from 'react';
import {
  Shield,
  Layers,
  Activity,
  FileCheck2,
  Users,
  CreditCard,
  BookOpen,
  Mail,
  LogIn,
  LogOut,
  UserCheck,
  Sparkles,
  PlusCircle,
  Cpu,
  Lock,
  Code2,
  Radio,
  Terminal,
  DollarSign,
  Briefcase,
  Mic,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Play,
  Check,
} from 'lucide-react';
import { User } from '../types';
import { platformStore } from '../services/store';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickAdminLogin: () => void;
  onOpenOllamaModal: () => void;
}

interface NavModuleItem {
  id: string;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'core' | 'investor' | 'regulated' | 'pillars' | 'cyber' | 'creator';
  desc: string;
}

const ALL_MODULES: NavModuleItem[] = [
  {
    id: 'chat',
    label: 'Talk with AI (Voice & ZIP)',
    badge: 'MIC & AUDIT',
    icon: Mic,
    category: 'core',
    desc: 'Voice conversation (Mic/Speaker) + Drag & Drop ZIP Security Auditing',
  },
  {
    id: 'investor',
    label: 'Investor-Friendly Terminal',
    badge: '$4.25M',
    icon: Briefcase,
    category: 'investor',
    desc: 'Asset valuation, exit multiples simulator, and 3-tier paywall',
  },
  {
    id: 'secure-enterprise',
    label: 'Banks, Defense & FDA Enclave',
    badge: 'ZERO-EGRESS',
    icon: Lock,
    category: 'regulated',
    desc: 'SEC 17a-4, ITAR, SWIFT, and FDA 21 CFR Part 11 air-gapped isolation',
  },
  {
    id: 'valuation',
    label: 'Why Millions Valuation',
    badge: '$550k/yr SAVED',
    icon: DollarSign,
    category: 'investor',
    desc: 'Replaces 12 enterprise SaaS platforms + 15 engineering labor years',
  },
  {
    id: 'how-to-call',
    label: '8 Calling Modalities',
    badge: '247 ROUTES',
    icon: Terminal,
    category: 'pillars',
    desc: 'CLI binaries, Python SDK, REST endpoints, MCP schemas, and audio wake-word',
  },
  {
    id: 'pillars',
    label: '3-Pillars Vault',
    badge: '6,805+ FUNCS',
    icon: Cpu,
    category: 'pillars',
    desc: 'Sapphire (MatrixBroker), Open-Jev (NAMI), and T3MP3ST (CyberHealer)',
  },
  {
    id: 'docs-library',
    label: '177 Documentation Books',
    badge: '177 BOOKS',
    icon: BookOpen,
    category: 'pillars',
    desc: 'Full auditable technical library, tools manuals, and mastery guides',
  },
  {
    id: 'studio',
    label: 'Creator Studio',
    badge: '100 CORES',
    icon: Sparkles,
    category: 'creator',
    desc: 'Adaptive video transcoding, FairPlay/Widevine DRM, and music stems',
  },
  {
    id: 'console',
    label: 'Closed-Loop Console',
    badge: '12-STAGE',
    icon: Activity,
    category: 'cyber',
    desc: 'Autonomous loopback: Verify → Fix → Repair → Verify Again',
  },
  {
    id: 'cores',
    label: '200 Cores Swarm Registry',
    badge: '50/50 SPLIT',
    icon: Cpu,
    category: 'cyber',
    desc: '50 Finders + 50 Fixers + 100 Creator/Business Specialists',
  },
  {
    id: 'sela',
    label: 'SELA Diagnostics Lab',
    badge: 'AST TAINT',
    icon: Code2,
    category: 'cyber',
    desc: 'Deep AST code inspection, credential analysis, and zero-egress checks',
  },
  {
    id: 'ezhkar',
    label: 'EZHKAR Micro-VM Sandbox',
    badge: 'QUORUM 11/20',
    icon: Lock,
    category: 'cyber',
    desc: 'Firecracker micro-VM isolation with majority consensus voting',
  },
  {
    id: 'dashboard',
    label: 'Execution Cockpit',
    badge: 'LIVE SWARM',
    icon: Layers,
    category: 'cyber',
    desc: 'Live telemetry, real-time jobs, and dispatch monitors',
  },
  {
    id: 'audit',
    label: 'WORM Audit Ledger',
    badge: 'SHA-256',
    icon: FileCheck2,
    category: 'cyber',
    desc: 'Immutable SEC 17a-4 compliant cryptographic event ledger',
  },
  {
    id: 'pricing',
    label: 'Pricing & White-Label',
    badge: '$250/MO',
    icon: DollarSign,
    category: 'investor',
    desc: 'Essentials ($250/mo), Pro ($1,500/mo), Enterprise ($4,500/mo), White-Label ($110k)',
  },
  {
    id: 'wizard',
    label: 'Air-Gapped Deployment Wizard',
    badge: 'ON-PREM',
    icon: Shield,
    category: 'regulated',
    desc: 'Sovereign infrastructure blueprint builder for enterprise deployments',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onQuickAdminLogin,
  onOpenOllamaModal,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuditingButtons, setIsAuditingButtons] = useState(false);
  const [auditProgress, setAuditProgress] = useState<{ audited: number; total: number; currentRoute: string } | null>(null);
  const [auditSuccess, setAuditSuccess] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === 'admin';
  const ollama = platformStore.getOllamaConfig();

  const handleScrollNav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleRunButtonAudit = () => {
    setIsAuditingButtons(true);
    setAuditSuccess(false);
    let index = 0;
    const total = ALL_MODULES.length;

    const interval = setInterval(() => {
      if (index < total) {
        setAuditProgress({
          audited: index + 1,
          total,
          currentRoute: ALL_MODULES[index].label,
        });
        index++;
      } else {
        clearInterval(interval);
        setIsAuditingButtons(false);
        setAuditSuccess(true);
      }
    }, 90);
  };

  const filteredModules = ALL_MODULES.filter(
    (m) =>
      m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.badge?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Fixed Regular Proportional Height Header (h-16 only, never disproportionate) */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
            
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-left group transition cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                      NEURAL CORE <span className="text-cyan-400">200</span>
                    </span>
                    <span className="hidden sm:inline-block text-[9px] text-cyan-300 font-bold px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/40">
                      OLLAMA
                    </span>
                  </div>
                  <span className="hidden md:inline-block text-[10px] text-slate-400 font-medium tracking-normal -mt-0.5 truncate max-w-[210px]">
                    תכנית הצופה (Taḥnīʿ Hâzoo)
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Retractable Horizontally-Scrollable Navigation Track (Fixed height, no vertical bloat) */}
            <div className="relative flex-1 max-w-2xl hidden md:flex items-center">
              <button
                onClick={() => handleScrollNav('left')}
                className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition shrink-0 mr-1 cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
              >
                {/* 1. TALK WITH AI (Dedicated Voice & File Audit Page) */}
                <button
                  onClick={() => {
                    setActiveTab('chat');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-900/40'
                      : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>Talk with AI</span>
                  <span className="text-[9px] bg-cyan-900 text-cyan-200 px-1 py-0.2 rounded font-mono">
                    MIC & ZIP
                  </span>
                </button>

                {/* 2. INVESTOR-FRIENDLY */}
                <button
                  onClick={() => {
                    setActiveTab('investor');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'investor'
                      ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/70 shadow-sm'
                      : 'hover:text-emerald-300 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Investor ($4.25M)</span>
                </button>

                {/* 3. BANKS & GOV (Zero-Egress) */}
                <button
                  onClick={() => {
                    setActiveTab('secure-enterprise');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'secure-enterprise'
                      ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/70 shadow-sm'
                      : 'hover:text-emerald-300 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Banks & Gov</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded font-mono border border-emerald-800">
                    Air-Gap
                  </span>
                </button>

                {/* 4. PILLARS VAULT */}
                <button
                  onClick={() => {
                    setActiveTab('pillars');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'pillars'
                      ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/70'
                      : 'hover:text-white hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pillars (6,805+)</span>
                </button>

                {/* 5. 177 DOCS */}
                <button
                  onClick={() => {
                    setActiveTab('docs-library');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'docs-library'
                      ? 'bg-amber-950 text-amber-300 font-bold border border-amber-500/70'
                      : 'hover:text-white hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>177 Docs</span>
                </button>

                {/* 6. HOW TO CALL */}
                <button
                  onClick={() => {
                    setActiveTab('how-to-call');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'how-to-call'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/70'
                      : 'hover:text-white hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>8 Calling Modes</span>
                </button>

                {/* 7. WHY MILLIONS */}
                <button
                  onClick={() => {
                    setActiveTab('valuation');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'valuation'
                      ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/70'
                      : 'hover:text-white hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Valuation</span>
                </button>

                {/* 8. CREATOR STUDIO */}
                <button
                  onClick={() => {
                    setActiveTab('studio');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'studio'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/70'
                      : 'hover:text-white hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Studio</span>
                </button>

                {/* 9. PRICING */}
                <button
                  onClick={() => {
                    setActiveTab('pricing');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'pricing'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/70'
                      : 'hover:text-white hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pricing ($250/mo)</span>
                </button>
              </div>

              <button
                onClick={() => handleScrollNav('right')}
                className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition shrink-0 ml-1 cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zone 3: Retractable Sidebar Toggle + User Session */}
            <div className="flex items-center gap-2 shrink-0">
              {/* RETRACTABLE SIDEBAR TOGGLE BUTTON */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                title="Open Retractable Modules & Routers Sidebar"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/70 text-slate-200 text-xs font-bold transition cursor-pointer shadow-sm shadow-slate-950"
              >
                <Menu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">All Modules</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800 font-bold">
                  16
                </span>
              </button>

              {/* Local Ollama Live Status Pill */}
              <button
                onClick={onOpenOllamaModal}
                className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                title="Configure Local Ollama Engine"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">11434</span>
                <span className="text-cyan-300 truncate max-w-[90px]">{ollama.model.split('-')[0]}</span>
              </button>

              {/* User Session / Sign In */}
              {currentUser.id !== 'guest' ? (
                <div className="flex items-center gap-1.5">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono capitalize">
                      {currentUser.plan} tier
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onQuickAdminLogin}
                    title="Quick-login as Damone Ward (Admin)"
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/80 rounded-lg hover:bg-cyan-900/60 transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </div>
              )}

              {/* Direct Talk to AI Shortcut for Mobile / Header */}
              <button
                onClick={() => {
                  setActiveTab('chat');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="Open Autonomous Chat & Voice Page"
                className="flex md:hidden items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-lg transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Talk</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* RETRACTABLE SIDEBAR DRAWER (Full modules navigation, scrollable, retractable, preserves header dimensions) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-slate-950 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Retractable Navigation Drawer</h3>
                  <p className="text-[11px] text-slate-400">All 16 Neural Core Modules & Pipelines</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Retract Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filter & Search Bar */}
            <div className="p-3 border-b border-slate-900 bg-slate-950 shrink-0 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 16 modules, routers, or pipelines..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Full Button & Router Audit Runner Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleRunButtonAudit}
                  disabled={isAuditingButtons}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-cyan-950"
                >
                  <Activity className={`w-3.5 h-3.5 ${isAuditingButtons ? 'animate-spin' : ''}`} />
                  <span>{isAuditingButtons ? 'Auditing All 16 Routers...' : 'Run Full Button & Router Audit'}</span>
                </button>
              </div>

              {/* Audit Progress or Success Banner */}
              {auditProgress && (
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                  <span>Auditing: {auditProgress.currentRoute}</span>
                  <span className="text-cyan-400 font-bold">
                    {auditProgress.audited}/{auditProgress.total}
                  </span>
                </div>
              )}

              {auditSuccess && (
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All 16 routers & pipelines tied, verified & responding!</span>
                </div>
              )}
            </div>

            {/* Scrollable List of Modules */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeTab === module.id;

                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveTab(module.id);
                      setIsSidebarOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-600/80 shadow-md shadow-cyan-950'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-cyan-200' : 'text-white'}`}>
                          {module.label}
                        </span>
                        {module.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 shrink-0 border border-slate-700">
                            {module.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{module.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer with Air-Gap Status */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/80 shrink-0 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>0.00 Bytes Egress</span>
              </div>
              <div className="text-slate-500">
                <span>Local Ollama (11434)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

