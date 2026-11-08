import React from 'react';
import {
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  FileCode2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Activity,
  Flame,
  Globe2,
  Server,
  Play,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Music,
  Video,
  BookOpen,
  Code2,
  Radio,
  Terminal,
  Briefcase,
  Mic,
} from 'lucide-react';
import { CREATOR_MODES } from '../services/neuralCoreData';
import { PLANS } from '../services/catalogData';

interface HomeViewProps {
  onStartStudio: () => void;
  onExploreConsole: () => void;
  onExploreCores: () => void;
  onExploreSela: () => void;
  onExplorePillars?: () => void;
  onExploreHowToCall?: () => void;
  onExploreValuation?: () => void;
  onExploreInvestor?: () => void;
  onExploreDocsLibrary?: () => void;
  onExploreEnterprise?: () => void;
  onExploreChat?: () => void;
  onExploreEzhkar: () => void;
  onViewPricing: () => void;
  onOpenAudit: () => void;
  onOpenOllamaModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartStudio,
  onExploreConsole,
  onExploreCores,
  onExploreSela,
  onExplorePillars,
  onExploreHowToCall,
  onExploreValuation,
  onExploreInvestor,
  onExploreDocsLibrary,
  onExploreEnterprise,
  onExploreChat,
  onExploreEzhkar,
  onViewPricing,
  onOpenAudit,
  onOpenOllamaModal,
}) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Permanent Foundation Hierarchy Badge */}
          <div
            onClick={onOpenOllamaModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold tracking-wide uppercase mb-6 cursor-pointer hover:border-cyan-400 transition"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LOCAL OLLAMA / LOCALHOST → NEURAL CORE 200</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-normal">תכנית הצופה (Taḥnīʿ Hâzoo)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            The Autonomous Business, Creator & <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Cybersecurity Platform
            </span>{' '}
            Powered by 200 AI Cores
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The customer-facing powerhouse for music artists, YouTube creators, publishers, and digital businesses. Powered by <strong className="text-white">100 Business & Creator Cores</strong>, backed by <strong className="text-emerald-400">100 Cybersecurity Cores</strong> (50 Finders + 50 Fixers) operating through the proven Neural Core closed loop.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onExploreChat && (
              <button
                onClick={onExploreChat}
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-teal-500 via-cyan-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 rounded-xl shadow-xl shadow-cyan-900/40 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Mic className="w-4 h-4 text-cyan-200 animate-pulse" />
                <span>Talk with Neural Core (Voice & ZIP Audit)</span>
              </button>
            )}
            <button
              onClick={onStartStudio}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Launch Creator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreConsole}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Closed-Loop Console</span>
            </button>
          </div>

          {/* Quick Foundation Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div
              onClick={onExploreCores}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition cursor-pointer"
            >
              <div className="text-xs text-slate-400 font-medium">100 Cyber Cores</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">50 / 50 Split</div>
              <div className="text-[11px] text-slate-500 mt-0.5">50 Finders + 50 Fixers (A–E)</div>
            </div>
            <div
              onClick={onStartStudio}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition cursor-pointer"
            >
              <div className="text-xs text-slate-400 font-medium">100 Creator Cores</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">A–Z Catalog</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Music, Video, Books & E-Com (F–J)</div>
            </div>
            <div
              onClick={onExploreConsole}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition cursor-pointer"
            >
              <div className="text-xs text-slate-400 font-medium">Closed-Loop Loopback</div>
              <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">Self-Healing</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Verify → Fix → Repair → Verify Again</div>
            </div>
            <div
              onClick={onOpenAudit}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur hover:border-slate-700 transition cursor-pointer"
            >
              <div className="text-xs text-slate-400 font-medium">PCA Immutable Ledger</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">SHA-256 Chained</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Zero-tamper compliance proofs</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Permanent Foundation Hierarchy Diagram */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-6">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              Golden Rule — Non-Negotiable
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Everything Runs Under Neural Core
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              The permanent foundation preserves local AI sovereignty while orchestrating specialized intelligence across all business and security functions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs font-mono">
            <div
              onClick={onOpenOllamaModal}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] text-slate-500 block">TIER 1 FOUNDATION</span>
              <span className="text-white font-bold text-sm mt-1">LOCAL OLLAMA</span>
              <span className="text-[11px] text-emerald-400 mt-2">localhost:11434</span>
            </div>

            <div
              onClick={onExploreConsole}
              className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] text-cyan-400 block">TIER 2 POWERHOUSE</span>
              <span className="text-cyan-300 font-bold text-sm mt-1">NEURAL CORE</span>
              <span className="text-[11px] text-slate-400 mt-2">Closed-Loop Orchestrator</span>
            </div>

            <div
              onClick={onExploreSela}
              className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] text-indigo-400 block">TIER 3 CAPABILITIES</span>
              <span className="text-indigo-300 font-bold text-sm mt-1">SELA + EZHKAR</span>
              <span className="text-[11px] text-slate-400 mt-2">Diagnostics & Sandboxes</span>
            </div>

            <div
              onClick={onExploreCores}
              className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] text-emerald-400 block">TIER 4 SPECIALISTS</span>
              <span className="text-emerald-300 font-bold text-sm mt-1">200 AI CORES</span>
              <span className="text-[11px] text-slate-400 mt-2">100 Cyber + 100 Business</span>
            </div>

            <div
              onClick={onStartStudio}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between"
            >
              <span className="text-[10px] text-slate-500 block">TIER 5 EXECUTION</span>
              <span className="text-white font-bold text-sm mt-1">SHARED TOOLS</span>
              <span className="text-[11px] text-slate-400 mt-2">A–Z Business Ledger</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Production Pillars & Executive Valuation Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/70 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                The Underlying Power & Valuation
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                3 Production Codebases · 6,805+ Functions · $4,250,000+ Asset
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-2xl leading-relaxed">
                Learn why this platform is worth millions and discover all the ways you can call and use its capabilities:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onExploreInvestor && (
                <button
                  onClick={onExploreInvestor}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Investor Capital Terminal
                </button>
              )}
              {onExploreHowToCall && (
                <button
                  onClick={onExploreHowToCall}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  How To Call Every Feature
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div
              onClick={onExploreHowToCall}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                    8 CALLING MODES
                  </span>
                  <span className="text-xs font-mono text-slate-500">247 Web Routes</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                  All The Ways To Call & Use
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  CLI terminal binaries, Python SDK, 247 REST routes, AI Model Context Protocol (MCP), hands-free wake-word speech, continuity daemons, and Web3 multi-sig APIs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-cyan-400 flex items-center gap-1">
                Open Caller Manual <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={onExploreValuation}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-bold">
                    $4,250,000+ VALUE
                  </span>
                  <span className="text-xs font-mono text-emerald-400">$550k/yr Saved</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  Why It's Worth Millions
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Detailed analysis of the 12 standalone enterprise SaaS platforms replaced, 15 senior staff engineer years saved, and interactive ROI savings calculator.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                View Valuation Breakdown <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={onExploreInvestor}
              className="p-5 rounded-2xl border border-emerald-500/50 bg-emerald-950/30 hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-600/50 font-bold">
                    INVESTOR DECK
                  </span>
                  <span className="text-xs font-mono text-emerald-400">$300M+ TAM</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  Investor Capital Terminal
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Institutional commercial pitch, 3-tier pricing ($250/mo, $1.5k/mo, $4.5k/mo or $3k/$18k/$54k/yr + $110k White-Label), regulated enterprise TAM, and $320M exit multiple card.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-800/80 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                Open Investor Dossier <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div
              onClick={onExploreDocsLibrary}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 font-bold">
                    177 DOC BOOKS
                  </span>
                  <span className="text-xs font-mono text-amber-400">TOOLS.md</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                  Documentation & Inventories
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Browse Public Jev Capability Inventory, Sapphire's 65+ Tools guide, MASTERY-GUIDE.md, and Tempest's Red-Team Arsenal with full chapter previews.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-amber-400 flex items-center gap-1">
                Explore 177 Books <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Regulated Sovereign Enterprise & Zero-Egress Spotlight */}
          {onExploreEnterprise && (
            <div
              onClick={onExploreEnterprise}
              className="mt-6 p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-indigo-950/60 hover:border-emerald-400 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/60 text-[10px] font-mono font-bold uppercase">
                    HIGH-SECURITY & ZERO-EGRESS ENCLAVE
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    AIR-GAPPED ON-PREM
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  Built for Banks, Law Firms, Naval Command, Army Bases, Federal Gov & the FDA
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For every business that legally or operationally cannot allow confidential data to egress to public cloud AI APIs. 100% on-premise local Ollama execution, strict kernel packet drop, and immutable WORM SHA-256 audit chaining.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition">
                <span>Inspect Sovereign Enclave</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Customer-Facing: Creator Operating Modes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              Customer-Facing Product
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dynamic Creator & Business Operating Modes
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Select your creative discipline. The platform auto-configures your AI workforce.
            </p>
          </div>
          <button
            onClick={onStartStudio}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            Explore Complete A-Z Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CREATOR_MODES.slice(0, 6).map((mode) => (
            <div
              key={mode.id}
              onClick={onStartStudio}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-cyan-500/40 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40 flex items-center gap-1.5">
                    {mode.id === 'mode-music' && <Music className="w-3.5 h-3.5" />}
                    {mode.id === 'mode-video' && <Video className="w-3.5 h-3.5" />}
                    {mode.id === 'mode-publishing' && <BookOpen className="w-3.5 h-3.5" />}
                    {mode.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition">
                  {mode.tagline}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{mode.defaultFunctions.length} Automated Ledger Tasks</span>
                <span className="text-emerald-400">Security Groups A–E</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SELA & EZHKAR Capability Spotlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">SELA Capability Layer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides deep inspection tools: AST code transformation, website troubleshooting, zero-knowledge credential file inspection, and diagnostic computer operations.
            </p>
            <button
              onClick={onExploreSela}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
            >
              Open SELA Diagnostic Lab <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">EZHKAR Sandbox Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decouples 50 Finders from 50 Fixers across strictly isolated micro-VM sandboxes. Enforces read-only boundaries, whitelisted networks, and consensus quorums.
            </p>
            <button
              onClick={onExploreEzhkar}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
            >
              Inspect EZHKAR Sandboxes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Ready to Orchestrate Your 200 AI Specialists?
            </h2>
            <p className="text-xs text-slate-300">
              Configure your A-to-Z creator profile in seconds. All business tasks run above Neural Core, shielded by 100 autonomous cybersecurity sentinels.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartStudio}
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg transition cursor-pointer"
              >
                Launch Creator Studio
              </button>
              <button
                onClick={onViewPricing}
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition cursor-pointer"
              >
                View Security Tiers
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
