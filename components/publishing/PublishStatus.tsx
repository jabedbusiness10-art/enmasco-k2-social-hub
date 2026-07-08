"use client";

import { motion } from "framer-motion";
import type { PublishJob } from "@/types/publishing";

type PublishStatusProps = {
  jobs: PublishJob[];
};

export default function PublishStatus({ jobs }: PublishStatusProps) {
  const current = jobs.find((j) => j.status === "PUBLISHING") || jobs[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Publishing Status</div>
      {current ? (
        <div className="mt-3 space-y-2 text-xs text-white/80">
          <div className="flex justify-between"><span className="text-white/60">Current Job</span><span className="text-white">{current.title}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Target Platform</span><span className="text-white">{current.platform}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Status</span><span className="text-white">{current.status}</span></div>
          {current.error && <div className="flex justify-between"><span className="text-white/60">Last Error</span><span className="text-red-200">{current.error}</span></div>}
        </div>
      ) : (
        <div className="mt-3 text-xs text-white/60">No active publishing job.</div>
      )}
    </div>
  );
}
