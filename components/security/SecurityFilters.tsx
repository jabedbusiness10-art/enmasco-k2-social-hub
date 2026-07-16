"use client";

import { Search } from "lucide-react";

export function SecurityFilters({ search, onSearch, severity, onSeverity, severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] }: {
  search: string; onSearch: (v: string) => void; severity: string; onSeverity: (v: string) => void; severities?: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-white/40" />
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search…" className="w-40 bg-transparent text-xs text-white outline-none placeholder:text-white/30" />
      </div>
      <select value={severity} onChange={(e) => onSeverity(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 outline-none">
        {severities.map((s) => <option key={s} value={s} className="bg-[#0b0b0f]">{s}</option>)}
      </select>
    </div>
  );
}
