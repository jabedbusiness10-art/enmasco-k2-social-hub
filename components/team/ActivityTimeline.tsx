"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, MessageSquare, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string;
  actor: { id: string; name: string };
  assignment: { id: string; title: string };
}

export default function ActivityTimeline() {
  const [list, setList] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team/activity")
      .then((r) => r.json())
      .then((j) => setList(j.activity ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const icon = (a: string) => {
    if (a === "COMPLETED") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />;
    if (a === "COMMENT" || a === "MENTION") return <MessageSquare className="h-3.5 w-3.5 text-sky-300" />;
    return <Clock className="h-3.5 w-3.5 text-white/40" />;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Activity className="h-4 w-4 text-sky-400" /> Activity Timeline
      </div>
      {loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
      ) : list.length === 0 ? (
        <div className="text-[11px] text-white/35">No activity yet.</div>
      ) : (
        <div className="space-y-2.5">
          {list.map((it) => (
            <div key={it.id} className="flex items-start gap-2.5">
              <div className="mt-0.5">{icon(it.action)}</div>
              <div className="text-[11px] text-white/70">
                <span className="font-medium text-white/90">{it.actor.name}</span> {it.action.toLowerCase()} ·{" "}
                <span className="text-white/55">{it.assignment.title}</span>
                <div className="text-white/35">{new Date(it.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
