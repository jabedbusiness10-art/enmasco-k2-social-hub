"use client";

import type { CompanySettings } from "@/services/settings/company";
import { useCompanySettings } from "@/services/settings/useCompanySettings";

type SectionProps = {
  settings: CompanySettings;
  onChange: (next: CompanySettings) => void;
};

export default function CompanyProfile({ settings, onChange }: SectionProps) {
  const update = (patch: Partial<CompanySettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Company Profile</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Company Name" required value={settings.companyName} onChange={(value) => update({ companyName: value })} />
        <Field label="Short Name" value={settings.companyShortName ?? ""} onChange={(value) => update({ companyShortName: value })} />
        <Field label="Logo URL" value={settings.logoUrl ?? ""} onChange={(value) => update({ logoUrl: value })} />
        <Field label="Website" value={settings.website ?? ""} onChange={(value) => update({ website: value })} />
        <Field label="Email" value={settings.email ?? ""} onChange={(value) => update({ email: value })} />
        <Field label="Phone" value={settings.phone ?? ""} onChange={(value) => update({ phone: value })} />
      </div>
      <Field label="Address" value={settings.address ?? ""} onChange={(value) => update({ address: value })} />
    </div>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

function Field({ label, required, value, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-white/60">
        {label}
        {required && <span className="ml-1 text-red-300">*</span>}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition focus:border-sky-300"
        placeholder={label}
      />
    </label>
  );
}
