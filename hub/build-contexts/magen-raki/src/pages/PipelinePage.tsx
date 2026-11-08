import React, { useState } from 'react';
import {
  GitCommit,
  Shield,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Layers,
  Cpu,
  Lock,
  FileCheck,
  Package,
  Activity,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Server,
  Zap,
  Terminal,
  Calendar,
  Compass,
} from 'lucide-react';
import type { PipelineExecution, RoadmapPhase } from '../types';

interface PipelinePageProps {
  setActiveTab?: (tab: any) => void;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({ setActiveTab }) => {
  const [pipelineExecution, setPipelineExecution] = useState<PipelineExecution | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [changeName, setChangeName] = useState<string>('Refactor Secure Enclave Memory Shielding');
  const [author, setAuthor] = useState<string>('Nero-4.0');
  const [targetEnvironment, setTargetEnvironment] = useState<'staging' | 'production'>('production');

  const executePipeline = async (forceVeto: boolean = false, simulateFault: boolean = false) => {
    setRunning(true);
    try {
      const res = await fetch('/api/magen-raki/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeName,
          author,
          targetEnvironment,
          forceGovernorVeto: forceVeto,
          simulateFault,
        }),
      });
      const data = await res.json();
      setPipelineExecution(data);
    } catch (err) {
      console.error('Failed to run pipeline:', err);
    } finally {
      setRunning(false);
    }
  };

  const roadmapPhases: RoadmapPhase[] = [
    {
      phase: 'Phase 1',
      days: 'Days 0–30',
      goal: 'Build the Five Core MVP Systems',
      status: 'COMPLETED',
      deliverables: [
        'Neural Core Engine (Nero-4.0) orchestration',
        'Six 686 Governor enclave & hardware policies',
        'Secure SHA-512 chained audit ledger',
        'Repository Readiness Gate (12 checks)',
        'One-Click Audit & Evidence Bundle exporter',
      ],
      metrics: 'Zero-unhandled errors, strict TS zero-leak validation',
    },
    {
      phase: 'Phase 2',
      days: 'Days 31–45',
      goal: 'Add Testers, Feedback, and Security Testing',
      status: 'ACTIVE',
      deliverables: [
        'Adversarial prompt injection testbed',
        'Side-channel attack dampening bench tests',
        'Automated CI/CD staging cluster hooks',
        'Human-in-the-loop approval escalation SLAs',
      ],
      metrics: 'Sub-3ms governance latency, 100% exploit containment',
    },
    {
      phase: 'Phase 3',
      days: 'Days 46–60',
      goal: 'Private / Soft Launch & Real Workload Testing',
      status: 'UPCOMING',
      deliverables: [
        'Enterprise VPC & On-Premise HSM bridge pilot',
        'Sapphire & OpenClaw automated patch workflows',
        'Synthetic probe health loop integration',
      ],
      metrics: 'Zero runtime false-done completions across 500+ repos',
    },
    {
      phase: 'Phase 4',
      days: 'Days 61–90',
      goal: 'Fix Friction & High-Value Enterprise Features',
      status: 'UPCOMING',
      deliverables: [
        'Multi-enclave policy federation',
        'Automated blue/green canary zero-downtime routing',
        'SOC2 & FedRAMP automated compliance export',
      ],
      metrics: '99.999% governor availability & sub-minute rollbacks',
    },
    {
      phase: 'Phase 5',
      days: 'Days 91–100',
      goal: 'Formal Launch with Verified Proof & Evidence',
      status: 'UPCOMING',
      deliverables: [
        'Public verifiable security ledger attestation',
        'Production turnkey deployment on AWS/GCP/Bare-Metal',
        'Global developer SDK and CLI tools',
      ],
      metrics: 'Gold standard AI risk mitigation seal',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>The Competitive Formula</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              CI/CD Pipeline, Staging Verification & Auto-Rollback
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Build fast, test automatically, pass through the Six 686 Governor, deploy to isolated staging, verify with live synthetic probes, release to production, and audit every step.
            </p>
          </div>
        </div>

        {/* The 5 Core MVP Systems Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>The 5 Core MVP Systems (True Foundation)</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              ALL 5 OPERATIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                id: 'sys-1',
                title: '1. Neural Core Engine',
                badge: 'Nero-4.0',
                desc: 'Orchestration, high-level reasoning, AST decomposition, and patch generation.',
                icon: Cpu,
                color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
              },
              {
                id: 'sys-2',
                title: '2. Six 686 Governor',
                badge: 'Hardware Risk Enclave',
                desc: 'Real-time risk scoring, policy rules, approval elevation, and hardware kill switch.',
                icon: Shield,
                color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
              },
              {
                id: 'sys-3',
                title: '3. Secure Audit Ledger',
                badge: 'SHA-512 Chained Ring',
                desc: 'Tamper-proof block ledger recording decisions, signatures, and timestamps.',
                icon: Lock,
                color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
              },
              {
                id: 'sys-4',
                title: '4. Repository Health & Gate',
                badge: '12 Assertions',
                desc: 'Diagnose → Plan → Patch → Test → Build → Staging → Verify → Report.',
                icon: FileCheck,
                color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
              },
              {
                id: 'sys-5',
                title: '5. One-Click Audit Bundle',
                badge: 'Evidence Exporter',
                desc: 'Cryptographic bundle exporting status, proofs, logs, and compliance seals.',
                icon: Package,
                color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
              },
            ].map((sys) => {
              const Icon = sys.icon;
              return (
                <div
                  key={sys.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between ${sys.color} shadow-lg backdrop-blur-sm`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Icon className="w-6 h-6" />
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900/80 text-slate-300">
                        {sys.badge}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-3">{sys.title}</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sys.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active In Memory</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Pipeline Playground */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-indigo-400">
                <Activity className="w-3.5 h-3.5" />
                <span>Live Pipeline Dispatcher</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Execute Full Competitive Workflow</h2>
              <p className="text-xs text-slate-400">
                Simulate a real commit moving through Type Check, Tests, Build, Six 686 Governor, Staging, Probes, and Production.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-run-happy-pipeline"
                onClick={() => executePipeline(false, false)}
                disabled={running}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                <span>Standard Release (Happy Path)</span>
              </button>

              <button
                id="btn-run-veto-pipeline"
                onClick={() => executePipeline(true, false)}
                disabled={running}
                className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Governor Veto</span>
              </button>

              <button
                id="btn-run-rollback-pipeline"
                onClick={() => executePipeline(false, true)}
                disabled={running}
                className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Auto-Rollback</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Change Description</label>
              <input
                type="text"
                value={changeName}
                onChange={(e) => setChangeName(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Author Agent</label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Nero-4.0">Neural Core (Nero-4.0)</option>
                <option value="Sapphire">Sapphire (Agent Worker)</option>
                <option value="OpenClaw">OpenClaw (Autonomous Crawler)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase">Target Deployment</label>
              <select
                value={targetEnvironment}
                onChange={(e) => setTargetEnvironment(e.target.value as any)}
                className="mt-1 w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="production">Production Cluster (Strict)</option>
                <option value="staging">Staging Hypervisor Enclave</option>
              </select>
            </div>
          </div>

          {/* Pipeline Diagram Progression View */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pipeline Stages Flow</span>
              {pipelineExecution && (
                <span className={`px-2.5 py-0.5 rounded font-bold ${
                  pipelineExecution.status === 'RELEASED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : pipelineExecution.status === 'BLOCKED_BY_GOVERNOR'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  STATUS: {pipelineExecution.status}
                </span>
              )}
            </div>

            {/* Stages visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-3">
              {(pipelineExecution?.stages || [
                { id: '1', title: '1. Create Change', subtitle: 'Diff generation', status: 'PENDING' },
                { id: '2', title: '2. Type Check', subtitle: 'npm run check', status: 'PENDING' },
                { id: '3', title: '3. Unit Tests', subtitle: 'npm run test', status: 'PENDING' },
                { id: '4', title: '4. Build Test', subtitle: 'npm run build', status: 'PENDING' },
                { id: '5', title: '5. Six 686 Governor', subtitle: 'Risk & Policy', status: 'PENDING' },
                { id: '6', title: '6. Staging', subtitle: 'Ephemeral Pod', status: 'PENDING' },
                { id: '7', title: '7. Health Check', subtitle: 'Synthetic Probes', status: 'PENDING' },
                { id: '8', title: '8. Release / Rollback', subtitle: 'Traffic Shift', status: 'PENDING' },
                { id: '9', title: '9. Audit Everything', subtitle: 'SHA-512 Ledger', status: 'PENDING' },
              ]).map((stage, idx) => {
                let badgeColor = 'bg-slate-800 text-slate-500';
                let borderColor = 'border-slate-800';
                let icon = <ClockIcon status={stage.status} />;

                if (stage.status === 'PASSED') {
                  badgeColor = 'bg-emerald-500/20 text-emerald-400';
                  borderColor = 'border-emerald-500/40 bg-emerald-950/10';
                } else if (stage.status === 'FAILED' || stage.status === 'BLOCKED') {
                  badgeColor = 'bg-rose-500/20 text-rose-400';
                  borderColor = 'border-rose-500/40 bg-rose-950/20';
                } else if (stage.status === 'SKIPPED') {
                  badgeColor = 'bg-slate-800/80 text-slate-500';
                  borderColor = 'border-slate-800';
                }

                return (
                  <div
                    key={stage.id}
                    className={`rounded-xl p-3 border text-left flex flex-col justify-between relative transition-all ${borderColor}`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 font-bold">{idx + 1}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${badgeColor}`}>
                          {stage.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1.5 leading-tight">{stage.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{stage.subtitle}</div>
                    </div>

                    {stage.durationMs && (
                      <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                        {stage.durationMs}ms
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detailed Execution Output Log */}
            {pipelineExecution && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-white font-bold">Execution Telemetry (ID: {pipelineExecution.id})</span>
                  </div>
                  <span className="text-slate-500">Commit: {pipelineExecution.commitHash}</span>
                </div>

                <div className="space-y-1.5">
                  {pipelineExecution.stages.map((st) => (
                    <div key={st.id} className="flex items-start gap-2">
                      <span className="text-slate-500 select-none">[{st.status.padEnd(7)}]</span>
                      <span className="text-indigo-300 font-semibold">{st.title}:</span>
                      <span className="text-slate-300">{st.output || 'Pending execution.'}</span>
                    </div>
                  ))}
                </div>

                {pipelineExecution.healthMetrics && (
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Uptime:</span> {pipelineExecution.healthMetrics.uptime}</div>
                    <div><span className="text-slate-500">HTTP Status:</span> {pipelineExecution.healthMetrics.httpStatus}</div>
                    <div><span className="text-slate-500">Probe Latency:</span> {pipelineExecution.healthMetrics.latencyMs} ms</div>
                    <div><span className="text-slate-500">Rollback Status:</span> {pipelineExecution.status === 'ROLLED_BACK' ? 'Zero Downtime Active' : 'Stable'}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 100-Day Strategy Roadmap */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Execution Timeline</span>
              </div>
              <h2 className="text-2xl font-bold text-white">The 100-Day Competitive Strategy</h2>
              <p className="text-xs text-slate-400">
                Five focused milestones to turn Magen-Rakiʿ + Neural Core + Six 686 into an unbreakable market leader.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {roadmapPhases.map((phase) => (
              <div
                key={phase.phase}
                className={`rounded-2xl p-6 border transition-all ${
                  phase.status === 'COMPLETED'
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : phase.status === 'ACTIVE'
                    ? 'bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                      {phase.days}
                    </span>
                    <h3 className="text-lg font-bold text-white">{phase.goal}</h3>
                  </div>

                  <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold uppercase ${
                    phase.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : phase.status === 'ACTIVE'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {phase.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-mono text-slate-400 uppercase text-[11px] mb-2">Key Deliverables</div>
                    <ul className="space-y-1.5">
                      {phase.deliverables.map((del, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-mono text-slate-400 uppercase text-[11px] mb-2">Target Metric & SLA</div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-indigo-200">
                      {phase.metrics}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab && setActiveTab('readiness')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Open Readiness Gate</span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab('governor')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <span>Open Six 686 Governor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function ClockIcon({ status }: { status: string }) {
  if (status === 'PASSED') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'FAILED' || status === 'BLOCKED') return <XCircle className="w-4 h-4 text-rose-400" />;
  return <div className="w-2 h-2 rounded-full bg-slate-600" />;
}
