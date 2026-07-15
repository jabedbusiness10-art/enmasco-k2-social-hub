"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommitVertical, Activity, ShieldAlert } from "lucide-react";

export default function NotificationTimeline() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/notifications/events?take=40");
      const j = await r.json();
      const merged = [
        ...(j.events || []).map((e: any) => ({
          id: e.id, when: e.createdAt, module: e.module || e.category,
          action: e.title, status: "info", source: "notification",
        })),
        ...(j.systemEvents || []).map((e: any) => ({
          id: e.id, when: e.createdAt, module: e.source,
          action: e.action, status: e.status, source: "system", message: e.message,
        })),
      ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
      setRows(merged);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />)}</div>;
  if (!rows.length) return <div className="py-10 text-center text-sm text-white/40">No events recorded yet.</div>;

  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-1 h-full w-px bg-white/10" />
      {rows.map((row, i) => (
        <motion.div key={row.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
          className="relative mb-3 flex gap-3">
          <div className="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-[#0e0f17]">
            {row.source === "system" ? <ShieldAlert className="h-2.5 w-2.5 text-amber-300" /> : <Activity className="h-2.5 w-2.5 text-sky-300" />}
          </div>
          <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white/80">{row.action}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${row.status === "failed" ? "border-red-500/40 text-red-200" : row.status === "pending" ? "border-amber-500/40 text-amber-200" : "border-emerald-500/30 text-emerald-200"}`}>{row.status}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/40">
              <span className="rounded-full border border-white/10 px-1.5 py-0.5">{row.module}</span>
              <span>{new Date(row.when).toLocaleString()}</span>
            </div>
            {row.message && <div className="mt-1 text-[11px] text-white/50">{row.message}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
