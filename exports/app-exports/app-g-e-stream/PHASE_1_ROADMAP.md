# Phase 1 Development Roadmap
## Advanced Search with Filters + Gamification & Engagement

**Timeline:** 4-6 weeks  
**Team Size:** 2-3 developers  
**Priority:** HIGH - Quick wins for user engagement  
**Target Launch:** End of Q1 2026

---

## OVERVIEW

This roadmap breaks down two critical features into actionable tasks with complete code, database schemas, and implementation steps. Each feature has 3 primary tasks that build upon each other.

---

# FEATURE 1: ADVANCED SEARCH WITH FILTERS

## Why This Feature Matters

Advanced search is the gateway to music discovery. Users spend 30% of their time searching for music. A powerful search system:
- Reduces bounce rate (users find what they want faster)
- Increases song discovery (related songs, recommendations)
- Improves user retention (better UX)
- Differentiates from competitors (Spotify's search is powerful)
- Drives engagement (users explore more)

---

## TASK 1.1: IMPLEMENT ELASTICSEARCH BACKEND

### What This Does
Sets up a powerful search engine that can index all songs and enable fast, relevant searches across multiple fields (title, artist, album, lyrics, genre).

### Why First
Without a search backend, you can't do advanced filtering. This is the foundation.

### Estimated Time: 1 week

### Step 1: Install Elasticsearch

```bash
# Add to package.json
npm install @elastic/elasticsearch
```

### Step 2: Create Search Service

Create `server/_core/elasticsearch.ts`:

```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

export async function initializeSearch() {
  try {
    // Create index if it doesn't exist
    const indexExists = await client.indices.exists({ index: 'songs' });
    
    if (!indexExists) {
      await client.indices.create({
        index: 'songs',
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                default: {
                  type: 'standard',
                  stopwords: '_english_',
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { type: 'text', analyzer: 'standard' },
              artist: { type: 'text', analyzer: 'standard' },
              album: { type: 'text', analyzer: 'standard' },
              genre: { type: 'keyword' },
              lyrics: { type: 'text', analyzer: 'standard' },
              duration: { type: 'integer' },
              bpm: { type: 'integer' },
              key: { type: 'keyword' },
              releaseYear: { type: 'integer' },
              plays: { type: 'integer' },
              createdAt: { type: 'date' },
              url: { type: 'keyword' },
              imageUrl: { type: 'keyword' },
            },
          },
        },
      });
      console.log('✅ Elasticsearch index created');
    }
  } catch (error) {
    console.error('❌ Elasticsearch initialization failed:', error);
  }
}

export async function indexSong(song: any) {
  try {
    await client.index({
      index: 'songs',
      id: song.id,
      body: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        lyrics: song.lyrics || '',
        duration: song.duration,
        bpm: song.bpm,
        key: song.key,
        releaseYear: song.releaseYear,
        plays: song.plays || 0,
        createdAt: new Date(song.createdAt),
        url: song.url,
        imageUrl: song.imageUrl,
      },
    });
  } catch (error) {
    console.error('❌ Failed to index song:', error);
  }
}

export async function searchSongs(query: string, filters?: any) {
  try {
    const must = [];
    const filter = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^3', 'artist^2', 'album', 'lyrics'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Genre filter
    if (filters?.genre && filters.genre !== 'all') {
      filter.push({ term: { genre: filters.genre } });
    }

    // BPM range filter
    if (filters?.minBpm || filters?.maxBpm) {
      filter.push({
        range: {
          bpm: {
            gte: filters?.minBpm || 0,
            lte: filters?.maxBpm || 300,
          },
        },
      });
    }

    // Duration filter
    if (filters?.minDuration || filters?.maxDuration) {
      filter.push({
        range: {
          duration: {
            gte: filters?.minDuration || 0,
            lte: filters?.maxDuration || 600,
          },
        },
      });
    }

    // Year filter
    if (filters?.year) {
      filter.push({
        range: {
          releaseYear: {
            gte: filters.year,
            lte: filters.year + 1,
          },
        },
      });
    }

    // Key filter
    if (filters?.key) {
      filter.push({ term: { key: filters.key } });
    }

    const result = await client.search({
      index: 'songs',
      body: {
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter,
          },
        },
        sort: [
          filters?.sortBy === 'newest'
            ? { createdAt: 'desc' }
            : filters?.sortBy === 'trending'
            ? { plays: 'desc' }
            : { _score: 'desc' },
        ],
        size: filters?.limit || 20,
        from: filters?.offset || 0,
      },
    });

    return result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
    }));
  } catch (error) {
    console.error('❌ Search failed:', error);
    return [];
  }
}

export async function getSearchSuggestions(query: string) {
  try {
    const result = await client.search({
      index: 'songs',
      body: {
        query: {
          match_phrase_prefix: {
            title: query,
          },
        },
        _source: ['title', 'artist'],
        size: 10,
      },
    });

    return result.hits.hits.map((hit: any) => hit._source);
  } catch (error) {
    console.error('❌ Suggestions failed:', error);
    return [];
  }
}
```

### Step 3: Add to Server Startup

Update `server/_core/index.ts`:

```typescript
import { initializeSearch } from './elasticsearch';

// Initialize Elasticsearch on server start
initializeSearch().catch(console.error);
```

### Step 4: Environment Variables

Add to `.env.local`:

```
ELASTICSEARCH_URL=http://localhost:9200
```

### Deliverable
✅ Elasticsearch service running  
✅ Songs index created  
✅ Search functions ready to use

---

## TASK 1.2: CREATE ADVANCED SEARCH API ENDPOINTS

### What This Does
Builds the backend API that frontend calls to perform searches with filters.

### Why Second
Now that Elasticsearch is ready, we create the API layer that the frontend will use.

### Estimated Time: 1 week

### Step 1: Create Search Router

Create `server/routers/search.ts`:

```typescript
import { router, publicProcedure } from '../_core/router';
import { z } from 'zod';
import { searchSongs, getSearchSuggestions } from '../_core/elasticsearch';

export const searchRouter = router({
  // Advanced search with filters
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      genre: z.string().optional(),
      minBpm: z.number().optional(),
      maxBpm: z.number().optional(),
      minDuration: z.number().optional(),
      maxDuration: z.number().optional(),
      year: z.number().optional(),
      key: z.string().optional(),
      sortBy: z.enum(['relevance', 'newest', 'trending']).default('relevance'),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const results = await searchSongs(input.query, {
        genre: input.genre,
        minBpm: input.minBpm,
        maxBpm: input.maxBpm,
        minDuration: input.minDuration,
        maxDuration: input.maxDuration,
        year: input.year,
        key: input.key,
        sortBy: input.sortBy,
        limit: input.limit,
        offset: input.offset,
      });

      return {
        results,
        total: results.length,
        hasMore: results.length === input.limit,
      };
    }),

  // Get search suggestions
  suggestions: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      return await getSearchSuggestions(input.query);
    }),

  // Get filter options
  filterOptions: publicProcedure
    .query(async () => {
      return {
        genres: ['Hip-Hop', 'R&B', 'Country', 'Gospel', 'Pop', 'Rock'],
        keys: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
        years: Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
        bpmRange: { min: 60, max: 200 },
        durationRange: { min: 60, max: 600 },
      };
    }),

  // Trending searches
  trending: publicProcedure
    .query(async () => {
      return [
        'Damone Ward Sr',
        'Hip-Hop beats',
        'Chill vibes',
        'Workout music',
        'Gospel songs',
      ];
    }),
});
```

### Step 2: Register Router

Update `server/routers.ts`:

```typescript
import { searchRouter } from './routers/search';

export const appRouter = router({
  // ... existing routes
  search: searchRouter,
});
```

### Step 3: Database Schema for Search History

Add to `drizzle/schema.ts`:

```typescript
export const searchHistory = sqliteTable('search_history', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  query: text('query').notNull(),
  resultsCount: integer('results_count'),
  clickedSongId: text('clicked_song_id'),
  createdAt: integer('created_at').notNull(),
});
```

### Step 4: Run Migration

```bash
pnpm db:push
```

### Deliverable
✅ Search API endpoints working  
✅ Filter options available  
✅ Trending searches endpoint  
✅ Search history tracking

---

## TASK 1.3: BUILD ADVANCED SEARCH UI

### What This Does
Creates the beautiful frontend interface for searching and filtering music.

### Why Third
Now that backend is ready, we build the user-facing search interface.

### Estimated Time: 1 week

### Step 1: Create Search Page Component

Create `client/src/pages/AdvancedSearch.tsx`:

```typescript
import { useState } from 'react';
import { trpc } from '../lib/trpc';
import './AdvancedSearch.css';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: 'all',
    minBpm: 60,
    maxBpm: 200,
    minDuration: 60,
    maxDuration: 600,
    year: undefined,
    key: undefined,
    sortBy: 'relevance',
  });

  const { data: results } = trpc.search.search.useQuery(
    {
      query,
      ...filters,
    },
    { enabled: query.length > 0 }
  );

  const { data: suggestions } = trpc.search.suggestions.useQuery(
    { query },
    { enabled: query.length > 1 }
  );

  const { data: filterOptions } = trpc.search.filterOptions.useQuery();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="advanced-search-container">
      <div className="search-header">
        <h1>Advanced Music Search</h1>
        <p>Find exactly what you're looking for</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by song, artist, album, or lyrics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        {suggestions && suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion: any) => (
              <div
                key={suggestion.id}
                className="suggestion-item"
                onClick={() => setQuery(suggestion.title)}
              >
                <span className="suggestion-title">{suggestion.title}</span>
                <span className="suggestion-artist">{suggestion.artist}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-layout">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <h3>Filters</h3>

          {/* Genre Filter */}
          <div className="filter-group">
            <label>Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
            >
              <option value="all">All Genres</option>
              {filterOptions?.genres.map((genre: string) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* BPM Filter */}
          <div className="filter-group">
            <label>BPM: {filters.minBpm} - {filters.maxBpm}</label>
            <input
              type="range"
              min="60"
              max="200"
              value={filters.minBpm}
              onChange={(e) => handleFilterChange('minBpm', parseInt(e.target.value))}
            />
            <input
              type="range"
              min="60"
              max="200"
              value={filters.maxBpm}
              onChange={(e) => handleFilterChange('maxBpm', parseInt(e.target.value))}
            />
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <label>Duration: {Math.round(filters.minDuration / 60)}m - {Math.round(filters.maxDuration / 60)}m</label>
            <input
              type="range"
              min="60"
              max="600"
              value={filters.minDuration}
              onChange={(e) => handleFilterChange('minDuration', parseInt(e.target.value))}
            />
            <input
              type="range"
              min="60"
              max="600"
              value={filters.maxDuration}
              onChange={(e) => handleFilterChange('maxDuration', parseInt(e.target.value))}
            />
          </div>

          {/* Year Filter */}
          <div className="filter-group">
            <label>Year</label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Any Year</option>
              {filterOptions?.years.map((year: number) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Key Filter */}
          <div className="filter-group">
            <label>Musical Key</label>
            <select
              value={filters.key || ''}
              onChange={(e) => handleFilterChange('key', e.target.value || undefined)}
            >
              <option value="">Any Key</option>
              {filterOptions?.keys.map((key: string) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="relevance">Most Relevant</option>
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          {query.length === 0 ? (
            <div className="empty-state">
              <p>Start typing to search for music</p>
            </div>
          ) : results && results.results.length > 0 ? (
            <>
              <p className="results-count">Found {results.total} songs</p>
              <div className="results-grid">
                {results.results.map((song: any) => (
                  <div key={song.id} className="result-card">
                    <img src={song.imageUrl} alt={song.title} />
                    <div className="result-info">
                      <h4>{song.title}</h4>
                      <p className="artist">{song.artist}</p>
                      <p className="meta">
                        {song.genre} • {Math.round(song.duration / 60)}m • {song.plays} plays
                      </p>
                      <button className="play-btn">Play</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No songs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Create CSS Styling

Create `client/src/pages/AdvancedSearch.css`:

```css
.advanced-search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-box {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.suggestion-title {
  font-weight: 500;
}

.suggestion-artist {
  color: #999;
  font-size: 0.9rem;
}

.search-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.filters-sidebar {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.filters-sidebar h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-group select,
.filter-group input[type="range"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-group input[type="range"] {
  margin-bottom: 0.5rem;
}

.search-results {
  min-height: 400px;
}

.results-count {
  color: #666;
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.result-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.result-info {
  padding: 1rem;
}

.result-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-info .artist {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.result-info .meta {
  color: #999;
  font-size: 0.85rem;
  margin: 0 0 1rem 0;
}

.play-btn {
  width: 100%;
  padding: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.3s;
}

.play-btn:hover {
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

@media (max-width: 768px) {
  .search-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
```

### Step 3: Add Route to App.tsx

Update `client/src/App.tsx`:

```typescript
import AdvancedSearch from './pages/AdvancedSearch';

// In your routes:
<Route path="/search" component={AdvancedSearch} />
```

### Step 4: Add to Navigation Portal

Update `client/src/components/NavigationPortal.tsx`:

```typescript
{
  label: 'Advanced Search',
  path: '/search',
  icon: <Search size={20} />,
  description: 'Find music with advanced filters',
  badge: 'New',
}
```

### Deliverable
✅ Beautiful search UI  
✅ All filters working  
✅ Real-time suggestions  
✅ Responsive design  
✅ Integrated into navigation

---

# FEATURE 2: GAMIFICATION & ENGAGEMENT

## Why This Feature Matters

Gamification increases daily active users by 30-50%. Users return more often when they have:
- Goals to achieve (badges, streaks)
- Social competition (leaderboards)
- Rewards (points, achievements)
- Progress tracking (levels, milestones)

---

## TASK 2.1: BUILD ACHIEVEMENT & BADGE SYSTEM

### What This Does
Creates a system to track user achievements and award badges for various actions (first song played, 100 songs listened, etc.).

### Why First
Achievements are the foundation of gamification. Everything else builds on this.

### Estimated Time: 1 week

### Step 1: Database Schema

Add to `drizzle/schema.ts`:

```typescript
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(), // emoji or icon name
  condition: text('condition').notNull(), // 'first_play', 'plays_100', etc
  points: integer('points').default(10),
  createdAt: integer('created_at').notNull(),
});

export const userAchievements = sqliteTable('user_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: integer('unlocked_at').notNull(),
});

export const userPoints = sqliteTable('user_points', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  totalPoints: integer('total_points').default(0),
  level: integer('level').default(1),
  updatedAt: integer('updated_at').notNull(),
});
```

### Step 2: Achievement Definitions

Create `server/achievements.ts`:

```typescript
export const ACHIEVEMENTS = [
  {
    id: 'first-play',
    name: 'First Note',
    description: 'Play your first song',
    icon: '🎵',
    condition: 'first_play',
    points: 10,
  },
  {
    id: 'plays-10',
    name: 'Music Lover',
    description: 'Play 10 songs',
    icon: '🎶',
    condition: 'plays_10',
    points: 25,
  },
  {
    id: 'plays-50',
    name: 'Dedicated Listener',
    description: 'Play 50 songs',
    icon: '🎼',
    condition: 'plays_50',
    points: 50,
  },
  {
    id: 'plays-100',
    name: 'Music Addict',
    description: 'Play 100 songs',
    icon: '🎸',
    condition: 'plays_100',
    points: 100,
  },
  {
    id: 'playlist-creator',
    name: 'Curator',
    description: 'Create your first playlist',
    icon: '📋',
    condition: 'create_playlist',
    points: 30,
  },
  {
    id: 'comment-first',
    name: 'Voice Your Opinion',
    description: 'Leave your first comment',
    icon: '💬',
    condition: 'first_comment',
    points: 15,
  },
  {
    id: 'favorite-10',
    name: 'Collector',
    description: 'Add 10 songs to favorites',
    icon: '❤️',
    condition: 'favorites_10',
    points: 20,
  },
  {
    id: 'genre-explorer',
    name: 'Genre Explorer',
    description: 'Listen to all 4 genres',
    icon: '🌍',
    condition: 'all_genres',
    points: 50,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Listen for 7 consecutive days',
    icon: '🔥',
    condition: 'streak_7',
    points: 75,
  },
  {
    id: 'subscriber',
    name: 'Premium Member',
    description: 'Subscribe to a premium plan',
    icon: '👑',
    condition: 'subscribe',
    points: 100,
  },
];
```

### Step 3: Achievement Service

Create `server/_core/achievements.ts`:

```typescript
import { db } from '../db';
import { achievements, userAchievements, userPoints } from '../../drizzle/schema';
import { ACHIEVEMENTS } from '../achievements';

export async function initializeAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    const exists = await db.query.achievements.findFirst({
      where: (a) => a.id === achievement.id,
    });

    if (!exists) {
      await db.insert(achievements).values({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        condition: achievement.condition,
        points: achievement.points,
        createdAt: Date.now(),
      });
    }
  }
}

export async function checkAndUnlockAchievement(
  userId: string,
  condition: string,
  data?: any
) {
  const achievement = ACHIEVEMENTS.find((a) => a.condition === condition);
  if (!achievement) return null;

  // Check if already unlocked
  const alreadyUnlocked = await db.query.userAchievements.findFirst({
    where: (ua) => ua.userId === userId && ua.achievementId === achievement.id,
  });

  if (alreadyUnlocked) return null;

  // Unlock achievement
  await db.insert(userAchievements).values({
    id: `${userId}-${achievement.id}`,
    userId,
    achievementId: achievement.id,
    unlockedAt: Date.now(),
  });

  // Add points
  await addPoints(userId, achievement.points);

  return achievement;
}

export async function addPoints(userId: string, points: number) {
  const userPoints = await db.query.userPoints.findFirst({
    where: (up) => up.userId === userId,
  });

  if (userPoints) {
    const newTotal = userPoints.totalPoints + points;
    const newLevel = Math.floor(newTotal / 100) + 1;

    await db.update(userPoints)
      .set({
        totalPoints: newTotal,
        level: newLevel,
        updatedAt: Date.now(),
      })
      .where((up) => up.userId === userId);
  } else {
    await db.insert(userPoints).values({
      id: `points-${userId}`,
      userId,
      totalPoints: points,
      level: 1,
      updatedAt: Date.now(),
    });
  }
}

export async function getUserAchievements(userId: string) {
  const userAchievementsList = await db.query.userAchievements.findMany({
    where: (ua) => ua.userId === userId,
  });

  const achievementIds = userAchievementsList.map((ua) => ua.achievementId);

  const achievementDetails = await db.query.achievements.findMany({
    where: (a) => achievementIds.includes(a.id),
  });

  return achievementDetails.map((achievement) => ({
    ...achievement,
    unlockedAt: userAchievementsList.find(
      (ua) => ua.achievementId === achievement.id
    )?.unlockedAt,
  }));
}

export async function getUserLevel(userId: string) {
  return await db.query.userPoints.findFirst({
    where: (up) => up.userId === userId,
  });
}
```

### Step 4: Gamification Router

Create `server/routers/gamification.ts`:

```typescript
import { router, protectedProcedure } from '../_core/router';
import { z } from 'zod';
import {
  checkAndUnlockAchievement,
  getUserAchievements,
  getUserLevel,
} from '../_core/achievements';

export const gamificationRouter = router({
  getAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserAchievements(ctx.user.id);
    }),

  getLevel: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserLevel(ctx.user.id);
    }),

  unlockAchievement: protectedProcedure
    .input(z.object({ condition: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await checkAndUnlockAchievement(ctx.user.id, input.condition);
    }),
});
```

### Deliverable
✅ Achievement system database  
✅ Achievement definitions  
✅ Achievement service functions  
✅ API endpoints for achievements

---

## TASK 2.2: CREATE LEADERBOARDS & STREAKS

### What This Does
Builds leaderboards showing top listeners and streak tracking for daily engagement.

### Why Second
Leaderboards create social competition, and streaks encourage daily returns.

### Estimated Time: 1 week

### Step 1: Database Schema

Add to `drizzle/schema.ts`:

```typescript
export const userStreaks = sqliteTable('user_streaks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastListenedDate: integer('last_listened_date'),
  updatedAt: integer('updated_at').notNull(),
});

