/** TASK-63 — Backup/Restore queue handlers (real work, delegates to engine). */
import { runBackup, verifyBackup } from "@/lib/backup/engine";
import { runRestore } from "@/lib/backup/recovery";

export async function handleBackup(job: { name: string; data: any }) {
  if (job.name === "backup:verify" && job.data?.backupJobId) {
    return { status: await verifyBackup(job.data.backupJobId) };
  }
  // backup:run
  await runBackup(job.data?.backupJobId);
  return { ok: true };
}

export async function handleRestore(job: { name: string; data: any }) {
  await runRestore(job.data?.restoreJobId);
  return { ok: true };
}
