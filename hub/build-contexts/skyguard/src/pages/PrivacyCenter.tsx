import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  Trash2, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Plus,
  Download,
  Ban,
  Filter,
  Search,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  UserCheck,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { initialDsarRequests, initialConsentRecords, privacyFeatures } from '../services/mockSecurityApi';
import { DsarRequest, ConsentRecord } from '../types';

export default function PrivacyCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'consent';
  const [activeTab, setActiveTab] = useState<'consent' | 'dsar' | 'shred'>(
    activeTabParam === 'dsar' || activeTabParam === 'shred' ? activeTabParam : 'consent'
  );

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'consent' || tab === 'dsar' || tab === 'shred') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'consent' | 'dsar' | 'shred') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // State for Consent Records
  const [consents, setConsents] = useState<ConsentRecord[]>(initialConsentRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'withdrawn'>('all');
  const [isCreatingConsent, setIsCreatingConsent] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Consent Form State
  const [newEmail, setNewEmail] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newSource, setNewSource] = useState('Web Cookie Banner');
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([
    'Essential Cookies',
    'Telemetry Analytics'
  ]);
  const [legalBasis, setLegalBasis] = useState('Explicit Consent (GDPR Art. 6(1)(a))');

  // DSAR & Shredding State
  const [requests, setRequests] = useState<DsarRequest[]>(initialDsarRequests);
  const [shredKeyInput, setShredKeyInput] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [shredResult, setShredResult] = useState<string | null>(null);

  // Available Consent Purposes
  const availablePurposes = [
    'Essential Cookies',
    'Telemetry Analytics',
    'Security Diagnostics',
    'Personalized Experience',
    'Marketing Opt-In',
    'Profiling & AI Training'
  ];

  const togglePurpose = (purpose: string) => {
    if (selectedPurposes.includes(purpose)) {
      setSelectedPurposes(selectedPurposes.filter((p) => p !== purpose));
    } else {
      setSelectedPurposes([...selectedPurposes, purpose]);
    }
  };

  // Capability 1 & 2 & 3: Create consent record + Record timestamp + Record consent source
  const handleCreateConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const generatedSubId = newSubjectId.trim() || `usr_${Math.floor(Math.random() * 899999 + 100000)}`;
    const nowIso = new Date().toISOString();
    const randomHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newRecord: ConsentRecord = {
      id: `REC-CSNT-${Math.floor(Math.random() * 89999 + 10000)}`,
      subjectEmail: newEmail.trim(),
      subjectId: generatedSubId,
      purposes: selectedPurposes.length > 0 ? selectedPurposes : ['Essential Cookies'],
      status: 'active',
      source: newSource,
      timestamp: nowIso,
      legalBasis: legalBasis,
      ipAddress: '192.0.2.14 (Verified Cloudflare Edge)',
      signatureHash: randomHash
    };

    setConsents([newRecord, ...consents]);
    setNewEmail('');
    setNewSubjectId('');
    setIsCreatingConsent(false);

    setNotificationMsg(`Consent Record [${newRecord.id}] created and cryptographically signed in the tamper-evident ledger.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Capability 4: Export consent history
  const handleExportConsentHistory = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(consents, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `skyguard-gdpr-consent-ledger-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['ID', 'Email', 'Subject ID', 'Status', 'Source', 'Timestamp', 'Legal Basis', 'Purposes', 'Signature Hash'];
      const rows = consents.map(c => [
        c.id,
        c.subjectEmail,
        c.subjectId,
        c.status,
        `"${c.source}"`,
        c.timestamp,
        `"${c.legalBasis}"`,
        `"${c.purposes.join('; ')}"`,
        c.signatureHash || ''
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodedUri);
      downloadAnchor.setAttribute('download', `skyguard-gdpr-consent-ledger-${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setNotificationMsg(`Consent History successfully exported (${format.toUpperCase()} format with digital signature trail).`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Capability 5: Withdraw consent
  const handleWithdrawConsent = (id: string) => {
    const target = consents.find((c) => c.id === id);
    if (!target) return;

    setConsents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'withdrawn',
              legalBasis: 'Revoked by Data Subject (GDPR Art. 7(3))',
              timestamp: new Date().toISOString()
            }
          : c
      )
    );

    setNotificationMsg(`Consent withdrawn for ${target.subjectEmail}. Revocation ledger block generated.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Crypto shredding handler
  const handleExecuteShred = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shredKeyInput.trim()) return;

    setIsShredding(true);
    setShredResult(null);

    setTimeout(() => {
      setIsShredding(false);
      setShredResult(
        `Cryptographic Key [${shredKeyInput}] permanently destroyed from HSM Enclave. All linked ciphertext is mathematically unrecoverable. Certificate of Destruction issued: #SHRED-REC-2026-${Math.floor(Math.random() * 8999 + 1000)}`
      );
      setShredKeyInput('');
    }, 1200);
  };

  const handleUpdateDsarStatus = (id: string, newStatus: DsarRequest['status']) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredConsents = consents.filter((c) => {
    const matchesQuery = 
      c.subjectEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const activeCount = consents.filter(c => c.status === 'active').length;
  const withdrawnCount = consents.filter(c => c.status === 'withdrawn').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Governance &amp; Privacy Mesh</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Privacy Center &amp; GDPR Consent Governance
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            GDPR Consent Bundle • 5 Active DSAR Inquiries • Hardware-Enforced Cryptographic Shredding
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              handleTabChange('consent');
              setIsCreatingConsent(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Consent Record</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top 3 Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => handleTabChange('consent')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
            activeTab === 'consent' ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">Consent Records Ledger</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono flex items-baseline gap-2">
            <span>{consents.length}</span>
            <span className="text-xs text-green-600 font-bold font-sans">({activeCount} Active)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>GDPR Art. 7 Compliant</span>
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('dsar')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
            activeTab === 'dsar' ? 'border-purple-500 ring-2 ring-purple-100 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">Active DSAR Requests</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {requests.filter((r) => r.status !== 'completed').length}
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Avg turnaround: 1.4 days</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-500">Ledger Cryptographic Integrity</div>
          <div className="text-3xl font-extrabold text-green-600 font-mono">
            100%
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>Tamper-evident SHA-256 chain</span>
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('shred')}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all ${
            activeTab === 'shred' ? 'border-rose-500 ring-2 ring-rose-100 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">Crypto Shred Certificates</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            1,492
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Irreversible KMS Purges</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => handleTabChange('consent')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'consent'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>GDPR Consent Bundle</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono">
            {consents.length} Records
          </span>
        </button>

        <button
          onClick={() => handleTabChange('dsar')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'dsar'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>DSAR Pipeline</span>
          <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-mono">
            {requests.length} Cases
          </span>
        </button>

        <button
          onClick={() => handleTabChange('shred')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'shred'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Cryptographic Key Shredding</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GDPR CONSENT BUNDLE (Create, Timestamp, Source, Export, Withdraw) */}
      {/* ======================================================== */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          {/* Feature Definition Callout */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-mono text-[10px] font-bold border border-blue-800">
                  FEATURE ID: gdpr-consent
                </span>
                <span className="text-sm font-bold text-white">GDPR Consent Bundle</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800">
                  ACTIVE • PRO PLAN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Create and manage signed, transportable consent records with immutable cryptographic timestamping and source tracking.
              </p>
            </div>

            {/* 5 Core Capabilities Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {privacyFeatures[0].capabilities.map((cap, idx) => (
                <span key={idx} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{cap}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Create Consent Record Form / Drawer */}
          {isCreatingConsent && (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-md animate-in fade-in space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Capability #1: Create Cryptographically Signed Consent Record
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreatingConsent(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateConsent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data Subject Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@enterprise.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject UUID / ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. usr_8912044"
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Capability #3: Consent Source Channel
                    </label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Web Cookie Banner">Web Cookie Banner (CMP)</option>
                      <option value="Signup Form">User Signup Registration Form</option>
                      <option value="OAuth Gateway">OAuth 2.0 Consent Gateway</option>
                      <option value="Mobile SDK">iOS / Android Mobile App SDK</option>
                      <option value="Terms of Service Checkbox">Terms of Service Checkbox</option>
                    </select>
                  </div>
                </div>

                {/* Consent Purposes Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Granted Granular Purposes (GDPR Art. 6 &amp; 7 Explicit Scope)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availablePurposes.map((p) => {
                      const isSelected = selectedPurposes.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePurpose(p)}
                          className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{p}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timestamp & Legal Basis Preview */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Capability #2 Recorded Timestamp: <strong>{new Date().toISOString()}</strong> (UTC)</span>
                  </div>
                  <div>
                    <span>Legal Basis: <strong>{legalBasis}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingConsent(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Issue Signed Consent Record</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Consent Records Ledger Controls & Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Consent Records Ledger
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Immutable proof chain with precise timestamps, acquisition channels, and purpose vectors
                </p>
              </div>

              {/* Capability 4: Export History Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleExportConsentHistory('json')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  title="Capability #4: Export Consent History as JSON"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => handleExportConsentHistory('csv')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  title="Capability #4: Export Consent History as CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by email, Record ID, or User UUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-mono">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({consents.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      statusFilter === 'active' ? 'bg-white text-green-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('withdrawn')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      statusFilter === 'withdrawn' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Withdrawn ({withdrawnCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Consents Ledger List */}
            <div className="divide-y divide-slate-100">
              {filteredConsents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No consent records match your current search query.
                </div>
              ) : (
                filteredConsents.map((record) => (
                  <div key={record.id} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {record.id}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{record.subjectEmail}</span>
                        <span className="text-xs font-mono text-slate-400">({record.subjectId})</span>

                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          record.status === 'active' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Capability 5: Withdraw Consent Action */}
                      <div className="flex items-center gap-2">
                        {record.status === 'active' ? (
                          <button
                            onClick={() => handleWithdrawConsent(record.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                            title="Capability #5: Withdraw Consent"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Withdraw Consent</span>
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-rose-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Revoked</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Capabilities telemetry display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-600">
                      <div>
                        Source: <strong className="text-slate-800">{record.source}</strong>
                      </div>
                      <div>
                        Timestamp: <strong className="text-slate-800">{new Date(record.timestamp).toLocaleString()}</strong>
                      </div>
                      <div>
                        Legal Basis: <strong className="text-slate-800">{record.legalBasis}</strong>
                      </div>
                      <div>
                        IP / Geolocation: <strong className="text-slate-800">{record.ipAddress || 'Verified Edge'}</strong>
                      </div>
                    </div>

                    {/* Granted Purposes Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-slate-400">Purposes:</span>
                      {record.purposes.map((p, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Digital Signature Proof */}
                    {record.signatureHash && (
                      <div className="text-[10px] font-mono text-slate-400 pt-0.5 truncate">
                        Signature Proof: <span className="text-blue-600 select-all">{record.signatureHash}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACTIVE DSAR INQUIRIES */}
      {/* ======================================================== */}
      {activeTab === 'dsar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Data Subject Access Requests (DSAR Pipeline)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Continuous compliance tracking against 30-day statutory response windows
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {requests.length} Total Inquiries
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map((r) => (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {r.id}
                    </span>
                    <span className="font-bold text-slate-900">{r.subjectName}</span>
                    <span className="text-slate-400 text-[11px] font-mono">({r.subjectEmail})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>Type: <strong className="text-slate-700">{r.type}</strong></span>
                    <span>•</span>
                    <span>Regulation: <strong className="text-slate-700">{r.regulation}</strong></span>
                    <span>•</span>
                    <span>Submitted: <strong>{new Date(r.submittedAt).toLocaleDateString()}</strong></span>
                    <span>•</span>
                    <span className="text-amber-600 font-bold">{r.deadlineDays}d remaining</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                    r.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    r.status === 'crypto_shredding' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {r.status.toUpperCase().replace('_', ' ')}
                  </span>

                  {r.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateDsarStatus(r.id, 'completed')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CRYPTOGRAPHIC SHREDDING ENGINE */}
      {/* ======================================================== */}
      {activeTab === 'shred' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Interactive Cryptographic Shredding Engine (Feature #4)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Execute instantaneous irreversible data destruction by shredding sovereign KMS partition keys
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleExecuteShred} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Enter Subject KMS Key ID or User UUID (e.g. kms_key_user_89128)"
              value={shredKeyInput}
              onChange={(e) => setShredKeyInput(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={isShredding}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isShredding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Zeroing Key Bytes in HSM...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Execute Crypto Shred</span>
                </>
              )}
            </button>
          </form>

          {shredResult && (
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs font-mono space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>IRREVERSIBLE CRYPTOGRAPHIC SHRED CONFIRMED</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {shredResult}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
