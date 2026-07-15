"use client";

import { History } from "lucide-react";

export function RecentSearches({ items, onPick }: { items: string[]; onPick: (q: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        <History className="h-3 w-3" /> Recent Searches
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((q) => (
          <button key={q} onClick={() => onPick(q)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60 transition hover:bg-white/10">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
