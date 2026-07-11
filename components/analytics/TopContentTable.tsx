"use client";

import Panel from "./Panel";
import PlatformIcon from "@/components/content-planner/PlatformIcon";
import { compact, full } from "./format";
import type { TopContent } from "@/types/analytics";

export default function TopContentTable({ items }: { items: TopContent[] }) {
  return (
    <Panel title="Top Performing Content" subtitle="Ranked by reach this period">
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
            {/* thumbnail tile (generated; no media yet) */}
            <div
              className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase text-white/90"
              style={{ background: `linear-gradient(135deg, ${t.thumbnailColor}, rgba(0,0,0,0.35))` }}
            >
              {t.platform.slice(0, 3)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <PlatformIcon platform={t.platform} size={12} />
                <span className="truncate text-sm font-medium text-white">{t.title}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-white/45">
                <span>👁 {compact(t.reach)}</span>
                <span>♥ {full(t.likes)}</span>
                <span>💬 {full(t.comments)}</span>
                <span>↗ {full(t.shares)}</span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold text-white">{t.engagementRate}%</div>
              <div className="text-[9px] uppercase tracking-wide text-white/40">eng. rate</div>
            </div>

            <span className="hidden w-6 shrink-0 text-center text-xs font-bold text-white/30 sm:block">#{i + 1}</span>
          </div>
        ))}
        {items.length === 0 && <div className="py-6 text-center text-xs text-white/40">No content for this filter.</div>}
      </div>
    </Panel>
  );
}
