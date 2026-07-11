"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, SliderField } from "@/components/settings/fields";

type Props = { data: AppSettings["team"]; onChange: (p: Partial<AppSettings["team"]>) => void };

export default function TeamSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Membership" description="How users join and what role they receive.">
        <FieldRow>
          <SelectField label="Default Role" value={data.defaultRole} onChange={(v) => onChange({ defaultRole: v })} options={[
            { value: "member", label: "Member" }, { value: "editor", label: "Editor" }, { value: "admin", label: "Admin" },
          ]} />
          <SliderField label="Seat Limit" value={data.seatLimit} onChange={(v) => onChange({ seatLimit: v })} min={1} max={500} />
        </FieldRow>
        <div className="mt-4 space-y-3">
          <ToggleField label="Self sign-up" value={data.selfSignup} onChange={(v) => onChange({ selfSignup: v })} />
          <ToggleField label="Invite only" value={data.inviteOnly} onChange={(v) => onChange({ inviteOnly: v })} />
          <ToggleField label="Guest access" value={data.guestAccess} onChange={(v) => onChange({ guestAccess: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Access Control">
        <div className="space-y-3">
          <ToggleField label="Enforce two-factor" value={data.twoFactorEnforced} onChange={(v) => onChange({ twoFactorEnforced: v })} />
          <ToggleField label="SSO enabled" value={data.ssoEnabled} onChange={(v) => onChange({ ssoEnabled: v })} />
        </div>
        <div className="mt-4">
          <SelectField label="SSO Provider" value={data.ssoProvider} onChange={(v) => onChange({ ssoProvider: v })} options={[
            { value: "okta", label: "Okta" }, { value: "azure", label: "Azure AD" }, { value: "google", label: "Google Workspace" }, { value: "saml", label: "Custom SAML" },
          ]} />
        </div>
      </SectionCard>
    </div>
  );
}
