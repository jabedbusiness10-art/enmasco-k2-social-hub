"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, SelectField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["regional"]; onChange: (p: Partial<AppSettings["regional"]>) => void };

const langs = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية (Arabic)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];
const tz = ["Asia/Riyadh", "Asia/Dhaka", "UTC", "Europe/London", "America/New_York", "Asia/Tokyo"];

export default function RegionalSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Locale" description="Controls how dates, times, numbers and currency render platform-wide.">
        <FieldRow>
          <SelectField label="Language" value={data.language} onChange={(v) => onChange({ language: v })} options={langs} />
          <SelectField
            label="Timezone"
            value={data.timezone}
            onChange={(v) => onChange({ timezone: v })}
            options={tz.map((t) => ({ value: t, label: t }))}
          />
          <SelectField
            label="Date Format"
            value={data.dateFormat}
            onChange={(v) => onChange({ dateFormat: v })}
            options={[
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
              { value: "D MMM YYYY", label: "D MMM YYYY" },
            ]}
          />
          <SelectField
            label="Time Format"
            value={data.timeFormat}
            onChange={(v) => onChange({ timeFormat: v })}
            options={[
              { value: "12H", label: "12-hour (AM/PM)" },
              { value: "24H", label: "24-hour" },
            ]}
          />
          <SelectField
            label="First Day of Week"
            value={data.firstDayOfWeek}
            onChange={(v) => onChange({ firstDayOfWeek: v })}
            options={[
              { value: "sunday", label: "Sunday" },
              { value: "monday", label: "Monday" },
              { value: "saturday", label: "Saturday" },
            ]}
          />
          <SelectField
            label="Number Format"
            value={data.numberFormat}
            onChange={(v) => onChange({ numberFormat: v })}
            options={[
              { value: "western", label: "1,000.00" },
              { value: "european", label: "1.000,00" },
              { value: "indian", label: "1,00,000.00" },
            ]}
          />
          <TextField label="Currency (ISO)" value={data.currency} onChange={(v) => onChange({ currency: v.toUpperCase() })} hint="e.g. SAR, USD" />
        </FieldRow>
      </SectionCard>
    </div>
  );
}
