"use client";

import { motion } from "framer-motion";
import type { NotificationSetting } from "@/types/notification";

type NotificationFiltersProps = {
  filters: string[];
  active: string;
  onSelect: (value: string) => void;
};

export default function NotificationFilters({ filters, active, onSelect }: NotificationFiltersProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Filters</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {filters.map((item, index) => (
          <motion.button
            key={item}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            onClick={() => onSelect(item)}
            className={`rounded-xl border px-2 py-1.5 text-xs font-semibold transition ${active === item ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
