"use client";

import { motion } from "framer-motion";

export default function QueueFilters() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Filters</div>
      <div className="mt-2 space-y-2">
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"><option>Workflow</option><option>Daily Content Scheduler</option><option>Auto Publish</option></select>
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"><option>Status</option><option>Running</option><option>Queued</option><option>Failed</option></select>
        <select className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"><option>Priority</option><option>High</option><option>Medium</option><option>Low</option></select>
      </div>
    </div>
  );
}
