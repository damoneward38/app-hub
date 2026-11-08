# PayPal Integration Setup

## Server-side environment

Configure these values in the backend secret manager/environment, not in Expo public variables or client code:

- PAYPAL_ENVIRONMENT: sandbox for tests; live only after sandbox verification.
- PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET: PayPal REST app credentials for the selected environment.
- PAYPAL_WEBHOOK_ID: webhook registration ID for that same REST app/environment and the exact deployed webhook URL.
- PAYPAL_MONTHLY_PLAN_ID and PAYPAL_YEARLY_PLAN_ID: active PayPal subscription plan IDs with the intended pricing/currency.
- PAYPAL_RETURN_URL and PAYPAL_CANCEL_URL: HTTPS URLs controlled by this application.

## Checkout and webhook flow

1. An authenticated customer calls subscriptions.createPayPalCheckout with a monthly or yearly plan.
2. The backend creates the PayPal subscription with the authenticated user's ID in custom_id and returns only the PayPal approval URL and subscription ID.
3. The customer approves the subscription on PayPal.
4. PayPal posts to /api/webhooks/paypal.
5. The backend asks PayPal's verification endpoint to verify transmission headers and event using PAYPAL_WEBHOOK_ID. No subscription mutation happens unless verification reports SUCCESS.
6. Only BILLING.SUBSCRIPTION.ACTIVATED grants access. Cancellation, suspension, and expiry events revoke access. Duplicate activation events for an already active same subscription do not reset the subscription period.

## Required rollout checks

- Create matching sandbox plans and a webhook registration; subscribe to activated, cancelled, suspended, and expired events.
- Test approved, cancelled, invalid-signature, missing-header, duplicate-event, monthly, and yearly cases.
- Confirm database persistence works in the deployed environment; this project currently has an in-memory fallback that is not production-safe.
- Configure live credentials only in the deployment secret store after sandbox tests pass.
- Do not reuse one PAYPAL_WEBHOOK_ID across unrelated PayPal REST apps or environments; each registration must match the deployed app and endpoint.
