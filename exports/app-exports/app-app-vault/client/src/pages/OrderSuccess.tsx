import { useSearch, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function OrderSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-24 flex-1 flex flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">Purchase Successful!</h1>
        <p className="text-muted-foreground mb-2">Order #{orderId} has been completed.</p>
        <p className="text-muted-foreground text-sm mb-8">Your license keys are ready. Check your purchases for download access.</p>
        <div className="flex gap-3">
          <Link href="/purchases"><Button className="gap-2"><Package className="h-4 w-4" /> View Purchases</Button></Link>
          <Link href="/marketplace"><Button variant="outline" className="gap-2">Continue Shopping <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
