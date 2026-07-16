"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";

export function BackupHealthCard({ readiness, verified, completed, failed }: { readiness: number; verified: number; completed: number; failed: number }) {
  const tone = readiness > 80 ? "emerald" : readiness > 50 ? "amber" : "rose";
  const color = tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-300" : "text-rose-300";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        {readiness > 80 ? <ShieldCheck className="h-6 w-6 text-emerald-300" /> : <ShieldAlert className="h-6 w-6 text-amber-300" />}
        <div>
          <div className="text-sm text-white/60">Recovery Readiness</div>
          <div className={`text-2xl font-semibold ${color}`}>{readiness}%{failed > 0 && <span className="ml-2 text-xs text-rose-300">{failed} failed</span>}</div>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone === "emerald" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${readiness}%` }} />
      </div>
      <div className="mt-2 text-xs text-white/40">{verified} of {completed} backups verified</div>
    </div>
  );
}
