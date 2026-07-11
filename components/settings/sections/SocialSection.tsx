"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, ToggleField, SelectField, ChipMultiSelect, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["social"]; onChange: (p: Partial<AppSettings["social"]>) => void };

const platforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

export default function SocialSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Connection" description="Behavior of connected social platform accounts.">
        <div className="space-y-3">
          <ToggleField label="Auto-connect new channels" description="Automatically register platforms on first OAuth" value={data.autoConnect} onChange={(v) => onChange({ autoConnect: v })} />
          <ToggleField label="Rate-limit guard" description="Throttle posts to stay under platform quotas" value={data.rateLimitGuard} onChange={(v) => onChange({ rateLimitGuard: v })} />
          <ToggleField label="Require post approval" description="Drafts must be approved before publishing" value={data.postApproval} onChange={(v) => onChange({ postApproval: v })} />
          <ToggleField label="Cross-post" description="Publish the same content to all selected platforms" value={data.crossPost} onChange={(v) => onChange({ crossPost: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Platforms & Tokens">
        <ChipMultiSelect label="Default Platforms" value={data.defaultPlatforms} onChange={(v) => onChange({ defaultPlatforms: v })} options={platforms} />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField label="Token Refresh" value={data.tokenRefresh} onChange={(v) => onChange({ tokenRefresh: v })} options={[
            { value: "auto", label: "Automatic" }, { value: "manual", label: "Manual" },
          ]} />
          <TextField label="Watermark Text" value={data.watermark} onChange={(v) => onChange({ watermark: v })} placeholder="e.g. © EnmaSco" />
        </div>
      </SectionCard>
    </div>
  );
}
