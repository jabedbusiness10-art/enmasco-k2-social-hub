"use client";

import { StatusBadge } from "./primitives";

export interface ApiRow {
  id: string; endpoint: string; method: string; statusCode: number;
  executionMs?: number | null; userEmail?: string | null; ip?: string | null; createdAt: string;
}

export function ApiAccessTable({ rows }: { rows: ApiRow[] }) {
  if (!rows.length) return <div className="px-4 py-8 text-center text-xs text-white/40">No API access logs.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-white/40">
          <tr className="border-b border-white/10">
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Method</th>
            <th className="px-3 py-2 font-medium">Endpoint</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Ms</th>
            <th className="px-3 py-2 font-medium">User</th>
            <th className="px-3 py-2 font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-3 py-2 text-white/50">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-white/70">{r.method}</td>
              <td className="px-3 py-2 text-white/80">{r.endpoint}</td>
              <td className="px-3 py-2"><StatusBadge tone={r.statusCode >= 500 ? "red" : r.statusCode >= 400 ? "yellow" : "green"}>{r.statusCode}</StatusBadge></td>
              <td className="px-3 py-2 text-white/50">{r.executionMs ?? "—"}</td>
              <td className="px-3 py-2 text-white/60">{r.userEmail ?? "anon"}</td>
              <td className="px-3 py-2 text-white/50">{r.ip ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
