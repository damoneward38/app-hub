import { Link } from "wouter";
import { Package, Github, Twitter, Mail, Shield, Zap } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Categories", href: "/marketplace?view=categories" },
  ],
  Sellers: [
    { label: "Seller Dashboard", href: "/seller" },
    { label: "Upload App", href: "/seller/apps/new" },
  ],
  Account: [
    { label: "My Purchases", href: "/purchases" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Profile", href: "/profile" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">App<span className="text-primary">Vault</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
              The premier marketplace for software applications, UI kits, and complete app templates.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-500">Verified Secure</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-500">Instant Access</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AppVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
