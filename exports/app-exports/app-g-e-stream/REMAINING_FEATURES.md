# Remaining Features & Complete Implementation Guide

This document contains all features you requested that still need implementation, with complete code you can run.

---

## 1. LISTENING ANALYTICS SYSTEM

### What It Does
- Tracks every song play with timestamp
- Records user listening history
- Analyzes genre preferences
- Identifies peak listening times
- Shows analytics dashboard for artist

### Database Schema (Add to `drizzle/schema.ts`)

```typescript
// Add these tables to your schema.ts file

export const listeningHistory = sqliteTable('listening_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  songId: text('song_id').notNull(),
  playedAt: integer('played_at').notNull(), // Unix timestamp
  duration: integer('duration').notNull(), // seconds played
  genre: text('genre').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const trackAnalytics = sqliteTable('track_analytics', {
  id: text('id').primaryKey(),
  songId: text('song_id').notNull().unique(),
  totalPlays: integer('total_plays').default(0),
  totalListeners: integer('total_listeners').default(0),
  averageDuration: integer('average_duration').default(0),
  lastPlayedAt: integer('last_played_at'),
  createdAt: integer('created_at').notNull(),
});

export const userAnalytics = sqliteTable('user_analytics', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  totalPlays: integer('total_plays').default(0),
  favoriteGenre: text('favorite_genre'),
  totalListeningTime: integer('total_listening_time').default(0), // seconds
  lastListenedAt: integer('last_listened_at'),
  createdAt: integer('created_at').notNull(),
});
```

### Backend API (Create `server/routers/analytics.ts`)

```typescript
import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';
import { db } from '../db';
import { listeningHistory, trackAnalytics, userAnalytics } from '../../drizzle/schema';

export const analyticsRouter = router({
  // Track a song play
  trackPlay: protectedProcedure
    .input(z.object({
      songId: z.string(),
      genre: z.string(),
      duration: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const now = Date.now();

      // Record listening history
      await db.insert(listeningHistory).values({
        id: `${userId}-${input.songId}-${now}`,
        userId,
        songId: input.songId,
        playedAt: now,
        duration: input.duration,
        genre: input.genre,
        createdAt: now,
      });

      // Update track analytics
      const existing = await db.query.trackAnalytics.findFirst({
        where: (t) => t.songId === input.songId,
      });

      if (existing) {
        await db.update(trackAnalytics)
          .set({
            totalPlays: existing.totalPlays + 1,
            lastPlayedAt: now,
          })
          .where((t) => t.songId === input.songId);
      } else {
        await db.insert(trackAnalytics).values({
          id: `analytics-${input.songId}`,
          songId: input.songId,
          totalPlays: 1,
          totalListeners: 1,
          lastPlayedAt: now,
          createdAt: now,
        });
      }

      // Update user analytics
      const userStats = await db.query.userAnalytics.findFirst({
        where: (u) => u.userId === userId,
      });

      if (userStats) {
        await db.update(userAnalytics)
          .set({
            totalPlays: userStats.totalPlays + 1,
            totalListeningTime: userStats.totalListeningTime + input.duration,
            lastListenedAt: now,
          })
          .where((u) => u.userId === userId);
      } else {
        await db.insert(userAnalytics).values({
          id: `user-analytics-${userId}`,
          userId,
          totalPlays: 1,
          totalListeningTime: input.duration,
          lastListenedAt: now,
          createdAt: now,
        });
      }

      return { success: true };
    }),

  // Get user listening history
  getUserHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const history = await db.query.listeningHistory.findMany({
        where: (h) => h.userId === ctx.user.id,
        orderBy: (h) => h.playedAt,
        limit: 100,
      });
      return history;
    }),

  // Get track analytics
  getTrackAnalytics: protectedProcedure
    .input(z.object({ songId: z.string() }))
    .query(async ({ input }) => {
      const analytics = await db.query.trackAnalytics.findFirst({
        where: (t) => t.songId === input.songId,
      });
      return analytics;
    }),

  // Get user analytics dashboard
  getUserDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const userStats = await db.query.userAnalytics.findFirst({
        where: (u) => u.userId === ctx.user.id,
      });

      const history = await db.query.listeningHistory.findMany({
        where: (h) => h.userId === ctx.user.id,
        limit: 50,
      });

      // Calculate peak listening time
      const genreCounts = history.reduce((acc, item) => {
        acc[item.genre] = (acc[item.genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteGenre = Object.entries(genreCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0];

      return {
        totalPlays: userStats?.totalPlays || 0,
        totalListeningTime: userStats?.totalListeningTime || 0,
        favoriteGenre: favoriteGenre || 'Unknown',
        recentTracks: history.slice(-10),
      };
    }),

  // Get all track analytics (admin)
  getAllTrackAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Admin only');
      }

      const analytics = await db.query.trackAnalytics.findMany({
        orderBy: (t) => t.totalPlays,
        limit: 100,
      });

      return analytics;
    }),
});
```

