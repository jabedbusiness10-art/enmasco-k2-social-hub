"use client";

import { motion } from "framer-motion";
import type { AutomationStat } from "@/types/insights";

type AutomationAnalyticsProps = {
  stats: AutomationStat;
};

const items = [
  { label: "Workflow Runs", value: stats.workflowRuns, accent: "border-white/10 text-white/80" },
  { label: "Success Rate", value: `${stats.successRate}%`, accent: "border-emerald-500/40 text-emerald-200" },
  { label: "Failed Jobs", value: stats.failedJobs, accent: "border-red-500/40 text-red-200" },
  { label: "Average Runtime", value: stats.avgExecutionTime, accent: "border-amber-500/40 text-amber-200" },
];

export default function AutomationAnalytics({ stats }: AutomationAnalyticsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Automation Performance</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className={`rounded-xl border ${item.accent} bg-white/[0.04] p-3`}
          >
            <div className="text-[11px] text-white/60">{item.label}</div>
            <div className="text-lg font-semibold">{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
