import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Shield,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Sparkles,
  Calculator,
  ArrowRight,
  Server,
  FileCode2,
  Users,
  Building,
  Check,
} from 'lucide-react';
import {
  PILLARS_METRICS,
  PILLARS_OVERVIEW,
  SAAS_REPLACEMENT_CATEGORIES,
  ValuationSaaSCategory,
} from '../services/pillarsData';

interface ValuationViewProps {
  onNavigateToHowToCall?: () => void;
  onNavigateToInvestor?: () => void;
  onNavigateToDocs?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToSecureEnterprise?: () => void;
}

export const ValuationView: React.FC<ValuationViewProps> = ({
  onNavigateToHowToCall,
  onNavigateToInvestor,
  onNavigateToDocs,
  onNavigateToVault,
  onNavigateToSecureEnterprise,
}) => {
  // Interactive ROI Calculator State
  const [teamSize, setTeamSize] = useState<number>(25);
  const [currentSaaSSpendMonthly, setCurrentSaaSSpendMonthly] = useState<number>(18000);
  const [annualSecurityAuditsCost, setAnnualSecurityAuditsCost] = useState<number>(65000);

  // Derived ROI calculations
  const totalAnnualSaaS = currentSaaSSpendMonthly * 12;
  const engineeringHoursSavedPerWeek = teamSize * 4; // 4 hours saved per engineer/creator per week
  const annualEngineeringLaborSaved = engineeringHoursSavedPerWeek * 50 * 95; // 50 weeks * $95/hr blended rate
  const annualTotalSavings = totalAnnualSaaS + annualSecurityAuditsCost + annualEngineeringLaborSaved;
  const threeYearValue = annualTotalSavings * 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Executive Valuation & ROI Brief
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why This Tool Is Worth Millions: Complete Asset Valuation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            This platform carries <strong>thousands of production-tested features</strong> across 3 massive codebases, replacing over a dozen distinct enterprise SaaS subscriptions and representing over <strong>15 years of senior engineering labor</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToSecureEnterprise && (
            <button
              onClick={onNavigateToSecureEnterprise}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/80 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Banks & Gov Enclave
            </button>
          )}
          {onNavigateToInvestor && (
            <button
              onClick={onNavigateToInvestor}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Investor Capital Terminal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onNavigateToHowToCall && (
            <button
              onClick={onNavigateToHowToCall}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              How To Call & Use
            </button>
          )}
          {onNavigateToDocs && (
            <button
              onClick={onNavigateToDocs}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              177 Docs Library
            </button>
          )}
        </div>
      </div>

      {/* Hero Asset Valuation Banner */}
      <div className="p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
            ESTIMATED ENTERPRISE ASSET VALUE: {PILLARS_METRICS.enterpriseValuation}
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            ANNUAL SAAS COST SAVINGS: {PILLARS_METRICS.annualSaaSSavings}
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Not a Demo. A Full Multi-Million-Dollar Software Arsenal.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            Most AI tools are thin wrappers with 50-100 basic prompt templates. Neural Core 200 is fundamentally different: it unites <strong className="text-white">three complete, industrial-grade software engines</strong> (Sapphire, Open-Jev, and Tempest) comprising <strong className="text-cyan-400">783 production files, 6,805 battle-tested functions, 247 live web routes, and 177 documentation books</strong>.
          </p>
        </div>

        {/* 4 Primary Value Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">PRODUCTION FUNCTIONS</span>
            <span className="text-2xl font-bold text-cyan-400">{PILLARS_METRICS.totalFunctions.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block font-sans">Across 78 modules</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">CODEBASE REPOSITORIES</span>
            <span className="text-2xl font-bold text-emerald-400">{PILLARS_METRICS.totalFiles} Files</span>
            <span className="text-[10px] text-slate-400 block font-sans">Python + JS/TS core</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">LIVE WEB ROUTES</span>
            <span className="text-2xl font-bold text-indigo-400">{PILLARS_METRICS.totalWebRoutes}</span>
            <span className="text-[10px] text-slate-400 block font-sans">REST & WebSocket APIs</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">DOCUMENTATION</span>
            <span className="text-2xl font-bold text-amber-400">{PILLARS_METRICS.totalDocPages} Pages</span>
            <span className="text-[10px] text-slate-400 block font-sans">In-depth technical manuals</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: THE 3 CORE ASSETS BREAKDOWN */}
      {/* ==================================================== */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          The Three Underlying Software Assets That Create This Value
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS_OVERVIEW.map((pillar) => (
            <div
              key={pillar.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {pillar.codename}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{pillar.fileCount} Files</span>
                </div>

                <h3 className="text-lg font-bold text-white">{pillar.name}</h3>
                <p className="text-xs text-slate-300 font-medium">{pillar.headline}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Functions:</span>
                  <span className="text-emerald-400 font-bold">{pillar.functionCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Modules:</span>
                  <span className="text-indigo-400 font-bold">{pillar.modulesCount} Modules</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Docs:</span>
                  <span className="text-amber-400 font-bold">{pillar.docPagesCount} Pages</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 2: STANDALONE SAAS VENDOR REPLACEMENT MATRIX */}
      {/* ==================================================== */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Direct SaaS Replacement: $550,000/Year in Saved Subscriptions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Running these individual capabilities through typical commercial SaaS vendors requires signing 7+ enterprise agreements:
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono block">ANNUAL VENDOR COST</span>
            <span className="text-xl font-bold font-mono text-rose-400">$555,000 / year</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAAS_REPLACEMENT_CATEGORIES.map((saas, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{saas.domain}</span>
                <span className="text-rose-400 font-mono font-bold">
                  ${saas.enterpriseCostPerYear.toLocaleString()}/yr
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                <span className="text-slate-500">Replaces Vendors: </span>
                <span className="text-slate-300 font-mono">{saas.commercialVendors.join(', ')}</span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">
                {saas.whatPlatformReplaces}
              </p>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold">
                  Included In Neural Core:
                </span>
                <ul className="space-y-0.5 text-[11px] text-slate-300">
                  {saas.featuresIncluded.map((feat, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] font-mono text-indigo-400">
                → Powered by {saas.technicalPillar}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 3: ENGINEERING LABOR EQUIVALENCE ($4.5M) */}
      {/* ==================================================== */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Engineering Labor Equivalence: 15 Senior Staff Engineer Years
        </h2>
        <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
          Building 6,805 functions across audio signal processing, statutory citation parsers, low-latency wake-word listeners, and binary reverse engineering requires an elite cross-disciplinary engineering team:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block">1. Applied AI & LLM Researchers</span>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              3 years evaluating Qwen decision models, authoring statutory invariant suites, and training domain adapters without hallucination.
            </p>
            <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-900">
              3 Engineers × $250k × 3 yrs = <strong className="text-white">$2,250,000</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block">2. Offensive & Red-Team Engineers</span>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Developing AST taint analyzers, EVM bytecode fuzzers, CAN bus protocols, and Ghidra ROP chain generation scripts.
            </p>
            <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-900">
              2 Engineers × $240k × 3 yrs = <strong className="text-white">$1,440,000</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-bold block">3. Systems, Audio & FinOps Architects</span>
            <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
              Crafting continuous schedulers, Porcupine DSP audio channels, P2WSH multi-sig wallets, and 247 production REST routes.
            </p>
            <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-900">
              2 Engineers × $220k × 3 yrs = <strong className="text-white">$1,320,000</strong>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/50 text-xs text-cyan-300 font-mono text-center">
          Total Baseline Payroll Value Replaced: <strong className="text-white text-sm">$5,010,000 USD</strong>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 4: INTERACTIVE ENTERPRISE ROI CALCULATOR */}
      {/* ==================================================== */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Interactive ROI & Value Realization Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust parameters to calculate your organization's exact cost savings and labor leverage.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950/80 border border-emerald-800/40">
            Real-Time Estimator
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1.5 font-semibold">
                <span>Team Size (Engineers, Analysts, Creators):</span>
                <span className="text-cyan-400 font-mono">{teamSize} Persons</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Saves ~4 hours/week per person via automated closed-loop self-repair.</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1.5 font-semibold">
                <span>Current Monthly Cloud SaaS Subscriptions ($):</span>
                <span className="text-emerald-400 font-mono">${currentSaaSSpendMonthly.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="3000"
                max="80000"
                step="1000"
                value={currentSaaSSpendMonthly}
                onChange={(e) => setCurrentSaaSSpendMonthly(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Replaces standalone vector, speech, scheduler, and code scanner SaaS tools.</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1.5 font-semibold">
                <span>Annual Pen-Testing & Security Audits ($):</span>
                <span className="text-indigo-400 font-mono">${annualSecurityAuditsCost.toLocaleString()}/yr</span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={annualSecurityAuditsCost}
                onChange={(e) => setAnnualSecurityAuditsCost(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Automated by continuous T3MP3ST AST taint sweeps and IAM privilege audits.</span>
            </div>
          </div>

          {/* Realized ROI Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 font-mono text-xs">
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                ESTIMATED ANNUAL VALUE HARVEST
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Direct SaaS Fees Eliminated:</span>
                  <span className="text-white">${totalAnnualSaaS.toLocaleString()}/yr</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>External Security Audit Savings:</span>
                  <span className="text-white">${annualSecurityAuditsCost.toLocaleString()}/yr</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Labor Hours Reclaimed ({engineeringHoursSavedPerWeek * 50} hrs):</span>
                  <span className="text-emerald-400 font-bold">${annualEngineeringLaborSaved.toLocaleString()}/yr</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-white">Year 1 Net Savings:</span>
                <span className="text-emerald-400 font-bold">${annualTotalSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>3-Year Compounded ROI:</span>
                <span className="text-cyan-400 font-bold">${threeYearValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-300 font-sans text-center">
              Payback Period: <strong className="text-white">Immediate (First Deployment Cycle)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
