import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Key, Download, Calendar } from "lucide-react";

export default function Purchases() {
  const { user } = useAuth();
  const licensesQuery = trpc.licenses.list.useQuery(undefined, { enabled: !!user });
  const licenses = licensesQuery.data ?? [];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your purchases</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-10 flex-1">
        <h1 className="text-2xl font-display font-bold text-foreground mb-8">My Purchases</h1>
        {licensesQuery.isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No purchases yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Browse the marketplace to find your first app</p>
            <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {licenses.map((item) => (
              <div key={item.license.id} className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {item.app?.iconUrl ? (
                    <img src={item.app.iconUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary/60">{item.app?.name?.[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/marketplace/${item.app?.slug}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{item.app?.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Purchased {new Date(item.license.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={item.license.isActive ? "secondary" : "outline"} className={item.license.isActive ? "text-emerald-600 bg-emerald-500/10" : ""}>
                      {item.license.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                    <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <code className="text-xs font-mono text-foreground flex-1 truncate">{item.license.licenseKey}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(item.license.licenseKey); }}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
