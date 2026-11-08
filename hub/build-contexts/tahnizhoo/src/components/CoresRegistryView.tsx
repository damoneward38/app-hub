import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
  ExternalLink,
  Layers,
  Lock,
  ArrowRight,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { AgentGroup, CoreType, CyberRoleType, SpecialistCoreIdentity } from '../types';
import { platformStore } from '../services/store';

export const CoresRegistryView: React.FC = () => {
  const cores = platformStore.getSpecialistCores();

  const [activeTab, setActiveTab] = useState<'all' | 'cyber' | 'business'>('all');
  const [cyberSubFilter, setCyberSubFilter] = useState<'all' | 'finder' | 'fixer'>('all');
  const [selectedGroup, setSelectedGroup] = useState<AgentGroup | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCore, setSelectedCore] = useState<SpecialistCoreIdentity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (core: SpecialistCoreIdentity) => {
    const next = core.status === 'online' ? 'offline' : 'online';
    platformStore.updateAgentStatus(core.id, next);
    showToast(`Core ${core.id} (${core.name}) marked ${next.toUpperCase()}`);
    if (selectedCore?.id === core.id) {
      setSelectedCore({ ...core, status: next });
    }
  };

  const handleRestart200 = () => {
    platformStore.restartAllAgents();
    showToast('All 200 Neural Core micro-VM instances restarted into verified baseline.');
  };

  const filteredCores = cores.filter((c) => {
    if (activeTab === 'cyber' && c.type !== 'cybersecurity') return false;
    if (activeTab === 'business' && c.type !== 'business') return false;
    if (activeTab === 'cyber' && cyberSubFilter !== 'all' && c.cyberRole !== cyberSubFilter) return false;
    if (selectedGroup !== 'ALL' && c.group !== selectedGroup) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.primaryFunctions.some((f) => f.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const cyberCount = cores.filter((c) => c.type === 'cybersecurity').length;
  const findersCount = cores.filter((c) => c.cyberRole === 'finder').length;
  const fixersCount = cores.filter((c) => c.cyberRole === 'fixer').length;
  const bizCount = cores.filter((c) => c.type === 'business').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            Specialist AI Identity Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The 200 Specialized AI Cores
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Exactly 200 distinct AI identities operating on top of Neural Core: <strong className="text-emerald-400">100 Cybersecurity Cores</strong> (50 Finders + 50 Fixers) and <strong className="text-cyan-300">100 Business & Creator Cores</strong> (Groups F–J).
          </p>
        </div>

        <button
          onClick={handleRestart200}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          Restart All 200 Cores
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedGroup('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              All 200 Cores
            </button>
            <button
              onClick={() => {
                setActiveTab('cyber');
                setSelectedGroup('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'cyber'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              100 Cybersecurity Cores ({findersCount} Finders / {fixersCount} Fixers)
            </button>
            <button
              onClick={() => {
                setActiveTab('business');
                setSelectedGroup('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'business'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              100 Business & Creator Cores ({bizCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search core by ID, name, role..."
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>
        </div>

        {/* Sub-Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeTab === 'cyber' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <span className="text-[10px] text-slate-500 font-mono px-1">ROLE:</span>
              <button
                onClick={() => setCyberSubFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  cyberSubFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                All 100
              </button>
              <button
                onClick={() => setCyberSubFilter('finder')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  cyberSubFilter === 'finder' ? 'bg-emerald-600 text-white' : 'text-emerald-400'
                }`}
              >
                50 Finders / Detectors
              </button>
              <button
                onClick={() => setCyberSubFilter('fixer')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  cyberSubFilter === 'fixer' ? 'bg-cyan-600 text-white' : 'text-cyan-400'
                }`}
              >
                50 Fixers / Remediators
              </button>
            </div>
          )}

          {/* Group Filter Chips */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-slate-500">GROUP:</span>
            {(['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as (AgentGroup | 'ALL')[]).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-2 py-0.5 rounded transition ${
                  selectedGroup === g
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <span className="ml-auto text-slate-500 font-mono text-xs">
            Showing {filteredCores.length} of 200 Cores
          </span>
        </div>
      </div>

      {/* Cores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCores.map((core) => {
          const isCyber = core.type === 'cybersecurity';
          const isFinder = core.cyberRole === 'finder';
          const isFixer = core.cyberRole === 'fixer';
          const isOnline = core.status === 'online';

          return (
            <div
              key={core.id}
              onClick={() => setSelectedCore(core)}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    {core.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        isCyber
                          ? isFinder
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                      }`}
                    >
                      {isCyber ? (isFinder ? 'Finder' : 'Fixer') : 'Business'}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      title={core.status}
                    />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-white group-hover:text-cyan-200 truncate">
                  {core.name}
                </h3>
                <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {core.role}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {core.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="text-cyan-400">Group {core.group}</span>
                <span>{core.totalJobsProcessed} jobs processed</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Specialist Core Identity Dossier Modal */}
      {selectedCore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {selectedCore.id}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Group {selectedCore.group} · {selectedCore.type}
                  </span>
                  {selectedCore.cyberRole && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        selectedCore.cyberRole === 'finder'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                      }`}
                    >
                      {selectedCore.cyberRole} Core
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedCore.name}</h2>
                <div className="text-xs font-semibold text-cyan-300 mt-0.5">{selectedCore.role}</div>
              </div>

              <button
                onClick={() => setSelectedCore(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Identity Dossier Content */}
            <div className="space-y-4 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Core Description
                </span>
                <p className="text-slate-300">{selectedCore.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Domain</span>
                  <span className="text-slate-200 font-semibold">{selectedCore.domain}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Sandbox Assignment</span>
                  <span className="text-cyan-300 font-mono">{selectedCore.sandboxAssignment}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Primary Functions</span>
                  <ul className="space-y-1 text-slate-300 font-mono">
                    {selectedCore.primaryFunctions.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-cyan-400">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Permissions</span>
                  <ul className="space-y-1 text-slate-300 font-mono">
                    {selectedCore.permissions.map((p, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Verification & Repair Responsibilities</span>
                <div className="text-slate-300">
                  <strong className="text-white">Verify:</strong> {selectedCore.verificationResponsibility}
                </div>
                <div className="text-slate-300">
                  <strong className="text-white">Repair:</strong> {selectedCore.repairResponsibility}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Delegation Rules</span>
                <ul className="space-y-1 text-slate-300">
                  {selectedCore.delegationRules.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="font-mono text-slate-500">
                Processed: <span className="text-white">{selectedCore.totalJobsProcessed} jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(selectedCore)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedCore.status === 'online'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 hover:bg-rose-900'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900'
                  }`}
                >
                  {selectedCore.status === 'online' ? 'Set Offline' : 'Set Online'}
                </button>
                <button
                  onClick={() => setSelectedCore(null)}
                  className="px-4 py-1.5 font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
