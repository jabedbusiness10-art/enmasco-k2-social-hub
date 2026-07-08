"use client";

import { motion } from "framer-motion";
import type { Notification } from "@/types/notification";

type NotificationCardProps = {
  notification: Notification;
  onOpen: (id: string) => void;
};

const priorityClass: Record<string, string> = {
  HIGH: "border-red-500/40 text-red-200",
  MEDIUM: "border-amber-500/40 text-amber-200",
  LOW: "border-white/20 text-white/80",
};

export default function NotificationCard({ notification, onOpen }: NotificationCardProps) {
  return (
    <motion.button
      onClick={() => onOpen(notification.id)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, scale: 1.01 }}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white/[0.04] p-3 text-left transition ${notification.read ? "border-white/5 text-white/60" : "border-white/10 text-white/90"}`}
    >
      <div className="mt-0.5 h-8 w-8 rounded-full border border-white/10 bg-white/5" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">{notification.title}</div>
          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${priorityClass[notification.priority] || priorityClass.LOW}`}>{notification.priority}</span>
        </div>
        <div className="mt-1 text-xs text-white/60">{notification.description}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
          <span className="rounded-full border border-white/10 px-2 py-1">{notification.platform}</span>
          <span>{notification.createdAt}</span>
          {!notification.read && <span className="rounded-full border border-sky-500/30 px-2 py-1 text-sky-200">Unread</span>}
        </div>
      </div>
    </motion.button>
  );
}
