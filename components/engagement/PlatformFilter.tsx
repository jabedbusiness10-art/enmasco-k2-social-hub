"use client";

import { Search } from "lucide-react";
import type { EngagementPlatform, ReactionType } from "@/types/engagement";
import { PLATFORM_LABELS, REACTION_EMOJI } from "@/data/engagement";

export type PlatformFilter = EngagementPlatform | "all";
export type DateFilter = "all" | "today" | "week" | "month";
export type ReactionFilter = ReactionType | "all";

type Props = {
  platform: PlatformFilter;
  onPlatform: (p: PlatformFilter) => void;
  date: DateFilter;
  onDate: (d: DateFilter) => void;
  reaction: ReactionFilter;
  onReaction: (r: ReactionFilter) => void;
  search: string;
  onSearch: (s: string) => void;
};

const PLATFORMS: { key: PlatformFilter; label: string }[] = [
  { key: "all", label: "All Platforms" },
  ...Object.keys(PLATFORM_LABELS).map((k) => ({
    key: k as EngagementPlatform,
    label: PLATFORM_LABELS[k as EngagementPlatform],
  })),
];

const DATES: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const REACTIONS: { key: ReactionFilter; label: string }[] = [
  { key: "all", label: "All Reactions" },
  ...Object.keys(REACTION_EMOJI)
    .filter((k) => k !== "REACH" && k !== "ENGAGEMENT_RATE")
    .map((k) => ({
      key: k as ReactionType,
      label: `${REACTION_EMOJI[k as ReactionType]} ${k.charAt(0) + k.slice(1).toLowerCase()}`,
    })),
];

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
        active
          ? "border-red-400/40 bg-red-500/15 text-white"
          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function PlatformFilter({
  platform,
  onPlatform,
  date,
  onDate,
  reaction,
  onReaction,
  search,
  onSearch,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={1.8} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search posts, captions…"
          className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-400/40"
        />
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Platform
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <Chip key={p.key} active={platform === p.key} label={p.label} onClick={() => onPlatform(p.key)} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Date
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DATES.map((d) => (
            <Chip key={d.key} active={date === d.key} label={d.label} onClick={() => onDate(d.key)} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Reaction Type
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REACTIONS.map((r) => (
            <Chip key={r.key} active={reaction === r.key} label={r.label} onClick={() => onReaction(r.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}
