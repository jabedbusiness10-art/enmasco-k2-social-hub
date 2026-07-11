"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SliderField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["system"]; onChange: (p: Partial<AppSettings["system"]>) => void };

export default function SystemSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Monitoring">
        <div className="space-y-3">
          <ToggleField label="Enable monitoring" value={data.enableMonitoring} onChange={(v) => onChange({ enableMonitoring: v })} />
          <ToggleField label="Error tracking" value={data.errorTracking} onChange={(v) => onChange({ errorTracking: v })} />
        </div>
        <FieldRow>
          <TextField label="Metrics Endpoint" value={data.metricsEndpoint} onChange={(v) => onChange({ metricsEndpoint: v })} placeholder="https://" />
          <TextField label="Error Tracking DSN" value={data.errorTrackingDsn} onChange={(v) => onChange({ errorTrackingDsn: v })} placeholder="https://..." />
        </FieldRow>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SliderField label="Alert Threshold" value={data.alertThreshold} onChange={(v) => onChange({ alertThreshold: v })} min={50} max={100} suffix="%" />
          <SliderField label="Healthcheck Interval" value={data.healthcheckInterval} onChange={(v) => onChange({ healthcheckInterval: v })} min={5} max={300} suffix="s" />
          <SliderField label="Uptime Target" value={data.uptimeTarget} onChange={(v) => onChange({ uptimeTarget: v })} min={95} max={100} step={0.1} suffix="%" />
        </div>
      </SectionCard>
    </div>
  );
}
