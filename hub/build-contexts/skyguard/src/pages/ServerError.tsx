import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw, Home, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ServerError() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setRetrySuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ServerCrash className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest block mb-1">
            HTTP 500 • Internal System Fault
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Enclave Service Error
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            The sovereign micro-enclave encountered an unexpected upstream timeout while verifying cryptographic ledger state.
          </p>
        </div>

        {/* Diagnostic Telemetry Block */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-left text-xs space-y-1 border border-slate-800">
          <div className="text-slate-400 text-[10px]">TRACE DIGEST:</div>
          <div className="text-rose-400 font-bold">ERR_ENCLAVE_UPSTREAM_TIMEOUT: KMS_HANDSHAKE_500</div>
          <div className="text-[11px] text-slate-400">Trace ID: <span className="text-blue-400 select-all">trc_0x8f2a91b0c948e71b2d4f5e6a987c3b21</span></div>
          <div className="text-[11px] text-slate-400">Region: <span className="text-slate-300">eu-central-1 (Frankfurt Sovereign DC)</span></div>
        </div>

        {retrySuccess ? (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Enclave heartbeat restored. Ready to reconnect.</span>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Re-establishing Enclave...' : 'Retry Handshake'}</span>
          </button>
          
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link to="/test-crash" className="text-[11px] font-mono text-slate-400 hover:text-rose-600 transition-colors">
            Test JavaScript &lt;ErrorBoundary&gt; Crash Simulation →
          </Link>
        </div>
      </div>
    </div>
  );
}
