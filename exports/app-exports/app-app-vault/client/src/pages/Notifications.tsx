import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Notifications() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const notifQuery = trpc.notifications.list.useQuery(undefined, { enabled: !!user });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); toast.success("All marked as read"); },
  });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view notifications</h2>
          <Button asChild><a href={getLoginUrl()}>Sign In</a></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const notifications = notifQuery.data ?? [];
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-10 flex-1 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
            {unread > 0 && <p className="text-sm text-muted-foreground">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        {notifQuery.isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No notifications</h2>
            <p className="text-muted-foreground text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${!n.isRead ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/30"}`}
                onClick={() => { if (!n.isRead) markRead.mutate({ id: n.id }); if (n.link) window.location.href = n.link; }}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${!n.isRead ? "bg-primary/10" : "bg-muted"}`}>
                  <Bell className={`h-4 w-4 ${!n.isRead ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
