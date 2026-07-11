"use client";

import { Send, CalendarCheck, AlertTriangle, Sparkles, Users } from "lucide-react";
import Panel from "./Panel";
import type { ActivityItem, ActivityKind } from "@/types/analytics";

const KIND_META: Record<ActivityKind, { icon: React.ComponentType<{ className?: string }>; color: string; ring: string }> = {
  publish: { icon: Send, color: "#34D399", ring: "bg-emerald-500/15 text-emerald-300" },
  scheduled: { icon: CalendarCheck, color: "#38BDF8", ring: "bg-sky-500/15 text-sky-300" },
  failed: { icon: AlertTriangle, color: "#FB7185", ring: "bg-rose-500/15 text-rose-300" },
  ai: { icon: Sparkles, color: "#A78BFA", ring: "bg-violet-500/15 text-violet-300" },
  team: { icon: Users, color: "#FBBF24", ring: "bg-amber-500/15 text-amber-300" },
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Panel title="Recent Activity" subtitle="Publishing, scheduled, failed, AI & team events">
      <div className="relative space-y-3 pl-2">
        {items.map((a) => {
          const m = KIND_META[a.kind];
          const Icon = m.icon;
          return (
            <div key={a.id} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.ring}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs leading-snug text-white/80">{a.text}</div>
                <div className="text-[10px] text-white/35">{a.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
