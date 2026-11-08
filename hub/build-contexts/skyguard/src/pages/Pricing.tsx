import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  X,
  Server,
  Zap,
  Lock
} from 'lucide-react';
import { pricingTiers } from '../data/features';
import { PricingTier } from '../types';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedTrialTier, setSelectedTrialTier] = useState<PricingTier | null>(null);
  const [trialEmail, setTrialEmail] = useState('');
  const [trialSuccess, setTrialSuccess] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // ROI Calculator state
  const [employeeCount, setEmployeeCount] = useState(25);
  const [dataSensitivity, setDataSensitivity] = useState<'standard' | 'regulated' | 'critical'>('regulated');

  const calculateEstimatedRisk = () => {
    let baseBreachCost = 150000;
    if (dataSensitivity === 'regulated') baseBreachCost = 450000;
    if (dataSensitivity === 'critical') baseBreachCost = 1200000;
    const totalRisk = baseBreachCost + employeeCount * 2500;
    const skyguardSavings = Math.round(totalRisk * 0.92);
    return { totalRisk, skyguardSavings };
  };

  const { totalRisk, skyguardSavings } = calculateEstimatedRisk();

  const handleStartTrial = (tier: PricingTier) => {
    setSelectedTrialTier(tier);
    setTrialSuccess(false);
  };

  const handleSubmitTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialEmail) return;
    setIsProvisioning(true);

    setTimeout(() => {
      setIsProvisioning(false);
      setTrialSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transparent Sovereign Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3 font-sans">
            Pricing Plans
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-2 font-sans" dir="rtl">
            תוכניות מנוי מאובטחות לכל סדר גודל של ארגון – התאמה מלאה לכל 78 המודולים
          </p>
          <p className="text-sm text-slate-500">
            Choose the right tier to secure your infrastructure and automate compliance across all 78 security features.
          </p>

          {/* Billing Switcher (Monthly / Annual) */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 rounded-full bg-slate-200 border border-slate-300 p-0.5 transition-colors cursor-pointer focus:outline-none"
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-5 h-5 rounded-full bg-blue-600 transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
          {pricingTiers.map((tier) => {
            const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
            const isHighlighted = tier.highlighted;
            const isEnterprise = tier.isCustom;

            return (
              <div
                key={tier.id}
                id={`tier-${tier.id}`}
                className={`relative flex flex-col justify-between rounded-xl p-8 transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-white border-2 border-blue-500 shadow-xl md:scale-105 z-10'
                    : isEnterprise
                    ? 'bg-slate-900 border border-slate-800 text-white shadow-sm'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider font-mono shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold font-sans ${isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                      {tier.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                      isEnterprise 
                        ? 'bg-slate-800 text-slate-400' 
                        : isHighlighted
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tier.id === 'basic' ? 'ENTRY' : tier.id === 'pro' ? 'GROWTH' : 'SCALED'}
                    </span>
                  </div>

                  <p className={`text-xs min-h-[36px] mb-6 ${isEnterprise ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tier.tagline}
                  </p>

                  {/* Price display */}
                  <div className={`mb-6 pb-6 border-b ${isEnterprise ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-baseline gap-1">
                      {tier.isCustom ? (
                        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                          Custom
                        </span>
                      ) : (
                        <>
                          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${isHighlighted ? 'text-slate-900' : 'text-slate-900'}`}>
                            ${price}
                          </span>
                          <span className="text-slate-500 text-xs font-mono">
                            /mo
                          </span>
                        </>
                      )}
                    </div>
                    <div className={`mt-2 text-xs font-semibold ${isHighlighted ? 'text-blue-600' : isEnterprise ? 'text-blue-400' : 'text-slate-600'}`}>
                      {tier.includedFeatureCount}/78 Features • {tier.users}
                    </div>
                  </div>

                  {/* Feature Perks List */}
                  <div className="space-y-3 mb-8">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${isEnterprise ? 'text-slate-400' : 'text-slate-500'}`}>
                      Included Capabilities:
                    </span>
                    {tier.perks.map((perk, i) => (
                      <div key={i} className={`flex items-start gap-2.5 text-xs ${isEnterprise ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isEnterprise ? 'text-green-400' : 'text-green-500'}`} />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button */}
                <div>
                  <button
                    onClick={() => handleStartTrial(tier)}
                    className={`w-full py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isHighlighted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : isEnterprise
                        ? 'bg-white hover:bg-slate-200 text-slate-900 shadow-sm'
                        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center mt-2.5">
                    <span className={`text-[11px] font-mono ${isEnterprise ? 'text-slate-500' : 'text-slate-400'}`}>
                      14-day zero-risk trial • Instant setup
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* White-Label Callout Banner */}
        <div className="rounded-2xl bg-slate-900 text-white border border-slate-800 p-8 mb-16 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise White‑Label Licensing Available</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Looking to Deploy SkyGuard Under Your Own Brand &amp; Domain?
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                We offer complete source/binary licensing ($3M–$25M) with 5-year SLA, custom rebranding, localized sovereign hosting, and dedicated Tier-3 cyber engineering.
              </p>
            </div>

            <Link
              to="/white-label"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs whitespace-nowrap transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore White‑Label Offer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Interactive ROI & Breach Cost Savings Calculator */}
        <div className="rounded-xl bg-white border border-slate-200 p-8 mb-16 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-sans">
                Interactive Security ROI &amp; Risk Savings Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Estimate how much SkyGuard’s 78 automated modules save your organization in breach avoidance and regulatory fines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Slider 1 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Total Users / Endpoints:</span>
                <span className="text-blue-600 font-bold font-mono">{employeeCount} seats</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 bg-slate-200"
              />
              <span className="text-[11px] text-slate-500 block">
                Adjust headcount to scale vulnerability surface area
              </span>
            </div>

            {/* Slider 2 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Data Sensitivity Level:</span>
                <span className="text-blue-600 font-bold uppercase font-mono">{dataSensitivity}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['standard', 'regulated', 'critical'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDataSensitivity(lvl)}
                    className={`py-1.5 rounded text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                      dataSensitivity === lvl
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500 block">
                {dataSensitivity === 'critical' ? 'Financial / Healthcare / Defense PHI' : 'Standard B2B / SaaS user database'}
              </span>
            </div>

            {/* Result Box */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center text-white shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Estimated Annual Risk Savings
              </span>
              <span className="text-3xl font-extrabold font-mono text-blue-400 block mb-2">
                ${skyguardSavings.toLocaleString()}
              </span>
              <span className="text-[11px] text-green-400 font-semibold">
                ✓ 92% average reduction in breach probability
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Provisioning Modal */}
      {selectedTrialTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
            <button
              onClick={() => setSelectedTrialTier(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {!trialSuccess ? (
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">
                      Start {selectedTrialTier.name} Free Trial
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Includes {selectedTrialTier.includedFeatureCount} modules • 14 days free
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitTrial} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@company.com"
                      value={trialEmail}
                      onChange={(e) => setTrialEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Selected Plan:</span>
                      <span className="text-slate-900 font-bold">{selectedTrialTier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Feature Scope:</span>
                      <span className="text-blue-600">{selectedTrialTier.includedFeatureCount} Modules</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trial Duration:</span>
                      <span className="text-green-600 font-bold">14 Days (No CC required)</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="w-full py-3 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {isProvisioning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Provisioning Secure Enclave...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Sandbox Tenant</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Tenant Successfully Provisioned!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An encrypted activation link and tenant credentials have been dispatched to <span className="text-blue-600 font-semibold">{trialEmail}</span>.
                </p>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-left text-slate-600 space-y-1">
                  <div>• Tenant ID: <span className="text-slate-900 font-bold">tnt_sandbox_{Math.floor(Math.random()*89999 + 10000)}</span></div>
                  <div>• Initialized Modules: <span className="text-green-600 font-bold">{selectedTrialTier.includedFeatureCount}/78 Active</span></div>
                  <div>• Status: <span className="text-blue-600 font-bold">Ready for Login</span></div>
                </div>
                <button
                  onClick={() => setSelectedTrialTier(null)}
                  className="w-full py-2.5 rounded-lg bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
