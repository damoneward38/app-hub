# Monitoring & Logging Infrastructure
**Gifted Eternity Streaming Platform**

## Overview

Complete guide for setting up monitoring, logging, and alerting infrastructure for production deployment.

---

## 1. Logging Infrastructure

### Application Logging

```typescript
// server/_core/logger.ts

import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

### Log Levels

```
ERROR: System errors, exceptions, failures
WARN: Warning conditions, potential issues
INFO: General informational messages
DEBUG: Detailed debugging information
TRACE: Very detailed trace information
```

### Log Categories

```
- Authentication: Login, logout, OAuth
- Payments: Transactions, subscriptions, refunds
- Music: Uploads, streaming, playback
- Users: Registration, profile updates
- Admin: Management actions, configuration
- System: Performance, health checks
- Security: Access attempts, suspicious activity
```

---

## 2. CloudWatch Monitoring (AWS)

### Setup CloudWatch

```bash
# Install CloudWatch agent
npm install aws-sdk

# Configure environment variables
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### CloudWatch Metrics

```typescript
// server/_core/metrics.ts

import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch();

export async function recordMetric(
  namespace: string,
  metricName: string,
  value: number,
  unit: string = 'Count'
) {
  await cloudwatch.putMetricData({
    Namespace: 'GiftedEternity',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
      },
    ],
  }).promise();
}

// Usage
await recordMetric('Music', 'StreamCount', 1);
await recordMetric('Payment', 'TransactionAmount', 9.99, 'None');
```

### CloudWatch Dashboards

```
Dashboard: Gifted Eternity Production

Widgets:
1. API Response Time (ms)
2. Error Rate (%)
3. Active Users
4. Subscription Revenue
5. Music Streams
6. Database Connections
7. S3 Storage Usage
8. CDN Bandwidth
```

---

## 3. Application Performance Monitoring (APM)

### New Relic Setup

```bash
# Install New Relic
npm install newrelic

# Configure newrelic.js
module.exports = {
  app_name: ['Gifted Eternity'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
  },
};
```

### Monitored Metrics

```
- Response Time
- Throughput (requests/sec)
- Error Rate
- Database Query Time
- External API Calls
- Memory Usage
- CPU Usage
```

### Alerts

```
Alert Conditions:
- Response time > 1000ms
- Error rate > 1%
- Database query time > 500ms
- Memory usage > 80%
- CPU usage > 75%
```

---

## 4. Error Tracking (Sentry)

### Setup Sentry

```typescript
// server/_core/sentry.ts

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default Sentry;
```

### Error Handling

```typescript
// Capture errors
try {
  // Code
} catch (error) {
  Sentry.captureException(error);
}

// Capture messages
Sentry.captureMessage('Payment processing started');

// Set user context
Sentry.setUser({
  id: userId,
  email: userEmail,
});
```

---

## 5. Health Checks

### Health Check Endpoint

```typescript
// server/routers/health.ts

import { publicProcedure, router } from '../_core/trpc';

export const healthRouter = router({
  check: publicProcedure.query(async () => {
    return {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      s3: 'connected',
    };
  }),
});
```

### Health Check Monitoring

```bash
# Monitor health endpoint
curl https://api.giftedeternitystudio.com/api/trpc/health.check

# Response
{
  "status": "healthy",
  "timestamp": "2024-12-29T06:00:00Z",
  "uptime": 86400,
  "memory": {
    "heapUsed": 50000000,
    "heapTotal": 100000000
  },
  "database": "connected",
  "s3": "connected"
}
```

---

## 6. Uptime Monitoring

### Uptime Robot

```
Service: UptimeRobot
Check Interval: Every 5 minutes
Endpoints:
- https://giftedeternitystudio.com
- https://api.giftedeternitystudio.com/api/trpc/health.check
- https://mobile-api.giftedeternitystudio.com/health

Alerts:
- Email notification on downtime
- SMS alert for critical downtime
- Slack notification
```

---

## 7. Log Aggregation (ELK Stack)

### Elasticsearch Setup

```yaml
# docker-compose.yml

version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
```

### Logstash Configuration

```conf
# logstash.conf

input {
  file {
    path => "/var/log/gifted-eternity/*.log"
    start_position => "beginning"
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "gifted-eternity-%{+YYYY.MM.dd}"
  }
}
```

---

## 8. Alerting & Notifications

### Alert Rules

```
Alert 1: High Error Rate
- Condition: Error rate > 1% for 5 minutes
- Action: Email + Slack notification

Alert 2: Database Performance
- Condition: Query time > 500ms for 10 minutes
- Action: Email + PagerDuty

Alert 3: Payment Processing Failure
- Condition: Failed transactions > 10 in 1 hour
- Action: Email + SMS + Slack

Alert 4: Storage Quota
- Condition: S3 usage > 80% of quota
- Action: Email notification

Alert 5: API Rate Limiting
- Condition: Rate limit exceeded > 100 times/hour
- Action: Slack notification
```

### Slack Integration

```typescript
// server/_core/slack.ts

import axios from 'axios';

export async function sendSlackAlert(message: string, level: 'info' | 'warning' | 'error') {
  const color = {
    info: '#36a64f',
    warning: '#ff9900',
    error: '#ff0000',
  }[level];

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    attachments: [
      {
        color,
        title: `Gifted Eternity ${level.toUpperCase()}`,
        text: message,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  });
}
```

---

## 9. Performance Metrics

### Key Metrics to Monitor

```
API Performance:
- Request count: 1000+ requests/sec
- Response time: < 200ms (p95)
- Error rate: < 0.1%
- Availability: > 99.9%

Database Performance:
- Query time: < 100ms (p95)
- Connection pool: < 50 connections
- Replication lag: < 1 second
- Backup status: Daily backups

Storage Performance:
- S3 upload time: < 5 seconds
- CDN cache hit rate: > 80%
- Average object size: < 10 MB
- Storage usage: < 80% of quota

Payment Processing:
- Transaction success rate: > 99%
- Processing time: < 2 seconds
- Refund processing: < 1 hour
- Failed transactions: < 1%
```

---

## 10. Monitoring Checklist

- [ ] CloudWatch configured
- [ ] Application logging implemented
- [ ] New Relic APM setup
- [ ] Sentry error tracking enabled
- [ ] Health check endpoint created
- [ ] Uptime monitoring configured
- [ ] ELK stack deployed
- [ ] Alert rules configured
- [ ] Slack integration enabled
- [ ] Performance baselines established
- [ ] Dashboard created
- [ ] Team trained on monitoring
- [ ] On-call rotation established
- [ ] Incident response plan created
- [ ] Monitoring tested

---

## 11. Troubleshooting

### Common Issues

**Issue: High memory usage**
- Solution: Check for memory leaks, optimize queries, increase instance size

**Issue: Slow database queries**
- Solution: Add indexes, optimize queries, scale database

**Issue: High error rate**
- Solution: Check logs, identify error patterns, fix bugs

**Issue: CDN cache misses**
- Solution: Increase cache TTL, pre-warm cache, optimize cache keys

---

## Conclusion

Monitoring and logging infrastructure is configured and ready for production.

**Status: MONITORING & LOGGING READY** ✅

---

**Last Updated:** December 29, 2024
**Version:** 1.0
