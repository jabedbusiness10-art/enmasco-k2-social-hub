"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, XCircle, Clock } from "lucide-react";
import { WidgetShell, SkeletonRows, EmptyState } from "./command/primitives";

type AiStatus = {
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
  lastActivity: string | null;
  queueStatus: "active" | "idle" | "disabled" | "error";
};

export default function AiStatusCard() {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; data?: AiStatus }>({
    status: "loading",
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/dashboard/ai", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        if (!alive) return;
        setState({ status: "ready", data: j });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <WidgetShell title="AI Status" icon={BrainCircuit}>
      {state.status === "loading" && <SkeletonRows rows={4} />}
      {state.status === "error" && <EmptyState>AI status unavailable.</EmptyState>}
      {state.status === "ready" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Metric icon={<Clock className="h-3.5 w-3.5" />} label="Pending" value={state.data!.pendingJobs} tone="amber" />
            <Metric icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Done" value={state.data!.completedJobs} tone="emerald" />
            <Metric icon={<XCircle className="h-3.5 w-3.5" />} label="Failed" value={state.data!.failedJobs} tone="rose" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span className="text-white/45">Queue</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                state.data!.queueStatus === "active"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  : "border-white/15 bg-white/5 text-white/45"
              }`}
            >
              {state.data!.queueStatus.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/45">
            <span>Last AI activity</span>
            <span>{fmt(state.data!.lastActivity)}</span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "amber" | "emerald" | "rose" }) {
  const color = tone === "emerald" ? "text-emerald-300" : tone === "rose" ? "text-rose-300" : "text-amber-300";
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.03] py-2.5">
      <span className={color}>{icon}</span>
      <span className={`mt-1 text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
    </div>
  );
}
