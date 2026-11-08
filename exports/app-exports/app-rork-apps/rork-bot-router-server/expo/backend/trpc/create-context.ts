import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { requireAuth } from "./middleware/auth";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await requireAuth(ctx);
  return next({
    ctx: {
      ...ctx,
      session,
    },
  });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await requireAuth(ctx, true);
  return next({
    ctx: {
      ...ctx,
      session,
    },
  });
});