export const leaderboard = sqliteTable('leaderboard', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  rank: integer('rank'),
  points: integer('points').default(0),
  plays: integer('plays').default(0),
  followers: integer('followers').default(0),
  period: text('period').default('all'), // 'weekly', 'monthly', 'all'
  updatedAt: integer('updated_at').notNull(),
});
```

### Step 2: Streak Service

Create `server/_core/streaks.ts`:

```typescript
import { db } from '../db';
import { userStreaks } from '../../drizzle/schema';

export async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const streak = await db.query.userStreaks.findFirst({
    where: (s) => s.userId === userId,
  });

  if (!streak) {
    await db.insert(userStreaks).values({
      id: `streak-${userId}`,
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastListenedDate: todayTime,
      updatedAt: Date.now(),
    });
    return { currentStreak: 1, longestStreak: 1, isNewStreak: true };
  }

  const lastDate = new Date(streak.lastListenedDate || 0);
  lastDate.setHours(0, 0, 0, 0);
  const lastDateTime = lastDate.getTime();

  const daysDiff = Math.floor((todayTime - lastDateTime) / (1000 * 60 * 60 * 24));

  let newCurrentStreak = streak.currentStreak || 0;
  let newLongestStreak = streak.longestStreak || 0;

  if (daysDiff === 0) {
    // Same day, no change
    return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak };
  } else if (daysDiff === 1) {
    // Consecutive day, increment
    newCurrentStreak += 1;
    newLongestStreak = Math.max(newCurrentStreak, newLongestStreak);
  } else {
    // Streak broken, reset
    newCurrentStreak = 1;
  }

  await db.update(userStreaks)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastListenedDate: todayTime,
      updatedAt: Date.now(),
    })
    .where((s) => s.userId === userId);

  return {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    isNewStreak: daysDiff === 1,
  };
}

