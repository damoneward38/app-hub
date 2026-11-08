import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { userBotPurchases } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const bots = [
  // Branded Bots (Pre-configured with Damone Ward Sr. content)
  { id: 1, name: "Brain Bot", priceMonthly: 2999, priceYearly: 29999, type: "branded", description: "Content management & analysis" },
  { id: 2, name: "Creative Bot", priceMonthly: 2999, priceYearly: 29999, type: "branded", description: "Music distribution & content generation" },
  { id: 3, name: "Hype Bot", priceMonthly: 2999, priceYearly: 29999, type: "branded", description: "Marketing & community engagement" },
  { id: 4, name: "Email Bot", priceMonthly: 2999, priceYearly: 29999, type: "branded", description: "Email automation & campaigns" },
  { id: 5, name: "No Repeat Bot", priceMonthly: 2999, priceYearly: 29999, type: "branded", description: "Smart playlist generation" },
  { id: 6, name: "Art Bot", priceMonthly: 2999, priceYearly: 29999, type: "branded", description: "Cover art & visual content" },
  // Blank Bot Template (For users to customize)
  { id: 7, name: "Custom Bot Builder", priceMonthly: 1999, priceYearly: 19999, type: "blank", description: "Build your own AI bot with custom knowledge base" },
];

export const botPurchaseRouter = router({
  getAll: publicProcedure.query(async () => {
    return bots;
  }),

  purchase: protectedProcedure
    .input(z.object({ botId: z.number(), subscriptionType: z.enum(["monthly", "yearly"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const bot = bots.find(b => b.id === input.botId);
      if (!bot) throw new TRPCError({ code: "NOT_FOUND", message: "Bot not found" });

      const expiryDate = new Date();
      if (input.subscriptionType === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      await db.insert(userBotPurchases).values({
        userId: ctx.user.id,
        botId: input.botId,
        expiryDate,
        status: "active",
      });

      const price = input.subscriptionType === "monthly" ? bot.priceMonthly : bot.priceYearly;
      return { success: true, botName: bot.name, price };
    }),

  getUserBots: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    return await db
      .select()
      .from(userBotPurchases)
      .where(eq(userBotPurchases.userId, ctx.user.id));
  }),

  hasPurchased: protectedProcedure
    .input(z.object({ botId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return false;

      const purchase = await db
        .select()
        .from(userBotPurchases)
        .where(and(eq(userBotPurchases.userId, ctx.user.id), eq(userBotPurchases.botId, input.botId)));
      return purchase.length > 0;
    }),
});
