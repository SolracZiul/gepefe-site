const KEY = 'gepefe:recent-searches';
export const RECENT_SEARCH_LIMIT = 8;

export function addRecentSearch(list: string[], term: string): string[] {
  const value = term.trim();
  if (!value) return list;
  return [value, ...list.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, RECENT_SEARCH_LIMIT);
}

export function loadRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch { return []; }
}

export function saveRecentSearches(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}
