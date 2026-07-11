"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, SliderField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["security"]; onChange: (p: Partial<AppSettings["security"]>) => void };

export default function SecuritySection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Session & Password">
        <FieldRow>
          <SliderField label="Session Timeout" value={data.sessionTimeout} onChange={(v) => onChange({ sessionTimeout: v })} min={5} max={120} suffix="min" />
          <SliderField label="Data Retention" value={data.dataRetentionDays} onChange={(v) => onChange({ dataRetentionDays: v })} min={30} max={3650} suffix="d" />
        </FieldRow>
        <div className="mt-4">
          <SelectField label="Password Policy" value={data.passwordPolicy} onChange={(v) => onChange({ passwordPolicy: v })} options={[
            { value: "standard", label: "Standard" }, { value: "strong", label: "Strong" }, { value: "enterprise", label: "Enterprise" },
          ]} />
        </div>
      </SectionCard>

      <SectionCard title="Hardening">
        <div className="space-y-3">
          <ToggleField label="MFA required" value={data.mfaRequired} onChange={(v) => onChange({ mfaRequired: v })} />
          <ToggleField label="Audit logging" value={data.auditLogging} onChange={(v) => onChange({ auditLogging: v })} />
          <ToggleField label="Login alerts" value={data.loginAlerts} onChange={(v) => onChange({ loginAlerts: v })} />
          <ToggleField label="Block VPN / proxy" value={data.blockVpn} onChange={(v) => onChange({ blockVpn: v })} />
        </div>
        <div className="mt-4">
          <TextField label="IP Allowlist (CIDR, comma separated)" value={data.ipWhitelist} onChange={(v) => onChange({ ipWhitelist: v })} placeholder="10.0.0.0/8, 192.168.1.0/24" />
        </div>
      </SectionCard>
    </div>
  );
}
