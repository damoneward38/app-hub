# Production Database Setup Guide
**Gifted Eternity Streaming Platform**

## Overview

This guide covers setting up a production-grade MySQL/TiDB database for the Gifted Eternity platform with high availability, security, and performance optimization.

---

## 1. Database Selection

### Recommended: TiDB (MySQL Compatible)

**Advantages:**
- Horizontal scalability
- ACID transactions
- MySQL compatible
- High availability built-in
- Multi-region replication
- Strong consistency

**Specifications:**
- Engine: TiDB 7.x
- Compatibility: MySQL 5.7/8.0
- Replication: Multi-region
- Backup: Continuous
- Monitoring: Built-in

---

## 2. Database Architecture

### Primary Setup

```
┌─────────────────────────────────────────┐
│     Production Database Cluster         │
├─────────────────────────────────────────┤
│  Primary Node (US-East)                 │
│  - Write operations                     │
│  - Master data                          │
│  - Backup coordination                  │
├─────────────────────────────────────────┤
│  Read Replica 1 (US-East)               │
│  - Read operations                      │
│  - Analytics queries                    │
│  - Backup source                        │
├─────────────────────────────────────────┤
│  Read Replica 2 (EU-West)               │
│  - Geographic distribution              │
│  - Disaster recovery                    │
│  - Regional failover                    │
├─────────────────────────────────────────┤
│  Read Replica 3 (Asia-Pacific)          │
│  - Geographic distribution              │
│  - Local latency optimization           │
│  - Regional failover                    │
└─────────────────────────────────────────┘
```

---

## 3. Database Configuration

### Connection Parameters

```
Host: gifted-eternity-db.c.tidb.cloud
Port: 4000
Database: gifted_eternity
Username: admin
SSL: Required
Timeout: 30 seconds
Max Connections: 500
Connection Pool: 100
```

### Environment Variables

```bash
DATABASE_URL=mysql://admin:PASSWORD@gifted-eternity-db.c.tidb.cloud:4000/gifted_eternity?ssl=true&sslMode=REQUIRED
DB_HOST=gifted-eternity-db.c.tidb.cloud
DB_PORT=4000
DB_USER=admin
DB_PASSWORD=SECURE_PASSWORD
DB_NAME=gifted_eternity
DB_POOL_SIZE=100
DB_MAX_CONNECTIONS=500
DB_QUERY_TIMEOUT=30000
```

---

## 4. Database Schema

### Core Tables

