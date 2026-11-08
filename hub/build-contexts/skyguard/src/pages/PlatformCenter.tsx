import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  Sparkles, 
  Palette, 
  Key, 
  FileSpreadsheet, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Layers, 
  Search,
  ExternalLink,
  RefreshCw,
  Clock,
  Terminal,
  FolderTree,
  Activity
} from 'lucide-react';
import { useWorkspace } from '../hooks/useWorkspace';
import { useAuth } from '../hooks/useAuth';
import { SecurityApiKey } from '../types';
import { DEFAULT_WHITE_LABEL_SETTINGS } from './WhiteLabel';

export default function PlatformCenter() {
  const { activeWorkspace, auditLogs, logAuditEvent } = useWorkspace();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'billing' | 'whitelabel' | 'branding' | 'apikeys' | 'audit'>('billing');
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<SecurityApiKey[]>([
    {
      id: 'key_prod_9912a',
      name: 'Kubernetes SIEM Telemetry Ingestion',
      prefix: 'sk_live_k8s',
      maskedKey: 'sk_live_k8s_••••••••••••••••••••••••••••381a',
      role: 'ingestion_only',
      createdAt: '2026-02-10',
      expiresAt: '2027-02-10',
      lastUsed: '3 mins ago',
      status: 'active',
    },
    {
      id: 'key_prod_8820c',
      name: 'CI/CD Automated Vulnerability Scanner',
      prefix: 'sk_live_cicd',
      maskedKey: 'sk_live_cicd_••••••••••••••••••••••••••••994f',
      role: 'admin',
      createdAt: '2026-01-20',
      expiresAt: '2026-12-31',
      lastUsed: '1 hour ago',
      status: 'active',
    },
  ]);

  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<SecurityApiKey['role']>('ingestion_only');
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null);

  // Audit search
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const rawSecret = `sk_live_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 15)}`;
    const newKeyRecord: SecurityApiKey = {
      id: `key_${Math.floor(10000 + Math.random() * 90000)}`,
      name: newKeyName.trim(),
      prefix: 'sk_live',
      maskedKey: `${rawSecret.substring(0, 12)}••••••••••••••••${rawSecret.substring(rawSecret.length - 4)}`,
      role: newKeyRole,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '2027-12-31',
      lastUsed: 'Never',
      status: 'active',
    };

    setApiKeys((prev) => [newKeyRecord, ...prev]);
    setGeneratedKeyResult(rawSecret);

    logAuditEvent({
      action: 'API_KEY_CREATED',
      entity: 'api_key',
      entityId: newKeyRecord.id,
      metadata: { keyName: newKeyRecord.name, role: newKeyRecord.role },
    });
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k)));
    logAuditEvent({
      action: 'API_KEY_REVOKED',
      entity: 'api_key',
      entityId: keyId,
      metadata: { keyId },
    });
    notify(`Revoked API key ${keyId}`);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const term = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.entity.toLowerCase().includes(term) ||
      log.id.toLowerCase().includes(term) ||
      log.userId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>6. PLATFORM CENTER</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
              {activeWorkspace.name} Enterprise
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            PLATFORM, GOVERNANCE &amp; TENANT CONTROLS
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Billing • White Label • Branding • Cryptographic API Keys • Merkle Audit Logs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Link
            to="/app/operations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Operations &amp; E2E Labs</span>
          </Link>

          {activeTab === 'apikeys' && (
            <button
              onClick={() => {
                setGeneratedKeyResult(null);
                setShowCreateKeyModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Ingestion Key</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'billing', label: 'Billing & Tiers', icon: CreditCard },
          { id: 'whitelabel', label: 'White Label Suite', icon: Sparkles },
          { id: 'branding', label: 'Custom Branding', icon: Palette },
          { id: 'apikeys', label: `API Keys (${apiKeys.filter((k) => k.status === 'active').length})`, icon: Key },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">CURRENT ACTIVE TIER</span>
              <div className="text-2xl font-black text-slate-900">{activeWorkspace.tier}</div>
              <p className="text-xs text-slate-500">Includes all 78 security features, unlimited telemetry, and 5-year SLA.</p>
              <div className="pt-2">
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                  Active Subscription
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">ENCLAVE ALLOCATION</span>
              <div className="text-2xl font-black text-blue-600">Dedicated Sovereign VPC</div>
              <p className="text-xs text-slate-500">Isolated cluster instances with cryptographic hardware keys.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">NEXT INVOICE CYCLE</span>
              <div className="text-2xl font-black text-slate-900">Annual OEM ($4.5M)</div>
              <p className="text-xs text-slate-500">Direct wire transfer / Sovereign Escrow.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHITE LABEL & BRANDING */}
      {(activeTab === 'whitelabel' || activeTab === 'branding') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">White Label OEM Configuration</h2>
              <p className="text-xs text-slate-500">Configure global domain routing, custom logo, email digests, and PDF watermarks.</p>
            </div>
            <a
              href="/white-label"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Open Full White-Label Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
            <pre className="text-emerald-400 leading-relaxed">
{`WHITE LABEL SETTINGS
│
├── Company Name: ${DEFAULT_WHITE_LABEL_SETTINGS.companyName}
├── Custom Domain: ${DEFAULT_WHITE_LABEL_SETTINGS.customDomain}
├── Primary Color: ${DEFAULT_WHITE_LABEL_SETTINGS.primaryColor}
├── Secondary Color: ${DEFAULT_WHITE_LABEL_SETTINGS.secondaryColor}
├── Support Channel: ${DEFAULT_WHITE_LABEL_SETTINGS.customSupport.supportEmail}
└── 24/7 Hotline: ${DEFAULT_WHITE_LABEL_SETTINGS.customSupport.emergencyHotline}`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: API KEYS */}
      {activeTab === 'apikeys' && (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{key.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    key.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {key.status}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                    Role: {key.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-3 pt-1">
                  <span>Key: {key.maskedKey}</span>
                  <span>Created: {key.createdAt}</span>
                  <span>Last Used: {key.lastUsed}</span>
                </div>
              </div>

              {key.status === 'active' && (
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                >
                  Revoke Key
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit records by action, entity, user..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white"
              />
            </div>
            <span className="text-xs font-mono text-slate-500">
              Showing <strong>{filteredAuditLogs.length}</strong> immutable Merkle records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-700">{log.action}</td>
                    <td className="py-3 px-3 text-slate-700">{log.entity} ({log.entityId})</td>
                    <td className="py-3 px-3 text-slate-600">{log.userId}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Generate Ingestion API Key</h3>
              <button onClick={() => setShowCreateKeyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {generatedKeyResult ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                  <div className="font-bold">✓ API Key Generated!</div>
                  <p className="text-[11px]">Copy this key now. It will never be shown in plaintext again.</p>
                  <div className="p-2.5 rounded-lg bg-black text-emerald-400 text-xs break-all flex items-center justify-between">
                    <span>{generatedKeyResult}</span>
                    <button
                      onClick={() => handleCopy(generatedKeyResult, 'modal-key')}
                      className="ml-2 text-white hover:underline cursor-pointer"
                    >
                      {copiedKey === 'modal-key' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateKeyModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Key Description / Name *</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. AWS Production Splunk Ingestion"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Access Scope</label>
                  <select
                    value={newKeyRole}
                    onChange={(e) => setNewKeyRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="ingestion_only">Ingestion Only (Telemetry &amp; Audit Feed)</option>
                    <option value="read_only">Read Only (Reports &amp; Finding API)</option>
                    <option value="admin">Full Admin (Policy &amp; Enclave Control)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateKeyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* INSPECT AUDIT LOG MODAL */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 font-sans">
              <h3 className="font-bold text-slate-900 text-sm">Audit Record Inspection: {selectedAuditLog.id}</h3>
              <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(selectedAuditLog, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold font-sans"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
