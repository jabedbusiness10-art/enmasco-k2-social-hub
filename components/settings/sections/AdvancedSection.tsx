"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, SliderField, ChipMultiSelect } from "@/components/settings/fields";

type Props = { data: AppSettings["advanced"]; onChange: (p: Partial<AppSettings["advanced"]>) => void };

const flags = [
  { value: "newScheduler", label: "New Scheduler" },
  { value: "aiStudio", label: "AI Studio" },
  { value: "unifiedInbox", label: "Unified Inbox" },
  { value: "mediaLibrary", label: "Media Library" },
  { value: "realtime", label: "Realtime Sync" },
];

export default function AdvancedSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Feature Flags">
        <ChipMultiSelect label="Enabled" value={data.featureFlags} onChange={(v) => onChange({ featureFlags: v })} options={flags} />
      </SectionCard>

      <SectionCard title="Runtime">
        <div className="space-y-3">
          <ToggleField label="Maintenance mode" description="Take the platform offline for admins only" value={data.maintenanceMode} onChange={(v) => onChange({ maintenanceMode: v })} />
          <ToggleField label="Beta channel" value={data.betaChannel} onChange={(v) => onChange({ betaChannel: v })} />
          <ToggleField label="Debug mode" value={data.debugMode} onChange={(v) => onChange({ debugMode: v })} />
          <ToggleField label="Experimental UI" value={data.experimentalUi} onChange={(v) => onChange({ experimentalUi: v })} />
        </div>
        <FieldRow>
          <SelectField label="API Version" value={data.apiVersion} onChange={(v) => onChange({ apiVersion: v })} options={[
            { value: "v1", label: "v1" }, { value: "v2", label: "v2 (beta)" },
          ]} />
          <SliderField label="Cache TTL" value={data.cacheTtl} onChange={(v) => onChange({ cacheTtl: v })} min={0} max={600} suffix="s" />
          <SliderField label="Max Upload (MB)" value={data.maxUploadMb} onChange={(v) => onChange({ maxUploadMb: v })} min={1} max={500} />
        </FieldRow>
      </SectionCard>
    </div>
  );
}
