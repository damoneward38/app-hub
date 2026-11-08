import fs from "node:fs";
import path from "node:path";

const root = "/Users/davidyoung/GitHub-Pull/RORK-APPS/rork-bot-router-server/expo";
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const checks = [];
const check = (name, ok) => checks.push({ name, ok: Boolean(ok) });

const paypal = read("backend/webhooks/paypal.ts");
const hono = read("backend/hono.ts");
const subs = read("backend/trpc/routes/subscriptions.ts");
const screen = read("app/(tabs)/subscription.tsx");
const admin = read("backend/config/admin.ts");
const auth = read("backend/trpc/middleware/auth.ts");
const authContext = read("lib/auth-context.tsx");
const adminRouter = read("backend/trpc/routes/admin.ts");
const profile = read("app/(tabs)/profile.tsx");

check("PayPal signature verification occurs before subscription writes", paypal.indexOf("verifyPayPalWebhook(body, headers)") < paypal.indexOf("subscriptionStorage.createSubscription("));
check("Webhook ID is required", paypal.includes("if (!webhookId) throw"));
check("All five PayPal signature headers are forwarded", ["transmission-id", "transmission-time", "transmission-sig", "cert-url", "auth-algo"].every((x) => hono.includes("paypal-" + x)));
check("Webhook payload/signature is not logged", !paypal.includes("JSON.stringify(body") && !hono.includes("JSON.stringify(body"));
check("Server creates PayPal subscriptions", paypal.includes("/v1/billing/subscriptions") && subs.includes("createPayPalCheckout"));
check("Monthly and yearly plan IDs are separate", paypal.includes("PAYPAL_MONTHLY_PLAN_ID") && paypal.includes("PAYPAL_YEARLY_PLAN_ID"));
check("Subscription UI has no fixed hosted-button ID", !screen.includes("RZ6JJ8TEBWD2W") && screen.includes("createPayPalCheckout"));
check("Monthly and yearly controls call matching plan", screen.includes('handleSubscribe("monthly")') && screen.includes('handleSubscribe("yearly")'));
check("Admin login token is signed", admin.includes("createHmac('sha256'") && auth.includes("verifyAdminSessionToken(token)"));
check("Admin session expires and secret has minimum length", admin.includes("exp:") && admin.includes("ADMIN_SESSION_SECRET.length < 32"));
check("Admin login is server-validated", hono.includes("/api/auth/admin-login") && authContext.includes("/api/auth/admin-login"));
check("Client does not store email:password token", !authContext.includes("email + ':' + passcode") && !authContext.includes("adminToken.includes(':')"));
check("Destructive admin action requires admin session", adminRouter.includes("requireAuth(ctx, true)") && !adminRouter.includes("passcode: z.string()"));
check("Profile no longer extracts raw admin password from token", !profile.includes("authToken.split(':')") && !profile.includes("storedPasscode"));
check("PayPal/server secret template exists", fs.existsSync(path.join(root, ".env.security.example")));

for (const c of checks) console.log((c.ok ? "PASS" : "FAIL") + " | " + c.name);
console.log("RESULT=" + checks.filter((c) => c.ok).length + "/" + checks.length);
if (checks.some((c) => !c.ok)) process.exitCode = 1;
