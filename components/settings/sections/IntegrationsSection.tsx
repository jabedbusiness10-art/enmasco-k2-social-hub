"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, SliderField, TextField, ChipMultiSelect } from "@/components/settings/fields";

type Props = { data: AppSettings["integrations"]; onChange: (p: Partial<AppSettings["integrations"]>) => void };

const integrations = [
  { value: "webhook", label: "Webhooks" },
  { value: "zapier", label: "Zapier" },
  { value: "slack", label: "Slack" },
  { value: "sheets", label: "Google Sheets" },
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
];

export default function IntegrationsSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Connected Integrations">
        <ChipMultiSelect label="Enabled" value={data.enabled} onChange={(v) => onChange({ enabled: v })} options={integrations} />
        <div className="mt-4 space-y-3">
          <ToggleField label="Zapier enabled" value={data.zapierEnabled} onChange={(v) => onChange({ zapierEnabled: v })} />
          <ToggleField label="Public API access" value={data.apiAccess} onChange={(v) => onChange({ apiAccess: v })} />
          <ToggleField label="Event log" value={data.eventLog} onChange={(v) => onChange({ eventLog: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Webhooks & CORS">
        <FieldRow>
          <TextField label="Webhook URL" value={data.webhookUrl} onChange={(v) => onChange({ webhookUrl: v })} placeholder="https://" />
          <TextField label="Webhook Secret" type="password" value={data.webhookSecret} onChange={(v) => onChange({ webhookSecret: v })} />
          <TextField label="Allowed Origins (CORS)" value={data.allowedOrigins} onChange={(v) => onChange({ allowedOrigins: v })} placeholder="https://app.example.com" />
          <SliderField label="Rate Limit / min" value={data.rateLimitPerMin} onChange={(v) => onChange({ rateLimitPerMin: v })} min={10} max={1000} step={10} />
        </FieldRow>
      </SectionCard>
    </div>
  );
}
