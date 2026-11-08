import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, ArrowRight, Star, Download, Package, Zap, Shield,
  Users, TrendingUp, Code2, Layers, Store, CreditCard, CheckCircle
} from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  "ui-kits": "🎨", "full-apps": "📱", "authentication": "🔐",
  "ecommerce": "🛒", "maps": "🗺️", "chat": "💬",
  "analytics": "📊", "payments": "💳", "media": "🎬", "utilities": "⚙️",
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const featuredQuery = trpc.apps.featured.useQuery();
  const categoriesQuery = trpc.categories.list.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const featured = featuredQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-radial-[at_50%_0%] from-primary/15 to-transparent pointer-events-none" />

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">12,000+ apps & templates available</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground mb-6 leading-tight">
              The Marketplace for{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Premium Software
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover, purchase, and instantly deploy high-quality app templates, UI kits, and complete software solutions. Built by developers, for developers.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search apps, UI kits, templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
                />
              </div>
              <Button type="submit" size="lg" className="px-6 rounded-xl">
                Search
              </Button>
            </form>

            {/* Trending searches */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Trending:</span>
              {["E-Commerce", "Auth Module", "Chat UI", "Payment Flow", "Dashboard"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/marketplace?q=${encodeURIComponent(tag)}`)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { icon: Package, value: "12K+", label: "Apps Available", color: "text-primary" },
              { icon: Users, value: "50K+", label: "Developers", color: "text-purple-500" },
              { icon: Star, value: "4.8★", label: "Avg Rating", color: "text-amber-500" },
              { icon: Download, value: "580K+", label: "Downloads", color: "text-emerald-500" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-card border border-border">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
                <span className="text-xl font-display font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Apps ────────────────────────────────────────────────── */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Featured Apps</h2>
              <p className="text-sm text-muted-foreground">Hand-picked by our team</p>
            </div>
          </div>
          <Link href="/marketplace?sort=featured">
            <Button variant="ghost" size="sm" className="gap-1.5">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featuredQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-36 bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-8 bg-muted rounded animate-pulse mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((item) => (
              <AppCard key={item.app.id} data={item as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No featured apps yet. Check back soon!</p>
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="mt-4">Browse All Apps</Button>
            </Link>
          </div>
        )}
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Browse by Category</h2>
            <p className="text-muted-foreground text-sm">Find exactly what you need from our curated library</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categoriesQuery.isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                    <div className="h-12 w-12 bg-muted rounded-xl mx-auto mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                  </div>
                ))
              : categories.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <div className="group flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {CATEGORY_ICONS[cat.slug] ?? "📦"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{cat.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground text-sm">From discovery to deployment in four simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Search, step: "01", title: "Discover", desc: "Browse thousands of apps, UI kits, and templates. Filter by category, price, and rating.", color: "from-primary to-purple-600" },
            { icon: CreditCard, step: "02", title: "Purchase", desc: "Buy securely with PayPal, Stripe, or AppVault Tokens. All transactions are encrypted.", color: "from-cyan-500 to-blue-600" },
            { icon: Download, step: "03", title: "Download", desc: "Instantly access your licensed app. Get a unique license key tied to your account.", color: "from-emerald-500 to-green-600" },
            { icon: Zap, step: "04", title: "Deploy", desc: "Integrate into your project and ship to production faster than ever before.", color: "from-orange-500 to-red-600" },
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-md mb-4`}>
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold text-muted-foreground mb-2">{step.step}</span>
              <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Seller CTA ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Start Selling Your Apps
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join thousands of developers earning passive income by selling their apps, templates, and UI kits on AppVault. Keep up to 80% of every sale.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {["80% revenue share", "Instant payouts", "Global reach", "License management"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/seller">
                <Button size="lg" className="gap-2">
                  <Store className="h-5 w-5" /> Start Selling
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg">Browse Marketplace</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Badges ─────────────────────────────────────────────────── */}
      <section className="container py-12">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: Shield, label: "Secure Payments", color: "text-emerald-500" },
            { icon: CheckCircle, label: "Verified Sellers", color: "text-primary" },
            { icon: Zap, label: "Instant Download", color: "text-amber-500" },
            { icon: Users, label: "50K+ Developers", color: "text-purple-500" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <badge.icon className={`h-5 w-5 ${badge.color}`} />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
