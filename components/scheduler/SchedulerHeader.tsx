"use client";

import { motion } from "framer-motion";

type SchedulerHeaderProps = {
  onNewPost: () => void;
};

export default function SchedulerHeader({ onNewPost }: SchedulerHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="text-lg font-semibold text-white">Post Scheduler</div>
        <div className="text-xs text-white/60">Create, review and schedule posts for all company platforms.</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewPost} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">New Post</button>
      </div>
    </div>
  );
}
