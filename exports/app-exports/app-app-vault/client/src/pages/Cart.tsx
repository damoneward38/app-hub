import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart, Trash2, Package, ArrowRight, Tag } from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: !!user });
  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast.success("Removed from cart"); },
    onError: (e) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view your cart</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cartQuery.data ?? [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.app?.price ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-10 flex-1">
        <h1 className="text-2xl font-display font-bold text-foreground mb-8">Shopping Cart</h1>

        {cartQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm mb-6">Browse the marketplace to find apps you love</p>
            <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const app = item.app!;
                const price = Number(app.price);
                return (
                  <div key={item.cartItem.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                    <Link href={`/marketplace/${app.slug}`}>
                      <div className="shrink-0 w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-primary/60">{app.name[0]}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/marketplace/${app.slug}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{app.name}</h3>
                      </Link>
                      {item.category && <p className="text-xs text-muted-foreground">{item.category.name}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">
                          {app.isFree ? <span className="text-emerald-500">Free</span> : `$${price.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeItem.mutate({ appId: app.id })}
                      disabled={removeItem.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4 h-fit sticky top-24">
              <h2 className="font-display font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={() => navigate("/checkout")}>
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="w-full">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
