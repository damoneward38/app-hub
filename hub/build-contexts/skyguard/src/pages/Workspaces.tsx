import React, { useState } from 'react';
import { 
  FolderTree, 
  Layers, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Globe, 
  Plus, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  Lock, 
  Server, 
  Terminal, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileText,
  Building2,
  RefreshCw,
  Search
} from 'lucide-react';
import { useWorkspace } from '../hooks/useWorkspace';
import { useAuth } from '../hooks/useAuth';
import { WorkspaceNode, WorkspaceUser, AssetCategory, InventoryAsset } from '../types';

export default function Workspaces() {
  const { 
    workspaces, 
    activeWorkspaceId, 
    activeWorkspace, 
    setActiveWorkspaceId, 
    createWorkspace,
    resolveAlert,
    addUserToWorkspace,
    addAssetToWorkspace,
    auditLogs
  } = useWorkspace();

  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'assets' | 'alerts' | 'reports' | 'audit'>('overview');
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Form states
  const [newWsName, setNewWsName] = useState('');
  const [newWsApex, setNewWsApex] = useState('');
  const [newWsTier, setNewWsTier] = useState<WorkspaceNode['tier']>('Enterprise Enclave');
  const [newWsEnv, setNewWsEnv] = useState<WorkspaceNode['environment']>('production');
  const [newWsDesc, setNewWsDesc] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'analyst' | 'viewer'>('analyst');
  const [newUserTitle, setNewUserTitle] = useState('');

  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('APIs');
  const [newAssetIdent, setNewAssetIdent] = useState('');

  const notify = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim() || !newWsApex.trim()) return;

    const created = createWorkspace({
      name: newWsName.trim(),
      displayName: `${newWsName.trim()} (${newWsTier})`,
      apexDomain: newWsApex.trim(),
      tier: newWsTier,
      environment: newWsEnv,
      description: newWsDesc.trim() || 'Custom isolated workspace partition.',
    });

    setShowCreateWsModal(false);
    setActiveWorkspaceId(created.id);
    setNewWsName('');
    setNewWsApex('');
    notify(`Created and activated workspace: ${created.name} (${created.id})`);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const added = addUserToWorkspace(activeWorkspaceId, {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      mfaEnabled: true,
      lastActive: 'Just now',
      title: newUserTitle.trim() || 'Security Member',
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    notify(`Added member ${added.name} to ${activeWorkspace.name}`);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetIdent.trim()) return;

    const newAsset: InventoryAsset = {
      id: `ast_${newAssetCategory.toLowerCase().substring(0, 3)}_${Math.floor(100 + Math.random() * 900)}`,
      name: newAssetName.trim(),
      category: newAssetCategory,
      identifier: newAssetIdent.trim(),
      parentApex: activeWorkspace.apexDomain,
      status: 'healthy',
      ipOrHost: 'Zero-Trust Shielded Host',
      environment: activeWorkspace.environment,
      monitoringActive: true,
      compliancePassing: true,
      securityScore: 100.0,
      lastScan: 'Just now',
      tags: ['Multi-Tenant Isolated', activeWorkspace.name],
      vulnerabilitiesCount: 0,
      wafShielded: true,
    };

    addAssetToWorkspace(activeWorkspaceId, newAsset);
    setShowAddAssetModal(false);
    setNewAssetName('');
    setNewAssetIdent('');
    notify(`Registered asset [${newAsset.identifier}] in ${activeWorkspace.name}`);
  };

  const handleResolveAlert = (alertId: string) => {
    const auditRecord = resolveAlert(
      alertId, 
      activeWorkspaceId, 
      'Resolved via Workspace Incident Response Console; Origin quarantined & access token revoked'
    );
    notify(`Alert [${alertId}] resolved. Emitted canonical audit log [${auditRecord.id}]`);
  };

  // Find audit_123 or top record
  const primaryAuditRecord = auditLogs.find(a => a.id === 'audit_123') || auditLogs[0];

  return (
    <div className="space-y-6 font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* HEADER & CONTROLS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Tenant Architecture</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold">
              Root: SKYGUARD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            WORKSPACES &amp; AUDIT LOGS
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            SKYGUARD ➔ Workspace A &amp; Workspace B [Users • Assets • Alerts • Reports]
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-create-workspace"
            onClick={() => setShowCreateWsModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SKYGUARD HIERARCHY TREE VISUALIZER */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              SkyGuard Sovereign Workspace Topology
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Active Workspace: <strong className="text-emerald-400">{activeWorkspace.name} ({activeWorkspace.id})</strong>
          </span>
        </div>

        {/* The Exact Tree Layout Requested */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tree Diagram */}
          <div className="lg:col-span-6 bg-black/60 p-5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>CANONICAL WORKSPACE TOPOLOGY</span>
              <span className="text-blue-400">2 Isolated Partitions</span>
            </div>
            <pre className="text-[12px]">
{`SKYGUARD
│
├── Workspace A (workspace_123)
│      ├── Users (${workspaces.find(w => w.id === 'workspace_123')?.users.length || 3})
│      ├── Assets (${workspaces.find(w => w.id === 'workspace_123')?.assets.length || 7})
│      ├── Alerts (${workspaces.find(w => w.id === 'workspace_123')?.alerts.filter(a => a.status !== 'resolved').length || 1} Open)
│      └── Reports (${workspaces.find(w => w.id === 'workspace_123')?.reports.length || 4})
│
└── Workspace B (workspace_456)
       ├── Users (${workspaces.find(w => w.id === 'workspace_456')?.users.length || 2})
       ├── Assets (${workspaces.find(w => w.id === 'workspace_456')?.assets.length || 4})
       ├── Alerts (${workspaces.find(w => w.id === 'workspace_456')?.alerts.filter(a => a.status !== 'resolved').length || 0} Open)
       └── Reports (${workspaces.find(w => w.id === 'workspace_456')?.reports.length || 2})`}
            </pre>
          </div>

          {/* Canonical Audit Record Highlight Box */}
          <div className="lg:col-span-6 bg-blue-950/20 p-5 rounded-xl border border-blue-900/60 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] uppercase">
                <Terminal className="w-3.5 h-3.5" />
                <span>Canonical Audit Record ({primaryAuditRecord.id})</span>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(primaryAuditRecord, null, 2), 'canonical-audit-json')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedId === 'canonical-audit-json' ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-black/60 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-blue-950 leading-snug select-all">
              <pre>{JSON.stringify(primaryAuditRecord, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>Action: <strong className="text-amber-400">{primaryAuditRecord.action}</strong></span>
              <span>Entity: <strong className="text-purple-400">{primaryAuditRecord.entity}</strong></span>
              <span>Target: <strong className="text-blue-300">{primaryAuditRecord.entityId}</strong></span>
            </div>
          </div>
        </div>

        {/* Workspace Switcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            const openAlerts = ws.alerts.filter(a => a.status !== 'resolved').length;

            return (
              <div
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-900/30 border-blue-500 shadow-lg ring-1 ring-blue-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {ws.name}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{ws.id}</span>
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active Enclave</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 hover:text-slate-300">
                      Switch Workspace ➔
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white mb-1">
                  {ws.displayName}
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                  {ws.description}
                </p>

                {/* 4 Pillars counts */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono bg-black/40 p-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Users</span>
                    <strong className="text-blue-400 text-xs">{ws.users.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assets</span>
                    <strong className="text-emerald-400 text-xs">{ws.assets.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Alerts</span>
                    <strong className={`text-xs ${openAlerts > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {openAlerts} Open
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reports</span>
                    <strong className="text-purple-400 text-xs">{ws.reports.length}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ACTIVE WORKSPACE EXPLORER (Users / Assets / Alerts / Reports / Audit Logs) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold uppercase">
                Partition Explorer
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">
                {activeWorkspace.displayName} • Apex: {activeWorkspace.apexDomain}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Workspace Resource Hierarchy
            </h2>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: FolderTree },
              { id: 'users', label: `Users (${activeWorkspace.users.length})`, icon: Users },
              { id: 'assets', label: `Assets (${activeWorkspace.assets.length})`, icon: Layers },
              { id: 'alerts', label: `Alerts (${activeWorkspace.alerts.length})`, icon: ShieldAlert },
              { id: 'reports', label: `Reports (${activeWorkspace.reports.length})`, icon: BarChart3 },
              { id: 'audit', label: `Audit Trail (${auditLogs.filter(a => a.workspaceId === activeWorkspaceId).length})`, icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBTAB 1: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">1. Users Enclave</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{activeWorkspace.users.length}</div>
                <span className="text-[10px] text-emerald-600 font-bold">100% MFA Enforced</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">2. Ingested Assets</span>
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{activeWorkspace.assets.length}</div>
                <span className="text-[10px] text-emerald-600 font-bold">mTLS Ingress Active</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">3. Incident Alerts</span>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {activeWorkspace.alerts.filter(a => a.status !== 'resolved').length} Open
                </div>
                <span className="text-[10px] text-slate-500">{activeWorkspace.alerts.length} total logged</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">4. Compliance Reports</span>
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{activeWorkspace.reports.length}</div>
                <span className="text-[10px] text-purple-600 font-bold">SOC 2 &amp; ISO Published</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Zero-Trust Multi-Tenancy Guarantee:</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-sans">
                Each workspace partition maintains strict cryptographic boundary isolation. Security findings, users, telemetry tokens, and audit trails in <strong>{activeWorkspace.name}</strong> are cryptographically signed with dedicated enclave keys and never bleed across partitions.
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 2: USERS */}
        {activeSubTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Enrolled Team Members &amp; RBAC Roles
              </span>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite User</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeWorkspace.users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{u.id}</span>
                      <strong className="text-slate-900 text-sm font-sans block">{u.name}</strong>
                      <span className="text-slate-500 text-xs">{u.email}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Title:</span>
                      <span className="text-slate-800 font-sans font-bold">{u.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MFA Status:</span>
                      <span className="text-emerald-700 font-bold">✓ Hardware FIDO2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Active:</span>
                      <span className="text-slate-700">{u.lastActive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: ASSETS */}
        {activeSubTab === 'assets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Monitored Assets under {activeWorkspace.apexDomain}
              </span>
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Asset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWorkspace.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                      {asset.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      Score: {asset.securityScore}%
                    </span>
                  </div>

                  <div className="font-sans font-bold text-slate-900 text-sm">
                    {asset.name}
                  </div>
                  <div className="text-[11px] text-blue-600 truncate bg-white px-2 py-1 rounded border border-slate-200">
                    {asset.identifier}
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                    <span>Host: {asset.ipOrHost}</span>
                    <span>Env: {asset.environment}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 4: ALERTS */}
        {activeSubTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Active &amp; Historical Incidents for {activeWorkspace.name}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeWorkspace.alerts.map((al) => {
                const isResolved = al.status === 'resolved';

                return (
                  <div
                    key={al.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          al.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                          al.severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {al.severity}
                        </span>

                        <span className="font-bold text-slate-900 font-sans text-sm">
                          {al.title}
                        </span>

                        <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {al.id}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {al.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-sans">
                        {al.description}
                      </p>

                      <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                        <span>Target: <strong className="text-slate-700">{al.target || al.affectedAsset}</strong></span>
                        <span>Logged: {al.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isResolved ? (
                        <button
                          onClick={() => handleResolveAlert(al.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve &amp; Emit Audit Log</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          ✓ Resolved in Audit Log
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 5: REPORTS */}
        {activeSubTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Compliance Briefings &amp; Sovereign Evidence Dossiers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {activeWorkspace.reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold uppercase block mb-1">
                        {rep.type} Evidence
                      </span>
                      <strong className="text-slate-900 font-sans text-sm block">{rep.title}</strong>
                      <span className="text-[11px] text-slate-500">Period: {rep.period}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Score: {rep.securityScore}%
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Generated: {new Date(rep.generatedAt).toLocaleDateString()}</span>
                    <span>File Size: {rep.fileSize}</span>
                    <span className="text-blue-600 font-bold">Signed Enclave PDF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 6: CANONICAL AUDIT TRAIL */}
        {activeSubTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase block">
                  Canonical Audit Log Stream ({activeWorkspace.name})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Schema: id • workspaceId • userId • action • entity • entityId • createdAt • metadata
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {auditLogs
                .filter((a) => a.workspaceId === activeWorkspaceId)
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                          {log.id}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                          {log.action}
                        </span>

                        <span className="text-[11px] text-slate-600 font-bold">
                          Entity: <strong className="text-purple-700">{log.entity}</strong> ➔ {log.entityId}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-4 pt-1">
                        <span>Workspace: <strong className="text-slate-800">{log.workspaceId}</strong></span>
                        <span>User: <strong className="text-slate-800">{log.userId}</strong></span>
                        <span>Timestamp: {log.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Inspect Raw Schema
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 1: INSPECT RAW AUDIT LOG RECORD */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Canonical Audit Log Payload
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedAuditLog.id} • {selectedAuditLog.action}</h3>
                <p className="text-xs text-slate-500 font-mono">Workspace: {selectedAuditLog.workspaceId}</p>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Exact Schema Object:</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedAuditLog, null, 2), 'modal-audit-copy')}
                  className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedId === 'modal-audit-copy' ? 'Copied JSON!' : 'Copy Schema JSON'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 select-all leading-relaxed">
                <pre>{JSON.stringify(selectedAuditLog, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 2: CREATE WORKSPACE */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showCreateWsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Multi-Tenancy Setup
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Provision New Workspace Enclave
                </h3>
              </div>
              <button
                onClick={() => setShowCreateWsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Workspace C"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Apex Domain Anchor *
                </label>
                <input
                  type="text"
                  required
                  value={newWsApex}
                  onChange={(e) => setNewWsApex(e.target.value)}
                  placeholder="e.g. branch.mycompany.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enclave Tier *
                  </label>
                  <select
                    value={newWsTier}
                    onChange={(e) => setNewWsTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Enterprise Enclave">Enterprise Enclave</option>
                    <option value="Staging Sandbox">Staging Sandbox</option>
                    <option value="Sovereign FedRAMP">Sovereign FedRAMP</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Environment *
                  </label>
                  <select
                    value={newWsEnv}
                    onChange={(e) => setNewWsEnv(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="internal">Internal Sandbox</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="e.g. EU Sovereign Customer Operations Enclave"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Provision Partition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 3: INVITE USER */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  User Enrolment • {activeWorkspace.name}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Invite Member into {activeWorkspace.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. alex.morgan@mycompany.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="analyst">Security Analyst</option>
                    <option value="viewer">Auditor / Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newUserTitle}
                    onChange={(e) => setNewUserTitle(e.target.value)}
                    placeholder="e.g. Lead Penetration Tester"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 4: ADD ASSET */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Asset Onboarding • {activeWorkspace.name}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Register Asset under {activeWorkspace.apexDomain}
                </h3>
              </div>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. Identity Ingress Gateway"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                >
                  <option value="APIs">APIs</option>
                  <option value="Websites">Websites</option>
                  <option value="Domains">Domains</option>
                  <option value="Servers">Servers</option>
                  <option value="Cloud Accounts">Cloud Accounts</option>
                  <option value="Applications">Applications</option>
                  <option value="Databases">Databases</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identifier / FQDN *
                </label>
                <input
                  type="text"
                  required
                  value={newAssetIdent}
                  onChange={(e) => setNewAssetIdent(e.target.value)}
                  placeholder="e.g. https://auth.mycompany.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Register in Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
