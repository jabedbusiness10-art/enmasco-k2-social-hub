"use client";

import { Monitor, Smartphone, LogOut, LogOutIcon } from "lucide-react";
import { StatusBadge } from "./primitives";

export interface SessionRow {
  id: string; isCurrent: boolean; browser?: string | null; os?: string | null;
  device?: string | null; ip?: string | null; lastActivityAt?: string | Date | null;
  createdAt?: string | Date | null;
}

export function ActiveSessionsTable({ rows, onTerminate, onTerminateOthers, loading }: {
  rows: SessionRow[]; onTerminate: (id: string) => void; onTerminateOthers: () => void; loading?: boolean;
}) {
  if (!rows.length) return <div className="px-4 py-8 text-center text-xs text-white/40">No active sessions.</div>;
  return (
    <div className="space-y-2 p-3">
      {rows.map((s) => {
        const Icon = s.device === "Mobile" ? Smartphone : Monitor;
        return (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <Icon className="h-5 w-5 text-sky-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-white/85">
                {s.browser ?? "Unknown"} <span className="text-white/40">·</span> {s.os ?? "—"}
                {s.isCurrent && <StatusBadge tone="green">current</StatusBadge>}
              </div>
              <div className="text-[11px] text-white/40">{s.ip ?? "—"} · last active {s.lastActivityAt ? new Date(s.lastActivityAt).toLocaleString() : "—"}</div>
            </div>
            {!s.isCurrent && (
              <button onClick={() => onTerminate(s.id)} disabled={loading}
                className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-400/10 disabled:opacity-40">
                Terminate
              </button>
            )}
          </div>
        );
      })}
      <button onClick={onTerminateOthers} disabled={loading}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40">
        <LogOutIcon className="h-3.5 w-3.5" /> Terminate All Others
      </button>
    </div>
  );
}
