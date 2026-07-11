"use client";

import { Plus, CalendarPlus, Download } from "lucide-react";

export default function PlannerHeader({
  onCreate,
  onImport,
  onExport,
}: {
  onCreate: () => void;
  onImport: () => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-white">Company Content Planner</h1>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/45">
            Enterprise
          </span>
        </div>
        <p className="mt-1 text-xs text-white/55">
          Plan, schedule and approve all official company content across every channel from one secure workspace.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
        >
          <CalendarPlus className="h-4 w-4" /> Import Calendar
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
        >
          <Download className="h-4 w-4" /> Export Schedule
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(56,189,248,0.25)] transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Create Content
        </button>
      </div>
    </div>
  );
}
