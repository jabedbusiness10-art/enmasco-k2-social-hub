"use client";

import { CommandList } from "./CommandList";
import type { SearchResult } from "@/hooks/useCommandPalette";

export function SearchResults({
  results, query, activeIndex, onHover, loading,
}: {
  results: SearchResult[];
  query: string;
  activeIndex: number;
  onHover: (i: number) => void;
  loading?: boolean;
}) {
  if (loading && results.length === 0) {
    return <div className="px-4 py-8 text-center text-xs text-white/40">Searching…</div>;
  }
  if (results.length === 0) {
    return <div className="px-4 py-8 text-center text-xs text-white/40">No results for “{query}”.</div>;
  }

  // Group by category preserving order.
  const groups: { title: string; items: SearchResult[]; start: number }[] = [];
  let cursor = 0;
  for (const r of results) {
    let g = groups.find((x) => x.title === r.category);
    if (!g) { g = { title: r.category, items: [], start: cursor }; groups.push(g); }
    g.items.push(r);
    cursor++;
  }

  let offset = 0;
  return (
    <div className="max-h-[55vh] overflow-y-auto py-1">
      {groups.map((g) => {
        const node = (
          <CommandList
            key={g.title}
            title={g.title}
            items={g.items}
            activeIndex={activeIndex}
            offset={offset}
            onHover={onHover}
            query={query}
          />
        );
        offset += g.items.length;
        return node;
      })}
    </div>
  );
}