export async function getStreak(userId: string) {
  return await db.query.userStreaks.findFirst({
    where: (s) => s.userId === userId,
  });
}
```

### Step 3: Leaderboard Service

Create `server/_core/leaderboard.ts`:

```typescript
import { db } from '../db';
import { leaderboard, userPoints } from '../../drizzle/schema';

export async function updateLeaderboard() {
  // Get top users by points
  const topUsers = await db.query.userPoints.findMany({
    limit: 100,
  });

  // Sort by points
  topUsers.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  // Update leaderboard
  for (let i = 0; i < topUsers.length; i++) {
    const existing = await db.query.leaderboard.findFirst({
      where: (l) => l.userId === topUsers[i].userId,
    });

    if (existing) {
      await db.update(leaderboard)
        .set({
          rank: i + 1,
          points: topUsers[i].totalPoints || 0,
          updatedAt: Date.now(),
        })
        .where((l) => l.userId === topUsers[i].userId);
    } else {
      await db.insert(leaderboard).values({
        id: `lb-${topUsers[i].userId}`,
        userId: topUsers[i].userId,
        rank: i + 1,
        points: topUsers[i].totalPoints || 0,
        updatedAt: Date.now(),
      });
    }
  }
}

export async function getLeaderboard(limit: number = 10) {
  return await db.query.leaderboard.findMany({
    limit,
  });
}

