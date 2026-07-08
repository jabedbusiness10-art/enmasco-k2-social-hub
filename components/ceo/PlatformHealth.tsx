"use client";

import { motion } from "framer-motion";
import type { PlatformHealthItem } from "@/types/ceo";

type PlatformHealthProps = {
  items: PlatformHealthItem[];
};

const dotClass: Record<string, string> = {
  connected: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
  warning: "bg-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.9)]",
  error: "bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.9)]",
};

export default function PlatformHealth({ items }: PlatformHealthProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Platform Health</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <span className={`h-2 w-2 rounded-full ${dotClass[item.status]}`} />
            <span className="text-xs text-white/80">{item.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
