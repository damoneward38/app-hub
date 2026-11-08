import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Flame, ArrowLeft, Bug, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CrashTest() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    // Deliberate JavaScript runtime crash to test ErrorBoundary
    throw new Error('SEC_ENCLAVE_SIMULATED_CRASH: Deliberate runtime exception triggered by developer test harness.');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-center font-sans bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Bug className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">
            Diagnostic Test Harness
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-2 mb-1">
            ErrorBoundary Crash Simulator
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Test the unhandled JavaScript crash lifecycle: Error Boundary capture, unique Error ID generation, SOC telemetry logging, and quarantine recovery.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs font-mono space-y-1.5 text-slate-600">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Workflow Sequence:</span>
          </div>
          <div className="pl-4 text-[11px] space-y-0.5">
            <div>1. JavaScript crashes in React render</div>
            <div>2. &lt;ErrorBoundary&gt; intercepts anomaly</div>
            <div>3. Unique Error ID is generated</div>
            <div>4. Error is logged to telemetry &amp; console</div>
            <div>5. User sees interactive recovery UI</div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            id="btn-trigger-crash"
            onClick={() => setShouldCrash(true)}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Trigger JavaScript Crash</span>
          </button>

          <Link
            to="/app/dashboard"
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Security Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
