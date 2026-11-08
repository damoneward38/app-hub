# Environment Variables Setup Guide

This guide explains how to configure environment variables for production deployment.

---

## Overview

Your application uses environment variables for configuration. These are automatically injected by Manus for some values, and you need to provide others.

### Auto-Injected by Manus (No Action Needed)
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint
- `BUILT_IN_FORGE_API_KEY` - Manus API key
- `VITE_FRONTEND_FORGE_API_URL` - Frontend API endpoint
- `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key
- `JWT_SECRET` - Session signing key
- `OAUTH_SERVER_URL` - OAuth server URL
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL
- `VITE_APP_ID` - OAuth app ID
- `OWNER_NAME` - Owner name
- `OWNER_OPEN_ID` - Owner OAuth ID

---

## Required Configuration

### 1. Google Maps (Required for Map Component)

**Get your Map ID:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Go to Credentials → Create API Key
5. Create a Map ID in Maps Management
6. Copy the Map ID

**Set in environment:**
```bash
VITE_GOOGLE_MAPS_ID=your_map_id_here
```

### 2. Database (Required)

**Setup MySQL/TiDB database:**
1. Create a database instance
2. Get connection string
3. Set environment variable:

```bash
DATABASE_URL=mysql://username:password@host:3306/database_name
```

**Connection string format:**
```
mysql://user:password@host:port/database
```

### 3. Analytics (Optional but Recommended)

**Setup analytics tracking:**
```bash
VITE_ANALYTICS_WEBSITE_ID=your_website_id
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
```

---

## Optional Configuration

### PayPal Integration

For subscription payments:

```bash
PAYPAL_MODE=production
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret
```

**Get credentials:**
1. Go to [PayPal Developer](https://developer.paypal.com)
2. Create app in Sandbox
3. Switch to Live
4. Copy Client ID and Secret

### Stripe Integration

For alternative payment processing:

```bash
STRIPE_PUBLIC_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
```

**Get credentials:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to API Keys
3. Copy Live keys (not Test keys)

### Email Service

For sending emails:

```bash
SENDGRID_API_KEY=your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

---

## Feature Flags

Enable/disable features:

```bash
ENABLE_TIPS=true              # Allow user tips
ENABLE_ADS=true               # Show ads to free users
ENABLE_PREMIUM=true           # Premium subscription
ENABLE_ARTIST_UPLOADS=true    # Artist upload feature
```

---

## Security Configuration

### CORS Settings

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true
```

### Rate Limiting

```bash
RATE_LIMIT_REQUESTS=100       # Requests per window
RATE_LIMIT_WINDOW_MS=60000    # Time window in ms
```

---

## Deployment Steps

### 1. Create .env.production

```bash
cp .env.production.example .env.production
```

### 2. Fill in Required Values

Edit `.env.production` and add:
- `VITE_GOOGLE_MAPS_ID`
- `DATABASE_URL`
- Optional: PayPal, Stripe, Analytics keys

### 3. Verify Configuration

```bash
# Check all required variables are set
pnpm run check-env

# Or manually verify:
grep -E "VITE_GOOGLE_MAPS_ID|DATABASE_URL" .env.production
```

### 4. Build for Production

```bash
pnpm run build
```

### 5. Deploy

Push to GitHub and deploy via Manus Management UI.

---

## Troubleshooting

### Map not showing
- Check `VITE_GOOGLE_MAPS_ID` is set correctly
- Verify Maps API is enabled in Google Cloud
- Check browser console for errors

### Database connection failed
- Verify `DATABASE_URL` format
- Check database is running and accessible
- Verify username/password
- Check firewall rules

### OAuth not working
- Verify `VITE_APP_ID` matches your app
- Check `OAUTH_SERVER_URL` is correct
- Clear browser cookies and try again

### PayPal errors
- Verify you're using Live credentials (not Sandbox)
- Check `PAYPAL_MODE=production`
- Verify credentials are correct

---

## Environment Variable Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `VITE_GOOGLE_MAPS_ID` | string | Yes | Google Maps ID |
| `DATABASE_URL` | string | Yes | MySQL connection string |
| `PAYPAL_MODE` | string | No | `production` or `sandbox` |
| `PAYPAL_CLIENT_ID` | string | No | PayPal client ID |
| `PAYPAL_SECRET` | string | No | PayPal secret |
| `STRIPE_PUBLIC_KEY` | string | No | Stripe public key |
| `STRIPE_SECRET_KEY` | string | No | Stripe secret key |
| `SENDGRID_API_KEY` | string | No | SendGrid API key |
| `ENABLE_TIPS` | boolean | No | Enable tips feature |
| `ENABLE_ADS` | boolean | No | Enable ads |
| `ENABLE_PREMIUM` | boolean | No | Enable premium tier |

---

## Security Best Practices

1. **Never commit `.env.production`** - Add to `.gitignore`
2. **Use strong secrets** - Min 32 characters for JWT_SECRET
3. **Rotate keys regularly** - Change API keys every 90 days
4. **Use separate credentials** - Different keys for each environment
5. **Monitor access** - Check API usage regularly
6. **Enable 2FA** - On all provider accounts (Google, PayPal, Stripe)

---

## Support

For issues with environment setup:
1. Check the troubleshooting section above
2. Review provider documentation
3. Contact Manus support at https://help.manus.im

