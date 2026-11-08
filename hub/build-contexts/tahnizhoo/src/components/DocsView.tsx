import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  FileCode2,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { platformStore } from '../services/store';
import { INDUSTRY_TEMPLATES, PLANS, TASK_LIBRARY } from '../services/catalogData';

export const DocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/plans');
  const [responseOutput, setResponseOutput] = useState<string>('Click "Send Request" to test endpoint live.');
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      id: 'GET /api/plans',
      method: 'GET',
      path: '/api/plans',
      desc: 'Return the 3 subscription plans and gatekeeper permissions',
      handler: () => JSON.stringify(PLANS, null, 2),
    },
    {
      id: 'GET /api/industries',
      method: 'GET',
      path: '/api/industries',
      desc: 'List A-to-Z business templates with default task blueprints',
      handler: () =>
        JSON.stringify(
          INDUSTRY_TEMPLATES.map((i) => ({ id: i.id, name: i.name, code: i.code, tasks_count: i.defaultTasks.length })),
          null,
          2
        ),
    },
    {
      id: 'GET /api/tasks?industry=media',
      method: 'GET',
      path: '/api/tasks?industry=media',
      desc: 'Return default business & security tasks for an industry',
      handler: () => JSON.stringify(TASK_LIBRARY, null, 2),
    },
    {
      id: 'GET /api/businesses',
      method: 'GET',
      path: '/api/businesses',
      desc: 'List registered business profiles created via the Wizard',
      handler: () => JSON.stringify(platformStore.getBusinesses(), null, 2),
    },
    {
      id: 'GET /api/jobs',
      method: 'GET',
      path: '/api/jobs',
      desc: 'Query active jobs and swarm consensus logs',
      handler: () => JSON.stringify(platformStore.getJobs().slice(0, 3), null, 2),
    },
    {
      id: 'GET /api/audit',
      method: 'GET',
      path: '/api/audit',
      desc: 'Paginated immutable PCA-grade hash-chained ledger blocks',
      handler: () => JSON.stringify(platformStore.getAuditLog().slice(0, 4), null, 2),
    },
    {
      id: 'GET /api/admin/users',
      method: 'GET',
      path: '/api/admin/users',
      desc: 'Administrator endpoint to view all system users and plans',
      handler: () => JSON.stringify(platformStore.getUsers(), null, 2),
    },
  ];

  const handleTestEndpoint = (epId: string) => {
    const ep = endpoints.find((e) => e.id === epId);
    if (ep) {
      setSelectedEndpoint(ep.id);
      setResponseOutput(ep.handler());
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          Developer Knowledge Base & REST API Reference
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          תכנית הצופה (Taḥnīʿ Hâzoo) Specifications
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Comprehensive API routes, database schemas, and mathematical consensus rules governing the 200-agent orchestrator.
        </p>
      </div>

      {/* Hebrew Cultural Origin & Architecture Meaning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Nomenclature & Vision
          </div>
          <h2 className="text-lg font-bold text-white">
            "תכנית הצופה" (Taḥnīʿ Hâzoo)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Transliterated as <strong className="text-cyan-300">“Taḥni‘ Ha-Zoo”</strong> — meaning <em className="text-white">“The Planner & The Sentinel”</em>.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              <strong className="text-slate-200">“תכנית” (Taḥnīt)</strong>: The blueprint, the business architectural plan, the workflow.
            </li>
            <li>
              <strong className="text-slate-200">“הצופה” (Ha-Tzofeh)</strong>: The observer, the sentinel who watches over the wall to protect against threats.
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Swarm Consensus Math
          </div>
          <h2 className="text-lg font-bold text-white">
            Majority Quorum (≥ 11 / 20 Votes)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every task is dispatched to 20 isolated micro-VM containers in the respective group (Groups A–E for security, Groups F–J for business).
          </p>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
            consensus_passed = (agree_count &gt;= 11) &amp;&amp; (signature_valid == true)
          </div>
        </div>
      </div>

      {/* Interactive API Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Interactive REST Endpoint Sandbox
          </h2>
          <span className="text-xs text-slate-400">Live Client & Server Calls</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoint List */}
          <div className="space-y-2 lg:col-span-1">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleTestEndpoint(ep.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        ep.method === 'GET'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-indigo-950 text-indigo-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-200">{ep.path}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{ep.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Live Request / Response Viewer */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span>Target:</span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded text-white border border-slate-800">
                    {selectedEndpoint}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestEndpoint(selectedEndpoint)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Send Request
                  </button>
                  <button
                    onClick={handleCopyResponse}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Copy response"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>HTTP 200 OK · application/json</span>
                  <span>Latency: ~12ms</span>
                </div>
                <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-cyan-300 max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
                  {responseOutput}
                </pre>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/80">
              Authorization header: <span className="text-slate-400">Bearer &lt;user_jwt_token&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
