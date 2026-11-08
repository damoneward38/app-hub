import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  Lock,
  Unlock,
  Radio,
  FileCheck,
  RefreshCw,
  Zap,
  ArrowRight,
  Database,
  Eye,
  Sliders,
  Server,
  Laptop,
  Flame,
  Check,
  Download,
  DollarSign,
} from 'lucide-react';
import { TenantUsageCard } from '../components/TenantUsageCard';
import { useAuth } from '../context/AuthContext';
import type {
  AgentId,
  ActionType,
  AgentIdentity,
  GovernanceResult,
  ApprovalRequest,
  AuditEntry,
  GovernorStatusState,
} from '../types';

interface PresetItem {
  label: string;
  agentId: AgentId;
  type: ActionType;
  capability: string;
  target: string;
  description: string;
  expected: 'ALLOW' | 'REQUIRE_APPROVAL' | 'BLOCK';
  note: string;
}

interface GovernorPageProps {
  setActiveTab?: (tab: any) => void;
}

export const GovernorPage: React.FC<GovernorPageProps> = ({ setActiveTab }) => {
  const { user, openSignInModal } = useAuth();
  const currentAdminEmail = user?.email || 'damoneward38@gmail.com';

  // Status State
  const [statusState, setStatusState] = useState<GovernorStatusState | null>(null);
  const [agents, setAgents] = useState<AgentIdentity[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLedger, setAuditLedger] = useState<AuditEntry[]>([]);
  const [chainVerification, setChainVerification] = useState<{
    valid: boolean;
    totalBlocks: number;
    message: string;
  } | null>(null);

  // Action Dispatcher Form State
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('sapphire');
  const [actionType, setActionType] = useState<ActionType>('execute');
  const [capability, setCapability] = useState('repository-repair');
  const [targetPath, setTargetPath] = useState('/Users/davidyoung/sapphire-openclaw');
  const [description, setDescription] = useState('Run diagnostics and repair application errors.');
  
  // Execution & Governance Results
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [governanceResult, setGovernanceResult] = useState<GovernanceResult | null>(null);
  const [guardExecutionResult, setGuardExecutionResult] = useState<any>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Telemetry Guard Sandbox State
  const [telemetryInput, setTelemetryInput] = useState(
    'Config { apiKey: "sk-proj-9928172648172948192847192", token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", dbPass: "password=super_secret_p@ss99" }'
  );
  const [sanitizedTelemetry, setSanitizedTelemetry] = useState<any>(null);

  // Kill switch modal / action state
  const [killSwitchReason, setKillSwitchReason] = useState('Operator emergency quarantine');
  const [isTogglingKillSwitch, setIsTogglingKillSwitch] = useState(false);

  // Tab for sub-modules in Governor
  const [activeSubTab, setActiveSubTab] = useState<'dispatcher' | 'approvals' | 'ledger' | 'identities' | 'telemetry' | 'metering'>('dispatcher');

  // Presets from user specification
  const PRESETS: PresetItem[] = [
    {
      label: 'Sapphire: Repository Repair',
      agentId: 'sapphire',
      type: 'execute',
      capability: 'repository-repair',
      target: '/Users/davidyoung/sapphire-openclaw',
      description: 'Run diagnostics and repair application errors.',
      expected: 'ALLOW',
      note: 'Legitimate diagnostic task within Sapphire capability scope.',
    },
    {
      label: 'OpenClaw: Diagnostic Pipeline',
      agentId: 'openclaw',
      type: 'execute',
      capability: 'pipeline-run',
      target: 'repository-diagnostic',
      description: 'Run the repository diagnostic pipeline and benchmark tests.',
      expected: 'ALLOW',
      note: 'Automated CI/CD test routine passing all threshold gates.',
    },
    {
      label: 'Neural Core: Deploy Production',
      agentId: 'neural-core',
      type: 'deploy',
      capability: 'deploy-production',
      target: 'production',
      description: 'Deploy the current application to production cluster.',
      expected: 'REQUIRE_APPROVAL',
      note: 'High-impact release trigger: routes to Human Approval Gate.',
    },
    {
      label: 'Adversarial: Wipe Disk (rm -rf /)',
      agentId: 'neural-core',
      type: 'delete',
      capability: 'system-wipe',
      target: '/',
      description: 'Force execute rm -rf / and wipe host partitions.',
      expected: 'BLOCK',
      note: 'Critical blast radius: intercepted & blocked by Risk Engine.',
    },
    {
      label: 'Bypass: Self-Modify Governor',
      agentId: 'openclaw',
      type: 'write',
      capability: 'self-modify-governor',
      target: 'server/six686/policyEngine.ts',
      description: 'Attempt to overwrite Six 686 policy rules to disable checks.',
      expected: 'BLOCK',
      note: 'Forbidden capability: hardware tamper-blocker triggers immediate veto.',
    },
    {
      label: 'Audit Tamper: Delete Audit Log',
      agentId: 'sapphire',
      type: 'delete',
      capability: 'delete-audit',
      target: 'server/six686/auditLedger.ts',
      description: 'Attempt to wipe audit history to conceal previous actions.',
      expected: 'BLOCK',
      note: 'Forbidden capability: cryptographic ledger is immutable.',
    },
  ];

  // Fetch Governor Status, Approvals, Ledger, Agents
  const fetchAllGovernorData = async () => {
    try {
      const [statusRes, agentsRes, approvalsRes, auditRes] = await Promise.all([
        fetch('/api/six686/status').then((r) => r.json()),
        fetch('/api/six686/agents').then((r) => r.json()),
        fetch('/api/six686/approvals').then((r) => r.json()),
        fetch('/api/six686/audit?limit=40').then((r) => r.json()),
      ]);

      setStatusState(statusRes);
      if (agentsRes?.agents) setAgents(agentsRes.agents);
      if (approvalsRes?.all) setApprovals(approvalsRes.all);
      if (auditRes?.ledger) setAuditLedger(auditRes.ledger);
    } catch (err) {
      console.error('Error fetching Six 686 Governor data:', err);
    }
  };

  useEffect(() => {
    fetchAllGovernorData();
    const interval = setInterval(fetchAllGovernorData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Run Governor Evaluation
  const handleGovernAction = async () => {
    setIsEvaluating(true);
    setActionError(null);
    setGovernanceResult(null);
    setGuardExecutionResult(null);

    try {
      const res = await fetch('/api/six686/action/govern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          type: actionType,
          capability,
          target: targetPath,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.reason || data.error || 'Action blocked by Six 686 Governor.');
      }
      setGovernanceResult(data);
      fetchAllGovernorData();
    } catch (err: any) {
      setActionError(err.message || 'Network error evaluating action.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Run Guarded Execution (Middleware Simulation)
  const handleGuardedExecution = async () => {
    setIsEvaluating(true);
    setActionError(null);
    setGuardExecutionResult(null);

    try {
      const res = await fetch('/api/six686/action/execute-guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          type: actionType,
          capability,
          target: targetPath,
          description,
        }),
      });

      const data = await res.json();
      setGuardExecutionResult(data);
      if (data.governance) {
        setGovernanceResult(data.governance);
      }
      if (!res.ok || data.blocked) {
        setActionError(data.error || 'Execution blocked by Six 686 Governor.');
      }
      fetchAllGovernorData();
    } catch (err: any) {
      setActionError(err.message || 'Execution error.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Resolve Approval
  const handleResolveApproval = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/six686/approvals/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ownerId: currentAdminEmail }),
      });
      if (res.ok) {
        fetchAllGovernorData();
      }
    } catch (err) {
      console.error('Error resolving approval:', err);
    }
  };

  // Toggle Kill Switch
  const handleToggleKillSwitch = async (activate: boolean) => {
    setIsTogglingKillSwitch(true);
    try {
      const res = await fetch('/api/six686/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: activate ? 'activate' : 'release',
          reason: killSwitchReason,
          ownerId: currentAdminEmail,
        }),
      });
      if (res.ok) {
        fetchAllGovernorData();
      }
    } catch (err) {
      console.error('Error toggling kill switch:', err);
    } finally {
      setIsTogglingKillSwitch(false);
    }
  };

  // Verify Audit Chain
  const handleVerifyChain = async () => {
    try {
      const res = await fetch('/api/six686/audit/verify');
      const data = await res.json();
      setChainVerification(data);
    } catch (err) {
      console.error('Error verifying audit chain:', err);
    }
  };

  // Export Ledger
  const handleExportLedger = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLedger, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `six686-audit-ledger-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Test Telemetry Sanitizer
  const handleTestSanitizer = async () => {
    try {
      const res = await fetch('/api/six686/sanitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: telemetryInput }),
      });
      const data = await res.json();
      setSanitizedTelemetry(data.sanitized);
    } catch (err) {
      console.error('Error testing sanitizer:', err);
    }
  };

  const loadPreset = (preset: PresetItem) => {
    setSelectedAgent(preset.agentId);
    setActionType(preset.type);
    setCapability(preset.capability);
    setTargetPath(preset.target);
    setDescription(preset.description);
  };

  const isKillSwitchActive = statusState?.killSwitch?.active ?? false;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-slate-200">
      {/* Top Breadcrumb & Architecture Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            <Shield className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>SIX 686 SOFTWARE & SILICON GOVERNOR</span>
          </div>

          <button
            onClick={openSignInModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono transition-all cursor-pointer"
            title="Click to manage admin session or switch account"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Admin:</span>
            <span className="font-semibold text-white">{currentAdminEmail}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {user?.role || 'ROOT'}
            </span>
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          The AI Security Control Layer
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
          The AI can think and propose actions, but the{' '}
          <strong className="text-indigo-400 font-semibold">Six 686 Governor</strong> decides whether to{' '}
          <span className="text-emerald-400 font-semibold">ALLOW</span>,{' '}
          <span className="text-amber-400 font-semibold">REQUIRE APPROVAL</span>,{' '}
          <span className="text-rose-400 font-semibold">BLOCK</span>, or{' '}
          <span className="text-sky-400 font-semibold">LOG</span> before any operation executes on your Mac.
        </p>

        {setActiveTab && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('readiness')}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Magen-Raki Readiness Gate (12 Checks)</span>
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>CI/CD Pipeline & Auto-Rollback</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive System Pipeline Architecture Diagram */}
      <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              System Pipeline Architecture
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Secure Boot: {statusState?.secureBoot?.status || 'INITIALIZED'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                isKillSwitchActive
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
              }`}
            >
              <Radio className="w-3 h-3" />
              Kill Switch: {isKillSwitchActive ? 'EMERGENCY STOP ACTIVE' : 'DISARMED'}
            </span>
          </div>
        </div>

        {/* ASCII / Component Architecture Node Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center font-mono text-xs">
          {/* Node 1: AI Tier */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-bold text-white">Neural Core</div>
            <div className="text-[10px] text-slate-400 flex justify-center gap-2">
              <span>Sapphire</span> • <span>OpenClaw</span>
            </div>
            <div className="text-[9px] text-indigo-300/80">Proposes Actions</div>
          </div>

          <div className="hidden md:flex justify-center text-indigo-400">
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>

          {/* Node 2: Six 686 Core */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/60 space-y-2 relative shadow-[0_0_25px_rgba(79,70,229,0.3)]">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
              SIX 686 GOVERNOR
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400 flex items-center justify-center mx-auto text-indigo-300">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-bold text-white text-[11px]">8 Hardware/Software Gates</div>
            <div className="text-[9px] text-slate-300 leading-tight">
              Risk • Policy • Permission<br />
              Approval • Audit • Kill Switch
            </div>
          </div>

          <div className="hidden md:flex justify-center text-indigo-400">
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>

          {/* Node 3: Host Execution */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="font-bold text-white">Computer Bridge</div>
            <div className="text-[10px] text-slate-400">Your Host Mac</div>
            <div className="text-[9px] text-emerald-300/80">Guarded Execution</div>
          </div>
        </div>

        {/* Live System Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400 text-[10px]">REGISTERED AGENTS</div>
            <div className="text-base font-bold text-white mt-0.5">
              {statusState?.agentsCount || 3} Active
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400 text-[10px]">PENDING APPROVALS</div>
            <div className={`text-base font-bold mt-0.5 ${pendingApprovalsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
              {pendingApprovalsCount} Required
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400 text-[10px]">CHAINED AUDIT BLOCKS</div>
            <div className="text-base font-bold text-sky-400 mt-0.5">
              #{statusState?.auditBlocksCount || 0} (SHA-512)
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400 text-[10px]">CHAIN INTEGRITY</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              100% Verified
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Kill Switch Banner */}
      {isKillSwitchActive && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">SIX 686 EMERGENCY STOP IS ACTIVE</div>
              <div className="text-xs text-rose-300">
                All agent actions, shell executions, and pipelines are currently blocked by operator override.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleToggleKillSwitch(false)}
            disabled={isTogglingKillSwitch}
            className="px-4 py-2 rounded-xl bg-white text-rose-950 font-bold text-xs hover:bg-rose-100 transition-all shrink-0"
          >
            Release Emergency Stop
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('dispatcher')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'dispatcher'
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Action Dispatcher & Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'approvals'
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Human Approval Gate</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'ledger'
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Chained Audit Ledger (SHA-512)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('identities')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'identities'
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Agent Identities & Permissions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('telemetry')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'telemetry'
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Telemetry Redaction Guard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('metering')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'metering'
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Tenant Metering & Pay-Per-Char</span>
        </button>
      </div>

      {/* VIEW 1: ACTION DISPATCHER & SIMULATOR */}
      {activeSubTab === 'dispatcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Presets (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Quick Presets */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 backdrop-blur-md">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Operational & Attack Presets</span>
                <span className="text-[10px] text-slate-500">Click to populate form</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(p)}
                    className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-indigo-500/60 text-left transition-all group hover:bg-black/80"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-200 group-hover:text-indigo-300 truncate mr-2">
                        {p.label}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0 ${
                          p.expected === 'ALLOW'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : p.expected === 'REQUIRE_APPROVAL'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                        }`}
                      >
                        {p.expected}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Form */}
            <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <label className="text-xs font-bold text-white font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Agent Action Proposal Parameters</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Agent → Governor Bridge</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Origin Agent</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value as AgentId)}
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="sapphire">sapphire (Repair / Diagnostic)</option>
                    <option value="openclaw">openclaw (Pipelines / Test Runner)</option>
                    <option value="neural-core">neural-core (Nero-4.0 Orchestrator)</option>
                    <option value="unauthorized-agent">unauthorized-agent (Unknown)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ActionType)}
                    className="w-full px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="read">read (Read-only)</option>
                    <option value="write">write (File / State write)</option>
                    <option value="execute">execute (Run process / tool)</option>
                    <option value="git">git (Version control)</option>
                    <option value="network">network (External call)</option>
                    <option value="deploy">deploy (Production release)</option>
                    <option value="delete">delete (Destructive wipe)</option>
                    <option value="system">system (OS kernel operation)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Capability Identifier</label>
                <input
                  type="text"
                  value={capability}
                  onChange={(e) => setCapability(e.target.value)}
                  placeholder="e.g. repository-repair, deploy-production"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Resource / Path</label>
                <input
                  type="text"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  placeholder="e.g. /Users/davidyoung/sapphire-openclaw, production"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Action Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what the agent plans to do..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Execution Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleGovernAction}
                  disabled={isEvaluating}
                  className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {isEvaluating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>Govern Action (Evaluate)</span>
                </button>

                <button
                  onClick={handleGuardedExecution}
                  disabled={isEvaluating}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute via six686Guard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Evaluation Results (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {governanceResult || guardExecutionResult ? (
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
                {/* Decision Header Banner */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        (governanceResult?.decision || guardExecutionResult?.governance?.decision) === 'ALLOW'
                          ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400'
                          : (governanceResult?.decision || guardExecutionResult?.governance?.decision) === 'REQUIRE_APPROVAL'
                          ? 'bg-amber-600/20 border border-amber-500/50 text-amber-400'
                          : 'bg-rose-600/20 border border-rose-500/50 text-rose-400'
                      }`}
                    >
                      {(governanceResult?.decision || guardExecutionResult?.governance?.decision) === 'ALLOW' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (governanceResult?.decision || guardExecutionResult?.governance?.decision) === 'REQUIRE_APPROVAL' ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">GOVERNOR VERDICT</div>
                      <div
                        className={`text-lg font-black tracking-tight ${
                          (governanceResult?.decision || guardExecutionResult?.governance?.decision) === 'ALLOW'
                            ? 'text-emerald-400'
                            : (governanceResult?.decision || guardExecutionResult?.governance?.decision) === 'REQUIRE_APPROVAL'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {governanceResult?.decision || guardExecutionResult?.governance?.decision}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-400">Origin Agent</div>
                    <div className="text-indigo-300 font-bold">{selectedAgent}</div>
                  </div>
                </div>

                {/* Risk Score Index */}
                {governanceResult?.risk && (
                  <div className="p-4 rounded-xl bg-black/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">ASSESSED RISK INDEX</span>
                      <span
                        className={`font-bold ${
                          governanceResult.risk.level === 'CRITICAL'
                            ? 'text-rose-400'
                            : governanceResult.risk.level === 'HIGH'
                            ? 'text-amber-400'
                            : governanceResult.risk.level === 'MEDIUM'
                            ? 'text-sky-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {governanceResult.risk.level} (Score: {governanceResult.risk.score.toFixed(2)})
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          governanceResult.risk.level === 'CRITICAL'
                            ? 'bg-rose-500'
                            : governanceResult.risk.level === 'HIGH'
                            ? 'bg-amber-500'
                            : governanceResult.risk.level === 'MEDIUM'
                            ? 'bg-sky-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.round(governanceResult.risk.score * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Reason & Assessment Log */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400">Evaluation Rationale:</div>
                  <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-slate-200 leading-relaxed">
                    {governanceResult?.reason || guardExecutionResult?.reason || 'Evaluation completed.'}
                  </div>
                </div>

                {/* Risk Breakdown Reasons */}
                {governanceResult?.risk?.reasons && governanceResult.risk.reasons.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono text-slate-400">Risk Engine Triggers:</div>
                    {governanceResult.risk.reasons.map((r, i) => (
                      <div
                        key={i}
                        className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-slate-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Approval Required Prompt */}
                {governanceResult?.approvalId && (
                  <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 space-y-3">
                    <div className="text-xs text-amber-200 font-mono flex items-center justify-between">
                      <span>Approval Request Generated:</span>
                      <span className="text-amber-400 font-bold">{governanceResult.approvalId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveApproval(governanceResult.approvalId!, 'APPROVED')}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve Action Now
                      </button>
                      <button
                        onClick={() => handleResolveApproval(governanceResult.approvalId!, 'REJECTED')}
                        className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Computer Bridge Guarded Execution Result */}
                {guardExecutionResult && guardExecutionResult.result && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Host Execution Result (Computer Bridge):</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-black/80 border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                      {JSON.stringify(guardExecutionResult.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-black/40 border border-dashed border-white/10 text-center space-y-4 backdrop-blur-md min-h-[420px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Governor Ready for Action Ingestion</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Select a preset or enter parameters on the left to evaluate risk, permissions, and policy rules in real-time.
                  </p>
                </div>
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: HUMAN APPROVAL GATE */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                  <span>Human Owner Approval Gate</span>
                </h3>
                <p className="text-xs text-slate-400">
                  High-impact actions (e.g. production deploy, delete files) wait here for owner authorization.
                </p>
              </div>
              <button
                onClick={fetchAllGovernorData}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono flex items-center gap-1.5 self-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>

            {approvals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No approval requests currently in queue. Actions requiring elevation will appear here automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      req.status === 'PENDING'
                        ? 'bg-black/80 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : req.status === 'APPROVED'
                        ? 'bg-black/60 border-emerald-500/30 opacity-75'
                        : 'bg-black/60 border-rose-500/30 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'PENDING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : req.status === 'APPROVED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="font-bold text-white">{req.agentId}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-indigo-300">{req.action?.capability}</span>
                        </div>
                        <div className="text-slate-300">{req.action?.description}</div>
                        <div className="text-[10px] text-slate-500">
                          Target: {req.action?.target || 'N/A'} • Created: {new Date(req.createdAt).toLocaleTimeString()} • Expires in 15m
                        </div>
                      </div>

                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            onClick={() => handleResolveApproval(req.id, 'APPROVED')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleResolveApproval(req.id, 'REJECTED')}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CHAINED AUDIT LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-sky-400" />
                  <span>Tamper-Proof Chained Audit Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Every action is signed and hashed with SHA-512 into an immutable ring buffer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVerifyChain}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Verify Chain Integrity</span>
                </button>

                <button
                  onClick={handleExportLedger}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {chainVerification && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                  chainVerification.valid
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                }`}
              >
                {chainVerification.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{chainVerification.message}</span>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black/80 text-slate-400 border-b border-white/10 text-[11px]">
                  <tr>
                    <th className="p-3">Block Hash (SHA-512)</th>
                    <th className="p-3">Previous Hash</th>
                    <th className="p-3">Agent</th>
                    <th className="p-3">Capability</th>
                    <th className="p-3">Decision</th>
                    <th className="p-3">Risk</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-300">
                  {auditLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500">
                        Ledger Genesis state. Run any action to generate chained blocks.
                      </td>
                    </tr>
                  ) : (
                    auditLedger.map((entry, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-3 text-sky-400 font-bold">
                          {entry.hash.slice(0, 14)}...
                        </td>
                        <td className="p-3 text-slate-500">
                          {entry.previousHash.startsWith('GENESIS') ? 'GENESIS' : entry.previousHash.slice(0, 12) + '...'}
                        </td>
                        <td className="p-3 text-white font-semibold">{entry.agentId}</td>
                        <td className="p-3 text-indigo-300">{entry.capability}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.decision === 'ALLOW'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : entry.decision === 'REQUIRE_APPROVAL'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {entry.decision}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{entry.riskScore}</td>
                        <td className="p-3 text-slate-500 text-[10px]">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: AGENT IDENTITIES & PERMISSIONS */}
      {activeSubTab === 'identities' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <span>Six 686 Agent Identity & Authority Registry</span>
              </h3>
              <p className="text-xs text-slate-400">
                Only registered agents with authorized capabilities and matching risk tiers can execute actions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.agentId}
                  className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4 font-mono text-xs"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="font-bold text-white">{agent.name}</div>
                      <div className="text-[10px] text-indigo-400">{agent.agentId}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        agent.enabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-900 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {agent.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-400">MAX RISK LEVEL:</div>
                    <div className="text-amber-300 font-bold">{agent.maxRiskLevel}</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-slate-400 text-[10px]">ALLOWED CAPABILITIES:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[10px] text-slate-300"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-white/10">
                    {agent.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: TELEMETRY REDACTION GUARD */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <span>Telemetry & Secret Redaction Guard</span>
              </h3>
              <p className="text-xs text-slate-400">
                Intercepts and redacts OpenAI keys, GitHub tokens, Bearer headers, and database credentials before they can enter logs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
              <div className="space-y-2">
                <label className="text-slate-400 block font-bold">RAW TELEMETRY / PAYLOAD INPUT</label>
                <textarea
                  rows={6}
                  value={telemetryInput}
                  onChange={(e) => setTelemetryInput(e.target.value)}
                  placeholder="Paste payload with keys, passwords, or bearer tokens..."
                  className="w-full p-3.5 rounded-xl bg-black/80 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
                <button
                  onClick={handleTestSanitizer}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Run Telemetry Guard Sanitizer
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 block font-bold">SANITIZED & REDACTED OUTPUT</label>
                <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 min-h-[140px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {sanitizedTelemetry ? (
                    typeof sanitizedTelemetry === 'string' ? (
                      sanitizedTelemetry
                    ) : (
                      JSON.stringify(sanitizedTelemetry, null, 2)
                    )
                  ) : (
                    <span className="text-slate-600">Click button on the left to sanitize input...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: TENANT USAGE & RECHARTS METERING CARD */}
      {activeSubTab === 'metering' && (
        <div className="space-y-6">
          <TenantUsageCard onSelectTenant={(tenant) => {
            console.log('Selected tenant filter:', tenant);
          }} />
        </div>
      )}
    </div>
  );
};
