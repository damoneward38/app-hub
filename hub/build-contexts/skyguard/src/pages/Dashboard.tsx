import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Lock, 
  FileCheck2, 
  Zap, 
  ArrowUpRight, 
  Server, 
  Globe, 
  RefreshCw, 
  CheckCircle2,
  Filter,
  Flame,
  KeyRound,
  Download,
  ArrowDown,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { featureSetsMeta } from '../data/features';
import { initialAlerts, initialFrameworks, mockSecurityEvents, initialSecurityFindings, initialProtectedAssets, initialDsarRequests } from '../services/mockSecurityApi';

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState(mockSecurityEvents);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompletedMsg, setScanCompletedMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'ascii'>('visual');

  const handleRunMeshScan = () => {
    setIsScanning(true);
    setScanCompletedMsg(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompletedMsg('Zero-Trust Mesh & 78 Modules Integrity Audit: PASSED (Live Score: 87/100 • 24 Assets Protected)');
    }, 1200);
  };

  // Dashboard Core Metrics
  const securityScore = 87; // 87 / 100
  const activeAlertsCount = 3; // 3 Active Alerts (1 Open, 2 Investigating)
  const protectedAssetsCount = 24; // 24 Protected Sovereign Enclaves
  const complianceStatusPercent = 92; // 92% Compliance Controls Passed
  const privacyRequestsCount = 5; // 5 DSAR & Privacy Requests

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Welcome & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sovereign Enclave Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            SkyGuard Security Posture Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Tenant: <strong className="text-slate-800">{user?.tenantName}</strong> • Managed by {user?.name} ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunMeshScan}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Mesh...' : 'Run Enclave Health Audit'}</span>
          </button>

          <Link
            to="/app/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {scanCompletedMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{scanCompletedMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* PRIMARY CENTERPIECE: SKYGUARD DASHBOARD CARD & DRILL-DOWNS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="font-mono text-sm font-black tracking-widest uppercase text-white">
              SKYGUARD DASHBOARD
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
              POSTURE MATRIX v4.2
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'visual' ? 'ascii' : 'visual')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>{viewMode === 'visual' ? 'View ASCII Format' : 'View Visual Cards'}</span>
            </button>
          </div>
        </div>

        {/* ASCII View Mode */}
        {viewMode === 'ascii' && (
          <div className="p-6 font-mono text-xs text-emerald-400 overflow-x-auto bg-black/80 space-y-4">
            <pre className="leading-tight select-all">
{`┌───────────────────────────────────────────┐
│             SKYGUARD DASHBOARD            │
├───────────────────────────────────────────┤
│                                           │
│ Security Score              87 / 100      │
│                                           │
│ Active Alerts                     3       │
│                                           │
│ Protected Assets                 24       │
│                                           │
│ Compliance Status             92%         │
│                                           │
│ Privacy Requests                 5        │
│                                           │
└───────────────────────────────────────────┘
Security Score
      ↓
Security Findings  (/app/security?tab=findings)

Active Alerts
      ↓
Alert Center       (/app/alerts)

Compliance
      ↓
Compliance Controls(/app/compliance)

Privacy Requests
      ↓
Privacy Center     (/app/privacy)`}
            </pre>
            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={() => setViewMode('visual')}
                className="text-xs text-blue-400 underline font-bold cursor-pointer"
              >
                Switch back to Interactive Visual Matrix →
              </button>
            </div>
          </div>
        )}

        {/* Visual Interactive Dashboard Mode */}
        {viewMode === 'visual' && (
          <div className="p-6 space-y-6">
            {/* The 5 Key Telemetry Row Items with Direct Drill-Down Routes */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Row Item 1: Security Score -> Security Findings */}
              <Link
                to="/app/security?tab=findings"
                className="group p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Security Score</span>
                  <span className="p-1 rounded bg-blue-950 text-blue-400 text-[10px] font-mono font-bold">
                    GRADE A
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black font-mono text-white tracking-tight">
                    87 <span className="text-sm font-sans text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-blue-400 group-hover:text-blue-300 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Security Findings</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Row Item 2: Active Alerts -> Alert Center */}
              <Link
                to="/app/alerts"
                className="group p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Active Alerts</span>
                  <span className="p-1 rounded bg-rose-950 text-rose-400 text-[10px] font-mono font-bold">
                    P1 ACTION
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black font-mono text-rose-400 tracking-tight">
                    3
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-rose-400 group-hover:text-rose-300 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Alert Center</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Row Item 3: Protected Assets -> Protected Assets Registry */}
              <Link
                to="/app/security?tab=assets"
                className="group p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Protected Assets</span>
                  <span className="p-1 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold">
                    ENCLAVES
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    24
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 group-hover:text-emerald-300 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Asset Registry</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Row Item 4: Compliance Status -> Compliance Controls */}
              <Link
                to="/app/compliance"
                className="group p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Compliance Status</span>
                  <span className="p-1 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono font-bold">
                    138 / 150
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black font-mono text-cyan-400 tracking-tight">
                    92<span className="text-sm font-sans text-slate-400">%</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-400 group-hover:text-cyan-300 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Compliance Controls</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Row Item 5: Privacy Requests -> Privacy Center */}
              <Link
                to="/app/privacy"
                className="group p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>Privacy Requests</span>
                  <span className="p-1 rounded bg-purple-950 text-purple-400 text-[10px] font-mono font-bold">
                    DSAR
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black font-mono text-purple-400 tracking-tight">
                    5
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-purple-400 group-hover:text-purple-300 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Privacy Center</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

            </div>

            {/* Architecture Drill-Down Workflow Guide */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-400">Drill-down Navigation Mapping:</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-slate-300">
                <Link to="/app/security?tab=findings" className="hover:text-blue-400 flex items-center gap-1">
                  <span>Score (87)</span>
                  <ArrowDown className="w-3 h-3 text-blue-400" />
                  <strong className="text-white">Security Findings</strong>
                </Link>
                <span className="text-slate-600">•</span>
                <Link to="/app/alerts" className="hover:text-rose-400 flex items-center gap-1">
                  <span>Alerts (3)</span>
                  <ArrowDown className="w-3 h-3 text-rose-400" />
                  <strong className="text-white">Alert Center</strong>
                </Link>
                <span className="text-slate-600">•</span>
                <Link to="/app/compliance" className="hover:text-cyan-400 flex items-center gap-1">
                  <span>Compliance (92%)</span>
                  <ArrowDown className="w-3 h-3 text-cyan-400" />
                  <strong className="text-white">Compliance Controls</strong>
                </Link>
                <span className="text-slate-600">•</span>
                <Link to="/app/privacy" className="hover:text-purple-400 flex items-center gap-1">
                  <span>Privacy (5)</span>
                  <ArrowDown className="w-3 h-3 text-purple-400" />
                  <strong className="text-white">Privacy Center</strong>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Live Telemetry + Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Attack Ingestion Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Live Perimeter Threat Mitigation Feed
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Autonomous Edge Quarantine Engine (142,890 events today)
                </p>
              </div>
            </div>
            <Link
              to="/app/alerts"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>View Alert Center (3 Active)</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {events.map((ev) => (
              <div key={ev.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      ev.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                      ev.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ev.severity.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-900">{ev.attackType}</span>
                    <span className="font-mono text-slate-400 text-[11px]">from {ev.ip} ({ev.country})</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Mitigated by <strong className="text-slate-700 font-mono">#{ev.featureId} {ev.featureName}</strong>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-mono font-bold text-[10px]">
                    {ev.actionTaken}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {ev.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Urgent Incident Triage & Quick Controls */}
        <div className="space-y-6">
          {/* Active Alert Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Active Alerts (3)
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-[10px] font-bold">
                P1 ESCALATION
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">
                {initialAlerts[0].title}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                {initialAlerts[0].description}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">{initialAlerts[0].timestamp}</span>
                <Link
                  to="/app/alerts"
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
                >
                  Triage in Alert Center →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Enclave Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Sovereign Actions
            </h4>
            <Link
              to="/app/security?tab=findings"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span>Review 4 Security Findings</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/app/security?tab=assets"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Manage 24 Protected Assets</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/app/privacy"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Process 5 DSAR Privacy Requests</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/app/compliance"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-600" />
                <span>Compliance Controls (92% Pass Rate)</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Feature Sets Directory Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              SkyGuard 78-Module Enterprise Directory
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              6 Dedicated Cybersecurity &amp; Governance Compartments
            </p>
          </div>
          <Link
            to="/features/1"
            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>Explore All 78 Modules</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureSetsMeta.map((set) => (
            <Link
              key={set.set}
              to={`/features/${set.set}`}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold group-hover:bg-blue-100 group-hover:text-blue-700">
                  SET {set.set} • {set.range}
                </span>
                <span className="text-[10px] font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                {set.title}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {set.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
