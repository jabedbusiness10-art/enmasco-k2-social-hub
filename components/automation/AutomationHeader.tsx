"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

type AutomationHeaderProps = {
  tabs: readonly string[];
  tab: string;
  onSelectTab: (tab: string) => void;
};

export default function AutomationHeader({ tabs, tab, onSelectTab }: AutomationHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <h1 className="text-xl font-semibold text-white">K2Flow Automation Engine</h1>
        <p className="text-xs text-white/60">Background workflows, jobs queues and monitoring.</p>
      </div>
      <div className="flex items-center gap-2">
        <input className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white outline-none placeholder:text-white/40" placeholder="Search workflows..." />
        <motion.button whileHover={{ y: -1, scale: 1.02 }} className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15">New Automation</motion.button>
      </div>
      <div className="flex w-full flex-wrap gap-2">
        {tabs.map((item, index) => (
          <motion.button
            key={item}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            onClick={() => onSelectTab(item)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${tab === item ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
