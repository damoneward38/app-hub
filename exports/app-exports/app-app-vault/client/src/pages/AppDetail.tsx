import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarRating } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ShoppingCart, Heart, Star, Download, Eye, Globe, Github,
  BookOpen, CheckCircle, Shield, Zap, ArrowLeft, ExternalLink,
  Package, Tag, Code2, Calendar
} from "lucide-react";

export default function AppDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);

  const appQuery = trpc.apps.bySlug.useQuery({ slug: slug! }, { enabled: !!slug });
  const reviewsQuery = trpc.reviews.list.useQuery({ appId: appQuery.data?.app.id ?? 0 }, { enabled: !!appQuery.data?.app.id });
  const myReviewQuery = trpc.reviews.myReview.useQuery({ appId: appQuery.data?.app.id ?? 0 }, { enabled: !!user && !!appQuery.data?.app.id });
  const ownsQuery = trpc.apps.checkOwnership.useQuery({ appId: appQuery.data?.app.id ?? 0 }, { enabled: !!user && !!appQuery.data?.app.id });
  const wishlistCheck = trpc.wishlist.check.useQuery({ appId: appQuery.data?.app.id ?? 0 }, { enabled: !!user && !!appQuery.data?.app.id });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast.success("Added to cart!"); },
    onError: (e) => toast.error(e.message),
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (res) => { utils.wishlist.check.invalidate(); toast.success(res.added ? "Added to wishlist" : "Removed from wishlist"); },
    onError: (e) => toast.error(e.message),
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate();
      utils.reviews.myReview.invalidate();
      setReviewTitle(""); setReviewBody(""); setReviewRating(5);
      toast.success("Review submitted!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (appQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!appQuery.data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold mb-2">App not found</h2>
          <Link href="/marketplace"><Button variant="outline">Back to Marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const { app, category, seller } = appQuery.data;
  const screenshots: string[] = (() => { try { return JSON.parse(app.screenshots || "[]"); } catch { return []; } })();
  const tags: string[] = (() => { try { return JSON.parse(app.tags || "[]"); } catch { return []; } })();
  const techStack: string[] = (() => { try { return JSON.parse(app.techStack || "[]"); } catch { return []; } })();
  const price = Number(app.price);
  const originalPrice = app.originalPrice ? Number(app.originalPrice) : null;
  const discount = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null;
  const reviews = reviewsQuery.data ?? [];
  const owns = ownsQuery.data ?? false;
  const inWishlist = wishlistCheck.data ?? false;

  const handleAddToCart = () => {
    if (!user) { window.location.href = getLoginUrl(); return; }
    addToCart.mutate({ appId: app.id });
  };

  const handleWishlist = () => {
    if (!user) { window.location.href = getLoginUrl(); return; }
    toggleWishlist.mutate({ appId: app.id });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReview.mutate({ appId: app.id, rating: reviewRating, title: reviewTitle || undefined, body: reviewBody || undefined });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/marketplace"><span className="hover:text-foreground cursor-pointer flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Marketplace</span></Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/categories/${category.slug}`}><span className="hover:text-foreground cursor-pointer">{category.name}</span></Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-xs">{app.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* App Header */}
            <div className="flex gap-5">
              <div className="shrink-0">
                {app.iconUrl ? (
                  <img src={app.iconUrl} alt={app.name} className="w-24 h-24 rounded-2xl object-cover shadow-md border border-border" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
                    <span className="text-4xl font-bold text-primary/60">{app.name[0]}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">{app.name}</h1>
                  {app.isFeatured && (
                    <Badge className="bg-amber-500/90 text-white gap-1"><Zap className="h-3 w-3" /> Featured</Badge>
                  )}
                </div>
                {category && (
                  <Link href={`/categories/${category.slug}`}>
                    <Badge variant="secondary" className="mb-3 cursor-pointer hover:bg-primary/10">{category.name}</Badge>
                  </Link>
                )}
                <p className="text-muted-foreground text-sm mb-3">{app.shortDescription}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={app.avgRating} size="md" />
                    <span className="font-semibold text-foreground">{app.avgRating > 0 ? app.avgRating.toFixed(1) : "—"}</span>
                    <span>({app.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1"><Download className="h-4 w-4" />{app.downloadCount.toLocaleString()} downloads</div>
                  <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{app.viewCount.toLocaleString()} views</div>
                </div>
              </div>
            </div>

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video">
                  <img src={screenshots[selectedScreenshot]} alt={`Screenshot ${selectedScreenshot + 1}`} className="w-full h-full object-cover" />
                </div>
                {screenshots.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {screenshots.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedScreenshot(i)}
                        className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === selectedScreenshot ? "border-primary" : "border-border hover:border-primary/40"}`}
                      >
                        <img src={s} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({app.reviewCount})</TabsTrigger>
                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4 prose prose-sm max-w-none dark:prose-invert">
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {app.description || app.shortDescription || "No description provided."}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4 space-y-6">
                {/* Write review */}
                {user && owns && !myReviewQuery.data && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} type="button" onClick={() => setReviewRating(s)}>
                              <Star className={`h-6 w-6 transition-colors ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-300"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text" placeholder="Review title (optional)" value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <Textarea
                        placeholder="Share your experience with this app..." value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)} rows={4}
                        className="text-sm resize-none"
                      />
                      <Button type="submit" size="sm" disabled={createReview.isPending}>
                        {createReview.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </div>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.review.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={r.user?.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {r.user?.name?.[0]?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm text-foreground">{r.user?.name ?? "Anonymous"}</span>
                              <span className="text-xs text-muted-foreground">{new Date(r.review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <StarRating rating={r.review.rating} />
                          </div>
                        </div>
                        {r.review.title && <p className="font-semibold text-sm text-foreground mb-1">{r.review.title}</p>}
                        {r.review.body && <p className="text-sm text-muted-foreground leading-relaxed">{r.review.body}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tech" className="mt-4">
                {techStack.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="gap-1.5 px-3 py-1.5">
                        <Code2 className="h-3.5 w-3.5" /> {tech}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tech stack information provided.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Purchase Card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5 sticky top-24">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                {app.isFree ? (
                  <span className="text-3xl font-display font-bold text-emerald-500">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-display font-bold text-foreground">${price.toFixed(2)}</span>
                    {originalPrice && originalPrice > price && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-sm">-{discount}%</Badge>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              {owns ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" /> You own this app
                  </div>
                  <Link href="/purchases">
                    <Button className="w-full gap-2" variant="outline">
                      <Download className="h-4 w-4" /> View in My Purchases
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full gap-2" onClick={handleAddToCart} disabled={addToCart.isPending}>
                    <ShoppingCart className="h-4 w-4" />
                    {app.isFree ? "Get for Free" : "Add to Cart"}
                  </Button>
                  <Button
                    variant="outline" className="w-full gap-2"
                    onClick={handleWishlist}
                    disabled={toggleWishlist.isPending}
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                    {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                </div>
              )}

              {/* Trust badges */}
              <div className="space-y-2 pt-2 border-t border-border">
                {[
                  { icon: Shield, text: "Secure payment" },
                  { icon: Zap, text: "Instant access after purchase" },
                  { icon: CheckCircle, text: "Unique license key included" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <b.icon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* App Info */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-sm text-foreground">App Details</h3>
              <div className="space-y-2 text-sm">
                {app.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Version</span>
                    <span className="font-medium text-foreground">{app.version}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Released</span>
                  <span className="font-medium text-foreground">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                {category && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Category</span>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {app.demoUrl && (
                  <a href={app.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Globe className="h-3.5 w-3.5" /> Demo
                    </Button>
                  </a>
                )}
                {app.documentationUrl && (
                  <a href={app.documentationUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <BookOpen className="h-3.5 w-3.5" /> Docs
                    </Button>
                  </a>
                )}
                {app.githubUrl && (
                  <a href={app.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Seller Info */}
            {seller && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">About the Seller</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={seller.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {seller.name?.[0]?.toUpperCase() ?? "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-foreground">{seller.name ?? "Seller"}</span>
                      {seller.isVerifiedSeller && (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    {seller.bio && <p className="text-xs text-muted-foreground line-clamp-2">{seller.bio}</p>}
                  </div>
                </div>
                {seller.website && (
                  <a href={seller.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> {seller.website}
                  </a>
                )}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag: string) => (
                    <Link key={tag} href={`/marketplace?q=${encodeURIComponent(tag)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 text-xs">{tag}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
