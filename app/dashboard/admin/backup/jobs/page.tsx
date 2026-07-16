"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { BackupSkeleton } from "@/components/backup/BackupSkeleton";
import { BackupHistoryTable, type BackupRow } from "@/components/backup/BackupHistoryTable";
import { BackupFilters } from "@/components/backup/BackupFilters";
import { EmptyBackupState } from "@/components/backup/EmptyBackupState";
import { Plus } from "lucide-react";

export default function BackupJobsPage() {
  const [rows, setRows] = useState<BackupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status !== "ALL") qs.set("status", status);
    fetch(`/api/backup/jobs?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.rows ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [status]);

  const createBackup = async (t: string) => {
    setBusy(true);
    await fetch("/api/backup/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `${t} manual backup`, type: t, mode: "MANUAL" }) });
    await load();
    setBusy(false);
  };
  const verify = async (id: string) => { await fetch(`/api/backup/verify?backupJobId=${id}`, { method: "POST" }); await load(); };
  const restore = async (id: string) => { await fetch("/api/backup/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ backupJobId: id, scope: "EVERYTHING" }) }); await load(); };
  const del = async (id: string) => { if (!confirm("Delete this backup?")) return; await fetch(`/api/backup/jobs?skip=0`).catch(() => {}); await fetch(`/api/backup/storage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }); setRows((r) => r.filter((x) => x.id !== id)); };

  const filtered = rows.filter((r) => (type === "ALL" || r.type === type) && `${r.name} ${r.type}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Backup Jobs" description="Create, monitor, verify and restore backups. All jobs run through the BullMQ queue." />
      <div className="mb-4 flex flex-wrap gap-2">
        {["DATABASE", "MEDIA", "USER", "ANALYTICS", "QUEUE", "NOTIFICATION", "CONFIG", "SETTINGS"].map((t) => (
          <button key={t} disabled={busy} onClick={() => createBackup(t)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> {t}</button>
        ))}
      </div>
      <BackupCard className="p-4">
        <BackupFilters search={search} onSearch={setSearch} type={type} onType={setType} status={status} onStatus={setStatus} />
        <div className="mt-3">
          {loading ? <BackupSkeleton /> : rows.length === 0 ? <EmptyBackupState title="No backups yet" hint="Create a backup using one of the buttons above. Jobs are processed asynchronously via the queue." /> : <BackupHistoryTable rows={filtered} onVerify={verify} onRestore={restore} onDelete={del} />}
        </div>
      </BackupCard>
    </div>
  );
}
