"use client";

import { X, Filter } from "lucide-react";
import type { PlatformKey, ContentStatus, Platform } from "@/types/contentPlanner";
import { campaigns, departments, users } from "@/data/contentPlanner";
import ModalPortal from "@/components/ui/ModalPortal";

export default function FilterPanel({
  platforms,
  open,
  onClose,
  selPlatforms,
  selStatuses,
  departmentId,
  campaignId,
  creatorId,
  dateFrom,
  dateTo,
  onTogglePlatform,
  onToggleStatus,
  setDepartment,
  setCampaign,
  setCreator,
  setDateFrom,
  setDateTo,
  onClear,
}: {
  platforms: Platform[];
  open: boolean;
  onClose: () => void;
  selPlatforms: PlatformKey[];
  selStatuses: ContentStatus[];
  departmentId?: string;
  campaignId?: string;
  creatorId?: string;
  dateFrom?: string;
  dateTo?: string;
  onTogglePlatform: (k: PlatformKey) => void;
  onToggleStatus: (s: ContentStatus) => void;
  setDepartment: (v?: string) => void;
  setCampaign: (v?: string) => void;
  setCreator: (v?: string) => void;
  setDateFrom: (v?: string) => void;
  setDateTo: (v?: string) => void;
  onClear: () => void;
}) {
  if (!open) return null;
  const inputCls =
    "h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40";

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="mt-16 w-full max-w-md rounded-3xl border border-white/10 bg-[#0e0f17] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Filter className="h-4 w-4 text-sky-400" /> Advanced Filters
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
          <Group label="Platform">
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={() => onTogglePlatform(p.key)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    selPlatforms.includes(p.key) ? "border-sky-400/50 bg-sky-400/10 text-white" : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </Group>

          <Group label="Status">
            <div className="flex flex-wrap gap-1.5">
              {(["DRAFT","REVIEW","APPROVED","SCHEDULED","PUBLISHED","FAILED"] as ContentStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onToggleStatus(s)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    selStatuses.includes(s) ? "border-sky-400/50 bg-sky-400/10 text-white" : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Group>

          <div className="grid grid-cols-2 gap-3">
            <Group label="Department">
              <select value={departmentId ?? ""} onChange={(e) => setDepartment(e.target.value || undefined)} className={inputCls}>
                <option value="">All</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Group>
            <Group label="Campaign">
              <select value={campaignId ?? ""} onChange={(e) => setCampaign(e.target.value || undefined)} className={inputCls}>
                <option value="">All</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Group>
          </div>

          <Group label="Creator">
            <select value={creatorId ?? ""} onChange={(e) => setCreator(e.target.value || undefined)} className={inputCls}>
              <option value="">All</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Group>

          <Group label="Date Range">
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || undefined)} className={inputCls} />
              <input type="date" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || undefined)} className={inputCls} />
            </div>
          </Group>
        </div>

        <div className="mt-4 flex justify-between">
          <button onClick={onClear} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white">Clear all</button>
          <button onClick={onClose} className="rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-1.5 text-xs font-semibold text-white">Apply</button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

function Group({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      {children}
    </div>
  );
}
