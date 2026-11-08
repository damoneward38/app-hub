import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Activity,
  Layers,
  Server,
  Lock,
  Terminal,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  IntegrationState,
  SUBSYSTEM_INTEGRATION_STATUS,
  SubsystemStatus,
} from '../services/integrationData';

interface IntegrationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationStatusModal: React.FC<IntegrationStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const getBadgeStyle = (state: IntegrationState) => {
    switch (state) {
      case 'Backend Connected':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50';
      case 'Ready for Backend':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50';
      case 'Simulation':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-600/50';
      case 'Specification':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/50';
      case 'Verification Required':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/50';
      case 'Demonstration':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filtered = SUBSYSTEM_INTEGRATION_STATUS.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    return item.state === selectedFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Subsystem Integration States</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  TRANSPARENCY AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent verification disclosure: Never representing simulated activity as real production execution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap gap-1.5 text-xs font-mono">
          {[
            'ALL',
            'Backend Connected',
            'Simulation',
            'Ready for Backend',
            'Specification',
            'Verification Required',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                selectedFilter === st
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                    {item.layer}
                  </span>
                  <span className="font-bold text-white text-sm">{item.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold self-start sm:self-auto ${getBadgeStyle(
                    item.state
                  )}`}
                >
                  {item.state}
                </span>
              </div>

              <div className="text-slate-300 leading-relaxed font-sans text-xs">
                {item.details}
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">Protocol: </span>
                  <span className="text-cyan-300">{item.protocol}</span>
                </div>
                <div>
                  <span className="text-slate-500">Audit Note: </span>
                  <span className="text-slate-300">{item.notes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real backend connections will transition states to "Backend Connected" dynamically.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
