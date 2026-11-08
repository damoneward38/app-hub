import React, { useState } from 'react';
import {
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Sparkles,
  Layers,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Copy,
  Terminal,
  Send,
  AlertTriangle,
  FileCheck2,
  Cpu,
  Clock,
  Landmark,
  Scale,
  HeartPulse,
  ShoppingCart,
  Film,
  Gamepad2,
  GraduationCap,
  Plane,
  BadgePercent,
  TrendingUp,
  Download,
  Key,
} from 'lucide-react';
import { PlanTier } from '../types';
import {
  PLANS,
  TARGET_VERTICALS_12,
  WHITE_LABEL_OFFER,
  IMPLEMENTATION_TIMELINE_10WEEKS,
  PRICING_MARGINS_TCO,
  TargetVerticalInfo,
} from '../services/catalogData';
import { platformStore } from '../services/store';

interface PricingViewProps {
  onPlanSelected: (tier: PlanTier) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onPlanSelected }) => {
  const currentUser = platformStore.getCurrentUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active sub-tab for expanded features
  const [activeSection, setActiveSection] = useState<
    'pricing' | 'whitelabel' | 'verticals' | 'paywall_middleware' | 'timeline'
  >('pricing');

  // Selected vertical quarter filter
  const [quarterFilter, setQuarterFilter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');

  // White-Label Form State
  const [wlCompany, setWlCompany] = useState('Acme Cyber Systems Ltd');
  const [wlContactName, setWlContactName] = useState('Jordan Taylor');
  const [wlEmail, setWlEmail] = useState('jordan.taylor@acmecyber.com');
  const [wlCompanySize, setWlCompanySize] = useState('51-200 employees');
  const [wlVertical, setWlVertical] = useState('Banking & FinTech');
  const [wlFeatures, setWlFeatures] = useState('Sapphire 65-Tools, Open-Jev Reasoning, Tempest Hunter');
  const [wlTurnaround, setWlTurnaround] = useState('14 Days (Fast-Track)');
  const [wlAgreedTerms, setWlAgreedTerms] = useState(false);
  const [copiedAgreement, setCopiedAgreement] = useState(false);
  const [signedSimulated, setSignedSimulated] = useState(false);

  // One-Button Checkout Simulator State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<{
    tier: string;
    price: string;
    isWhiteLabel?: boolean;
  } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResponse, setCheckoutResponse] = useState<any | null>(null);

  // Middleware 403 Drama Block Simulator State
  const [dramaBlockResult, setDramaBlockResult] = useState<{
    status: number;
    error: string;
    detail: string;
    telemetryLogged: boolean;
    timestamp: string;
  } | null>(null);

  const handleSelectPlan = (tier: PlanTier) => {
    platformStore.updateUserPlan(currentUser.id, tier);
    setSuccessToast(`Account upgraded to ${tier.toUpperCase()} (${billingCycle.toUpperCase()} Billing)!`);
    onPlanSelected(tier);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleTriggerCheckout = (tier: string, price: string, isWhiteLabel = false) => {
    setCheckoutTarget({ tier, price, isWhiteLabel });
    setCheckoutResponse(null);
    setCheckoutLoading(true);
    setCheckoutModalOpen(true);

    setTimeout(() => {
      setCheckoutLoading(false);
      if (isWhiteLabel) {
        setCheckoutResponse({
          endpoint: 'POST /checkout/whitelabel',
          status: 200,
          tier: 'white-label-indigo',
          amount: '$110,000.00 USD (One-time)',
          annual_maintenance: '$60,000.00 / yr ($5,000/mo)',
          early_discount_applied: '15% early-adopter credit applied if signed in 30 days',
          branding_domain: wlCompany.toLowerCase().replace(/[^a-z0-9]/g, '') + '.security-mesh.io',
          subscription_id: 'sub_whitelabel_' + Math.random().toString(36).substring(2, 9),
          client_secret: 'seti_10984_secret_' + Math.random().toString(36).substring(2, 10),
          stripe_connect_ready: true,
          redirect_to: 'https://checkout.stripe.com/c/pay/cs_live_' + Math.random().toString(36).substring(2, 12),
        });
      } else {
        setCheckoutResponse({
          endpoint: 'POST /checkout/subscription',
          status: 200,
          tier,
          billing: billingCycle,
          amount: price,
          subscription_id: 'sub_' + Math.random().toString(36).substring(2, 9),
          customer_id: 'cus_' + Math.random().toString(36).substring(2, 8),
          setup_intent: 'seti_' + Math.random().toString(36).substring(2, 10),
          status_code: 'active',
          payment_link: 'https://checkout.stripe.com/c/pay/cs_live_' + Math.random().toString(36).substring(2, 12),
        });
      }
    }, 850);
  };

  const handleSimulateDramaBlock = () => {
    setDramaBlockResult({
      status: 403,
      error: 'Forbidden',
      detail: 'Upgrade needed: 30-day Free Sandbox trial expired. Full 200-core swarm access requires T1 Essentials ($250/mo), T2 Pro ($1,500/mo), or T3 Enterprise ($4,500/mo).',
      telemetryLogged: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCopyAgreement = () => {
    const text = `===============================================================
TAḤNĪʿ HÂZOO / NEURAL CORE 200 — WHITE-LABEL OEM LICENSE AGREEMENT
===============================================================
RECEIVED BY: ${wlCompany}
CONTACT NAME: ${wlContactName} (${wlEmail})
COMPANY SIZE: ${wlCompanySize}
PRIMARY VERTICAL: ${wlVertical}
INTERESTED MODULES: ${wlFeatures}
REQUESTED TURN-AROUND: ${wlTurnaround}
SIGN-TERM: 30 Days (Qualifies for 15% Early-Adopter First-Year Discount)

COMMERCIAL TERMS:
- Single-Time White-Label License: $110,000 USD (Discounted to $93,500 with 15% discount)
- Annual Maintenance & Upgrade SLA: $60,000 USD / year (or $5,000 / month roll-up)

CORE CONTRACTUAL CLAUSES:
1. LICENSE CLAUSE: All 200-core agents and underlying model weights remain the proprietary intellectual property of Neural Core / Taḥnīʿ Hâzoo.
2. SERVICE CLAUSE: Maintenance, security patches, upgrades, and 24-h SLA support guaranteed for 12 months, renewable annually.
3. SECURITY CLAUSE: Audit logger is mathematically immutable; application must run strictly on customer on-premises or sovereign cloud hardware.
4. RESALE CLAUSE: OEM partner may re-brand and distribute to end-clients, but cannot unbundle or resell the raw underlying core as their own.

AGREED AND AUTHORIZED BY: ${wlContactName}
DATE: ${new Date().toLocaleDateString()}`;

    navigator.clipboard.writeText(text);
    setCopiedAgreement(true);
    setTimeout(() => setCopiedAgreement(false), 2500);
  };

  const filteredVerticals = TARGET_VERTICALS_12.filter((v) => {
    if (quarterFilter === 'ALL') return true;
    return v.quarter === quarterFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title & Brand Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          COMMERCIAL PRICING SCHEDULE · 3 TIERS + SANDBOX + WHITE-LABEL
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Transparent Swarm Capacity & Enterprise Licensing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Predictable flat-rate monthly and annual pricing for your AI workforce. Every tier exposes <strong>all 8 calling modalities</strong>, backed by our battle-tested 200-core security and creator swarm.
        </p>

        {/* Global Monthly vs. Annual Billing Toggle */}
        <div className="pt-2 flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Rates</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/80 text-cyan-300 border border-slate-700">
                $250 · $1.5k · $4.5k/mo
              </span>
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Annual Billing</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                $3k · $18k · $54k/yr
              </span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          {billingCycle === 'monthly' ? (
            <span>Month-to-month flexibility with zero annual contract lock-in. Cancel anytime.</span>
          ) : (
            <span className="text-emerald-400 font-bold">
              ✓ Billed annually. Guarantees locked-in pricing and dedicated on-prem hardware deployment.
            </span>
          )}
        </div>
      </div>

      {successToast && (
        <div className="max-w-lg mx-auto p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 animate-in fade-in shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Section Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-slate-800 pb-3 text-xs font-semibold">
        {[
          { id: 'pricing', label: '1. Three-Tier Pricing + Sandbox', icon: DollarSign },
          { id: 'whitelabel', label: '2. White-Label (Indigo) Offer', icon: Sparkles },
          { id: 'verticals', label: '3. 12 Target Verticals ($110M TAM)', icon: Building2 },
          { id: 'paywall_middleware', label: '4. Pay-Wall & Middleware Code', icon: Lock },
          { id: 'timeline', label: '5. 10-Week GTM Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                isActive
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

      {/* ========================================================= */}
      {/* SECTION 1: THREE-TIER PRICING + FREE SANDBOX CARDS       */}
      {/* ========================================================= */}
      {activeSection === 'pricing' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = currentUser.plan === plan.name;
              const displayPrice =
                plan.name === 'free'
                  ? '$0'
                  : billingCycle === 'monthly'
                  ? `$${plan.monthlyPrice.toLocaleString()}`
                  : `$${plan.annualPrice.toLocaleString()}`;
              const displayPeriod =
                plan.name === 'free'
                  ? '30-day sandbox trial'
                  : billingCycle === 'monthly'
                  ? 'month'
                  : 'year';

              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                    plan.popular
                      ? 'border-cyan-500/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-cyan-950/30 shadow-2xl shadow-cyan-950/50'
                      : plan.name === 'enterprise'
                      ? 'border-emerald-500/60 bg-gradient-to-b from-slate-900 via-slate-900/90 to-emerald-950/30'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold tracking-wide uppercase shadow-md">
                      Most Popular for Mid-Market
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-lg font-bold text-white">{plan.label}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40 uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 min-h-[34px] leading-relaxed">{plan.tagline}</p>

                    {/* Price Header */}
                    <div className="mt-4 mb-4 pb-4 border-b border-slate-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold font-mono text-white">
                          {displayPrice}
                        </span>
                        <span className="text-xs text-slate-400">/{displayPeriod}</span>
                      </div>
                      {plan.name !== 'free' && (
                        <span className="text-[11px] font-mono text-slate-500 block mt-1">
                          {billingCycle === 'monthly'
                            ? `Equivalent to $${(plan.annualPrice / 1000).toFixed(0)}k/year`
                            : `Equivalent to $${plan.monthlyPrice.toLocaleString()}/month`}
                        </span>
                      )}
                    </div>

                    {/* Swarm & SLA Specifications */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 mb-5 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Agent Swarm Capacity:</span>
                        <span className="text-cyan-300 font-mono font-bold">{plan.agentPercentage}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>SLA Commitment:</span>
                        <span className="text-slate-200 font-mono">{plan.sla}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Scan Execution:</span>
                        <span className="text-emerald-400 font-mono font-bold">{plan.scanMinutes}</span>
                      </div>
                    </div>

                    {/* Feature List */}
                    <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleTriggerCheckout(plan.label, `${displayPrice}/${displayPeriod}`)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        plan.popular
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25'
                          : plan.name === 'enterprise'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span>Checkout {plan.label.split('–')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleSelectPlan(plan.name)}
                      className="w-full py-1.5 text-[11px] text-slate-400 hover:text-white transition text-center cursor-pointer font-mono"
                    >
                      {isCurrent ? 'Current Active Tier' : 'Set as Mock Session Tier'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Paywall Notice Banner */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <strong className="text-white text-sm">30-Day Free Sandbox Policy:</strong>
                <p className="text-slate-400 leading-relaxed">
                  The Free Sandbox drops all friction for early testing with 40 agents and 50% docs. After 30 days, any unauthenticated or unpaid API request encounters an explicit <strong>HTTP 403 "Upgrade needed"</strong> response and is routed to the telemetry upsell queue.
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulateDramaBlock}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-700/60 text-amber-300 hover:bg-amber-900 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              Simulate 403 Drama Block
            </button>
          </div>

          {dramaBlockResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-red-500/50 font-mono text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-red-400 font-bold border-b border-red-900/40 pb-1.5">
                <span>SIMULATED API RESPONSE: HTTP {dramaBlockResult.status} {dramaBlockResult.error}</span>
                <span className="text-[10px] text-slate-500">{dramaBlockResult.timestamp}</span>
              </div>
              <p className="text-slate-300">{dramaBlockResult.detail}</p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Telemetry upsell event queued to /dev/telemetry/upsell_leads.log</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: WHITE-LABEL (INDIGO) OFFER & AGREEMENT FORM    */}
      {/* ========================================================= */}
      {activeSection === 'whitelabel' && (
        <div className="space-y-8">
          {/* Hero Banner for White-Label */}
          <div className="p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-cyan-950/70 space-y-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-900/90 border border-indigo-500/60 text-indigo-300 text-xs font-mono font-bold uppercase">
                WHITE-LABEL (INDIGO) OEM OFFER
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-900/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                15% EARLY-ADOPTER SIGNING DISCOUNT
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Own the Entire 3-Pillar Stack Under Your Own Custom Brand
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                Engineered for B2B OEM partners, Independent Software Vendors (ISVs), and systems integrators who want to deploy a complete, verified on-premise AI security operating platform under their own logo, colors, documentation, and customer domain.
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SINGLE-TIME LICENSE</span>
                <span className="text-2xl font-bold text-white">$110,000</span>
                <span className="text-[11px] text-emerald-400 block font-sans mt-0.5">
                  $93,500 with 15% 30-day early discount
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ANNUAL MAINTENANCE LEASE</span>
                <span className="text-2xl font-bold text-cyan-400">$60,000 / yr</span>
                <span className="text-[11px] text-slate-400 block font-sans mt-0.5">
                  Patches, upgrades & 24-hr onsite SLA
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MONTHLY EQUIVALENT ROLL-UP</span>
                <span className="text-2xl font-bold text-indigo-400">$5,000 / mo</span>
                <span className="text-[11px] text-slate-400 block font-sans mt-0.5">
                  Subscription roll-up model available
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => handleTriggerCheckout('White-Label (Indigo)', '$110,000 + $60,000/yr', true)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize White-Label Checkout ($110k)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive White-Label Agreement Form & Legal Clauses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  White-Label Lead Information Form
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                  30-DAY SIGNING TERM
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Received By (Company Name)</label>
                  <input
                    type="text"
                    value={wlCompany}
                    onChange={(e) => setWlCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Contact Name</label>
                    <input
                      type="text"
                      value={wlContactName}
                      onChange={(e) => setWlContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={wlEmail}
                      onChange={(e) => setWlEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Company Size</label>
                    <select
                      value={wlCompanySize}
                      onChange={(e) => setWlCompanySize(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option>1-50 employees</option>
                      <option>51-200 employees</option>
                      <option>201-1000 employees</option>
                      <option>1000+ Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Target Vertical</label>
                    <select
                      value={wlVertical}
                      onChange={(e) => setWlVertical(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      {TARGET_VERTICALS_12.map((v) => (
                        <option key={v.no}>{v.vertical}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Interested Modules</label>
                  <input
                    type="text"
                    value={wlFeatures}
                    onChange={(e) => setWlFeatures(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Preferred Turnaround</label>
                    <input
                      type="text"
                      value={wlTurnaround}
                      onChange={(e) => setWlTurnaround(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Sign-Term (Days)</label>
                    <input
                      type="text"
                      disabled
                      value="30 Days (15% Discount Active)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 pt-3">
                  <input
                    type="checkbox"
                    id="wl_agreed"
                    checked={wlAgreedTerms}
                    onChange={(e) => setWlAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="wl_agreed" className="text-[11px] text-slate-300 cursor-pointer">
                    I acknowledge that all 200-core agents remain intellectual property of Neural Core, and that our organization accepts the 12-month renewable on-premises maintenance terms.
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCopyAgreement}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedAgreement ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAgreement ? 'Agreement Copied!' : 'Copy Pre-Filled Agreement'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSignedSimulated(true);
                      setTimeout(() => setSignedSimulated(false), 3000);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>{signedSimulated ? 'DocuSign Dispatched!' : 'Dispatch DocuSign PDF'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Legal Clauses & Email Pitch */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Four Standard Contractual Clauses (The Legal Framework)
                </h3>

                <div className="space-y-3 text-xs">
                  {WHITE_LABEL_OFFER.clauses.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-bold text-white font-mono text-[11px] text-indigo-400 block">
                        {c.title}
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready-to-Send Email Template */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs space-y-2">
                <span className="text-[11px] text-slate-500 uppercase block">OUTREACH EMAIL TEMPLATE:</span>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 space-y-2 text-[11px] font-sans">
                  <p>Hi <strong>{wlContactName}</strong>,</p>
                  <p>
                    We’re excited to offer your team a fully-white-label, on-prem AI capability and security stack under <strong>{wlCompany}</strong>'s branding. Please review and sign the attached agreement, and we’ll schedule a dedicated onboarding session.
                  </p>
                  <p className="text-emerald-400 font-bold font-mono">
                    For a 15% discount on the first year ($93,500 vs. $110,000), let’s lock in the 30-day trial agreement today.
                  </p>
                  <p className="text-slate-400">Regards,<br />Neural Core Enterprise Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: 12 TARGET VERTICALS ($110M TAM COMBO)         */}
      {/* ========================================================= */}
      {activeSection === 'verticals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Target Vertical Combo — 12 New Enterprise Markets (3 Per Quarter)
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  We target <strong>3 verticals per quarter</strong> for key partner outreach. Capturing a modest 2% market share across these 12 sectors delivers over <strong>$2,000,000 ARR</strong> against a total addressable market of <strong>$110M+</strong>.
                </p>
              </div>

              {/* Quarter Filter */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                {['ALL', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuarterFilter(q as any)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      quarterFilter === q
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Verticals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredVerticals.map((vert) => (
                <div
                  key={vert.no}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                        #{vert.no} · {vert.quarter} OUTREACH
                      </span>
                      <span className="text-emerald-400 font-bold">{vert.tamEstimate} TAM</span>
                    </div>

                    <h4 className="text-base font-bold text-white">{vert.vertical}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{vert.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Avg TCO / Client:</span>
                      <span className="text-white font-bold">{vert.avgTco}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Compliance Anchor:</span>
                      <span className="text-indigo-400 truncate max-w-[170px]" title={vert.complianceKey}>
                        {vert.complianceKey}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Margin & TCO Summary Table */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Estimated Value, Average TCO & Profit Margins per Tier
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Average Total Cost of Ownership (TCO)</th>
                      <th className="px-4 py-3">Estimated ARR per Client</th>
                      <th className="px-4 py-3">Gross Margin (approx)</th>
                      <th className="px-4 py-3">Strategic Conversion Hook</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 bg-slate-900/30">
                    {PRICING_MARGINS_TCO.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-bold text-white font-mono">{row.tier}</td>
                        <td className="px-4 py-3 font-mono text-cyan-300">{row.tco}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{row.arr}</td>
                        <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{row.margin}</td>
                        <td className="px-4 py-3 text-slate-400">{row.conversionHook}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                *Margins assume 50% reuse of existing infrastructure; variable cost is restricted to supplemental 24/7 dedicated support engineering hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: PAY-WALL & MIDDLEWARE CODE IMPLEMENTATION     */}
      {/* ========================================================= */}
      {activeSection === 'paywall_middleware' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                Licensing & Pay-Wall Technical Implementation
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Technical enforcement operates via three synchronous tiers: <strong>Feature-gate Middleware</strong>, <strong>Config-Based Flags</strong>, and <strong>Telemetry Block Queue</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* Python Snippet */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] text-cyan-400 uppercase block font-bold">
                  1. Feature-Gate Middleware (FastAPI / Express):
                </span>
                <pre className="p-3 rounded bg-slate-900 text-slate-200 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`from fastapi import HTTPException

def check_license(user, feature: str):
    """
    Enforces active subscription or 30-day trial status.
    Blocks with HTTP 403 when feature is gated by tier.
    """
    if not user.paid or user.license_expired():
        # Log to telemetry queue for automated upsell outreach
        telemetry.log_blocked_attempt(user.id, feature)
        raise HTTPException(
            status_code=403, 
            detail="Upgrade needed: Tier does not cover " + feature
        )
    return True`}
                </pre>
              </div>

              {/* Node / Express Config-based check */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] text-emerald-400 uppercase block font-bold">
                  2. Config-Based Flags & Telemetry Logger:
                </span>
                <pre className="p-3 rounded bg-slate-900 text-slate-200 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`// Every API route inspects app_config["features"]["full"]
export function verifyFeatureAccess(req, res, next) {
  const tier = req.user?.plan || 'free';
  const isExpired = req.user?.trialDays > 30;

  if (tier === 'free' && isExpired) {
    telemetryQueue.push({
      userId: req.user.id,
      endpoint: req.originalUrl,
      event: 'SANDBOX_TRIAL_EXPIRED_DRAMA_BLOCK'
    });
    return res.status(403).json({
      error: "Forbidden",
      detail: "Upgrade needed"
    });
  }
  next();
}`}
                </pre>
              </div>
            </div>

            {/* Test Action */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-white font-bold text-xs block">Test Feature-Gate in Sandbox:</span>
                <span className="text-slate-400 text-[11px]">
                  Simulates a request against an enterprise-gated endpoint with an expired sandbox token.
                </span>
              </div>
              <button
                onClick={handleSimulateDramaBlock}
                className="px-4 py-2 rounded-lg bg-red-950 border border-red-700/60 text-red-300 text-xs font-bold hover:bg-red-900 transition cursor-pointer"
              >
                Trigger 403 Gate Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: 10-WEEK IMPLEMENTATION TIMELINE                */}
      {/* ========================================================= */}
      {activeSection === 'timeline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                10-Week Commercial Implementation Timeline
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Roadmap from licensing middleware draft to Day-1 enterprise close across the 12 target verticals:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Week</th>
                    <th className="px-4 py-3">Milestone</th>
                    <th className="px-4 py-3">Deliverable</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/30 font-mono">
                  {IMPLEMENTATION_TIMELINE_10WEEKS.map((t) => (
                    <tr key={t.week}>
                      <td className="px-4 py-3 font-bold text-cyan-400">Week {t.week}</td>
                      <td className="px-4 py-3 font-sans text-white">{t.milestone}</td>
                      <td className="px-4 py-3 text-slate-300 text-[11px]">{t.deliverable}</td>
                      <td className="px-4 py-3">
                        {t.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            ✓ READY
                          </span>
                        )}
                        {t.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold animate-pulse">
                            ACTIVE
                          </span>
                        )}
                        {t.status === 'scheduled' && (
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 text-[10px]">
                            SCHEDULED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BOTTOM-LINE "BOOM" STATEMENTS CARD                        */}
      {/* ========================================================= */}
      <div className="p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-indigo-950/40 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
          <BadgePercent className="w-4 h-4" />
          Bottom-Line Executive "Boom" Metrics
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">10% → 1 in 10</span>
            <h4 className="text-sm font-bold text-white">Product-Led Funnel</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Free sandbox draws 10% trial volume; 1-in-10 converts to Professional ($18k/yr); 5% converts directly to Enterprise ($54k/yr).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-2xl font-bold font-mono text-indigo-400">$110k + $60k</span>
            <h4 className="text-sm font-bold text-white">OEM White-Label Power</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              White-label OEM contract provides an upfront $110k cash infusion plus $60k/yr ($5k/mo) high-margin maintenance subscription.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">$2,000,000+ ARR</span>
            <h4 className="text-sm font-bold text-white">12 Verticals Penetration</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Over $110M combined TAM across the 12 target verticals. A modest 2% market share over 5 years yields $2M annual recurring revenue.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ONE-BUTTON CHECKOUT STRIPE SIMULATOR MODAL                */}
      {/* ========================================================= */}
      {checkoutModalOpen && checkoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Stripe Checkout Simulation</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {checkoutTarget.tier} · {checkoutTarget.price}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {checkoutLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 font-mono text-xs text-cyan-300">
                <div className="w-7 h-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                <span>Invoking Stripe Setup Intents & Connect...</span>
              </div>
            ) : checkoutResponse ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-600/50 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Stripe Checkout session initialized successfully for <strong>{checkoutTarget.tier}</strong>!
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                  <span className="text-[11px] text-slate-500 uppercase block">SIMULATED ENDPOINT RESPONSE:</span>
                  <pre className="text-slate-200 text-[11px] overflow-x-auto leading-relaxed">
                    {JSON.stringify(checkoutResponse, null, 2)}
                  </pre>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSuccessToast(`Stripe Checkout completed for ${checkoutTarget.tier}!`);
                      setCheckoutModalOpen(false);
                      setTimeout(() => setSuccessToast(null), 3500);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    Confirm & Activate Subscription
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
