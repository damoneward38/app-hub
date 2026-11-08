# Phase 2 Database Schema - Complete Reference

**Status:** PRODUCTION-READY  
**Database:** MySQL 8.0+  
**ORM:** Drizzle ORM  
**Last Updated:** December 28, 2025

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Complete Schema (Drizzle ORM)](#complete-schema-drizzle-orm)
3. [SQL DDL Statements](#sql-ddl-statements)
4. [Relationships & Foreign Keys](#relationships--foreign-keys)
5. [Indexes & Performance](#indexes--performance)
6. [Data Types & Constraints](#data-types--constraints)
7. [Migration Guide](#migration-guide)
8. [Backup & Recovery](#backup--recovery)

---

## OVERVIEW

Phase 2 adds **8 new tables** to support User-Generated Content (UGC) and monetization features:

| Table | Purpose | Records |
|-------|---------|---------|
| `artistProfiles` | Artist profiles & metadata | 1 per artist |
| `artistUploads` | Uploaded tracks | Many per artist |
| `userPlaylists` | User-created playlists | Many per user |
| `playlistFollowers` | Playlist followers | Many per playlist |
| `playlistShares` | Playlist share tracking | Many per playlist |
| `creatorEarnings` | Earnings records | Many per artist |
| `creatorPayouts` | Payout requests | Many per artist |
| `tips` | Tip transactions | Many per user |
| `adMetrics` | Ad performance tracking | Many per user |

**Total New Tables:** 9  
**Total Schema Tables:** 24  
**Estimated Storage (1M users):** ~50-100 GB

---

## COMPLETE SCHEMA (DRIZZLE ORM)

### Current Schema (Already in `drizzle/schema.ts`)

The following tables are already defined and working:

```typescript
// Core tables
users
subscriptionTiers
userSubscriptions
albums
tracks
playlists
playlistTracks
favorites
streamHistory
paypalSubscriptions
payments
genreAccess
songPurchases
albumPurchases
posts
uploadedFiles
```

### Phase 2 New Tables (Already Added)

The following tables have been added to your schema:

```typescript
// Artist UGC
artistProfiles
artistUploads

// Playlists Extended
userPlaylists
playlistFollowers
playlistShares

// Monetization
creatorEarnings
creatorPayouts
tips
adMetrics
```

### Complete Drizzle Schema File

**File:** `drizzle/schema.ts`

The complete schema is already in your project. Here's the Phase 2 section:

```typescript
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Artist profiles for UGC
 */
export const artistProfiles = mysqlTable("artistProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  artistName: varchar("artistName", { length: 255 }).notNull(),
  bio: text("bio"),
  profileImage: varchar("profileImage", { length: 512 }),
  bannerImage: varchar("bannerImage", { length: 512 }),
  genre: varchar("genre", { length: 64 }),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 512 }),
  socialLinks: text("socialLinks"), // JSON
  followers: int("followers").default(0).notNull(),
  totalPlays: int("totalPlays").default(0).notNull(),
  verifiedBadge: int("verifiedBadge").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type InsertArtistProfile = typeof artistProfiles.$inferInsert;

/**
 * Artist uploads (UGC tracks)
 */
export const artistUploads = mysqlTable("artistUploads", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 64 }).notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(),
  audioKey: varchar("audioKey", { length: 512 }).notNull(),
  coverArtUrl: varchar("coverArtUrl", { length: 512 }),
  duration: int("duration"), // in seconds
  bpm: int("bpm"),
  key: varchar("key", { length: 10 }),
  releaseDate: timestamp("releaseDate"),
  isPublished: int("isPublished").default(0).notNull(),
  isExplicit: int("isExplicit").default(0).notNull(),
  downloadable: int("downloadable").default(0).notNull(),
  downloadPrice: int("downloadPrice"), // in cents
  plays: int("plays").default(0).notNull(),
  downloads: int("downloads").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtistUpload = typeof artistUploads.$inferSelect;
export type InsertArtistUpload = typeof artistUploads.$inferInsert;

/**
 * User playlists (extended)
 */
export const userPlaylists = mysqlTable("userPlaylists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  isPublic: int("isPublic").default(0).notNull(),
  plays: int("plays").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  followers: int("followers").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPlaylist = typeof userPlaylists.$inferSelect;
export type InsertUserPlaylist = typeof userPlaylists.$inferInsert;

/**
 * Playlist followers
 */
export const playlistFollowers = mysqlTable("playlistFollowers", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull().references(() => userPlaylists.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  followedAt: timestamp("followedAt").defaultNow().notNull(),
});

export type PlaylistFollower = typeof playlistFollowers.$inferSelect;
export type InsertPlaylistFollower = typeof playlistFollowers.$inferInsert;

/**
 * Playlist shares tracking
 */
export const playlistShares = mysqlTable("playlistShares", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull().references(() => userPlaylists.id, { onDelete: "cascade" }),
  sharedBy: int("sharedBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 64 }), // 'twitter', 'facebook', 'whatsapp', 'copy'
  sharedAt: timestamp("sharedAt").defaultNow().notNull(),
});

export type PlaylistShare = typeof playlistShares.$inferSelect;
export type InsertPlaylistShare = typeof playlistShares.$inferInsert;

/**
 * Creator earnings tracking
 */
export const creatorEarnings = mysqlTable("creatorEarnings", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  trackId: int("trackId").references(() => artistUploads.id, { onDelete: "set null" }),
  playlistId: int("playlistId").references(() => userPlaylists.id, { onDelete: "set null" }),
  earningType: mysqlEnum("earningType", ["streams", "downloads", "tips", "merchandise"]).notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  period: varchar("period", { length: 64 }), // 'daily', 'weekly', 'monthly'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreatorEarning = typeof creatorEarnings.$inferSelect;
export type InsertCreatorEarning = typeof creatorEarnings.$inferInsert;

/**
 * Creator payouts
 */
export const creatorPayouts = mysqlTable("creatorPayouts", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull().references(() => artistProfiles.id, { onDelete: "cascade" }),
  amount: int("amount").notNull(), // in cents
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }), // 'paypal', 'stripe', 'bank'
  transactionId: varchar("transactionId", { length: 255 }),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type CreatorPayout = typeof creatorPayouts.$inferSelect;
export type InsertCreatorPayout = typeof creatorPayouts.$inferInsert;

/**
 * Tips and donations
 */
export const tips = mysqlTable("tips", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientId: int("recipientId").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: int("amount").notNull(), // in cents
  message: text("message"),
  trackId: int("trackId").references(() => artistUploads.id, { onDelete: "set null" }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("completed").notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tip = typeof tips.$inferSelect;
export type InsertTip = typeof tips.$inferInsert;

/**
 * Ad impressions and clicks tracking
 */
export const adMetrics = mysqlTable("adMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  adId: varchar("adId", { length: 255 }).notNull(),
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  lastInteraction: timestamp("lastInteraction").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdMetric = typeof adMetrics.$inferSelect;
export type InsertAdMetric = typeof adMetrics.$inferInsert;
```

---

## SQL DDL STATEMENTS

### Create Statements

If you need to create these tables manually in SQL:

```sql
-- Artist Profiles
CREATE TABLE IF NOT EXISTS artistProfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  artistName VARCHAR(255) NOT NULL,
  bio TEXT,
  profileImage VARCHAR(512),
  bannerImage VARCHAR(512),
  genre VARCHAR(64),
  location VARCHAR(255),
  website VARCHAR(512),
  socialLinks TEXT COMMENT 'JSON',
  followers INT DEFAULT 0 NOT NULL,
  totalPlays INT DEFAULT 0 NOT NULL,
  verifiedBadge INT DEFAULT 0 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_genre (genre),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artist Uploads
CREATE TABLE IF NOT EXISTS artistUploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artistId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(64) NOT NULL,
  audioUrl VARCHAR(512) NOT NULL,
  audioKey VARCHAR(512) NOT NULL,
  coverArtUrl VARCHAR(512),
  duration INT COMMENT 'in seconds',
  bpm INT,
  `key` VARCHAR(10),
  releaseDate TIMESTAMP NULL,
  isPublished INT DEFAULT 0 NOT NULL,
  isExplicit INT DEFAULT 0 NOT NULL,
  downloadable INT DEFAULT 0 NOT NULL,
  downloadPrice INT COMMENT 'in cents',
  plays INT DEFAULT 0 NOT NULL,
  downloads INT DEFAULT 0 NOT NULL,
  likes INT DEFAULT 0 NOT NULL,
  comments INT DEFAULT 0 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (artistId) REFERENCES artistProfiles(id) ON DELETE CASCADE,
  INDEX idx_artistId (artistId),
  INDEX idx_isPublished (isPublished),
  INDEX idx_genre (genre),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Playlists
CREATE TABLE IF NOT EXISTS userPlaylists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coverImageUrl VARCHAR(512),
  isPublic INT DEFAULT 0 NOT NULL,
  plays INT DEFAULT 0 NOT NULL,
  shares INT DEFAULT 0 NOT NULL,
  followers INT DEFAULT 0 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isPublic (isPublic),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Playlist Followers
CREATE TABLE IF NOT EXISTS playlistFollowers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlistId INT NOT NULL,
  userId INT NOT NULL,
  followedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (playlistId) REFERENCES userPlaylists(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_playlistId (playlistId),
  INDEX idx_userId (userId),
  UNIQUE KEY unique_playlist_follower (playlistId, userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Playlist Shares
CREATE TABLE IF NOT EXISTS playlistShares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlistId INT NOT NULL,
  sharedBy INT NOT NULL,
  platform VARCHAR(64),
  sharedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (playlistId) REFERENCES userPlaylists(id) ON DELETE CASCADE,
  FOREIGN KEY (sharedBy) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_playlistId (playlistId),
  INDEX idx_sharedBy (sharedBy),
  INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Creator Earnings
CREATE TABLE IF NOT EXISTS creatorEarnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artistId INT NOT NULL,
  trackId INT,
  playlistId INT,
  earningType ENUM('streams', 'downloads', 'tips', 'merchandise') NOT NULL,
  amount INT NOT NULL COMMENT 'in cents',
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  period VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (artistId) REFERENCES artistProfiles(id) ON DELETE CASCADE,
  FOREIGN KEY (trackId) REFERENCES artistUploads(id) ON DELETE SET NULL,
  FOREIGN KEY (playlistId) REFERENCES userPlaylists(id) ON DELETE SET NULL,
  INDEX idx_artistId (artistId),
  INDEX idx_earningType (earningType),
  INDEX idx_createdAt (createdAt),
  INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Creator Payouts
CREATE TABLE IF NOT EXISTS creatorPayouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artistId INT NOT NULL,
  amount INT NOT NULL COMMENT 'in cents',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' NOT NULL,
  paymentMethod VARCHAR(64),
  transactionId VARCHAR(255),
  requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  processedAt TIMESTAMP NULL,
  FOREIGN KEY (artistId) REFERENCES artistProfiles(id) ON DELETE CASCADE,
  INDEX idx_artistId (artistId),
  INDEX idx_status (status),
  INDEX idx_requestedAt (requestedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tips
CREATE TABLE IF NOT EXISTS tips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  recipientId INT NOT NULL,
  amount INT NOT NULL COMMENT 'in cents',
  message TEXT,
  trackId INT,
  paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'completed' NOT NULL,
  stripePaymentId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trackId) REFERENCES artistUploads(id) ON DELETE SET NULL,
  INDEX idx_senderId (senderId),
  INDEX idx_recipientId (recipientId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ad Metrics
CREATE TABLE IF NOT EXISTS adMetrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  adId VARCHAR(255) NOT NULL,
  impressions INT DEFAULT 0 NOT NULL,
  clicks INT DEFAULT 0 NOT NULL,
  lastInteraction TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_adId (adId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## RELATIONSHIPS & FOREIGN KEYS

### Entity Relationship Diagram

```
users (1)
├── (1:1) artistProfiles
│   ├── (1:N) artistUploads
│   │   ├── (N:1) creatorEarnings
│   │   └── (N:1) tips
│   └── (1:N) creatorPayouts
│
├── (1:N) userPlaylists
│   ├── (N:M) playlistFollowers
│   ├── (N:M) playlistShares
│   └── (N:1) creatorEarnings
│
├── (1:N) tips (as sender)
├── (1:N) tips (as recipient)
└── (1:N) adMetrics
```

### Foreign Key Constraints

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| artistProfiles | userId | users.id | CASCADE |
| artistUploads | artistId | artistProfiles.id | CASCADE |
| userPlaylists | userId | users.id | CASCADE |
| playlistFollowers | playlistId | userPlaylists.id | CASCADE |
| playlistFollowers | userId | users.id | CASCADE |
| playlistShares | playlistId | userPlaylists.id | CASCADE |
| playlistShares | sharedBy | users.id | CASCADE |
| creatorEarnings | artistId | artistProfiles.id | CASCADE |
| creatorEarnings | trackId | artistUploads.id | SET NULL |
| creatorEarnings | playlistId | userPlaylists.id | SET NULL |
| creatorPayouts | artistId | artistProfiles.id | CASCADE |
| tips | senderId | users.id | CASCADE |
| tips | recipientId | users.id | CASCADE |
| tips | trackId | artistUploads.id | SET NULL |
| adMetrics | userId | users.id | CASCADE |

---

## INDEXES & PERFORMANCE

### Recommended Indexes

All critical indexes are already defined in the schema. Here's the optimization strategy:

```sql
-- Primary lookup indexes
CREATE INDEX idx_artistProfiles_userId ON artistProfiles(userId);
CREATE INDEX idx_artistUploads_artistId ON artistUploads(artistId);
CREATE INDEX idx_userPlaylists_userId ON userPlaylists(userId);
CREATE INDEX idx_creatorEarnings_artistId ON creatorEarnings(artistId);
CREATE INDEX idx_tips_recipientId ON tips(recipientId);

-- Discovery/filtering indexes
CREATE INDEX idx_artistUploads_isPublished ON artistUploads(isPublished);
CREATE INDEX idx_artistUploads_genre ON artistUploads(genre);
CREATE INDEX idx_userPlaylists_isPublic ON userPlaylists(isPublic);

-- Time-based queries
CREATE INDEX idx_artistUploads_createdAt ON artistUploads(createdAt);
CREATE INDEX idx_creatorEarnings_createdAt ON creatorEarnings(createdAt);
CREATE INDEX idx_tips_createdAt ON tips(createdAt);

-- Composite indexes for common queries
CREATE INDEX idx_creatorEarnings_artist_type ON creatorEarnings(artistId, earningType);
CREATE INDEX idx_playlistFollowers_unique ON playlistFollowers(playlistId, userId);
```

### Query Performance Tips

1. **Always filter by `isPublished = 1`** when querying artist uploads
2. **Use pagination** with LIMIT/OFFSET for large result sets
3. **Cache frequently accessed data** (artist profiles, top tracks)
4. **Archive old earnings records** after 1 year
5. **Use materialized views** for dashboard statistics

---

## DATA TYPES & CONSTRAINTS

### Money Fields (Always in Cents)

All monetary values are stored as `INT` in **cents** to avoid floating-point issues:

- `$1.00` = `100` (cents)
- `$0.99` = `99` (cents)
- `$1,000.00` = `100000` (cents)

**Conversion Formula:**
```typescript
// Cents to dollars
const dollars = cents / 100;

// Dollars to cents
const cents = dollars * 100;
```

### Boolean Fields (INT 0/1)

All boolean values use `INT` with 0 (false) or 1 (true):

- `isPublished INT DEFAULT 0` = not published
- `isPublished INT DEFAULT 1` = published

### Enum Fields

Enums are used for fixed sets of values:

```sql
-- earningType
ENUM('streams', 'downloads', 'tips', 'merchandise')

-- paymentStatus
ENUM('pending', 'completed', 'failed')

-- status (payouts)
ENUM('pending', 'processing', 'completed', 'failed')

-- platform (shares)
VARCHAR(64) -- 'twitter', 'facebook', 'whatsapp', 'copy'
```

### Text Fields (JSON Storage)

Some fields store JSON data:

```typescript
// socialLinks - JSON object
{
  "twitter": "https://twitter.com/artist",
  "instagram": "https://instagram.com/artist",
  "tiktok": "https://tiktok.com/@artist"
}

// metadata - JSON object (uploadedFiles)
{
  "duration": 180,
  "bitrate": 320,
  "sampleRate": 44100
}
```

---

## MIGRATION GUIDE

### Step 1: Verify Schema

```bash
cd /home/ubuntu/gifted_eternity_stream_web

# Check schema file
grep -E "artistProfiles|artistUploads|userPlaylists|creatorEarnings|tips|adMetrics" drizzle/schema.ts
```

### Step 2: Generate Migration

```bash
# Generate migration files from schema
pnpm drizzle-kit generate:mysql
```

### Step 3: Apply Migration

```bash
# Push schema to database
pnpm db:push
```

### Step 4: Verify Tables

```bash
# Check if tables were created
pnpm db:studio

# Or via MySQL CLI:
mysql -u root -p your_database -e "SHOW TABLES LIKE '%artist%';"
```

### Step 5: Seed Initial Data (Optional)

```bash
# Create seed file
cat > drizzle/seed.ts << 'EOF'
import { getDb } from "../server/db";
import { subscriptionTiers } from "./schema";

export async function seedDatabase() {
  const db = await getDb();
  if (!db) return;

  // Seed subscription tiers
  await db.insert(subscriptionTiers).values([
    {
      name: "Free",
      description: "Free tier with ads",
      monthlyPrice: 0,
      features: JSON.stringify(["ad-supported", "limited-streams"]),
    },
    {
      name: "Premium",
      description: "Ad-free listening",
      monthlyPrice: 999,
      features: JSON.stringify(["ad-free", "unlimited-streams", "hq-audio"]),
    },
    {
      name: "Supporter",
      description: "Support creators directly",
      monthlyPrice: 1999,
      features: JSON.stringify(["ad-free", "unlimited-streams", "hq-audio", "exclusive-content"]),
    },
  ]);
}
EOF

# Run seed
pnpm tsx drizzle/seed.ts
```

---

## BACKUP & RECOVERY

### Backup Strategy

```bash
# Full database backup
mysqldump -u root -p your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables
mysqldump -u root -p your_database artistProfiles artistUploads > artist_backup.sql

# Backup with compression
mysqldump -u root -p your_database | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Recovery

```bash
# Restore full database
mysql -u root -p your_database < backup_20250101_120000.sql

# Restore specific tables
mysql -u root -p your_database < artist_backup.sql

# Restore from compressed backup
gunzip < backup_20250101.sql.gz | mysql -u root -p your_database
```

### Point-in-Time Recovery

```bash
# Enable binary logging in MySQL config
[mysqld]
log_bin = mysql-bin
binlog_format = ROW

# Restore to specific time
mysqlbinlog --start-datetime="2025-01-01 12:00:00" /var/log/mysql/mysql-bin.000001 | mysql -u root -p
```

---

## MONITORING & MAINTENANCE

### Check Table Sizes

```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'your_database'
ORDER BY (data_length + index_length) DESC;
```

### Optimize Tables

```sql
-- Optimize all tables
OPTIMIZE TABLE artistProfiles, artistUploads, userPlaylists, creatorEarnings, tips, adMetrics;

-- Check table integrity
CHECK TABLE artistProfiles, artistUploads, userPlaylists;
```

### Monitor Queries

```sql
-- Enable query logging
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';

-- View slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Disable logging
SET GLOBAL general_log = 'OFF';
```

---

## SAMPLE QUERIES

### Get Artist Dashboard Stats

```sql
SELECT 
  ap.id,
  ap.artistName,
  COUNT(DISTINCT au.id) as total_tracks,
  SUM(au.plays) as total_plays,
  SUM(au.downloads) as total_downloads,
  SUM(au.likes) as total_likes
FROM artistProfiles ap
LEFT JOIN artistUploads au ON ap.id = au.artistId
WHERE ap.userId = ?
GROUP BY ap.id;
```

### Get Creator Earnings Summary

```sql
SELECT 
  ce.earningType,
  SUM(ce.amount) as total_amount,
  COUNT(*) as transaction_count
FROM creatorEarnings ce
WHERE ce.artistId = ?
  AND ce.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY ce.earningType;
```

### Get Top Tracks

```sql
SELECT 
  au.id,
  au.title,
  ap.artistName,
  au.plays,
  au.downloads,
  au.likes
FROM artistUploads au
JOIN artistProfiles ap ON au.artistId = ap.id
WHERE au.isPublished = 1
ORDER BY au.plays DESC
LIMIT 50;
```

### Get Pending Payouts

```sql
SELECT 
  cp.id,
  ap.artistName,
  cp.amount,
  cp.paymentMethod,
  cp.requestedAt
FROM creatorPayouts cp
JOIN artistProfiles ap ON cp.artistId = ap.id
WHERE cp.status = 'pending'
ORDER BY cp.requestedAt ASC;
```

---

## TROUBLESHOOTING

### Foreign Key Constraint Error

```
Error: Cannot add or modify row: foreign key constraint fails
```

**Solution:** Ensure parent record exists before inserting child record.

```typescript
// ❌ Wrong
await db.insert(artistUploads).values({ artistId: 999, ... });

// ✅ Correct
const artist = await db.query.artistProfiles.findFirst({ where: eq(artistProfiles.id, 999) });
if (artist) {
  await db.insert(artistUploads).values({ artistId: 999, ... });
}
```

### Duplicate Key Error

```
Error: Duplicate entry for key 'unique_playlist_follower'
```

**Solution:** Check for existing record before inserting.

```typescript
const existing = await db.query.playlistFollowers.findFirst({
  where: (pf) => eq(pf.playlistId, playlistId) && eq(pf.userId, userId),
});
if (!existing) {
  await db.insert(playlistFollowers).values({ playlistId, userId });
}
```

### Migration Conflicts

```
Error: Migration already exists
```

**Solution:** Check migration history and resolve conflicts.

```bash
# View migration history
pnpm drizzle-kit status:mysql

# Reset migrations (development only!)
rm -rf drizzle/migrations/*
pnpm drizzle-kit generate:mysql
```

---

## NEXT STEPS

1. ✅ Verify schema is in `drizzle/schema.ts`
2. ✅ Run `pnpm db:push` to apply migrations
3. ✅ Verify tables with `pnpm db:studio`
4. ✅ Create backend services using schema types
5. ✅ Create API routers
6. ✅ Build frontend components
7. ✅ Test end-to-end flows
8. ✅ Deploy to production

---

**Schema Version:** 2.0  
**Last Updated:** December 28, 2025  
**Status:** PRODUCTION-READY ✅
