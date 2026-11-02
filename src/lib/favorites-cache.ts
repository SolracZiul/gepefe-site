const cache = new Map<string, string[]>();
const key = (userId: string) => `gepefe:favorites:${userId}`;

export function readFavoriteCache(userId: string): string[] | undefined {
  if (cache.has(userId)) return cache.get(userId);
  try {
    const stored = localStorage.getItem(key(userId));
    if (!stored) return undefined;
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
      cache.set(userId, parsed);
      return parsed;
    }
  } catch { /* Storage may be unavailable. */ }
  return undefined;
}

export function writeFavoriteCache(userId: string, ids: string[]) {
  cache.set(userId, ids);
  try { localStorage.setItem(key(userId), JSON.stringify(ids)); } catch { /* Memory cache remains available. */ }
}

export function updateFavoriteIds(ids: string[], articleId: string, saved: boolean) {
  return saved ? Array.from(new Set([...ids, articleId])) : ids.filter(id => id !== articleId);
}