"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { CalendarView } from "@/types/contentPlanner";

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "agenda", label: "Agenda" },
];

export default function PlannerToolbar({
  view,
  onView,
  search,
  onSearch,
  onOpenFilters,
  filtersActive,
}: {
  view: CalendarView;
  onView: (v: CalendarView) => void;
  search: string;
  onSearch: (s: string) => void;
  onOpenFilters: () => void;
  filtersActive: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* View switch */}
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onView(v.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              view === v.id
                ? "bg-gradient-to-r from-sky-500 to-rose-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:max-w-xs">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search content, hashtags, creator…"
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/40"
          />
          {search && (
            <button onClick={() => onSearch("")} className="text-white/40 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={onOpenFilters}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition ${
            filtersActive
              ? "border-sky-400/40 bg-sky-400/10 text-white"
              : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {filtersActive && <span className="ml-0.5 rounded-full bg-sky-400/30 px-1.5 text-[10px]">on</span>}
        </button>
      </div>
    </div>
  );
}
