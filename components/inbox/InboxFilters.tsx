"use client";

import { Search } from "lucide-react";
import { PLATFORMS } from "./platformMeta";
import type { InboxPlatform } from "@/types/inbox";

export type PlatformFilter = InboxPlatform | "all";
export type ExtraFilter = "all" | "unread" | "assigned" | "today" | "week";

type Props = {
  platform: PlatformFilter;
  onPlatform: (p: PlatformFilter) => void;
  extra: ExtraFilter;
  onExtra: (e: ExtraFilter) => void;
  search: string;
  onSearch: (s: string) => void;
};

const EXTRA: { key: ExtraFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "assigned", label: "Assigned" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
];

export default function InboxFilters({
  platform,
  onPlatform,
  extra,
  onExtra,
  search,
  onSearch,
}: Props) {
  const platformOptions: { key: PlatformFilter; label: string }[] = [
    { key: "all", label: "All Platforms" },
    ...Object.values(PLATFORMS).map((p) => ({ key: p.key, label: p.label })),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={1.8} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search conversation…"
          className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-400/40"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {platformOptions.map((p) => (
          <button
            key={p.key}
            onClick={() => onPlatform(p.key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              platform === p.key
                ? "border-red-400/40 bg-red-500/15 text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXTRA.map((e) => (
          <button
            key={e.key}
            onClick={() => onExtra(e.key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              extra === e.key
                ? "bg-white/15 text-white"
                : "bg-white/[0.04] text-white/55 hover:text-white"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}
