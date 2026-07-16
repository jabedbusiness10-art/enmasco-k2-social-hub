"use client";

import { StatusBadge } from "./primitives";

export interface LoginRow {
  id: string; email: string; result: string; ip?: string | null;
  browser?: string | null; os?: string | null; createdAt: string;
}

const tone = (r: string) => (r === "SUCCESS" ? "green" : r === "FAILURE" || r === "BLOCKED" ? "red" : r === "EXPIRED" ? "yellow" : "gray");

export function LoginHistoryTable({ rows }: { rows: LoginRow[] }) {
  if (!rows.length) return <div className="px-4 py-8 text-center text-xs text-white/40">No login history yet.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-white/40">
          <tr className="border-b border-white/10">
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Result</th>
            <th className="px-3 py-2 font-medium">IP</th>
            <th className="px-3 py-2 font-medium">Browser / OS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-3 py-2 text-white/50">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-white/80">{r.email}</td>
              <td className="px-3 py-2"><StatusBadge tone={tone(r.result)}>{r.result}</StatusBadge></td>
              <td className="px-3 py-2 text-white/50">{r.ip ?? "—"}</td>
              <td className="px-3 py-2 text-white/60">{r.browser ?? "—"}{r.os ? ` / ${r.os}` : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
