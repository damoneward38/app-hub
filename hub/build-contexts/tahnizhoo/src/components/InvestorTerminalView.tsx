import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
  Calculator,
  Calendar,
  Building2,
  FileText,
  Key,
  Award,
  Zap,
  Target,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Landmark,
  Shield,
  Clock,
  PieChart,
} from 'lucide-react';
import { PILLARS_METRICS } from '../services/pillarsData';

interface InvestorTerminalViewProps {
  onNavigateToHowToCall?: () => void;
  onNavigateToValuation?: () => void;
  onNavigateToDocs?: () => void;
  onNavigateToWizard?: () => void;
  onNavigateToSecureEnterprise?: () => void;
}

export const InvestorTerminalView: React.FC<InvestorTerminalViewProps> = ({
  onNavigateToHowToCall,
  onNavigateToValuation,
  onNavigateToDocs,
  onNavigateToWizard,
  onNavigateToSecureEnterprise,
}) => {
  // Interactive Financial Modeling Simulator State
  const [targetEnterpriseClients, setTargetEnterpriseClients] = useState<number>(45);
  const [targetProClients, setTargetProClients] = useState<number>(120);
  const [avgSeatsPerClient, setAvgSeatsPerClient] = useState<number>(25);
  const [marketMultiple, setMarketMultiple] = useState<number>(8);

  // Math calculations based on Master Build Prompt economics:
  // Pro: Base License $20k + $1.5k/mo per 10 users ($18k/yr)
  // Enterprise: Base License $70k + $3k/mo per 10 users ($54k/yr)
  const proBaseRevenue = targetProClients * 20000;
  const proAnnualSubRevenue = targetProClients * (1500 * 12 * (avgSeatsPerClient / 10));

  const enterpriseBaseRevenue = targetEnterpriseClients * 70000;
  const enterpriseAnnualSubRevenue = targetEnterpriseClients * (3000 * 12 * (avgSeatsPerClient / 10));

  const totalLicenseCashFlow = proBaseRevenue + enterpriseBaseRevenue;
  const totalAnnualRecurringRevenue = proAnnualSubRevenue + enterpriseAnnualSubRevenue;
  const totalGrossYearOne = totalLicenseCashFlow + totalAnnualRecurringRevenue;
  const projectedValuationAtMultiple = totalAnnualRecurringRevenue * marketMultiple;

  // Active sub-tab state
  const [activeDossierTab, setActiveDossierTab] = useState<
    'executive' | 'pricing' | 'paywall' | 'tam' | 'launch' | 'exit'
  >('executive');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header with Slick Institutional Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Briefcase className="w-3 h-3 text-emerald-400" />
              INVESTOR-READY · CAPITAL DOSSIER
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              SERIES A / INSTITUTIONAL TERMINAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            The Investor Capital Terminal & Commercial Blueprint
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            A comprehensive commercial, valuation, and exit dossier for venture capital and private equity investors. Outlining our <strong>$4.25M+ baseline asset valuation</strong>, three-tier licensing model, <strong>$300M+ TAM in regulated zero-egress sectors</strong>, and 30-day go-to-market execution plan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToSecureEnterprise && (
            <button
              onClick={onNavigateToSecureEnterprise}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/80 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Banks, Defense & FDA Enclave
            </button>
          )}
          {onNavigateToValuation && (
            <button
              onClick={onNavigateToValuation}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              Cost & Asset Audit
            </button>
          )}
          {onNavigateToHowToCall && (
            <button
              onClick={onNavigateToHowToCall}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              8 Calling Modes
            </button>
          )}
        </div>
      </div>

      {/* Slick Golden Ratio Hero Banner for VCs */}
      <div className="p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/70 via-slate-950 to-indigo-950/70 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Landmark className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
            IMMEDIATE ASSET VALUATION: ~$4,250,000 USD
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            ON-PREM PRODUCTION LICENSE WORTH: $250k–$900k
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-mono">
            EXIT VALUATION POTENTIAL: $320M (10-Yr License Portfolio)
          </span>
        </div>

        <div className="space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Pitch: "Zero-Trust, Zero-Cloud, Sovereign AI Security Under Your Own Lease"
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            When pitching to an institutional investor or Fortune 500 CISO, our value proposition is decisive: <strong className="text-white">“We take this battle-tested 3-pillar AI security engine (Sapphire, Open-Jev, T3MP3ST) and license it directly under your own sovereign control — zero IP exposure, zero external cloud data egress, and 100% immutable offline cryptographic auditability.”</strong>
          </p>
        </div>

        {/* 4 Core Quantitative Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono relative z-10">
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">DISCRETE FUNCTIONS</span>
            <span className="text-2xl font-bold text-emerald-400">&gt; 3,000+</span>
            <span className="text-[10px] text-slate-400 block font-sans">Verifiable across 3 codebases</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">PRODUCTION API ROUTES</span>
            <span className="text-2xl font-bold text-cyan-400">247 Live Routes</span>
            <span className="text-[10px] text-slate-400 block font-sans">API-first + CLI + Python SDK</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">AUDIT TRANSPARENCY</span>
            <span className="text-2xl font-bold text-indigo-400">177 Books</span>
            <span className="text-[10px] text-slate-400 block font-sans">100% compliance evidence</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">REGULATED TAM</span>
            <span className="text-2xl font-bold text-amber-400">$300M+</span>
            <span className="text-[10px] text-slate-400 block font-sans">Banks, Defense & Healthcare</span>
          </div>
        </div>
      </div>

      {/* Slick Section Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3 text-xs font-semibold">
        {[
          { id: 'executive', label: '1. What You Have ($4.25M Asset)', icon: Award },
          { id: 'pricing', label: '2. Three-Tier Pricing Model', icon: DollarSign },
          { id: 'paywall', label: '3. Firm Paywall Mechanics', icon: Lock },
          { id: 'tam', label: '4. Market TAM ($300M+)', icon: PieChart },
          { id: 'launch', label: '5. 30-Day Launch Plan', icon: Calendar },
          { id: 'exit', label: '6. Exit Multiples & ROI Simulator', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDossierTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeDossierTab === tab.id
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* DOSSIER SECTION 1: WHAT YOU ACTUALLY HAVE */}
      {/* ==================================================== */}
      {activeDossierTab === 'executive' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              What The Platform Actually Represents (Verifiable Code & IP)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Your codebase, documentation, and 3-Pillar functionality (Sapphire, Open-Jev, T3MP3ST) represent <strong className="text-white">&gt; 3,000 discrete, verifiable functions</strong>. All of that is sellable either as an on-premise permanent license, an API-first SaaS subscription, or an enterprise managed service appliance.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Core Asset Item</th>
                    <th className="px-4 py-3">Asset Value (Market Reality)</th>
                    <th className="px-4 py-3">What The Buyer & Enterprise Receives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">
                      Baseline Platform Valuation
                      <span className="block text-[10px] text-slate-500 font-mono">177 docs + 3k+ discrete functions</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">~$4.25M USD</td>
                    <td className="px-4 py-3 text-slate-300">
                      Full on-premises and API-first sovereign AI security stack with local Ollama runtime.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">
                      247 API Routes + CLI + Python SDK
                      <span className="block text-[10px] text-slate-500 font-mono">8 unified calling modalities</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400 font-bold">High-Bandwidth API Asset</td>
                    <td className="px-4 py-3 text-slate-300">
                      Minimum Just-In-Time deployment latency with language-agnostic integration into existing infrastructure.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">
                      177 Documentation Books & READMEs
                      <span className="block text-[10px] text-slate-500 font-mono">Public Jev inventory, TOOLS.md, Red-Team Arsenal</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-400 font-bold">100% Audit Transparency</td>
                    <td className="px-4 py-3 text-slate-300">
                      Immediate compliance auditability for SOC 2, HIPAA, FedRAMP High, SEC 17a-4, and FDA Part 11 examiners.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">
                      Production Source Code & Models
                      <span className="block text-[10px] text-slate-500 font-mono">783 files (Sapphire, Open-Jev, Tempest)</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400 font-bold">$250,000 – $900,000 Base</td>
                    <td className="px-4 py-3 text-slate-300">
                      Permanent perpetual deployment rights or white-label OEM distribution for enterprise defense contractors.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DOSSIER SECTION 2: THREE-TIER PRICING MODEL */}
      {/* ==================================================== */}
      {activeDossierTab === 'pricing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Three-Tier Commercial Pricing Model (A "Tiered Pay-wall")
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              All tiers expose <strong>the same 8 calling modalities</strong> (CLI, Python SDK, 247 REST routes, MCP, Wake-Word, Scheduler, Web3, Studio UI); the only gating is the <strong>breadth of the 200-core agent swarm</strong>, the advanced feature catalog, and managed SLAs.
            </p>

            {/* Three Tiers Pricing Table + White-Label Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      TIER 1 (STARTER)
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">$250/mo</span>
                  </div>
                  <h4 className="text-base font-bold text-white">T1 – "Essentials"</h4>
                  <div className="text-xs font-mono text-emerald-400">
                    $250 / month ($3,000 / year)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    20% of agent swarm (≈ 40 agents) with 100% of 177 docs. Ideal for developer pilots and startups.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>40 agents across all 3 pillars</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>All 8 calling modalities (full response)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>100% of 177 docs + local setup</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>1-hour SLA (on-premises)</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-900 font-mono text-[11px] text-slate-500">
                  Target: Banking, Retail, Medical & Smart-Home pilots.
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-cyan-500/50 bg-cyan-950/20 flex flex-col justify-between space-y-4 relative">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-900 text-cyan-300 font-bold">
                      TIER 2 (MID-MARKET)
                    </span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">$1,500/mo</span>
                  </div>
                  <h4 className="text-base font-bold text-white">T2 – "Pro" Edition</h4>
                  <div className="text-xs font-mono text-cyan-400">
                    $1,500 / month ($18,000 / year)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    70% of all core agents (≈ 140) with complete 177 docs and aggressive penetration scans.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-cyan-900/50">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>140 agents across all 3 pillars</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Email + phone support (24-hr SLA)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Advanced API without throttling</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Aggressive scans & vulnerability hunt</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-cyan-900/50 font-mono text-[11px] text-cyan-300">
                  Target: Banking, FinTech, Legal & Healthcare.
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-emerald-500/60 bg-emerald-950/20 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold">
                      TIER 3 (ENTERPRISE)
                    </span>
                    <span className="text-xs font-mono text-emerald-300 font-bold">$4,500/mo</span>
                  </div>
                  <h4 className="text-base font-bold text-white">T3 – "Enterprise" Sovereign</h4>
                  <div className="text-xs font-mono text-emerald-400">
                    $4,500 / month ($54,000 / year)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    100% of all 200 agents, managed health checks, 1-hour SLA, and 24/7 dedicated on-prem support.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-emerald-900/50">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>All 200 agents (complete 3-pillar stack)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Full SLA (1-hr response, 24-hr fallback)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>24/7 on-prem dedicated incident response</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Air-gapped on-premise hardware option</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-emerald-900/50 font-mono text-[11px] text-emerald-300">
                  Target: Insurance, Gov, Smart-Grid & Energy.
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-indigo-500/60 bg-indigo-950/20 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 font-bold">
                      OEM / ISV
                    </span>
                    <span className="text-xs font-mono text-indigo-300 font-bold">$110k + $60k</span>
                  </div>
                  <h4 className="text-base font-bold text-white">White-Label (Indigo)</h4>
                  <div className="text-xs font-mono text-indigo-400">
                    $110k one-time + $60k/yr ($5k/mo)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full 200-core stack with custom brand kit, custom domain, and B2B OEM re-branding rights.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-indigo-900/50">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Complete 3-pillar codebase re-brand</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>15% early-adopter signing discount</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>1-year maintenance lease & SLA</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Custom client domain & white-label docs</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-indigo-900/50 font-mono text-[11px] text-indigo-300">
                  Target: OEM Partners across all 12 Verticals.
                </div>
              </div>
            </div>

            {/* Why This Model Works Matrix */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white font-mono uppercase text-[11px] block text-emerald-400">
                Why This Pricing Architecture Scales Uniquely Well:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-300 font-sans">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <strong className="text-white block mb-1">License + Subscription:</strong>
                  One-time sale creates immediate cash-flow asset; subscription creates high-margin recurring ARR.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <strong className="text-white block mb-1">High Sustainability:</strong>
                  Even if a client pauses upgrades, recurring maintenance ensures continuous patch and security support.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <strong className="text-white block mb-1">Unbeatable Stickiness:</strong>
                  Enterprise SLA, closed-loop repair, and immutable PCA audit logs make clients extremely reluctant to churn.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                  <strong className="text-white block mb-1">Rapid Upsell Path:</strong>
                  Clients start at Free/Starter ($3k) → expand to Pro ($18k/yr) → upgrade to full Enterprise ($54k/yr).
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-800/50 text-[11px] text-cyan-300 font-mono">
                Scaling Math: Many large companies run &gt;200 users ($360k ARR per org). Multiplying across 50–100 target enterprises = <strong>$10M–$15M ARR in the first 2 years</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DOSSIER SECTION 3: BEHIND-THE-PAYWALL BREAKDOWN */}
      {/* ==================================================== */}
      {activeDossierTab === 'paywall' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Behind-The-Paywall Feature Matrix & Gating Enforcement
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Strict technical and network controls ensure paid features cannot be leaked or bypassed.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Feature Behind Paywall</th>
                    <th className="px-4 py-3">Tier Level Required</th>
                    <th className="px-4 py-3">Why It Stays Protected</th>
                    <th className="px-4 py-3">Pricing Leverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Full 200-Core Swarm</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">Pro & Enterprise</td>
                    <td className="px-4 py-3">Protects the business core with 80–90% of the 3k functions</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">Core security value driver</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Full 177 Docs + Tool Guides</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">Pro & Enterprise</td>
                    <td className="px-4 py-3">Provides regulatory audit evidence required by examiners</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">Exclusive compliance proof</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Managed-Service Operations</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">Enterprise</td>
                    <td className="px-4 py-3">Hands-on migration, live patching, and 1-hour SLA</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">Service margin 45–55%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Enterprise-Only Admin Portal</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">Enterprise</td>
                    <td className="px-4 py-3">Single-Sign-On (SSO), internal policy engine, and audit UI</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">+$1k per 10 users</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Custom Plugin Store</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">Enterprise</td>
                    <td className="px-4 py-3">White-label modular components with revenue share</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">15% revenue-share add-on</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4 Firm Gating Mechanisms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white font-mono text-amber-400 block">1. Code-Level Gating:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Paid feature modules are wrapped in runtime checks (<code className="text-cyan-300">process.env.LICENSE === 'ENTERPRISE'</code>) throwing clean, graceful <code className="text-slate-300">FeatureNotAvailable</code> exceptions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white font-mono text-emerald-400 block">2. In-House Network Gate:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Enterprise hosts operate on an isolated in-house private endpoint: zero external IP routing, dropping all outbound internet queries for sovereign compliance.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white font-mono text-indigo-400 block">3. Cryptographic Audit Trail:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Immutable ledger seals each task execution with manufacturer-held asymmetric cryptographic keys, preventing unlogged or unauthorized tampering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white font-mono text-cyan-400 block">4. SSO / Key-Based Licensing:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Customers receive a cryptographically signed hardware token validated on system boot. If a token is revoked or expired, the system safely locks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DOSSIER SECTION 4: MARKET TAM ($300M+) */}
      {/* ==================================================== */}
      {activeDossierTab === 'tam' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              Sizing the Total Addressable Market (TAM): $300M+ in Regulated Sectors
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Focusing on high-compliance, zero-leakage organizations that are legally barred from using public cloud LLM endpoints:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-amber-400 font-bold uppercase">SEGMENT A: REGULATED ENTERPRISES</span>
                  <span className="text-white font-bold">$120M – $180M TAM</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  1,500 target institutions: Tier-1 Banks, Law Firms, Hospital Networks, Army Bases, Naval Command, Federal Government, and the FDA.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                  Average spend: <strong className="text-white">$80,000 – $120,000 / year</strong>
                </div>
                <p className="text-slate-400 text-[11px]">
                  These institutions face multi-million dollar fines under SEC 17a-4, HIPAA, ITAR, and FDA 21 CFR Part 11 if data leaks to external cloud models.
                </p>
                {onNavigateToSecureEnterprise && (
                  <button
                    onClick={onNavigateToSecureEnterprise}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Inspect Regulated Enclave Architecture (Banks, Defense & FDA)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-cyan-400 font-bold uppercase">SEGMENT B: MID-MARKET & CREATORS</span>
                  <span className="text-white font-bold">$75M – $120M TAM</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  3,000 businesses: E-Commerce conglomerates, digital media publishers, creative studios, and SaaS platforms.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                  Average spend: <strong className="text-white">$25,000 – $40,000 / year</strong>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Fast adoption driven by our A-to-Z creator ledger, DRM licensing, automated transcoding, and closed-loop website self-healing.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200 font-mono space-y-1">
              <span className="font-bold text-white block">Enterprise Market Penetration Anchor:</span>
              <span>An initial cohort of just 500 Enterprise licenses (~$54k/yr each) generates <strong>$27,000,000 ARR</strong>.</span>
              <span className="block text-slate-400 text-[11px]">Lifetime Value (LTV) across a 2-year customer journey averages 3.5× initial subscription price.</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DOSSIER SECTION 5: RECOMMENDED 30-DAY LAUNCH PLAN */}
      {/* ==================================================== */}
      {activeDossierTab === 'launch' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Recommended 30-Day Launch Plan (Go-To-Market Execution)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              A structured 30-day timeline to transition from developer MVP to paying institutional contracts:
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              {[
                { day: 'Day 1', phase: 'Preroll Preparation', owner: 'Dev / Eng', desc: 'Package demo-grade sandbox (free tier) + 1-click installer with test telemetry.' },
                { day: 'Day 3', phase: 'Public MVP Launch', owner: 'Marketing', desc: 'Deploy Starter edition publicly on GitHub and Docker Hub with open-source calling modes.' },
                { day: 'Day 5', phase: 'PR & Tech Outreach', owner: 'Communications', desc: 'Publish technical whitepapers on InfoSec portals; offer 1-month free sandbox for 20 target firms.' },
                { day: 'Day 8', phase: 'Enterprise C-Suite Outreach', owner: 'Sales & BD', desc: 'Target 30 CISOs and Legal Directors of regulated firms via LinkedIn Sales Navigator.' },
                { day: 'Day 10', phase: 'Pay-Wall Release', owner: 'Product', desc: 'Publish official Enterprise Pricing Guide with live "Enter Sovereign Cloud" contract portal.' },
                { day: 'Day 12', phase: 'Initial On-Premise Installs', owner: 'Operations', desc: 'Setup first 5 Enterprise managed-service contracts with dedicated hardware appliance.' },
                { day: 'Day 30', phase: 'Unit Metrics Review', owner: 'Analytics', desc: 'Audit Cost-Per-Lead (CPL), MQL-to-close ratio, and month-1 expansion pipeline velocity.' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40 shrink-0">
                      {step.day}
                    </span>
                    <span className="font-bold text-white">{step.phase}</span>
                    <span className="text-slate-600 hidden sm:inline">·</span>
                    <span className="text-slate-400 font-sans text-[11px]">{step.desc}</span>
                  </div>
                  <span className="text-cyan-400 text-[10px] shrink-0 font-sans bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Lead: {step.owner}
                  </span>
                </div>
              ))}
            </div>

            {/* Launch Promotional Discount Callout ("1/10") */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-xs space-y-2">
              <span className="font-bold text-amber-300 font-mono uppercase text-[11px] block">
                Promotional Launch Incentive (50% Off First 10 Paying Customers):
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Offer Pro Tier at <strong className="text-white">$10,000</strong> (down from $20,000) and Enterprise at <strong className="text-white">$35,000</strong> (down from $70,000) for the first 10 enterprise adopters. This yields <strong className="text-emerald-400">$15k+ immediate onboarding spend</strong> and <strong className="text-cyan-300">$3k/month recurring</strong>, anchoring verified case studies for the rest of the market.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DOSSIER SECTION 6: EXIT MULTIPLES & INTERACTIVE MODEL */}
      {/* ==================================================== */}
      {activeDossierTab === 'exit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  "Exit Card": Valuation Multiples & Capital Return Roadmap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How enterprise acquirers and institutional investors value this 3-pillar technology asset.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/40">
                VC Valuation Multiples
              </span>
            </div>

            {/* Exit Multiples Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden font-mono">
                <thead className="bg-slate-950 text-[11px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Funding Stage</th>
                    <th className="px-4 py-3">Market Multiple</th>
                    <th className="px-4 py-3">Target ARR</th>
                    <th className="px-4 py-3">Estimated Enterprise Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Seed (Years 1–2)</td>
                    <td className="px-4 py-3 text-cyan-400">3–4× ARR</td>
                    <td className="px-4 py-3 text-slate-300">$200k – $500k ARR</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">~$1,000,000 – $2,000,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Series A (Years 3–4)</td>
                    <td className="px-4 py-3 text-cyan-400">4–5× ARR</td>
                    <td className="px-4 py-3 text-slate-300">$1M – $3M ARR</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">~$6,000,000 – $15,000,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">Series B (Years 5–6)</td>
                    <td className="px-4 py-3 text-cyan-400">8–10× ARR</td>
                    <td className="px-4 py-3 text-slate-300">$5M – $10M ARR</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">~$40,000,000 – $100,000,000</td>
                  </tr>
                  <tr className="bg-emerald-950/30">
                    <td className="px-4 py-3 font-bold text-white">10-Year Portfolio Mature</td>
                    <td className="px-4 py-3 text-emerald-300">8× Enterprise ARR</td>
                    <td className="px-4 py-3 text-white font-bold">$40,000,000 ARR</td>
                    <td className="px-4 py-3 font-bold text-emerald-300">~$320,000,000 USD</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interactive Investor Financial Simulator */}
            <div className="p-6 rounded-2xl border border-emerald-500/40 bg-slate-950 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    Interactive Capital Projection Engine
                  </h4>
                  <p className="text-xs text-slate-400">
                    Model portfolio cash-flow by adjusting contracted enterprise licenses and valuation multiples.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">Live Calculator</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sliders */}
                <div className="space-y-4 text-xs font-sans">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                      <span>Enterprise Clients (T3 @ $70k base + $36k/yr sub):</span>
                      <span className="text-emerald-400 font-mono">{targetEnterpriseClients} Orgs</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={targetEnterpriseClients}
                      onChange={(e) => setTargetEnterpriseClients(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                      <span>Pro Commercial Clients (T2 @ $20k base + $18k/yr sub):</span>
                      <span className="text-cyan-400 font-mono">{targetProClients} Orgs</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="400"
                      step="10"
                      value={targetProClients}
                      onChange={(e) => setTargetProClients(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                      <span>Average User Seats per Organization:</span>
                      <span className="text-indigo-400 font-mono">{avgSeatsPerClient} Seats</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={avgSeatsPerClient}
                      onChange={(e) => setAvgSeatsPerClient(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                      <span>Target ARR Multiple on Exit:</span>
                      <span className="text-amber-400 font-mono">{marketMultiple}× ARR</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="1"
                      value={marketMultiple}
                      onChange={(e) => setMarketMultiple(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Real-time Math Output Card */}
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 font-mono text-xs">
                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      PROJECTED FINANCIAL RUNWAY
                    </span>

                    <div className="space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Upfront Base License Capital:</span>
                        <span className="text-white">${totalLicenseCashFlow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Annual Recurring Revenue (ARR):</span>
                        <span className="text-emerald-400 font-bold">${totalAnnualRecurringRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Year-1 Gross Contract Inflow:</span>
                        <span className="text-cyan-400 font-bold">${totalGrossYearOne.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-white">Projected Enterprise Exit:</span>
                      <span className="text-emerald-400 font-bold">
                        ${projectedValuationAtMultiple.toLocaleString()} USD
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Valuation calculated at {marketMultiple}× on ${totalAnnualRecurringRevenue.toLocaleString()} ARR.
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-300 font-sans text-center">
                    VC Rationale: Sovereign on-prem execution eliminates cloud GPU token bleed, giving our engine <strong>unprecedented 85%+ gross software margins</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Institutional CTA Strip */}
      <div className="p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Ready for Institutional Due Diligence?</h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Schedule a private technical review with our architecture team or deploy an air-gapped sandbox node into your evaluation environment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToWizard && (
            <button
              onClick={onNavigateToWizard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              Test On-Prem Business Wizard
            </button>
          )}
          {onNavigateToDocs && (
            <button
              onClick={onNavigateToDocs}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Inspect 177 Compliance Docs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
