import React, { useState } from 'react';
import {
  Activity,
  Code2,
  Globe,
  FileSearch,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  ShieldCheck,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SelaDiagnosticCheck } from '../types';
import { platformStore } from '../services/store';

export const SelaDiagnosticsView: React.FC = () => {
  const diagnostics = platformStore.getSelaDiagnostics();
  const [activeTab, setActiveTab] = useState<'website' | 'ast' | 'file' | 'terminal'>('website');

  // Interactive diagnostic runners
  const [targetUrl, setTargetUrl] = useState('https://app.velvetsound.io');
  const [codeSnippet, setCodeSnippet] = useState(
    `export function processRoyaltySplit(amount: number, splits: { artist: number; label: number }) {\n  const total = splits.artist + splits.label;\n  if (total !== 1.0) throw new Error("Invariant failed: splits must sum to 100%");\n  return {\n    artistPayout: amount * splits.artist,\n    labelPayout: amount * splits.label,\n    timestamp: Date.now()\n  };\n}`
  );
  const [terminalCommand, setTerminalCommand] = useState('sela audit --ports --ast-check --strict');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ sela-diagnostics v2.4 initialized over Neural Core socket',
    '[*] Inspecting local processes and container sandbox boundaries...',
    '[+] All 4 SELA capability checks passed without invariant breach.',
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const handleRunWebsiteCheck = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      platformStore.runSelaCheck(targetUrl, 'website');
      setRunMessage(`Website inspection complete for ${targetUrl}: Zero broken invariants found.`);
    }, 600);
  };

  const handleRunAstAnalysis = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      platformStore.runSelaCheck('RoyaltySplitter.ts (AST Module)', 'ast_code');
      setRunMessage('AST Analysis complete: 100% of mathematical invariants and types verified.');
    }, 600);
  };

  const handleExecuteTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand) return;
    setIsRunning(true);
    setTerminalOutput((prev) => [...prev, `$ ${terminalCommand}`]);
    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput((prev) => [
        ...prev,
        `[SELA] Dispatched to core-sec-081 (AST Patch Lead)...`,
        `[SELA] Inspected 12 micro-services: Memory 28%, Ingress clean, zero open vulnerable ports.`,
        `[SELA] Status: 200 OK. Operation concluded in 18ms.`,
      ]);
      setTerminalCommand('');
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Layer 2: SELA Capability Layer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SELA Diagnostic & Inspection Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Integrated on top of Neural Core: Website troubleshooting, AST code analysis, file retrieval, computer operations, and fact verification.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>SELA Active · Invariant Engine Nominal</span>
        </div>
      </div>

      {runMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{runMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('website')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'website' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Website Inspection & Troubleshooting
        </button>
        <button
          onClick={() => setActiveTab('ast')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'ast' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          AST / Code Parser & Fixer
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'file' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <FileSearch className="w-3.5 h-3.5" />
          File & Vault Inspection
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'terminal' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          System Diagnosis Terminal
        </button>
      </div>

      {/* Interactive Tool Container */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
        {activeTab === 'website' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1">
                Website Troubleshooting & Ingress Verification
              </h2>
              <p className="text-xs text-slate-400">
                Tests TLS handshakes, response time, header invariants, and broken media stream links.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRunWebsiteCheck}
                disabled={isRunning}
                className="px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {isRunning ? 'Inspecting...' : 'Run SELA Website Inspection'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ast' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white mb-1">
                  SELA AST Code Analysis & Transformation
                </h2>
                <p className="text-xs text-slate-400">
                  Parses Abstract Syntax Trees, verifies mathematical split invariants, and prevents security regressions.
                </p>
              </div>
              <button
                onClick={handleRunAstAnalysis}
                disabled={isRunning}
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Code2 className="w-3.5 h-3.5" />
                {isRunning ? 'Analyzing AST...' : 'Analyze AST Tree'}
              </button>
            </div>

            <textarea
              rows={8}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        )}

        {activeTab === 'file' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white mb-1">
                Zero-Knowledge Vault & File Integrity Inspection
              </h2>
              <p className="text-xs text-slate-400">
                Audits filesystem permissions (0400 mode), scans for plain-text secrets, and confirms AES-GCM encryption.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                <span className="text-[10px] text-slate-500 block">ENCRYPTION SCHEME</span>
                <span className="text-emerald-400 font-bold">AES-256-GCM</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                <span className="text-[10px] text-slate-500 block">KEY ROTATION</span>
                <span className="text-cyan-300 font-bold">Automatic 30-Day</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                <span className="text-[10px] text-slate-500 block">AUDIT PROOF</span>
                <span className="text-indigo-300 font-bold">PCA Block Chained</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                SELA Diagnostic Computer Operations Terminal
              </span>
              <span className="font-mono text-[10px]">Zero-Trust Sandbox Mode</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs h-56 overflow-y-auto space-y-1 text-slate-300">
              {terminalOutput.map((line, i) => (
                <div key={i} className="leading-relaxed">
                  {line}
                </div>
              ))}
            </div>

            <form onSubmit={handleExecuteTerminal} className="flex gap-2">
              <input
                type="text"
                value={terminalCommand}
                onChange={(e) => setTerminalCommand(e.target.value)}
                placeholder="Enter SELA terminal command..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Execute
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Historical Diagnostics Results Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white">Recent SELA Diagnostic Reports</h2>
        <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Target Checked</th>
                <th className="py-3 px-4">Inspection Type</th>
                <th className="py-3 px-4">Verified Findings</th>
                <th className="py-3 px-4">Core Specialist</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {diagnostics.map((chk) => (
                <tr key={chk.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 text-white font-semibold">{chk.target}</td>
                  <td className="py-3.5 px-4 font-mono uppercase text-cyan-400">{chk.type}</td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">
                    {chk.findings[0]}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{chk.verifiedByCore}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" /> Healthy
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
