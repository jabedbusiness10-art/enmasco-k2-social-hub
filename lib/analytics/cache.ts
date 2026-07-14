// ===========================================================================
// TASK-51 — lib/analytics/cache.ts
// Lightweight in-memory cache with TTL. Server-side only.
// Avoids hammering external APIs on every dashboard render.
// ===========================================================================

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = 60_000): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheClear(): void {
  store.clear();
}
