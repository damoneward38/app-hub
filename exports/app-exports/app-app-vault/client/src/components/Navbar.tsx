"use client";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package, Search, ShoppingCart, Bell, Menu, X, Sun, Moon,
  LayoutDashboard, Settings, LogOut, User, Shield, Store,
  Heart, ChevronDown, Zap
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: !!user });
  const notifCount = trpc.notifications.unreadCount.useQuery(undefined, { enabled: !!user });

  const cartCount = cartQuery.data?.length ?? 0;
  const unread = notifCount.data ?? 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Categories", href: "/marketplace?view=categories" },
    { label: "App Hub", href: "/hub" },
    { label: "Vault", href: "/vault" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blueprint", href: "/blueprint" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"}`}>
      <div className="container">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              App<span className="text-primary">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${location === link.href || location.startsWith(link.href.split("?")[0]) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search apps, kits, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user ? (
              <>
                {/* Wishlist */}
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Notifications */}
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
                        {unread > 9 ? "9+" : unread}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 gap-2 px-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {user.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">{user.name ?? "User"}</span>
                        <span className="text-xs text-muted-foreground font-normal capitalize">{user.role} account</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><span className="flex items-center gap-2 w-full cursor-pointer"><User className="h-4 w-4" /> Profile</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/purchases"><span className="flex items-center gap-2 w-full cursor-pointer"><Package className="h-4 w-4" /> My Purchases</span></Link>
                    </DropdownMenuItem>
                    {(user.role === "seller" || user.role === "admin") && (
                      <DropdownMenuItem asChild>
                        <Link href="/seller"><span className="flex items-center gap-2 w-full cursor-pointer"><Store className="h-4 w-4" /> Seller Dashboard</span></Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin"><span className="flex items-center gap-2 w-full cursor-pointer"><Shield className="h-4 w-4" /> Admin Panel</span></Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button size="sm" asChild>
                  <a href={getLoginUrl()}>Get Started</a>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <form onSubmit={handleSearch} className="pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer">{link.label}</span>
              </Link>
            ))}
            {!user && (
              <div className="pt-2 border-t border-border flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild><a href={getLoginUrl()}>Sign In</a></Button>
                <Button size="sm" asChild><a href={getLoginUrl()}>Get Started</a></Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
