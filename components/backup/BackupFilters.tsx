"use client";

import { Search } from "lucide-react";

export function BackupFilters({ search, onSearch, type, onType, types = ["ALL", "DATABASE", "MEDIA", "USER", "ANALYTICS", "QUEUE", "NOTIFICATION", "CONFIG", "SETTINGS"], status, onStatus, statuses = ["ALL", "QUEUED", "RUNNING", "COMPLETED", "FAILED", "VERIFYING"] }: {
  search: string; onSearch: (v: string) => void; type: string; onType: (v: string) => void; types?: string[];
  status: string; onStatus: (v: string) => void; statuses?: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5">
        <Search className="h-3.5 w-3.5 text-white/30" />
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search backups…" className="bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
      </div>
      <select value={type} onChange={(e) => onType(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white">
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={status} onChange={(e) => onStatus(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white">
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
