"use client";

import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";

type Props = {
  onNewPost: () => void;
};

export default function SchedulerHeader({ onNewPost }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-red-300" strokeWidth={1.8} />
          <h1 className="text-lg font-semibold text-white">Publishing Scheduler</h1>
        </div>
        <p className="text-xs text-white/55">
          Plan, schedule and publish posts across all connected platforms — in one place.
        </p>
      </div>
      <button
        onClick={onNewPost}
        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 hover:shadow-[0_0_26px_rgba(248,113,113,0.25)]"
      >
        + New Post
      </button>
    </div>
  );
}
