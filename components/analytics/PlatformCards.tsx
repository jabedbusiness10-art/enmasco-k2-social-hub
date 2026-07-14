"use client";

import Panel from "./Panel";
import PlatformIcon from "@/components/content-planner/PlatformIcon";
import { compact, pct } from "./format";
import type { PlatformAnalytics, PlatformStatus } from "@/types/analytics";

const STATUS_META: Record<PlatformStatus, { label: string; cls: string }> = {
  healthy: { label: "Healthy", cls: "bg-emerald-500/15 text-emerald-300" },
  growing: { label: "Growing", cls: "bg-sky-500/15 text-sky-300" },
  declining: { label: "Declining", cls: "bg-rose-500/15 text-rose-300" },
  attention: { label: "Needs Attention", cls: "bg-amber-500/15 text-amber-300" },
};

export default function PlatformCards({ items }: { items: PlatformAnalytics[] }) {
  return (
    <Panel title="Platform Analytics" subtitle="Per-platform performance snapshot">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => {
          const st = STATUS_META[p.status];
          const up = p.growthPct >= 0;
          const noData = p.available === false;
          return (
            <div key={p.platform} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={p.platform} size={16} />
                  <span className="text-sm font-semibold capitalize text-white">{p.platform}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.label}</span>
              </div>

              {noData ? (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center text-[11px] text-white/45">
                  No Data Available
                  <div className="mt-0.5 text-[10px] text-white/30">Integration not configured</div>
                </div>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Metric label="Reach" value={compact(p.reach)} />
                    <Metric label="Engagement" value={`${p.engagement}%`} />
                    <Metric label="Followers" value={compact(p.followers)} />
                    <Metric label="Posts" value={String(p.posts)} />
                  </div>

                  <div className={`mt-2 flex items-center gap-1 text-[11px] font-medium ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {up ? "▲" : "▼"} {pct(p.growthPct)} <span className="text-white/40">growth</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  );
}
