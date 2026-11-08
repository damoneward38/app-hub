/**
 * Bot Checkout Router
 * Handles bot subscription purchases through PayPal
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createBotCheckout,
  completeBotSubscription,
  cancelBotSubscription,
  getBotSubscriptionStatus,
} from "../services/botCheckout";
import { logger } from "../_core/logger";

export const botCheckoutRouter = router({
  /**
   * Create bot checkout session
   * Returns PayPal approval URL for user authorization
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        botId: z.number(),
        botType: z.enum(["branded", "custom"]),
        subscriptionType: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info(
          `Creating checkout for bot ${input.botId}, user ${ctx.user.id}`
        );

        const result = await createBotCheckout({
          botId: input.botId,
          botType: input.botType,
          subscriptionType: input.subscriptionType,
          userId: ctx.user.id.toString(),
          userEmail: ctx.user.email || "user@example.com",
        });

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return {
          success: true,
          checkoutUrl: result.checkoutUrl,
          message: result.message,
        };
      } catch (error) {
        logger.error("Failed to create bot checkout:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  /**
   * Complete bot subscription after PayPal approval
   */
  completeSubscription: protectedProcedure
    .input(z.object({
      botId: z.number(),
      paypalSubscriptionId: z.string(),
      subscriptionType: z.enum(["monthly", "yearly"]),
    }))
    .mutation(async () => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Subscription activation is only allowed from a verified PayPal webhook.",
      });
    }),

  /**
   * Cancel bot subscription
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ botId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info(
          `Canceling subscription for bot ${input.botId}, user ${ctx.user.id}`
        );

        const result = await cancelBotSubscription(
          ctx.user.id.toString(),
          input.botId
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }

        return {
          success: true,
          message: result.message,
        };
      } catch (error) {
        logger.error("Failed to cancel subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel subscription",
        });
      }
    }),

  /**
   * Get bot subscription status
   */
  getStatus: protectedProcedure
    .input(z.object({ botId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        logger.info(
          `Getting subscription status for bot ${input.botId}, user ${ctx.user.id}`
        );

        const status = await getBotSubscriptionStatus(
          ctx.user.id.toString(),
          input.botId
        );

        return status;
      } catch (error) {
        logger.error("Failed to get subscription status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get subscription status",
        });
      }
    }),
});
