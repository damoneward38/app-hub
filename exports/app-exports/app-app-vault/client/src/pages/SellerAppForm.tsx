import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Upload, Package, Loader2 } from "lucide-react";

export default function SellerAppForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const categoriesQuery = trpc.categories.list.useQuery();
  const myAppsQuery = trpc.seller.myApps.useQuery(undefined, { enabled: isEdit && (user?.role === "seller" || user?.role === "admin") });

  const [form, setForm] = useState({
    name: "", shortDescription: "", description: "", categoryId: 1,
    price: "0", isFree: true, version: "1.0.0", tags: "",
    techStack: "", demoUrl: "", documentationUrl: "", githubUrl: "",
    iconUrl: "", fileUrl: "",
  });

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (isEdit && myAppsQuery.data && !initialized) {
      const found = (myAppsQuery.data as any[]).find((item: any) => String(item.app?.id) === id);
      if (found) {
        const a = found.app;
        setForm({
          name: a.name, shortDescription: a.shortDescription ?? "", description: a.description ?? "",
          categoryId: a.categoryId, price: String(a.price), isFree: a.isFree,
          version: a.version ?? "1.0.0",
          tags: (() => { try { return JSON.parse(a.tags ?? "[]").join(", "); } catch { return ""; } })(),
          techStack: (() => { try { return JSON.parse(a.techStack ?? "[]").join(", "); } catch { return ""; } })(),
          demoUrl: a.demoUrl ?? "", documentationUrl: a.documentationUrl ?? "",
          githubUrl: a.githubUrl ?? "", iconUrl: a.iconUrl ?? "", fileUrl: a.fileUrl ?? "",
        });
        setInitialized(true);
      }
    }
  }, [isEdit, myAppsQuery.data, initialized, id]);

  const createApp = trpc.apps.create.useMutation({
    onSuccess: () => { utils.seller.myApps.invalidate(); toast.success("App submitted for review!"); navigate("/seller"); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateApp = trpc.apps.update.useMutation({
    onSuccess: () => { utils.seller.myApps.invalidate(); toast.success("App updated!"); navigate("/seller"); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, shortDescription: form.shortDescription, description: form.description,
      categoryId: form.categoryId, price: form.isFree ? 0 : parseFloat(form.price) || 0,
      isFree: form.isFree, version: form.version,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      techStack: form.techStack.split(",").map(t => t.trim()).filter(Boolean),
      demoUrl: form.demoUrl || undefined, documentationUrl: form.documentationUrl || undefined,
      githubUrl: form.githubUrl || undefined, iconUrl: form.iconUrl || undefined,
      fileUrl: form.fileUrl || undefined,
    };
    if (isEdit) updateApp.mutate({ id: Number(id), ...payload } as any);
    else createApp.mutate(payload as any);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const cats = categoriesQuery.data ?? [];
  const isPending = createApp.isPending || updateApp.isPending;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/seller"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Seller Dashboard</Button></Link>
          <h1 className="text-2xl font-display font-bold text-foreground">{isEdit ? "Edit App" : "Upload New App"}</h1>
        </div>

        {(isEdit && myAppsQuery.isLoading) ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Basic Info</h2>
            {[
              { label: "App Name *", key: "name", placeholder: "My Awesome App", required: true },
              { label: "Short Description *", key: "shortDescription", placeholder: "One-line description", required: true },
              { label: "Icon URL", key: "iconUrl", placeholder: "https://cdn.example.com/icon.png" },
              { label: "Version", key: "version", placeholder: "1.0.0" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground block mb-1.5">{f.label}</label>
                <input type="text" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                  required={f.required} placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Detailed description of your app..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Category *</label>
              {categoriesQuery.isLoading ? (
                <div className="h-10 bg-muted rounded-lg animate-pulse" />
              ) : (
                <select value={form.categoryId} onChange={e => set("categoryId", Number(e.target.value))} required
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Pricing</h2>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFree" checked={form.isFree} onChange={e => set("isFree", e.target.checked)} className="h-4 w-4 rounded" />
              <label htmlFor="isFree" className="text-sm text-foreground cursor-pointer">This app is free</label>
            </div>
            {!form.isFree && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Price (USD) *</label>
                <input type="number" min="0.99" step="0.01" value={form.price} onChange={e => set("price", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Technical Details</h2>
            {[
              { label: "Tech Stack (comma-separated)", key: "techStack", placeholder: "Flutter, Dart, Firebase" },
              { label: "Tags (comma-separated)", key: "tags", placeholder: "mobile, ui, ecommerce" },
              { label: "Demo URL", key: "demoUrl", placeholder: "https://demo.example.com" },
              { label: "Documentation URL", key: "documentationUrl", placeholder: "https://docs.example.com" },
              { label: "GitHub URL", key: "githubUrl", placeholder: "https://github.com/user/repo" },
              { label: "Download File URL", key: "fileUrl", placeholder: "https://cdn.example.com/app.zip" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-foreground block mb-1.5">{f.label}</label>
                <input type="text" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="gap-2 flex-1" disabled={isPending || cats.length === 0}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isPending ? "Saving..." : isEdit ? "Update App" : "Submit for Review"}
            </Button>
            <Link href="/seller"><Button variant="outline" type="button">Cancel</Button></Link>
          </div>
        </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
