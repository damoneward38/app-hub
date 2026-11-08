# Rork Bot Router — PayPal Checkout and Login Security

- Audit date: 2026-10-15
- Source project: /Users/davidyoung/GitHub-Pull/RORK-APPS/rork-bot-router-server/expo
- Repeatable static check: /Users/davidyoung/app-containers-hub/scripts/verify-rork-security.mjs
- Latest result: 15/15 static assertions pass; Git diff whitespace check passes.
- TypeScript compilation, package build, app/browser interaction tests, and live/sandbox PayPal transactions remain unverified because this source tree has no local node_modules and its local environment does not contain PayPal server configuration.

## Implemented in source

### PayPal
- Replaced the fixed PayPal hosted-button URL in the subscription screen with an authenticated backend call.
- Backend creates a PayPal subscription using the selected monthly/yearly plan ID and returns the provider approval URL.
- Added PayPal REST API OAuth and signature-verification calls.
- Webhook handler now requires all five PayPal transmission headers and a configured webhook registration ID. Subscription mutations occur only after PayPal reports signature verification SUCCESS.
- Handles subscription activation/cancellation/suspension/expiry events, maps the yearly plan using the configured yearly plan ID, and avoids resetting the term for a duplicate active subscription event.
- Removed logging of webhook payloads and customer details.
- Added .env.paypal.example and .env.security.example templates containing variable names only; no secret values were inserted.

### Login and admin security
- Replaced the device-stored email:password admin token with a server-validated login endpoint.
- Admin login now issues an HMAC-signed session token that expires after eight hours.
- Token validation fails closed unless ADMIN_SESSION_SECRET is configured with at least 32 characters.
- Removed raw admin credential extraction from the profile screen.
- Destructive admin release-clearing action now requires the signed admin session on the server.
- Supabase bearer tokens continue to be validated server-side for customer sessions.

## Required configuration before runtime activation

The local Rork env.local contains Supabase variable names but no PayPal, admin email/password, or admin session-secret variable names. No secret values were read or copied.

Configure these only in the backend deployment's secret store:
- ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET (32+ random characters)
- PAYPAL_ENVIRONMENT
- PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
- PAYPAL_WEBHOOK_ID matching the exact PayPal REST app/environment and webhook registration
- PAYPAL_MONTHLY_PLAN_ID, PAYPAL_YEARLY_PLAN_ID
- PAYPAL_RETURN_URL, PAYPAL_CANCEL_URL

Use sandbox credentials and plans first. Do not enable live payments until checkout approval, webhook signature verification, duplicate-event behavior, cancellation, and database persistence all pass.

## All-app rollout

Static triage report: reports/shared-paypal-login-rollout-2026-10-15.md. It covers 50 local AI Studio source folders and identifies source-level auth/payment/backend markers. It does not certify those projects as secure.

The same PayPal service cannot be safely activated in static exports by placing secrets in client code. A shared, deployed backend and a common identity strategy are needed for the remaining apps. The local scan did not find PayPal environment files in the AI Studio source folders; the Rork source's existing PayPal path was a hard-coded hosted button, not a reusable server-side credentials integration.

## Backups

Pre-fix snapshots are under /Users/davidyoung/app-containers-hub/backups/ with prefixes:
- rork-paypal-webhook-before-fix-
- rork-paypal-checkout-before-fix-
- rork-admin-auth-before-fix-

Each snapshot preserves the files before that change set.

## Additional PayPal source discovered

- KHI contains a PayPal SDK Client ID in static HTML. That is a public SDK identifier, not a server-side Client Secret, and is not sufficient for REST subscription creation or webhook signature verification.
- Gifted Bot Store's bot subscription checkout returned a mock URL and its webhook handler accepted unverified events. Source changes now call PayPal's Subscriptions API using server-side plan IDs, block client-side subscription activation, verify PayPal webhook signatures before processing, and guard duplicate subscription inserts. Static assertions: 7/7 pass.
- Gifted Bot Store cannot be build-tested from the current local tree: no package.json or db.ts was found even though source imports reference database modules. Its separate Content Master payment service still generates a fabricated approval URL and remains blocked pending a real checkout implementation.
