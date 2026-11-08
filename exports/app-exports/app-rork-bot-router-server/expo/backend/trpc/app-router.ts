import { createTRPCRouter } from "./create-context";
import { releasesRouter } from "./routes/releases";
import { adminRouter } from "./routes/admin";
import { botRouter } from "./routes/bots";
import { subscriptionsRouter } from "./routes/subscriptions";

export const appRouter = createTRPCRouter({
  releases: releasesRouter,
  admin: adminRouter,
  bots: botRouter,
  subscriptions: subscriptionsRouter,
});

export type AppRouter = typeof appRouter;
