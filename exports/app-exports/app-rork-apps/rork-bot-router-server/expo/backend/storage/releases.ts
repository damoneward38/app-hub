import { Release } from "../types/release";
import { getDB, withRetry } from "./db";

let releases: Release[] = [];
let useDatabase = false;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function initDB() {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    if (isInitialized) return;
    isInitialized = true;
    
    releases = [];
    
    try {
      await getDB();
      useDatabase = true;
      console.log('✅ Releases storage using SurrealDB');
    } catch (err) {
      console.warn('⚠️ Releases storage falling back to in-memory:', err);
      useDatabase = false;
    }
  })();
  
  return initPromise;
}

initDB();

export const releasesStorage = {
  getAll: async () => {
    await initDB();
    if (!useDatabase) return releases;
    
    try {
      const db = await getDB();
      const result = await withRetry(() => db.select('releases'));
      const releases_array = Array.isArray(result) ? result : [];
      return releases_array.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      }) as unknown as Release[];
    } catch (err) {
      console.error('❌ Failed to fetch releases from DB, using in-memory:', err);
      return releases;
    }
  },

  checkDuplicate: async (artist: string, track: string): Promise<boolean> => {
    await initDB();
    const allReleases = await releasesStorage.getAll();
    const isDuplicate = allReleases.some(
      r => r.artist.toLowerCase() === artist.toLowerCase() && 
           r.track.toLowerCase() === track.toLowerCase()
    );
    return isDuplicate;
  },
  
  add: async (release: Release) => {
    await initDB();
    if (!useDatabase) {
      releases.unshift(release);
      return release;
    }
    
    try {
      const db = await getDB();
      const { id, ...releaseData } = release;
      await withRetry(() => db.create(`releases:${id}`, releaseData as any));
      console.log('✅ Release saved to DB:', id);
      return release;
    } catch (err) {
      console.error('❌ Failed to save release to DB, using in-memory:', err);
      releases.unshift(release);
      return release;
    }
  },
  
  getById: async (id: string) => {
    await initDB();
    if (!useDatabase) return releases.find(r => r.id === id);
    
    try {
      const db = await getDB();
      const result = await withRetry(() => db.select(`releases:${id}`));
      return result as unknown as Release | undefined;
    } catch (err) {
      console.error('❌ Failed to fetch release from DB:', err);
      return releases.find(r => r.id === id);
    }
  },
  
  update: async (id: string, release: Release) => {
    await initDB();
    if (!useDatabase) {
      const index = releases.findIndex(r => r.id === id);
      if (index !== -1) {
        releases[index] = { ...release };
      }
      return release;
    }
    
    try {
      const db = await getDB();
      const { id: _id, ...releaseData } = release;
      await withRetry(async () => {
        await db.merge(`releases:${id}`, releaseData as any);
        return true;
      });
      console.log('✅ Updated release:', id);
      return release;
    } catch (err) {
      console.error('❌ Update failed, using memory:', err);
      const index = releases.findIndex(r => r.id === id);
      if (index !== -1) {
        releases[index] = { ...release };
      }
      return release;
    }
  },
  
  delete: async (id: string) => {
    await initDB();
    if (!useDatabase) {
      const index = releases.findIndex(r => r.id === id);
      if (index !== -1) {
        releases.splice(index, 1);
      }
      return;
    }
    
    try {
      const db = await getDB();
      await withRetry(() => db.delete(`releases:${id}`));
      console.log('✅ Release deleted from DB:', id);
    } catch (err) {
      console.error('❌ Failed to delete release from DB:', err);
      const index = releases.findIndex(r => r.id === id);
      if (index !== -1) {
        releases.splice(index, 1);
      }
    }
  },
  
  clear: async () => {
    await initDB();
    if (!useDatabase) {
      releases.length = 0;
      return;
    }
    
    try {
      const db = await getDB();
      await withRetry(() => db.query('DELETE releases'));
      console.log('✅ Releases cleared from DB');
    } catch (err) {
      console.error('❌ Failed to clear releases from DB:', err);
      releases.length = 0;
    }
  }
};
