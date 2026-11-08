import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Store, Shield } from "lucide-react";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { refresh(); toast.success("Profile updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const becomeSeller = trpc.auth.becomeSellerRequest.useMutation({
    onSuccess: () => { refresh(); toast.success("You are now a seller!"); },
    onError: (e) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your profile</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name, bio, website });
  };

  const roleColor = user.role === "admin" ? "bg-red-500/10 text-red-500" : user.role === "seller" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-10 flex-1 max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-foreground mb-8">Profile Settings</h1>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          {/* Avatar & Role */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{user.name ?? "User"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={`mt-1 text-xs ${roleColor}`}>
                {user.role === "admin" ? <><Shield className="h-3 w-3 mr-1" />Admin</> : user.role === "seller" ? <><Store className="h-3 w-3 mr-1" />Seller</> : <><User className="h-3 w-3 mr-1" />User</>}
              </Badge>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Display Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Bio</label>
              <textarea
                value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Tell us about yourself"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Website</label>
              <input
                type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* Become Seller */}
        {user.role === "user" && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Become a Seller</h3>
            <p className="text-sm text-muted-foreground mb-4">Start selling your apps and templates on AppVault. Earn up to 80% revenue share.</p>
            <Button variant="outline" onClick={() => becomeSeller.mutate()} disabled={becomeSeller.isPending}>
              {becomeSeller.isPending ? "Processing..." : "Become a Seller"}
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
