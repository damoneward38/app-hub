import * as subscriptionStorage from '../storage/subscriptions';

interface PayPalWebhookEvent {
  id?: string;
  event_type: string;
  resource?: {
    id?: string;
    plan_id?: string;
    status?: string;
    payer?: { payer_info?: { email?: string }; email_address?: string };
    custom_id?: string;
    billing_agreement_id?: string;
    subscription_id?: string;
  };
}

type PayPalHeaders = {
  transmissionId?: string;
  transmissionTime?: string;
  transmissionSig?: string;
  certUrl?: string;
  authAlgo?: string;
};

function paypalApiBase() {
  return process.env.PAYPAL_ENVIRONMENT === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal server credentials are not configured');

  const basic = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  const response = await fetch(paypalApiBase() + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error('PayPal OAuth failed with HTTP ' + response.status);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error('PayPal OAuth response did not contain an access token');
  return data.access_token;
}

export async function createPayPalSubscription(userId: string, email: string | undefined, plan: 'monthly' | 'yearly') {
  const planId = plan === 'monthly'
    ? process.env.PAYPAL_MONTHLY_PLAN_ID
    : process.env.PAYPAL_YEARLY_PLAN_ID;
  const returnUrl = process.env.PAYPAL_RETURN_URL;
  const cancelUrl = process.env.PAYPAL_CANCEL_URL;
  if (!planId || !returnUrl || !cancelUrl) {
    throw new Error('PayPal subscription plan IDs and return/cancel URLs must be configured server-side');
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(paypalApiBase() + '/v1/billing/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      subscriber: email ? { email_address: email } : undefined,
      application_context: {
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });
  if (!response.ok) throw new Error('PayPal subscription creation failed with HTTP ' + response.status);
  const created = await response.json() as {
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
  };
  const approvalUrl = created.links?.find((link) => link.rel === 'approve')?.href;
  if (!created.id || !approvalUrl) throw new Error('PayPal did not return a subscription ID and approval URL');
  return { subscriptionId: created.id, approvalUrl };
}

async function verifyPayPalWebhook(event: PayPalWebhookEvent, headers: PayPalHeaders) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error('PAYPAL_WEBHOOK_ID is not configured');
  const values = [headers.transmissionId, headers.transmissionTime, headers.transmissionSig, headers.certUrl, headers.authAlgo];
  if (values.some((value) => !value)) return false;

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(paypalApiBase() + '/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
  if (!response.ok) throw new Error('PayPal signature verification API failed with HTTP ' + response.status);
  const result = await response.json() as { verification_status?: string };
  return result.verification_status === 'SUCCESS';
}

export async function handlePayPalWebhook(body: PayPalWebhookEvent, headers: PayPalHeaders) {
  if (!body?.event_type || !body.id) return { ok: false, error: 'Invalid PayPal webhook event' };

  // Never mutate subscriptions until PayPal confirms the event signature.
  if (!(await verifyPayPalWebhook(body, headers))) {
    return { ok: false, error: 'PayPal webhook signature verification failed' };
  }

  const resource = body.resource;
  const eventType = body.event_type;

  if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const userId = resource?.custom_id;
    const subscriptionId = resource?.id;
    if (!userId || !subscriptionId) {
      return { ok: false, error: 'Verified activation event is missing user or subscription ID' };
    }
    const existing = await subscriptionStorage.getSubscription(userId);
    if (existing?.paypalBillingAgreementId === subscriptionId && existing.status === 'active') {
      return { ok: true, verified: true, duplicate: true };
    }
    const plan = resource?.plan_id && resource.plan_id === process.env.PAYPAL_YEARLY_PLAN_ID
      ? 'yearly'
      : 'monthly';
    await subscriptionStorage.createSubscription(
      userId,
      plan,
      undefined,
      undefined,
      undefined,
      subscriptionId,
    );
    return { ok: true, verified: true };
  }

  if (
    eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
    eventType === 'BILLING.SUBSCRIPTION.EXPIRED'
  ) {
    const userId = resource?.custom_id;
    if (!userId) return { ok: false, error: 'Verified subscription event is missing custom user ID' };
    const existing = await subscriptionStorage.getSubscription(userId);
    if (existing && existing.status !== 'cancelled') {
      await subscriptionStorage.cancelSubscription(userId);
    }
    return { ok: true, verified: true };
  }

  // One-time order/payment events never activate recurring access in this handler.
  return { ok: true, verified: true, ignored: true };
}
