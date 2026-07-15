"use client";

import { Star } from "lucide-react";
import type { SearchResult } from "@/hooks/useCommandPalette";
import { Highlight } from "./SearchHighlight";

export function QuickActions({ items, activeIndex, onHover, query, onRun }: {
  items: SearchResult[];
  activeIndex: number;
  onHover: (i: number) => void;
  query: string;
  onRun: (r: SearchResult) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        <Star className="h-3 w-3" /> Quick Actions
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((it, i) => (
          <button
            key={it.id}
            onMouseEnter={() => onHover(i)}
            data-active={activeIndex === i}
            onClick={() => onRun(it)}
            className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs text-white/80 transition ${
              activeIndex === i ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <Highlight text={it.label} query={query} />
          </button>
        ))}
      </div>
    </div>
  );
}
