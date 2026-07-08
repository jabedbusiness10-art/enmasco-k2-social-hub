"use client";

import { motion } from "framer-motion";

export default function InboxHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="text-lg font-semibold text-white">Unified Social Inbox</div>
        <div className="text-xs text-white/60">Monitor and manage all external customer conversations.</div>
      </div>
      <div className="flex items-center gap-2">
        <input className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Search conversations..." />
        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10">Refresh</button>
      </div>
    </div>
  );
}
