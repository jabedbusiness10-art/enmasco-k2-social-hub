"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { BackupSkeleton } from "@/components/backup/BackupSkeleton";
import { StorageUsageChart } from "@/components/backup/StorageUsageChart";
import { RetentionPolicyCard } from "@/components/backup/RetentionPolicyCard";
import { EmptyBackupState } from "@/components/backup/EmptyBackupState";
import { formatBytes } from "@/components/backup/primitives";

export default function BackupStoragePage() {
  const [storage, setStorage] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/backup/storage", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([s]) => { setStorage(s.storage); setLoading(false); });
  }, []);

  return (
    <div>
      <PageHeader title="Storage" description="Monitor capacity across configurable providers (Local, S3, R2, Azure, GCS, B2)." />
      {loading ? <BackupSkeleton /> : (
        <div className="space-y-4">
          {storage && storage.totalBytes > 0 ? (
            <BackupCard className="p-4"><StorageUsageChart storage={storage} /></BackupCard>
          ) : (
            <EmptyBackupState title="Storage not provisioned" hint="Configure a provider in .env / storage settings. Sizes shown here reflect real completed backups." />
          )}
          <BackupCard className="p-4">
            <div className="mb-2 text-sm text-white/60">Retention Policy</div>
            <RetentionPolicyCard policy={policy ?? { keepLast: 7, archiveCritical: true, autoCleanup: true, active: true }} onChange={() => {}} />
          </BackupCard>
        </div>
      )}
    </div>
  );
}