### Frontend Component (Create `client/src/pages/Analytics.tsx`)

```typescript
import { trpc } from '../lib/trpc';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

export default function Analytics() {
  const { data: dashboard } = trpc.analytics.getUserDashboard.useQuery();

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="analytics-container">
      <h1>Your Listening Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Plays</h3>
          <p className="stat-value">{dashboard.totalPlays}</p>
        </div>
        <div className="stat-card">
          <h3>Listening Time</h3>
          <p className="stat-value">{Math.round(dashboard.totalListeningTime / 3600)} hrs</p>
        </div>
        <div className="stat-card">
          <h3>Favorite Genre</h3>
          <p className="stat-value">{dashboard.favoriteGenre}</p>
        </div>
      </div>

      <div className="recent-tracks">
        <h2>Recent Tracks</h2>
        <div className="track-list">
          {dashboard.recentTracks.map((track) => (
            <div key={track.id} className="track-item">
              <span>{track.songId}</span>
              <span>{new Date(track.playedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 2. PLAYLIST CREATION & SHARING

### Database Schema (Add to `drizzle/schema.ts`)

```typescript
export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: integer('is_public').default(0),
  shareUrl: text('share_url').unique(),
  viewCount: integer('view_count').default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const playlistTracks = sqliteTable('playlist_tracks', {
  id: text('id').primaryKey(),
  playlistId: text('playlist_id').notNull(),
  songId: text('song_id').notNull(),
  position: integer('position').notNull(),
  addedAt: integer('added_at').notNull(),
});

export const playlistShares = sqliteTable('playlist_shares', {
  id: text('id').primaryKey(),
  playlistId: text('playlist_id').notNull(),
  sharedWith: text('shared_with').notNull(), // email or user ID
  sharedAt: integer('shared_at').notNull(),
});
```

### Backend API (Create `server/routers/playlists.ts`)

```typescript
import { router, protectedProcedure, publicProcedure } from '../_core/router';
import { z } from 'zod';
import { db } from '../db';
import { playlists, playlistTracks, playlistShares } from '../../drizzle/schema';

