import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Check, Zap, Crown, Infinity, ArrowRight, Sparkles, Shield, Headphones } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    period: "",
    icon: <Zap className="w-6 h-6" />,
    color: "text-emerald-400",
    borderColor: "border-border",
    popular: false,
    features: [
      "Access to all free apps",
      "Try freemium apps (limited)",
      "Community support",
      "Basic marketplace browsing",
      "No credit card needed",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 19,
    period: "/month",
    icon: <Crown className="w-6 h-6" />,
    color: "text-violet-400",
    borderColor: "border-violet-500/50",
    popular: true,
    features: [
      "Access to ALL apps",
      "Unlimited usage",
      "Priority support",
      "Early access to new apps",
      "API access",
      "Remove branding",
      "7-day free trial",
    ],
    cta: "Start 7-Day Free Trial",
    ctaVariant: "default" as const,
  },
  {
    id: "lifetime" as const,
    name: "Lifetime",
    price: 299,
    period: " once",
    icon: <Infinity className="w-6 h-6" />,
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    popular: false,
    features: [
      "Everything in Pro",
      "Lifetime access",
      "All future apps included",
      "1-on-1 onboarding call",
      "Custom feature requests",
      "Highest priority support",
    ],
    cta: "Buy Lifetime Access",
    ctaVariant: "outline" as const,
  },
];

const TRUST_ITEMS = [
  { icon: <Shield className="w-5 h-5 text-emerald-400" />, text: "Secure payments via Stripe" },
  { icon: <Headphones className="w-5 h-5 text-violet-400" />, text: "Cancel anytime, no lock-in" },
  { icon: <Sparkles className="w-5 h-5 text-amber-400" />, text: "30-day money-back guarantee" },
];

const FAQ = [
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Yes. Cancel anytime from your billing portal. You'll keep access until the end of your billing period.",
  },
  {
    q: "Does the 7-day free trial require a credit card?",
    a: "Yes, a card is required to start the trial, but you won't be charged until the trial ends. Cancel before day 7 to pay nothing.",
  },
  {
    q: "What's included in 'all future apps' for Lifetime?",
    a: "Every app added to the platform after your purchase is included at no extra cost — forever.",
  },
  {
    q: "Can I upgrade from Free to Pro later?",
    a: "Absolutely. Click 'Start Free Trial' at any time to upgrade. Your free apps remain accessible.",
  },
  {
    q: "Do you offer team or enterprise plans?",
    a: "Team plans are coming soon. Contact us via the support chat for custom enterprise pricing.",
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Handle payment success/cancel from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Welcome to your new plan.");
      window.history.replaceState({}, "", "/pricing");
    } else if (payment === "cancelled") {
      toast.info("Payment cancelled. No charges were made.");
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  const subscribeMutation = trpc.pricing.subscribe.useMutation({
    onSuccess: (data) => {
      toast.info("Redirecting to Stripe checkout...");
      window.open(data.url, "_blank");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
    },
  });

  const portalMutation = trpc.pricing.portal.useMutation({
    onSuccess: (data) => {
      toast.info("Opening billing portal...");
      window.open(data.url, "_blank");
    },
    onError: (err) => {
      toast.error(err.message || "Could not open billing portal.");
    },
  });

  function handlePlanClick(planId: "free" | "pro" | "lifetime") {
    if (planId === "free") {
      if (!isAuthenticated) {
        window.location.href = getLoginUrl();
      } else {
        setLocation("/marketplace");
      }
      return;
    }
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe.");
      window.location.href = getLoginUrl();
      return;
    }
    subscribeMutation.mutate({ plan: planId, origin: window.location.origin });
  }

  function handleManageBilling() {
    portalMutation.mutate({ origin: window.location.origin });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
          Choose Your{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Plan
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          Start free, upgrade when you're ready. All plans include access to our growing library of apps.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] ${plan.borderColor} ${plan.popular ? "ring-1 ring-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  ⭐ Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-card border border-border ${plan.color}`}>
                  {plan.icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {plan.name}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm mb-1.5">{plan.period}</span>
                  )}
                </div>
                {plan.id === "pro" && (
                  <p className="text-xs text-emerald-400 mt-1">7-day free trial included</p>
                )}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? "default" : "outline"}
                className={`w-full font-semibold ${plan.popular ? "bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 border-0" : ""} ${plan.id === "lifetime" ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10" : ""}`}
                onClick={() => handlePlanClick(plan.id)}
                disabled={subscribeMutation.isPending && subscribeMutation.variables?.plan === plan.id}
              >
                {subscribeMutation.isPending && subscribeMutation.variables?.plan === plan.id
                  ? "Loading..."
                  : plan.cta}
                {!subscribeMutation.isPending && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          ))}
        </div>

        {/* Manage billing button for logged-in users */}
        {isAuthenticated && (
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleManageBilling}
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? "Opening portal..." : "Manage billing & subscriptions →"}
            </Button>
          </div>
        )}
      </section>

      {/* Feature comparison table */}
      <section className="px-4 pb-20 max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-8">What's included</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Feature</th>
                <th className="text-center p-4 text-emerald-400 font-bold">Free</th>
                <th className="text-center p-4 text-violet-400 font-bold">Pro</th>
                <th className="text-center p-4 text-amber-400 font-bold">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Free apps access", true, true, true],
                ["Freemium apps (limited)", true, true, true],
                ["All paid apps", false, true, true],
                ["Unlimited usage", false, true, true],
                ["API access", false, true, true],
                ["Priority support", false, true, true],
                ["Early access", false, true, true],
                ["Remove branding", false, true, true],
                ["1-on-1 onboarding", false, false, true],
                ["Custom feature requests", false, false, true],
                ["All future apps", false, false, true],
              ].map(([feature, free, pro, lifetime], i) => (
                <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-background/30" : ""}`}>
                  <td className="p-4 text-muted-foreground">{feature as string}</td>
                  <td className="text-center p-4">
                    {free ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground/30">—</span>}
                  </td>
                  <td className="text-center p-4">
                    {pro ? <Check className="w-4 h-4 text-violet-400 mx-auto" /> : <span className="text-muted-foreground/30">—</span>}
                  </td>
                  <td className="text-center p-4">
                    {lifetime ? <Check className="w-4 h-4 text-amber-400 mx-auto" /> : <span className="text-muted-foreground/30">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-sm">{item.q}</span>
                <span className={`text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-24 text-center">
        <div className="max-w-xl mx-auto bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-10">
          <h2 className="text-2xl font-black mb-3">Ready to unlock everything?</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Join thousands of developers and creators already using AppVault.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 border-0 font-semibold"
              onClick={() => handlePlanClick("pro")}
              disabled={subscribeMutation.isPending}
            >
              <Crown className="w-4 h-4 mr-2" />
              {subscribeMutation.isPending ? "Loading..." : "Start Pro Trial — Free 7 Days"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/marketplace">Browse Free Apps</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Test with card <code className="bg-white/5 px-1.5 py-0.5 rounded text-violet-300">4242 4242 4242 4242</code>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
