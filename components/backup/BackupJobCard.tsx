"use client";

import { StatusBadge, statusTone } from "./primitives";
import { BackupRow } from "./BackupHistoryTable";

export function BackupJobCard({ job, onVerify, onRestore, onDelete }: { job: BackupRow; onVerify: (id: string) => void; onRestore: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-white/85">{job.name}</div>
        <StatusBadge tone={statusTone(job.status)}>{job.status}</StatusBadge>
      </div>
      <div className="mt-1 text-xs text-white/40">{job.type} · {job.mode} · {job.storageProvider}</div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onVerify(job.id)} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-sky-300 hover:bg-white/5">Verify</button>
        <button onClick={() => onRestore(job.id)} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-emerald-300 hover:bg-white/5">Restore</button>
        <button onClick={() => onDelete(job.id)} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-rose-300 hover:bg-white/5">Delete</button>
      </div>
    </div>
  );
}
