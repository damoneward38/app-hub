import React, { useState } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RotateCcw, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  RefreshCw,
  Globe,
  Cloud,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeploymentRecord } from '../types';

export const DeployPipeline: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<'vercel' | 'cloudflare' | 'cloudrun' | 'aws'>('vercel');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [liveUrl, setLiveUrl] = useState<string | null>('https://sapphire-openclaw.run.app');

  const history: DeploymentRecord[] = [
    {
      id: 'dep-104',
      target: 'cloudrun',
      commit: 'c7f890a',
      branch: 'main',
      status: 'live',
      timestamp: 'Today at 03:45 AM',
      url: 'https://sapphire-openclaw.run.app',
      stages: [
        { id: '1', name: 'Lint & Type Check', status: 'completed', duration: '1.2s' },
        { id: '2', name: 'Vite 6 Production Build', status: 'completed', duration: '3.4s' },
        { id: '3', name: 'Unit Verification Tests', status: 'completed', duration: '0.8s' },
        { id: '4', name: 'Container Edge Routing', status: 'completed', duration: '2.1s' }
      ]
    },
    {
      id: 'dep-103',
      target: 'vercel',
      commit: '4e219ba',
      branch: 'main',
      status: 'live',
      timestamp: 'Today at 03:28 AM',
      url: 'https://sapphire-openclaw-vercel.app',
      stages: [
        { id: '1', name: 'Lint & Type Check', status: 'completed', duration: '1.1s' },
        { id: '2', name: 'Vite 6 Production Build', status: 'completed', duration: '3.1s' },
        { id: '3', name: 'Unit Verification Tests', status: 'completed', duration: '0.7s' },
        { id: '4', name: 'Edge Edge Deployment', status: 'completed', duration: '1.8s' }
      ]
    }
  ];

  const handleStartDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStep(1);
    setLiveUrl(null);
    setDeployLogs([`[03:49:01] ⚡ Deploy triggered for target: ${selectedTarget.toUpperCase()}`]);

    setTimeout(() => {
      setDeployStep(2);
      setDeployLogs(prev => [...prev, `[03:49:02] ✓ Stage 1 complete: TypeScript AST verified (0 errors)`]);
    }, 1200);

    setTimeout(() => {
      setDeployStep(3);
      setDeployLogs(prev => [...prev, `[03:49:03] ✓ Stage 2 complete: Client & Server bundles generated (esbuild .cjs)`]);
    }, 2400);

    setTimeout(() => {
      setDeployStep(4);
      setDeployLogs(prev => [...prev, `[03:49:04] ✓ Stage 3 complete: All 8 test suites passed green`]);
    }, 3600);

    setTimeout(() => {
      setDeployStep(5);
      const url = `https://sapphire-openclaw-${selectedTarget}.run.app`;
      setLiveUrl(url);
      setDeployLogs(prev => [
        ...prev, 
        `[03:49:05] 🚀 Stage 4 complete: Edge route propagation active!`,
        `[03:49:05] ✨ SUCCESS: App is LIVE at ${url}`
      ]);
      setIsDeploying(false);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }, 4800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Rocket className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Continuous Deployment Pipeline
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ZERO DOWNTIME
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              One-click multi-cloud release orchestration across Vercel, Cloudflare, Cloud Run, and AWS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Visit Live App</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          )}
        </div>
      </div>

      {/* Target Selector & Trigger */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Select Deployment Target</h3>
            <p className="text-xs text-slate-400">Choose where to bundle and route the production build.</p>
          </div>

          {/* Cloud targets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'vercel', label: 'Vercel Edge' },
              { id: 'cloudflare', label: 'Cloudflare' },
              { id: 'cloudrun', label: 'Cloud Run' },
              { id: 'aws', label: 'AWS Lambda' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTarget(t.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition ${
                  selectedTarget === t.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trigger Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          <div className="text-xs font-mono text-slate-400">
            Target: <span className="text-cyan-400 font-bold uppercase">{selectedTarget}</span> | Branch: <span className="text-amber-400">main</span>
          </div>

          <button
            onClick={handleStartDeploy}
            disabled={isDeploying}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deploying to {selectedTarget}...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Deploy to {selectedTarget.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Stage Progression */}
      {isDeploying && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            Active Build Stages:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[
              { num: 1, name: '1. Typecheck & Lint' },
              { num: 2, name: '2. ESBuild & Vite' },
              { num: 3, name: '3. Automated Tests' },
              { num: 4, name: '4. Edge Distribution' }
            ].map((st) => {
              const isCurrent = deployStep === st.num;
              const isPast = deployStep > st.num;
              return (
                <div
                  key={st.num}
                  className={`p-3 rounded-xl border flex items-center gap-2 ${
                    isPast
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-cyan-950/30 border-cyan-500 text-cyan-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span className="font-semibold">{st.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Streaming Deployment Logs Console */}
      {deployLogs.length > 0 && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs space-y-1 shadow-inner">
          <div className="text-[11px] text-slate-500 pb-1 mb-1 border-b border-slate-900 flex items-center justify-between">
            <span>PIPELINE CONSOLE LOGS</span>
            <span className="text-emerald-400">Active Stream</span>
          </div>
          {deployLogs.map((log, idx) => (
            <div key={idx} className="text-slate-300 leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Historic Releases */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider px-1">
          Recent Release History:
        </h4>
        <div className="space-y-2">
          {history.map((dep) => (
            <div
              key={dep.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                  {dep.target.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Commit {dep.commit}</span>
                    <span className="text-[11px] font-normal text-slate-400">({dep.branch})</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{dep.timestamp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {dep.url && (
                  <a
                    href={dep.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                  >
                    <span>View URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
