"use client";

import { X, Filter } from "lucide-react";
import type { PlatformKey, ContentStatus } from "@/types/contentPlanner";
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
  platforms: any[];
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

  const activeCount =
    selPlatforms.length +
    selStatuses.length +
    (departmentId ? 1 : 0) +
    (campaignId ? 1 : 0) +
    (creatorId ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="mt-16 w-full max-w-xl rounded-3xl border border-white/10 bg-[#0e0f17] shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Filter className="h-4 w-4 text-sky-400" />
              <span>Advanced Filters</span>
              {activeCount > 0 && (
                <span className="rounded-full border border-sky-400/40 bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold text-sky-200">
                  {activeCount} active
                </span>
              )}
            </div>
            <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
            <Group label="Platform">
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <FilterChip key={p.key} active={selPlatforms.includes(p.key)} label={p.name} onClick={() => onTogglePlatform(p.key)} />
                ))}
              </div>
            </Group>

            <Group label="Status">
              <div className="flex flex-wrap gap-2">
                {["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"].map((s) => (
                  <FilterChip key={s} active={selStatuses.includes(s as ContentStatus)} label={s} onClick={() => onToggleStatus(s as ContentStatus)} />
                ))}
              </div>
            </Group>

            <div className="grid grid-cols-2 gap-3">
              <Group label="Department">
                <select value={departmentId ?? ""} onChange={(e) => setDepartment(e.target.value || undefined)} className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40">
                  <option value="" className="bg-[#0e0f17] text-white/55">All</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id} className="bg-[#0e0f17] text-white">{d.name}</option>)}
                </select>
              </Group>
              <Group label="Campaign">
                <select value={campaignId ?? ""} onChange={(e) => setCampaign(e.target.value || undefined)} className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40">
                  <option value="" className="bg-[#0e0f17] text-white/55">All</option>
                  {campaigns.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0e0f17] text-white">{c.title ?? c.name}</option>)}
                </select>
              </Group>
            </div>

            <Group label="Creator">
              <select value={creatorId ?? ""} onChange={(e) => setCreator(e.target.value || undefined)} className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40">
                <option value="" className="bg-[#0e0f17] text-white/55">All</option>
                {users.map((u: any) => <option key={u.id} value={u.id} className="bg-[#0e0f17] text-white">{u.name}</option>)}
              </select>
            </Group>

            <Group label="Date Range">
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || undefined)} className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40" />
                <input type="date" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || undefined)} className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-sky-400/40" />
              </div>
            </Group>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <button onClick={onClear} disabled={activeCount === 0} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white disabled:opacity-30">
              Clear all
            </button>
            <button onClick={onClose} className="rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-5 py-1.5 text-xs font-bold text-white">
              Apply
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function Group({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
      {children}
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
        active ? "border-sky-400/50 bg-sky-400/10 text-white" : "border-white/10 text-white/55 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
