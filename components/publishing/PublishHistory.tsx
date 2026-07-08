"use client";

import { motion } from "framer-motion";
import type { PublishHistoryItem } from "@/types/publishing";

type PublishHistoryProps = {
  history: PublishHistoryItem[];
};

export default function PublishHistory({ history }: PublishHistoryProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Publish History</div>
      <div className="divide-y divide-white/5">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs text-white/80"
          >
            <div>
              <div className="text-white">{item.title}</div>
              <div className="text-white/60">{item.platform} • {item.publishedAt}</div>
            </div>
            <div className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${item.result === "SUCCESS" ? "border-emerald-500/40 text-emerald-200" : "border-red-500/40 text-red-200"}`}>
              {item.result} {item.retryCount ? `• retry:${item.retryCount}` : ""}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
