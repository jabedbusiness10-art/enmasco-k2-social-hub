"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  CalendarClock,
  CalendarDays,
  Send,
  Ban,
  UserRoundCheck,
  Archive,
  MessageSquare,
} from "lucide-react";
import type { PlanningActivity } from "@/types/contentPlanner";

// All supported activity types, including Deleted/Cancelled from TASK-81.
type EventType =
  | "CREATED"
  | "EDITED"
  | "FAILED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "APPROVED"
  | "REJECTED"
  | "COMMENT"
  | "DELETED"
  | "CANCELLED";

// Full icon map. Unknown types fall back to Activity.
const ICON: Record<EventType, React.ComponentType<{ className?: string }>> = {
  CREATED: Plus,
  EDITED: Pencil,
  FAILED: Ban,
  SCHEDULED: CalendarClock,
  PUBLISHED: Send,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  COMMENT: MessageSquare,
  DELETED: Trash2,
  CANCELLED: XCircle,
};

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function verbFor(t: EventType) {
  return {
    CREATED: "created",
    EDITED: "edited",
    FAILED: "failed",
    SCHEDULED: "scheduled",
    PUBLISHED: "published",
    APPROVED: "approved",
    REJECTED: "rejected",
    COMMENT: "commented on",
    DELETED: "deleted",
    CANCELLED: "cancelled",
  }[t];
}

function safeType(raw: PlanningActivity["type"] | undefined | null): EventType {
  if (raw && ICON[raw]) return raw;
  return "FAILED";
}

function tintFor(type: EventType) {
  if (type === "PUBLISHED" || type === "APPROVED") return "text-emerald-300 bg-emerald-400/10";
  if (type === "REJECTED" || type === "FAILED" || type === "DELETED" || type === "CANCELLED") return "text-rose-300 bg-rose-500/10";
  if (type === "SCHEDULED") return "text-sky-300 bg-sky-400/10";
  if (type === "COMMENT") return "text-amber-300 bg-amber-400/10";
  return "text-amber-300 bg-amber-400/10";
}

export default function ActivityTimeline({ items }: { items: PlanningActivity[] }) {
  const sorted = [...items]
    .filter((a) => a.id)
    .sort(
      (a, b) =>
        (Number.isFinite(new Date(b.at).getTime()) ? new Date(b.at).getTime() : 0) -
        (Number.isFinite(new Date(a.at).getTime()) ? new Date(a.at).getTime() : 0),
    );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
        <div className="text-xs text-white/35">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">Recent Planning Activity</div>
      <div className="relative space-y-3 pl-4">
        <span className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
        {sorted.map((a, i) => {
          const type = safeType(a.type);
          const Icon = ICON[type];
          const tint = tintFor(type);

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
                <div className="min-w-0 flex-1 text-xs text-white/75">
                  <span className="font-medium text-white/90">{a.actorName ?? "Unknown"}</span>
                  <span className="text-white/50"> {verbFor(type)}</span>
                  {a.contentTitle && <span className="text-white/75"> "{a.contentTitle}"</span>}
                </div>
                <span className="shrink-0 text-[10px] text-white/35">{fmt(a.at)}</span>
              </div>
              {a.detail && (
                <div className="mt-0.5 truncate text-[11px] text-white/45">{a.detail}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
