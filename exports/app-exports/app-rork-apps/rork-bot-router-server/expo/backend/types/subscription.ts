export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: Date;
  expiresAt: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paypalEmail?: string;
  paypalBillingAgreementId?: string;
}
