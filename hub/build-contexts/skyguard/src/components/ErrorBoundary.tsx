import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Copy, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Terminal, 
  Activity,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { logEnclaveError, ErrorLogRecord } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallbackRender?: (props: {
    error: Error;
    errorRecord: ErrorLogRecord;
    resetErrorBoundary: () => void;
  }) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorRecord?: ErrorLogRecord;
  copiedId: boolean;
  copiedReport: boolean;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    copiedId: false,
    copiedReport: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // JavaScript crash intercepted -> Generate Error ID -> Log error to console & diagnostic store
    const errorRecord = logEnclaveError(error, errorInfo);
    this.setState({ errorRecord });
  }

  public resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorRecord: undefined,
      copiedId: false,
      copiedReport: false,
      showDetails: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCopyErrorId = () => {
    if (this.state.errorRecord?.errorId) {
      navigator.clipboard.writeText(this.state.errorRecord.errorId);
      this.setState({ copiedId: true });
      setTimeout(() => this.setState({ copiedId: false }), 2500);
    }
  };

  private handleCopyFullReport = () => {
    if (this.state.errorRecord) {
      navigator.clipboard.writeText(JSON.stringify(this.state.errorRecord, null, 2));
      this.setState({ copiedReport: true });
      setTimeout(() => this.setState({ copiedReport: false }), 2500);
    }
  };

  public render() {
    if (this.state.hasError) {
      const { error, errorRecord, copiedId, copiedReport, showDetails } = this.state;
      const errorId = errorRecord?.errorId || 'ERR-SEC-INITIALIZING';

      if (this.props.fallbackRender && error && errorRecord) {
        return this.props.fallbackRender({
          error,
          errorRecord,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      return (
        <div 
          id="skyguard-error-boundary"
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900 font-sans selection:bg-rose-500 selection:text-white"
        >
          <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Unhandled Runtime Exception
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Error Logged to Telemetry</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Security Enclave Quarantined
                </h1>
                <p className="text-xs text-slate-500 font-sans">
                  The Zero-Trust boundary caught a component exception and isolated the state to prevent session compromise.
                </p>
              </div>
            </div>

            {/* Generated Error ID & Incident Badge */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  <span>Unique Incident ID:</span>
                </span>
                <button
                  id="btn-copy-error-id"
                  onClick={this.handleCopyErrorId}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                  title="Copy Error ID to Clipboard"
                >
                  {copiedId ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-sm font-bold text-rose-400 tracking-wider select-all py-1">
                {errorId}
              </div>

              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <div>Logged At: <span className="text-slate-300">{errorRecord?.timestamp || new Date().toISOString()}</span></div>
                <div>Status: <span className="text-emerald-400 font-bold">Captured &amp; Stored</span></div>
              </div>
            </div>

            {/* Error Message Preview */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs font-mono text-rose-900 break-words">
                <span className="font-bold font-sans text-[11px] text-rose-700 block mb-1">
                  Exception: {error.name}
                </span>
                {error.message}
              </div>
            )}

            {/* Expandable Diagnostic Telemetry */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                id="btn-toggle-diagnostics"
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Technical Diagnostics &amp; Stack Hierarchy</span>
                </div>
                {showDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showDetails && (
                <div className="p-4 bg-slate-900 text-slate-300 font-mono text-[11px] space-y-3 overflow-x-auto border-t border-slate-200 max-h-60">
                  {errorRecord?.stack && (
                    <div>
                      <div className="text-slate-400 font-bold mb-1">Stack Trace:</div>
                      <pre className="text-rose-300 text-[10px] whitespace-pre-wrap leading-relaxed">
                        {errorRecord.stack}
                      </pre>
                    </div>
                  )}

                  {errorRecord?.componentStack && (
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-slate-400 font-bold mb-1">Component Tree:</div>
                      <pre className="text-slate-300 text-[10px] whitespace-pre-wrap leading-relaxed">
                        {errorRecord.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                    <div>URL: <span className="text-slate-200">{errorRecord?.url}</span></div>
                    <div>User Agent: <span className="text-slate-300">{errorRecord?.userAgent}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  id="btn-recover-enclave"
                  onClick={this.resetErrorBoundary}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Attempt Enclave Recovery</span>
                </button>

                <button
                  id="btn-reload-page"
                  onClick={this.handleReload}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Application</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  id="btn-copy-full-report"
                  onClick={this.handleCopyFullReport}
                  className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReport ? 'Copied Full JSON Report' : 'Copy Incident JSON for SOC'}</span>
                </button>

                <button
                  id="btn-return-home"
                  onClick={this.handleGoHome}
                  className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Return to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
