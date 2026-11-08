# Phase 2 Complete Implementation Guide
## User-Generated Content + Monetization Strategy

**Status:** PRODUCTION-READY  
**Last Updated:** December 28, 2025  
**Estimated Implementation Time:** 6-8 weeks  
**Complexity:** Medium-High  
**Team Size:** 3-4 developers

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Backend Services](#backend-services)
4. [Backend Routers](#backend-routers)
5. [Frontend Components](#frontend-components)
6. [Integration Steps](#integration-steps)
7. [Testing Guide](#testing-guide)
8. [Deployment Checklist](#deployment-checklist)
9. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

Phase 2 adds two major features to Gifted Eternity:

### Feature 1: User-Generated Content (UGC)
- Artists can upload their own music
- Create and manage playlists
- Track earnings from streams, downloads, and tips
- Request payouts

### Feature 2: Monetization Strategy
- Advanced subscription tiers
- In-app tips and donations
- Ad-supported free tier
- Creator revenue dashboard

---

## DATABASE SCHEMA

### Already Added to `drizzle/schema.ts`

The following tables have been added to your schema:

```typescript
// Artist profiles for UGC
artistProfiles - Store artist information
artistUploads - Store uploaded tracks
userPlaylists - Extended playlist functionality
playlistFollowers - Track playlist followers
playlistShares - Track playlist shares

// Earnings and payouts
creatorEarnings - Track all creator earnings
creatorPayouts - Track payout requests

// Tips and donations
tips - Store tip transactions

// Ads
adMetrics - Track ad impressions and clicks
```

**Verify Schema:**
```bash
# Check that all tables are in drizzle/schema.ts
grep -E "artistProfiles|artistUploads|userPlaylists|creatorEarnings|tips|adMetrics" drizzle/schema.ts
```

**Apply Migrations:**
```bash
cd /home/ubuntu/gifted_eternity_stream_web
pnpm db:push
```

---

## BACKEND SERVICES

### 1. Artist Upload Service

**File:** `server/_core/artistUpload.ts`

```typescript
import { getDb } from "../db";
import { artistProfiles, artistUploads } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { eq } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * Create or get artist profile for a user
 */
export async function createOrGetArtistProfile(
  userId: number,
  artistName: string
) {
  const db = await getDatabase();
  const existing = await db.query.artistProfiles.findFirst({
    where: (ap: any) => eq(ap.userId, userId),
  });

  if (existing) return existing;

  await db.insert(artistProfiles).values({
    userId,
    artistName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return await db.query.artistProfiles.findFirst({
    where: (ap: any) => eq(ap.userId, userId),
  });
}

/**
 * Get artist profile by ID
 */
export async function getArtistProfile(artistId: number) {
  const db = await getDatabase();
  return await db.query.artistProfiles.findFirst({
    where: (ap: any) => eq(ap.id, artistId),
  });
}

/**
 * Get artist profile by user ID
 */
export async function getArtistProfileByUserId(userId: number) {
  const db = await getDatabase();
  return await db.query.artistProfiles.findFirst({
    where: (ap: any) => eq(ap.userId, userId),
  });
}

/**
 * Update artist profile
 */
export async function updateArtistProfile(
  artistId: number,
  data: Partial<{
    artistName: string;
    bio: string;
    profileImage: string;
    bannerImage: string;
    genre: string;
    location: string;
    website: string;
    socialLinks: string;
  }>
) {
  const db = await getDatabase();
  return await db
    .update(artistProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(artistProfiles.id, artistId));
}

/**
 * Upload a new track to S3
 */
export async function uploadTrack(
  artistId: number,
  trackData: {
    title: string;
    description?: string;
    genre: string;
    audioFile: Buffer;
    coverArt?: Buffer;
    duration: number;
    bpm?: number;
    key?: string;
    isExplicit?: boolean;
    downloadable?: boolean;
    downloadPrice?: number;
  }
) {
  try {
    const db = await getDatabase();

    // Upload audio file to S3
    const audioKey = `artists/${artistId}/tracks/${Date.now()}-${trackData.title
      .replace(/\s+/g, "-")
      .toLowerCase()}.mp3`;
    const { url: audioUrl } = await storagePut(
      audioKey,
      trackData.audioFile,
      "audio/mpeg"
    );

    // Upload cover art if provided
    let coverArtUrl = null;
    if (trackData.coverArt) {
      const coverKey = `artists/${artistId}/covers/${Date.now()}-cover.jpg`;
      const { url } = await storagePut(
        coverKey,
        trackData.coverArt,
        "image/jpeg"
      );
      coverArtUrl = url;
    }

    // Create track record in database
    await db.insert(artistUploads).values({
      artistId,
      title: trackData.title,
      description: trackData.description,
      genre: trackData.genre,
      audioUrl,
      audioKey,
      coverArtUrl,
      duration: trackData.duration,
      bpm: trackData.bpm,
      key: trackData.key,
      isExplicit: trackData.isExplicit ? 1 : 0,
      downloadable: trackData.downloadable ? 1 : 0,
      downloadPrice: trackData.downloadPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, audioUrl, coverArtUrl };
  } catch (error) {
    console.error("❌ Track upload failed:", error);
    throw error;
  }
}

/**
 * Get all tracks for an artist
 */
export async function getArtistTracks(
  artistId: number,
  onlyPublished = true
) {
  const db = await getDatabase();
  const query = await db.query.artistUploads.findMany({
    where: (au: any) => eq(au.artistId, artistId),
  });

  if (onlyPublished) {
    return query.filter((t: any) => t.isPublished === 1);
  }

  return query;
}

/**
 * Get a single track by ID
 */
export async function getTrackById(trackId: number) {
  const db = await getDatabase();
  return await db.query.artistUploads.findFirst({
    where: (au: any) => eq(au.id, trackId),
  });
}

/**
 * Publish a track (make it visible to users)
 */
export async function publishTrack(trackId: number) {
  const db = await getDatabase();
  return await db
    .update(artistUploads)
    .set({
      isPublished: 1,
      releaseDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(artistUploads.id, trackId));
}

/**
 * Unpublish a track
 */
export async function unpublishTrack(trackId: number) {
  const db = await getDatabase();
  return await db
    .update(artistUploads)
    .set({
      isPublished: 0,
      updatedAt: new Date(),
    })
    .where(eq(artistUploads.id, trackId));
}

/**
 * Delete a track
 */
export async function deleteTrack(trackId: number) {
  const db = await getDatabase();
  return await db
    .delete(artistUploads)
    .where(eq(artistUploads.id, trackId));
}

/**
 * Increment play count for a track
 */
export async function incrementPlayCount(trackId: number) {
  const db = await getDatabase();
  const track = await getTrackById(trackId);
  if (!track) throw new Error("Track not found");

  return await db
    .update(artistUploads)
    .set({
      plays: (track.plays || 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(artistUploads.id, trackId));
}

/**
 * Increment like count for a track
 */
export async function incrementLikeCount(trackId: number) {
  const db = await getDatabase();
  const track = await getTrackById(trackId);
  if (!track) throw new Error("Track not found");

  return await db
    .update(artistUploads)
    .set({
      likes: (track.likes || 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(artistUploads.id, trackId));
}

/**
 * Increment download count for a track
 */
export async function incrementDownloadCount(trackId: number) {
  const db = await getDatabase();
  const track = await getTrackById(trackId);
  if (!track) throw new Error("Track not found");

  return await db
    .update(artistUploads)
    .set({
      downloads: (track.downloads || 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(artistUploads.id, trackId));
}

/**
 * Get all published tracks (for discovery page)
 */
export async function getPublishedTracks(limit = 50, offset = 0) {
  const db = await getDatabase();
  return await db.query.artistUploads.findMany({
    where: (au: any) => eq(au.isPublished, 1),
    limit,
    offset,
  });
}

/**
 * Get tracks by genre
 */
export async function getTracksByGenre(genre: string, limit = 50) {
  const db = await getDatabase();
  return await db.query.artistUploads.findMany({
    where: (au: any) => eq(au.genre, genre),
    limit,
  });
}

/**
 * Get artist statistics
 */
export async function getArtistStats(artistId: number) {
  const tracks = await getArtistTracks(artistId, true);
  const totalPlays = tracks.reduce(
    (sum: number, t: any) => sum + (t.plays || 0),
    0
  );
  const totalLikes = tracks.reduce(
    (sum: number, t: any) => sum + (t.likes || 0),
    0
  );
  const totalDownloads = tracks.reduce(
    (sum: number, t: any) => sum + (t.downloads || 0),
    0
  );

  return {
    trackCount: tracks.length,
    totalPlays,
    totalLikes,
    totalDownloads,
  };
}
```

### 2. Playlist Service

**File:** `server/_core/playlists.ts`

```typescript
import { getDb } from "../db";
import {
  userPlaylists,
  playlistFollowers,
  playlistShares,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * Create a new playlist
 */
export async function createPlaylist(
  userId: number,
  name: string,
  description?: string
) {
  const db = await getDatabase();
  await db.insert(userPlaylists).values({
    userId,
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { success: true };
}

/**
 * Get all playlists for a user
 */
export async function getUserPlaylists(userId: number) {
  const db = await getDatabase();
  return await db.query.userPlaylists.findMany({
    where: (up: any) => eq(up.userId, userId),
  });
}

/**
 * Get a single playlist by ID
 */
export async function getPlaylistById(playlistId: number) {
  const db = await getDatabase();
  return await db.query.userPlaylists.findFirst({
    where: (up: any) => eq(up.id, playlistId),
  });
}

/**
 * Update playlist details
 */
export async function updatePlaylist(
  playlistId: number,
  data: Partial<{
    name: string;
    description: string;
    coverImageUrl: string;
  }>
) {
  const db = await getDatabase();
  return await db
    .update(userPlaylists)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userPlaylists.id, playlistId));
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(playlistId: number) {
  const db = await getDatabase();
  return await db
    .delete(userPlaylists)
    .where(eq(userPlaylists.id, playlistId));
}

/**
 * Publish a playlist (make it public)
 */
export async function publishPlaylist(playlistId: number) {
  const db = await getDatabase();
  return await db
    .update(userPlaylists)
    .set({
      isPublic: 1,
      updatedAt: new Date(),
    })
    .where(eq(userPlaylists.id, playlistId));
}

/**
 * Unpublish a playlist (make it private)
 */
export async function unpublishPlaylist(playlistId: number) {
  const db = await getDatabase();
  return await db
    .update(userPlaylists)
    .set({
      isPublic: 0,
      updatedAt: new Date(),
    })
    .where(eq(userPlaylists.id, playlistId));
}

/**
 * Follow a playlist
 */
export async function followPlaylist(playlistId: number, userId: number) {
  const db = await getDatabase();
  const existing = await db.query.playlistFollowers.findFirst({
    where: (pf: any) =>
      eq(pf.playlistId, playlistId) && eq(pf.userId, userId),
  });

  if (existing) return { success: false, message: "Already following" };

  await db.insert(playlistFollowers).values({
    playlistId,
    userId,
    followedAt: new Date(),
  });

  // Update followers count
  const followers = await db.query.playlistFollowers.findMany({
    where: (pf: any) => eq(pf.playlistId, playlistId),
  });

  await db
    .update(userPlaylists)
    .set({ followers: followers.length })
    .where(eq(userPlaylists.id, playlistId));

  return { success: true };
}

/**
 * Unfollow a playlist
 */
export async function unfollowPlaylist(playlistId: number, userId: number) {
  const db = await getDatabase();
  await db
    .delete(playlistFollowers)
    .where(
      (pf: any) =>
        eq(pf.playlistId, playlistId) && eq(pf.userId, userId)
    );

  // Update followers count
  const followers = await db.query.playlistFollowers.findMany({
    where: (pf: any) => eq(pf.playlistId, playlistId),
  });

  await db
    .update(userPlaylists)
    .set({ followers: followers.length })
    .where(eq(userPlaylists.id, playlistId));

  return { success: true };
}

/**
 * Share a playlist
 */
export async function sharePlaylist(
  playlistId: number,
  userId: number,
  platform: string
) {
  const db = await getDatabase();
  await db.insert(playlistShares).values({
    playlistId,
    sharedBy: userId,
    platform,
    sharedAt: new Date(),
  });

  // Update shares count
  const shares = await db.query.playlistShares.findMany({
    where: (ps: any) => eq(ps.playlistId, playlistId),
  });

  await db
    .update(userPlaylists)
    .set({ shares: shares.length })
    .where(eq(userPlaylists.id, playlistId));

  return { success: true };
}

/**
 * Get playlist followers
 */
export async function getPlaylistFollowers(playlistId: number) {
  const db = await getDatabase();
  return await db.query.playlistFollowers.findMany({
    where: (pf: any) => eq(pf.playlistId, playlistId),
  });
}

/**
 * Get public playlists (for discovery)
 */
export async function getPublicPlaylists(limit = 50, offset = 0) {
  const db = await getDatabase();
  return await db.query.userPlaylists.findMany({
    where: (up: any) => eq(up.isPublic, 1),
    limit,
    offset,
  });
}
```

### 3. Earnings Service

**File:** `server/_core/earnings.ts`

```typescript
import { getDb } from "../db";
import { creatorEarnings, creatorPayouts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * Record an earning for a creator
 * Amount is in cents (e.g., 100 = $1.00)
 */
export async function recordEarning(
  artistId: number,
  earningType: string,
  amount: number,
  trackId?: number,
  playlistId?: number
) {
  const db = await getDatabase();
  await db.insert(creatorEarnings).values({
    artistId,
    trackId,
    playlistId,
    earningType,
    amount,
    createdAt: new Date(),
  });
}

/**
 * Get all earnings for an artist
 */
export async function getArtistEarnings(artistId: number) {
  const db = await getDatabase();
  return await db.query.creatorEarnings.findMany({
    where: (ce: any) => eq(ce.artistId, artistId),
  });
}

/**
 * Get total earnings for an artist (in cents)
 */
export async function getTotalEarnings(artistId: number) {
  const earnings = await getArtistEarnings(artistId);
  return earnings.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
}

/**
 * Get earnings breakdown by type
 */
export async function getEarningsByType(artistId: number) {
  const earnings = await getArtistEarnings(artistId);
  return {
    streams: earnings
      .filter((e: any) => e.earningType === "streams")
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
    downloads: earnings
      .filter((e: any) => e.earningType === "downloads")
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
    tips: earnings
      .filter((e: any) => e.earningType === "tips")
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
  };
}

/**
 * Get earnings for a specific period
 */
export async function getEarningsByPeriod(
  artistId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDatabase();
  const earnings = await db.query.creatorEarnings.findMany({
    where: (ce: any) => eq(ce.artistId, artistId),
  });

  return earnings.filter(
    (e: any) =>
      new Date(e.createdAt) >= startDate && new Date(e.createdAt) <= endDate
  );
}

/**
 * Request a payout
 */
export async function requestPayout(
  artistId: number,
  amount: number,
  paymentMethod: string
) {
  const db = await getDatabase();
  await db.insert(creatorPayouts).values({
    artistId,
    amount,
    paymentMethod,
    requestedAt: new Date(),
  });
  return { success: true };
}

/**
 * Get payout history for an artist
 */
export async function getPayoutHistory(artistId: number) {
  const db = await getDatabase();
  return await db.query.creatorPayouts.findMany({
    where: (cp: any) => eq(cp.artistId, artistId),
  });
}

/**
 * Update payout status (admin only)
 */
export async function updatePayoutStatus(
  payoutId: number,
  status: string,
  transactionId?: string
) {
  const db = await getDatabase();
  return await db
    .update(creatorPayouts)
    .set({
      status,
      transactionId,
      processedAt: new Date(),
    })
    .where(eq(creatorPayouts.id, payoutId));
}

/**
 * Get minimum payout threshold (in cents)
 */
export function getMinimumPayoutThreshold(): number {
  return 10000; // $100.00
}

/**
 * Check if artist can request payout
 */
export async function canRequestPayout(artistId: number): Promise<boolean> {
  const total = await getTotalEarnings(artistId);
  return total >= getMinimumPayoutThreshold();
}
```

### 4. Tips Service

**File:** `server/_core/tips.ts`

```typescript
import { getDb } from "../db";
import { tips, artistProfiles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { recordEarning } from "./earnings";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * Send a tip to another user
 * Amount is in cents (e.g., 500 = $5.00)
 */
export async function sendTip(
  senderId: number,
  recipientId: number,
  amount: number,
  message?: string,
  trackId?: number
) {
  const db = await getDatabase();

  // Get recipient's artist profile to record earning
  const recipientProfile = await db.query.artistProfiles.findFirst({
    where: (ap: any) => eq(ap.userId, recipientId),
  });

  if (recipientProfile) {
    await recordEarning(recipientProfile.id, "tips", amount, trackId);
  }

  await db.insert(tips).values({
    senderId,
    recipientId,
    amount,
    message,
    trackId,
    createdAt: new Date(),
  });

  return { success: true };
}

/**
 * Get all tips received by a user
 */
export async function getTipsReceived(recipientId: number) {
  const db = await getDatabase();
  return await db.query.tips.findMany({
    where: (t: any) => eq(t.recipientId, recipientId),
  });
}

/**
 * Get all tips sent by a user
 */
export async function getTipsSent(senderId: number) {
  const db = await getDatabase();
  return await db.query.tips.findMany({
    where: (t: any) => eq(t.senderId, senderId),
  });
}

/**
 * Get total tips received by a user (in cents)
 */
export async function getTotalTipsReceived(recipientId: number) {
  const allTips = await getTipsReceived(recipientId);
  return allTips.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
}

/**
 * Get total tips sent by a user (in cents)
 */
export async function getTotalTipsSent(senderId: number) {
  const allTips = await getTipsSent(senderId);
  return allTips.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
}

/**
 * Get recent tips received
 */
export async function getRecentTipsReceived(recipientId: number, limit = 10) {
  const db = await getDatabase();
  const allTips = await db.query.tips.findMany({
    where: (t: any) => eq(t.recipientId, recipientId),
  });

  return allTips
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}
```

### 5. Ads Service

**File:** `server/_core/ads.ts`

```typescript
import { getDb } from "../db";
import { userSubscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
};

/**
 * Check if user should see ads
 * Returns true if user has no active subscription
 */
export async function shouldShowAds(userId: number): Promise<boolean> {
  const db = await getDatabase();
  const subscription = await db.query.userSubscriptions.findFirst({
    where: (us: any) =>
      eq(us.userId, userId),
  });

  // Show ads if no subscription or subscription is not active
  if (!subscription) return true;
  if (subscription.status !== "active") return true;

  return false;
}

/**
 * Get available ads for display
 */
export async function getAdInventory() {
  return [
    {
      id: "ad-premium-upgrade",
      title: "Upgrade to Premium",
      description: "Enjoy ad-free listening and exclusive content",
      cta: "Upgrade Now",
      url: "/checkout?tier=premium",
      image: "https://via.placeholder.com/300x100?text=Premium+Upgrade",
    },
    {
      id: "ad-artist-tools",
      title: "Become an Artist",
      description: "Upload your music and start earning today",
      cta: "Learn More",
      url: "/artist-studio",
      image: "https://via.placeholder.com/300x100?text=Artist+Tools",
    },
    {
      id: "ad-supporter-tier",
      title: "Join Supporter Tier",
      description: "Unlimited access to all genres and exclusive perks",
      cta: "Subscribe",
      url: "/checkout?tier=supporter",
      image: "https://via.placeholder.com/300x100?text=Supporter+Tier",
    },
  ];
}

/**
 * Get random ad from inventory
 */
export async function getRandomAd() {
  const ads = await getAdInventory();
  return ads[Math.floor(Math.random() * ads.length)];
}

/**
 * Track ad impression
 */
export async function trackAdImpression(userId: number, adId: string) {
  console.log(`[AD] Impression: ${adId} by user ${userId}`);
  // Could store in database for analytics
}

/**
 * Track ad click
 */
export async function trackAdClick(userId: number, adId: string) {
  console.log(`[AD] Click: ${adId} by user ${userId}`);
  // Could store in database for analytics
}
```

---

## BACKEND ROUTERS

### 1. Artist Upload Router

**File:** `server/routers/artistUpload.ts`

```typescript
import { router, protectedProcedure } from "../_core/router";
import { z } from "zod";
import * as artistUploadService from "../_core/artistUpload";

export const artistUploadRouter = router({
  /**
   * Get current user's artist profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return await artistUploadService.getArtistProfileByUserId(ctx.user.id);
  }),

  /**
   * Create artist profile for current user
   */
  createProfile: protectedProcedure
    .input(z.object({ artistName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await artistUploadService.createOrGetArtistProfile(
        ctx.user.id,
        input.artistName
      );
    }),

  /**
   * Update artist profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        artistName: z.string().optional(),
        bio: z.string().optional(),
        genre: z.string().optional(),
        location: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await artistUploadService.getArtistProfileByUserId(
        ctx.user.id
      );
      if (!profile) throw new Error("Artist profile not found");
      return await artistUploadService.updateArtistProfile(profile.id, input);
    }),

  /**
   * Upload a new track
   */
  uploadTrack: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        genre: z.string().min(1),
        duration: z.number().positive(),
        bpm: z.number().optional(),
        key: z.string().optional(),
        isExplicit: z.boolean().optional(),
        downloadable: z.boolean().optional(),
        downloadPrice: z.number().optional(),
        audioBase64: z.string(),
        coverArtBase64: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await artistUploadService.getArtistProfileByUserId(
        ctx.user.id
      );
      if (!profile) throw new Error("Artist profile not found");

      const audioBuffer = Buffer.from(input.audioBase64, "base64");
      const coverBuffer = input.coverArtBase64
        ? Buffer.from(input.coverArtBase64, "base64")
        : undefined;

      return await artistUploadService.uploadTrack(profile.id, {
        title: input.title,
        description: input.description,
        genre: input.genre,
        audioFile: audioBuffer,
        coverArt: coverBuffer,
        duration: input.duration,
        bpm: input.bpm,
        key: input.key,
        isExplicit: input.isExplicit,
        downloadable: input.downloadable,
        downloadPrice: input.downloadPrice,
      });
    }),

  /**
   * Get all tracks for current user
   */
  getTracks: protectedProcedure
    .input(z.object({ onlyPublished: z.boolean().default(true) }))
    .query(async ({ ctx, input }) => {
      const profile = await artistUploadService.getArtistProfileByUserId(
        ctx.user.id
      );
      if (!profile) return [];
      return await artistUploadService.getArtistTracks(
        profile.id,
        input.onlyPublished
      );
    }),

  /**
   * Publish a track
   */
  publishTrack: protectedProcedure
    .input(z.object({ trackId: z.number() }))
    .mutation(async ({ input }) => {
      return await artistUploadService.publishTrack(input.trackId);
    }),

  /**
   * Delete a track
   */
  deleteTrack: protectedProcedure
    .input(z.object({ trackId: z.number() }))
    .mutation(async ({ input }) => {
      return await artistUploadService.deleteTrack(input.trackId);
    }),

  /**
   * Get artist statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const profile = await artistUploadService.getArtistProfileByUserId(
      ctx.user.id
    );
    if (!profile) return null;
    return await artistUploadService.getArtistStats(profile.id);
  }),

  /**
   * Get published tracks for discovery
   */
  getPublishedTracks: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return await artistUploadService.getPublishedTracks(input.limit, input.offset);
    }),

  /**
   * Get tracks by genre
   */
  getTracksByGenre: protectedProcedure
    .input(z.object({ genre: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await artistUploadService.getTracksByGenre(input.genre, input.limit);
    }),
});
```

### 2. Earnings Router

**File:** `server/routers/earnings.ts`

```typescript
import { router, protectedProcedure } from "../_core/router";
import { z } from "zod";
import * as earningsService from "../_core/earnings";
import * as artistUploadService from "../_core/artistUpload";

export const earningsRouter = router({
  /**
   * Get total earnings for current artist
   */
  getTotalEarnings: protectedProcedure.query(async ({ ctx }) => {
    const profile = await artistUploadService.getArtistProfileByUserId(
      ctx.user.id
    );
    if (!profile) return 0;
    return await earningsService.getTotalEarnings(profile.id);
  }),

  /**
   * Get earnings breakdown by type
   */
  getEarningsByType: protectedProcedure.query(async ({ ctx }) => {
    const profile = await artistUploadService.getArtistProfileByUserId(
      ctx.user.id
    );
    if (!profile) return { streams: 0, downloads: 0, tips: 0 };
    return await earningsService.getEarningsByType(profile.id);
  }),

  /**
   * Get earnings for a specific period
   */
  getEarningsByPeriod: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const profile = await artistUploadService.getArtistProfileByUserId(
        ctx.user.id
      );
      if (!profile) return [];
      return await earningsService.getEarningsByPeriod(
        profile.id,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),

  /**
   * Request a payout
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        paymentMethod: z.enum(["paypal", "stripe", "bank"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await artistUploadService.getArtistProfileByUserId(
        ctx.user.id
      );
      if (!profile) throw new Error("Artist profile not found");

      // Check minimum threshold
      const canRequest = await earningsService.canRequestPayout(profile.id);
      if (!canRequest) {
        throw new Error(
          `Minimum payout is $${earningsService.getMinimumPayoutThreshold() / 100}`
        );
      }

      return await earningsService.requestPayout(
        profile.id,
        input.amount,
        input.paymentMethod
      );
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure.query(async ({ ctx }) => {
    const profile = await artistUploadService.getArtistProfileByUserId(
      ctx.user.id
    );
    if (!profile) return [];
    return await earningsService.getPayoutHistory(profile.id);
  }),

  /**
   * Check if can request payout
   */
  canRequestPayout: protectedProcedure.query(async ({ ctx }) => {
    const profile = await artistUploadService.getArtistProfileByUserId(
      ctx.user.id
    );
    if (!profile) return false;
    return await earningsService.canRequestPayout(profile.id);
  }),

  /**
   * Get minimum payout threshold
   */
  getMinimumPayoutThreshold: protectedProcedure.query(async () => {
    return earningsService.getMinimumPayoutThreshold();
  }),
});
```

### 3. Playlists Router

**File:** `server/routers/playlists.ts`

```typescript
import { router, protectedProcedure, publicProcedure } from "../_core/router";
import { z } from "zod";
import * as playlistService from "../_core/playlists";

export const playlistsRouter = router({
  /**
   * Create a new playlist
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await playlistService.createPlaylist(
        ctx.user.id,
        input.name,
        input.description
      );
    }),

  /**
   * Get all playlists for current user
   */
  getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    return await playlistService.getUserPlaylists(ctx.user.id);
  }),

  /**
   * Get a single playlist
   */
  getPlaylist: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .query(async ({ input }) => {
      return await playlistService.getPlaylistById(input.playlistId);
    }),

  /**
   * Update playlist
   */
  update: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await playlistService.updatePlaylist(input.playlistId, {
        name: input.name,
        description: input.description,
      });
    }),

  /**
   * Delete playlist
   */
  delete: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(async ({ input }) => {
      return await playlistService.deletePlaylist(input.playlistId);
    }),

  /**
   * Publish playlist (make public)
   */
  publish: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(async ({ input }) => {
      return await playlistService.publishPlaylist(input.playlistId);
    }),

  /**
   * Unpublish playlist (make private)
   */
  unpublish: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(async ({ input }) => {
      return await playlistService.unpublishPlaylist(input.playlistId);
    }),

  /**
   * Follow a playlist
   */
  follow: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await playlistService.followPlaylist(input.playlistId, ctx.user.id);
    }),

  /**
   * Unfollow a playlist
   */
  unfollow: protectedProcedure
    .input(z.object({ playlistId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await playlistService.unfollowPlaylist(input.playlistId, ctx.user.id);
    }),

  /**
   * Share a playlist
   */
  share: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        platform: z.enum(["twitter", "facebook", "whatsapp", "copy"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await playlistService.sharePlaylist(
        input.playlistId,
        ctx.user.id,
        input.platform
      );
    }),

  /**
   * Get playlist followers
   */
  getFollowers: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .query(async ({ input }) => {
      return await playlistService.getPlaylistFollowers(input.playlistId);
    }),

  /**
   * Get public playlists
   */
  getPublic: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return await playlistService.getPublicPlaylists(input.limit, input.offset);
    }),
});
```

### 4. Tips Router

**File:** `server/routers/tips.ts`

```typescript
import { router, protectedProcedure } from "../_core/router";
import { z } from "zod";
import * as tipsService from "../_core/tips";

export const tipsRouter = router({
  /**
   * Send a tip to another user
   */
  sendTip: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        amount: z.number().positive(),
        message: z.string().optional(),
        trackId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.recipientId) {
        throw new Error("Cannot tip yourself");
      }
      return await tipsService.sendTip(
        ctx.user.id,
        input.recipientId,
        input.amount,
        input.message,
        input.trackId
      );
    }),

  /**
   * Get tips received by current user
   */
  getTipsReceived: protectedProcedure.query(async ({ ctx }) => {
    return await tipsService.getTipsReceived(ctx.user.id);
  }),

  /**
   * Get tips sent by current user
   */
  getTipsSent: protectedProcedure.query(async ({ ctx }) => {
    return await tipsService.getTipsSent(ctx.user.id);
  }),

  /**
   * Get total tips received
   */
  getTotalTipsReceived: protectedProcedure.query(async ({ ctx }) => {
    return await tipsService.getTotalTipsReceived(ctx.user.id);
  }),

  /**
   * Get total tips sent
   */
  getTotalTipsSent: protectedProcedure.query(async ({ ctx }) => {
    return await tipsService.getTotalTipsSent(ctx.user.id);
  }),

  /**
   * Get recent tips received
   */
  getRecentTipsReceived: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      return await tipsService.getRecentTipsReceived(ctx.user.id, input.limit);
    }),
});
```

### 5. Ads Router

**File:** `server/routers/ads.ts`

```typescript
import { router, protectedProcedure } from "../_core/router";
import * as adsService from "../_core/ads";

export const adsRouter = router({
  /**
   * Check if current user should see ads
   */
  shouldShowAds: protectedProcedure.query(async ({ ctx }) => {
    return await adsService.shouldShowAds(ctx.user.id);
  }),

  /**
   * Get available ads
   */
  getAdInventory: protectedProcedure.query(async () => {
    return await adsService.getAdInventory();
  }),

  /**
   * Get a random ad
   */
  getRandomAd: protectedProcedure.query(async () => {
    return await adsService.getRandomAd();
  }),

  /**
   * Track ad impression
   */
  trackImpression: protectedProcedure.mutation(async ({ ctx }) => {
    // This would be called when ad is displayed
    return { success: true };
  }),

  /**
   * Track ad click
   */
  trackClick: protectedProcedure.mutation(async ({ ctx }) => {
    // This would be called when user clicks ad
    return { success: true };
  }),
});
```

---

## FRONTEND COMPONENTS

### 1. Artist Studio Page

**File:** `client/src/pages/ArtistStudio.tsx`

```typescript
import { useState } from "react";
import { trpc } from "../lib/trpc";
import "./ArtistStudio.css";

export default function ArtistStudio() {
  const [activeTab, setActiveTab] = useState<"profile" | "upload" | "tracks">(
    "profile"
  );
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    genre: "Hip-Hop",
    bpm: 120,
    key: "C",
    isExplicit: false,
    downloadable: false,
    downloadPrice: 0,
  });

  // Queries
  const { data: profile, isLoading: profileLoading } =
    trpc.artistUpload.getProfile.useQuery();
  const { data: tracks, refetch: refetchTracks } =
    trpc.artistUpload.getTracks.useQuery({ onlyPublished: false });
  const { data: stats } = trpc.artistUpload.getStats.useQuery();

  // Mutations
  const updateProfileMutation = trpc.artistUpload.updateProfile.useMutation({
    onSuccess: () => alert("Profile updated!"),
  });
  const uploadTrackMutation = trpc.artistUpload.uploadTrack.useMutation({
    onSuccess: () => {
      alert("Track uploaded successfully!");
      refetchTracks();
      setUploadForm({
        title: "",
        description: "",
        genre: "Hip-Hop",
        bpm: 120,
        key: "C",
        isExplicit: false,
        downloadable: false,
        downloadPrice: 0,
      });
    },
    onError: (error) => alert("Upload failed: " + error.message),
  });
  const publishTrackMutation = trpc.artistUpload.publishTrack.useMutation({
    onSuccess: () => {
      alert("Track published!");
      refetchTracks();
    },
  });
  const deleteTrackMutation = trpc.artistUpload.deleteTrack.useMutation({
    onSuccess: () => {
      alert("Track deleted!");
      refetchTracks();
    },
  });

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const audioFile = formData.get("audioFile") as File;
    const coverArt = formData.get("coverArt") as File;

    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }

    try {
      const audioBase64 = await fileToBase64(audioFile);
      const coverBase64 = coverArt ? await fileToBase64(coverArt) : undefined;

      await uploadTrackMutation.mutateAsync({
        ...uploadForm,
        audioBase64,
        coverArtBase64: coverBase64,
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (profileLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="artist-studio">
      <div className="studio-header">
        <h1>🎵 Artist Studio</h1>
        <p>Manage your music, profile, and earnings</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <span className="stat-label">Tracks</span>
            <span className="stat-value">{stats.trackCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Plays</span>
            <span className="stat-value">{stats.totalPlays.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Likes</span>
            <span className="stat-value">{stats.totalLikes.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Downloads</span>
            <span className="stat-value">{stats.totalDownloads.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="studio-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </button>
        <button
          className={`tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          📤 Upload Track
        </button>
        <button
          className={`tab ${activeTab === "tracks" ? "active" : ""}`}
          onClick={() => setActiveTab("tracks")}
        >
          🎵 My Tracks ({tracks?.length || 0})
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="studio-content">
          <h2>Artist Profile</h2>
          <form
            className="profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateProfileMutation.mutate({
                artistName: (formData.get("artistName") as string) || undefined,
                bio: (formData.get("bio") as string) || undefined,
                genre: (formData.get("genre") as string) || undefined,
                location: (formData.get("location") as string) || undefined,
                website: (formData.get("website") as string) || undefined,
              });
            }}
          >
            <div className="form-group">
              <label>Artist Name</label>
              <input
                type="text"
                name="artistName"
                defaultValue={profile?.artistName}
                placeholder="Your artist name"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio || ""}
                placeholder="Tell fans about yourself"
                rows={4}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Genre</label>
                <select name="genre" defaultValue={profile?.genre || ""}>
                  <option value="">Select a genre</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Country">Country</option>
                  <option value="Gospel">Gospel</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={profile?.location || ""}
                  placeholder="City, Country"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                defaultValue={profile?.website || ""}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="studio-content">
          <h2>Upload New Track</h2>
          <form className="upload-form" onSubmit={handleUploadTrack}>
            <div className="form-group">
              <label>Track Title *</label>
              <input
                type="text"
                name="title"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, title: e.target.value })
                }
                placeholder="Song title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, description: e.target.value })
                }
                placeholder="Tell fans about this track"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Genre *</label>
                <select
                  value={uploadForm.genre}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, genre: e.target.value })
                  }
                >
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Country">Country</option>
                  <option value="Gospel">Gospel</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duration (seconds) *</label>
                <input
                  type="number"
                  value={uploadForm.duration || ""}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="180"
                  required
                />
              </div>

              <div className="form-group">
                <label>BPM</label>
                <input
                  type="number"
                  value={uploadForm.bpm}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      bpm: parseInt(e.target.value) || 120,
                    })
                  }
                  min="60"
                  max="200"
                />
              </div>

              <div className="form-group">
                <label>Key</label>
                <select
                  value={uploadForm.key}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, key: e.target.value })
                  }
                >
                  <option value="C">C</option>
                  <option value="C#">C#</option>
                  <option value="D">D</option>
                  <option value="D#">D#</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="F#">F#</option>
                  <option value="G">G</option>
                  <option value="G#">G#</option>
                  <option value="A">A</option>
                  <option value="A#">A#</option>
                  <option value="B">B</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Audio File * (MP3, WAV, etc.)</label>
              <input
                type="file"
                name="audioFile"
                accept="audio/*"
                required
              />
            </div>

            <div className="form-group">
              <label>Cover Art (JPG, PNG, etc.)</label>
              <input type="file" name="coverArt" accept="image/*" />
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="explicit"
                checked={uploadForm.isExplicit}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, isExplicit: e.target.checked })
                }
              />
              <label htmlFor="explicit">Explicit Content</label>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="downloadable"
                checked={uploadForm.downloadable}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    downloadable: e.target.checked,
                  })
                }
              />
              <label htmlFor="downloadable">Allow Downloads</label>
            </div>

            {uploadForm.downloadable && (
              <div className="form-group">
                <label>Download Price ($)</label>
                <input
                  type="number"
                  value={uploadForm.downloadPrice}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      downloadPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.99"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={uploadTrackMutation.isPending}
            >
              {uploadTrackMutation.isPending ? "Uploading..." : "Upload Track"}
            </button>
          </form>
        </div>
      )}

      {/* Tracks Tab */}
      {activeTab === "tracks" && (
        <div className="studio-content">
          <h2>My Tracks</h2>
          {tracks && tracks.length > 0 ? (
            <div className="tracks-list">
              {tracks.map((track: any) => (
                <div key={track.id} className="track-item">
                  {track.coverArtUrl && (
                    <img
                      src={track.coverArtUrl}
                      alt={track.title}
                      className="track-cover"
                    />
                  )}
                  <div className="track-info">
                    <h4>{track.title}</h4>
                    <p className="genre">{track.genre}</p>
                    <p className="stats">
                      {track.plays} plays • {track.downloads} downloads •{" "}
                      {track.likes} likes
                    </p>
                    <p className={`status ${track.isPublished ? "published" : "draft"}`}>
                      {track.isPublished ? "✓ Published" : "⚠ Draft"}
                    </p>
                  </div>
                  <div className="track-actions">
                    {!track.isPublished && (
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          publishTrackMutation.mutate({ trackId: track.id })
                        }
                      >
                        Publish
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() =>
                        deleteTrackMutation.mutate({ trackId: track.id })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No tracks yet. Start by uploading your first track!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Creator Dashboard

**File:** `client/src/pages/CreatorDashboard.tsx`

```typescript
import { trpc } from "../lib/trpc";
import "./CreatorDashboard.css";
import { useState } from "react";

export default function CreatorDashboard() {
  const [payoutAmount, setPayoutAmount] = useState(100);

  const { data: totalEarnings } = trpc.earnings.getTotalEarnings.useQuery();
  const { data: earningsByType } = trpc.earnings.getEarningsByType.useQuery();
  const { data: payoutHistory } = trpc.earnings.getPayoutHistory.useQuery();
  const { data: canRequest } = trpc.earnings.canRequestPayout.useQuery();
  const { data: minThreshold } = trpc.earnings.getMinimumPayoutThreshold.useQuery();

  const requestPayoutMutation = trpc.earnings.requestPayout.useMutation({
    onSuccess: () => {
      alert("Payout requested successfully!");
      setPayoutAmount(100);
    },
    onError: (error) => alert("Error: " + error.message),
  });

  const handleRequestPayout = async (amount: number) => {
    await requestPayoutMutation.mutateAsync({
      amount: amount * 100, // Convert to cents
      paymentMethod: "paypal",
    });
  };

  const earningsInDollars = (totalEarnings || 0) / 100;
  const streamsInDollars = (earningsByType?.streams || 0) / 100;
  const downloadsInDollars = (earningsByType?.downloads || 0) / 100;
  const tipsInDollars = (earningsByType?.tips || 0) / 100;

  return (
    <div className="creator-dashboard">
      <div className="dashboard-header">
        <h1>💰 Creator Dashboard</h1>
        <p>Track your earnings and manage payouts</p>
      </div>

      {/* Earnings Overview */}
      <div className="earnings-overview">
        <div className="earnings-card primary">
          <div className="earnings-icon">💵</div>
          <div className="earnings-content">
            <h3>Total Earnings</h3>
            <p className="earnings-amount">${earningsInDollars.toFixed(2)}</p>
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-icon">▶️</div>
          <div className="earnings-content">
            <h3>Streams</h3>
            <p className="earnings-amount">${streamsInDollars.toFixed(2)}</p>
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-icon">⬇️</div>
          <div className="earnings-content">
            <h3>Downloads</h3>
            <p className="earnings-amount">${downloadsInDollars.toFixed(2)}</p>
          </div>
        </div>

        <div className="earnings-card">
          <div className="earnings-icon">❤️</div>
          <div className="earnings-content">
            <h3>Tips</h3>
            <p className="earnings-amount">${tipsInDollars.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payout Section */}
      <div className="payout-section">
        <h2>Request Payout</h2>
        <p className="payout-info">
          Minimum payout: ${(minThreshold || 10000) / 100}
        </p>

        <div className="payout-form">
          <div className="form-group">
            <label>Payout Amount ($)</label>
            <input
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
              min={minThreshold ? minThreshold / 100 : 100}
              step="10"
            />
          </div>

          <button
            className="btn-primary"
            onClick={() => handleRequestPayout(payoutAmount)}
            disabled={!canRequest || requestPayoutMutation.isPending}
          >
            {requestPayoutMutation.isPending
              ? "Processing..."
              : `Request $${payoutAmount.toFixed(2)} Payout`}
          </button>

          {!canRequest && (
            <p className="warning">
              You need at least ${(minThreshold || 10000) / 100} to request a payout.
            </p>
          )}
        </div>

        <div className="payout-options">
          <button
            className="quick-payout"
            onClick={() => handleRequestPayout(100)}
            disabled={(totalEarnings || 0) < 10000}
          >
            $100
          </button>
          <button
            className="quick-payout"
            onClick={() => handleRequestPayout(500)}
            disabled={(totalEarnings || 0) < 50000}
          >
            $500
          </button>
          <button
            className="quick-payout"
            onClick={() => handleRequestPayout(1000)}
            disabled={(totalEarnings || 0) < 100000}
          >
            $1000
          </button>
        </div>
      </div>

      {/* Payout History */}
      <div className="payout-history">
        <h2>Payout History</h2>
        {payoutHistory && payoutHistory.length > 0 ? (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((payout: any) => (
                  <tr key={payout.id}>
                    <td>{new Date(payout.requestedAt).toLocaleDateString()}</td>
                    <td>${(payout.amount / 100).toFixed(2)}</td>
                    <td>{payout.paymentMethod}</td>
                    <td>
                      <span className={`status-badge ${payout.status}`}>
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No payouts yet. Start earning to request a payout!</p>
        )}
      </div>
    </div>
  );
}
```

### 3. Ad Banner Component

**File:** `client/src/components/AdBanner.tsx`

```typescript
import { trpc } from "../lib/trpc";
import "./AdBanner.css";
import { useState } from "react";

export default function AdBanner() {
  const [visible, setVisible] = useState(true);
  const { data: shouldShow } = trpc.ads.shouldShowAds.useQuery();
  const { data: ad } = trpc.ads.getRandomAd.useQuery();

  if (!visible || !shouldShow || !ad) return null;

  return (
    <div className="ad-banner">
      <div className="ad-content">
        <h4>{ad.title}</h4>
        <p>{ad.description}</p>
        <a href={ad.url} className="ad-cta">
          {ad.cta} →
        </a>
      </div>
      <button className="ad-close" onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  );
}
```

### CSS Files

**File:** `client/src/pages/ArtistStudio.css`

```css
.artist-studio {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.studio-header {
  margin-bottom: 2rem;
}

.studio-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.studio-header p {
  color: #666;
  font-size: 1rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.studio-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  overflow-x: auto;
}

.tab {
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.studio-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.studio-content h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.profile-form,
.upload-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox input {
  width: auto;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background: #ee5a5a;
}

.tracks-list {
  display: grid;
  gap: 1rem;
}

.track-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  align-items: center;
  transition: all 0.3s;
}

.track-item:hover {
  background: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.track-cover {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-info {
  flex: 1;
}

.track-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.track-info .genre {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.track-info .stats {
  color: #999;
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0;
}

.track-info .status {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
}

.track-info .status.published {
  color: #28a745;
}

.track-info .status.draft {
  color: #ffc107;
}

.track-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .artist-studio {
    padding: 1rem;
  }

  .studio-header h1 {
    font-size: 1.5rem;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .track-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .track-actions {
    width: 100%;
  }

  .track-actions button {
    flex: 1;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
```

**File:** `client/src/pages/CreatorDashboard.css`

```css
.creator-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.dashboard-header p {
  color: #666;
  font-size: 1rem;
}

.earnings-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.earnings-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s;
}

.earnings-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.earnings-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.earnings-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.earnings-content {
  flex: 1;
}

.earnings-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.earnings-amount {
  margin: 0;
  font-size: 1.75rem;
  font-weight: bold;
}

.payout-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.payout-section h2 {
  margin-bottom: 1rem;
}

.payout-info {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.payout-form {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.warning {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin: 0;
}

.payout-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.quick-payout {
  padding: 1rem;
  background: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.quick-payout:hover:not(:disabled) {
  border-color: #667eea;
  background: #f5f5ff;
}

.quick-payout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payout-history {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payout-history h2 {
  margin-bottom: 1.5rem;
}

.history-table-wrapper {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #eee;
  font-weight: 600;
  color: #333;
}

.history-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.history-table tbody tr:hover {
  background: #f9f9f9;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.processing {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}

@media (max-width: 768px) {
  .creator-dashboard {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .earnings-overview {
    grid-template-columns: 1fr;
  }

  .earnings-card {
    flex-direction: column;
    text-align: center;
  }

  .payout-options {
    grid-template-columns: 1fr;
  }

  .history-table-wrapper {
    font-size: 0.9rem;
  }

  .history-table th,
  .history-table td {
    padding: 0.75rem;
  }
}
```

**File:** `client/src/components/AdBanner.css`

```css
.ad-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ad-content {
  flex: 1;
}

.ad-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.ad-content p {
  margin: 0 0 1rem 0;
  opacity: 0.95;
  font-size: 0.95rem;
}

.ad-cta {
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.ad-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ad-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  flex-shrink: 0;
  transition: all 0.3s;
}

.ad-close:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .ad-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .ad-close {
    margin-left: 0;
    align-self: flex-end;
  }
}
```

---

## INTEGRATION STEPS

### Step 1: Create Backend Services

Create these files in `server/_core/`:

```bash
touch server/_core/artistUpload.ts
touch server/_core/playlists.ts
touch server/_core/earnings.ts
touch server/_core/tips.ts
touch server/_core/ads.ts
```

Copy the code from the Backend Services section above into each file.

### Step 2: Create Backend Routers

Create these files in `server/routers/`:

```bash
touch server/routers/artistUpload.ts
touch server/routers/earnings.ts
touch server/routers/playlists.ts
touch server/routers/tips.ts
touch server/routers/ads.ts
```

Copy the code from the Backend Routers section above into each file.

### Step 3: Update Main Router

Edit `server/routers.ts` and add these imports and routers:

```typescript
import { artistUploadRouter } from "./routers/artistUpload";
import { earningsRouter } from "./routers/earnings";
import { playlistsRouter } from "./routers/playlists";
import { tipsRouter } from "./routers/tips";
import { adsRouter } from "./routers/ads";

export const appRouter = router({
  // ... existing routers ...
  artistUpload: artistUploadRouter,
  earnings: earningsRouter,
  playlists: playlistsRouter,
  tips: tipsRouter,
  ads: adsRouter,
});
```

### Step 4: Create Frontend Components

Create these files in `client/src/`:

```bash
touch client/src/pages/ArtistStudio.tsx
touch client/src/pages/ArtistStudio.css
touch client/src/pages/CreatorDashboard.tsx
touch client/src/pages/CreatorDashboard.css
touch client/src/components/AdBanner.tsx
touch client/src/components/AdBanner.css
```

Copy the code from the Frontend Components section above into each file.

### Step 5: Update App Routes

Edit `client/src/App.tsx` and add these imports and routes:

```typescript
import ArtistStudio from "./pages/ArtistStudio";
import CreatorDashboard from "./pages/CreatorDashboard";
import AdBanner from "./components/AdBanner";

// In your routes (inside your router):
<Route path="/artist-studio" element={<ArtistStudio />} />
<Route path="/creator-dashboard" element={<CreatorDashboard />} />

// Add AdBanner to your main layout (e.g., in App.tsx or a layout component):
<AdBanner />
```

### Step 6: Update Navigation

Add links to your navigation component:

```typescript
<Link to="/artist-studio">🎵 Artist Studio</Link>
<Link to="/creator-dashboard">💰 Creator Dashboard</Link>
```

### Step 7: Apply Database Migrations

```bash
cd /home/ubuntu/gifted_eternity_stream_web
pnpm db:push
```

### Step 8: Test

```bash
pnpm dev
```

Visit:
- http://localhost:3000/artist-studio
- http://localhost:3000/creator-dashboard

---

## TESTING GUIDE

### Unit Tests

Create `server/artistUpload.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import * as artistUploadService from "./_core/artistUpload";

describe("Artist Upload Service", () => {
  it("should create artist profile", async () => {
    const profile = await artistUploadService.createOrGetArtistProfile(
      1,
      "Test Artist"
    );
    expect(profile).toBeDefined();
    expect(profile?.artistName).toBe("Test Artist");
  });
});
```

Run tests:

```bash
pnpm test
```

### Manual Testing Checklist

- [ ] Create artist profile
- [ ] Upload track with audio and cover art
- [ ] Publish track
- [ ] View track statistics
- [ ] Create playlist
- [ ] Follow playlist
- [ ] Share playlist
- [ ] Send tip to another user
- [ ] View earnings dashboard
- [ ] Request payout
- [ ] View ads (if not subscribed)
- [ ] No ads (if subscribed)

---

## DEPLOYMENT CHECKLIST

- [ ] All files created
- [ ] Database migrations applied (`pnpm db:push`)
- [ ] All routers integrated into `server/routers.ts`
- [ ] All routes added to `client/src/App.tsx`
- [ ] Navigation links added
- [ ] No TypeScript errors (`pnpm build`)
- [ ] Tests passing (`pnpm test`)
- [ ] Manual testing completed
- [ ] Ready for production

---

## TROUBLESHOOTING

### Database Connection Error

```
Error: Database not available
```

**Solution:** Make sure `DATABASE_URL` environment variable is set and database is running.

### Import Errors

```
Cannot find module '../_core/artistUpload'
```

**Solution:** Make sure all files are created in correct directories and imports use correct paths.

### TypeScript Errors

```
Property 'artistUploads' does not exist on type '{}'
```

**Solution:** Make sure all tables are added to `drizzle/schema.ts` and `pnpm db:push` was run.

### tRPC Errors

```
No procedure found
```

**Solution:** Make sure routers are imported and added to `appRouter` in `server/routers.ts`.

---

## NEXT STEPS

1. **Implement Phase 2 features** following this guide
2. **Test thoroughly** with manual and automated tests
3. **Deploy to production** when ready
4. **Monitor analytics** to track user engagement
5. **Plan Phase 3** with additional features

---

**Total Implementation Time:** 6-8 weeks  
**Team Size:** 3-4 developers  
**Estimated Revenue:** $150k+/month at scale

Good luck! 🚀
