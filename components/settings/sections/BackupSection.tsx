"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, SliderField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["backup"]; onChange: (p: Partial<AppSettings["backup"]>) => void };

export default function BackupSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Schedule" description="Automated snapshot of tenant configuration and content.">
        <FieldRow>
          <SelectField label="Frequency" value={data.frequency} onChange={(v) => onChange({ frequency: v })} options={[
            { value: "hourly", label: "Hourly" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" },
          ]} />
          <SelectField label="Storage Target" value={data.storageTarget} onChange={(v) => onChange({ storageTarget: v })} options={[
            { value: "s3", label: "AWS S3" }, { value: "gcs", label: "Google Cloud" }, { value: "azure", label: "Azure Blob" }, { value: "local", label: "Local Volume" },
          ]} />
          <SliderField label="Retention" value={data.retention} onChange={(v) => onChange({ retention: v })} min={1} max={365} suffix="d" />
        </FieldRow>
        <div className="mt-4 space-y-3">
          <ToggleField label="Auto-backup" value={data.autoBackup} onChange={(v) => onChange({ autoBackup: v })} />
          <ToggleField label="Encrypt backups" value={data.encryptBackups} onChange={(v) => onChange({ encryptBackups: v })} />
          <ToggleField label="Notify on failure" value={data.notifyOnFailure} onChange={(v) => onChange({ notifyOnFailure: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Restore">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Last backup</div>
            <div className="text-xs text-white/40">{new Date(data.lastBackupAt).toLocaleString()}</div>
          </div>
          <button className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10">
            Restore latest
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
