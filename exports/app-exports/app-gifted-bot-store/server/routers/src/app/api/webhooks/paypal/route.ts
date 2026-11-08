import { handlePayPalWebhook } from "@/server/webhooks/paypal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await handlePayPalWebhook(body, {
      transmissionId: req.headers.get("paypal-transmission-id"),
      transmissionTime: req.headers.get("paypal-transmission-time"),
      transmissionSig: req.headers.get("paypal-transmission-sig"),
      certUrl: req.headers.get("paypal-cert-url"),
      authAlgo: req.headers.get("paypal-auth-algo"),
    });
    if (!result.ok && result.error) return Response.json({ error: result.error }, { status: 400 });
    return Response.json({ ok: true, verified: true });
  } catch {
    return Response.json({ error: "PayPal webhook processing failed" }, { status: 400 });
  }
}
