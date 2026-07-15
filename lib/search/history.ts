/** TASK-61 — client-side persistence for search history + recents (localStorage). */
"use client";

const HIST_KEY = "k2kai:search-history";
const RECENT_KEY = "k2kai:recent-items";

export function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch { return []; }
}
export function pushHistory(q: string) {
  if (!q.trim()) return;
  const cur = loadHistory().filter((x) => x !== q);
  cur.unshift(q.trim());
  localStorage.setItem(HIST_KEY, JSON.stringify(cur.slice(0, 10)));
}
export function clearHistory() { localStorage.removeItem(HIST_KEY); }

export interface RecentItem { id: string; label: string; href: string; category: string; at: number; }
export function loadRecents(): RecentItem[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
export function pushRecent(item: RecentItem) {
  const cur = loadRecents().filter((x) => x.id !== item.id);
  cur.unshift(item);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 12)));
}
