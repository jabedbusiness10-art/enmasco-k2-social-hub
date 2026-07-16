"use client";

import { Info, AlertTriangle, AlertCircle } from "lucide-react";

export interface LogRow { id: string; type: string; message: string; severity: string; createdAt: string; backupJobId?: string | null; restoreJobId?: string | null; }

export function RecoveryTimeline({ rows }: { rows: LogRow[] }) {
  if (!rows.length) return null;
  const icon = (s: string) => (s === "CRITICAL" ? <AlertCircle className="h-4 w-4 text-rose-400" /> : s === "WARNING" ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <Info className="h-4 w-4 text-sky-400" />);
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="mt-0.5">{icon(r.severity)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">{r.message}</span>
              <span className="text-[10px] uppercase text-white/30">{r.type}</span>
            </div>
            <div className="text-[11px] text-white/35">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
