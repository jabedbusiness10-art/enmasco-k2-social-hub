"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Download, CalendarRange, Filter, Check } from "lucide-react";
import PlatformIcon from "@/components/content-planner/PlatformIcon";
import { buildAnalytics, ANALYTICS_PLATFORMS } from "@/data/analytics";
import type { DateRangeKey, PlatformKey } from "@/types/analytics";
import KpiCards from "@/components/analytics/KpiCards";
import ChartsGrid from "@/components/analytics/ChartsGrid";
import PlatformCards from "@/components/analytics/PlatformCards";
import TopContentTable from "@/components/analytics/TopContentTable";
import AudiencePanel from "@/components/analytics/AudiencePanel";
import AiInsightsPanel from "@/components/analytics/AiInsightsPanel";
import ActivityFeed from "@/components/analytics/ActivityFeed";
import { cn } from "@/lib/utils";

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom Range" },
];

export default function LiveAnalyticsPage() {
  const [range, setRange] = useState<DateRangeKey>("30d");
  const [platforms, setPlatforms] = useState<PlatformKey[]>([]);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const data = useMemo(
    () => buildAnalytics({ range, platforms }),
    [range, platforms],
  );

  const togglePlatform = (p: PlatformKey) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const refresh = () => {
    setRefreshing(true);
    // No fake delay — simulate an instant refresh of the (mock) dataset.
    setTimeout(() => setRefreshing(false), 350);
  };

  const exportReport = () => {
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `k2-analytics-${range}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <div>
          <h1 className="text-xl font-semibold text-white">Live Analytics Dashboard</h1>
          <p className="text-xs text-white/45">Enterprise social performance — real-time company insights</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date range picker */}
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as DateRangeKey)}
              className="h-9 appearance-none rounded-xl border border-white/10 bg-white/[0.06] pl-8 pr-3 text-xs text-white outline-none focus:border-sky-400"
            >
              {RANGES.map((r) => (
                <option key={r.key} value={r.key} className="bg-[#0e0f17]">
                  {r.label}
                </option>
              ))}
            </select>
            <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>

          {/* Platform filter */}
          <div className="relative">
            <button
              onClick={() => setPlatformOpen((v) => !v)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white/80 hover:bg-white/10"
            >
              <Filter className="h-3.5 w-3.5" />
              Platform{platforms.length ? ` (${platforms.length})` : ""}
            </button>
            {platformOpen && (
              <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-white/10 bg-[#0e0f17] p-2 shadow-2xl">
                {ANALYTICS_PLATFORMS.map((p) => {
                  const active = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-white/80 hover:bg-white/5"
                    >
                      <span className="flex items-center gap-2 capitalize">{<PlatformIcon platform={p} size={14} />} {p}</span>
                      {active && <Check className="h-3.5 w-3.5 text-sky-300" />}
                    </button>
                  );
                })}
                {platforms.length > 0 && (
                  <button
                    onClick={() => setPlatforms([])}
                    className="mt-1 w-full rounded-lg px-2 py-1.5 text-[11px] text-rose-300 hover:bg-white/5"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={exportReport}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white/80 hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>

          <button
            onClick={refresh}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 text-xs font-semibold text-white"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Body */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <KpiCards kpi={data.kpi} />
        <ChartsGrid data={data} />
        <PlatformCards items={data.platformAnalytics} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <TopContentTable items={data.topContent} />
            <AudiencePanel audience={data.audience} />
          </div>
          <div className="space-y-4">
            <AiInsightsPanel ai={data.ai} />
            <ActivityFeed items={data.activity} />
          </div>
        </div>
      </div>
    </div>
  );
}
