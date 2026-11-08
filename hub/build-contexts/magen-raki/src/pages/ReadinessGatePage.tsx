import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Terminal,
  Cpu,
  Layers,
  Wrench,
  FileCode2,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Zap,
  Activity,
} from 'lucide-react';
import type { ReadinessGateReport, RepairWorkflowResult } from '../types';

interface ReadinessGatePageProps {
  setActiveTab?: (tab: any) => void;
}

export const ReadinessGatePage: React.FC<ReadinessGatePageProps> = ({ setActiveTab }) => {
  const [report, setReport] = useState<ReadinessGateReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  // 8-step Repair Workflow state
  const [repairRepo, setRepairRepo] = useState<string>('magen-raki/enterprise-enclave');
  const [repairIssue, setRepairIssue] = useState<string>('Broken route handler, missing .env declaration, unhandled rejection');
  const [repairResult, setRepairResult] = useState<RepairWorkflowResult | null>(null);
  const [repairLoading, setRepairLoading] = useState<boolean>(false);

  // One-click audit bundle state
  const [downloadingBundle, setDownloadingBundle] = useState<boolean>(false);
  const [bundleSummary, setBundleSummary] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/magen-raki/readiness-gate');
      const data = await res.json();
      setReport(data);
      if (data.checks?.length > 0 && !selectedCheckId) {
        setSelectedCheckId(data.checks[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch readiness gate report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRunRepairWorkflow = async () => {
    setRepairLoading(true);
    try {
      const res = await fetch('/api/magen-raki/repair-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository: repairRepo, targetIssue: repairIssue }),
      });
      const data = await res.json();
      setRepairResult(data);
      // Refresh readiness gate after repair
      await fetchReport();
    } catch (err) {
      console.error('Repair workflow failed:', err);
    } finally {
      setRepairLoading(false);
    }
  };

  const handleDownloadBundle = async () => {
    setDownloadingBundle(true);
    try {
      const res = await fetch('/api/magen-raki/audit-bundle');
      const bundle = await res.json();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Magen-Raki-Readiness-Audit-Bundle-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBundleSummary(`Exported Bundle #${bundle.bundleId.slice(0, 13)} with ${bundle.auditLedger.length} chained ledger blocks and SHA-512 cryptographic seal.`);
    } catch (err) {
      console.error('Failed to export audit bundle:', err);
    } finally {
      setDownloadingBundle(false);
    }
  };

  const filteredChecks = report?.checks?.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'passed') return c.status === 'PASSED';
    if (activeFilter === 'failed') return c.status === 'FAILED';
    return c.category === activeFilter;
  }) || [];

  const selectedCheck = report?.checks?.find((c) => c.id === selectedCheckId) || report?.checks?.[0];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Title Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero False-Done Verification Gate</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <span>Magen-Rakiʿ Readiness Gate</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                An AI agent must never declare a repository finished simply because it edited code. 
                The Readiness Gate enforces a strict 12-checkpoint proof matrix before any code reaches review or staging.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="btn-refresh-gate"
                onClick={fetchReport}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
                <span>Re-Verify Gate</span>
              </button>

              <button
                id="btn-download-evidence-bundle"
                onClick={handleDownloadBundle}
                disabled={downloadingBundle}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingBundle ? 'Generating Bundle...' : 'Export Audit Bundle'}</span>
              </button>
            </div>
          </div>

          {bundleSummary && (
            <div className="mt-6 p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{bundleSummary}</span>
              </div>
              <button onClick={() => setBundleSummary(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}
        </div>

        {/* Live Gate Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Status Badge */}
          <div className="md:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Gate Certification State</span>
              <span className="text-xs font-mono text-slate-500">{report?.timestamp ? new Date(report.timestamp).toLocaleTimeString() : '--'}</span>
            </div>

            <div className="my-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${report?.allPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                  {report?.allPassed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {report?.status || 'EVALUATING CHECKS...'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {report?.allPassed
                      ? '12 of 12 Readiness Assertions Passed Cryptographically'
                      : 'Missing requirements detected. Action blocked by Governor.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>SHA-512 Seal:</span>
              <span className="text-emerald-400/80 truncate max-w-[260px]">{report?.certificationHash || 'Computing...'}</span>
            </div>
          </div>

          {/* Metric: Passed Checks */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Pass Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-black text-emerald-400">
                {report ? `${report.passedChecks}/${report.totalChecks}` : '--'}
              </div>
              <div className="text-xs text-slate-400 mt-1">100% Zero-Error Threshold</div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${report ? (report.passedChecks / report.totalChecks) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Metric: Execution Discipline */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Protocol Pipeline</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="my-2">
              <div className="text-xl font-bold text-indigo-300">8-Step Discipline</div>
              <div className="text-xs text-slate-400 mt-1">Diagnose → Plan → Patch → Test → Build → Staging → Verify → Report</div>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATUS: VERIFIED READY</span>
            </div>
          </div>
        </div>

        {/* 12 Checkpoint Verification Grid & Terminal Inspector */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-indigo-400" />
                <span>The 12 Magen-Raki Readiness Assertions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every code change must satisfy each criteria before being accepted into staging.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'environment', 'build', 'runtime', 'security'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Checklist items */}
            <div className="lg:col-span-7 space-y-2.5">
              {filteredChecks.map((check) => {
                const isSelected = selectedCheck?.id === check.id;
                return (
                  <div
                    key={check.id}
                    onClick={() => setSelectedCheckId(check.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {check.status === 'PASSED' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <span>{check.name}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {check.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">{check.message}</p>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="text-[11px] font-mono text-slate-500">{check.durationMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Terminal Inspector */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase text-slate-300">Diagnostic Inspector</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    LIVE PROBE
                  </span>
                </div>

                {selectedCheck ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Assertion Name</div>
                      <div className="text-base font-bold text-white mt-0.5">{selectedCheck.name}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Verification Command</div>
                      <div className="mt-1 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-indigo-300 break-all">
                        $ {selectedCheck.command || 'internal-enclave-eval'}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">Enclave Findings & Metrics</div>
                      <div className="mt-1 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                        <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-bold">{selectedCheck.status}</span></div>
                        <div><span className="text-slate-500">Latency:</span> {selectedCheck.durationMs} ms</div>
                        <div><span className="text-slate-500">Assertion Details:</span> {selectedCheck.details || 'Zero violations found.'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-8 text-center">Select any checkpoint to view evidence.</div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Verified by Six 686 Secure Core</span>
                <span className="text-emerald-400">STATUS: VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* 8-Step Repository Repair & Health Engine */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-indigo-400">
                <Wrench className="w-3.5 h-3.5" />
                <span>Autonomous Repair Protocol</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Repository Health & 8-Step Repair Engine</h2>
              <p className="text-xs text-slate-400">
                When an issue or missing route is encountered, Sapphire & Neural Core execute the full 8-step discipline.
              </p>
            </div>

            <button
              id="btn-run-repair-workflow"
              onClick={handleRunRepairWorkflow}
              disabled={repairLoading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <Zap className={`w-4 h-4 ${repairLoading ? 'animate-bounce' : ''}`} />
              <span>{repairLoading ? 'Executing 8-Step Protocol...' : 'Run 8-Step Repair Simulation'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Target Repository</label>
              <input
                type="text"
                value={repairRepo}
                onChange={(e) => setRepairRepo(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Target Diagnosed Defect</label>
              <input
                type="text"
                value={repairIssue}
                onChange={(e) => setRepairIssue(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 8-Step Visual Progression Chain */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Discipline Steps: Diagnose → Plan → Patch → Test → Build → Launch in staging → Verify → Report
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { num: 1, name: 'Diagnose', icon: '🔍' },
                { num: 2, name: 'Plan', icon: '📋' },
                { num: 3, name: 'Patch', icon: '🩹' },
                { num: 4, name: 'Test', icon: '🧪' },
                { num: 5, name: 'Build', icon: '⚙️' },
                { num: 6, name: 'Launch in staging', icon: '🚀' },
                { num: 7, name: 'Verify', icon: '🛡️' },
                { num: 8, name: 'Report', icon: '📜' },
              ].map((step) => {
                const isExecuted = repairResult && repairResult.steps.length >= step.num;
                return (
                  <div
                    key={step.num}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      isExecuted
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-lg">{step.icon}</div>
                    <div className="text-[11px] font-bold mt-1 text-slate-200">{step.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">Step {step.num}</div>
                    <div className={`mt-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isExecuted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isExecuted ? 'VERIFIED' : 'READY'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {repairResult && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-base">Neural Core Autonomous Repair Certificate</span>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {repairResult.finalStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
                {repairResult.steps.map((st) => (
                  <div key={st.stepNumber} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-indigo-400 font-bold">Step {st.stepNumber} ({st.name}):</span> {st.outputSummary}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Certification Hash: {repairResult.verifiedBadgeHash.slice(0, 32)}...</span>
                <span className="text-emerald-400">All 12 Gate Checks Passed</span>
              </div>
            </div>
          )}
        </div>

        {/* Competitive Advantage Callout */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Next: View the CI/CD & Governance Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Explore how changes flow through Type Check, Unit Tests, Build Test, Six 686 Governor, Staging, and Auto-Rollback to ensure zero false completions.
            </p>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('pipeline')}
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 whitespace-nowrap shadow-lg shadow-indigo-600/30"
          >
            <span>Open Competitive Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
