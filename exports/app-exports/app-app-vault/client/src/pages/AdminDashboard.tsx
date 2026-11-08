import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Package, Users, Star, DollarSign, Clock, Plus, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const statsQuery = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === "admin" });
  const stats = statsQuery.data;

  // Wait for auth to resolve before showing access denied
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground text-sm">
            You need to be signed in as an admin to access this area.
          </p>
          {user && (
            <p className="text-xs text-muted-foreground mt-2">
              Your current role: <strong className="text-foreground">{user.role}</strong>
            </p>
          )}
          {!user && (
            <p className="text-xs text-muted-foreground mt-2">You are not signed in.</p>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const statCards = [
    { icon: Package, label: "Total Apps", value: stats?.totalApps ?? 0, color: "text-primary", href: "/admin/apps" },
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, color: "text-purple-500", href: "/admin/users" },
    { icon: DollarSign, label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, color: "text-emerald-500", href: "/admin/apps" },
    { icon: Clock, label: "Pending Review", value: stats?.pendingApps ?? 0, color: "text-amber-500", href: "/admin/apps?status=pending" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Platform management and moderation</p>
            </div>
          </div>
          <Link href="/seller/apps/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add App
            </Button>
          </Link>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <Link key={s.label} href={s.href}>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/admin/apps", icon: Package, label: "Manage Apps", desc: "Review, approve, or reject app submissions" },
            { href: "/admin/users", icon: Users, label: "Manage Users", desc: "View and manage user accounts and roles" },
            { href: "/admin/reviews", icon: Star, label: "Moderate Reviews", desc: "Review and moderate user-submitted reviews" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
