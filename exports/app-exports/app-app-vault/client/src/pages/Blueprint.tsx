import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// ─── Feature Data ─────────────────────────────────────────────────────────────

const CRUCIAL_FEATURES = [
  {
    num: "01",
    icon: "🔍",
    title: "SEO & Meta Tags (Every Page)",
    desc: "No SEO = invisible on Google. Every app page needs title tags, meta descriptions, Open Graph images, structured data, and a sitemap. This is free traffic worth $50k+/yr.",
    impact: "💡 Without this: nobody finds you organically.",
    dollar: "$50,000/yr traffic value",
  },
  {
    num: "02",
    icon: "📊",
    title: "Analytics & Conversion Tracking",
    desc: "No analytics = flying blind. Add Google Analytics 4, Hotjar heatmaps, and Stripe revenue tracking. Know exactly which app earns the most and why users drop off.",
    impact: "💡 Without this: you can't grow what you can't measure.",
    dollar: "Saves $10k in wrong decisions",
  },
  {
    num: "03",
    icon: "📧",
    title: "Email List Capture + Drip Campaigns",
    desc: "No email list = no repeat sales. Add a popup or inline form. Capture emails with a lead magnet. Send automated welcome → value → pitch sequences via Mailchimp or Resend.",
    impact: "💡 Email converts 40x better than social media.",
    dollar: "$30,000/yr per 5k subscribers",
  },
  {
    num: "04",
    icon: "🔒",
    title: "Paywall / Access Control Per App",
    desc: "Right now anyone can iframe your paid apps. You need server-side token checks on each app that verify the user paid before rendering content. JWT + middleware on every protected route.",
    impact: "💡 Without this: people bypass your payment entirely.",
    dollar: "Protects 100% of paid revenue",
  },
  {
    num: "05",
    icon: "📱",
    title: "Push Notifications (Web + Mobile)",
    desc: "Re-engage users who leave. Use the Web Push API + Firebase Cloud Messaging. Notify users of new apps, sales, or their trial expiring. Most apps see 20-30% re-engagement.",
    impact: "💡 Turns one-time visitors into repeat buyers.",
    dollar: "+25% retention = +$80k LTV",
  },
  {
    num: "06",
    icon: "⭐",
    title: "Reviews & Social Proof System",
    desc: "No reviews = no trust = no sales. Build a real review system: star rating, text review, verified buyer badge. Display average rating on each app card. Trust is the #1 conversion factor.",
    impact: "💡 Apps with reviews convert 270% better.",
    dollar: "+270% conversion rate",
  },
  {
    num: "07",
    icon: "🤝",
    title: "Affiliate / Referral Program",
    desc: "Let users earn 30% commission for every person they refer. Use a unique ref link tracked server-side. This is how products go viral without ad spend. Build it once, it sells forever.",
    impact: "💡 Referral traffic converts 5x better than ads.",
    dollar: "+$200,000 in referred revenue",
  },
  {
    num: "08",
    icon: "💬",
    title: "Live Chat / Support Widget",
    desc: "Users have questions before buying. No live chat = lost sales. Add Crisp or Tawk.to (both free). Answer questions in real time. Studies show live chat increases revenue by 48%.",
    impact: "💡 Unanswered questions = abandoned carts.",
    dollar: "+48% checkout completion",
  },
  {
    num: "09",
    icon: "🔄",
    title: "Automated Subscription Recovery (Dunning)",
    desc: "Cards expire, payments fail. Without dunning emails you silently lose subscribers. Add Stripe's built-in retry logic + send 3 automated emails when payment fails before cancelling.",
    impact: "💡 Recovers 30-50% of failed payments automatically.",
    dollar: "Saves $40k/yr in churn",
  },
  {
    num: "10",
    icon: "🌐",
    title: "Custom Domain + SSL + CDN",
    desc: "myapphub.vercel.app looks amateur. Buy yourdomain.com, point it, add Cloudflare CDN (free). SSL is automatic. A real domain increases trust and conversion by up to 30%.",
    impact: "💡 First impressions determine if they stay or bounce.",
    dollar: "+30% trust conversion",
  },
];

