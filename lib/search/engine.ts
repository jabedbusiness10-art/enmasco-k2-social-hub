/**
 * TASK-61 — Fuzzy search engine.
 * Lightweight subsequence + token match scorer. Works over static
 * nav targets / commands and is also used to rank API entity hits.
 * Pure + dependency-free (client + server safe).
 */

export interface Scored<T> { item: T; score: number; }

/** Returns true if every char of `q` appears in order within `text`. */
function subsequence(q: string, text: string): boolean {
  let i = 0;
  for (const ch of text) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return i === q.length;
}

export function fuzzyScore(q: string, text: string): number {
  if (!q) return 1;
  const Q = q.toLowerCase().trim();
  const T = text.toLowerCase();
  if (T === Q) return 100;
  if (T.startsWith(Q)) return 80 - (T.length - Q.length) * 0.1;
  if (T.includes(Q)) return 60 - (T.indexOf(Q) * 0.2);
  if (subsequence(Q, T)) return 40 - Math.abs(T.length - Q.length) * 0.1;
  return 0;
}

export function rank<T>(
  q: string,
  items: T[],
  toText: (t: T) => string,
  toKeywords?: (t: T) => string[],
): Scored<T>[] {
  const scored = items
    .map((item) => {
      let best = fuzzyScore(q, toText(item));
      if (toKeywords) {
        for (const kw of toKeywords(item)) best = Math.max(best, fuzzyScore(q, kw) * 0.9);
      }
      return { item, score: best };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored;
}
