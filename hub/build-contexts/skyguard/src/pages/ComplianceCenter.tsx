import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { initialFrameworks } from '../services/mockSecurityApi';
import { ComplianceFramework } from '../types';

export default function ComplianceCenter() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>(initialFrameworks);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>(initialFrameworks[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceDownloaded, setEvidenceDownloaded] = useState(false);

  const filteredControls = selectedFramework.controls.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadEvidencePack = () => {
    setEvidenceDownloaded(true);
    const reportData = {
      framework: selectedFramework.name,
      version: selectedFramework.version,
      score: selectedFramework.overallScore,
      auditTimestamp: new Date().toISOString(),
      controls: selectedFramework.controls,
      signature: 'sha256:sovereign_enclave_audit_certified_9941a',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyGuard_Evidence_Audit_${selectedFramework.id}_2026.json`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setEvidenceDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Continuous Automated Compliance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Compliance Center &amp; Evidence Matrix
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Automated Audit Readiness • Real-time Control Attestation • Regulatory Mapping
          </p>
        </div>

        <button
          onClick={handleDownloadEvidencePack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{evidenceDownloaded ? 'Evidence Pack Exported ✓' : 'Download Complete Evidence Pack'}</span>
        </button>
      </div>

      {/* Framework Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((fw) => {
          const isSelected = selectedFramework.id === fw.id;
          return (
            <button
              key={fw.id}
              onClick={() => setSelectedFramework(fw)}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-sm ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{fw.name}</span>
                <span className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  {fw.overallScore}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mb-3 truncate">
                {fw.version}
              </p>
              <div className="text-[11px] text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
                <span>{fw.passedControls} / {fw.totalControls} Controls</span>
                <span className="text-blue-600 font-bold">View Matrix →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Control Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {selectedFramework.name} Continuous Attestation Matrix
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Live audit verification linked to SkyGuard 78-Module Stack
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search controls or criteria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredControls.map((ctrl) => (
            <div key={ctrl.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {ctrl.id}
                  </span>
                  <span className="font-bold text-slate-900">{ctrl.title}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Category: <strong className="text-slate-700">{ctrl.category}</strong></span>
                  <span>•</span>
                  <span>Linked Module: <strong className="text-blue-600">Feature #{ctrl.linkedFeatureId}</strong></span>
                  <span>•</span>
                  <span>Evidence Token: <strong className="text-slate-700">{ctrl.evidenceId}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                  ctrl.status === 'passed' ? 'bg-green-50 text-green-700 border border-green-200' :
                  ctrl.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {ctrl.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
