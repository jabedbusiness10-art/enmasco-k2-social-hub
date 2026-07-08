"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

type NotificationHeaderProps = {
  filters: readonly string[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
};

export default function NotificationHeader({ filters, activeFilter, onSelectFilter }: NotificationHeaderProps) {
  const list = Array.isArray(filters) ? filters : [];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <h1 className="text-xl font-semibold text-white">Enterprise Notification Center</h1>
        <p className="text-xs text-white/60">Publishing, approvals, AI tasks and system alerts.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((item, index) => (
          <motion.button
            key={item}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            onClick={() => onSelectFilter(item)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${activeFilter === item ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
