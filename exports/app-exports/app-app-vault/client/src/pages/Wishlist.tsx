import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AppCard } from "@/components/AppCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { user } = useAuth();
  const wishlistQuery = trpc.wishlist.list.useQuery(undefined, { enabled: !!user });
  const items = wishlistQuery.data ?? [];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your wishlist</h2>
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
        <h1 className="text-2xl font-display font-bold text-foreground mb-8">My Wishlist</h1>
        {wishlistQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm mb-6">Save apps you love for later</p>
            <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <AppCard key={item.wishlistItem.id} data={{ app: item.app!, category: item.category as any, seller: null }} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
