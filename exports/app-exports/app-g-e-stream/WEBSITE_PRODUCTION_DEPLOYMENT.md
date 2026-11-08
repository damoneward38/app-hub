# Website Production Deployment Guide
**Gifted Eternity Streaming Platform**

## Overview

Complete guide for deploying the Gifted Eternity website to production.

---

## 1. Pre-Deployment Checklist

### Code Quality

```
✅ All tests passing
✅ No TypeScript errors
✅ No console warnings
✅ Code reviewed
✅ Security scan passed
✅ Performance optimized
✅ Accessibility verified
✅ Mobile responsive
```

### Infrastructure

```
✅ Database configured
✅ S3 buckets created
✅ CDN configured
✅ SSL certificates installed
✅ DNS records configured
✅ Email service configured
✅ Payment gateway configured
✅ Monitoring setup
```

### Documentation

```
✅ Deployment runbook created
✅ Rollback procedure documented
✅ Environment variables documented
✅ API documentation complete
✅ User guide created
✅ Admin guide created
✅ Troubleshooting guide created
```

---

## 2. Production Environment Setup

### Environment Variables

```bash
# .env.production

# Application
NODE_ENV=production
VITE_APP_TITLE=Gifted Eternity
VITE_APP_LOGO=https://cdn.giftedeternitystudio.com/logo.png

# Database
DATABASE_URL=mysql://user:password@prod-db.rds.amazonaws.com:3306/gifted_eternity

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=gifted-eternity-music
CDN_DOMAIN=cdn.giftedeternitystudio.com

# Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_SECRET=your_secret

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Monitoring
NEW_RELIC_LICENSE_KEY=your_key
SENTRY_DSN=your_dsn

# Security
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://giftedeternitystudio.com
```

### Database Migration

```bash
# 1. Create production database
mysql -h prod-db.rds.amazonaws.com -u admin -p -e "CREATE DATABASE gifted_eternity;"

# 2. Run migrations
pnpm db:push

# 3. Seed initial data
pnpm db:seed

# 4. Verify schema
mysql -h prod-db.rds.amazonaws.com -u admin -p gifted_eternity -e "SHOW TABLES;"
```

---

## 3. Build & Deployment

### Build Process

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build frontend
pnpm build

# 3. Build backend
pnpm build:server

# 4. Run tests
pnpm test

# 5. Security scan
pnpm audit

# 6. Create artifacts
tar -czf gifted-eternity-prod.tar.gz dist/ server/ node_modules/
```

### Deployment Options

#### Option 1: AWS Elastic Beanstalk

```bash
# 1. Initialize EB
eb init -p "Node.js 20 running on 64bit Amazon Linux 2" gifted-eternity

# 2. Create environment
eb create production --instance-type t3.medium

# 3. Deploy
eb deploy

# 4. Monitor
eb status
eb logs
```

#### Option 2: Docker + ECS

```dockerfile
# Dockerfile

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

```bash
# Build and push image
docker build -t gifted-eternity:latest .
docker tag gifted-eternity:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/gifted-eternity:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/gifted-eternity:latest

# Deploy to ECS
aws ecs update-service --cluster production --service gifted-eternity --force-new-deployment
```

#### Option 3: Vercel/Netlify

```bash
# Connect repository
vercel link

# Configure environment
vercel env add DATABASE_URL
vercel env add STRIPE_SECRET_KEY

# Deploy
vercel --prod
```

---

## 4. DNS & SSL Configuration

### Route 53 Setup

```
Domain: giftedeternitystudio.com

Records:
- A record: Points to CloudFront distribution
- CNAME: www -> giftedeternitystudio.com
- MX record: Email routing
- TXT record: SPF, DKIM, DMARC
```

### SSL Certificate

```bash
# Request certificate from AWS Certificate Manager
aws acm request-certificate \
  --domain-name giftedeternitystudio.com \
  --subject-alternative-names www.giftedeternitystudio.com \
  --validation-method DNS

# Verify domain ownership
# Add DNS CNAME records provided by ACM

# Attach to CloudFront
aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json
```

---

## 5. CDN Configuration

### CloudFront Distribution

```
Origin: Application Load Balancer
Domain: api.giftedeternitystudio.com

Behaviors:
1. /api/* -> Origin (no cache)
2. /static/* -> S3 (cache 1 year)
3. /music/* -> S3 (cache 1 day)
4. /* -> Origin (cache 5 minutes)

Security:
- HTTPS only
- TLS 1.2+
- Security headers
- WAF rules
```

### Cache Headers

```
Static Assets:
Cache-Control: public, max-age=31536000, immutable

API Responses:
Cache-Control: private, no-cache, no-store

Music Files:
Cache-Control: public, max-age=86400
```

