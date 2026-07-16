"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Database, Clock, Disc, ShieldAlert, CheckCircle2, XCircle, ShieldQuestion } from "lucide-react";
import { BackupStat } from "./BackupStats";
import { BackupHealthCard } from "./BackupHealthCard";
import { formatBytes } from "./primitives";

interface OverviewData { overview: any; storage: any; }

export function BackupOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/backup/overview", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />)}</div>;
  if (!data) return null;
  const o = data.overview;
  const s = data.storage;
  const readiness = Math.round(o.recoveryReadiness ?? 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BackupStat label="Total Backups" value={o.totalBackups} icon={Database} tone="blue" />
        <BackupStat label="Last Successful" value={o.lastSuccessful ? new Date(o.lastSuccessful).toLocaleString() : "Never"} icon={Clock} tone="green" />
        <BackupStat label="Next Scheduled" value={o.nextScheduled ? new Date(o.nextScheduled).toLocaleString() : "None"} icon={Clock} tone="yellow" />
        <BackupStat label="Storage Used" value={formatBytes(s.usedBytes)} icon={Disc} tone="blue" />
        <BackupStat label="Storage Remaining" value={formatBytes(s.availableBytes)} icon={Disc} tone="green" />
        <BackupStat label="Recovery Readiness" value={`${readiness}%`} icon={ShieldCheck} tone={readiness > 80 ? "green" : readiness > 50 ? "yellow" : "red"} />
        <BackupStat label="Verification" value={`${o.verifiedBackups}/${o.completedBackups}`} icon={CheckCircle2} tone={o.verifiedBackups > 0 ? "green" : "gray"} />
        <BackupStat label="Failed Backups" value={o.failedBackups} icon={XCircle} tone={o.failedBackups > 0 ? "red" : "green"} />
      </div>
      <BackupHealthCard readiness={readiness} verified={o.verifiedBackups} completed={o.completedBackups} failed={o.failedBackups} />
    </div>
  );
}
