"use client";

import { motion } from "framer-motion";
import { Activity, RefreshCw, Database, Radio } from "lucide-react";
import type { LiveStatus } from "@/types/engagement";
import { fmtDate } from "./dateUtils";

function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

export default function EngagementOverview({ live }: { live: LiveStatus }) {
  const syncedAgo = fmtDate(live.lastSync);

  const items = [
    {
      icon: Radio,
      label: "Monitoring",
      value: live.monitoring ? "Active" : "Paused",
      dot: live.monitoring ? "#34D399" : "#F87171",
      text: live.monitoring ? "text-emerald-300" : "text-red-300",
    },
    {
      icon: RefreshCw,
      label: "Refresh",
      value: live.refresh === "live" ? "Live" : live.refresh,
      dot: "#60A5FA",
      text: "text-sky-300",
    },
    {
      icon: Database,
      label: "Last Sync",
      value: syncedAgo,
      dot: "#A78BFA",
      text: "text-violet-300",
    },
    {
      icon: Database,
      label: "Data Source",
      value: live.dataSource,
      dot: "#F472B6",
      text: "text-pink-300",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-red-300" strokeWidth={1.8} />
        <h2 className="text-sm font-semibold text-white">Live Status</h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-2.5"
            >
              <StatusDot color={it.dot} />
              <Icon className="h-4 w-4 text-white/45" strokeWidth={1.8} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-white/40">{it.label}</div>
                <div className={`truncate text-xs font-medium ${it.text}`}>{it.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