const SWEET_FEATURES = [
  {
    num: "11",
    icon: "🤖",
    title: "AI Recommendations Engine",
    desc: "Show 'Users like you also use…' below each app. Use a simple collaborative filtering model or OpenAI embeddings to match users to apps based on their usage history and purchases.",
    impact: "💡 Amazon built a $35B business on this feature.",
    dollar: "+35% average order value",
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  {
    num: "12",
    icon: "🎮",
    title: "Gamification — Points, Badges, Streaks",
    desc: "Award XP for logging in, using apps, leaving reviews, referring friends. Show a leaderboard. Users with gamification engage 7x longer. Give badge holders a discount as reward.",
    impact: "💡 Duolingo grew to 500M users using only this.",
    dollar: "+700% engagement",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    num: "13",
    icon: "🗂️",
    title: "App Bundles & Upsell Packages",
    desc: "Instead of buying one app for $9.99, offer 'The Creator Bundle — 5 apps for $29'. Bundles increase average transaction value dramatically. Add a 'Complete Collection' SKU at checkout.",
    impact: "💡 Bundle pricing increases AOV by 60-70%.",
    dollar: "+65% revenue per customer",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    num: "14",
    icon: "📈",
    title: "Public Roadmap + Voting Board",
    desc: "Build a public roadmap page where users vote on features they want. Users feel ownership. They tell friends. They stay subscribers to see their ideas ship. Use Canny or build your own.",
    impact: "💡 Reduces churn by 20% — people stay for features they voted for.",
    dollar: "-20% churn = +$120k LTV",
    gradient: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  {
    num: "15",
    icon: "🎯",
    title: "Personalized Onboarding Flow",
    desc: "Ask 3 questions on signup: What do you do? What's your goal? What type of apps do you need? Then show a custom homepage built for them. Personalized onboarding reduces 30-day churn by 50%.",
    impact: "💡 The first 5 minutes decide if they stay forever.",
    dollar: "-50% early churn",
    gradient: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/30",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  {
    num: "16",
    icon: "🌍",
    title: "Multi-Language + Currency Support",
    desc: "Only 25% of the internet speaks English. Add i18n with react-intl. Auto-detect locale. Show prices in local currency via Stripe's currency API. Unlock Europe, LATAM, Asia markets instantly.",
    impact: "💡 3x your addressable market overnight.",
    dollar: "3x total addressable market",
    gradient: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  {
    num: "17",
    icon: "🔌",
    title: "Public API + Webhooks for Developers",
    desc: "Expose a REST API so developers can embed your apps in their own products. Charge for API access ($49/mo developer tier). Zapier/Make integrations multiply your reach 10x.",
    impact: "💡 API tiers unlock a B2B revenue stream.",
    dollar: "$49/mo developer tier",
    gradient: "from-teal-500/20 to-teal-500/5",
    border: "border-teal-500/30",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  {
    num: "18",
    icon: "🏢",
    title: "Team / Organization Accounts",
    desc: "Add team seats: one owner, multiple members. Charge $X per seat/month. One enterprise customer can pay more than 50 individual users. Add role-based permissions and a team dashboard.",
    impact: "💡 One enterprise deal = 100 solo subscriptions.",
    dollar: "+$500/mo per team account",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/30",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    num: "19",
    icon: "📹",
    title: "Demo Videos + Interactive Walkthroughs",
    desc: "Add a 60-second Loom or auto-play demo video on each app page. Then add an interactive tour using Shepherd.js or Intro.js. Users who see a demo convert at 3x the rate of those who don't.",
    impact: "💡 Video on landing pages increases conversion by 80%.",
    dollar: "+80% landing page conversion",
    gradient: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  {
    num: "20",
    icon: "🏷️",
    title: "Flash Sales, Coupons & Urgency Timers",
    desc: "Add a promo code field at checkout (Stripe supports this natively). Run 48-hour flash sales with a countdown timer on the homepage. FOMO is the most powerful buying trigger that exists.",
    impact: "💡 Urgency increases purchase rate by 332%.",
    dollar: "+332% flash sale revenue",
    gradient: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
];

// ─── Animated Card Component ──────────────────────────────────────────────────

function CrucialCard({ feature, index }: { feature: typeof CRUCIAL_FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-card border border-red-500/20 rounded-xl p-5 flex gap-4 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-24px)",
        transitionDelay: `${index * 60}ms`,
      }}
    >
      <div className="text-2xl flex-shrink-0 w-10 text-center">{feature.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="font-bold text-sm leading-snug">
            <span className="text-red-400 mr-1.5">{feature.num}.</span>
            {feature.title}
          </h3>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30 whitespace-nowrap">
              CRUCIAL
            </span>
            <span className="text-[0.72rem] font-bold text-amber-400 whitespace-nowrap">{feature.dollar}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{feature.desc}</p>
        <p className="text-xs text-red-400/80 font-medium">{feature.impact}</p>
      </div>
    </div>
  );
}

function SweetCard({ feature, index }: { feature: typeof SWEET_FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${feature.gradient} border ${feature.border} rounded-xl p-5 flex gap-4 transition-all duration-500`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-24px)",
        transitionDelay: `${index * 60}ms`,
      }}
    >
      <div className="text-2xl flex-shrink-0 w-10 text-center">{feature.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="font-bold text-sm leading-snug">
            <span className="text-violet-400 mr-1.5">{feature.num}.</span>
            {feature.title}
          </h3>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${feature.badge} whitespace-nowrap`}>
              SWEET
            </span>
            <span className="text-[0.72rem] font-bold text-amber-400 whitespace-nowrap">{feature.dollar}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{feature.desc}</p>
        <p className="text-xs text-violet-400/80 font-medium">{feature.impact}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Blueprint() {
  const totalRef = useRef<HTMLDivElement>(null);
  const [totalVisible, setTotalVisible] = useState(false);

  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTotalVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          💰 Million Dollar Blueprint
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
          Features That Make{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            A $1,000,000 App
          </span>
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
          Red = crucial missing pieces you <strong className="text-red-400">MUST</strong> build.{" "}
          Colors = sweet upgrades that multiply your revenue.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { val: "10", label: "Crucial", color: "text-red-400" },
            { val: "10", label: "Sweet", color: "text-violet-400" },
            { val: "20", label: "Total", color: "bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent" },
            { val: "$1M+", label: "Potential", color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl px-6 py-4 text-center min-w-[100px]">
              <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 px-4 pb-10 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">CRUCIAL — Missing, build first</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 via-cyan-500 to-emerald-500" />
          <span className="text-muted-foreground">SWEET — Multiplies revenue</span>
        </div>
      </div>

      {/* Feature List */}
      <section className="px-4 pb-16 max-w-3xl mx-auto w-full space-y-12">

        {/* Crucial Section */}
        <div>
          <div className="text-lg font-bold text-red-400 mb-5 flex items-center gap-2">
            🚨 Crucial — Build These First
          </div>
          <div className="space-y-3">
            {CRUCIAL_FEATURES.map((f, i) => (
              <CrucialCard key={f.num} feature={f} index={i} />
            ))}
          </div>
        </div>

        {/* Sweet Section */}
        <div>
          <div className="text-lg font-bold text-violet-400 mb-5 flex items-center gap-2">
            ✨ Sweet — These Multiply Revenue
          </div>
          <div className="space-y-3">
            {SWEET_FEATURES.map((f, i) => (
              <SweetCard key={f.num} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Total Box */}
      <section className="px-4 pb-24 max-w-3xl mx-auto w-full">
        <div
          ref={totalRef}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-2xl p-10 text-center transition-all duration-700"
          style={{
            opacity: totalVisible ? 1 : 0,
            transform: totalVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <h2 className="text-xl font-black mb-2">💰 Combined Revenue Potential</h2>
          <div
            className="text-6xl md:text-7xl font-black my-5 leading-none"
            style={{
              background: "linear-gradient(135deg, #ffd700, #ff8c00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            $1,000,000+
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-8">
            Build all 20 features and you have a <strong className="text-foreground">full SaaS platform</strong> that
            retains users, converts visitors, earns recurring revenue, and scales without you working 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 border-0 font-semibold text-black" asChild>
              <Link href="/pricing">
                Start Building — Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/marketplace">Browse Apps</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
