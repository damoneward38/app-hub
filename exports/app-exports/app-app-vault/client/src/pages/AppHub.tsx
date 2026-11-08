import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Zap, Search, X, ExternalLink, CreditCard, Play, Plus, Pencil, Trash2,
  Loader2, Package, Monitor, Code2, Globe, Gift, Users, Star, Video,
  LayoutGrid, ShoppingCart, CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HubApp {
  id: number;
  sellerId: number;
  name: string;
  description: string | null;
  longDesc: string | null;
  category: string | null;
  tags: string | null;
  liveUrl: string | null;
  embedUrl: string | null;
  demoUrl: string | null;
  thumbnail: string | null;
  price: string;
  stripeLink: string | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  access: "free" | "paid" | "freemium";
  trialDays: number;
  featured: boolean;
  rating: string;
  usersCount: number;
  status: "live" | "beta" | "coming-soon";
  builtWith: string | null;
  isPublic: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseTags(raw: string | null): string[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}
function parsePrice(raw: string): number {
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}
function priceLabel(app: HubApp): string {
  const p = parsePrice(app.price);
  if (app.access === "free") return "FREE";
  if (app.access === "freemium") return `Free / $${p.toFixed(2)}`;
  return `$${p.toFixed(2)}`;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  live: { label: "Live", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  beta: { label: "Beta", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  "coming-soon": { label: "Coming Soon", className: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < full ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-muted-foreground/30"}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{value > 0 ? value.toFixed(1) : "—"}</span>
    </span>
  );
}

// ─── App Card ─────────────────────────────────────────────────────────────────
function HubAppCard({ app, onPlay, onEdit, onDelete, onBuy, isOwner }: {
  app: HubApp;
  onPlay: (app: HubApp) => void;
  onBuy: (app: HubApp) => void;
  onEdit?: (app: HubApp) => void;
  onDelete?: (app: HubApp) => void;
  isOwner: boolean;
}) {
  const price = parsePrice(app.price);
  const isLive = app.status === "live";
  const tags = parseTags(app.tags);
  const builtWith = parseTags(app.builtWith);
  const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.live;
  const rating = parseFloat(app.rating) || 0;

  return (
    <div className={`group flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] ${app.featured ? "border-primary/40 shadow-[0_0_20px_rgba(99,102,241,0.12)]" : "border-border hover:border-primary/30"}`}>
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        {app.thumbnail ? (
          <img src={app.thumbnail} alt={app.name} loading="lazy" className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background flex items-center justify-center">
            <Monitor className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${status.className}`}>
          {status.label}
        </span>
        {/* Featured badge */}
        {app.featured && (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-yellow-500/90 text-black">
            ⭐ Featured
          </span>
        )}
        {/* Price badge */}
        <span className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-sm border border-white/10 ${app.access === "free" ? "text-green-400" : "text-violet-300"}`}>
          {priceLabel(app)}
        </span>
        {/* Owner controls */}
        {isOwner && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit?.(app)} className="h-7 w-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary/80 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDelete?.(app)} className="h-7 w-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="font-bold text-foreground text-base leading-tight">{app.name}</h3>
          {app.description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{app.description}</p>
          )}
        </div>
        {/* Rating + Users */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <StarRating value={rating} />
          <span>·</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{app.usersCount.toLocaleString()}</span>
          {app.trialDays > 0 && <><span>·</span><span className="text-yellow-400">{app.trialDays}d trial</span></>}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary/80 border border-primary/20">{t}</span>
            ))}
          </div>
        )}
        {builtWith.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
            <Code2 className="h-3 w-3 mt-0.5 shrink-0" />
            {builtWith.map(b => <span key={b} className="bg-muted/50 px-1.5 py-0.5 rounded">{b}</span>)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-5">
        {isLive ? (
          <button onClick={() => onPlay(app)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 text-white hover:opacity-90 transition-opacity">
            <Play className="h-3.5 w-3.5" /> Try It
          </button>
        ) : (
          <button disabled className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed">
            Coming Soon
          </button>
        )}
        {app.access !== "free" ? (
          <button onClick={() => onBuy(app)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
            <CreditCard className="h-3.5 w-3.5" /> Buy
          </button>
        ) : app.liveUrl ? (
          <a href={app.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
        ) : null}
      </div>
    </div>
  );
}

// ─── App Detail Modal (Tabbed) ────────────────────────────────────────────────
type ModalTab = "preview" | "details" | "pricing";

function AppDetailModal({ app, onClose, onBuy }: { app: HubApp; onClose: () => void; onBuy: (app: HubApp) => void }) {
  const [tab, setTab] = useState<ModalTab>("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const price = parsePrice(app.price);
  const builtWith = parseTags(app.builtWith);
  const tags = parseTags(app.tags);
  const rating = parseFloat(app.rating) || 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border shrink-0 gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-foreground text-xl">{app.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${STATUS_CONFIG[app.status]?.className}`}>
                {STATUS_CONFIG[app.status]?.label}
              </span>
              {app.featured && <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-500/90 text-black">⭐ Featured</span>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <StarRating value={rating} />
              <span>·</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{app.usersCount.toLocaleString()} users</span>
              <span>·</span>
              <span className={`font-semibold ${app.access === "free" ? "text-green-400" : "text-violet-400"}`}>{priceLabel(app)}</span>
              {app.trialDays > 0 && <><span>·</span><span className="text-yellow-400">{app.trialDays}-day trial</span></>}
              {app.category && <><span>·</span><span className="capitalize">{app.category}</span></>}
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-border shrink-0">
          {(["preview", "details", "pricing"] as ModalTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "preview" && <Play className="inline w-3.5 h-3.5 mr-1.5" />}
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {/* Preview */}
          {tab === "preview" && (
            app.embedUrl ? (
              <iframe ref={iframeRef} src={app.embedUrl} title={app.name} className="w-full h-[520px] border-none bg-white" allow="fullscreen; clipboard-write; camera; microphone" />
            ) : (
              <div className="h-[520px] flex flex-col items-center justify-center bg-background gap-4">
                <Globe className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">No embed URL configured for this app.</p>
                {app.liveUrl && (
                  <a href={app.liveUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2"><ExternalLink className="h-4 w-4" /> Open Full Page</Button>
                  </a>
                )}
              </div>
            )
          )}

          {/* Details */}
          {tab === "details" && (
            <div className="h-[520px] overflow-y-auto p-7 space-y-6">
              <div>
                <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Description</label>
                <p className="text-sm leading-relaxed">{app.longDesc || app.description || "No description available."}</p>
              </div>
              {builtWith.length > 0 && (
                <div>
                  <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Built With</label>
                  <div className="flex flex-wrap gap-2">
                    {builtWith.map(t => <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-violet-300">{t}</span>)}
                  </div>
                </div>
              )}
              {tags.length > 0 && (
                <div>
                  <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-muted border border-border text-muted-foreground">{t}</span>)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
                  <p className="text-sm capitalize">{app.category || "Other"}</p>
                </div>
                <div>
                  <label className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Status</label>
                  <p className="text-sm capitalize">{app.status.replace("-", " ")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          {tab === "pricing" && (
            <div className="h-[520px] overflow-y-auto p-7">
              {app.access === "free" ? (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-8 text-center max-w-sm mx-auto">
                  <div className="text-4xl font-black text-green-400 mb-3">FREE</div>
                  <p className="text-muted-foreground text-sm mb-5">This app is completely free to use. No credit card required.</p>
                  <div className="space-y-2 text-left mb-6">
                    {["Full access to all features", "No time limit", "No hidden fees"].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />{f}</div>
                    ))}
                  </div>
                  {app.liveUrl && (
                    <a href={app.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-green-600 hover:bg-green-500">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open App
                      </Button>
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                  {app.access === "freemium" && (
                    <div className="rounded-2xl border border-border p-6">
                      <div className="text-lg font-bold mb-1">Free Tier</div>
                      <div className="text-3xl font-black text-green-400 mb-3">$0</div>
                      <div className="space-y-2 text-sm text-muted-foreground mb-5">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />Limited access</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />Try before you buy</div>
                      </div>
                      {app.liveUrl && (
                        <a href={app.liveUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">Start Free</Button>
                        </a>
                      )}
                    </div>
                  )}
                  <div className={`rounded-2xl border p-6 ${app.featured ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                    {app.featured && <Badge className="mb-3 text-xs">Most Popular</Badge>}
                    <div className="text-lg font-bold mb-1">{app.access === "freemium" ? "Pro" : "Full Access"}</div>
                    <div className="text-3xl font-black text-violet-400 mb-1">${parsePrice(app.price).toFixed(2)}</div>
                    {app.trialDays > 0 && <div className="text-xs text-yellow-400 mb-3">{app.trialDays}-day free trial</div>}
                    <div className="space-y-2 text-sm text-muted-foreground mb-5">
                      {["Full access to all features", "Priority support", "All future updates"].map(f => (
                        <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />{f}</div>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => { onClose(); onBuy(app); }}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Get Access — ${parsePrice(app.price).toFixed(2)}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0 flex-wrap">
          {app.liveUrl && (
            <a href={app.liveUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2"><ExternalLink className="h-3.5 w-3.5" /> Open Full Page</Button>
            </a>
          )}
          {app.demoUrl && (
            <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2"><Video className="h-3.5 w-3.5" /> Watch Demo</Button>
            </a>
          )}
          {app.access !== "free" && (
            <Button size="sm" className="ml-auto gap-2" onClick={() => { onClose(); onBuy(app); }}>
              <ShoppingCart className="h-3.5 w-3.5" /> Buy — {priceLabel(app)}
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function HubAppFormModal({ app, onClose }: { app?: HubApp; onClose: () => void }) {
  const utils = trpc.useUtils();
  const isEdit = !!app;
  const [form, setForm] = useState({
    name: app?.name ?? "",
    description: app?.description ?? "",
    longDesc: app?.longDesc ?? "",
    category: app?.category ?? "other",
    tags: parseTags(app?.tags ?? null).join(", "),
    liveUrl: app?.liveUrl ?? "",
    embedUrl: app?.embedUrl ?? "",
    demoUrl: app?.demoUrl ?? "",
    thumbnail: app?.thumbnail ?? "",
    price: parsePrice(app?.price ?? "0"),
    stripeLink: app?.stripeLink ?? "",
    stripeProductId: app?.stripeProductId ?? "",
    stripePriceId: app?.stripePriceId ?? "",
    access: (app?.access ?? "free") as "free" | "paid" | "freemium",
    trialDays: app?.trialDays ?? 0,
    featured: app?.featured ?? false,
    rating: parseFloat(app?.rating ?? "0") || 0,
    usersCount: app?.usersCount ?? 0,
    status: (app?.status ?? "live") as "live" | "beta" | "coming-soon",
    builtWith: parseTags(app?.builtWith ?? null).join(", "),
    isPublic: app?.isPublic ?? true,
    sortOrder: app?.sortOrder ?? 0,
  });

  const create = trpc.hub.create.useMutation({
    onSuccess: () => { utils.hub.list.invalidate(); utils.hub.myApps.invalidate(); toast.success("App added to hub!"); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });
  const update = trpc.hub.update.useMutation({
    onSuccess: () => { utils.hub.list.invalidate(); utils.hub.myApps.invalidate(); toast.success("Hub app updated!"); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || undefined,
      longDesc: form.longDesc || undefined,
      category: form.category,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      liveUrl: form.liveUrl || undefined,
      embedUrl: form.embedUrl || undefined,
      demoUrl: form.demoUrl || undefined,
      thumbnail: form.thumbnail || undefined,
      price: form.price,
      stripeLink: form.stripeLink || undefined,
      stripeProductId: form.stripeProductId || undefined,
      stripePriceId: form.stripePriceId || undefined,
      access: form.access,
      trialDays: form.trialDays,
      featured: form.featured,
      rating: form.rating,
      usersCount: form.usersCount,
      status: form.status,
      builtWith: form.builtWith.split(",").map(t => t.trim()).filter(Boolean),
      isPublic: form.isPublic,
      sortOrder: form.sortOrder,
    };
    if (isEdit) update.mutate({ id: app!.id, ...payload });
    else create.mutate(payload);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const isPending = create.isPending || update.isPending;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-bold text-foreground">{isEdit ? "Edit Hub App" : "Add App to Hub"}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">App Name *</label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="My Awesome App" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Short Description</label>
              <input type="text" value={form.description} onChange={e => set("description", e.target.value)} placeholder="One-line summary" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Long Description</label>
              <textarea value={form.longDesc} onChange={e => set("longDesc", e.target.value)} rows={3} placeholder="Full description with features, use-cases..." className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Category</label>
              <input type="text" value={form.category} onChange={e => set("category", e.target.value)} placeholder="productivity, ai, saas..." className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="live">Live</option>
                <option value="beta">Beta</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Access Model</label>
              <select value={form.access} onChange={e => set("access", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="freemium">Freemium</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Price (USD)</label>
              <input type="number" min={0} step={0.01} value={form.price} onChange={e => set("price", parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Trial Days</label>
              <input type="number" min={0} value={form.trialDays} onChange={e => set("trialDays", parseInt(e.target.value) || 0)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Rating (0–5)</label>
              <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => set("rating", parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Users Count</label>
              <input type="number" min={0} value={form.usersCount} onChange={e => set("usersCount", parseInt(e.target.value) || 0)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Thumbnail URL</label>
              <input type="text" value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)} placeholder="https://cdn.example.com/thumb.png" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Live URL</label>
              <input type="text" value={form.liveUrl} onChange={e => set("liveUrl", e.target.value)} placeholder="https://myapp.com" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Embed URL (for Preview tab)</label>
              <input type="text" value={form.embedUrl} onChange={e => set("embedUrl", e.target.value)} placeholder="https://myapp.com/embed" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Demo Video URL</label>
              <input type="text" value={form.demoUrl} onChange={e => set("demoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Stripe Payment Link (optional)</label>
              <input type="text" value={form.stripeLink} onChange={e => set("stripeLink", e.target.value)} placeholder="https://buy.stripe.com/..." className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Stripe Product ID</label>
              <input type="text" value={form.stripeProductId} onChange={e => set("stripeProductId", e.target.value)} placeholder="prod_XXXX" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Stripe Price ID</label>
              <input type="text" value={form.stripePriceId} onChange={e => set("stripePriceId", e.target.value)} placeholder="price_XXXX" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Built With (comma-separated)</label>
              <input type="text" value={form.builtWith} onChange={e => set("builtWith", e.target.value)} placeholder="React, Node.js, OpenAI" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground block mb-1">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="ai, automation, productivity" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} className="h-4 w-4 rounded accent-primary" />
                <span className="text-sm text-foreground">Visible to public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="h-4 w-4 rounded accent-primary" />
                <span className="text-sm text-foreground">Mark as Featured</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 gap-2" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add App"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppHub() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [playingApp, setPlayingApp] = useState<HubApp | null>(null);
  const [editingApp, setEditingApp] = useState<HubApp | null | undefined>(undefined);

  const isSeller = user?.role === "seller" || user?.role === "admin";

  const appsQuery = trpc.hub.list.useQuery({});
  const { data: myOrders = [] } = trpc.orders.history.useQuery(undefined as never, { enabled: isAuthenticated });

  const hubCheckout = trpc.hub.checkout.useMutation({
    onSuccess: (data) => {
      toast.success("Redirecting to checkout...");
      window.open(data.url, "_blank");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteApp = trpc.hub.delete.useMutation({
    onSuccess: () => { utils.hub.list.invalidate(); utils.hub.myApps.invalidate(); toast.success("App removed from hub"); },
    onError: (e: any) => toast.error(e.message),
  });

  const apps: HubApp[] = (appsQuery.data as HubApp[] | undefined) ?? [];

  // Stats
  const stats = useMemo(() => ({
    total: apps.length,
    live: apps.filter(a => a.status === "live").length,
    free: apps.filter(a => a.access === "free").length,
    paid: apps.filter(a => a.access !== "free").length,
    users: apps.reduce((s, a) => s + (a.usersCount || 0), 0),
  }), [apps]);

  // All tags from apps
  const allTags = useMemo(() => {
    const set = new Set<string>();
    apps.forEach(a => parseTags(a.tags).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [apps]);

  // All categories from DB category field
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach(a => { if (a.category) set.add(a.category); });
    return Array.from(set).sort();
  }, [apps]);

  // Paid apps for pricing section
  const paidApps = useMemo(() => apps.filter(a => a.access !== "free"), [apps]);

  // Filtered + sorted apps
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = apps.filter(app => {
      const tags = parseTags(app.tags);
      const matchSearch = !q || app.name.toLowerCase().includes(q) || (app.description ?? "").toLowerCase().includes(q) || tags.some(t => t.toLowerCase().includes(q)) || (app.category ?? "").toLowerCase().includes(q);
      const matchTag = !activeTag || tags.includes(activeTag) || app.category === activeTag;
      const matchStatus = !activeStatus || app.status === activeStatus;
      return matchSearch && matchTag && matchStatus;
    });
    switch (sortBy) {
      case "featured": list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      case "price-asc": list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case "price-desc": list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
      case "rating": list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)); break;
      case "users": list.sort((a, b) => b.usersCount - a.usersCount); break;
      case "newest": list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return list;
  }, [apps, search, activeTag, activeStatus, sortBy]);

  const handleBuy = (app: HubApp) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    hubCheckout.mutate({ id: app.id, origin: window.location.origin });
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <header className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background pointer-events-none" />
        <div className="relative container py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5">
            <Zap className="h-3.5 w-3.5" /> My App Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            All My Apps.{" "}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">One Place.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Discover, try, and purchase apps built by our developers. Use them inline or open full page.
          </p>
          <div className="flex gap-3 justify-center mb-10">
            <Button size="lg" onClick={() => document.getElementById("hub-apps")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Apps ↓
            </Button>
            {paidApps.length > 0 && (
              <Button size="lg" variant="outline" onClick={() => document.getElementById("hub-pricing")?.scrollIntoView({ behavior: "smooth" })}>
                See Pricing
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-3 flex flex-wrap gap-8 justify-center">
          {[
            { icon: Package, label: "Apps", value: stats.total, color: "text-primary" },
            { icon: Globe, label: "Live", value: stats.live, color: "text-emerald-400" },
            { icon: Gift, label: "Free", value: stats.free, color: "text-blue-400" },
            { icon: CreditCard, label: "Paid", value: stats.paid, color: "text-purple-400" },
            { icon: Users, label: "Total Users", value: stats.users.toLocaleString(), color: "text-orange-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className={`text-lg font-bold ${color}`}>{value}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div id="hub-apps" className="sticky top-16 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="container py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={activeTag} onChange={e => setActiveTag(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Categories</option>
            {allCategories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            {allTags.filter(t => !allCategories.includes(t)).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={activeStatus} onChange={e => setActiveStatus(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">All Status</option>
            <option value="live">Live</option>
            <option value="beta">Beta</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="featured">Featured First</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
            <option value="users">Most Users</option>
          </select>
          {isSeller && (
            <Button onClick={() => setEditingApp(null)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Add App
            </Button>
          )}
        </div>
      </div>

      {/* ── App Grid ── */}
      <main className="container py-10 flex-1">
        {appsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-14 w-14 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {apps.length === 0 ? "No apps yet" : "No apps found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {apps.length === 0 ? "Be the first to add an app to the hub." : "Try a different search term or filter."}
            </p>
            {(search || activeTag || activeStatus) && (
              <Button variant="outline" onClick={() => { setSearch(""); setActiveTag(""); setActiveStatus(""); }}>Clear Filters</Button>
            )}
            {isSeller && apps.length === 0 && (
              <Button onClick={() => setEditingApp(null)} className="gap-2 ml-2"><Plus className="h-4 w-4" /> Add Your First App</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(app => (
              <HubAppCard
                key={app.id}
                app={app}
                onPlay={setPlayingApp}
                onBuy={handleBuy}
                onEdit={isSeller ? setEditingApp : undefined}
                onDelete={isSeller ? (a) => { if (confirm(`Remove "${a.name}" from your hub?`)) deleteApp.mutate({ id: a.id }); } : undefined}
                isOwner={isSeller && app.sellerId === user?.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Pricing Section ── */}
      {paidApps.length > 0 && (
        <section id="hub-pricing" className="py-20 border-t border-border bg-card/30">
          <div className="container text-center">
            <h2 className="text-3xl font-black mb-3">Simple Pricing</h2>
            <p className="text-muted-foreground mb-12">Pick what works. Upgrade or cancel anytime.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
              {paidApps.map(app => {
                const price = parsePrice(app.price);
                return (
                  <div key={app.id} className={`rounded-2xl border p-7 flex flex-col gap-4 transition-all ${app.featured ? "border-primary/50 bg-primary/5 shadow-[0_0_24px_rgba(99,102,241,0.15)]" : "border-border"}`}>
                    {app.featured && <Badge className="w-fit text-xs">Most Popular</Badge>}
                    <div>
                      <div className="font-bold text-lg">{app.name}</div>
                      <div className="text-3xl font-black text-violet-400 mt-1">
                        {app.access === "freemium" ? (
                          <><span className="text-green-400 text-xl mr-2">Free</span>/ ${price.toFixed(2)}</>
                        ) : `$${price.toFixed(2)}`}
                      </div>
                      {app.trialDays > 0 && <div className="text-xs text-yellow-400 mt-1">{app.trialDays}-day free trial</div>}
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{app.description || "Full access to all features."}</p>
                    <Button className="w-full" variant={app.featured ? "default" : "outline"} onClick={() => handleBuy(app)}>
                      Get {app.name} →
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── User Dashboard ── */}
      {isAuthenticated && (
        <section id="hub-dashboard" className="py-16 border-t border-border">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-black mb-6">Your Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Apps Purchased", value: myOrders.length },
                { label: "Paid Apps in Hub", value: apps.filter(a => a.access !== "free" && a.sellerId === user?.id).length },
                { label: "Member Since", value: memberSince },
              ].map(({ label, value }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-5">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className="text-2xl font-black">{value}</div>
                </div>
              ))}
            </div>
            <h3 className="font-bold text-lg mb-4">Your Orders</h3>
            {myOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet. Purchase an app to see it here.</p>
            ) : (
              <div className="space-y-3 mb-8">
                {(myOrders as any[]).map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-sm">Order #{order.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} · ${Number(order.totalAmount).toFixed(2)} · {order.paymentMethod}
                      </div>
                    </div>
                    <Badge variant={order.paymentStatus === "completed" ? "default" : "secondary"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {/* Owned Apps List */}
            {apps.filter(a => a.sellerId === user?.id).length > 0 && (
              <>
                <h3 className="font-bold text-lg mb-4">Your Hub Apps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {apps.filter(a => a.sellerId === user?.id).map(app => (
                    <div key={app.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      {app.thumbnail ? (
                        <img src={app.thumbnail} alt={app.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Monitor className="w-5 h-5 text-primary/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{app.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATUS_CONFIG[app.status]?.className}`}>{STATUS_CONFIG[app.status]?.label}</span>
                          <span>{priceLabel(app)}</span>
                          <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{app.usersCount}</span>
                        </div>
                      </div>
                      <button onClick={() => setEditingApp(app)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Seller My Apps ── */}
      {isSeller && apps.filter(a => a.sellerId === user?.id).length > 0 && (
        <section className="py-12 border-t border-border bg-card/30">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" /> My Hub Apps
              </h2>
              <Button size="sm" onClick={() => setEditingApp(null)} className="gap-2">
                <Plus className="h-4 w-4" /> Add App
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {apps.filter(a => a.sellerId === user?.id).map(app => (
                <HubAppCard
                  key={app.id}
                  app={app}
                  onPlay={setPlayingApp}
                  onBuy={handleBuy}
                  isOwner
                  onEdit={setEditingApp}
                  onDelete={(a) => { if (confirm(`Delete "${a.name}"?`)) deleteApp.mutate({ id: a.id }); }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── App Detail Modal ── */}
      {playingApp && <AppDetailModal app={playingApp} onClose={() => setPlayingApp(null)} onBuy={handleBuy} />}

      {/* ── Add/Edit Modal ── */}
      {editingApp !== undefined && (
        <HubAppFormModal app={editingApp ?? undefined} onClose={() => setEditingApp(undefined)} />
      )}

      <Footer />
    </div>
  );
}