export async function getUserRank(userId: string) {
  return await db.query.leaderboard.findFirst({
    where: (l) => l.userId === userId,
  });
}
```

### Step 4: Gamification Router Update

Update `server/routers/gamification.ts`:

```typescript
import { getStreak, updateStreak } from '../_core/streaks';
import { getLeaderboard, getUserRank } from '../_core/leaderboard';

export const gamificationRouter = router({
  // ... existing routes

  getStreak: protectedProcedure
    .query(async ({ ctx }) => {
      return await getStreak(ctx.user.id);
    }),

  updateStreak: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await updateStreak(ctx.user.id);
    }),

  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return await getLeaderboard(input.limit);
    }),

  getUserRank: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserRank(ctx.user.id);
    }),
});
```

### Deliverable
✅ Streak tracking system  
✅ Leaderboard calculation  
✅ API endpoints for streaks and leaderboards

---

## TASK 2.3: BUILD GAMIFICATION UI COMPONENTS

### What This Does
Creates beautiful UI components to display achievements, streaks, and leaderboards to users.

### Why Third
Now that backend is ready, we build the user-facing gamification interface.

### Estimated Time: 1 week

### Step 1: Achievements Component

Create `client/src/components/AchievementsDisplay.tsx`:

```typescript
import { trpc } from '../lib/trpc';
import './AchievementsDisplay.css';