---

## 6. Load Balancing

### Application Load Balancer

```
Configuration:
- Listener: HTTPS:443
- Target Group: EC2 instances
- Health Check: /api/trpc/health.check
- Stickiness: Enabled (1 day)
- Deregistration Delay: 30 seconds
```

### Auto Scaling

```
Min Instances: 2
Max Instances: 10
Target CPU: 70%
Target Memory: 80%

Scaling Policies:
- Scale up: CPU > 80% for 2 minutes
- Scale down: CPU < 40% for 5 minutes
```

---

## 7. Deployment Process

### Blue-Green Deployment

```
1. Deploy to Green Environment
   - New instances launched
   - Database migrations run
   - Tests executed
   - Health checks verified

2. Smoke Testing
   - API endpoints tested
   - Database connectivity verified
   - Payment processing tested
   - File storage tested

3. Traffic Switch
   - Route 53 updated
   - Traffic redirected to Green
   - Monitor metrics

4. Cleanup
   - Blue environment stopped
   - Backups retained
   - Logs archived
```

### Deployment Script

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "Starting production deployment..."

# 1. Build
echo "Building application..."
pnpm install --frozen-lockfile
pnpm build
pnpm build:server

# 2. Test
echo "Running tests..."
pnpm test

# 3. Security scan
echo "Running security scan..."
pnpm audit

# 4. Create backup
echo "Creating database backup..."
./backup-database.sh

# 5. Deploy
echo "Deploying to production..."
eb deploy --staged

# 6. Verify
echo "Verifying deployment..."
./verify-deployment.sh

# 7. Notify
echo "Notifying team..."
curl -X POST $SLACK_WEBHOOK -d '{"text":"Production deployment completed successfully"}'

echo "Deployment completed!"
```

---

## 8. Monitoring Post-Deployment

### Health Checks

```bash
# Check application health
curl https://api.giftedeternitystudio.com/api/trpc/health.check

# Check database
curl https://api.giftedeternitystudio.com/api/trpc/db.health.check

# Check S3 connectivity
curl https://api.giftedeternitystudio.com/api/trpc/storage.health.check

# Check payment gateway
curl https://api.giftedeternitystudio.com/api/trpc/payment.health.check
```

### Metrics to Monitor

```
First 24 Hours:
- Error rate (target: < 0.1%)
- Response time (target: < 200ms)
- Database connections (target: < 50)
- Memory usage (target: < 80%)
- CPU usage (target: < 70%)

First Week:
- User signups
- Payment success rate
- Music streams
- API usage
- Performance trends
```

---

## 9. Rollback Procedure

### Quick Rollback

```bash
#!/bin/bash
# rollback-deployment.sh

echo "Initiating rollback..."

# 1. Revert DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://rollback-dns.json

# 2. Stop new instances
aws ec2 terminate-instances --instance-ids i-xxxxx

# 3. Start old instances
aws ec2 start-instances --instance-ids i-yyyyy

# 4. Verify
curl https://api.giftedeternitystudio.com/api/trpc/health.check

echo "Rollback completed!"
```

### Database Rollback

```bash
# 1. Restore from backup
mysql -h prod-db.rds.amazonaws.com -u admin -p gifted_eternity < backup.sql

# 2. Verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM music;

# 3. Restart application
eb deploy --staged
```

---

## 10. Post-Deployment

### Team Communication

```
Deployment Notification:
- Slack: #deployments channel
- Email: team@giftedeternitystudio.com
- Status Page: https://status.giftedeternitystudio.com

Format:
- Deployment time
- Changes deployed
- Performance metrics
- Known issues
- Rollback plan
```

### Documentation Updates

```
Update:
- Deployment log
- Change log
- Known issues
- Performance baseline
- Incident reports
```

---

## 11. Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security scan passed
- [ ] Database backed up
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] DNS records configured
- [ ] CDN configured
- [ ] Load balancer configured
- [ ] Auto scaling configured
- [ ] Monitoring setup
- [ ] Deployment script tested
- [ ] Rollback procedure tested
- [ ] Team trained
- [ ] Stakeholders notified
- [ ] Deployment window scheduled

---

## 12. Timeline

```
T-1 Week: Deployment planning
T-1 Day: Final testing, team briefing
T-0: Deployment window (2-4 hours)
T+1 Hour: Health checks, smoke testing
T+4 Hours: Full monitoring, issue resolution
T+24 Hours: Performance analysis, optimization
```

---

## Conclusion

Website is ready for production deployment.

**Status: READY FOR PRODUCTION DEPLOYMENT** ✅

---

**Last Updated:** December 29, 2024
**Version:** 1.0
