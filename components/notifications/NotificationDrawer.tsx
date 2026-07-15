"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CheckCheck, ArrowRight, Bell } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import type { Notification } from "@/types/notification";

const categoryColor: Record<string, string> = {
  SOCIAL: "text-sky-300", PUBLISHING: "text-emerald-300", AI: "text-violet-300",
  MEDIA: "text-amber-300", ASSIGNMENTS: "text-rose-300", ANALYTICS: "text-cyan-300",
  SECURITY: "text-red-300", SYSTEM: "text-white/60", MENTIONS: "text-sky-300", MESSAGES: "text-sky-300",
};

export default function NotificationDrawer({ onClose, onViewAll, onChanged }: any) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/notifications?take=12");
    const j = await r.json();
    setItems(j.items ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onChanged?.();
  };

  const markAll = async () => {
    setItems((p) => p.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications/read-all", { method: "POST" });
    onChanged?.();
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/50" onClick={onClose}>
      <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#0e0f17]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Bell className="h-4 w-4 text-sky-400" /> Notifications</div>
          <div className="flex items-center gap-1">
            <button onClick={markAll} className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/70 hover:bg-white/5"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>
            <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-white/40">No notifications yet.</div>
          ) : (
            <AnimatePresence>
              {items.map((n) => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`mb-2 flex gap-3 rounded-2xl border p-3 ${n.isRead ? "border-white/5 bg-white/[0.02]" : "border-sky-400/20 bg-sky-400/[0.06]"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold uppercase ${categoryColor[n.category ?? "SYSTEM"] || "text-white/60"}`}>{n.category ?? "SYSTEM"}</span>
                      <PriorityBadge priority={n.priority} />
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-white">{n.title}</div>
                    {n.body && <div className="mt-0.5 line-clamp-2 text-[11px] text-white/55">{n.body}</div>}
                    <div className="mt-1 text-[10px] text-white/35">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="self-center rounded-lg border border-white/10 p-1.5 text-sky-300 hover:bg-white/5"><Check className="h-3.5 w-3.5" /></button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <button onClick={onViewAll} className="flex items-center justify-center gap-1.5 border-t border-white/10 py-3 text-xs font-semibold text-sky-300 hover:bg-white/5">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </div>
  );
}
