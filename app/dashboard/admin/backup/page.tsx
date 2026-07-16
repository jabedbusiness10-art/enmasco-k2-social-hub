"use client";

import PageHeader from "@/components/layout/PageHeader";
import { BackupOverview } from "@/components/backup/BackupOverview";

export default function BackupOverviewPage() {
  return (
    <div>
      <PageHeader title="Backup Center" description="Enterprise backup & disaster recovery — automated, scheduled, verified and ready for restore." />
      <BackupOverview />
    </div>
  );
}
