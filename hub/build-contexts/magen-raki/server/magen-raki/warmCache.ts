interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 60_000;

export function cacheKey(model: string, prompt: string): string {
  return `${model}:${prompt}`;
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttl = DEFAULT_TTL): void {
  cache.set(key, {
    value,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttl,
  });
}

export function clearCache(): void {
  cache.clear();
}

export function cacheStatus() {
  return {
    entries: cache.size,
    timestamp: Date.now(),
  };
}
