import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Server, 
  Cloud, 
  Database, 
  Smartphone, 
  Code2, 
  ShieldCheck, 
  Activity, 
  Filter, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowDown, 
  ArrowRight, 
  Copy, 
  Terminal, 
  Sparkles, 
  FolderTree, 
  Layers, 
  Lock, 
  KeyRound, 
  FileCheck2, 
  User, 
  Plug, 
  ExternalLink,
  Shield,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle,
  Eye,
  ChevronRight
} from 'lucide-react';
import { initialInventoryAssets, initialEnclaveActivityEvents } from '../services/mockSecurityApi';
import { InventoryAsset, AssetCategory, EnclaveActivityEvent, EnclaveEventType } from '../types';

export default function Assets() {
  const [assets, setAssets] = useState<InventoryAsset[]>(initialInventoryAssets);
  const [activityEvents, setActivityEvents] = useState<EnclaveActivityEvent[]>(initialEnclaveActivityEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedAssetForModal, setSelectedAssetForModal] = useState<InventoryAsset | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<EnclaveActivityEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showArchitectureView, setShowArchitectureView] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Asset Form State
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('Websites');
  const [newAssetIdentifier, setNewAssetIdentifier] = useState('');
  const [newAssetEnvironment, setNewAssetEnvironment] = useState<'production' | 'staging' | 'internal'>('production');

  // Trigger notification helper
  const notify = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: assets.length,
      Websites: assets.filter(a => a.category === 'Websites').length,
      APIs: assets.filter(a => a.category === 'APIs').length,
      Domains: assets.filter(a => a.category === 'Domains').length,
      Servers: assets.filter(a => a.category === 'Servers').length,
      'Cloud Accounts': assets.filter(a => a.category === 'Cloud Accounts').length,
      Applications: assets.filter(a => a.category === 'Applications').length,
      Databases: assets.filter(a => a.category === 'Databases').length,
    };
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (selectedCategory !== 'all' && a.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesIdent = a.identifier.toLowerCase().includes(q);
        const matchesCat = a.category.toLowerCase().includes(q);
        const matchesHost = a.ipOrHost.toLowerCase().includes(q);
        const matchesTags = a.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesIdent && !matchesCat && !matchesHost && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [assets, selectedCategory, searchQuery]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return activityEvents.filter(ev => {
      if (selectedPillar !== 'all' && ev.pillar !== selectedPillar) {
        return false;
      }
      if (selectedEventType !== 'all' && ev.type !== selectedEventType) {
        return false;
      }
      return true;
    });
  }, [activityEvents, selectedPillar, selectedEventType]);

  // Handle Add Asset
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetIdentifier.trim()) return;

    const newId = `ast_${newAssetCategory.toLowerCase().substring(0, 3)}_${Math.floor(100 + Math.random() * 900)}`;
    const newAsset: InventoryAsset = {
      id: newId,
      name: newAssetName.trim(),
      category: newAssetCategory,
      identifier: newAssetIdentifier.trim(),
      parentApex: 'mycompany.com',
      status: 'healthy',
      ipOrHost: 'Zero-Trust Shielded Host',
      environment: newAssetEnvironment,
      monitoringActive: true,
      compliancePassing: true,
      securityScore: 100.0,
      lastScan: 'Just now',
      tags: ['SkyGuard Enclave Shield', 'SOC 2 Active'],
      vulnerabilitiesCount: 0,
      wafShielded: true,
    };

    setAssets([newAsset, ...assets]);
    setShowAddModal(false);
    setNewAssetName('');
    setNewAssetIdentifier('');
    notify(`Successfully registered asset [${newId}] under mycompany.com`);
  };

  // Simulate an event in the pipeline
  const handleSimulateEvent = (type: EnclaveEventType) => {
    const titles: Record<EnclaveEventType, string> = {
      user_login: 'User logged in',
      password_change: 'User changed password',
      api_key_create: 'User created API key',
      admin_role_change: 'Admin changed role',
      consent_exported: 'Consent exported',
      privacy_request_completed: 'Privacy request completed',
      alert_resolved: 'Alert resolved',
      integration_connected: 'Integration connected',
    };

    const pillars: Record<EnclaveEventType, 'Monitoring' | 'Compliance' | 'Security'> = {
      user_login: 'Monitoring',
      password_change: 'Security',
      api_key_create: 'Security',
      admin_role_change: 'Compliance',
      consent_exported: 'Compliance',
      privacy_request_completed: 'Compliance',
      alert_resolved: 'Security',
      integration_connected: 'Monitoring',
    };

    const targets: Record<EnclaveEventType, string> = {
      user_login: 'https://app.mycompany.com',
      password_change: 'https://auth.mycompany.com',
      api_key_create: 'https://api.mycompany.com/v1',
      admin_role_change: 'SkyGuard Web Client',
      consent_exported: 'PostgreSQL Primary Enclave',
      privacy_request_completed: 'mycompany.com',
      alert_resolved: 'api.skyguard.com',
      integration_connected: 'AWS Production Mesh Account',
    };

    const newEvent: EnclaveActivityEvent = {
      id: `EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      title: titles[type],
      pillar: pillars[type],
      actor: 'security-admin@mycompany.com',
      actorRole: 'Security Administrator',
      targetAsset: targets[type],
      timestamp: 'Just now',
      details: `Dispatched live telemetry packet through SkyGuard pipeline for ${titles[type]}.`,
      ipAddress: '10.0.1.14 (Enclave Ingress)',
      evidenceDigest: `sha256:${Math.random().toString(16).substring(2, 12)}...`,
      status: 'success',
    };

    setActivityEvents([newEvent, ...activityEvents]);
    notify(`Emitted telemetry event: "${newEvent.title}" (${newEvent.pillar})`);
  };

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'Websites': return Globe;
      case 'APIs': return Code2;
      case 'Domains': return Globe;
      case 'Servers': return Server;
      case 'Cloud Accounts': return Cloud;
      case 'Applications': return Smartphone;
      case 'Databases': return Database;
      default: return Layers;
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* HEADER & CONTROLS */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Asset Inventory &amp; Telemetry Gateway</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold">
              Apex: mycompany.com
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ASSETS &amp; PIPELINE
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Websites • APIs • Domains • Servers • Cloud Accounts • Applications • Databases ➔ SkyGuard
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-toggle-arch-view"
            onClick={() => setShowArchitectureView(!showArchitectureView)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <FolderTree className="w-4 h-4 text-slate-600" />
            <span>{showArchitectureView ? 'Hide Architecture Tree' : 'Show Architecture Tree'}</span>
          </button>

          <button
            id="btn-add-asset"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
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
      {/* ARCHITECTURE TREE & SKYGUARD TELEMETRY PIPELINE */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showArchitectureView && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Enterprise Asset Hierarchy &amp; Ingestion Flow
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Total Monitored: {assets.length}
              </span>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                100% Ingress Enforced
              </span>
            </div>
          </div>

          {/* Graphical Pipeline Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Box 1: ASSETS TREE */}
            <div className="bg-black/60 p-4 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto leading-relaxed select-all">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-slate-800/80 pb-1 flex items-center justify-between">
                <span>1. ASSETS INVENTORY TREE</span>
                <span className="text-emerald-400">mycompany.com</span>
              </div>
              <pre className="text-[11px]">
{`ASSETS
│
├── Websites (${categoryCounts.Websites})
├── APIs (${categoryCounts.APIs})
├── Domains (${categoryCounts.Domains})
├── Servers (${categoryCounts.Servers})
├── Cloud Accounts (${categoryCounts['Cloud Accounts']})
├── Applications (${categoryCounts.Applications})
├── Databases (${categoryCounts.Databases})
└── mycompany.com (Apex Anchor)`}
              </pre>
            </div>

            {/* Box 2: SKYGUARD CENTRAL ENGINE */}
            <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/60 text-blue-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-blue-900/60 pb-1 flex items-center justify-between">
                  <span>2. INGESTION &amp; DEFENSE MESH</span>
                  <span className="text-blue-300">Active</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-xl font-black text-white tracking-widest bg-blue-600/30 border border-blue-500/40 rounded-lg py-2 shadow-inner">
                    SkyGuard
                  </div>
                  <div className="text-[10px] text-blue-300 mt-1 font-sans">
                    Autonomous Zero-Trust Engine • 78 Defense Modules
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-lg border border-blue-950">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">mTLS Ingress:</span>
                  <span className="text-emerald-400 font-bold">Enforced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CEF/LEEF Stream:</span>
                  <span className="text-blue-400 font-bold">1.8M / Day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cryptographic Seal:</span>
                  <span className="text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            </div>

            {/* Box 3: MONITORING / COMPLIANCE / SECURITY EVENTS */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-slate-300 space-y-2">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>3. TELEMETRY PILLARS</span>
                <span className="text-purple-400">8 Canonical Events</span>
              </div>
              <div className="text-[11px] text-purple-300 font-bold mb-1">
                Monitoring / Compliance / Security
              </div>
              <div className="grid grid-cols-1 gap-1 text-[10px]">
                {[
                  { label: 'User logged in', pillar: 'Monitoring', color: 'text-blue-400' },
                  { label: 'User changed password', pillar: 'Security', color: 'text-amber-400' },
                  { label: 'User created API key', pillar: 'Security', color: 'text-amber-400' },
                  { label: 'Admin changed role', pillar: 'Compliance', color: 'text-purple-400' },
                  { label: 'Consent exported', pillar: 'Compliance', color: 'text-purple-400' },
                  { label: 'Privacy request completed', pillar: 'Compliance', color: 'text-purple-400' },
                  { label: 'Alert resolved', pillar: 'Security', color: 'text-emerald-400' },
                  { label: 'Integration connected', pillar: 'Monitoring', color: 'text-blue-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-200">✓ {item.label}</span>
                    <span className={`text-[9px] font-bold uppercase ${item.color}`}>
                      {item.pillar}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Simulation Trigger Bar */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold">
                Simulate Live Event Egress through SkyGuard:
              </span>
              <span className="text-[10px] text-slate-500">
                Click any event to emit a verifiable audit telemetry packet
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { type: 'user_login', label: 'User logged in' },
                  { type: 'password_change', label: 'User changed password' },
                  { type: 'api_key_create', label: 'User created API key' },
                  { type: 'admin_role_change', label: 'Admin changed role' },
                  { type: 'consent_exported', label: 'Consent exported' },
                  { type: 'privacy_request_completed', label: 'Privacy request completed' },
                  { type: 'alert_resolved', label: 'Alert resolved' },
                  { type: 'integration_connected', label: 'Integration connected' },
                ] as const
              ).map((ev) => (
                <button
                  key={ev.type}
                  onClick={() => handleSimulateEvent(ev.type)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-900/60 border border-slate-800 hover:border-blue-700 text-slate-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span>{ev.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* CATEGORY SELECTOR & ASSETS SECTION */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Category Filter Pills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Filter by Asset Class:
              </span>
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets, domains, IPs, tags..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
            {[
              { id: 'all', label: 'All Assets', icon: Layers, count: categoryCounts.all },
              { id: 'Websites', label: 'Websites', icon: Globe, count: categoryCounts.Websites },
              { id: 'APIs', label: 'APIs', icon: Code2, count: categoryCounts.APIs },
              { id: 'Domains', label: 'Domains', icon: Globe, count: categoryCounts.Domains },
              { id: 'Servers', label: 'Servers', icon: Server, count: categoryCounts.Servers },
              { id: 'Cloud Accounts', label: 'Cloud Accounts', icon: Cloud, count: categoryCounts['Cloud Accounts'] },
              { id: 'Applications', label: 'Applications', icon: Smartphone, count: categoryCounts.Applications },
              { id: 'Databases', label: 'Databases', icon: Database, count: categoryCounts.Databases },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ASSET CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const Icon = getCategoryIcon(asset.category);
            return (
              <div
                key={asset.id}
                id={`asset-card-${asset.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-sm space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Category Badge & ID */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <Icon className="w-3 h-3" />
                      <span>{asset.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        Score: {asset.securityScore}%
                      </span>
                    </div>
                  </div>

                  {/* Title and Identifier */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {asset.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-mono text-xs font-semibold text-blue-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate block max-w-[240px]" title={asset.identifier}>
                        {asset.identifier}
                      </span>
                      <button
                        onClick={() => handleCopy(asset.identifier, asset.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Copy Identifier"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Host / Network Info */}
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Host/IP:</span>
                      <span className="text-slate-800 font-semibold truncate ml-2" title={asset.ipOrHost}>
                        {asset.ipOrHost}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Apex Target:</span>
                      <span className="text-slate-800 font-bold">{asset.parentApex}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <span className="text-purple-700 font-bold uppercase text-[10px]">{asset.environment}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {asset.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">
                    Last Scan: {asset.lastScan}
                  </span>

                  <button
                    onClick={() => setSelectedAssetForModal(asset)}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* LIVE TELEMETRY ACTIVITY STREAM (Monitoring / Compliance / Security) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-bold uppercase">
                Activity Stream
              </span>
              <span className="text-xs font-mono text-slate-400">
                Pipeline: ASSETS ➔ SkyGuard ➔ Monitoring / Compliance / Security
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              SkyGuard Sovereign Audit &amp; Event Stream
            </h2>
          </div>

          {/* Pillar Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400 mr-1">Pillar:</span>
            {['all', 'Monitoring', 'Compliance', 'Security'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPillar(p)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedPillar === p
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Events Table/List */}
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const isMonitoring = evt.pillar === 'Monitoring';
            const isCompliance = evt.pillar === 'Compliance';
            const isSecurity = evt.pillar === 'Security';

            return (
              <div
                key={evt.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Pillar Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isMonitoring ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      isCompliance ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {evt.pillar}
                    </span>

                    {/* Event Type Name */}
                    <span className="font-bold text-slate-900 font-sans text-sm">
                      {evt.title}
                    </span>

                    {/* Event ID */}
                    <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {evt.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {evt.details}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 flex-wrap">
                    <div>
                      Actor: <strong className="text-slate-800">{evt.actor}</strong>
                    </div>
                    <div>
                      Target Asset: <strong className="text-blue-700">{evt.targetAsset}</strong>
                    </div>
                    <div>
                      IP: <span className="text-slate-700">{evt.ipAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 flex-shrink-0 text-right">
                  <span className="text-[11px] text-slate-400">
                    {evt.timestamp}
                  </span>
                  <button
                    onClick={() => setSelectedEventForModal(evt)}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Inspect Proof
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 1: INSPECT ASSET DETAILS */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedAssetForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Asset Record • {selectedAssetForModal.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedAssetForModal.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedAssetForModal.identifier}</p>
              </div>
              <button
                onClick={() => setSelectedAssetForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                <strong className="text-slate-800">{selectedAssetForModal.category}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">Parent Apex</span>
                <strong className="text-slate-800">{selectedAssetForModal.parentApex}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">Security Score</span>
                <strong className="text-emerald-700">{selectedAssetForModal.securityScore}%</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">Environment</span>
                <strong className="text-purple-700 capitalize">{selectedAssetForModal.environment}</strong>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Canonical Ingestion Payload:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedAssetForModal, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedJson ? 'Copied JSON!' : 'Copy Asset JSON'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 select-all">
                <pre>{JSON.stringify(selectedAssetForModal, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAssetForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 2: INSPECT EVENT AUDIT PROOF */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 block uppercase">
                  Sovereign Audit Proof • {selectedEventForModal.pillar}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedEventForModal.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedEventForModal.id} • {selectedEventForModal.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Event Description:</span>
                <p className="text-slate-800 font-sans">{selectedEventForModal.details}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 select-all space-y-1">
                <div>// Cryptographic Ledger Proof</div>
                <div>Hash: {selectedEventForModal.evidenceDigest}</div>
                <div>Timestamp: {new Date().toISOString()}</div>
                <div>Status: VERIFIED_SOVEREIGN_ROOT_CA</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 3: REGISTER NEW ASSET */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Asset Onboarding
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Register Asset under mycompany.com
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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
                  placeholder="e.g. Customer Checkout Portal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Asset Class / Category *
                  </label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as AssetCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Websites">Websites</option>
                    <option value="APIs">APIs</option>
                    <option value="Domains">Domains</option>
                    <option value="Servers">Servers</option>
                    <option value="Cloud Accounts">Cloud Accounts</option>
                    <option value="Applications">Applications</option>
                    <option value="Databases">Databases</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Environment *
                  </label>
                  <select
                    value={newAssetEnvironment}
                    onChange={(e) => setNewAssetEnvironment(e.target.value as 'production' | 'staging' | 'internal')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="internal">Internal Enclave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identifier / FQDN / Host *
                </label>
                <input
                  type="text"
                  required
                  value={newAssetIdentifier}
                  onChange={(e) => setNewAssetIdentifier(e.target.value)}
                  placeholder="e.g. https://checkout.mycompany.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Register in Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
