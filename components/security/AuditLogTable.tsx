"use client";

import { StatusBadge } from "./primitives";

export interface AuditRow {
  id: string; action: string; actionType?: string | null; module?: string | null;
  resource?: string | null; status?: string | null; severity?: string | null;
  ip?: string | null; browser?: string | null; createdAt: string;
  createdBy?: { name?: string | null; email?: string | null; role?: string | null } | null;
}

const sevTone = (s?: string | null) => (s === "CRITICAL" ? "red" : s === "HIGH" ? "yellow" : s === "MEDIUM" ? "blue" : "gray");

export function AuditLogTable({ rows }: { rows: AuditRow[] }) {
  if (!rows.length) return <div className="px-4 py-8 text-center text-xs text-white/40">No audit events found.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-white/40">
          <tr className="border-b border-white/10">
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Action</th>
            <th className="px-3 py-2 font-medium">Module</th>
            <th className="px-3 py-2 font-medium">User</th>
            <th className="px-3 py-2 font-medium">IP</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Sev</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-3 py-2 text-white/50">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-white/80">{r.action}{r.resource ? <span className="text-white/40"> · {r.resource}</span> : null}</td>
              <td className="px-3 py-2 text-white/60">{r.module ?? "—"}</td>
              <td className="px-3 py-2 text-white/60">{r.createdBy?.name ?? r.createdBy?.email ?? "system"}</td>
              <td className="px-3 py-2 text-white/50">{r.ip ?? "—"}</td>
              <td className="px-3 py-2"><StatusBadge tone={r.status === "SUCCESS" ? "green" : r.status === "FAILURE" ? "red" : "gray"}>{r.status ?? "—"}</StatusBadge></td>
              <td className="px-3 py-2"><StatusBadge tone={sevTone(r.severity)}>{r.severity ?? "INFO"}</StatusBadge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
