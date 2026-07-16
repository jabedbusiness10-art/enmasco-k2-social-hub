"use client";

import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { RestoreWizard } from "@/components/backup/RestoreWizard";
import { RotateCcw } from "lucide-react";

export default function RestoreManagerPage() {
  return (
    <div>
      <PageHeader title="Restore Manager" description="Guided restore wizard — select a backup, validate, choose scope and recover safely." />
      <BackupCard className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm text-white/60"><RotateCcw className="h-4 w-4 text-emerald-300" /> Six-step recovery workflow</div>
        <RestoreWizard />
      </BackupCard>
    </div>
  );
}
