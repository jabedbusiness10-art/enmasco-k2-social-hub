"use client";

import { FileDown, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * TASK-58 — Executive Reports / Export Center.
 * CSV export is REAL (client-side serialization of the snapshot).
 * PDF / Excel are shown but disabled until a server renderer is wired —
 * we do NOT fake a download (TASK-51 rule).
 */
export default function ExportCenter({ snapshot }: { snapshot: any }) {
  const [busy, setBusy] = useState(false);

  function exportCsv() {
    setBusy(true);
    try {
      const flat: Record<string, any> = {
        generatedAt: snapshot?.generatedAt,
        range: snapshot?.range,
        followers: snapshot?.overview?.followers ?? "",
        reach: snapshot?.overview?.reach ?? "",
        engagement: snapshot?.overview?.engagement ?? "",
        aiRequests: snapshot?.aiIntel?.totalRequests ?? "",
        mediaAssets: snapshot?.mediaIntel?.totalAssets ?? "",
        employees: snapshot?.teamIntel?.employees ?? "",
        queueJobs: snapshot?.queueIntel?.jobsProcessed ?? "",
        failedJobs: snapshot?.queueIntel?.failedJobs ?? "",
      };
      const csv = Object.entries(flat)
        .map(([k, v]) => `${k},${typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v}`)
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `executive-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  const Btn = ({
    icon,
    label,
    disabled,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      title={disabled ? "Coming soon" : undefined}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Btn icon={<FileDown className="h-4 w-4" />} label="CSV" onClick={exportCsv} />
      <Btn icon={<FileText className="h-4 w-4" />} label="PDF" disabled />
      <Btn icon={<FileSpreadsheet className="h-4 w-4" />} label="Excel" disabled />
      <span className="text-[10px] text-white/40">PDF/Excel export arriving in a follow-up (CSV is live).</span>
    </div>
  );
}
