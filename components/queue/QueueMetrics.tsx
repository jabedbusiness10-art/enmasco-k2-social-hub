"use client";

import { Activity, Clock, CheckCircle2, XCircle, PauseCircle } from "lucide-react";

export default function QueueMetrics({ data }: { data: any }) {
  const totals = data?.totals ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  const queues = data?.queues ?? [];

  const cards = [
    { label: "Waiting", value: totals.waiting, icon: Clock, color: "text-sky-300" },
    { label: "Active", value: totals.active, icon: Activity, color: "text-amber-300" },
    { label: "Completed", value: totals.completed, icon: CheckCircle2, color: "text-emerald-300" },
    { label: "Failed", value: totals.failed, icon: XCircle, color: "text-rose-300" },
    { label: "Delayed", value: totals.delayed, icon: PauseCircle, color: "text-violet-300" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-white/50">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
          Per-Queue
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase text-white/40">
            <tr className="border-b border-white/10">
              <th className="px-4 py-2 font-medium">Queue</th>
              <th className="px-4 py-2 font-medium">Waiting</th>
              <th className="px-4 py-2 font-medium">Active</th>
              <th className="px-4 py-2 font-medium">Completed</th>
              <th className="px-4 py-2 font-medium">Failed</th>
              <th className="px-4 py-2 font-medium">Delayed</th>
              <th className="px-4 py-2 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {queues.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-xs text-white/40">
                  No live queues (Redis not connected).
                </td>
              </tr>
            )}
            {queues.map((q: any) => (
              <tr key={q.name} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-2 font-medium text-white">{q.name}</td>
                <td className="px-4 py-2 text-white/70">{q.waiting}</td>
                <td className="px-4 py-2 text-white/70">{q.active}</td>
                <td className="px-4 py-2 text-emerald-300/80">{q.completed}</td>
                <td className="px-4 py-2 text-rose-300/80">{q.failed}</td>
                <td className="px-4 py-2 text-white/70">{q.delayed}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      q.paused
                        ? "bg-amber-400/15 text-amber-300"
                        : "bg-emerald-400/15 text-emerald-300"
                    }`}
                  >
                    {q.paused ? "PAUSED" : "RUNNING"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
