"use client";

import { CalendarClock, ListChecks, Activity, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ContentPlan, PlanningActivity } from "@/types/contentPlanner";
import PlatformIcon from "./PlatformIcon";
import { StatusBadge } from "./StatusBadge";
import { userById } from "@/data/contentPlanner";

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
  const now = new Date();
  const inQueue = items
    .filter((i) => i.status === "SCHEDULED" || i.status === "APPROVED")
    .sort((a, b) => new Date(a.schedule.scheduledAt).getTime() - new Date(b.schedule.scheduledAt).getTime())
    .slice(0, 5);

  const upcoming = items
    .filter((i) => new Date(i.schedule.scheduledAt) >= now && i.status !== "DRAFT" && i.status !== "PUBLISHED" && i.status !== "FAILED")
    .sort((a, b) => new Date(a.schedule.scheduledAt).getTime() - new Date(b.schedule.scheduledAt).getTime())
    .slice(0, 5);

  const performed = items
    .filter((i) => i.performance)
    .sort((a, b) => (b.performance!.impressions) - (a.performance!.impressions))
    .slice(0, 4);

  const totalImpr = performed.reduce((s, i) => s + (i.performance?.impressions ?? 0), 0);
  const totalEng = performed.reduce((s, i) => s + (i.performance?.engagements ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <Section title="Upcoming Posts" icon={CalendarClock}>
        {upcoming.length === 0 ? <Empty /> : upcoming.map((i) => (
          <Row key={i.id} onClick={() => onOpen(i)}>
            <PlatformIcon platform={i.platform} size={13} />
            <span className="min-w-0 flex-1 truncate text-xs text-white/80">{i.title}</span>
            <span className="text-[10px] text-white/40">{fmt(i.schedule.scheduledAt).split(",")[0]}</span>
          </Row>
        ))}
      </Section>

      <Section title="Publishing Queue" icon={ListChecks}>
        {inQueue.length === 0 ? <Empty /> : inQueue.map((i) => (
          <Row key={i.id} onClick={() => onOpen(i)}>
            <PlatformIcon platform={i.platform} size={13} />
            <span className="min-w-0 flex-1 truncate text-xs text-white/80">{i.title}</span>
            <StatusBadge status={i.status} />
          </Row>
        ))}
      </Section>

      <Section title="Recent Activity" icon={Activity}>
        {activity.slice(0, 5).map((a) => (
          <Row key={a.id}>
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotFor(a.type)}`} />
            <span className="min-w-0 flex-1 truncate text-xs text-white/75">
              <span className="text-white/45">{a.actorName}</span> {verbFor(a.type)} {a.contentTitle ? `“${a.contentTitle}”` : ""}
            </span>
            <span className="text-[10px] text-white/40">{fmt(a.at).split(",")[1]}</span>
          </Row>
        ))}
      </Section>

      <Section title="Content Performance" icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Impressions" value={totalImpr.toLocaleString()} />
          <Metric label="Engagements" value={totalEng.toLocaleString()} />
        </div>
        {performed.map((i) => (
          <div key={i.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={i.platform} size={13} />
              <span className="min-w-0 flex-1 truncate text-xs text-white/80">{i.title}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-white/45">
              <span>{(i.performance!.impressions).toLocaleString()} impr</span>
              <span>{(i.performance!.engagements).toLocaleString()} eng</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-rose-500" style={{ width: `${Math.min(100, (i.performance!.engagements / Math.max(1, i.performance!.impressions)) * 400)}%` }} />
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5 text-sky-400" /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ children, onClick }: { children: any; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-1.5 py-1.5 ${onClick ? "cursor-pointer hover:bg-white/5" : ""}`}
    >
      {children}
    </div>
  );
}
function Empty() {
  return <div className="px-1.5 py-2 text-[11px] text-white/25">Nothing here yet.</div>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
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
  }[t];
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