export default function AchievementsDisplay() {
  const { data: achievements } = trpc.gamification.getAchievements.useQuery();
  const { data: level } = trpc.gamification.getLevel.useQuery();

  return (
    <div className="achievements-display">
      <div className="level-card">
        <h3>Your Level</h3>
        <div className="level-badge">
          <span className="level-number">{level?.level || 1}</span>
          <span className="level-label">Level</span>
        </div>
        <p className="points">{level?.totalPoints || 0} Points</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((level?.totalPoints || 0) % 100) / 100 * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="achievements-grid">
        <h3>Achievements</h3>
        {achievements && achievements.length > 0 ? (
          <div className="achievements-list">
            {achievements.map((achievement: any) => (
              <div key={achievement.id} className="achievement-badge">
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-achievements">
            Start listening to unlock achievements!
          </p>
        )}
      </div>
    </div>
  );
}
```

### Step 2: Streak Component

Create `client/src/components/StreakDisplay.tsx`:

```typescript
import { trpc } from '../lib/trpc';
import './StreakDisplay.css';

export default function StreakDisplay() {
  const { data: streak } = trpc.gamification.getStreak.useQuery();

  return (
    <div className="streak-display">
      <div className="streak-card">
        <div className="streak-icon">🔥</div>
        <div className="streak-info">
          <h3>Current Streak</h3>
          <p className="streak-number">{streak?.currentStreak || 0} days</p>
          <p className="streak-label">Keep it going!</p>
        </div>
      </div>

      <div className="streak-stats">
        <div className="stat">
          <span className="stat-label">Longest Streak</span>
          <span className="stat-value">{streak?.longestStreak || 0} days</span>
        </div>
        <div className="stat">
          <span className="stat-label">Last Listened</span>
          <span className="stat-value">
            {streak?.lastListenedDate
              ? new Date(streak.lastListenedDate).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Leaderboard Component

Create `client/src/components/Leaderboard.tsx`:

```typescript
import { trpc } from '../lib/trpc';
import './Leaderboard.css';

export default function Leaderboard() {
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery({
    limit: 10,
  });
  const { data: userRank } = trpc.gamification.getUserRank.useQuery();

  return (
    <div className="leaderboard">
      <h2>Top Listeners</h2>

      {userRank && (
        <div className="user-rank">
          <p>Your Rank: #{userRank.rank}</p>
        </div>
      )}

      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span className="rank">Rank</span>
          <span className="name">User</span>
          <span className="points">Points</span>
        </div>

        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((entry: any, index: number) => (
            <div
              key={entry.id}
              className={`leaderboard-row ${
                entry.userId === userRank?.userId ? 'current-user' : ''
              }`}
            >
              <span className="rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </span>
              <span className="name">User #{entry.userId.slice(0, 8)}</span>
              <span className="points">{entry.points} pts</span>
            </div>
          ))
        ) : (
          <p className="no-data">No leaderboard data yet</p>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Create CSS Files

Create `client/src/components/AchievementsDisplay.css`:

```css
.achievements-display {
  display: grid;
  gap: 2rem;
}

.level-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.level-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
}

.level-number {
  font-size: 3rem;
  font-weight: bold;
}

.level-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.points {
  font-size: 1.2rem;
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s;
}

.achievements-grid {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.achievement-info p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.no-achievements {
  text-align: center;
  color: #999;
  padding: 2rem;
}
```

Create `client/src/components/StreakDisplay.css`:

```css
.streak-display {
  display: grid;
  gap: 1rem;
}

.streak-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
}

.streak-icon {
  font-size: 3rem;
}

.streak-info h3 {
  margin: 0 0 0.5rem 0;
}

.streak-number {
  font-size: 2rem;
  font-weight: bold;
  display: block;
}

.streak-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.streak-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}
```

Create `client/src/components/Leaderboard.css`:

```css
.leaderboard {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard h2 {
  margin: 0 0 1.5rem 0;
}

.user-rank {
  background: #f0f7ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #667eea;
}

.leaderboard-table {
  overflow-x: auto;
}

.leaderboard-header {
  display: grid;
  grid-template-columns: 60px 1fr 100px;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.leaderboard-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background 0.3s;
}

.leaderboard-row:hover {
  background: #f9f9f9;
}

.leaderboard-row.current-user {
  background: #f0f7ff;
  border-left: 4px solid #667eea;
  font-weight: 600;
}

.rank {
  text-align: center;
  font-size: 1.2rem;
}

.points {
  text-align: right;
  font-weight: 600;
  color: #667eea;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 2rem;
}
```

### Step 5: Add Components to Dashboard

Create `client/src/pages/Gamification.tsx`:

```typescript
import AchievementsDisplay from '../components/AchievementsDisplay';
import StreakDisplay from '../components/StreakDisplay';
import Leaderboard from '../components/Leaderboard';
import './Gamification.css';

export default function Gamification() {
  return (
    <div className="gamification-page">
      <h1>Your Progress</h1>
      <p className="subtitle">Earn badges, build streaks, and climb the leaderboard</p>

      <div className="gamification-grid">
        <div className="section">
          <StreakDisplay />
        </div>

        <div className="section">
          <AchievementsDisplay />
        </div>

        <div className="section full-width">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
```

Create `client/src/pages/Gamification.css`:

```css
.gamification-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.gamification-page h1 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.gamification-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section {
  display: flex;
  flex-direction: column;
}

.section.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .gamification-grid {
    grid-template-columns: 1fr;
  }
}
```

### Step 6: Add Route

Update `client/src/App.tsx`:

```typescript
import Gamification from './pages/Gamification';

// In your routes:
<Route path="/gamification" component={Gamification} />
```

### Deliverable
✅ Beautiful achievements display  
✅ Streak tracking UI  
✅ Leaderboard component  
✅ Gamification dashboard  
✅ Responsive design

---

# IMPLEMENTATION CHECKLIST

## Feature 1: Advanced Search

- [ ] Task 1.1: Elasticsearch backend setup
  - [ ] Install Elasticsearch
  - [ ] Create search service
  - [ ] Test indexing
  - [ ] Verify search functionality

- [ ] Task 1.2: Search API endpoints
  - [ ] Create search router
  - [ ] Register router in app
  - [ ] Create search history table
  - [ ] Run migrations

- [ ] Task 1.3: Search UI
  - [ ] Create search page component
  - [ ] Add CSS styling
  - [ ] Add route to App.tsx
  - [ ] Add to navigation portal
  - [ ] Test all filters

## Feature 2: Gamification

- [ ] Task 2.1: Achievement system
  - [ ] Create database tables
  - [ ] Define achievements
  - [ ] Create achievement service
  - [ ] Create gamification router

- [ ] Task 2.2: Leaderboards & Streaks
  - [ ] Create streak tables
  - [ ] Create leaderboard tables
  - [ ] Create streak service
  - [ ] Create leaderboard service
  - [ ] Update gamification router

- [ ] Task 2.3: Gamification UI
  - [ ] Create achievements component
  - [ ] Create streak component
  - [ ] Create leaderboard component
  - [ ] Create gamification page
  - [ ] Add route and navigation
  - [ ] Test all components

---

# TESTING CHECKLIST

## Advanced Search
- [ ] Search by song title
- [ ] Search by artist name
- [ ] Search by album
- [ ] Search by lyrics
- [ ] Filter by genre
- [ ] Filter by BPM range
- [ ] Filter by duration
- [ ] Filter by year
- [ ] Filter by key
- [ ] Sort by relevance
- [ ] Sort by newest
- [ ] Sort by trending
- [ ] Get suggestions
- [ ] Test pagination

## Gamification
- [ ] Unlock first achievement
- [ ] Earn points
- [ ] Level up
- [ ] Build streak
- [ ] Streak breaks correctly
- [ ] Leaderboard updates
- [ ] User rank displays
- [ ] All badges display
- [ ] Progress bar works
- [ ] Mobile responsive

---

# DEPLOYMENT CHECKLIST

- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations complete
- [ ] Environment variables set
- [ ] Elasticsearch running
- [ ] Performance tested
- [ ] Mobile tested
- [ ] Accessibility checked
- [ ] Create checkpoint
- [ ] Push to GitHub
- [ ] Deploy to production

---

# ESTIMATED TIMELINE

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Planning & Setup | 2-3 days | Architecture docs |
| Feature 1: Search | 3 weeks | Advanced search working |
| Feature 2: Gamification | 3 weeks | Gamification system live |
| Testing & QA | 1 week | All tests passing |
| Deployment | 2-3 days | Live on production |
| **Total** | **4-6 weeks** | **Both features live** |

---

# SUCCESS METRICS

After launching Phase 1, track these metrics:

**Advanced Search**
- Search usage: 40%+ of users use search
- Average search results: 5-10 per query
- Search-to-play conversion: 30%+
- Filter usage: 20%+ use filters

**Gamification**
- Daily active users: +30-50%
- Session duration: +20-30%
- Return rate: +25-40%
- Achievement unlock rate: 60%+ unlock first achievement
- Leaderboard engagement: 15%+ check leaderboard

---

This roadmap gives you everything needed to implement both features. Start with Task 1.1 and work through sequentially. Good luck! 🚀
