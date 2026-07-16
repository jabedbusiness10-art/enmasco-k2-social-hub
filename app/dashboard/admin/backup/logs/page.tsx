"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { BackupSkeleton } from "@/components/backup/BackupSkeleton";
import { RecoveryTimeline, type LogRow } from "@/components/backup/RecoveryTimeline";
import { BackupFilters } from "@/components/backup/BackupFilters";
import { EmptyBackupState } from "@/components/backup/EmptyBackupState";

export default function RecoveryLogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (type !== "ALL") qs.set("type", type);
    fetch(`/api/backup/logs?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = rows.filter((r) => `${r.message} ${r.type}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Recovery Logs" description="Immutable audit trail of every backup, verification and restore event." />
      <BackupCard className="p-4">
        <BackupFilters search={search} onSearch={setSearch} type={type} onType={setType} types={["ALL", "BACKUP_CREATED", "BACKUP_FAILED", "BACKUP_VERIFIED", "RESTORE_STARTED", "RESTORE_COMPLETED", "RESTORE_FAILED", "VERIFICATION_FAILED", "STORAGE_WARNING"]} status="ALL" onStatus={() => {}} statuses={["ALL"]} />
        <div className="mt-3">{loading ? <BackupSkeleton /> : rows.length === 0 ? <EmptyBackupState title="No recovery events" hint="Events appear here as backups and restores run." /> : <RecoveryTimeline rows={filtered} />}</div>
      </BackupCard>
    </div>
  );
}
