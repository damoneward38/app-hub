import { db } from "../db";
import { contentMasterPurchases } from "../../drizzle/schema";
import { completeBotSubscription, cancelBotSubscription } from "../../../services/botCheckout";

type PayPalHeaders = {
  transmissionId?: string | null;
  transmissionTime?: string | null;
  transmissionSig?: string | null;
  certUrl?: string | null;
  authAlgo?: string | null;
};

async function verifyPayPalWebhook(event: any, headers: PayPalHeaders) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!clientId || !clientSecret || !webhookId) throw new Error("PayPal webhook verification is not configured");
  if (![headers.transmissionId, headers.transmissionTime, headers.transmissionSig, headers.certUrl, headers.authAlgo].every(Boolean)) return false;

  const apiBase = process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
  const tokenResponse = await fetch(apiBase + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenResponse.ok) throw new Error("PayPal OAuth failed with HTTP " + tokenResponse.status);
  const tokenData = await tokenResponse.json() as { access_token?: string };
  if (!tokenData.access_token) throw new Error("PayPal access token missing");

  const verifyResponse = await fetch(apiBase + "/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: { Authorization: "Bearer " + tokenData.access_token, "Content-Type": "application/json" },
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
  if (!verifyResponse.ok) throw new Error("PayPal signature verification failed with HTTP " + verifyResponse.status);
  const result = await verifyResponse.json() as { verification_status?: string };
  return result.verification_status === "SUCCESS";
}

export async function handlePayPalWebhook(event: any, headers: PayPalHeaders) {
  if (!event?.id || !event?.event_type) return { ok: false, error: "Invalid PayPal event" };
  if (!(await verifyPayPalWebhook(event, headers))) return { ok: false, error: "PayPal signature verification failed" };
  if (!db) throw new Error("DB not initialized");

  if (event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
    const parts = String(event.resource?.custom_id || "").split(":");
    const userId = parts[0];
    const botId = Number(parts[1]);
    const subscriptionType = parts[2];
    const subscriptionId = String(event.resource?.id || "");
    if (!userId || !Number.isSafeInteger(botId) || botId <= 0 || !subscriptionId || !["monthly", "yearly"].includes(subscriptionType)) {
      return { ok: false, error: "Subscription metadata is invalid" };
    }
    await completeBotSubscription(userId, botId, subscriptionId, subscriptionType as "monthly" | "yearly");
  } else if (
    event.event_type === "BILLING.SUBSCRIPTION.CANCELLED" ||
    event.event_type === "BILLING.SUBSCRIPTION.SUSPENDED" ||
    event.event_type === "BILLING.SUBSCRIPTION.EXPIRED"
  ) {
    const parts = String(event.resource?.custom_id || "").split(":");
    const userId = parts[0];
    const botId = Number(parts[1]);
    if (userId && Number.isSafeInteger(botId) && botId > 0) await cancelBotSubscription(userId, botId);
  } else if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const purchase = event.resource;
    await db.insert(contentMasterPurchases).values({
      userId: Number(purchase.custom_id),
      planType: purchase.description,
      amount: Number(purchase.amount.value),
      status: "completed",
      createdAt: new Date(),
    });
  }

  return { ok: true, verified: true };
}
