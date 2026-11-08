import * as z from "zod";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { getSession } from "../middleware/auth";
import * as subscriptionStorage from "../../storage/subscriptions";
import { createPayPalSubscription } from "../../webhooks/paypal";

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const subscriptionsRouter = createTRPCRouter({
  getStatus: publicProcedure.query(async ({ ctx }) => {
    const session = await getSession(ctx);
    
    if (!session) {
      return {
        hasSubscription: false,
        plan: null,
        status: null,
        expiresAt: null,
      };
    }

    const subscription = await subscriptionStorage.getSubscription(session.user.id);
    
    if (!subscription) {
      return {
        hasSubscription: false,
        plan: null,
        status: null,
        expiresAt: null,
      };
    }

    const isActive = await subscriptionStorage.checkSubscriptionActive(session.user.id);

    return {
      hasSubscription: isActive,
      plan: subscription.plan,
      status: subscription.status,
      expiresAt: subscription.expiresAt.toISOString(),
      startedAt: subscription.startedAt.toISOString(),
    };
  }),

  // Activation is intentionally not exposed as a client mutation.
  // Only verified payment-provider webhooks may grant subscription access.
  activate: publicProcedure
    .input(
      z.object({
        plan: z.enum(['monthly', 'yearly']),
        stripeCustomerId: z.string().optional(),
        stripeSubscriptionId: z.string().optional(),
      })
    )
    .mutation(async () => {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Subscription activation requires a verified payment-provider webhook.',
      });
    }),

  cancel: publicProcedure.mutation(async ({ ctx }) => {
    const session = await getSession(ctx);
    
    if (!session) {
      throw new Error('You must be logged in to cancel a subscription');
    }

    const success = await subscriptionStorage.cancelSubscription(session.user.id);

    if (!success) {
      throw new Error('No active subscription found');
    }

    return { success: true, message: 'Subscription cancelled successfully' };
  }),

  createPayPalCheckout: publicProcedure
    .input(z.object({ plan: z.enum(['monthly', 'yearly']) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSession(ctx);
      if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to subscribe.' });
      }
      try {
        return await createPayPalSubscription(session.user.id, session.user.email, input.plan);
      } catch {
        console.error('PayPal checkout could not be created');
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'PayPal checkout is not configured or could not be created. Please contact support.',
        });
      }
    }),

  createCheckoutSession: publicProcedure
    .input(
      z.object({
        plan: z.enum(['monthly', 'yearly']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getSession(ctx);
      
      if (!session) {
        throw new Error('You must be logged in to subscribe');
      }

      const priceId = input.plan === "monthly"
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID;
      const successUrl = process.env.STRIPE_SUCCESS_URL;
      const cancelUrl = process.env.STRIPE_CANCEL_URL;

      if (!stripeClient || !priceId || !successUrl || !cancelUrl) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Stripe checkout requires STRIPE_SECRET_KEY, both plan price IDs, STRIPE_SUCCESS_URL, and STRIPE_CANCEL_URL.",
        });
      }

      const checkout = await stripeClient.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: session.user.id,
        customer_email: session.user.email || undefined,
        metadata: { userId: session.user.id, plan: input.plan },
        subscription_data: {
          metadata: { userId: session.user.id, plan: input.plan },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe did not return a checkout URL.",
        });
      }

      return { checkoutUrl: checkout.url, sessionId: checkout.id };
    }),
});
