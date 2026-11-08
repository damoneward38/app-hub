import React, { useState } from 'react';
import {
  Activity,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { OperatingStage } from '../types';
import { platformStore } from '../services/store';

export const NeuralCoreConsoleView: React.FC = () => {
  const [activeCycle, setActiveCycle] = useState(false);
  const [currentStage, setCurrentStage] = useState<OperatingStage>('REPORT');
  const [injectFailure, setInjectFailure] = useState(false);
  const [repairTriggered, setRepairTriggered] = useState(false);
  const [cycleLogs, setCycleLogs] = useState<{ timestamp: string; stage: OperatingStage; message: string; level: string }[]>([
    { timestamp: '18:10:01', stage: 'UNDERSTAND', message: 'Neural Core: Ingested media business blueprint for AuraStream Media', level: 'stage' },
    { timestamp: '18:10:15', stage: 'PLAN', message: 'Neural Core: Assembled 6-step closed-loop DAG with SELA AST verification', level: 'stage' },
    { timestamp: '18:10:30', stage: 'FIND', message: '50 Cybersecurity Finding Cores (Groups A & B): Located zero CVEs', level: 'stage' },
    { timestamp: '18:10:48', stage: 'EXECUTE', message: 'EZHKAR Sandboxes: Group F (Transcoding) and Group H (DRM) completed execution', level: 'stage' },
    { timestamp: '18:11:55', stage: 'VERIFY', message: 'EZHKAR Swarm: Majority consensus achieved (20/20 agreed)', level: 'success' },
    { timestamp: '18:12:45', stage: 'REPORT', message: 'Signed with SHA-256 block into PCA Immutable Ledger', level: 'success' },
  ]);

  const stages: { stage: OperatingStage; label: string; desc: string; coreLead: string }[] = [
    { stage: 'UNDERSTAND', label: '1. Understand', desc: 'Ingest intent, contracts, and business parameters', coreLead: 'Neural Core Supervisor' },
    { stage: 'PLAN', label: '2. Plan', desc: 'Synthesize closed-loop DAG and dependency graph', coreLead: 'Neural Core Orchestrator' },
    { stage: 'FIND', label: '3. Find / Detect', desc: 'Hunt CVEs, attack surfaces, and business bottlenecks', coreLead: '50 Cybersecurity Finding Cores (A/B)' },
    { stage: 'FACT', label: '4. Fact & SELA', desc: 'Verify code AST invariants and network endpoints', coreLead: 'SELA Diagnostic Layer' },
    { stage: 'DELEGATE', label: '5. Delegate', desc: 'Dispatch tasks to 20-agent parallel cohorts', coreLead: 'Neural Core Dispatcher' },
    { stage: 'EXECUTE', label: '6. Execute', desc: 'Run within isolated micro-VM sandboxes', coreLead: 'Assigned Business & Security Cores' },
    { stage: 'OBSERVE', label: '7. Observe', desc: 'Real-time telemetry, memory, and packet checks', coreLead: 'SELA Observer' },
    { stage: 'VERIFY', label: '8. Verify', desc: '20-agent cryptographic majority voting quorum', coreLead: 'EZHKAR Consensus Quorum' },
    { stage: 'REPAIR', label: '9. Repair / Fix', desc: 'Autonomous AST hotfix & sandbox quarantine', coreLead: '50 Cybersecurity Fixer Cores (C/D/E)' },
    { stage: 'VERIFY_AGAIN', label: '10. Re-Verify', desc: 'Re-evaluates repaired state before release', coreLead: 'EZHKAR Verification Quorum' },
    { stage: 'REPORT', label: '11. Report', desc: 'Anchored into immutable SHA-256 PCA ledger', coreLead: 'Cryptographic Merkle Chainer' },
  ];

  const handleRunClosedLoop = () => {
    setActiveCycle(true);
    setRepairTriggered(false);
    setCycleLogs([]);

    const sequence: OperatingStage[] = injectFailure
      ? ['UNDERSTAND', 'PLAN', 'FIND', 'FACT', 'DELEGATE', 'EXECUTE', 'OBSERVE', 'VERIFY', 'REPAIR', 'VERIFY_AGAIN', 'REPORT']
      : ['UNDERSTAND', 'PLAN', 'FIND', 'FACT', 'DELEGATE', 'EXECUTE', 'OBSERVE', 'VERIFY', 'REPORT'];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < sequence.length) {
        const st = sequence[idx];
        setCurrentStage(st);

        let msg = `Neural Core phase [${st}] completed nominal assertion.`;
        let lvl = 'stage';

        if (st === 'UNDERSTAND') msg = 'Neural Core: Ingested creator stems, royalty rules, and egress boundaries.';
        if (st === 'PLAN') msg = 'Neural Core: Generated DAG across Groups F, H, and Security Sentinels.';
        if (st === 'FIND') msg = 'Finding Cores (Groups A & B): Completed automated CVE and WAF port sweep.';
        if (st === 'FACT') msg = 'SELA Diagnostic: Verified AST invariants and SSL certificates.';
        if (st === 'EXECUTE') msg = 'EZHKAR Sandbox: Media transcoding & DRM cryptographic sealing running.';
        if (st === 'VERIFY' && injectFailure) {
          msg = 'VERIFICATION FAILED: AST detected memory buffer variance. Triggering REPAIR loopback!';
          lvl = 'warn';
          setRepairTriggered(true);
        } else if (st === 'VERIFY') {
          msg = 'Consensus Quorum: 20/20 specialist cores cast verified PASS ballots.';
          lvl = 'success';
        }
        if (st === 'REPAIR') {
          msg = '50 Fixer Cores (Group E): Synthesized clean AST patch & quarantined scratch memory!';
          lvl = 'warn';
        }
        if (st === 'VERIFY_AGAIN') {
          msg = 'Re-Verification: Patch passed secondary test suite (19/20 PASS). Invariant restored.';
          lvl = 'success';
        }
        if (st === 'REPORT') {
          msg = 'Report finalized. Anchored into PCA-grade immutable audit ledger with hash 0x7c94...b2a';
          lvl = 'success';
          setActiveCycle(false);
          clearInterval(interval);
        }

        setCycleLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            stage: st,
            message: msg,
            level: lvl,
          },
        ]);

        idx++;
      }
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            Layer 1: Neural Core Operating Methodology
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Closed-Loop Autonomous Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Preserves the original working model: <strong className="text-cyan-300">UNDERSTAND → PLAN → FIND → FACT → DELEGATE → EXECUTE → OBSERVE → VERIFY → FIX → REPAIR → VERIFY AGAIN → REPORT</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={injectFailure}
              onChange={(e) => setInjectFailure(e.target.checked)}
              className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="font-semibold text-amber-300">Simulate Flaw (Test Self-Healing)</span>
          </label>

          <button
            onClick={handleRunClosedLoop}
            disabled={activeCycle}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${activeCycle ? 'animate-spin' : ''}`} />
            <span>{activeCycle ? 'Executing Cycle...' : 'Run Closed-Loop Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Repair Loopback Alert Banner */}
      {repairTriggered && (
        <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-950/30 text-amber-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white">Self-Healing Loopback Engaged:</strong> Verification detected an anomaly. The system automatically branched into <span className="font-mono text-cyan-300">REPAIR (Group E Fixers)</span> and then <span className="font-mono text-emerald-300">VERIFY AGAIN</span> before permitting deployment!
          </div>
        </div>
      )}

      {/* Visual Stepper / Pipeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Active Operating Stages & Specialist Handoffs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stages.map((st, idx) => {
            const isCurrent = currentStage === st.stage && activeCycle;
            const isPassed = !activeCycle || stages.findIndex((s) => s.stage === currentStage) >= idx;

            return (
              <div
                key={st.stage}
                className={`p-3.5 rounded-xl border text-xs transition flex flex-col justify-between ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-md shadow-cyan-950'
                    : isPassed
                    ? 'border-slate-800 bg-slate-900/60'
                    : 'border-slate-900 bg-slate-950/40 opacity-40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white font-mono text-xs">
                      {st.label}
                    </span>
                    {isCurrent ? (
                      <span className="text-[10px] font-mono text-cyan-400 animate-pulse font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300">
                  Core: <span className="text-slate-400">{st.coreLead}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Console Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Neural Core Closed-Loop Event Stream
          </span>
          <span className="font-mono text-[11px]">{cycleLogs.length} events emitted</span>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs max-h-64 overflow-y-auto space-y-1.5">
          {cycleLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="text-slate-600 select-none">[{log.timestamp}]</span>
              <span
                className={`font-bold uppercase text-[10px] px-1 rounded ${
                  log.level === 'success'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    : log.level === 'warn'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                }`}
              >
                [{log.stage}]
              </span>
              <span
                className={
                  log.level === 'success'
                    ? 'text-emerald-300'
                    : log.level === 'warn'
                    ? 'text-amber-200'
                    : 'text-slate-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
