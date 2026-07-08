"use client";

import { motion } from "framer-motion";
import type { AutomationRun } from "@/types/ceo";

type AutomationMonitorProps = {
  runs: AutomationRun[];
};

const statusClass: Record<string, string> = {
  running: "border-amber-500/40 text-amber-200",
  completed: "border-emerald-500/40 text-emerald-200",
  failed: "border-red-500/40 text-red-200",
};

export default function AutomationMonitor({ runs }: AutomationMonitorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">K2Flow Automation Monitor</div>
      <div className="mt-3 space-y-2">
        {runs.map((run, index) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-white">{run.name}</div>
              <div className="text-xs text-white/60">{run.startedAt}</div>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass[run.status] || statusClass.running}`}>{run.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
