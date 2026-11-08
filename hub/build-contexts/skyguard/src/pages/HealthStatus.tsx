import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, Copy, RefreshCw, ArrowLeft, Terminal, Server } from 'lucide-react';
import { getSystemHealth } from '../services/mockSecurityApi';

export default function HealthStatus() {
  const [healthData, setHealthData] = useState(getSystemHealth());
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'visual'>('json');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setHealthData({
        ...getSystemHealth(),
        timestamp: new Date().toISOString(),
      });
      setIsRefreshing(false);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(healthData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 font-sans bg-slate-50">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  HTTP 200 OK
                </span>
                <span className="text-xs font-mono text-slate-400">
                  GET /health
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                SkyGuard Enclave Health API
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Health Probe"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 font-bold uppercase">
            Probe Response:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('json')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'json' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Raw JSON Payload
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'visual' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Service Status Cards
            </button>
          </div>
        </div>

        {/* JSON Display */}
        {viewMode === 'json' && (
          <div className="space-y-2">
            <div className="p-5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner select-all leading-relaxed">
              <pre>{JSON.stringify(healthData, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCopy}
                className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON Payload'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Visual Cards Display */}
        {viewMode === 'visual' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Overall System Health</div>
                  <div className="text-[11px] font-mono text-emerald-700">Timestamp: {healthData.timestamp}</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs">
                {healthData.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(healthData.services).map(([srv, status]) => (
                <div key={srv} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">{srv}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-black text-slate-900 capitalize">{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/app/alerts"
            className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Alert Center</span>
          </Link>

          <Link
            to="/app/dashboard"
            className="text-xs font-semibold text-slate-600 hover:underline"
          >
            Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
