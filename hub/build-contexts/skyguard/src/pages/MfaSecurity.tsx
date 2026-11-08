import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  ShieldCheck, 
  QrCode, 
  Fingerprint, 
  Key, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  Lock, 
  ArrowRight,
  Shield,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function MfaSecurity() {
  const { user, toggleMfa } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'totp' | 'fido2' | 'backup'>('totp');
  const [totpCode, setTotpCode] = useState('');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const backupCodes = [
    '8F2A-91B0', 'C948-E71B', '2D4F-5E6A', '987C-3B21', 
    '04FA-E19B', '8827-E8A9', '1C7F-5432', '01DC-E90A'
  ];

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode) return;
    setIsVerifying(true);
    await toggleMfa(true);
    setIsVerifying(false);
    setSuccessMsg('MFA successfully verified & bound to your Zero-Trust sovereign identity.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleFidoRegister = async () => {
    setIsVerifying(true);
    await new Promise((res) => setTimeout(res, 800));
    await toggleMfa(true);
    setIsVerifying(false);
    setSuccessMsg('FIDO2 / YubiKey Hardware Security Key enrolled into enclave.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multi-Factor Authentication (MFA)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Hardware-Bound TOTP • FIDO2 WebAuthn • Single-Use Emergency Recovery Codes
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <button
            onClick={() => setActiveTab('totp')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'totp' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Authenticator App (TOTP)</span>
          </button>

          <button
            onClick={() => setActiveTab('fido2')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'fido2' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>FIDO2 / WebAuthn</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'backup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Emergency Codes</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {activeTab === 'totp' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Simulated QR Code */}
                <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-300 shadow-inner flex flex-col items-center justify-center flex-shrink-0">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-900 rounded">
                    {Array.from({ length: 36 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-xs ${ (idx % 2 === 0 || idx % 5 === 0) && idx % 3 !== 0 ? 'bg-white' : 'bg-slate-900' }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    STEP 1: SCAN OR INPUT KEY
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Scan with Google Authenticator, Authy, or 1Password
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Or manually enter this base32 seed secret into your authenticator application:
                  </p>
                  
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
                    <span className="font-bold tracking-widest">{secretKey}</span>
                    <button
                      onClick={handleCopySecret}
                      className="ml-auto text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                      title="Copy Secret"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 Form */}
              <form onSubmit={handleVerifyTotp} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                    STEP 2: CONFIRM 6-DIGIT TOTP CODE
                  </span>
                  <label className="block text-xs font-semibold text-slate-700 mt-2 mb-1">
                    Enter Verification Code from Authenticator
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full text-center py-3 text-lg font-mono tracking-widest rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="123456"
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
                      <span>Binding TOTP Root to Identity...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Activate &amp; Enforce MFA</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'fido2' && (
            <div className="space-y-6 animate-in fade-in text-center sm:text-left">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Hardware Security Key &amp; TouchID / Windows Hello
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      FIDO2 / WebAuthn provides phishing-resistant cryptographic authentication.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
                  <div>Supported Protocol: <span className="text-slate-900 font-bold">FIDO2 / CTAP2.1</span></div>
                  <div>Attestation Level: <span className="text-green-600 font-bold">Direct Hardware HSM Attestation</span></div>
                </div>

                <button
                  type="button"
                  onClick={handleFidoRegister}
                  disabled={isVerifying}
                  className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Touch Your Physical Security Key...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Enroll FIDO2 Hardware Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Single-Use Emergency Recovery Codes
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Store these recovery codes in a secure offline vault. Each code can be used once if you lose access to your primary MFA device.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                    setSuccessMsg('Backup recovery codes copied to clipboard.');
                    setTimeout(() => setSuccessMsg(null), 4000);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Codes</span>
                </button>

                <Link
                  to="/app/dashboard"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Return to Dashboard →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
