import React from 'react';
import {
  X,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Lock,
  Download,
  Terminal,
  Activity,
  Zap,
  Users,
} from 'lucide-react';
import { Job } from '../types';
import { platformStore } from '../services/store';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onRerun: (jobId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onRerun,
}) => {
  if (!job) return null;

  const isRunning = job.status === 'running';
  const isSuccess = job.status === 'success';
  const isUpgrade = job.status === 'upgrade_needed';

  const handleDownloadProof = () => {
    const proofData = {
      certificate_type: 'PCA_GRADE_SWARM_EXECUTION_PROOF',
      job_id: job.id,
      business_id: job.businessId,
      business_name: job.businessName,
      status: job.status,
      initiated_at: job.initiatedAt,
      completed_at: job.completedAt,
      cryptographic_hash: job.resultHash,
      majority_consensus: job.votes
        ? {
            function: job.votes.functionName,
            group: job.votes.group,
            passed_votes: job.votes.passedVotes,
            total_votes: job.votes.totalVotes,
            majority_threshold: job.votes.majorityThreshold,
          }
        : null,
      verification_standard: 'תכנית הצופה (Taḥnīʿ Hâzoo) SHA-256 Zero-Trust Protocol',
    };

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swarm-proof-${job.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold">{job.id}</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 capitalize">{job.jobType} pipeline</span>
              <span className="text-slate-500">·</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                  isSuccess
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : isRunning
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                }`}
              >
                {job.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{job.businessName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRerun(job.id)}
              disabled={isRunning}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Rerun Job
            </button>
            <button
              onClick={handleDownloadProof}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Proof
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Cryptographic Hash Banner */}
          {job.resultHash && (
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">PCA-Grade Result Hash:</span>
                <span className="font-mono text-cyan-300 break-all select-all font-semibold">
                  {job.resultHash}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono shrink-0 uppercase">
                ✓ Chained in Audit Log
              </span>
            </div>
          )}

          {/* Swarm 20-Agent Consensus Section */}
          {job.votes ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    20-Agent Swarm Majority Quorum (Group {job.votes.group})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Function: <span className="font-mono text-slate-200">{job.votes.functionName}</span> · Majority threshold: ≥ 11 / 20 required
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {job.votes.passedVotes} / {job.votes.totalVotes} PASS
                  </span>
                  <div className="text-[10px] text-slate-500">Majority Verified</div>
                </div>
              </div>

              {/* 20 Agent Vote Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {job.votes.agentVotes.map((vote) => (
                  <div
                    key={vote.agentId}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between text-[11px]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-slate-400 text-[10px] truncate">
                        {vote.agentId}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1 rounded ${
                          vote.verdict === 'PASS'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {vote.verdict}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate" title={vote.reason}>
                      {vote.reason}
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-slate-900 flex justify-between text-[9px] font-mono text-slate-500">
                      <span>{vote.latencyMs}ms</span>
                      <span>{(vote.confidence * 100).toFixed(0)}% conf</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isRunning ? (
            <div className="p-8 rounded-xl border border-cyan-800/40 bg-cyan-950/10 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">
                Swarm Containers Executing in Parallel...
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                20 Firecracker micro-VM agents are processing tasks and casting cryptographically signed votes.
              </p>
            </div>
          ) : null}

          {/* Console Output & Event Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Live Swarm Console Stream
              </span>
              <span className="font-mono text-[11px]">{job.logs.length} logged events</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5">
              {job.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold shrink-0 uppercase text-[10px] ${
                      log.level === 'success'
                        ? 'text-emerald-400'
                        : log.level === 'security'
                        ? 'text-cyan-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span
                    className={
                      log.level === 'success'
                        ? 'text-emerald-300'
                        : log.level === 'security'
                        ? 'text-cyan-300'
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>
            Initiated: <span className="font-mono text-slate-300">{new Date(job.initiatedAt).toLocaleString()}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
