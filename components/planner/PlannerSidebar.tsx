"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

type PlannerSidebarProps = {
  view: string;
  setView: (view: string) => void;
};

const views = ["Month", "Week", "Day"];

export default function PlannerSidebar({ view, setView }: PlannerSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-white/[0.02]">
      <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Calendar View</div>
      <div className="space-y-1 px-3">
        {views.map((item) => (
          <motion.button
            key={item}
            onClick={() => setView(item)}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
              view === item ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {item}
          </motion.button>
        ))}
      </div>
      <div className="mt-auto px-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60">
          <Search className="h-4 w-4" strokeWidth={1.8} />
          <input className="w-full bg-transparent text-white outline-none placeholder:text-white/40" placeholder="Search posts..." />
        </div>
      </div>
    </div>
  );
}
