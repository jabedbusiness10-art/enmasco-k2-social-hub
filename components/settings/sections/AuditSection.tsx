"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, SliderField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["audit"]; onChange: (p: Partial<AppSettings["audit"]>) => void };

export default function AuditSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Retention & Detail">
        <FieldRow>
          <SliderField label="Retention" value={data.retentionDays} onChange={(v) => onChange({ retentionDays: v })} min={30} max={2555} suffix="d" />
          <SelectField label="Log Level" value={data.logLevel} onChange={(v) => onChange({ logLevel: v })} options={[
            { value: "basic", label: "Basic" }, { value: "detailed", label: "Detailed" }, { value: "verbose", label: "Verbose" },
          ]} />
        </FieldRow>
        <div className="mt-4 space-y-3">
          <ToggleField label="Export enabled" value={data.exportEnabled} onChange={(v) => onChange({ exportEnabled: v })} />
          <ToggleField label="PII redaction" description="Scrub personal data before storage" value={data.piiRedaction} onChange={(v) => onChange({ piiRedaction: v })} />
          <ToggleField label="Stream to SIEM" value={data.streamToSiem} onChange={(v) => onChange({ streamToSiem: v })} />
        </div>
        <div className="mt-4">
          <TextField label="SIEM Endpoint" value={data.siemEndpoint} onChange={(v) => onChange({ siemEndpoint: v })} placeholder="https://siem.example.com/ingest" />
        </div>
      </SectionCard>
    </div>
  );
}
