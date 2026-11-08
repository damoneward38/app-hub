import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Maximize2, X, Lock, Globe, Play, ExternalLink } from "lucide-react";

type HubApp = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  embedUrl: string | null;
  liveUrl: string | null;
  thumbnail: string | null;
  status: "live" | "beta" | "coming-soon";
  access: "free" | "paid" | "freemium";
  featured: boolean;
  rating: string;
  usersCount: number;
  price: string;
  tags: string | null;
  builtWith: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  beta: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "coming-soon": "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

const ACCESS_COLOR: Record<string, string> = {
  free: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  paid: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  freemium: "bg-teal-500/15 text-teal-400 border-teal-500/20",
};

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function Vault() {
  const [expanded, setExpanded] = useState<HubApp | null>(null);
  const [filter, setFilter] = useState<"all" | "free" | "paid" | "freemium">("all");
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: apps = [], isLoading } = trpc.hub.list.useQuery({ sellerId: undefined });

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  const filtered = (apps as HubApp[]).filter((app) => {
    const matchAccess = filter === "all" || app.access === filter;
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchAccess && matchSearch;
  });

  const liveApps = filtered.filter((a) => a.status === "live");
  const otherApps = filtered.filter((a) => a.status !== "live");
  const displayApps = [...liveApps, ...otherApps];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Header ── */}
      <div className="border-b border-border bg-card/40 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Lock className="h-4.5 w-4.5 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">My Vault</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Live previews of every app — tap any card to open it fullscreen
              </p>
            </div>
            {/* Stats */}
            <div className="flex gap-4 text-center">
              {[
                { label: "Total", value: (apps as HubApp[]).length },
                { label: "Live", value: (apps as HubApp[]).filter(a => a.status === "live").length },
                { label: "Free", value: (apps as HubApp[]).filter(a => a.access === "free").length },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-2">
                  <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex gap-2">
              {(["all", "free", "paid", "freemium"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="container py-8 flex-1">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card animate-pulse">
                <div className="h-5 mx-3 mt-3 mb-2 rounded bg-muted/40" />
                <div className="mx-3 mb-3 h-44 rounded-xl bg-muted/30" />
              </div>
            ))}
          </div>
        ) : displayApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Lock className="h-14 w-14 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No apps in the vault yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add apps to the App Hub with an embed URL and they'll appear here as live previews.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayApps.map((app) => (
              <VaultCard key={app.id} app={app} onExpand={() => setExpanded(app)} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* ── Fullscreen Modal ── */}
      {expanded && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[9999] flex flex-col bg-black"
          style={{ animation: "vaultSlideUp 0.28s cubic-bezier(0.32,0.72,0,1) both" }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#16213e] border-b-2 border-[#e94560] flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {expanded.thumbnail && (
                <img src={expanded.thumbnail} alt="" className="h-7 w-7 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="min-w-0">
                <span className="font-bold text-white text-sm truncate block">{expanded.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${STATUS_COLOR[expanded.status]}`}>
                    {expanded.status}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ACCESS_COLOR[expanded.access]}`}>
                    {expanded.access === "free" ? "Free" : expanded.access === "paid" ? `$${expanded.price}` : "Freemium"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {expanded.liveUrl && (
                <a
                  href={expanded.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/70 hover:text-white px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open</span>
                </a>
              )}
              <button
                onClick={() => setExpanded(null)}
                className="flex items-center gap-1.5 bg-[#e94560] hover:bg-[#c73652] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Iframe or placeholder */}
          {expanded.embedUrl ? (
            <iframe
              src={expanded.embedUrl}
              className="flex-1 w-full border-none"
              title={expanded.name}
              allow="fullscreen; autoplay; clipboard-write"
            />
          ) : expanded.liveUrl ? (
            <iframe
              src={expanded.liveUrl}
              className="flex-1 w-full border-none"
              title={expanded.name}
              allow="fullscreen; autoplay; clipboard-write"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0f3460] text-white gap-4">
              <Globe className="h-16 w-16 text-white/20" />
              <p className="text-white/60 text-sm">No embed URL configured for this app.</p>
              {expanded.liveUrl && (
                <a
                  href={expanded.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Open in New Tab
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slide-up keyframe */}
      <style>{`
        @keyframes vaultSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Individual Vault Card ── */
function VaultCard({ app, onExpand }: { app: HubApp; onExpand: () => void }) {
  const [hovered, setHovered] = useState(false);
  const tags = parseTags(app.tags);

  return (
    <div
      onClick={onExpand}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group rounded-2xl border border-border bg-card cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
    >
      {/* App label */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          {app.thumbnail && (
            <img src={app.thumbnail} alt="" className="h-5 w-5 rounded-md object-cover flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-foreground truncate">{app.name}</span>
        </div>
        {app.featured && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium flex-shrink-0">★</span>
        )}
      </div>

      {/* Live preview box */}
      <div className="relative mx-3 mb-3 rounded-xl overflow-hidden bg-[#0f3460]" style={{ height: 180 }}>
        {app.embedUrl || app.liveUrl ? (
          <>
            <iframe
              src={app.embedUrl || app.liveUrl || ""}
              scrolling="no"
              tabIndex={-1}
              title={`preview-${app.id}`}
              className="absolute top-0 left-0 border-none pointer-events-none"
              style={{
                width: "400%",
                height: "400%",
                transform: "scale(0.25)",
                transformOrigin: "top left",
              }}
            />
            {/* Tap overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{ background: hovered ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0)" }}
            >
              <Maximize2
                className="h-8 w-8 text-white drop-shadow-lg transition-opacity duration-200"
                style={{ opacity: hovered ? 1 : 0 }}
              />
            </div>
          </>
        ) : (
          /* No URL fallback */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-white/20" />
            <span className="text-[10px] text-white/30">No preview</span>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: hovered ? 1 : 0, background: "rgba(0,0,0,0.35)" }}
            >
              <Play className="h-8 w-8 text-white/80" />
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="px-3 pb-3 flex flex-wrap gap-1">
        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${STATUS_COLOR[app.status]}`}>
          {app.status}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${ACCESS_COLOR[app.access]}`}>
          {app.access === "free" ? "Free" : app.access === "paid" ? `$${app.price}` : "Freemium"}
        </span>
        {tags.slice(0, 1).map((t) => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded border border-border bg-muted/30 text-muted-foreground font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
