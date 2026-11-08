import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Star, Flag, CheckCircle } from "lucide-react";

export default function AdminReviews() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const reviewsQuery = trpc.admin.allReviews.useQuery({ limit: 50, offset: 0 }, { enabled: user?.role === "admin" });
  const moderate = trpc.admin.moderateReview.useMutation({ onSuccess: () => { utils.admin.allReviews.invalidate(); toast.success("Review updated"); }, onError: (e) => toast.error(e.message) });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!user || user.role !== "admin") return null;
  const reviews = reviewsQuery.data ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Admin</Button></Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Moderate Reviews</h1>
        </div>
        {reviewsQuery.isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16"><Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" /><p className="text-muted-foreground">No reviews to moderate</p></div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r: any) => (
              <div key={r.review.id} className={`p-4 rounded-xl border bg-card ${r.review.isFlagged ? "border-red-500/30" : "border-border"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{r.user?.name ?? "User"}</span>
                      <div className="flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>
                      {r.review.isFlagged && <span className="text-xs text-red-500 flex items-center gap-1"><Flag className="h-3 w-3" /> Flagged</span>}
                    </div>
                    {r.review.title && <p className="text-sm font-medium text-foreground">{r.review.title}</p>}
                    {r.review.body && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{r.review.body}</p>}
                    <p className="text-xs text-muted-foreground mt-2">App: {r.app?.name} · {new Date(r.review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => moderate.mutate({ reviewId: r.review.id, isApproved: true, isFlagged: false })}>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs text-red-500 hover:text-red-600" onClick={() => moderate.mutate({ reviewId: r.review.id, isApproved: false, isFlagged: true })}>
                      <Flag className="h-3.5 w-3.5" /> Flag
                    </Button>
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
