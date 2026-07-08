"use client";

import { motion } from "framer-motion";
import type { Execution } from "@/types/automation";

type ExecutionDetailsProps = {
  execution?: Execution;
};

export default function ExecutionDetails({ execution }: ExecutionDetailsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Execution Details</div>
      {execution ? (
        <div className="mt-3 space-y-2 text-xs text-white/80">
          <div className="flex justify-between"><span className="text-white/60">Workflow</span><span className="text-white">{execution.workflowName}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Started</span><span className="text-white">{execution.startedAt}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Duration</span><span className="text-white">{execution.duration ?? "—"}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Result</span><span className="text-white">{execution.status}</span></div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-white/60">Select a workflow to see execution details.</div>
      )}
    </div>
  );
}
