import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  Activity, 
  Trash2, 
  Settings2, 
  Cpu, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Server,
  Layers,
  Wrench,
  Search,
  Filter
} from 'lucide-react';
import { initialWafRules, initialZeroTrustPolicies, initialSecurityFindings, initialProtectedAssets } from '../services/mockSecurityApi';
import { WafRule, ZeroTrustPolicy, SecurityFinding, ProtectedAsset } from '../types';

export default function SecurityCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'findings';
  const [activeTab, setActiveTab] = useState<'findings' | 'waf' | 'zerotrust' | 'assets'>(
    activeTabParam === 'waf' || activeTabParam === 'zerotrust' || activeTabParam === 'assets' 
      ? activeTabParam 
      : 'findings'
  );

  const [findings, setFindings] = useState<SecurityFinding[]>(initialSecurityFindings);
  const [protectedAssets, setProtectedAssets] = useState<ProtectedAsset[]>(initialProtectedAssets);
  const [wafRules, setWafRules] = useState<WafRule[]>(initialWafRules);
  const [ztPolicies, setZtPolicies] = useState<ZeroTrustPolicy[]>(initialZeroTrustPolicies);
  
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleType, setNewRuleType] = useState<WafRule['type']>('sql_injection');
  const [newRuleAction, setNewRuleAction] = useState<WafRule['action']>('block');

  const [assetFilter, setAssetFilter] = useState('all');
  const [findingSuccessMsg, setFindingSuccessMsg] = useState<string | null>(null);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'findings' || tab === 'waf' || tab === 'zerotrust' || tab === 'assets') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'findings' | 'waf' | 'zerotrust' | 'assets') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Calculate live Security Score based on unresolved findings
  const openScoreDeductions = findings
    .filter(f => f.status !== 'resolved')
    .reduce((acc, curr) => acc + curr.scoreImpact, 0);
  const currentSecurityScore = Math.max(0, 100 - openScoreDeductions);

  const handleRemediateFinding = (id: string) => {
    const target = findings.find(f => f.id === id);
    if (!target) return;

    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
    setFindingSuccessMsg(`Remediation applied for [${target.title}]. Security score restored +${target.scoreImpact} pts!`);
    
    setTimeout(() => {
      setFindingSuccessMsg(null);
    }, 3500);
  };

  const toggleRuleStatus = (id: string) => {
    setWafRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'active' ? 'disabled' : 'active';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: WafRule = {
      id: `waf_rule_${Math.floor(Math.random() * 899 + 100)}`,
      name: newRuleName,
      type: newRuleType,
      status: 'active',
      action: newRuleAction,
      matchedLast24h: 0,
      updatedAt: new Date().toISOString(),
      severity: 'high',
    };

    setWafRules([newRule, ...wafRules]);
    setNewRuleName('');
    setIsAddingRule(false);
  };

  const filteredAssets = protectedAssets.filter(asset => {
    if (assetFilter === 'all') return true;
    return asset.type.toLowerCase().includes(assetFilter.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Perimeter &amp; Network Defense</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security Center &amp; Posture Management
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Security Findings • 24 Protected Assets • L7 WAF Shield • Zero-Trust Micro-segmentation
          </p>
        </div>

        {/* Security Score Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Security Score</div>
              <div className="text-2xl font-black font-mono flex items-baseline gap-1">
                <span className={currentSecurityScore >= 90 ? 'text-green-400' : 'text-blue-400'}>
                  {currentSecurityScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold font-mono ${
              currentSecurityScore >= 90 ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
            }`}>
              {currentSecurityScore >= 90 ? 'GRADE A+' : 'GRADE A'}
            </div>
          </div>

          <button
            onClick={() => {
              handleTabChange('waf');
              setIsAddingRule(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Rule</span>
          </button>
        </div>
      </div>

      {findingSuccessMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{findingSuccessMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => handleTabChange('findings')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'findings'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Security Findings</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono">
            {findings.filter(f => f.status !== 'resolved').length} Open
          </span>
        </button>

        <button
          onClick={() => handleTabChange('assets')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'assets'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Protected Assets</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
            24
          </span>
        </button>

        <button
          onClick={() => handleTabChange('waf')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'waf'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>WAF Filter Rules</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
            {wafRules.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('zerotrust')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'zerotrust'
              ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Trust Enclaves</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
            {ztPolicies.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SECURITY FINDINGS */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Active Vulnerabilities &amp; Posture Findings
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Identified issues affecting the <strong>{currentSecurityScore}/100</strong> Security Score
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Total Impact:</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                  -{openScoreDeductions} Score Points
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {findings.map((finding) => (
                <div key={finding.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        finding.severity === 'high' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        finding.severity === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {finding.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {finding.category}
                      </span>
                      <span className="font-mono text-slate-400 text-xs">{finding.id}</span>
                      <h4 className="text-sm font-bold text-slate-900">{finding.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        finding.status === 'resolved' 
                          ? 'bg-green-100 text-green-700' 
                          : finding.status === 'mitigating'
                          ? 'bg-blue-100 text-blue-700 animate-pulse'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {finding.status.toUpperCase()}
                      </span>
                      {finding.status !== 'resolved' ? (
                        <button
                          onClick={() => handleRemediateFinding(finding.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Remediate (+{finding.scoreImpact} pts)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Remediated
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {finding.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-500">
                    <div>
                      Resource: <span className="text-slate-800 font-semibold">{finding.resource}</span>
                    </div>
                    <div>
                      Remediation: <span className="text-blue-700 font-medium">{finding.remediation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROTECTED ASSETS (24) */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Protected Sovereign Assets (24 Total Enclaves)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  All workloads secured with hardware roots of trust &amp; cryptographic telemetry
                </p>
              </div>

              {/* Asset Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none"
                >
                  <option value="all">All Asset Types (24)</option>
                  <option value="Kubernetes">Kubernetes Clusters</option>
                  <option value="Gateway">API Gateways</option>
                  <option value="KMS">KMS &amp; HSM Vaults</option>
                  <option value="DB">Postgres DB Enclaves</option>
                  <option value="Storage">Storage Buckets</option>
                  <option value="Redis">Redis Caches</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-[10px] text-slate-400">{asset.id} • {asset.region}</div>
                      <div className="font-bold text-slate-900 line-clamp-1">{asset.name}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      asset.status === 'protected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {asset.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-600 border-t border-slate-200/60">
                    <span>Type: {asset.type}</span>
                    <span className="font-bold text-slate-900">{asset.securityScore}% Score</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Enclave: {asset.enclaveId}</span>
                    <span>Hardened: {asset.lastHardened}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal / Drawer (when adding in WAF tab) */}
      {isAddingRule && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Create New Edge WAF Filter Rule
            </h3>
            <button
              onClick={() => setIsAddingRule(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rule Name / Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Block Malicious User-Agent Headers"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detection Vector
              </label>
              <select
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="sql_injection">SQL Injection (SQLi Shield)</option>
                <option value="xss_shield">Cross-Site Scripting (XSS)</option>
                <option value="rate_limiting">L7 DDoS Rate-Limiting</option>
                <option value="bot_challenge">Botnet &amp; Headless Scraper</option>
                <option value="geo_fencing">Sovereign Geo-Fence</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action on Trigger
              </label>
              <select
                value={newRuleAction}
                onChange={(e) => setNewRuleAction(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="block">Block Immediately (HTTP 403)</option>
                <option value="challenge">Interactive JS Proof-of-Work Challenge</option>
                <option value="log">Audit Log Only</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Save &amp; Distribute to Edge Nodes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: WAF ACTIVE RULES */}
      {activeTab === 'waf' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Layer 7 WAF Active Core Rules
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Edge-distributed filter chains with inline TLS decryption &amp; payload inspection
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {wafRules.filter((r) => r.status === 'active').length} of {wafRules.length} Active
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {wafRules.map((rule) => (
              <div key={rule.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{rule.id}</span>
                    <span className="text-sm font-bold text-slate-900">{rule.name}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      rule.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                      rule.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rule.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>Action: <strong>{rule.action.toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>Type: {rule.type}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-bold">{rule.matchedLast24h.toLocaleString()} triggers (24h)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    onClick={() => toggleRuleStatus(rule.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer"
                  >
                    {rule.status === 'active' ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-bold">ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">DISABLED</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ZERO-TRUST POLICIES */}
      {activeTab === 'zerotrust' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Zero-Trust Micro-Segmentation Enclaves
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Cryptographic hardware tokens, JIT authorization, and continuous mTLS authentication
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ztPolicies.map((pol) => (
              <div key={pol.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[10px]">{pol.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-mono font-bold text-[10px]">
                    {pol.status.toUpperCase()}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{pol.name}</div>
                <div className="text-slate-600 font-mono text-[11px] pt-1">
                  Enclave: <span className="text-blue-700">{pol.enclave}</span>
                </div>
                <div className="text-slate-600 text-[11px] pt-1">
                  Posture: <span className="font-semibold text-slate-800">{pol.postureRequirement}</span>
                </div>
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-200">
                  <span>Trust: {pol.deviceTrust}</span>
                  <span>{pol.activeSessions} active sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
