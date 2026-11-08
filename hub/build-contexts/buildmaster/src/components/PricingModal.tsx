import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  CreditCard, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  X,
  Lock,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'pro' | 'enterprise';
  onSelectPlan: (plan: 'free' | 'pro' | 'enterprise') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPlan, 
  onSelectPlan 
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Starter Tier',
      price: '$0',
      period: 'forever',
      description: 'Ideal for exploring Sapphire AI assistant and testing cloud shell basics.',
      features: [
        '50 AI Messages / day',
        'Standard Gemini 3.7 Flash',
        'OpenClaw Cloud Terminal Sandbox',
        '5 Persistent Memory Slots',
        'Community Discord Support'
      ],
      cta: 'Current Tier',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Developer',
      price: billingCycle === 'monthly' ? '$12' : '$9',
      period: 'per month',
      description: 'Full-power neural engine, multi-agent AI hub, and infinite Ollama relay.',
      features: [
        'Unlimited AI Chats & Streams',
        'Gemini 3.1 Pro + 3.7 Flash',
        'Universal 3-Agent Collaboration Hub',
        'Unlimited Persistent Memories',
        'Continuous Voice & Wake Word ("Hey Sapphire")',
        'Direct Multi-Cloud Deployment (Vercel, Cloud Run)',
        'Priority Node Cluster Execution'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Team / Enterprise',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      period: 'per month',
      description: 'Dedicated cloud sandbox clusters, private VPC tunnels, and custom LLM routing.',
      features: [
        'Everything in Pro Developer',
        'Dedicated Cloud Run Isolated Containers',
        'Custom Fine-Tuned Model Weights',
        'SLA 99.99% Uptime Guarantee',
        'SSO, RBAC & Audit Logging',
        '24/7 Dedicated Solutions Engineer'
      ],
      cta: 'Get Enterprise',
      popular: false
    }
  ];

  const handleCheckout = (planId: 'free' | 'pro' | 'enterprise') => {
    setIsProcessing(true);
    setSelectedPlanId(planId);

    setTimeout(() => {
      onSelectPlan(planId);
      setIsProcessing(false);
      onClose();

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                FLEXIBLE DEVELOPER TIERS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              Supercharge your engineering workflow with Sapphire + OpenClaw
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select the plan that best fits your development and deployment velocity.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="flex justify-center">
          <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition ${
                billingCycle === 'monthly'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-mono">/{plan.period}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Included Features:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleCheckout(plan.id as any)}
                    disabled={isProcessing}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                        : plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:opacity-95'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Plan' : plan.cta}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Lifetime Access Offer ($29 one-time PayPal/Stripe) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Lifetime Pro License — Special $29 One-Time
              </h4>
              <p className="text-xs text-slate-300">
                Unlock permanent Pro features with zero recurring subscription fees.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCheckout('pro')}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shrink-0 shadow-md shadow-amber-500/20 transition"
          >
            Claim Lifetime ($29)
          </button>
        </div>
      </div>
    </div>
  );
};
