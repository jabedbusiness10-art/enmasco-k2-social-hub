"use client";

import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { BackupScheduler } from "@/components/backup/BackupScheduler";

export default function BackupSchedulePage() {
  return (
    <div>
      <PageHeader title="Schedules" description="Automate backups hourly, daily, weekly or monthly. Supports custom cron expressions, pause/resume." />
      <BackupCard className="p-4">
        <BackupScheduler />
      </BackupCard>
    </div>
  );
}
