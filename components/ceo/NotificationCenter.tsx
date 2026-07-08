"use client";

import { motion } from "framer-motion";
import type { NotificationItem } from "@/types/ceo";

type NotificationCenterProps = {
  notifications: NotificationItem[];
};

const severityClass: Record<string, string> = {
  info: "border-white/10 text-white/80",
  warning: "border-amber-500/40 text-amber-200",
  error: "border-red-500/40 text-red-200",
};

export default function NotificationCenter({ notifications }: NotificationCenterProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Notification Center</div>
      <div className="mt-3 space-y-2">
        {notifications.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className={`rounded-xl border ${severityClass[item.severity]} bg-white/[0.04] p-3`}
          >
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="text-xs text-white/60">{item.message}</div>
            <div className="text-[11px] text-white/50">{item.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
