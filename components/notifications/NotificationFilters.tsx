"use client";

import { Search } from "lucide-react";

const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const MODULES = ["social", "publishing", "ai", "media", "team", "analytics", "auth", "system"];
const PLATFORMS = ["facebook", "instagram", "linkedin", "website", "x", "youtube"];

export default function NotificationFilters({ filters, setFilters }: any) {
  const set = (k: string, v: string) => setFilters((p: any) => ({ ...p, [k]: v === "ALL" ? undefined : v }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
        <input
          value={filters.search || ""}
          onChange={(e) => setFilters((p: any) => ({ ...p, search: e.target.value }))}
          placeholder="Search notifications…"
          className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
        />
      </div>
      <Select label="Priority" value={filters.priority} onChange={(v: string) => set("priority", v)} options={PRIORITIES} />
      <Select label="Module" value={filters.module} onChange={(v: string) => set("module", v)} options={MODULES} />
      <Select label="Platform" value={filters.platform} onChange={(v: string) => set("platform", v)} options={PLATFORMS} />
      <Select label="Status" value={filters.unread ? "unread" : "all"} onChange={(v: string) => setFilters((p: any) => ({ ...p, unread: v === "unread" ? "1" : undefined }))} options={["all", "unread", "read"]} />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <select
      value={value || "ALL"}
      onChange={(e: any) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs text-white focus:outline-none"
    >
      <option value="ALL">{label}: All</option>
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
