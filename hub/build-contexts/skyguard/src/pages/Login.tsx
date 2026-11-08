import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, CheckCircle2, UserCheck, ShieldAlert, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const [email, setEmail] = useState('chief.security@skyguard.mesh');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('849201');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [mfaStepRequired, setMfaStepRequired] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password, selectedRole);
    setIsSubmitting(false);
    navigate(from, { replace: true });
  };

  const handleQuickDemo = async (role: UserRole, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setIsSubmitting(true);
    await login(demoEmail, 'demo-enclave-passphrase', role);
    setIsSubmitting(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SkyGuard Access Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Zero-Trust Sovereign Authentication &amp; Hardware MFA Gateway
          </p>
        </div>

        {/* Quick Demo Role Selector (5 Roles Specification) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>RBAC Persona Switcher (Instant Test):</span>
            </span>
            <span className="text-[10px] font-mono text-blue-600 font-bold">1-Click Auth</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {/* OWNER */}
            <button
              type="button"
              onClick={() => handleQuickDemo('owner', 'owner@skyguard.mesh')}
              className={`w-full p-2 rounded-lg border transition-colors text-left flex items-center justify-between cursor-pointer ${
                selectedRole === 'owner' ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="font-bold">OWNER</span>
                <span className="text-[10px] text-slate-500 font-sans">• Full Access (All 78 Modules &amp; Tenant)</span>
              </div>
              <span className="text-[9px] bg-purple-200 px-1.5 py-0.5 rounded text-purple-900 font-bold">ROOT</span>
            </button>

            {/* ADMIN */}
            <button
              type="button"
              onClick={() => handleQuickDemo('admin', 'admin@skyguard.mesh')}
              className={`w-full p-2 rounded-lg border transition-colors text-left flex items-center justify-between cursor-pointer ${
                selectedRole === 'admin' ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-bold">ADMIN</span>
                <span className="text-[10px] text-slate-500 font-sans">• Security Config (WAF / Zero-Trust)</span>
              </div>
              <span className="text-[9px] bg-blue-200 px-1.5 py-0.5 rounded text-blue-900 font-bold">CONFIG</span>
            </button>

            {/* SECURITY ANALYST */}
            <button
              type="button"
              onClick={() => handleQuickDemo('security_analyst', 'analyst@skyguard.mesh')}
              className={`w-full p-2 rounded-lg border transition-colors text-left flex items-center justify-between cursor-pointer ${
                selectedRole === 'security_analyst' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span className="font-bold">SECURITY ANALYST</span>
                <span className="text-[10px] text-slate-500 font-sans">• Alerts, Incidents, Reports</span>
              </div>
              <span className="text-[9px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">SOC</span>
            </button>

            {/* PRIVACY OFFICER */}
            <button
              type="button"
              onClick={() => handleQuickDemo('privacy_officer', 'privacy.officer@skyguard.mesh')}
              className={`w-full p-2 rounded-lg border transition-colors text-left flex items-center justify-between cursor-pointer ${
                selectedRole === 'privacy_officer' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-bold">PRIVACY OFFICER</span>
                <span className="text-[10px] text-slate-500 font-sans">• GDPR, Consent, DSAR Shredding</span>
              </div>
              <span className="text-[9px] bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-900 font-bold">GRC</span>
            </button>

            {/* VIEWER */}
            <button
              type="button"
              onClick={() => handleQuickDemo('viewer', 'viewer@stakeholder.com')}
              className={`w-full p-2 rounded-lg border transition-colors text-left flex items-center justify-between cursor-pointer ${
                selectedRole === 'viewer' ? 'bg-slate-200 border-slate-400 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="font-bold">VIEWER</span>
                <span className="text-[10px] text-slate-500 font-sans">• Read-Only Telemetry</span>
              </div>
              <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">READ</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enterprise Email (SAML / SSO / OAuth)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="name@enterprise.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Hardware / Enclave Passphrase
                </label>
                <Link to="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                  Password Reset?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  MFA / FIDO2 / TOTP Token
                </label>
                <Link to="/mfa" className="text-[10px] font-mono text-blue-600 hover:underline">
                  Setup MFA →
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 tracking-widest focus:outline-none focus:border-blue-500"
                  placeholder="6-digit TOTP"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Hardware Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In &amp; Launch Enclave Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Links for Authentication suite */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-sans">
            <div>
              <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                Sign Up / Provision Tenant →
              </Link>
            </div>
            <div className="text-right">
              <Link to="/verify-email" className="text-slate-600 hover:text-blue-600 hover:underline">
                Email Verification Link →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
