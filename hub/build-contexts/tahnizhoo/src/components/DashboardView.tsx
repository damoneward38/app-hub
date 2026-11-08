import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  RotateCw,
  Plus,
  Play,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Lock,
  Layers,
  Search,
} from 'lucide-react';
import { BusinessProfile, Job, PlanTier } from '../types';
import { platformStore } from '../services/store';

interface DashboardViewProps {
  onOpenWizard: () => void;
  onSelectJob: (job: Job) => void;
  onViewAudit: () => void;
  onUpgradePlan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenWizard,
  onSelectJob,
  onViewAudit,
  onUpgradePlan,
}) => {
  const currentUser = platformStore.getCurrentUser();
  const businesses = platformStore.getBusinesses();
  const jobs = platformStore.getJobs();
  const agents = platformStore.getAgents();

  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'success' | 'upgrade_needed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate high-level KPIs
  const totalJobs = jobs.length;
  const successJobs = jobs.filter((j) => j.status === 'success').length;
  const successRate = totalJobs > 0 ? ((successJobs / totalJobs) * 100).toFixed(1) : '100';
  const onlineAgentsCount = agents.filter((a) => a.status === 'online' || a.status === 'busy').length;

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        job.id.toLowerCase().includes(q) ||
        job.businessName.toLowerCase().includes(q) ||
        job.jobType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTriggerQuickScan = (biz: BusinessProfile) => {
    platformStore.enqueueJobForBusiness(biz, 'scan');
  };

  const handleTriggerQuickDeploy = (biz: BusinessProfile) => {
    platformStore.enqueueJobForBusiness(biz, 'deploy');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            Real-Time Operations & Monitoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Autonomous Swarm Cockpit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking 200 distributed agent workers, majority vote consensus, and continuous cyber-security wrappers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onViewAudit}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer"
          >
            Audit Chain
          </button>
          <button
            onClick={onOpenWizard}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Business Profile
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Deployment Success</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {successRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {successJobs} of {totalJobs} jobs passed
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Mean Time To Fix (MTTF)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            1.8 min
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Group E auto-patch engine
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Threat Risk Score</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300 tabular-nums">
            0.0 / 10
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Optimal posture · 0 leaks
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Active Swarm Workers</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300 tabular-nums">
            {onlineAgentsCount} / 200
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            10 groups · 20 agents each
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Subscription Quota</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              {currentUser.plan}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {currentUser.plan === 'free' ? '30 min' : 'Unlimited'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Daily security scan time</span>
            {currentUser.plan === 'free' && (
              <button
                onClick={onUpgradePlan}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Business Profiles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Registered Business Profiles ({businesses.length})
          </h2>
          <span className="text-xs text-slate-400">
            Automated profile blueprints in database
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-400">{biz.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono capitalize">
                    {biz.plan} Tier
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{biz.name}</h3>
                <div className="text-xs text-slate-400 mt-1">
                  Industry: <span className="text-slate-200">{biz.industry}</span> · Maturity: <span className="text-slate-200">{biz.maturity}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  Storage: {biz.storageStack}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {biz.tasks.length} tasks scheduled ({biz.schedule.scanInterval})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTriggerQuickScan(biz)}
                    title="Queue automated vulnerability & port scan"
                    className="px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition cursor-pointer"
                  >
                    Run Scan
                  </button>
                  <button
                    onClick={() => handleTriggerQuickDeploy(biz)}
                    title="Queue full pipeline deployment and security wrapper"
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded transition cursor-pointer"
                  >
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Swarm Jobs Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Recent Swarm Execution Jobs
            </h2>
            <p className="text-xs text-slate-400">
              Click any row to inspect DAG pipeline stages, 20-agent majority votes, and cryptographic proof hashes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded transition ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('running')}
                className={`px-2.5 py-1 rounded transition ${
                  statusFilter === 'running' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Running
              </button>
              <button
                onClick={() => setStatusFilter('success')}
                className={`px-2.5 py-1 rounded transition ${
                  statusFilter === 'success' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Passed
              </button>
              <button
                onClick={() => setStatusFilter('upgrade_needed')}
                className={`px-2.5 py-1 rounded transition ${
                  statusFilter === 'upgrade_needed' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gated
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Table Container */}
        <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">DAG Progress</th>
                  <th className="py-3 px-4">Swarm Quorum</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No matching jobs found in queue.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const isRunning = job.status === 'running';
                    const isUpgrade = job.status === 'upgrade_needed';
                    const isSuccess = job.status === 'success';

                    return (
                      <tr
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono text-cyan-400">
                          {job.id}
                        </td>
                        <td className="py-3.5 px-4 text-white font-semibold">
                          {job.businessName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-300 uppercase">
                            {job.jobType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums">
                              {job.tasksCompleted} / {job.totalTasks}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isSuccess
                                    ? 'bg-emerald-400'
                                    : isRunning
                                    ? 'bg-cyan-400 animate-pulse'
                                    : isUpgrade
                                    ? 'bg-amber-400'
                                    : 'bg-slate-600'
                                }`}
                                style={{
                                  width: `${Math.min(100, (job.tasksCompleted / (job.totalTasks || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {job.votes ? (
                            <span className="text-emerald-400 font-semibold">
                              {job.votes.passedVotes}/20 Agree
                            </span>
                          ) : isRunning ? (
                            <span className="text-cyan-400 animate-pulse">20 Agents Voting...</span>
                          ) : (
                            <span>–</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isRunning && (
                            <span className="inline-flex items-center gap-1.5 text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-cyan-800/50">
                              <RotateCw className="w-3 h-3 animate-spin" /> Running
                            </span>
                          )}
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" /> Passed
                            </span>
                          )}
                          {isUpgrade && (
                            <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-800/50">
                              <Lock className="w-3 h-3" /> Upgrade Req.
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1">
                            Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
