"use client";

import { motion } from "framer-motion";
import PriorityBadge from "./PriorityBadge";

const categoryColor: Record<string, string> = {
  SOCIAL: "text-sky-300", PUBLISHING: "text-emerald-300", AI: "text-violet-300",
  MEDIA: "text-amber-300", ASSIGNMENTS: "text-rose-300", ANALYTICS: "text-cyan-300",
  SECURITY: "text-red-300", SYSTEM: "text-white/60", MENTIONS: "text-sky-300", MESSAGES: "text-sky-300",
};

export default function NotificationCard({ notification, onOpen, onRead, onArchive }: any) {
  const n = notification;
  const go = () => {
    if (!n.isRead) onRead?.(n.id);
    onOpen?.(n);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, scale: 1.005 }}
      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${n.isRead ? "border-white/5 bg-white/[0.02]" : "border-sky-400/20 bg-sky-400/[0.06]"}`}
    >
      <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-white/10 bg-white/5" />
      <button onClick={go} className="flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase ${categoryColor[n.category ?? "SYSTEM"] || "text-white/60"}`}>{n.category ?? "SYSTEM"}</span>
          <PriorityBadge priority={n.priority} />
          {n.platform && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60">{n.platform}</span>}
        </div>
        <div className="mt-1 text-sm font-semibold text-white">{n.title}</div>
        {n.body && <div className="mt-0.5 text-xs text-white/60">{n.body}</div>}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-white/40">
          <span>{new Date(n.createdAt).toLocaleString()}</span>
          {n.senderName && <span>· {n.senderName}</span>}
          {!n.isRead && <span className="rounded-full border border-sky-500/30 px-1.5 py-0.5 text-sky-200">Unread</span>}
        </div>
      </button>
      {onArchive && (
        <button onClick={() => onArchive(n.id)} className="self-center rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/50 hover:bg-white/5">Archive</button>
      )}
    </motion.div>
  );
}
