import { Link } from "wouter";
import { ShoppingCart, Heart, Star, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface AppData {
  app: {
    id: number;
    name: string;
    slug: string;
    shortDescription?: string | null;
    price: string | number;
    originalPrice?: string | number | null;
    isFree: boolean;
    iconUrl?: string | null;
    avgRating: number;
    reviewCount: number;
    downloadCount: number;
    isFeatured: boolean;
    tags?: string | null;
  };
  category?: { name: string; slug: string } | null;
  seller?: { id: number; name?: string | null; isVerifiedSeller: boolean } | null;
}

interface AppCardProps {
  data: AppData;
  rank?: number;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const stars = [1, 2, 3, 4, 5];
  const cls = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export function AppCard({ data, rank }: AppCardProps) {
  const { app, category, seller } = data;
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast.success(`${app.name} added to cart`);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (res) => {
      utils.wishlist.list.invalidate();
      toast.success(res.added ? "Added to wishlist" : "Removed from wishlist");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { window.location.href = getLoginUrl(); return; }
    addToCart.mutate({ appId: app.id });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { window.location.href = getLoginUrl(); return; }
    toggleWishlist.mutate({ appId: app.id });
  };

  const price = Number(app.price);
  const originalPrice = app.originalPrice ? Number(app.originalPrice) : null;
  const discount = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null;
  const tags = (() => { try { return JSON.parse(app.tags || "[]") as string[]; } catch { return []; } })();

  return (
    <Link href={`/marketplace/${app.slug}`}>
      <div className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer h-full">
        {/* Rank badge */}
        {rank && (
          <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
            {rank}
          </div>
        )}

        {/* Featured badge */}
        {app.isFeatured && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-amber-500/90 text-white text-xs px-1.5 py-0.5 gap-1">
              <Zap className="h-2.5 w-2.5" /> Featured
            </Badge>
          </div>
        )}

        {/* App Icon */}
        <div className="relative bg-gradient-to-br from-muted to-muted/50 aspect-[4/3] flex items-center justify-center overflow-hidden">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt={app.name} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary/60">{app.name[0]}</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
          >
            <Heart className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          {/* Category */}
          {category && (
            <span className="text-xs text-muted-foreground font-medium">{category.name}</span>
          )}

          {/* Name */}
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {app.name}
          </h3>

          {/* Description */}
          {app.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {app.shortDescription}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rating & Downloads */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <StarRating rating={app.avgRating} />
              <span className="font-medium text-foreground">{app.avgRating > 0 ? app.avgRating.toFixed(1) : "—"}</span>
              {app.reviewCount > 0 && <span>({app.reviewCount})</span>}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{app.downloadCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
            <div className="flex items-baseline gap-1.5">
              {app.isFree ? (
                <span className="text-sm font-bold text-emerald-500">Free</span>
              ) : (
                <>
                  <span className="text-sm font-bold text-foreground">${price.toFixed(2)}</span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                  )}
                  {discount && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-emerald-500/10 text-emerald-600">
                      -{discount}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              <ShoppingCart className="h-3 w-3" />
              {app.isFree ? "Get" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { StarRating };
