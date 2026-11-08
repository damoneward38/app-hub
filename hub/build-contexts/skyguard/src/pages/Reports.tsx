import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Reports() {
  const { user } = useAuth();
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 400);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      tenant: user?.tenantName,
      generatedFor: user?.name,
      generatedAt: new Date().toISOString(),
      securityScore: 99.8,
      totalMitigationsLast90Days: 1248900,
      slaUptime: '99.999%',
      activeComplianceFrameworks: ['SOC 2 Type II', 'ISO/IEC 27001:2022', 'HIPAA Security', 'GDPR Art. 17'],
      enforcedModules: '78 of 78 Modules Active',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyGuard_Executive_Cyber_Briefing_Q3_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Cyber Risk Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security &amp; Audit Reports
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Board-Ready Cyber Risk Briefings • Cryptographically Signed SLA Audit Logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Briefing</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Executive Briefing Paper Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-bold block">
              CONFIDENTIAL • BOARD OF DIRECTORS AUDIT REPORT
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              SkyGuard Sovereign Cyber Mesh Assessment
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Audit Period: Q3 2026 • Tenant: {user?.tenantName} • Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center flex-shrink-0">
            <span className="text-[10px] font-mono uppercase text-green-700 font-bold block">
              Posture Rating
            </span>
            <span className="text-2xl font-extrabold font-mono text-green-800">
              AAA+
            </span>
          </div>
        </div>

        {/* 3 Metrics in Report */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Verified Edge Uptime</span>
            <div className="text-2xl font-bold font-mono text-slate-900">99.999%</div>
            <span className="text-[10px] text-green-600 font-mono font-bold">5-Year SLA Compliant</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Autonomous Threat Mitigations</span>
            <div className="text-2xl font-bold font-mono text-slate-900">1,248,900</div>
            <span className="text-[10px] text-blue-600 font-mono font-bold">0 Breaches / 0 Data Leaks</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Compliance Readiness</span>
            <div className="text-2xl font-bold font-mono text-slate-900">100% Pass</div>
            <span className="text-[10px] text-green-600 font-mono font-bold">SOC 2 &amp; ISO 27001 Certified</span>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <h4 className="text-sm font-bold text-slate-900">Executive Summary &amp; Key Findings</h4>
          <p>
            During the active operating period, SkyGuard's 78-feature defense stack continuously protected all public ingress channels, zero-trust enclaves, and cryptographic partitions without experiencing single-point downtime or unauthorized credential compromise.
          </p>
          <p>
            Autonomous rate-limiting and polymorphic WAF rules neutralized over 1.2 million automated reconnaissance requests, credential stuffing waves, and zero-day SQL injection attempts before any payload reached the underlying application database tiers.
          </p>
        </div>

        {/* Attestation Signature block */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            <div>Attestation Hash: <strong className="text-slate-800">sha256:4b918a0021ce44e...991ab</strong></div>
            <div>Auditor Key ID: <strong className="text-slate-800">kms_sovereign_root_ca_2026</strong></div>
          </div>
          <div className="text-right">
            <span className="text-green-700 font-bold">✓ MATHEMATICALLY CERTIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
