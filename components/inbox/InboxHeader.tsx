"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { notifications } from "@/data/inbox";
import { PLATFORMS } from "./platformMeta";

export default function InboxHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-red-300" strokeWidth={1.8} />
          <h1 className="text-lg font-semibold text-white">Unified Social Inbox</h1>
        </div>
        <p className="text-xs text-white/55">
          Manage every message, comment and conversation — one premium place.
        </p>
      </div>

      {/* live notification badges */}
      <div className="flex flex-wrap items-center gap-2">
        {notifications.map((n) => {
          const meta = PLATFORMS[n.platform];
          const Icon = meta.icon;
          return (
            <motion.span
              key={n.platform}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/75`}
            >
              <Icon className={`h-3.5 w-3.5 ${meta.text}`} strokeWidth={2} />
              <span className="font-semibold text-white">{n.count}</span>
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
