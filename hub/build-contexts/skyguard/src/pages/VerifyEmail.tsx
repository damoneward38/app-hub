import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const { user, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(codeParam || '789201');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.emailVerified || false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setIsVerifying(true);
    await verifyEmail(code);
    setIsVerifying(false);
    setIsVerified(true);
  };

  const handleResend = () => {
    setResendStatus('New 6-digit confirmation code dispatched to ' + (user?.email || 'your registered inbox.'));
    setTimeout(() => setResendStatus(null), 4000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md mb-3">
            <MailCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Email Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Cryptographic Data Subject &amp; Enclave Ownership Check
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {isVerified ? (
            <div className="space-y-4 text-center animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Email Address Verified
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Your enterprise email <strong className="font-mono text-slate-900">{user?.email || 'chief.security@skyguard.mesh'}</strong> is verified and linked to your Zero-Trust sovereign enclave.
              </p>

              <button
                onClick={() => navigate('/app/dashboard')}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4"
              >
                <span>Enter Security Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-xs text-slate-600 font-sans">
                We've sent a 6-digit cryptographic verification code to <strong className="font-mono text-slate-900">{user?.email || 'your registered work email'}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-center py-3 text-lg font-mono tracking-widest rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validating Verification Token...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Activate Enclave</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {resendStatus && (
                <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-mono">
                  {resendStatus}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