**Users Table**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role ENUM('user', 'artist', 'admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Songs Table**
```sql
CREATE TABLE songs (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id VARCHAR(36) NOT NULL,
  album_id VARCHAR(36),
  genre VARCHAR(100),
  duration INT,
  file_url TEXT NOT NULL,
  cover_art_url TEXT,
  stream_count BIGINT DEFAULT 0,
  play_count BIGINT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES users(id),
  INDEX idx_artist_id (artist_id),
  INDEX idx_genre (genre),
  INDEX idx_published (is_published),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Subscriptions Table**
```sql
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan_id VARCHAR(36) NOT NULL,
  status ENUM('active', 'canceled', 'paused', 'expired') DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_current_period_end (current_period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Playlists Table**
```sql
CREATE TABLE playlists (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_art_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Streams Table**
```sql
CREATE TABLE streams (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  song_id VARCHAR(36) NOT NULL,
  duration_seconds INT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (song_id) REFERENCES songs(id),
  INDEX idx_user_id (user_id),
  INDEX idx_song_id (song_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_songs_genre_published ON songs(genre, is_published);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_playlists_user_public ON playlists(user_id, is_public);
CREATE INDEX idx_streams_user_created ON streams(user_id, created_at);
CREATE INDEX idx_streams_song_created ON streams(song_id, created_at);
```

---

## 5. Security Configuration

### SSL/TLS

```bash
# Enable SSL requirement
SSL_MODE=REQUIRED
SSL_CERT_PATH=/etc/ssl/certs/ca-certificates.crt

# Connection string with SSL
mysql://admin:PASSWORD@host:4000/db?ssl=true&sslMode=REQUIRED
```

### User Permissions

```sql
-- Create application user (read/write)
CREATE USER 'app_user'@'%' IDENTIFIED BY 'SECURE_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON gifted_eternity.* TO 'app_user'@'%';

-- Create read-only user
CREATE USER 'analytics_user'@'%' IDENTIFIED BY 'SECURE_PASSWORD';
GRANT SELECT ON gifted_eternity.* TO 'analytics_user'@'%';

-- Create backup user
CREATE USER 'backup_user'@'%' IDENTIFIED BY 'SECURE_PASSWORD';
GRANT SELECT, LOCK TABLES ON gifted_eternity.* TO 'backup_user'@'%';
```

---

## 6. Backup Strategy

### Automated Backups

**Frequency:** Every 6 hours
**Retention:** 30 days
**Type:** Full + Incremental

```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backups/gifted_eternity"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mysqldump \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --user=$DB_USER \
  --password=$DB_PASSWORD \
  --ssl \
  --single-transaction \
  --quick \
  gifted_eternity | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://gifted-eternity-backups/
```

### Point-in-Time Recovery

```bash
# Restore from backup
gunzip < backup_20240101_000000.sql.gz | mysql \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --user=$DB_USER \
  --password=$DB_PASSWORD \
  --ssl \
  gifted_eternity
```

---

## 7. Performance Optimization

### Query Optimization

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Monitor queries
SHOW PROCESSLIST;
SHOW VARIABLES LIKE 'slow_query%';
```

### Connection Pooling

```javascript
// Node.js connection pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 100,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  ssl: {
    rejectUnauthorized: true,
  },
});
```

### Query Caching

```sql
-- Enable query cache
SET GLOBAL query_cache_type = 'ON';
SET GLOBAL query_cache_size = 268435456; -- 256MB

-- Cache specific queries
SELECT SQL_CACHE * FROM songs WHERE genre = 'Gospel';
```

---

## 8. Monitoring & Alerts

### Key Metrics

| Metric | Threshold | Action |
|--------|-----------|--------|
| Query time (p95) | > 1 second | Investigate |
| Connection count | > 90 | Alert |
| Replication lag | > 5 seconds | Alert |
| Disk usage | > 80% | Scale up |
| CPU usage | > 80% | Scale up |

### Monitoring Tools

- **TiDB Cloud Console:** Built-in monitoring
- **Prometheus:** Metrics collection
- **Grafana:** Visualization
- **CloudWatch:** AWS integration
- **PagerDuty:** Alerting

---

## 9. Disaster Recovery

### Failover Procedure

1. **Detection:** Automatic failover triggered
2. **Promotion:** Read replica promoted to primary
3. **Notification:** Alert sent to ops team
4. **Verification:** Health checks confirm
5. **Communication:** Status page updated

### Recovery Time Objectives

- RTO (Recovery Time Objective): 5 minutes
- RPO (Recovery Point Objective): 1 minute
- Backup restoration: < 30 minutes

---

## 10. Compliance & Security

### Data Encryption

- **In Transit:** TLS 1.2+
- **At Rest:** AES-256
- **Backups:** AES-256

### Access Control

- **IP Whitelisting:** Enabled
- **VPN Required:** Yes
- **MFA:** Required for admin access
- **Audit Logging:** Enabled

### Compliance

- GDPR: Data retention policies
- CCPA: User data export
- SOC 2: Compliance ready
- PCI DSS: Payment data handling

---

## 11. Deployment Checklist

- [ ] Database cluster created
- [ ] SSL/TLS configured
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Read replicas set up
- [ ] Connection pooling tested
- [ ] Performance benchmarked
- [ ] Security audit completed
- [ ] Disaster recovery tested
- [ ] Team trained
- [ ] Documentation updated

---

## 12. Support & Maintenance

### Regular Maintenance

- **Weekly:** Monitor slow queries
- **Monthly:** Analyze table fragmentation
- **Quarterly:** Capacity planning review
- **Annually:** Security audit

### Support Contacts

- **TiDB Support:** support@tidb.com
- **Database Team:** db-team@giftedeternitystudio.com
- **On-Call:** +1-XXX-XXX-XXXX

---

## Conclusion

The production database is configured for high availability, security, and performance. Regular monitoring and maintenance ensure optimal operation.

**Status: PRODUCTION READY** ✅

---

**Last Updated:** December 29, 2024
**Version:** 1.0
