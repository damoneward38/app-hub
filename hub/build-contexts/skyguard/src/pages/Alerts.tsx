import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Ban, 
  KeyRound, 
  Activity,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code,
  Copy,
  Plus,
  Search,
  User,
  UserX,
  Server,
  Layers,
  Terminal,
  RefreshCw,
  Eye,
  CheckCircle,
  HelpCircle,
  FolderTree,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { initialAlerts, getSystemHealth } from '../services/mockSecurityApi';
import { AlertIncident, AlertSeverity, AlertStatus, HealthCheckResponse } from '../types';

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertIncident[]>(initialAlerts);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<AlertIncident | null>(null);
  const [jsonModalAlert, setJsonModalAlert] = useState<AlertIncident | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);
  const [showTreeHierarchy, setShowTreeHierarchy] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // New alert form state
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertSeverity, setNewAlertSeverity] = useState<AlertSeverity>('high');
  const [newAlertStatus, setNewAlertStatus] = useState<AlertStatus>('new');
  const [newAlertSource, setNewAlertSource] = useState('authentication');
  const [newAlertAsset, setNewAlertAsset] = useState('api.skyguard.com');
  const [newAlertAssignee, setNewAlertAssignee] = useState<string>('unassigned');

  // Compute severity and status counts
  const severityCounts = useMemo(() => {
    return {
      all: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
    };
  }, [alerts]);

  const statusCounts = useMemo(() => {
    return {
      all: alerts.length,
      new: alerts.filter(a => a.status === 'new' || a.status === 'open').length,
      investigating: alerts.filter(a => a.status === 'investigating').length,
      resolved: alerts.filter(a => a.status === 'resolved' || a.status === 'contained').length,
    };
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Severity Filter
      if (severityFilter !== 'all' && a.severity !== severityFilter) {
        return false;
      }
      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'new' && a.status !== 'new' && a.status !== 'open') return false;
        if (statusFilter === 'investigating' && a.status !== 'investigating') return false;
        if (statusFilter === 'resolved' && a.status !== 'resolved' && a.status !== 'contained') return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = a.id.toLowerCase().includes(q);
        const matchesTitle = a.title.toLowerCase().includes(q);
        const matchesAsset = (a.affectedAsset || a.target || '').toLowerCase().includes(q);
        const matchesSource = a.source.toLowerCase().includes(q);
        const matchesAssignee = (a.assignedTo || '').toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesAsset && !matchesSource && !matchesAssignee) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, severityFilter, statusFilter, searchQuery]);

  // Handler to update status
  const handleUpdateStatus = (id: string, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    const updated = alerts.find(a => a.id === id);
    setActionSuccessMsg(`Updated status of [${id}] to "${newStatus.toUpperCase()}".`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Handler to update assignee
  const handleUpdateAssignee = (id: string, assignee: string | null) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, assignedTo: assignee } : a))
    );
    setActionSuccessMsg(`Updated assignment of [${id}] to ${assignee ? `"${assignee}"` : 'null (Unassigned)'}.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Handler for SOAR containment
  const handleExecuteContainment = (action: string) => {
    if (!selectedIncident) return;
    const targetAsset = selectedIncident.affectedAsset || selectedIncident.target || 'affectedAsset';
    setActionSuccessMsg(`Executed containment: [${action}] on target ${targetAsset}. Status marked as RESOLVED.`);
    
    setAlerts((prev) =>
      prev.map((a) => (a.id === selectedIncident.id ? { ...a, status: 'resolved' } : a))
    );

    setTimeout(() => {
      setActionSuccessMsg(null);
      setSelectedIncident(null);
    }, 2500);
  };

  // Handler to create new alert
  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle.trim()) return;

    const newId = `alert_${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: AlertIncident = {
      id: newId,
      title: newAlertTitle.trim(),
      severity: newAlertSeverity,
      status: newAlertStatus,
      source: newAlertSource.trim() || 'authentication',
      createdAt: new Date().toISOString(),
      affectedAsset: newAlertAsset.trim() || 'api.skyguard.com',
      assignedTo: newAlertAssignee === 'unassigned' ? null : newAlertAssignee,
      target: newAlertAsset.trim() || 'api.skyguard.com',
      timestamp: 'Just now',
      description: `User-reported or telemetry triggered incident for ${newAlertAsset}.`,
      mitigationSteps: [
        'Perform zero-trust enclave isolation',
        'Verify origin IP reputation and token exchange logs',
        'Quarantine affected session tokens'
      ],
      evidenceDigest: `sha256:${Math.random().toString(16).substring(2, 12)}...`
    };

    setAlerts([newIncident, ...alerts]);
    setShowCreateModal(false);
    setNewAlertTitle('');
    setActionSuccessMsg(`Successfully registered new alert [${newId}] - "${newIncident.title}"`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Helper to format exact user JSON representation
  const getCleanJson = (alert: AlertIncident) => {
    return {
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      status: alert.status === 'open' ? 'new' : alert.status === 'contained' ? 'resolved' : alert.status,
      source: alert.source,
      createdAt: alert.createdAt || alert.timestamp || new Date().toISOString(),
      affectedAsset: alert.affectedAsset || alert.target || 'api.skyguard.com',
      assignedTo: alert.assignedTo ?? null,
    };
  };

  const handleCopyAlertJson = (alert: AlertIncident) => {
    const jsonStr = JSON.stringify(getCleanJson(alert), null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const healthData = getSystemHealth();

  return (
    <div className="space-y-6 font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* ALERT CENTER HEADER & TOP BAR */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOC Incident Management</span>
            </span>
            <button
              id="btn-open-health-status"
              onClick={() => setShowHealthModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>GET / Health: {healthData.status.toUpperCase()}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ALERT CENTER
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time Threat Interception • Severity Matrix • Lifecycle Triage &amp; Containment
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-toggle-tree-hierarchy"
            onClick={() => setShowTreeHierarchy(!showTreeHierarchy)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <FolderTree className="w-4 h-4 text-slate-600" />
            <span>{showTreeHierarchy ? 'Hide Tree Hierarchy' : 'Show Tree Hierarchy'}</span>
          </button>

          <button
            id="btn-create-new-alert"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Alert</span>
          </button>
        </div>
      </div>

      {/* Action Success Notification */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TREE HIERARCHY / STRUCTURAL SCHEMA DISPLAY */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showTreeHierarchy && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                ALERT CENTER Architecture &amp; Categorization Tree
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Active Incidents: {alerts.length}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            {/* Tree representation */}
            <div className="bg-black/60 p-4 rounded-xl border border-slate-850 text-emerald-400 overflow-x-auto leading-relaxed select-all">
              <pre className="text-[11px]">
{`ALERT CENTER
│
├── Severity Levels
│   ├── Critical (${severityCounts.critical})
│   ├── High (${severityCounts.high})
│   ├── Medium (${severityCounts.medium})
│   └── Low (${severityCounts.low})
│
├── Lifecycle Statuses
│   ├── New (${statusCounts.new})
│   ├── Investigating (${statusCounts.investigating})
│   └── Resolved (${statusCounts.resolved})
│
└── Example Canonical Schema Object
    {
      id: "alert_123",
      title: "Repeated failed login attempts",
      severity: "high",
      status: "new",
      source: "authentication",
      createdAt: "2026-08-20T06:18:22Z",
      affectedAsset: "api.skyguard.com",
      assignedTo: null
    }`}
              </pre>
            </div>

            {/* Quick Filter Matrix & Stats */}
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 text-[11px] font-bold block mb-2">
                  1. Filter by Severity:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                      className={`p-2 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer text-left border ${
                        severityFilter === sev
                          ? 'bg-blue-600 text-white border-blue-500'
                          : sev === 'critical' ? 'bg-rose-950/40 text-rose-400 border-rose-900/60 hover:bg-rose-900/50'
                          : sev === 'high' ? 'bg-amber-950/40 text-amber-400 border-amber-900/60 hover:bg-amber-900/50'
                          : sev === 'medium' ? 'bg-blue-950/40 text-blue-400 border-blue-900/60 hover:bg-blue-900/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 uppercase">{sev}</div>
                      <div className="text-sm font-black">{severityCounts[sev]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-bold block mb-2">
                  2. Filter by Lifecycle Status:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['new', 'investigating', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(statusFilter === st ? 'all' : st)}
                      className={`p-2 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer text-left border ${
                        statusFilter === st
                          ? 'bg-blue-600 text-white border-blue-500'
                          : st === 'new' ? 'bg-purple-950/40 text-purple-400 border-purple-900/60 hover:bg-purple-900/50'
                          : st === 'investigating' ? 'bg-amber-950/40 text-amber-400 border-amber-900/60 hover:bg-amber-900/50'
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:bg-emerald-900/50'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 uppercase">{st}</div>
                      <div className="text-sm font-black">{statusCounts[st]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {(severityFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">
                    Active filters: {severityFilter !== 'all' ? `[Severity: ${severityFilter}] ` : ''}{statusFilter !== 'all' ? `[Status: ${statusFilter}]` : ''}
                  </span>
                  <button
                    onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); }}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SEARCH AND INTERACTIVE FILTER CONTROLS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Alert ID (e.g. alert_123), title, affected asset, or source..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Severity Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">Severity:</span>
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold capitalize transition-all cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sev} {sev !== 'all' && `(${severityCounts[sev]})`}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400 mr-1">Status:</span>
            {(['all', 'new', 'investigating', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st} {st !== 'all' && `(${statusCounts[st]})`}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Showing <strong className="text-slate-800">{filteredAlerts.length}</strong> of {alerts.length} incidents
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* INCIDENT ALERT CARDS LIST */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Alerts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
              No active security alerts match the selected severity, status, or search filters.
            </p>
            <button
              onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAlerts.map((incident) => {
            const isResolved = incident.status === 'resolved' || incident.status === 'contained';
            const isInvestigating = incident.status === 'investigating';
            const isNew = incident.status === 'new' || incident.status === 'open';

            return (
              <div
                key={incident.id}
                id={`alert-card-${incident.id}`}
                className={`bg-white rounded-2xl border transition-all shadow-sm space-y-4 p-5 sm:p-6 ${
                  incident.id === 'alert_123' 
                    ? 'border-blue-300 ring-1 ring-blue-500/20 bg-blue-50/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Severity, ID, Title, CreatedAt, Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Severity Badge */}
                    <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase tracking-wider ${
                      incident.severity === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      incident.severity === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      incident.severity === 'medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {incident.severity}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isInvestigating ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse'
                    }`}>
                      {incident.status}
                    </span>

                    {/* Alert ID */}
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {incident.id}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {incident.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{incident.createdAt || incident.timestamp}</span>
                  </div>
                </div>

                {/* Description */}
                {incident.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {incident.description}
                  </p>
                )}

                {/* Key Schema Fields Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Source:</span>
                    <strong className="text-slate-800">{incident.source}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Affected Asset:</span>
                    <strong className="text-blue-700 font-semibold truncate block" title={incident.affectedAsset || incident.target}>
                      {incident.affectedAsset || incident.target}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Assigned To:</span>
                    {incident.assignedTo ? (
                      <span className="text-slate-800 font-semibold flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-600" />
                        <span className="truncate">{incident.assignedTo}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">null (Unassigned)</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Created At:</span>
                    <span className="text-slate-600 truncate block">
                      {incident.createdAt || incident.timestamp}
                    </span>
                  </div>
                </div>

                {/* Action Bar: Status updates, Inspect SOAR, Raw JSON view */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Status Progression Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400 mr-1">Move Status:</span>
                    
                    {incident.status !== 'new' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'new')}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        → New
                      </button>
                    )}

                    {incident.status !== 'investigating' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'investigating')}
                        className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        → Investigating
                      </button>
                    )}

                    {incident.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'resolved')}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        ✓ Mark Resolved
                      </button>
                    )}

                    {/* Assignment Toggle */}
                    <button
                      onClick={() => handleUpdateAssignee(incident.id, incident.assignedTo ? null : 'Security Analyst Team')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-medium transition-colors cursor-pointer ml-1"
                      title="Toggle assignment"
                    >
                      {incident.assignedTo ? 'Clear Assignee' : 'Assign to Analyst'}
                    </button>
                  </div>

                  {/* Right: Inspect Containment & View JSON */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setJsonModalAlert(incident)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <Code className="w-3.5 h-3.5 text-slate-600" />
                      <span>Inspect JSON</span>
                    </button>

                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <span>SOAR Playbook</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 1: SYSTEM HEALTH MODAL (GET /) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enclave Health API Check</h3>
                  <p className="text-xs font-mono text-slate-500">Endpoint: GET / or GET /health</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(healthData.services).map(([srv, st]) => (
                <div key={srv} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">{srv}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-700 capitalize">{st}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Payload: Response Body (application/json)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(healthData, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 select-all">
                <pre>{JSON.stringify(healthData, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHealthModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Health Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 2: RAW JSON ALERT INSPECTOR MODAL */}
      {/* ─────────────────────────────────────────────────────────── */}
      {jsonModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Alert Center Data Model Record
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {jsonModalAlert.id} - {jsonModalAlert.title}
                </h3>
              </div>
              <button
                onClick={() => setJsonModalAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Exact JSON Schema:</span>
                <button
                  onClick={() => handleCopyAlertJson(jsonModalAlert)}
                  className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedJson ? 'Copied to Clipboard!' : 'Copy Canonical JSON'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 select-all">
                <pre>{JSON.stringify(getCleanJson(jsonModalAlert), null, 2)}</pre>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">
                Schema validated for SIEM &amp; SOC HEC ingest
              </span>
              <button
                onClick={() => setJsonModalAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 3: SOAR MITIGATION & CONTAINMENT MODAL */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 block mb-1">
                  SOAR INCIDENT TRIAGE &amp; QUARANTINE MODAL
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedIncident.id} • Target: {selectedIncident.affectedAsset || selectedIncident.target}</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Playbook Steps */}
              {selectedIncident.mitigationSteps && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Automated Mitigation Playbook:</div>
                  {selectedIncident.mitigationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Immediate Enclave Execution Buttons */}
              <div className="font-bold text-slate-900 pt-1">Execute Immediate Enclave Actions:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleExecuteContainment('Blackhole Origin IP & Rate-Limit WAF')}
                  className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer text-left"
                >
                  <Ban className="w-4 h-4 mb-1" />
                  <div>Blackhole Origin IP</div>
                </button>

                <button
                  onClick={() => handleExecuteContainment('Revoke All Active Ephemeral Sessions')}
                  className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="w-4 h-4 mb-1" />
                  <div>Revoke JIT Sessions</div>
                </button>

                <button
                  onClick={() => handleExecuteContainment('Isolate Network Pod Compartment')}
                  className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer text-left"
                >
                  <ShieldAlert className="w-4 h-4 mb-1" />
                  <div>Isolate Enclave Host</div>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 4: CREATE NEW ALERT MODAL */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Manual Alert Registration
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Create Security Alert
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  placeholder="e.g. Repeated failed login attempts"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={newAlertSeverity}
                    onChange={(e) => setNewAlertSeverity(e.target.value as AlertSeverity)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lifecycle Status *
                  </label>
                  <select
                    value={newAlertStatus}
                    onChange={(e) => setNewAlertStatus(e.target.value as AlertStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Source Telemetry *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAlertSource}
                    onChange={(e) => setNewAlertSource(e.target.value)}
                    placeholder="e.g. authentication"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Affected Asset *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAlertAsset}
                    onChange={(e) => setNewAlertAsset(e.target.value)}
                    placeholder="e.g. api.skyguard.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={newAlertAssignee}
                  onChange={(e) => setNewAlertAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="unassigned">null (Unassigned)</option>
                  <option value="Security Analyst Team">Security Analyst Team</option>
                  <option value="WAF Bot Shield">WAF Bot Shield</option>
                  <option value="KMS Admin Enclave">KMS Admin Enclave</option>
                  <option value="Risk-Based Auth Agent">Risk-Based Auth Agent</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Create Alert Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
