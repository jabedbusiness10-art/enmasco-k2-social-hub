"use client";

import { XCircle, CheckCircle2 } from "lucide-react";

export default function FailedJobs({ jobs }: { jobs: any[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        <XCircle className="h-4 w-4 text-rose-400" /> Failed Jobs
      </div>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {(!jobs || jobs.length === 0) && (
          <div className="flex items-center gap-2 py-6 text-center text-xs text-emerald-300/80">
            <CheckCircle2 className="h-4 w-4" /> No failed jobs. All systems nominal.
          </div>
        )}
        {jobs?.map((j: any) => (
          <div key={j.id} className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{j.name}</span>
              <span className="text-[10px] uppercase text-white/40">{j.queue}</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-rose-300/80">{j.error}</p>
            <div className="mt-1 text-[10px] text-white/35">
              Attempts: {j.attempts} · {new Date(j.failedAt).toLocaleString()}
              {j.recoveredAt && <span className="ml-2 text-emerald-300/70">· Recovered</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
