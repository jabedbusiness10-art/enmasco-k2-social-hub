"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Pencil, Send, AlertCircle, Plus, MessageSquare, XCircle, CalendarClock } from "lucide-react";
import type { PlanningActivity } from "@/types/contentPlanner";

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ICON: Record<PlanningActivity["type"], any> = {
  CREATED: Plus,
  SCHEDULED: CalendarClock,
  PUBLISHED: CheckCircle2,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  FAILED: AlertCircle,
  EDITED: Pencil,
  COMMENT: MessageSquare,
};

export default function ActivityTimeline({ items }: { items: PlanningActivity[] }) {
  const sorted = [...items].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">Recent Planning Activity</div>
      <div className="relative space-y-3 pl-4">
        <span className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
        {sorted.map((a, i) => {
          const Icon = ICON[a.type];
          const tint =
            a.type === "PUBLISHED" || a.type === "APPROVED"
              ? "text-emerald-300 bg-emerald-400/10"
              : a.type === "FAILED" || a.type === "REJECTED"
              ? "text-rose-300 bg-rose-500/10"
              : a.type === "SCHEDULED"
              ? "text-sky-300 bg-sky-400/10"
              : "text-amber-300 bg-amber-400/10";
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <span className={`absolute -left-[19px] flex h-5 w-5 items-center justify-center rounded-full ${tint}`}>
                <Icon className="h-3 w-3" />
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-white/75">
                  <span className="font-medium text-white/90">{a.actorName}</span>{" "}
                  {verbFor(a.type)} {a.contentTitle && <span className="text-white/55">“{a.contentTitle}”</span>}
                </div>
                <span className="shrink-0 text-[10px] text-white/35">{fmt(a.at)}</span>
              </div>
              {a.detail && <div className="mt-0.5 text-[11px] text-white/45">{a.detail}</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function verbFor(t: PlanningActivity["type"]) {
  return {
    CREATED: "created",
    SCHEDULED: "scheduled",
    PUBLISHED: "published",
    APPROVED: "approved",
    REJECTED: "rejected",
    FAILED: "failed",
    EDITED: "edited",
    COMMENT: "commented on",
  }[t];
}
