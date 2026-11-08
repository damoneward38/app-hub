import Stripe from 'stripe';
import * as subscriptionStorage from '../storage/subscriptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function handleStripeWebhook(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET not configured');
    throw new Error('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    throw new Error('Webhook signature verification failed');
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as 'monthly' | 'yearly';
      
      console.log('🎉 Checkout completed:', { userId, plan });
      
      if (userId && plan) {
        await subscriptionStorage.createSubscription(
          userId,
          plan,
          session.customer as string,
          session.subscription as string
        );
        console.log('✅ Subscription activated for user:', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      
      console.log('❌ Subscription deleted:', userId);
      
      if (userId) {
        subscriptionStorage.cancelSubscription(userId);
        console.log('✅ Subscription cancelled for user:', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      
      console.log('🔄 Subscription updated:', userId);
      
      if (userId && subscription.status === 'active') {
        const plan = subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly';
        subscriptionStorage.createSubscription(
          userId,
          plan,
          subscription.customer as string,
          subscription.id
        );
      } else if (userId && subscription.status === 'canceled') {
        subscriptionStorage.cancelSubscription(userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.error('💳 Payment failed for customer:', invoice.customer);
      break;
    }

    default:
      console.log('ℹ️ Unhandled webhook event:', event.type);
  }

  return { received: true };
}
