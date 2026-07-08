"use client";

import { motion } from "framer-motion";
import type { Notification } from "@/types/notification";

type NotificationDetailsProps = {
  notification: Notification | null;
};

export default function NotificationDetails({ notification }: NotificationDetailsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Notification Details</div>
      {notification ? (
        <div className="mt-3 space-y-2 text-xs text-white/80">
          <div className="flex justify-between"><span className="text-white/60">Title</span><span className="text-white">{notification.title}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Type</span><span className="text-white">{notification.type}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Platform</span><span className="text-white">{notification.platform}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Priority</span><span className="text-white">{notification.priority}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Status</span><span className="text-white">{notification.read ? "Read" : "Unread"}</span></div>
          <div className="flex justify-between"><span className="text-white/60">Created</span><span className="text-white">{notification.createdAt}</span></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white">{notification.description}</div>
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-white/60">Suggested Action: Open related module if needed.</div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-white/60">Select a notification to view details.</div>
      )}
    </div>
  );
}
