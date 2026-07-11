"use client";

import { Radio, CircleDot, Check } from "lucide-react";
import type { PlatformKey, ContentStatus, Platform } from "@/types/contentPlanner";
import { StatusBadge } from "./StatusBadge";
import PlatformIcon from "./PlatformIcon";

const STATUS_ORDER: ContentStatus[] = ["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"];

export default function FilterSidebar({
  platforms,
  selectedPlatforms,
  selectedStatuses,
  onTogglePlatform,
  onToggleStatus,
}: {
  platforms: Platform[];
  selectedPlatforms: PlatformKey[];
  selectedStatuses: ContentStatus[];
  onTogglePlatform: (k: PlatformKey) => void;
  onToggleStatus: (s: ContentStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">Platforms</div>
        <div className="space-y-0.5">
          {platforms.map((p) => {
            const active = selectedPlatforms.includes(p.key);
            return (
              <button
                key={p.key}
                onClick={() => onTogglePlatform(p.key)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <PlatformIcon platform={p.key} size={14} />
                  {p.name}
                </span>
                {active && <Check className="h-3.5 w-3.5 text-sky-300" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">Content Status</div>
        <div className="space-y-0.5">
          {STATUS_ORDER.map((s) => {
            const active = selectedStatuses.includes(s);
            return (
              <button
                key={s}
                onClick={() => onToggleStatus(s)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm transition ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"
                }`}
              >
                <StatusBadge status={s} />
                {active && <Check className="h-3.5 w-3.5 text-sky-300" />}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-1.5 px-1 text-[10px] text-white/30">
          <Radio className="h-3 w-3" /> Company channels only
        </div>
      </div>
    </div>
  );
}
