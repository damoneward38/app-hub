import React, { useState } from 'react';
import {
  CheckCircle2,
  Shield,
  Cpu,
  Zap,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PricingTier, PageTab } from '../types';
import { TenantUsageCard } from '../components/TenantUsageCard';

interface PricingPageProps {
  setActiveTab: (tab: PageTab) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setActiveTab }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [inferenceVolume, setInferenceVolume] = useState<number>(500000); // 500k queries
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tiers: PricingTier[] = [
    {
      id: 'basic',
      name: 'Basic (Single-User)',
      subtitle: 'Ideal for independent AI security researchers and prototype development.',
      price: billingCycle === 'annual' ? '$239' : '$299',
      billingPeriod: '/ month',
      userLimit: '1 User Seat',
      apiKeyCount: '1 Active API Key',
      sla: 'Standard Community SLA (99.5%)',
      ctaText: 'Deploy Basic Shield',
      features: [
        'Neural Core Engine (Nero-4.0) Cloud Sandbox',
        'Up to 100,000 scored inferences / month',
        'Real-time prompt injection filtering',
        'Model memory sanitization',
        'Tamper-proof HMAC audit receipts',
        'Standard Discord & Documentation support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro (5-User, 1 API-Key)',
      subtitle: 'Designed for production engineering teams deploying customer-facing AI agents.',
      price: billingCycle === 'annual' ? '$1,190' : '$1,490',
      billingPeriod: '/ month',
      badge: 'MOST POPULAR',
      highlighted: true,
      userLimit: '5 Team Seats',
      apiKeyCount: '1 High-Throughput API Key',
      sla: 'Production 99.9% Uptime SLA',
      ctaText: 'Start 14-Day Pro Trial',
      features: [
        'Everything in Basic tier',
        'Up to 1,500,000 scored inferences / month',
        'Dynamic Prompt Armor & Syntactic Deconstruct',
        'Sub-millisecond latency (<2.5ms scoring)',
        'Automated Red-Team attack fuzzing',
        'Exportable compliance audit reports',
        'Dedicated 24/7 Slack & incident channel',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise (Unlimited) + SLA',
      subtitle: 'Dedicated Six 686 hardware HSM PCIe appliances and sovereign air-gapped clusters.',
      price: 'Custom',
      billingPeriod: 'annual agreement',
      badge: 'SILICON APPLIANCE',
      userLimit: 'Unlimited Organization Seats',
      apiKeyCount: 'Unlimited API Keys & Clusters',
      sla: 'Mission-Critical 99.999% SLA (< 1ms Latency)',
      ctaText: 'Contact Enterprise Architect',
      features: [
        'Everything in Pro tier',
        'Unlimited monthly inferences',
        'Physical Six 686 PCIe HSM hardware card delivery',
        'Air-Gap Emulation & Sovereign on-prem support',
        'Custom model weight watermarking & key fuses',
        'FIPS 140-3 Level 4 physical tamper envelope',
        'Dedicated Technical Account Manager & custom SOC-2 reports',
      ],
    },
  ];

  const faqs = [
    {
      q: 'How does the Neural Core Engine (Nero-4.0) integrate with my existing LLM stack?',
      a: 'Nero-4.0 operates as an ultra-low-latency reverse proxy or client SDK wrapper. You route your OpenAI, Anthropic, Gemini, or self-hosted vLLM/Ollama requests through Magen-Raki. In under 2.5 milliseconds, Nero-4.0 evaluates the token stream, verifies hardware safety enclaves, and seals the audit block.',
    },
    {
      q: 'Can we install physical Six 686 PCIe HSM cards in our private datacenters?',
      a: 'Yes. Enterprise tier customers can receive dedicated Six 686 PCIe Gen5 expansion cards designed for high-density GPU server racks (such as NVIDIA HGX/H100/H200). The cards offload all security matrix math and physically protect model weight buses.',
    },
    {
      q: 'Does Magen-Raki store or train on our prompt data?',
      a: 'Never. In accordance with our Zero-Trust Extraction architecture, memory is completely sanitized after every inference batch. Only cryptographic hashes and safety verdicts are recorded in your private immutable ledger.',
    },
    {
      q: 'What compliance frameworks are supported out of the box?',
      a: 'Magen-Raki outputs structured audit certificates compliant with the European Union AI Act (Risk Management obligations), NIST AI Risk Management Framework (RMF 1.0), and SEC Cybersecurity Disclosure rules.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 text-slate-200">
      {/* Pricing Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>TRANSPARENT SILICON & CLOUD LICENSING</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Enterprise Sky-Shield Pricing
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
          Choose the protection tier that matches your deployment model — from rapid developer API keys to dedicated Six 686 PCIe silicon appliances.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 text-xs font-semibold">
          <span className={billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
            className="w-12 h-6 rounded-full bg-black/60 p-0.5 relative transition-colors border border-indigo-500/40"
          >
            <div
              className={`w-5 h-5 rounded-full bg-indigo-400 transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}>
            Annual (Save 20%)
          </span>
        </div>
      </div>

      {/* Pricing Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            id={`pricing-tier-${tier.id}`}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative backdrop-blur-md ${
              tier.highlighted
                ? 'bg-gradient-to-b from-indigo-950/80 via-black/80 to-black border-2 border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.3)] scale-105 z-10'
                : 'bg-black/40 border border-white/10 shadow-xl'
            }`}
          >
            {tier.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                {tier.badge}
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{tier.subtitle}</p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">{tier.price}</span>
                <span className="text-xs text-slate-400">{tier.billingPeriod}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 mb-6 space-y-1 text-xs font-mono">
                <div className="text-indigo-300 font-semibold">{tier.userLimit}</div>
                <div className="text-slate-400">{tier.apiKeyCount}</div>
                <div className="text-[11px] text-emerald-400 font-medium">{tier.sla}</div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                tier.highlighted
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200'
              }`}
            >
              <span>{tier.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive ROI & Volume Calculator */}
      <section className="p-8 rounded-3xl bg-black/40 border border-white/10 shadow-2xl space-y-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Inference Volume & Safety ROI Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Estimate required throughput and projected adversarial attack mitigations.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold font-mono text-indigo-300">
              {inferenceVolume.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block">inferences / month</span>
          </div>
        </div>

        <input
          type="range"
          min="50000"
          max="5000000"
          step="50000"
          value={inferenceVolume}
          onChange={(e) => setInferenceVolume(parseInt(e.target.value))}
          className="w-full h-2 bg-black/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400">EST. ATTACK VECTORS BLOCKED</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              ~{Math.round(inferenceVolume * 0.0084).toLocaleString()} attacks / mo
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400">AVERAGE LATENCY OVERHEAD</div>
            <div className="text-lg font-bold text-white mt-1">
              &lt; 2.4 ms (Zero user impact)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10">
            <div className="text-slate-400">RECOMMENDED DEPLOYMENT</div>
            <div className="text-lg font-bold text-indigo-300 mt-1">
              {inferenceVolume > 1500000
                ? 'Enterprise Six 686 PCIe Appliance'
                : inferenceVolume > 200000
                ? 'Magen-Raki Pro Cluster'
                : 'Magen-Raki Basic Cloud'}
            </div>
          </div>
        </div>
      </section>

      {/* Live Pay-Per-Character & Tenant Metering Telemetry Card (Recharts) */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h3 className="text-xl font-bold text-white">Live Tenant Usage & Metering Telemetry</h3>
          <p className="text-xs text-slate-400">
            Real-time pay-per-character analytics powered by Recharts, tracking live queries directly from the Magen-Raki Governor.
          </p>
        </div>
        <TenantUsageCard onSelectTenant={(tenant) => {
          console.log('Selected tenant in pricing:', tenant);
        }} />
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-white text-center">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden transition-colors backdrop-blur-md"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
