import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  Plus, 
  CheckCircle2, 
  UserPlus, 
  Trash2, 
  Shield, 
  Lock, 
  AlertTriangle,
  RefreshCw,
  Copy,
  Clock,
  Radio
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWorkspace } from '../hooks/useWorkspace';
import { UserSession, UserRole, WorkspaceUser } from '../types';

export default function IdentityCenter() {
  const { user } = useAuth();
  const { activeWorkspace, addUserToWorkspace, logAuditEvent } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'mfa' | 'sessions'>('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Invite user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<WorkspaceUser['role']>('analyst');
  const [newTitle, setNewTitle] = useState('');

  // Active sessions mock list
  const [sessions, setSessions] = useState<UserSession[]>([
    {
      id: 'sess_9910',
      device: 'MacBook Pro 16" (Apple M3 Max)',
      browser: 'Chrome 128 / macOS 15.0',
      ipAddress: '192.88.99.12 (Zero-Trust Quarantined)',
      location: 'Tel Aviv, IL',
      lastActive: 'Just now (Active)',
      isCurrent: true,
      trustedStatus: 'Hardware Enclave',
    },
    {
      id: 'sess_9908',
      device: 'ThinkPad X1 Carbon (Linux Fedora 40)',
      browser: 'Firefox Developer 129',
      ipAddress: '10.200.1.44 (Staging WireGuard)',
      location: 'Frankfurt, DE',
      lastActive: '24 mins ago',
      isCurrent: false,
      trustedStatus: 'WebAuthn Bound',
    },
    {
      id: 'sess_9904',
      device: 'iPhone 15 Pro (iOS 18.0)',
      browser: 'SkyGuard Mobile Authenticator',
      ipAddress: '172.56.21.90',
      location: 'New York, US',
      lastActive: '3 hours ago',
      isCurrent: false,
      trustedStatus: 'Standard Session',
    },
  ]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addUserToWorkspace(activeWorkspace.id, {
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: 'active',
      mfaEnabled: true,
      lastActive: 'Just now',
      title: newTitle.trim() || 'Security Analyst',
    });

    setShowInviteModal(false);
    setNewName('');
    setNewEmail('');
    notify(`Invited ${newName} as ${newRole} to ${activeWorkspace.name}`);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    logAuditEvent({
      action: 'SESSION_REVOKED',
      entity: 'session',
      entityId: sessionId,
      metadata: { sessionId, revokedBy: user?.email || 'admin' },
    });
    notify(`Revoked session ${sessionId} and forced hardware re-authentication.`);
  };

  const roleDefinitions: { role: UserRole; title: string; access: string; count: number }[] = [
    {
      role: 'owner',
      title: 'Workspace Owner / CISO',
      access: 'Unrestricted full access across all 6 centers, billing, enclave root keys, and tenant destruction.',
      count: activeWorkspace.users.filter((u) => u.role === 'owner').length,
    },
    {
      role: 'admin',
      title: 'Security Administrator',
      access: 'Management of WAF rules, Zero-Trust policies, audit logs, and user provisioning.',
      count: activeWorkspace.users.filter((u) => u.role === 'admin').length,
    },
    {
      role: 'analyst',
      title: 'Security Analyst / SOC Commander',
      access: 'Alert triage, incident mitigation, evidence harvesting, and report generation.',
      count: activeWorkspace.users.filter((u) => u.role === 'analyst').length,
    },
    {
      role: 'viewer',
      title: 'Compliance Auditor / Viewer',
      access: 'Read-only access to cryptographic reports, GDPR logs, and posture scoring.',
      count: activeWorkspace.users.filter((u) => u.role === 'viewer').length,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>4. IDENTITY CENTER</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold">
              {activeWorkspace.name} Enclave
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            IDENTITY &amp; ACCESS MANAGEMENT (IAM)
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Zero-Trust RBAC • FIDO2 WebAuthn • Biometrics • Session Enclaves
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
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
          { id: 'users', label: `Users (${activeWorkspace.users.length})`, icon: Users },
          { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
          { id: 'mfa', label: 'Hardware MFA / FIDO2', icon: KeyRound },
          { id: 'sessions', label: `Active Sessions (${sessions.length})`, icon: Laptop },
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

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWorkspace.users.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">{u.id}</span>
                  <h3 className="font-bold text-slate-900 text-base">{u.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{u.email}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  u.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {u.role}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Title:</span>
                  <span className="text-slate-900 font-bold font-sans">{u.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MFA:</span>
                  <span className="text-emerald-700 font-bold">✓ Hardware FIDO2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Joined:</span>
                  <span className="text-slate-700">{u.joinedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ROLES & RBAC */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleDefinitions.map((rd) => (
              <div key={rd.role} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{rd.title}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
                    {rd.count} Active Users
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{rd.access}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Enforcement: Hardware Enclave</span>
                  <span className="text-emerald-600 font-bold">Zero-Trust Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MFA & HARDWARE ENCLAVE */}
      {activeTab === 'mfa' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hardware Security Keys &amp; WebAuthn Enclave</h2>
              <p className="text-xs text-slate-500 font-mono">FIDO2 / YubiKey / Apple Secure Enclave / Windows Hello</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">FIDO2 Security Key</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">YubiKey 5C NFC (Enclave ID: #YK-9912)</p>
              <span className="text-[10px] text-slate-400 block">Registered: Jan 15, 2026</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Apple Secure Enclave</span>
                <span className="text-emerald-600 font-bold">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">Touch ID Biometric Enclave (macOS)</p>
              <span className="text-[10px] text-slate-400 block">Registered: Mar 10, 2026</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">TOTP Authenticator</span>
                <span className="text-slate-500">Backup</span>
              </div>
              <p className="text-slate-500 text-[11px]">RFC 6238 6-Digit Time-Based Passcode</p>
              <span className="text-[10px] text-slate-400 block">Status: Synced</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.map((sess) => (
            <div key={sess.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Laptop className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-slate-900 text-sm">{sess.device}</span>
                  {sess.isCurrent && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                      Current Session
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                    {sess.trustedStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-4 pt-1">
                  <span>Browser: {sess.browser}</span>
                  <span>IP: {sess.ipAddress}</span>
                  <span>Location: {sess.location}</span>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Revoke Access
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* INVITE USER MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                  Identity Center Provisioning
                </span>
                <h3 className="text-base font-bold text-slate-900">Invite Member to {activeWorkspace.name}</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. alex.morgan@myenterprise.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="analyst">Security Analyst</option>
                    <option value="viewer">Auditor / Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Threat Intelligence Lead"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Enroll &amp; Enforce MFA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