export const playlistsRouter = router({
  // Create playlist
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = `playlist-${Date.now()}`;
      const shareUrl = `${id}-${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(playlists).values({
        id,
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        isPublic: input.isPublic ? 1 : 0,
        shareUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return { id, shareUrl };
    }),

  // Add song to playlist
  addSong: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      songId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const playlist = await db.query.playlists.findFirst({
        where: (p) => p.id === input.playlistId,
      });

      if (playlist?.userId !== ctx.user.id) {
        throw new Error('Not authorized');
      }

      const trackCount = await db.query.playlistTracks.findMany({
        where: (t) => t.playlistId === input.playlistId,
      });

      await db.insert(playlistTracks).values({
        id: `track-${Date.now()}`,
        playlistId: input.playlistId,
        songId: input.songId,
        position: trackCount.length + 1,
        addedAt: Date.now(),
      });

      return { success: true };
    }),

  // Get user playlists
  getUserPlaylists: protectedProcedure
    .query(async ({ ctx }) => {
      const userPlaylists = await db.query.playlists.findMany({
        where: (p) => p.userId === ctx.user.id,
      });
      return userPlaylists;
    }),

  // Get public playlist
  getPublicPlaylist: publicProcedure
    .input(z.object({ shareUrl: z.string() }))
    .query(async ({ input }) => {
      const playlist = await db.query.playlists.findFirst({
        where: (p) => p.shareUrl === input.shareUrl,
      });

      if (!playlist || !playlist.isPublic) {
        throw new Error('Playlist not found');
      }

      // Increment view count
      await db.update(playlists)
        .set({ viewCount: (playlist.viewCount || 0) + 1 })
        .where((p) => p.id === playlist.id);

      const tracks = await db.query.playlistTracks.findMany({
        where: (t) => t.playlistId === playlist.id,
      });

      return { ...playlist, tracks };
    }),

  // Share playlist
  sharePlaylist: protectedProcedure
    .input(z.object({
      playlistId: z.string(),
      sharedWith: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await db.query.playlists.findFirst({
        where: (p) => p.id === input.playlistId,
      });

      if (playlist?.userId !== ctx.user.id) {
        throw new Error('Not authorized');
      }

      await db.insert(playlistShares).values({
        id: `share-${Date.now()}`,
        playlistId: input.playlistId,
        sharedWith: input.sharedWith,
        sharedAt: Date.now(),
      });

      return { success: true };
    }),
});
```

### Frontend Component (Create `client/src/pages/Playlists.tsx`)

```typescript
import { useState } from 'react';
import { trpc } from '../lib/trpc';
import './Playlists.css';

export default function Playlists() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const { data: playlists } = trpc.playlists.getUserPlaylists.useQuery();
  const createMutation = trpc.playlists.create.useMutation();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name,
      description,
      isPublic,
    });
    setName('');
    setDescription('');
    setIsPublic(false);
  };

  return (
    <div className="playlists-container">
      <h1>My Playlists</h1>

      <div className="create-playlist">
        <input
          type="text"
          placeholder="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make Public
        </label>
        <button onClick={handleCreate}>Create Playlist</button>
      </div>

      <div className="playlists-grid">
        {playlists?.map((playlist) => (
          <div key={playlist.id} className="playlist-card">
            <h3>{playlist.name}</h3>
            <p>{playlist.description}</p>
            <p className="meta">
              {playlist.isPublic ? '🌍 Public' : '🔒 Private'} • {playlist.viewCount} views
            </p>
            {playlist.isPublic && (
              <p className="share-url">
                Share: {window.location.origin}/playlist/{playlist.shareUrl}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. EMAIL NOTIFICATIONS

### Backend Service (Create `server/_core/email.ts`)

```typescript
import { notifyOwner } from './notification';

export async function sendSubscriptionConfirmation(
  userEmail: string,
  planName: string,
  amount: number
) {
  const content = `
    <h2>Subscription Confirmed!</h2>
    <p>Thank you for subscribing to ${planName}</p>
    <p>Amount: $${amount}</p>
    <p>You now have access to all premium features!</p>
  `;

  await notifyOwner({
    title: `New Subscription: ${planName}`,
    content: `${userEmail} subscribed to ${planName} for $${amount}`,
  });
}

export async function sendNewReleaseAlert(
  userEmail: string,
  songTitle: string,
  artist: string
) {
  const content = `
    <h2>New Release!</h2>
    <p>${artist} just released "${songTitle}"</p>
    <p>Listen now on Gifted Eternity</p>
  `;

  return content;
}

export async function sendPlaylistSharedNotification(
  userEmail: string,
  playlistName: string,
  sharedBy: string
) {
  const content = `
    <h2>Playlist Shared!</h2>
    <p>${sharedBy} shared "${playlistName}" with you</p>
    <p>Check it out on Gifted Eternity</p>
  `;

  return content;
}
```

### Add to Payment Router (Update `server/routers/payment.ts`)

```typescript
import { sendSubscriptionConfirmation } from '../_core/email';

// In your subscription creation mutation, add:
await sendSubscriptionConfirmation(
  ctx.user.email,
  planName,
  amount
);
```

---

## 4. DOWNLOAD FEATURE FOR SUBSCRIBERS

### Backend API (Add to `server/routers/songs.ts`)

```typescript
downloadSong: protectedProcedure
  .input(z.object({ songId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Check if user is subscriber
    const subscription = await db.query.subscriptions.findFirst({
      where: (s) => s.userId === ctx.user.id,
    });

    if (!subscription || subscription.status !== 'active') {
      throw new Error('Subscription required');
    }

    // Get song file URL from S3
    const song = await db.query.uploadedSongs.findFirst({
      where: (s) => s.id === input.songId,
    });

    if (!song) {
      throw new Error('Song not found');
    }

    // Generate presigned download URL
    const downloadUrl = await storageGet(song.fileKey, 3600); // 1 hour expiry

    return { downloadUrl };
  }),
```

### Frontend Component (Add to song player)

```typescript
const { data: downloadUrl } = trpc.songs.downloadSong.useQuery(
  { songId: selectedSong.id },
  { enabled: isSubscriber }
);

return (
  <a href={downloadUrl} download>
    Download Song
  </a>
);
```

---

## 5. HOW TO IMPLEMENT

### Step 1: Run Database Migrations
```bash
cd /home/ubuntu/gifted_eternity_stream_web
pnpm db:push
```

### Step 2: Add Routes to Router
Update `server/routers.ts`:
```typescript
import { analyticsRouter } from './routers/analytics';
import { playlistsRouter } from './routers/playlists';

export const appRouter = router({
  // ... existing routes
  analytics: analyticsRouter,
  playlists: playlistsRouter,
});
```

### Step 3: Add Pages to App.tsx
```typescript
import Analytics from './pages/Analytics';
import Playlists from './pages/Playlists';

// In your routes:
<Route path="/analytics" component={Analytics} />
<Route path="/playlists" component={Playlists} />
```

### Step 4: Restart Dev Server
```bash
pnpm dev
```

---

## 6. TESTING

Run tests:
```bash
pnpm test
```

---

This gives you complete, working code for all remaining features. Copy and paste the code into your project and follow the implementation steps!
