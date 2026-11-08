import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Store, Plus, Package, DollarSign, Star, Download, Eye,
  Edit, Trash2, TrendingUp, CheckCircle, Clock, XCircle, BarChart3, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: XCircle },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Edit },
};

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  const appsQuery = trpc.seller.myApps.useQuery(undefined, { enabled: !!user && (user.role === "seller" || user.role === "admin") });
  const analyticsQuery = trpc.seller.analytics.useQuery(undefined, { enabled: !!user && (user.role === "seller" || user.role === "admin") });

  const deleteApp = trpc.seller.deleteApp.useMutation({
    onSuccess: () => { utils.seller.myApps.invalidate(); toast.success("App deleted"); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm">Loading seller dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to access seller dashboard</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (user.role !== "seller" && user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Become a Seller</h2>
          <p className="text-muted-foreground text-sm mb-6">You need a seller account to access this dashboard.</p>
          <Link href="/profile"><Button>Go to Profile to Upgrade</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const appItems = (appsQuery.data as any) ?? [];
  const analytics = analyticsQuery.data;

  const stats = [
    { icon: Package, label: "Total Apps", value: appItems.length, color: "text-primary" },
    { icon: DollarSign, label: "Total Revenue", value: `$${(analytics?.totalRevenue ?? 0).toFixed(2)}`, color: "text-emerald-500" },
    { icon: Download, label: "Total Downloads", value: (analytics?.totalDownloads ?? 0).toLocaleString(), color: "text-purple-500" },
    { icon: Star, label: "Avg Rating", value: "—", color: "text-amber-500" },
  ];

  const revenueData = analytics?.revenueByMonth ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="border-b border-border bg-card/50">
        <div className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Seller Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage your apps and track revenue</p>
            </div>
          </div>
          <Link href="/seller/apps/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> New App</Button>
          </Link>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="apps">
          <TabsList className="mb-6">
            <TabsTrigger value="apps" className="gap-1.5"><Package className="h-4 w-4" /> My Apps</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="apps">
            {appsQuery.isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
            ) : appItems.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-dashed border-border">
                <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="font-semibold text-foreground mb-2">No apps yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Upload your first app to start selling</p>
                <Link href="/seller/apps/new"><Button className="gap-2"><Plus className="h-4 w-4" /> Upload App</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appItems.map((item: any) => {
                  const app = item.app;
                  const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
                  const StatusIcon = status.icon;
                  return (
                    <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-primary/60">{app.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{app.name}</span>
                          <Badge className={`text-xs gap-1 ${status.color}`}>
                            <StatusIcon className="h-3 w-3" /> {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Download className="h-3 w-3" />{app.downloadCount}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{app.viewCount}</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" />{app.avgRating > 0 ? app.avgRating.toFixed(1) : "—"}</span>
                          <span className="font-semibold text-foreground">{app.isFree ? "Free" : `$${Number(app.price).toFixed(2)}`}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/seller/apps/${app.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-1.5 h-8">
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { if (confirm("Delete this app?")) deleteApp.mutate({ appId: app.id }); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {analyticsQuery.isLoading ? (
              <div className="h-64 bg-muted rounded-xl animate-pulse" />
            ) : revenueData.length > 0 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Monthly Revenue
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl border border-dashed border-border">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <h3 className="font-semibold text-foreground mb-2">No analytics data yet</h3>
                <p className="text-sm text-muted-foreground">Revenue data will appear once you make sales</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
