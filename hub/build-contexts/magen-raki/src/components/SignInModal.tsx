import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Mail,
  UserCheck,
  X,
  Zap,
  Cpu,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Building,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignInModal: React.FC = () => {
  const {
    isSignInModalOpen,
    closeSignInModal,
    signIn,
    signInAsRootAdmin,
    user,
    isAuthenticated,
    signOut,
    isLoading,
  } = useAuth();

  const [email, setEmail] = useState<string>('damoneward38@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('SUPERADMIN');
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials' | 'sso'>('credentials');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isSignInModalOpen) return null;

  const handleQuickAdminLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const ok = await signInAsRootAdmin();
      if (ok) {
        setSuccessMessage('Successfully authenticated as Root Admin (damoneward38@gmail.com)');
        setTimeout(() => {
          closeSignInModal();
        }, 1200);
      } else {
        setErrorMessage('Authentication failed.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to authenticate');
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      const ok = await signIn(email, password);
      if (ok) {
        setSuccessMessage(`Authenticated as ${email}`);
        setTimeout(() => {
          closeSignInModal();
        }, 1200);
      } else {
        setErrorMessage('Failed to sign in.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Authentication error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#0d0d1e] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 border-b border-indigo-500/20 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Security Access Portal</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Six 686 HSM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Magen-Raki Governance & Identity Enclave
              </p>
            </div>
          </div>

          <button
            onClick={closeSignInModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Notification Banner if already authenticated */}
        {isAuthenticated && user && (
          <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Active Session: <strong className="text-white">{user.email}</strong> ({user.role})
              </span>
            </div>
            <button
              onClick={signOut}
              className="text-[11px] px-2 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-medium transition-all"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Success / Error Feedback */}
        {successMessage && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="px-6 pt-5 border-b border-slate-800/80">
          <div className="pb-3 text-xs font-semibold uppercase tracking-wider text-indigo-400">Administrator email and password</div>
        </div>

        {/* Tab 2: Custom Credentials Form */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCustomLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@organization.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Enclave Passphrase / Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>{isLoading ? 'Authenticating...' : 'Sign In & Verify Enclave Session'}</span>
            </button>
          </form>
        )}

        {/* Footer info bar */}
        <div className="bg-[#090914] border-t border-slate-800/80 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>HSM Protocol v4.2 Secured</span>
          </span>
          <span>SHA-512 Continuous Audit</span>
        </div>
      </div>
    </div>
  );
};
