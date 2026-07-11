"use client";

import { Plus, Search, Calendar as CalIcon, List } from "lucide-react";
import type { PlatformKey, PostStatus, ViewMode } from "@/types/scheduler";
import { PLATFORM_LIST, STATUS_META } from "./platformMeta";

export type PlatformFilter = PlatformKey | "all";
export type StatusFilter = PostStatus | "all";

type ToolbarProps = {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  platform: PlatformFilter;
  onPlatformChange: (p: PlatformFilter) => void;
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewPost: () => void;
};

export default function SchedulerToolbar({
  view,
  onViewChange,
  platform,
  onPlatformChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
  dateLabel,
  onPrev,
  onNext,
  onToday,
  onNewPost,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {/* date nav */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          <NavBtn onClick={onPrev}>‹</NavBtn>
          <button
            onClick={onToday}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Today
          </button>
          <NavBtn onClick={onNext}>›</NavBtn>
        </div>
        <span className="min-w-[140px] text-sm font-semibold text-white">{dateLabel}</span>

        {/* view toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                view === v ? "bg-white/15 text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {v === "month" ? <CalIcon className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search posts…"
            className="h-9 w-44 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-red-400/40"
          />
        </div>

        {/* platform filter */}
        <Select
          value={platform}
          onChange={(v) => onPlatformChange(v as PlatformFilter)}
          options={[
            { value: "all", label: "All Platforms" },
            ...PLATFORM_LIST.map((p) => ({ value: p.key, label: p.label })),
          ]}
        />

        {/* status filter */}
        <Select
          value={status}
          onChange={(v) => onStatusChange(v as StatusFilter)}
          options={[
            { value: "all", label: "All Status" },
            ...(Object.keys(STATUS_META) as PostStatus[]).map((s) => ({
              value: s,
              label: STATUS_META[s].label,
            })),
          ]}
        />

        <button
          onClick={onNewPost}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 hover:shadow-[0_0_26px_rgba(248,113,113,0.25)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Post
        </button>
      </div>
    </div>
  );
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs text-white/80 outline-none focus:border-red-400/40 [&>option]:bg-[#0b0b0d]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
