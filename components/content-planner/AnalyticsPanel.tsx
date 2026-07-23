"use client";

import { motion } from "framer-motion";
import { ChevronRight, CalendarClock, ListChecks, Activity, TrendingUp } from "lucide-react";
import type { ContentPlan, PlanningActivity } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import { StatusBadge } from "./StatusBadge";

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AnalyticsPanel({
  items,
  activity,
  onOpen,
}: {
  items: ContentPlan[];
  activity: PlanningActivity[];
  onOpen: (i: ContentPlan) => void;
}) {
  const inQueue = items
    .filter((i) => i.status === "SCHEDULED" || i.status === "APPROVED" || i.status === "REVIEW")
    .sort((a, b) => new Date(a.schedule.scheduledAt).getTime() - new Date(b.schedule.scheduledAt).getTime())
    .slice(0, 5);

  const upcoming = items
    .filter((i) => new Date(i.schedule.scheduledAt) >= new Date() && i.status !== "DRAFT" && i.status !== "PUBLISHED" && i.status !== "FAILED")
    .sort((a, b) => new Date(a.schedule.scheduledAt).getTime() - new Date(b.schedule.scheduledAt).getTime())
    .slice(0, 5);

  const recentActivity = activity.slice(0, 5);
  const performed = items
    .filter((i) => i.performance)
    .sort((a, b) => (b.performance!.impressions) - (a.performance!.impressions))
    .slice(0, 4);

  const totalImpr = performed.reduce((s, i) => s + (i.performance?.impressions ?? 0), 0);
  const totalEng = performed.reduce((s, i) => s + (i.performance?.engagements ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <PanelSection title="Upcoming Posts" icon={CalendarClock} count={upcoming.length}>
        {upcoming.length === 0 ? <InlineEmpty label="No upcoming posts" /> : upcoming.map((i) => (
          <Row key={i.id} onClick={() => onOpen(i)}>
            <PlatformIcon platform={i.platform} size={13} />
            <span className="min-w-0 flex-1 truncate text-xs text-white/80">{i.title}</span>
            <span className="text-[11px] text-white/35">{fmt(i.schedule.scheduledAt).split(",")[0]}</span>
            <ChevronRight className="h-3 w-3 shrink-0 text-white/20" />
          </Row>
        ))}
      </PanelSection>

      <PanelSection title="Publishing Queue" icon={ListChecks} count={inQueue.length}>
        {inQueue.length === 0 ? <InlineEmpty label="Queue is empty" /> : inQueue.map((i) => (
          <Row key={i.id} onClick={() => onOpen(i)}>
            <PlatformIcon platform={i.platform} size={13} />
            <span className="min-w-0 flex-1 truncate text-xs text-white/80">{i.title}</span>
            <StatusBadge status={i.status} />
          </Row>
        ))}
      </PanelSection>

      <PanelSection title="Recent Activity" icon={Activity} count={recentActivity.length}>
        {recentActivity.length === 0 ? (
          <InlineEmpty label="No recent activity" />
        ) : (
          recentActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dotFor(a.type)}`} />
              <span className="min-w-0 flex-1 truncate text-xs text-white/75">
                <span className="font-medium text-white/90">{a.actorName ?? "Unknown"}</span>{" "}
                <span className="text-white/55">{verbFor(a.type)}</span>
                {a.contentTitle ? <span className="text-white/80"> "{a.contentTitle}"</span> : ""}
              </span>
            </div>
          ))
        )}
      </PanelSection>

      <PanelSection title="Performance" icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Impr" value={totalImpr.toLocaleString()} />
          <Metric label="Eng" value={totalEng.toLocaleString()} />
        </div>
        {performed.map((i) => (
          <div key={i.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={i.platform} size={13} />
              <span className="min-w-0 flex-1 truncate text-xs text-white/80">{i.title}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-white/45">
              <span>{i.performance!.impressions.toLocaleString()} imps</span>
              <span>{i.performance!.engagements.toLocaleString()} eng</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-rose-500"
                style={{ width: `${Math.min(100, ((i.performance!.engagements ?? 0) / Math.max(1, i.performance!.impressions ?? 1)) * 400)}%` }}
              />
            </div>
          </div>
        ))}
      </PanelSection>
    </div>
  );
}

function PanelSection({ title, icon: Icon, count, children }: { title: string; icon: any; count?: number; children: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5 text-sky-400" />
        <span className="flex-1">{title}</span>
        {typeof count === "number" && <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] text-white/55">{count}</span>}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ children, onClick }: { children: any; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition ${onClick ? "cursor-pointer hover:bg-white/5" : ""}`}
    >
      {children}
    </button>
  );
}

function InlineEmpty({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-1.5 py-2 text-[11px] text-white/25">
      <span className="h-1 w-1 rounded-full bg-white/20" />
      {label}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function dotFor(t: PlanningActivity["type"]) {
  return {
    PUBLISHED: "bg-violet-400",
    APPROVED: "bg-emerald-400",
    SCHEDULED: "bg-sky-400",
    EDITED: "bg-white/40",
    FAILED: "bg-rose-400",
    CREATED: "bg-sky-400",
    REJECTED: "bg-rose-400",
    COMMENT: "bg-amber-400",
  }[t] ?? "bg-white/30";
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
  }[t] ?? "updated";
}
