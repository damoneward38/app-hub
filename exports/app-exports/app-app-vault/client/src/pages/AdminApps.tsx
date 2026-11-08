import { useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, ArrowLeft, Package, Plus } from "lucide-react";

export default function AdminApps() {
  const { user, loading } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [status, setStatus] = useState(params.get("status") ?? "pending");
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();

  const appsQuery = trpc.admin.allApps.useQuery({ status: status || undefined, limit: 50, offset: 0 }, { enabled: user?.role === "admin" });
  const approveApp = trpc.admin.approveApp.useMutation({ onSuccess: () => { utils.admin.allApps.invalidate(); toast.success("App approved!"); }, onError: (e) => toast.error(e.message) });
  const rejectApp = trpc.admin.rejectApp.useMutation({ onSuccess: () => { utils.admin.allApps.invalidate(); toast.success("App rejected"); }, onError: (e) => toast.error(e.message) });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!user || user.role !== "admin") return null;

  const apps = (appsQuery.data as any) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Admin</Button></Link>
            <h1 className="text-2xl font-display font-bold text-foreground">Manage Apps</h1>
          </div>
          <Link href="/seller/apps/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add App</Button>
          </Link>
        </div>
        <div className="flex gap-2 mb-6">
          {["pending", "approved", "rejected", ""].map((s) => (
            <Button key={s} variant={status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        {appsQuery.isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16"><Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" /><p className="text-muted-foreground">No apps found</p></div>
        ) : (
          <div className="space-y-3">
            {apps.map((item: any) => {
              const app = item.app;
              return (
                <div key={app.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {app.iconUrl ? <img src={app.iconUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-primary/60">{app.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{app.name}</span>
                        <Badge className={`text-xs ${app.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : app.status === "rejected" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>{app.status}</Badge>
                        <span className="text-xs text-muted-foreground">{app.isFree ? "Free" : `$${Number(app.price).toFixed(2)}`}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{app.shortDescription}</p>
                      {app.status === "pending" && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => approveApp.mutate({ appId: app.id })}>
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <input
                            type="text" placeholder="Rejection reason..." value={rejectNotes[app.id] ?? ""}
                            onChange={e => setRejectNotes(n => ({ ...n, [app.id]: e.target.value }))}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                          />
                          <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => rejectApp.mutate({ appId: app.id, notes: rejectNotes[app.id] ?? "Does not meet guidelines" })}>
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
