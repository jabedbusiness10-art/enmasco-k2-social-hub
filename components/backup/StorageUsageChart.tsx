"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { formatBytes } from "./primitives";

export function StorageUsageChart({ storage }: { storage: { usedBytes: number; totalBytes: number; availableBytes: number; providers: any[] } }) {
  const pie = [
    { name: "Used", value: storage.usedBytes },
    { name: "Available", value: Math.max(0, storage.availableBytes) },
  ];
  const prov = storage.providers.map((p) => ({ name: p.provider, value: p.usedBytes }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 text-sm text-white/60">Capacity Split</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
              <Cell fill="#38bdf8" /><Cell fill="#334155" />
            </Pie>
            <Tooltip formatter={(v: number) => formatBytes(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 text-center text-xs text-white/40">Used {formatBytes(storage.usedBytes)} / Total {formatBytes(storage.totalBytes)}</div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 text-sm text-white/60">Usage by Provider</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={prov}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => formatBytes(v)} />
            <Tooltip formatter={(v: number) => formatBytes(v)} />
            <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
