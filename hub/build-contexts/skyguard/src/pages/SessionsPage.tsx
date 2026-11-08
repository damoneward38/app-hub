import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  ShieldCheck, 
  Trash2, 
  LogOut, 
  Globe, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Layers,
  Key
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserSession } from '../types';

export default function SessionsPage() {
  const { sessions, revokeSession, terminateOtherSessions, user } = useAuth();
  const [notification, setNotification] = useState<string | null>(null);

  const handleRevoke = (sessionId: string, device: string) => {
    revokeSession(sessionId);
    setNotification(`Session for "${device}" revoked. Cryptographic token invalidated.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTerminateAll = () => {
    terminateOtherSessions();
    setNotification('All remote Zero-Trust sessions successfully terminated.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Identity &amp; Enclave Gate</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Active Sessions &amp; Device Governance
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Hardware-Attested Sessions • Continuous Posture Verification • Instant Token Revocation
          </p>
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleTerminateAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Other Sessions</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Active Concurrent Sessions</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {sessions.length}
          </div>
          <div className="text-[11px] text-green-600 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1 Current Session Verified</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Hardware Root of Trust</div>
          <div className="text-3xl font-extrabold text-blue-600 font-mono">
            100%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Bound to Secure Enclave / TPM 2.0
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500">Max Session TTL</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            8 Hours
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            With continuous risk-based re-auth
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Authenticated Devices &amp; Enclave Handshakes
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Signed cryptographically by tenant: <span className="text-slate-900">{user?.tenantName || 'SkyGuard Defense HQ'}</span>
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {sessions.length} Devices Listed
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.map((session) => {
            const isMobile = session.device.toLowerCase().includes('phone') || session.device.toLowerCase().includes('ios');
            const Icon = isMobile ? Smartphone : Laptop;

            return (
              <div key={session.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    session.isCurrent ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{session.device}</span>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-mono font-bold">
                          THIS DEVICE
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200">
                        {session.trustedStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-500 pt-0.5">
                      <div>Browser: <span className="text-slate-700 font-sans font-medium">{session.browser}</span></div>
                      <div>IP: <span className="text-slate-700">{session.ipAddress}</span></div>
                      <div>Location: <span className="text-slate-700">{session.location}</span></div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Last Activity: <strong className="text-slate-700">{session.lastActive}</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  {session.isCurrent ? (
                    <span className="text-xs font-mono text-green-600 font-bold px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Current Session</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevoke(session.id, session.device)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
