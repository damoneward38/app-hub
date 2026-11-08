# Stripe Payment Integration Guide

This project includes a demo subscription system. To integrate real Stripe payments:

## Setup Instructions

### 1. Install Stripe SDK
```bash
npm install stripe @stripe/stripe-js
```

### 2. Add Environment Variables
Add these to your `.env` file:
```
STRIPE_SECRET_KEY=sk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Update Backend Routes

In `backend/trpc/routes/subscriptions.ts`, replace the demo checkout with real Stripe:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Update createCheckoutSession mutation:
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

    const priceId = input.plan === 'monthly' 
      ? 'price_monthly_id' // Replace with your Stripe price ID
      : 'price_yearly_id';  // Replace with your Stripe price ID

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.APP_URL}/subscription?canceled=true`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        plan: input.plan,
      },
    });

    return {
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    };
  }),
```

### 4. Add Webhook Handler

Create `backend/webhooks/stripe.ts`:

```typescript
import Stripe from 'stripe';
import { createSubscription, cancelSubscription } from '../storage/subscriptions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function handleStripeWebhook(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as 'monthly' | 'yearly';
      
      if (userId && plan) {
        createSubscription(
          userId,
          plan,
          session.customer as string,
          session.subscription as string
        );
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        cancelSubscription(userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.error('Payment failed for:', invoice.customer);
      break;
    }
  }

  return { received: true };
}
```

### 5. Add Webhook Route to Hono

In `backend/hono.ts`:

```typescript
import { handleStripeWebhook } from './webhooks/stripe';

app.post('/api/webhooks/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400);
  }

  try {
    const result = await handleStripeWebhook(body, signature);
    return c.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 400);
  }
});
```

### 6. Update Frontend to Open Stripe Checkout

In `app/(tabs)/subscription.tsx`, update the checkout mutation success handler:

```typescript
const checkoutMutation = trpc.subscriptions.createCheckoutSession.useMutation({
  onSuccess: (data) => {
    // For web: redirect to Stripe checkout
    if (Platform.OS === 'web') {
      window.location.href = data.checkoutUrl!;
    } else {
      // For mobile: open in-app browser or use Stripe mobile SDK
      Linking.openURL(data.checkoutUrl!);
    }
  },
  onError: (error) => {
    Alert.alert("Error", error.message || "Failed to create checkout session");
  },
});
```

## Stripe Dashboard Setup

1. Go to https://dashboard.stripe.com
2. Create two products:
   - Monthly Subscription ($9.99/month)
   - Yearly Subscription ($99.99/year)
3. Copy the price IDs and add them to step 3 above
4. Set up webhook endpoint pointing to: `https://your-domain.com/api/webhooks/stripe`
5. Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Decline: `4000 0000 0000 9995`

## Current Demo Mode

The app currently runs in demo mode with simulated payments. To activate a subscription:
1. Go to Subscription tab
2. Select a plan
3. Click Subscribe
4. Click "Simulate Success" in the alert

This will activate a real subscription without requiring payment integration.
