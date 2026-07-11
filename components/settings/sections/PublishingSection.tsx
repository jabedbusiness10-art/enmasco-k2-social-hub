"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, SelectField, SliderField, ToggleField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["publishing"]; onChange: (p: Partial<AppSettings["publishing"]>) => void };

export default function PublishingSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Schedule & Approval">
        <FieldRow>
          <TextField label="Default Schedule Time" type="time" value={data.defaultSchedule} onChange={(v) => onChange({ defaultSchedule: v })} />
          <SelectField label="Default Visibility" value={data.defaultVisibility} onChange={(v) => onChange({ defaultVisibility: v })} options={[
            { value: "public", label: "Public" }, { value: "private", label: "Private" }, { value: "unlisted", label: "Unlisted" },
          ]} />
          <SelectField label="Link Shortener" value={data.linkShortener} onChange={(v) => onChange({ linkShortener: v })} options={[
            { value: "bit.ly", label: "bit.ly" }, { value: "tinyurl", label: "TinyURL" }, { value: "none", label: "None" },
          ]} />
        </FieldRow>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SliderField label="Auto-retry count" value={data.retryCount} onChange={(v) => onChange({ retryCount: v })} min={0} max={10} />
        </div>
        <div className="mt-4 space-y-3">
          <ToggleField label="Lock to company timezone" value={data.timeZoneLock} onChange={(v) => onChange({ timeZoneLock: v })} />
          <ToggleField label="Approval flow" description="Require sign-off before publishing" value={data.approvalFlow} onChange={(v) => onChange({ approvalFlow: v })} />
          <ToggleField label="Auto-retry failed posts" value={data.autoRetry} onChange={(v) => onChange({ autoRetry: v })} />
          <ToggleField label="Append UTM parameters" value={data.utmEnabled} onChange={(v) => onChange({ utmEnabled: v })} />
          <ToggleField label="Duplicate post guard" description="Prevent identical content back-to-back" value={data.duplicateGuard} onChange={(v) => onChange({ duplicateGuard: v })} />
        </div>
      </SectionCard>
    </div>
  );
}
