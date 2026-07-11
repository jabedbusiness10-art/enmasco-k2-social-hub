"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, TextField, ChipMultiSelect } from "@/components/settings/fields";

type Props = { data: AppSettings["notifications"]; onChange: (p: Partial<AppSettings["notifications"]>) => void };

export default function NotificationsSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Channels">
        <div className="space-y-3">
          <ToggleField label="Email digest" value={data.emailDigest} onChange={(v) => onChange({ emailDigest: v })} />
          <ToggleField label="Push alerts" value={data.pushAlerts} onChange={(v) => onChange({ pushAlerts: v })} />
          <ToggleField label="Slack integration" value={data.slackIntegration} onChange={(v) => onChange({ slackIntegration: v })} />
          <ToggleField label="Mention alerts" value={data.mentions} onChange={(v) => onChange({ mentions: v })} />
          <ToggleField label="Weekly report" value={data.weeklyReport} onChange={(v) => onChange({ weeklyReport: v })} />
          <ToggleField label="Failure alerts" description="Notify on publish/sync failures" value={data.failureAlerts} onChange={(v) => onChange({ failureAlerts: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Routing & Quiet Hours">
        <FieldRow>
          <TextField label="Slack Webhook" value={data.slackWebhook} onChange={(v) => onChange({ slackWebhook: v })} placeholder="https://hooks.slack.com/..." />
          <TextField label="Quiet Hours Start" type="time" value={data.quietHoursStart} onChange={(v) => onChange({ quietHoursStart: v })} />
          <TextField label="Quiet Hours End" type="time" value={data.quietHoursEnd} onChange={(v) => onChange({ quietHoursEnd: v })} />
        </FieldRow>
        <div className="mt-4">
          <ChipMultiSelect label="Enabled Channels" value={data.channels} onChange={(v) => onChange({ channels: v })} options={[
            { value: "email", label: "Email" }, { value: "inapp", label: "In-App" }, { value: "sms", label: "SMS" }, { value: "slack", label: "Slack" },
          ]} />
        </div>
      </SectionCard>
    </div>
  );
}
