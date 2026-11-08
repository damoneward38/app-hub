/**
 * Content Master Payment Service - PayPal Integration
 * Handles $29/month and $299 lifetime subscriptions via PayPal
 */

import { db } from '../db';
import { contentMasterPurchases } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../_core/logger';

export interface ContentMasterPlan {
  id: 'monthly' | 'lifetime';
  name: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  description: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  sessionId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: 'monthly' | 'lifetime';
  status: 'active' | 'canceled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  paypalSubscriptionId?: string;
  paypalCustomerId?: string;
}

export const CONTENT_MASTER_PLANS: Record<string, ContentMasterPlan> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 29,
    currency: 'usd',
    interval: 'month',
    description: 'Full access to Content Master bot for one month',
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Plan',
    price: 299,
    currency: 'usd',
    description: 'Lifetime access to Content Master bot',
  },
};

export class ContentMasterPaymentService {
  /**
   * Create PayPal checkout session
   */
  async createCheckoutSession(
    userId: string,
    planId: 'monthly' | 'lifetime'
  ): Promise<CheckoutSession> {
    const plan = CONTENT_MASTER_PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    try {
      // Generate PayPal approval URL
      const approvalUrl = this.generatePayPalApprovalUrl(userId, planId, plan.price);

      return {
        id: `cm_${userId}_${planId}_${Date.now()}`,
        url: approvalUrl,
        sessionId: `cm_${userId}_${planId}_${Date.now()}`,
      };
    } catch (error) {
      logger.error('Failed to create PayPal checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Generate PayPal approval URL
   */
  private generatePayPalApprovalUrl(userId: string, planId: string, amount: number): string {
    const baseUrl = process.env.PAYPAL_API_URL || 'https://www.paypal.com/checkoutnow';
    const returnUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/content-master?success=true`;
    const cancelUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/content-master?canceled=true`;

    const params = new URLSearchParams({
      token: `cm_${userId}_${planId}`,
      amount: amount.toString(),
      currency: 'USD',
      description: `Content Master ${planId === 'monthly' ? 'Monthly' : 'Lifetime'} Plan`,
      returnUrl,
      cancelUrl,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Handle PayPal payment success
   */
  async handlePaymentSuccess(
    userId: string,
    planId: 'monthly' | 'lifetime',
    paypalSubscriptionId: string
  ): Promise<Subscription> {
    try {
      if (!db) throw new Error('Database unavailable');
      
      const now = new Date();
      const expiresAt = new Date();

      if (planId === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 100); // Lifetime
      }

      // Store in database
      await db
        .insert(contentMasterPurchases)
        .values({
          userId: parseInt(userId),
          planId,
          status: 'active',
          stripeSubscriptionId: paypalSubscriptionId, // Use this field for PayPal ID
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
        });

      logger.info(`Content Master purchase created for user ${userId}, plan ${planId}`);

      return {
        id: `cm_${userId}_${planId}`,
        userId,
        planId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt,
        paypalSubscriptionId,
      };
    } catch (error) {
      logger.error('Failed to handle payment success:', error);
      throw new Error('Failed to process payment');
    }
  }

  /**
   * Get user subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      if (!db) throw new Error('Database unavailable');
      
      const purchase = await db
        .select()
        .from(contentMasterPurchases)
        .where(
          and(
            eq(contentMasterPurchases.userId, parseInt(userId)),
            eq(contentMasterPurchases.status, 'active')
          )
        )
        .limit(1);

      if (!purchase.length) {
        return null;
      }

      const p = purchase[0];
      return {
        id: p.id.toString(),
        userId,
        planId: p.planId as 'monthly' | 'lifetime',
        status: p.status as 'active' | 'canceled' | 'expired',
        currentPeriodStart: p.currentPeriodStart,
        currentPeriodEnd: p.currentPeriodEnd,
        paypalSubscriptionId: p.stripeSubscriptionId || undefined,
      };
    } catch (error) {
      logger.error('Failed to get user subscription:', error);
      return null;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      const now = new Date();
      return subscription.currentPeriodEnd > now;
    } catch (error) {
      logger.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<Subscription> {
    try {
      if (!db) throw new Error('Database unavailable');
      
      const now = new Date();

      const updated = await db
        .update(contentMasterPurchases)
        .set({
          status: 'canceled',
          currentPeriodEnd: now,
          canceledAt: now,
        })
        .where(
          and(
            eq(contentMasterPurchases.userId, parseInt(userId)),
            eq(contentMasterPurchases.status, 'active')
          )
        );

      // Get the updated record
      const purchase = await db
        .select()
        .from(contentMasterPurchases)
        .where(eq(contentMasterPurchases.userId, parseInt(userId)))
        .limit(1);

      if (!purchase.length) {
        throw new Error('No subscription found');
      }

      const p = purchase[0];
      logger.info(`Content Master subscription canceled for user ${userId}`);

      return {
        id: p.id.toString(),
        userId,
        planId: p.planId as 'monthly' | 'lifetime',
        status: 'canceled',
        currentPeriodStart: p.currentPeriodStart,
        currentPeriodEnd: now,
        paypalSubscriptionId: p.stripeSubscriptionId || undefined,
        canceledAt: now,
      };
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlySubscriptions: number;
    lifetimeSubscriptions: number;
    totalRevenue: number;
  }> {
    try {
      if (!db) throw new Error('Database unavailable');
      
      const all = await db.select().from(contentMasterPurchases);

      const active = all.filter((p) => p.status === 'active' && p.currentPeriodEnd > new Date());
      const monthly = active.filter((p) => p.planId === 'monthly');
      const lifetime = active.filter((p) => p.planId === 'lifetime');

      // Calculate revenue based on plan type
      const revenue = all.reduce((sum, p) => {
        if (p.planId === 'monthly') {
          return sum + 29;
        } else {
          return sum + 299;
        }
      }, 0);

      return {
        totalSubscriptions: all.length,
        activeSubscriptions: active.length,
        monthlySubscriptions: monthly.length,
        lifetimeSubscriptions: lifetime.length,
        totalRevenue: revenue,
      };
    } catch (error) {
      logger.error('Failed to get subscription stats:', error);
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        monthlySubscriptions: 0,
        lifetimeSubscriptions: 0,
        totalRevenue: 0,
      };
    }
  }
}

export const paymentService = new ContentMasterPaymentService();
