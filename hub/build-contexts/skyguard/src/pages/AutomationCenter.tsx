import React, { useState } from 'react';
import { 
  Cpu, 
  Workflow, 
  Bell, 
  Plug, 
  Play, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  Send
} from 'lucide-react';
import { useWorkspace } from '../hooks/useWorkspace';
import { AutomationRule } from '../types';

export default function AutomationCenter() {
  const { activeWorkspace, logAuditEvent } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'rules' | 'workflows' | 'notifications' | 'integrations'>('rules');
  const [notification, setNotification] = useState<string | null>(null);

  // Automation Rules state
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule_001',
      name: 'Automated DDOS Rate-Limiting & Quarantining',
      description: 'Trigger instant IP isolation if requests exceed 5,000 req/sec from a single ASN.',
      trigger: 'Telemetry Anomaly Rate > 5,000/sec',
      condition: 'Target Apex is Production & Geo != Whitelist',
      action: 'Issue Cloudflare / WAF drop rule + Alert Slack SOC',
      enabled: true,
      lastTriggered: '14 mins ago',
      executionCount: 142,
    },
    {
      id: 'rule_002',
      name: 'Critical CVE Auto-Patching Workflow',
      description: 'Automatically isolate workloads exhibiting CVSS >= 9.0 vulnerabilities.',
      trigger: 'Vulnerability Scan Complete',
      condition: 'CVSS Score >= 9.0',
      action: 'Rotate TLS certs & isolate container subnet',
      enabled: true,
      lastTriggered: '2 hours ago',
      executionCount: 18,
    },
    {
      id: 'rule_003',
      name: 'GDPR DSAR Deletion Verification Trigger',
      description: 'Cryptographically wipe user records across all databases upon signed DSAR authorization.',
      trigger: 'DSAR Request Signed & Verified',
      condition: 'Jurisdiction == EU / UK',
      action: 'Execute automated multi-cluster shredder & export SHA-256 evidence',
      enabled: true,
      lastTriggered: 'Yesterday',
      executionCount: 57,
    },
    {
      id: 'rule_004',
      name: 'Unusual Geo-Login Step-Up MFA Challenge',
      description: 'Prompt hardware FIDO2 re-auth when access originated from new country.',
      trigger: 'User Authentication Attempt',
      condition: 'IP Geo Distance > 1,500km from last session',
      action: 'Revoke active session token and force biometric passkey',
      enabled: false,
      lastTriggered: '3 days ago',
      executionCount: 4,
    },
  ]);

  // Workflows
  const [workflows, setWorkflows] = useState([
    {
      id: 'wf_ransomware_containment',
      name: 'Level-1 Ransomware Containment Playbook',
      steps: ['Detect Canary File Alteration', 'Sever VPC Egress Gateway', 'Snapshot S3 / EBS Storage Volumes', 'Notify CISO Incident Bridge'],
      status: 'Active (Automated)',
      avgRuntime: '380ms',
    },
    {
      id: 'wf_compliance_audit_harvest',
      name: 'Continuous SOC 2 / ISO 27001 Evidence Harvester',
      steps: ['Poll AWS CloudTrail & Kubernetes Logs', 'Validate MFA Enforce Status', 'Generate Merkle Audit Leaf', 'Upload to Sovereign S3 Vault'],
      status: 'Scheduled (Hourly)',
      avgRuntime: '1.2s',
    },
    {
      id: 'wf_api_key_leak_rotation',
      name: 'GitHub Secret Leak Auto-Revocation',
      steps: ['Intercept Public Secret Ingestion Webhook', 'Revoke Compromised Key Instantly', 'Issue New Token via Vault', 'Notify Key Creator'],
      status: 'Active (Realtime)',
      avgRuntime: '120ms',
    },
  ]);

  // Notification Channels
  const [channels, setChannels] = useState([
    { id: 'chan_slack', name: 'Slack #soc-critical-alerts', type: 'Webhook', status: 'Connected', events: 'Critical & High' },
    { id: 'chan_pagerduty', name: 'PagerDuty On-Call Rotation', type: 'API Key', status: 'Connected', events: 'P1 Incidents' },
    { id: 'chan_email', name: 'SecOps Executive Email Digest', type: 'SMTP', status: 'Active', events: 'Daily Posture Summary' },
    { id: 'chan_webhook', name: 'SIEM Splunk / Datadog Forwarder', type: 'Syslog/TLS', status: 'Streaming', events: 'All Telemetry' },
  ]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const updated = !r.enabled;
          logAuditEvent({
            action: updated ? 'AUTOMATION_RULE_ENABLED' : 'AUTOMATION_RULE_DISABLED',
            entity: 'automation_rule',
            entityId: ruleId,
            metadata: { ruleName: r.name, enabled: updated },
          });
          return { ...r, enabled: updated };
        }
        return r;
      })
    );
    notify('Automation rule status updated.');
  };

  const executeRuleManually = (rule: AutomationRule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, executionCount: r.executionCount + 1, lastTriggered: 'Just now' } : r))
    );
    logAuditEvent({
      action: 'AUTOMATION_RULE_EXECUTED_MANUAL',
      entity: 'automation_rule',
      entityId: rule.id,
      metadata: { ruleName: rule.name },
    });
    notify(`Manually executed playbook: "${rule.name}"`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>5. AUTOMATION CENTER</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
              Autonomous SecOps
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AUTOMATION &amp; SOVEREIGN PLAYBOOKS
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Rules Engine • Event Workflows • Outbound Notifications • SOAR Connectors
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Center Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'rules', label: `Rules Engine (${rules.length})`, icon: Cpu },
          { id: 'workflows', label: `SOAR Workflows (${workflows.length})`, icon: Workflow },
          { id: 'notifications', label: `Alert Channels (${channels.length})`, icon: Bell },
          { id: 'integrations', label: 'Ecosystem Connectors', icon: Plug },
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

      {/* TAB 1: RULES ENGINE */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRule(r.id)}
                    className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {r.enabled ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        r.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">{r.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => executeRuleManually(r)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Test</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">TRIGGER</span>
                  <span className="text-slate-800">{r.trigger}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">CONDITION</span>
                  <span className="text-slate-800">{r.condition}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">ACTION</span>
                  <span className="text-blue-700 font-bold">{r.action}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Executions: {r.executionCount} cycles</span>
                <span>Last Fired: {r.lastTriggered || 'Never'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SOAR WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-base">{wf.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Latency: {wf.avgRuntime} • {wf.status}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold">
                  Zero-Latency SOAR
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {wf.steps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="p-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                    {idx < wf.steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((chan) => (
            <div key={chan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{chan.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">{chan.type}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  {chan.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Routing Scope:</span>
                  <span className="font-bold text-slate-800">{chan.events}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Encryption:</span>
                  <span className="text-emerald-700 font-bold">TLS 1.3 + HMAC</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <Plug className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ecosystem Connectors &amp; SIEM Feeds</h3>
              <p className="text-xs text-slate-500">Bidirectional event pipelines for cloud platforms and orchestration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            {['AWS Security Hub', 'Cloudflare WAF', 'Kubernetes Mesh', 'Datadog SIEM', 'Splunk Enterprise', 'CrowdStrike Falcon'].map((conn) => (
              <div key={conn} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">{conn}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
