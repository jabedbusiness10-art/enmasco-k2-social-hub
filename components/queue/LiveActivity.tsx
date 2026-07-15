"use client";

import { useEffect, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";

interface Ev {
  kind: string;
  queue?: string;
  message: string;
  at: number;
}

const KIND_COLOR: Record<string, string> = {
  "job-completed": "text-emerald-300",
  "job-failed": "text-rose-300",
  "job-active": "text-sky-300",
  "job-stalled": "text-amber-300",
  "worker-online": "text-violet-300",
  "worker-idle": "text-white/50",
  "redis-connected": "text-emerald-300",
  "redis-down": "text-rose-300",
};

export default function LiveActivity({ events }: { events: Ev[] }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Radio className="h-4 w-4 animate-pulse text-sky-400" /> Live Activity
      </div>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
        {(!events || events.length === 0) && (
          <div className="py-6 text-center text-xs text-white/40">No live events yet.</div>
        )}
        {[...(events ?? [])].reverse().map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
            <p className={KIND_COLOR[e.kind] ?? "text-white/70"}>
              <span className="text-white/40">
                {new Date(e.at).toLocaleTimeString()} ·{" "}
              </span>
              {e.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
