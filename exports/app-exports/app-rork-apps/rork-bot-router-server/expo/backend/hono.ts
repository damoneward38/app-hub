import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { handleStripeWebhook } from "./webhooks/stripe";
import { handlePayPalWebhook } from "./webhooks/paypal";
import { createAdminSessionToken } from "./config/admin";

const app = new Hono();

app.use("*", cors());

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`❌ tRPC error on ${path}:`, error);
    },
  }),
);

app.post("/api/auth/admin-login", async (c) => {
  try {
    const body = await c.req.json() as { email?: string; password?: string };
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    const token = createAdminSessionToken(body.email, body.password);
    if (!token) return c.json({ error: 'Invalid credentials or admin session secret is not configured' }, 401);
    return c.json({ token, user: { id: 'admin', email: body.email, isAdmin: true } });
  } catch {
    return c.json({ error: 'Admin login failed' }, 400);
  }
});

app.post("/api/webhooks/stripe", async (c) => {
  const signature = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  try {
    const result = await handleStripeWebhook(body, signature);
    return c.json(result);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 400);
  }
});

app.post("/api/webhooks/paypal", async (c) => {
  try {
    const body = await c.req.json();
    const result = await handlePayPalWebhook(body, {
      transmissionId: c.req.header('paypal-transmission-id'),
      transmissionTime: c.req.header('paypal-transmission-time'),
      transmissionSig: c.req.header('paypal-transmission-sig'),
      certUrl: c.req.header('paypal-cert-url'),
      authAlgo: c.req.header('paypal-auth-algo'),
    });
    if (!result.ok) return c.json({ error: result.error }, 400);
    return c.json(result);
  } catch (error) {
    // Do not log payloads, signatures, access tokens, or customer data.
    console.error('PayPal webhook processing failed');
    return c.json({ error: 'Webhook processing failed' }, 400);
  }
});

app.get("/", (c) => {
  console.log('✅ Health check endpoint hit');
  return c.json({ 
    status: "ok", 
    message: "Music Release API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: '/api/trpc',
      stripe_webhook: '/api/webhooks/stripe',
      paypal_webhook: '/api/webhooks/paypal'
    }
  });
});

app.get("/api/test", (c) => {
  console.log('🧪 Test endpoint hit');
  return c.json({ 
    ok: true,
    message: "Basic routing works!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/trpc", (c) => {
  console.log('🔍 tRPC GET endpoint hit (should be handled by trpcServer)');
  return c.json({ 
    error: "This should be handled by tRPC",
    note: "If you see this, tRPC routing may not be working"
  });
});

export default app;
