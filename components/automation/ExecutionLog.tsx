"use client";

import { motion } from "framer-motion";
import type { Execution } from "@/types/automation";

type ExecutionLogProps = {
  executions: Execution[];
};

const statusClass: Record<string, string> = {
  RUNNING: "border-white/20 text-white/80",
  SUCCESS: "border-emerald-500/40 text-emerald-200",
  FAILED: "border-red-500/40 text-red-200",
  WAITING: "border-amber-500/40 text-amber-200",
};

export default function ExecutionLog({ executions }: ExecutionLogProps) {
  return (
    <div className="mt-4 space-y-2">
      {executions.map((exec, index) => (
        <motion.div
          key={exec.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
        >
          <div>
            <div className="text-sm font-semibold text-white">{exec.workflowName}</div>
            <div className="text-xs text-white/60">{new Date(exec.startedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">{exec.duration}</span>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass[exec.status] || statusClass.WAITING}`}>{exec.status}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
