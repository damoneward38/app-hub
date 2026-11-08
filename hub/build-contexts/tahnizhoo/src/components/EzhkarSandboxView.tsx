import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { EzhkarSandboxConfig } from '../types';
import { platformStore } from '../services/store';

export const EzhkarSandboxView: React.FC = () => {
  const sandboxes = platformStore.getEzhkarSandboxes();
  const auditEntries = platformStore.getAuditLog();
  const [selectedSandbox, setSelectedSandbox] = useState<EzhkarSandboxConfig>(sandboxes[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Layer 3: EZHKAR Security & Sandbox Operating Model
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            EZHKAR Sandbox Isolation & Detector/Fixer Separation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Strict isolation boundaries: No AI receives unrestricted access. 50 Finding Cores are decoupled from 50 Fixing Cores to prevent self-validation bias.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>EZHKAR Air-Gap Boundaries Active</span>
        </div>
      </div>

      {/* Core EZHKAR Principles Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="text-xs font-mono text-emerald-400 uppercase font-bold">Principle 1</div>
          <h3 className="text-base font-bold text-white">Detector / Fixer Separation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            50 Cybersecurity Finders strictly detect, trace, and score flaws. 50 Cybersecurity Fixers independently remediate and patch. Neither validates their own work.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="text-xs font-mono text-cyan-400 uppercase font-bold">Principle 2</div>
          <h3 className="text-base font-bold text-white">Controlled Ephemeral Execution</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All code parsing and media transcoding executes in Firecracker micro-VMs with copy-on-write scratch disks and strict resource quotas.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="text-xs font-mono text-indigo-400 uppercase font-bold">Principle 3</div>
          <h3 className="text-base font-bold text-white">Cryptographic PCA Audit Chain</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every quorum ballot and patch diff is hashed with SHA-256 and chained to previous ledger blocks, creating tamper-evident compliance proofs.
          </p>
        </div>
      </div>

      {/* Sandbox Instances Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Active Micro-VM Sandbox Environments
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sandboxes.map((sb) => {
            const isSelected = selectedSandbox.id === sb.id;
            return (
              <div
                key={sb.id}
                onClick={() => setSelectedSandbox(sb)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 truncate">
                      {sb.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {sb.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mb-1">
                    {sb.coreAssignment}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Isolation:</span>
                    <span className="text-white capitalize">{sb.isolationLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filesystem:</span>
                    <span className="text-cyan-300">{sb.filesystemMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Limit:</span>
                    <span className="text-emerald-400">{sb.memoryLimitMb} MB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail of Selected Sandbox Environment */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase">
              Sandbox Configuration Profile
            </span>
            <h3 className="text-base font-bold text-white">{selectedSandbox.name}</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">ID: {selectedSandbox.id}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
            <span className="text-slate-500 block text-[10px]">NETWORK POLICY</span>
            <span className="text-white font-bold uppercase">{selectedSandbox.networkAccess}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
            <span className="text-slate-500 block text-[10px]">FILESYSTEM ACCESS</span>
            <span className="text-cyan-300 font-bold">{selectedSandbox.filesystemMode}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
            <span className="text-slate-500 block text-[10px]">CPU QUOTA</span>
            <span className="text-emerald-400 font-bold">{selectedSandbox.cpuQuotaPercent}% Cores</span>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
            <span className="text-slate-500 block text-[10px]">ROLLBACK SNAPSHOT</span>
            <span className="text-indigo-300 font-bold">Enabled (CoW)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
