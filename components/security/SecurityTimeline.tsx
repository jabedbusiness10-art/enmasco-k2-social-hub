"use client";

import { ShieldAlert, AlertTriangle, Info, AlertCircle } from "lucide-react";

export interface EventRow {
  id: string; severity: string; type: string; title: string; message?: string | null;
  createdAt: string; resolved: boolean; userEmail?: string | null;
}

const icon = (s: string) => (s === "CRITICAL" ? ShieldAlert : s === "HIGH" ? AlertTriangle : s === "MEDIUM" ? AlertCircle : Info);
const tone = (s: string) => (s === "CRITICAL" ? "red" : s === "HIGH" ? "yellow" : s === "MEDIUM" ? "blue" : "gray");

export function SecurityTimeline({ rows, onResolve }: { rows: EventRow[]; onResolve?: (id: string) => void }) {
  if (!rows.length) return <div className="px-4 py-8 text-center text-xs text-white/40">No security events.</div>;
  return (
    <div className="space-y-3 p-4">
      {rows.map((e) => {
        const Icon = icon(e.severity);
        return (
          <div key={e.id} className="flex gap-3">
            <div className="mt-0.5"><Icon className={`h-5 w-5 ${e.severity === "CRITICAL" ? "text-rose-400" : e.severity === "HIGH" ? "text-amber-400" : "text-sky-400"}`} /></div>
            <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/85">{e.title}</span>
                <span className="text-[10px] text-white/40">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
              {e.message && <p className="mt-1 text-xs text-white/50">{e.message}</p>}
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] uppercase ${e.severity === "CRITICAL" ? "text-rose-300" : e.severity === "HIGH" ? "text-amber-300" : "text-sky-300"}`}>{e.severity}</span>
                {e.resolved ? <span className="text-[10px] text-emerald-300">resolved</span> : onResolve && (
                  <button onClick={() => onResolve(e.id)} className="text-[10px] text-white/50 hover:text-white">mark resolved</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
