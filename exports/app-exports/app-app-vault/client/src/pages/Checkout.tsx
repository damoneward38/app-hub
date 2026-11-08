import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Coins, ShieldCheck, ArrowLeft, CheckCircle, Lock } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "stripe", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Amex", badge: "Most Popular" },
  { id: "paypal", label: "PayPal", icon: ShieldCheck, desc: "Pay with your PayPal account" },
  { id: "token", label: "AppVault Tokens", icon: Coins, desc: "Use your token balance" },
];

export default function Checkout() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | "token">("stripe");
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: !!user });
  const checkout = trpc.orders.checkout.useMutation({
    onSuccess: (data) => {
      utils.cart.get.invalidate();
      utils.licenses.list.invalidate();
      navigate(`/order/success?orderId=${data.orderId}`);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to checkout</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const items = cartQuery.data ?? [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.app?.price ?? 0), 0);
  const allFree = items.every((i) => i.app?.isFree);

  const handleCheckout = () => {
    const method = allFree ? "free" : paymentMethod;
    checkout.mutate({ paymentMethod: method as any });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-10 flex-1 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Cart
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Checkout</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment */}
            <div className="lg:col-span-3 space-y-6">
              {!allFree && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-display font-semibold text-foreground mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${paymentMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{method.label}</span>
                            {method.badge && <Badge variant="secondary" className="text-xs">{method.badge}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                        {paymentMethod === method.id && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <Lock className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">Your payment information is encrypted and never stored on our servers.</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4 sticky top-24">
                <h2 className="font-display font-semibold text-foreground">Order Summary</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.cartItem.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {item.app?.iconUrl ? (
                          <img src={item.app.iconUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary/60">{item.app?.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.app?.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {item.app?.isFree ? <span className="text-emerald-500">Free</span> : `$${Number(item.app?.price).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground text-base">
                    <span>Total</span>
                    <span>{allFree ? <span className="text-emerald-500">Free</span> : `$${subtotal.toFixed(2)}`}</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2" size="lg"
                  onClick={handleCheckout}
                  disabled={checkout.isPending}
                >
                  {checkout.isPending ? "Processing..." : allFree ? "Get for Free" : `Pay $${subtotal.toFixed(2)}`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By completing your purchase you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
