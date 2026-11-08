import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const usersQuery = trpc.admin.allUsers.useQuery({ limit: 100, offset: 0 }, { enabled: user?.role === "admin" });
  const updateRole = trpc.admin.updateUserRole.useMutation({ onSuccess: () => { utils.admin.allUsers.invalidate(); toast.success("Role updated"); }, onError: (e) => toast.error(e.message) });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  if (!user || user.role !== "admin") return null;
  const users = usersQuery.data ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Admin</Button></Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Manage Users</h1>
        </div>
        {usersQuery.isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={u.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">{u.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{u.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <Select value={u.role} onValueChange={(v) => updateRole.mutate({ userId: u.id, role: v as any })}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
