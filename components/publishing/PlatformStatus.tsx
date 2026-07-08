"use client";

import { motion } from "framer-motion";
import type { PlatformStatusItem } from "@/types/publishing";

type PlatformStatusProps = {
  items: PlatformStatusItem[];
};

const dotClass: Record<string, string> = {
  true: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
  false: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]",
};

export default function PlatformStatus({ items }: PlatformStatusProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Platform Status</div>
      <div className="grid grid-cols-1 gap-2 p-3 xl:grid-cols-2">
        {items.map((item, index) => (
          <motion.div
            key={item.platform}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3"
          >
            <div>
              <div className="text-sm font-semibold text-white">{item.platform}</div>
              <div className="text-[11px] text-white/60">Last publish: {item.lastPublish}</div>
              {item.lastError && <div className="text-[11px] text-red-200">{item.lastError}</div>}
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${item.connected ? "border-emerald-500/40 text-emerald-200" : "border-red-500/40 text-red-200"}`}>
                <span className={`inline-block h-2 w-2 rounded-full ${dotClass[String(item.connected)]}`} />
                {item.connected ? "Connected" : "Disconnected"}
              </div>
              <div className="mt-1 text-[11px] text-white/60">Queue: {item.queueSize}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
