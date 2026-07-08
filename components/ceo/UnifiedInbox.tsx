"use client";

import { motion } from "framer-motion";
import type { InboxItem } from "@/types/ceo";

type UnifiedInboxProps = {
  items: InboxItem[];
};

export default function UnifiedInbox({ items }: UnifiedInboxProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Unified Social Inbox</div>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div>
              <div className="text-sm font-semibold text-white">{item.platform}</div>
              <div className="text-xs text-white/60">{item.type}</div>
            </div>
            <span className="text-xs font-semibold text-white">{item.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
