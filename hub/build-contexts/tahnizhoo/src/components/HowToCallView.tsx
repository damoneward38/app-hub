import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Globe,
  Cpu,
  Radio,
  Activity,
  Lock,
  Sparkles,
  Copy,
  Check,
  Play,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  FileCode2,
  CheckCircle2,
} from 'lucide-react';
import {
  CALLING_MODALITIES,
  CallingModality,
  WEB_ROUTES_CATEGORIES,
  WebRouteGroup,
  PILLARS_METRICS,
} from '../services/pillarsData';

interface HowToCallViewProps {
  onNavigateToValuation?: () => void;
  onNavigateToDocs?: () => void;
  onNavigateToVault?: () => void;
}

export const HowToCallView: React.FC<HowToCallViewProps> = ({
  onNavigateToValuation,
  onNavigateToDocs,
  onNavigateToVault,
}) => {
  const [selectedModalityId, setSelectedModalityId] = useState<string>(CALLING_MODALITIES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [routeSearch, setRouteSearch] = useState('');
  const [activeRouteCategory, setActiveRouteCategory] = useState<string>('ALL');

  // Interactive Live Call Sandbox Simulator
  const [simulatedExecution, setSimulatedExecution] = useState<{
    isRunning: boolean;
    output: string | null;
  }>({ isRunning: false, output: null });

  const activeModality =
    CALLING_MODALITIES.find((m) => m.id === selectedModalityId) || CALLING_MODALITIES[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunSimulatedCall = (modality: CallingModality) => {
    setSimulatedExecution({ isRunning: true, output: null });
    setTimeout(() => {
      setSimulatedExecution({
        isRunning: false,
        output: `[NEURAL_CORE::EXECUTOR_DISPATCH]\nTarget Modality: ${modality.title}\nEnvironment: ${modality.executionEnvironment}\nStatus: 200 OK — Monotonic timestamp verified\n----------------------------------------\n${modality.sampleOutput}`,
      });
    }, 600);
  };

  // Filter routes
  const filteredRouteCategories = WEB_ROUTES_CATEGORIES.map((cat) => {
    if (activeRouteCategory !== 'ALL' && cat.category !== activeRouteCategory) {
      return { ...cat, sampleRoutes: [] };
    }
    if (!routeSearch) return cat;
    const q = routeSearch.toLowerCase();
    const matched = cat.sampleRoutes.filter(
      (r) =>
        r.path.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q)
    );
    return { ...cat, sampleRoutes: matched };
  }).filter((cat) => cat.sampleRoutes.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            Developer & Operator Caller Manual
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            All the Different Ways to Call and Use This Tool
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Neural Core provides <strong>8 distinct invocation modalities</strong> across CLI binaries, Python imports, 247 REST web routes, AI Model Context Protocol (MCP), offline wake-word speech, continuity schedulers, and crypto wallet APIs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToValuation && (
            <button
              onClick={onNavigateToValuation}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              Why It's Worth Millions
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onNavigateToDocs && (
            <button
              onClick={onNavigateToDocs}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              177 Docs Library
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">CALLING MODALITIES</span>
          <span className="text-xl font-bold text-cyan-400">8 Unified Interfaces</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">CLI BINARIES</span>
          <span className="text-xl font-bold text-indigo-400">15 CLI Commands</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">REST API WEB ROUTES</span>
          <span className="text-xl font-bold text-emerald-400">{PILLARS_METRICS.totalWebRoutes} Live Routes</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">TOTAL FUNCTIONS ACCESSIBLE</span>
          <span className="text-xl font-bold text-amber-400">{PILLARS_METRICS.totalFunctions.toLocaleString()} Functions</span>
        </div>
      </div>

      {/* Modality Selector Tabs */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Choose an Invocation Modality
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CALLING_MODALITIES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModalityId(mod.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedModalityId === mod.id
                  ? 'border-cyan-500/80 bg-cyan-950/40 shadow-lg shadow-cyan-950/30'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    selectedModalityId === mod.id
                      ? 'bg-cyan-900/80 text-cyan-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {mod.badge}
                </span>
                <div
                  className={`text-xs font-bold mt-1.5 ${
                    selectedModalityId === mod.id ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {mod.title.split('(')[0]}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                {mod.primaryLanguage}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Modality Detailed Guide Card */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {activeModality.badge}
              </span>
              <h3 className="text-xl font-bold text-white">{activeModality.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
              {activeModality.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Environment:</span>
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400">
              {activeModality.executionEnvironment}
            </span>
          </div>
        </div>

        {/* Code Snippet with Copy Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Exact Code & Invocation Recipe:
            </span>
            <button
              onClick={() => handleCopy(activeModality.id, activeModality.codeSnippet)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedId === activeModality.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Copied Recipe</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Recipe</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800/90 leading-relaxed">
            {activeModality.codeSnippet}
          </pre>
        </div>

        {/* Flags and Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-mono text-slate-400 uppercase text-[11px] block font-bold">
              Key Parameters & Flags Accepted:
            </span>
            <div className="space-y-2">
              {activeModality.flagsOrParams.map((param) => (
                <div key={param.name} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold">{param.name}</span>
                    <span className="text-slate-500">[{param.type}]</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{param.description}</div>
                  {param.defaultVal && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      default: <code className="text-slate-300">{param.defaultVal}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-mono text-slate-400 uppercase text-[11px] block font-bold">
              Key Capabilities Unlocked:
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {activeModality.keyCapabilitiesUnlocked.map((cap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-900">
              <button
                onClick={() => handleRunSimulatedCall(activeModality)}
                disabled={simulatedExecution.isRunning}
                className="w-full py-2 font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {simulatedExecution.isRunning ? 'Executing Call In Sandbox...' : 'Test Run This Calling Recipe'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Execution Output Telemetry */}
        {simulatedExecution.output && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/50 space-y-2 font-mono text-xs animate-in fade-in">
            <span className="text-[10px] text-emerald-400 block font-bold">
              SIMULATED EXECUTION RESPONSE (LOCAL OLLAMA / LOCALHOST BRIDGE):
            </span>
            <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed text-[11px]">
              {simulatedExecution.output}
            </pre>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* SECTION: 247 REST WEB ROUTES EXPLORER */}
      {/* ==================================================== */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              The 247 Production Web Routes & Webhook Endpoints
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Battle-tested HTTP endpoints organized across 6 core production functional domains.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                placeholder="Search 247 routes..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 w-52 sm:w-64"
              />
            </div>

            <select
              value={activeRouteCategory}
              onChange={(e) => setActiveRouteCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All 6 Route Domains</option>
              {WEB_ROUTES_CATEGORIES.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category.split('(')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Domain Cards */}
        <div className="space-y-4">
          {filteredRouteCategories.map((catGroup) => (
            <div
              key={catGroup.category}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-white text-xs">{catGroup.category}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {catGroup.routeCount} Endpoints Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{catGroup.description}</p>

              <div className="space-y-2">
                {catGroup.sampleRoutes.map((route, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            route.method === 'GET'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                              : route.method === 'POST'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                              : route.method === 'WS'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                          }`}
                        >
                          {route.method}
                        </span>
                        <span className="text-white font-bold">{route.path}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-sans font-normal">
                        {route.description}
                      </span>
                    </div>

                    <div className="pt-1.5 text-[11px] text-slate-400">
                      <span className="text-slate-500">Sample Response: </span>
                      <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">
                        {route.sampleResponse}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
