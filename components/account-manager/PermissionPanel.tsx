"use client";

import { motion } from "framer-motion";
import type { PermissionEntry } from "@/types/account-manager";

type PermissionPanelProps = {
  items: PermissionEntry[];
};

export default function PermissionPanel({ items }: PermissionPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Role Permissions</div>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div className="text-xs text-white/80">{item.role}</div>
            <div className="text-xs text-white/60">{item.access}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
