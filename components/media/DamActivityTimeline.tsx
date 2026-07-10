"use client";

import { History } from "lucide-react";

const ACTION_COLOR: Record<string, string> = {
  UPLOAD: "bg-emerald-400",
  RENAME: "bg-sky-400",
  DELETE: "bg-rose-400",
  MOVE: "bg-violet-400",
  DOWNLOAD: "bg-amber-400",
  SHARE: "bg-blue-400",
  ARCHIVE: "bg-orange-400",
  RESTORE: "bg-emerald-400",
  FAVORITE: "bg-pink-400",
};

export default function DamActivityTimeline({ activity }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40"><History className="h-3.5 w-3.5" /> Recent Activity</div>
      <div className="space-y-2">
        {activity.length === 0 ? <div className="text-[11px] text-white/30">No activity yet.</div> :
          activity.map((a: any) => (
            <div key={a.id} className="flex gap-2">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${ACTION_COLOR[a.action] || "bg-white/40"}`} />
              <div className="min-w-0">
                <div className="text-[11px] text-white/75"><b className="text-white/90">{a.userName}</b> {a.action.toLowerCase()}{a.meta ? ` · ${a.meta}` : ""}</div>
                <div className="text-[10px] text-white/35">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
