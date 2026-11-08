import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, X, Package, ChevronLeft, ChevronRight } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
];

const PAGE_SIZE = 20;

export default function Marketplace() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [inputQuery, setInputQuery] = useState(params.get("q") ?? "");
  const [categorySlug, setCategorySlug] = useState(params.get("category") ?? "");
  const [sortBy, setSortBy] = useState<any>(params.get("sort") ?? "newest");
  const [isFree, setIsFree] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categoriesQuery = trpc.categories.list.useQuery();
  const appsQuery = trpc.apps.list.useQuery({
    search: query || undefined,
    categorySlug: categorySlug || undefined,
    sortBy,
    isFree: isFree || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 200 ? priceRange[1] : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const apps = appsQuery.data?.apps ?? [];
  const total = appsQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const categories = categoriesQuery.data ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputQuery);
    setPage(0);
  };

  const clearFilters = () => {
    setQuery(""); setInputQuery(""); setCategorySlug(""); setIsFree(false);
    setPriceRange([0, 200]); setSortBy("newest"); setPage(0);
  };

  const hasFilters = query || categorySlug || isFree || priceRange[0] > 0 || priceRange[1] < 200;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container py-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground text-sm">
            {total > 0 ? `${total.toLocaleString()} apps available` : "Browse our collection of apps and templates"}
          </p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`shrink-0 w-64 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCategorySlug(""); setPage(0); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categorySlug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategorySlug(cat.slug); setPage(0); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categorySlug === cat.slug ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free only */}
              <div className="flex items-center justify-between">
                <Label htmlFor="free-only" className="text-sm text-foreground cursor-pointer">Free only</Label>
                <Switch id="free-only" checked={isFree} onCheckedChange={(v) => { setIsFree(v); setPage(0); }} />
              </div>

              {/* Price range */}
              {!isFree && (
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Price Range: ${priceRange[0]} – ${priceRange[1] >= 200 ? "200+" : priceRange[1]}
                  </Label>
                  <Slider
                    min={0} max={200} step={5}
                    value={priceRange}
                    onValueChange={(v) => { setPriceRange(v); setPage(0); }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search + Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </form>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-1.5"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(0); }}>
                  <SelectTrigger className="w-44 h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {query && (
                  <Badge variant="secondary" className="gap-1.5 pr-1">
                    "{query}"
                    <button onClick={() => { setQuery(""); setInputQuery(""); setPage(0); }} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categorySlug && (
                  <Badge variant="secondary" className="gap-1.5 pr-1">
                    {categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
                    <button onClick={() => { setCategorySlug(""); setPage(0); }} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {isFree && (
                  <Badge variant="secondary" className="gap-1.5 pr-1">
                    Free only
                    <button onClick={() => { setIsFree(false); setPage(0); }} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Grid */}
            {appsQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
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
            ) : apps.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {apps.map((item) => (
                    <AppCard key={item.app.id} data={item as any} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No apps found</h3>
                <p className="text-muted-foreground text-sm mb-6">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
