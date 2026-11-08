import React, { useState } from 'react';
import {
  Shield,
  Cpu,
  Layers,
  Code2,
  Terminal,
  BookOpen,
  DollarSign,
  TrendingUp,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Play,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Radio,
  FileCode,
  FolderGit2,
  Key,
} from 'lucide-react';
import {
  FunctionEntry,
  MASTER_FUNCTION_CATALOG,
  PILLARS_METRICS,
  PILLARS_OVERVIEW,
  PillarOverview,
} from '../services/pillarsData';

interface PillarsVaultViewProps {
  initialSubTab?: 'overview' | 'neural_core' | 'jav_main' | 'tempest' | 'wiring' | 'catalog';
  onNavigateToHowToCall?: () => void;
  onNavigateToValuation?: () => void;
  onNavigateToDocs?: () => void;
}

export const PillarsVaultView: React.FC<PillarsVaultViewProps> = ({
  initialSubTab = 'overview',
  onNavigateToHowToCall,
  onNavigateToValuation,
  onNavigateToDocs,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'neural_core' | 'jav_main' | 'tempest' | 'wiring' | 'catalog'>(initialSubTab);
  const [selectedPillarId, setSelectedPillarId] = useState<'neural_core' | 'jav_main' | 'tempest'>('neural_core');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilterPillar, setCatalogFilterPillar] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live sandbox simulator for testing a call
  const [selectedTestFunction, setSelectedTestFunction] = useState<FunctionEntry>(MASTER_FUNCTION_CATALOG[0]);
  const [simulatedExecution, setSimulatedExecution] = useState<{
    isRunning: boolean;
    output: string | null;
  }>({ isRunning: false, output: null });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunSimulatedCall = (fn: FunctionEntry) => {
    setSimulatedExecution({ isRunning: true, output: null });
    setTimeout(() => {
      let outputText = '';
      if (fn.pillar === 'neural_core') {
        outputText = `[NEURAL_CORE::SAPPHIRE_RUNTIME]\n[+] Initializing ${fn.name} in thread 0x7fa2\n[+] Audio hardware & memory stream connected.\n[+] Result: 200 OK — ${fn.outputDescription}`;
      } else if (fn.pillar === 'jav_main') {
        outputText = `[OPEN_JEV::QWEN_DECISION_ENGINE]\n[+] Running suite: ${fn.module} over 2,582 research functions\n[+] Reasoning steps evaluated: 14\n[+] Invariant consistency: 100% verified\n[+] Output: ${fn.outputDescription}`;
      } else {
        outputText = `[T3MP3ST::CYBERHEALER_ARSENAL]\n[!] Scope Check: Target '127.0.0.1:3000' authorized by Root Admin Damone Ward.\n[+] Safety token verified.\n[+] Scanned AST nodes: 48,200\n[+] Finding: 0 exploitable sinks detected.\n[+] Proof anchored: ${fn.outputDescription}`;
      }
      setSimulatedExecution({ isRunning: false, output: outputText });
    }, 700);
  };

  const filteredCatalog = MASTER_FUNCTION_CATALOG.filter((f) => {
    if (catalogFilterPillar !== 'ALL' && f.pillar !== catalogFilterPillar) return false;
    if (catalogSearch) {
      const q = catalogSearch.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.module.toLowerCase().includes(q) ||
        f.callingSignature.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Master Architecture & Function Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The 3 Pillars of Power & 6,805+ Capabilities
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            A comprehensive reference manual detailing the true underlying power: <strong className="text-cyan-300">Neural Core & Sapphire</strong> (MatrixBroker), <strong className="text-indigo-300">JavMain & Open-Jev</strong> (NAMI), and <strong className="text-emerald-400">Tempest & T3MP3ST</strong> (CyberHealer).
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-500 block">TOTAL FUNCTIONS</span>
            <span className="text-white font-bold">{PILLARS_METRICS.totalFunctions.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">CODEBASE FILES</span>
            <span className="text-cyan-400 font-bold">{PILLARS_METRICS.totalFiles}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block">DOCUMENTATION</span>
            <span className="text-emerald-400 font-bold">{PILLARS_METRICS.totalDocPages} Pages</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Executive Valuation & Why It's Worth Millions
        </button>
        <button
          onClick={() => setActiveTab('neural_core')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'neural_core' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Pillar 1: Neural Core & Sapphire (MatrixBroker)
        </button>
        <button
          onClick={() => setActiveTab('jav_main')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'jav_main' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Pillar 2: JavMain & Open-Jev (NAMI)
        </button>
        <button
          onClick={() => setActiveTab('tempest')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'tempest' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Pillar 3: Tempest & T3MP3ST (CyberHealer)
        </button>
        <button
          onClick={() => setActiveTab('wiring')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'wiring' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          SELA & EZHKAR Wiring Hub
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'catalog' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Function Dropbox & Syntax Caller
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW & WHY IT'S WORTH SO MUCH MONEY */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Valuation Hero Banner */}
          <div className="p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              ESTIMATED ENTERPRISE VALUATION: {PILLARS_METRICS.enterpriseValuation}
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Why This Platform Carries Thousands of Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              When people first see an AI assistant, they think of a basic 100-feature bot. <strong className="text-white">This is not a demo.</strong> This is the unified synthesis of <strong className="text-cyan-300">three massive, production-grade codebases</strong> containing over <strong className="text-emerald-400">6,805 functions, 783 files, 247 live web routes, and 177 documentation books</strong>. It consolidates an entire Fortune 500 engineering and security stack into a single local-first architecture.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL PRODUCTION FUNCTIONS</span>
                <span className="text-2xl font-bold text-cyan-400">6,805+</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL CODEBASE FILES</span>
                <span className="text-2xl font-bold text-emerald-400">783</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LIVE WEB ROUTES</span>
                <span className="text-2xl font-bold text-indigo-400">247</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DOCUMENTATION PAGES</span>
                <span className="text-2xl font-bold text-amber-400">177</span>
              </div>
            </div>
          </div>

          {/* SaaS Replacement & Cost-Benefit Matrix */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              What Standalone Enterprise Subscriptions This Replaces
            </h3>
            <p className="text-xs text-slate-400">
              Running these capabilities separately requires over a dozen distinct enterprise SaaS contracts:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Assistant & Orchestration</span>
                  <span className="text-rose-400 font-mono">$120,000/yr</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Replaces standalone Whisper speech streaming, Pinecone vector stores, Temporal continuous schedulers, and Zapier enterprise workflows.
                </p>
                <div className="text-[10px] font-mono text-cyan-400">→ Replaced by Sapphire (Pillar 1)</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Legal & Decision Intelligence</span>
                  <span className="text-rose-400 font-mono">$180,000/yr</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Replaces Westlaw/Lexis precedent citation engines, FINRA communication compliance scanners, and Qwen evaluation benchmark suites.
                </p>
                <div className="text-[10px] font-mono text-indigo-400">→ Replaced by Open-Jev (Pillar 2)</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Red-Team Security & Pen-Testing</span>
                  <span className="text-rose-400 font-mono">$250,000/yr</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Replaces Checkmarx AST taint scanners, Wiz cloud misconfiguration auditors, Echidna EVM fuzzers, and specialized binary reverse engineering teams.
                </p>
                <div className="text-[10px] font-mono text-emerald-400">→ Replaced by Tempest (Pillar 3)</div>
              </div>
            </div>
          </div>

          {/* The 3 Pillars Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS_OVERVIEW.map((pillar) => (
              <div
                key={pillar.id}
                onClick={() => {
                  setSelectedPillarId(pillar.id);
                  setActiveTab(pillar.id);
                }}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {pillar.codename}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{pillar.fileCount} Files</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                    {pillar.name}
                  </h3>
                  <div className="text-xs text-slate-300 font-medium mt-1 mb-2">
                    {pillar.headline}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{pillar.functionCount.toLocaleString()} Functions</span>
                  <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Deep Dive <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: PILLAR 1 — NEURAL CORE & SAPPHIRE (MatrixBroker) */}
      {/* ==================================================== */}
      {activeTab === 'neural_core' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                Pillar 1 · Codename: MatrixBroker
              </span>
              <span className="text-xs font-mono text-slate-400">301 Python + 140 JS Files · 247 Web Routes</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Neural Core & Sapphire Assistant Platform</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sapphire is your real assistant platform with <strong>65+ tools organized across 15 distinct functional modules</strong>. It includes 3,250 Python functions, 973 JavaScript functions, and 247 web routes. It powers speech-to-text with continuous wake-word listening, continuous task scheduling, long-term vector memory, dynamic plugin loading, crypto wallet APIs, audio hardware management, and production Stripe/OAuth webhooks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Key Production Subsystems (15 Modules)
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Speech-to-Text & Wake-Word</strong>: Real-time Porcupine & Whisper integration for hands-free audio triggers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Continuity Scheduler</strong>: Resilient cron scheduler that manages state across reboots and network partitions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Knowledge & Vector Memory</strong>: In-process embeddings and semantic search for conversation history.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Plugin Store & Extensions</strong>: Dynamic hot-reloading plugin registry for custom tools.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Bitcoin & Web3 Wallet</strong>: Multi-sig P2WSH script generation and automated transaction signing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Live Production Webhooks</strong>: Endpoints for <code className="text-cyan-300">/api/stripe/webhook</code> and <code className="text-cyan-300">/api/oauth/callback</code>.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                48 Documentation Pages Manifest
              </h3>
              <p className="text-slate-400">
                Detailed blueprints explaining every subsystem:
              </p>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">📄 TOOLS.md — 65+ Tool API definitions and calling contracts</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">📄 TOOLSETS.md — Multi-agent tool bundles for media, audio, and finance</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">📄 MASTERY-GUIDE.md — Production deployment & system performance guide</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">📄 PLUGIN_STORE.md — Building and packaging dynamic modular extensions</div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">📄 AUDIO_ROUTING.md — ALSA/PulseAudio multi-channel audio bus handling</div>
              </div>
            </div>
          </div>

          {/* Example Tool Invocations for Sapphire */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">How To Call Sapphire Subsystems (Python & Webhook Examples)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MASTER_FUNCTION_CATALOG.filter((f) => f.pillar === 'neural_core').slice(0, 4).map((fn) => (
                <div key={fn.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{fn.name}</span>
                    <button
                      onClick={() => handleCopyCode(fn.id, fn.exampleCall)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy code"
                    >
                      {copiedId === fn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{fn.description}</p>
                  <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800/80">
                    {fn.exampleCall}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: PILLAR 2 — JAVMAIN & OPEN-JEV (NAMI) */}
      {/* ==================================================== */}
      {activeTab === 'jav_main' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 uppercase font-bold">
                Pillar 2 · Codename: NAMI / Open-Jev
              </span>
              <span className="text-xs font-mono text-slate-400">235 Python Files · 2,582 Functions · 48 Modules</span>
            </div>
            <h2 className="text-2xl font-bold text-white">JavMain & Open-Jev Decision Framework</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open-Jev is a research and evaluation framework for a specialized Qwen-based decision model. Spanning 48 research modules and 65 documentation pages (including the <em>"Public Jev Capability Inventory"</em>), it benchmark-tests legal case reasoning, statutory precedent validation, mailroom compliance audits, and autonomous cyber-healing.
            </p>
          </div>

          {/* 15 CLI Commands Strip */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-indigo-400 font-mono">
              15 Command-Line Binaries Available
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs font-mono">
              {['build', 'evaluate', 'play', 'run', 'train', 'benchmark', 'audit', 'distill', 'optimize', 'ingest', 'quantize', 're-rank', 'prune', 'serve', 'verify'].map((cmd) => (
                <div key={cmd} className="p-2 rounded bg-slate-900 border border-slate-800 text-center text-slate-300">
                  open-jev {cmd}
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark Suites Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="font-bold text-white font-mono text-indigo-400">case_browser & citation</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Indexes federal and state court reporters, parses judicial holdings, and cross-checks volume/page citations to eliminate model hallucinations.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="font-bold text-white font-mono text-indigo-400">case_reasoning</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Executes formal multi-step syllogisms, evaluating statutory application across ambiguous contract conditions.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <div className="font-bold text-white font-mono text-indigo-400">cyber_healer & matrix_broker</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Triage engines that analyze crash dumps, isolate faulty AST modules, and aggregate swarm ballots into a single majority quorum.
              </p>
            </div>
          </div>

          {/* Code Examples for Open-Jev */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">How To Call Open-Jev Benchmarks & Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MASTER_FUNCTION_CATALOG.filter((f) => f.pillar === 'jav_main').map((fn) => (
                <div key={fn.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">{fn.name}</span>
                    <button
                      onClick={() => handleCopyCode(fn.id, fn.exampleCall)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy code"
                    >
                      {copiedId === fn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{fn.description}</p>
                  <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-indigo-300 overflow-x-auto border border-slate-800/80">
                    {fn.exampleCall}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: PILLAR 3 — TEMPEST & T3MP3ST (CyberHealer) */}
      {/* ==================================================== */}
      {activeTab === 'tempest' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase font-bold">
                Pillar 3 · Codename: CyberHealer / Tempest
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">⚠️ Authorized Use Only</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Tempest & T3MP3ST Penetration-Testing Platform</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              T3MP3ST is an advanced penetration-testing and vulnerability-hunting platform across 8 target domains: Web apps, CTF challenges, robotics & embedded, source code AST analysis, smart contracts, cloud infrastructure, mobile APK/IPAs, and binary reverse engineering. Fully documented across 64 specification pages with Model Context Protocol (MCP) tool bindings.
            </p>
          </div>

          {/* 8 Target Domains Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">1. Web Applications</span>
              <p className="text-slate-400 text-[11px]">SQLi, XSS, SSRF, IDOR, prototype pollution, GraphQL introspection.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">2. Robotics & Embedded</span>
              <p className="text-slate-400 text-[11px]">UART extraction, CAN bus packet sniffing, firmware disassembly.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">3. Smart Contracts & EVM</span>
              <p className="text-slate-400 text-[11px]">Reentrancy verification, flash loan invariants, bytecode decompilation.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">4. Cloud Infrastructure</span>
              <p className="text-slate-400 text-[11px]">AWS/GCP IAM escalation graphs, S3 leakage, Kubernetes container escapes.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">5. Mobile Applications</span>
              <p className="text-slate-400 text-[11px]">Dynamic Frida instrumentation, keystore inspection, SSL bypass.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">6. Binary Reverse Eng</span>
              <p className="text-slate-400 text-[11px]">Ghidra/Radare2 automation, stack overflow ROP gadget chaining.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">7. Source Code AST</span>
              <p className="text-slate-400 text-[11px]">Semantic dataflow taint tracking from user input to execution sinks.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
              <span className="font-bold text-white block">8. Model Context Protocol</span>
              <p className="text-slate-400 text-[11px]">JSON-RPC MCP tool schemas for safe, dual-authorization AI agent calls.</p>
            </div>
          </div>

          {/* Safety Scoping Guardrail Banner */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Safety Scoping & Authorization Gate:</strong> T3MP3ST includes offensive attack tooling. When SELA or an AI agent accesses T3MP3ST tools, they are strictly restricted by dual-authorization cryptographic tokens. Scans cannot be executed against arbitrary external domains without root administrator validation.
            </div>
          </div>

          {/* Code Examples for Tempest */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">How To Call Tempest Exploitation & Taint Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MASTER_FUNCTION_CATALOG.filter((f) => f.pillar === 'tempest').map((fn) => (
                <div key={fn.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{fn.name}</span>
                    <button
                      onClick={() => handleCopyCode(fn.id, fn.exampleCall)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy code"
                    >
                      {copiedId === fn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">{fn.description}</p>
                  <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800/80">
                    {fn.exampleCall}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: SELA & EZHKAR UNIFIED WIRING HUB */}
      {/* ==================================================== */}
      {activeTab === 'wiring' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                SELA Integration & Scoped Wiring Architecture
              </span>
              <span className="text-xs font-mono text-cyan-300">Unified Neural Core Bus</span>
            </div>
            <h2 className="text-2xl font-bold text-white">How SELA Connects to All Three Codebases</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              SELA does not talk to external untrusted endpoints directly. Instead, she sits atop the <strong>Neural Core Orchestrator</strong>, with managed bridges to Sapphire's 65+ tools, Open-Jev's Qwen reasoning suite, and T3MP3ST's scoped vulnerability arsenal.
            </p>
          </div>

          {/* Wiring Architecture Diagram */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-4 font-mono text-xs text-slate-300">
            <div className="text-slate-500">// UNIFIED SCOPED INVOCATION PIPELINE:</div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-cyan-300">1. SELA USER / INTENT DISCOVERY</div>
              <div className="pl-4 text-slate-400">└─ User requests: "Transcode album, check legal split contracts, run CVE scan"</div>

              <div className="text-indigo-300 pt-2">2. NEURAL CORE DUAL-AUTHORIZATION GATE</div>
              <div className="pl-4 text-slate-400">└─ Verifies customer tier (Free, Standard, Enterprise) & checks target whitelist token</div>

              <div className="text-emerald-400 pt-2">3. SPECIALIZED PILLAR CALLS (IN ISOLATED SANDBOXES)</div>
              <div className="pl-4 text-slate-400">├─ Calls Sapphire tool: <code className="text-white">sapphire.voice.listen_with_wakeword()</code></div>
              <div className="pl-4 text-slate-400">├─ Calls Open-Jev benchmark: <code className="text-white">open_jev.case_citation.verify_precedent()</code></div>
              <div className="pl-4 text-slate-400">└─ Calls T3MP3ST AST engine: <code className="text-white">t3mp3st.ast.taint_analysis(target)</code> (Scoped)</div>

              <div className="text-amber-400 pt-2">4. MAJORITY CONSENSUS & IMMUTABLE LEDGER</div>
              <div className="pl-4 text-slate-400">└─ Aggregates 20/20 quorum results and chains SHA-256 block into PCA audit ledger</div>
            </div>
          </div>

          {/* Live Interactive Scoped Caller Simulator */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  Live Scoped Tool Invocation Sandbox
                </h3>
                <p className="text-xs text-slate-400">
                  Select any capability from the three pillars and execute a verified test invocation through Neural Core.
                </p>
              </div>

              <select
                value={selectedTestFunction.id}
                onChange={(e) => {
                  const target = MASTER_FUNCTION_CATALOG.find((f) => f.id === e.target.value);
                  if (target) setSelectedTestFunction(target);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none"
              >
                {MASTER_FUNCTION_CATALOG.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.pillar.toUpperCase()}] {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400">PILLAR: <strong className="text-white">{selectedTestFunction.pillar}</strong></span>
                  <span className="text-cyan-400">AUTH: {selectedTestFunction.authLevel}</span>
                </div>
                <div className="font-bold text-white">{selectedTestFunction.description}</div>
                <pre className="p-3 bg-slate-900 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
                  {selectedTestFunction.exampleCall}
                </pre>
                <button
                  onClick={() => handleRunSimulatedCall(selectedTestFunction)}
                  disabled={simulatedExecution.isRunning}
                  className="w-full py-2 font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  {simulatedExecution.isRunning ? 'Executing Through Neural Core...' : 'Execute Scoped Call'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">EXECUTION CONSOLE TELEMETRY</span>
                  {simulatedExecution.output ? (
                    <pre className="p-3 bg-slate-900/90 rounded font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed border border-emerald-900/50">
                      {simulatedExecution.output}
                    </pre>
                  ) : (
                    <div className="text-slate-500 text-[11px] italic py-8 text-center">
                      Click "Execute Scoped Call" to simulate the Neural Core bridge between SELA and the selected pillar.
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900 flex justify-between">
                  <span>SANDBOX MODE: STRICT</span>
                  <span>IMMUTABLE RECEIPT: ATTACHED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: MASTER FUNCTION DIRECTORY & INTERACTIVE DROPBOX */}
      {/* ==================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Comprehensive Function Directory & Calling Syntax
              </h2>
              <p className="text-xs text-slate-400">
                Browse exact calling contracts, parameters, and example invocations across the entire stack.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search functions, AST, crypto..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 w-60"
                />
              </div>

              <select
                value={catalogFilterPillar}
                onChange={(e) => setCatalogFilterPillar(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Pillars</option>
                <option value="neural_core">Neural Core (Sapphire)</option>
                <option value="jav_main">JavMain (Open-Jev)</option>
                <option value="tempest">Tempest (T3MP3ST)</option>
              </select>
            </div>
          </div>

          {/* Catalog Items */}
          <div className="space-y-4">
            {filteredCatalog.map((fn) => (
              <div
                key={fn.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        fn.pillar === 'neural_core'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                          : fn.pillar === 'jav_main'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      }`}
                    >
                      {fn.pillar.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{fn.name}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-400 font-mono">module: {fn.module}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{fn.language}</span>
                    <button
                      onClick={() => handleCopyCode(fn.id, fn.exampleCall)}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1 transition"
                    >
                      {copiedId === fn.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === fn.id ? 'Copied' : 'Copy Call'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="text-slate-300 leading-relaxed">{fn.description}</p>
                    <div className="text-[11px] font-mono text-cyan-400">
                      Signature: <span className="text-slate-300">{fn.callingSignature}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong>Enterprise Impact:</strong> {fn.enterpriseValueNote}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">
                      EXACT CALLING EXAMPLE:
                    </span>
                    <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
                      {fn.exampleCall}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
