import React, { useState } from 'react';
import {
  Users,
  Shield,
  Cpu,
  Power,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';
import { Agent, AgentGroup, PlanTier, User } from '../types';
import { platformStore } from '../services/store';

export const AdminView: React.FC = () => {
  const currentUser = platformStore.getCurrentUser();
  const users = platformStore.getUsers();
  const agents = platformStore.getAgents();

  const [selectedGroup, setSelectedGroup] = useState<AgentGroup | 'ALL'>('ALL');
  const [agentSearch, setAgentSearch] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'agents' | 'users' | 'templates'>('agents');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleAgentStatus = (agent: Agent) => {
    const nextStatus = agent.status === 'online' ? 'offline' : 'online';
    platformStore.updateAgentStatus(agent.id, nextStatus);
    showToast(`Agent ${agent.id} marked ${nextStatus.toUpperCase()}`);
  };

  const handleRestartAll = () => {
    platformStore.restartAllAgents();
    showToast('All 200 Core Agent containers restarted with zero-trust posture.');
  };

  const handleUpdatePlan = (userId: string, newPlan: PlanTier) => {
    platformStore.updateUserPlan(userId, newPlan);
    showToast(`Updated user subscription tier to ${newPlan.toUpperCase()}`);
  };

  const filteredAgents = agents.filter((a) => {
    if (selectedGroup !== 'ALL' && a.groupName !== selectedGroup) return false;
    if (agentSearch) {
      const q = agentSearch.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.roleLabel.toLowerCase().includes(q) ||
        a.functionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Layer 8: Administrator Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            200-Agent Swarm & Multi-Tenant Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-cyan-300 font-semibold">{currentUser.email}</span> (Master Admin · Enterprise Orchestrator)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestartAll}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Restart 200 Containers
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-medium">
        <button
          onClick={() => setActiveAdminTab('agents')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-2 ${
            activeAdminTab === 'agents'
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          200 AI Core Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-2 ${
            activeAdminTab === 'users'
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          User & Plan Permissions ({users.length})
        </button>
      </div>

      {/* Tab 1: 200 Core Agents Console */}
      {activeAdminTab === 'agents' && (
        <div className="space-y-6">
          {/* Group Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-500 font-mono mr-1">Filter Group:</span>
            <button
              onClick={() => setSelectedGroup('ALL')}
              className={`px-2.5 py-1 rounded font-mono transition ${
                selectedGroup === 'ALL'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ALL (200)
            </button>
            {(['A', 'B', 'C', 'D', 'E'] as AgentGroup[]).map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2 py-1 rounded font-mono transition ${
                  selectedGroup === grp
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60'
                }`}
              >
                Security {grp} (20)
              </button>
            ))}
            {(['F', 'G', 'H', 'I', 'J'] as AgentGroup[]).map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-2 py-1 rounded font-mono transition ${
                  selectedGroup === grp
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 hover:bg-indigo-900/60'
                }`}
              >
                Business {grp} (20)
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              placeholder="Search agent by ID, function, or role..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAgents.map((agent) => {
              const isOnline = agent.status === 'online';
              const isBusy = agent.status === 'busy';
              const isSecurity = agent.category === 'security';

              return (
                <div
                  key={agent.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {agent.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                          isOnline
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : isBusy
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-white truncate">
                      {agent.roleLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      func: {agent.functionName}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/70 space-y-2">
                    <div className="grid grid-cols-3 text-[10px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500 block">CPU</span>
                        <span className="text-slate-200">{agent.cpuUsage}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">MEM</span>
                        <span className="text-slate-200">{agent.memoryUsage}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">LAT</span>
                        <span className="text-slate-200">{agent.latencyMs}ms</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {agent.totalJobsProcessed} jobs
                      </span>
                      <button
                        onClick={() => handleToggleAgentStatus(agent)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer ${
                          isOnline
                            ? 'text-rose-400 hover:bg-rose-950/40'
                            : 'text-emerald-400 hover:bg-emerald-950/40'
                        }`}
                      >
                        {isOnline ? 'Set Offline' : 'Set Online'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: User & Plan Permissions */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Override client subscription plans to unlock or gate 50-agent cybersecurity cohorts.
          </div>

          <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Current Subscription</th>
                  <th className="py-3 px-4 text-right">Assign Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((u) => {
                  const isDamone = u.email === 'damoneward38@gmail.com';
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 text-white font-semibold flex items-center gap-2">
                        {u.name}
                        {isDamone && (
                          <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800/50">
                            Root Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono uppercase text-slate-400">
                        {u.role}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-[11px]">
                          {u.plan} tier
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'free')}
                          className={`px-2 py-1 text-[11px] rounded transition ${
                            u.plan === 'free' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'standard')}
                          className={`px-2 py-1 text-[11px] rounded transition ${
                            u.plan === 'standard' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          T1 ($250/mo)
                        </button>
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'pro')}
                          className={`px-2 py-1 text-[11px] rounded transition ${
                            u.plan === 'pro' ? 'bg-indigo-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          T2 ($1.5k/mo)
                        </button>
                        <button
                          onClick={() => handleUpdatePlan(u.id, 'enterprise')}
                          className={`px-2 py-1 text-[11px] rounded transition ${
                            u.plan === 'enterprise' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          T3 ($4.5k/mo)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
