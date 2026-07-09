"use client";

import type { CompanySettingsInput } from "@/lib/validations/settings";

type SectionProps = {
  settings: CompanySettingsInput;
  onChange: (next: CompanySettingsInput) => void;
};

export default function RegionalSettings({ settings, onChange }: SectionProps) {
  const update = (patch: Partial<CompanySettingsInput>) => onChange({ ...settings, ...patch });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Regional Settings</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Timezone</span>
          <select
            value={settings.timezone}
            onChange={(event) => update({ timezone: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="Asia/Riyadh">Asia/Riyadh</option>
            <option value="Asia/Dhaka">Asia/Dhaka</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Language</span>
          <select
            value={settings.language}
            onChange={(event) => update({ language: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="en">English</option>
            <option value="bn">Bengali</option>
            <option value="ar">Arabic</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Date Format</span>
          <select
            value={settings.dateFormat}
            onChange={(event) => update({ dateFormat: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Time Format</span>
          <select
            value={settings.timeFormat}
            onChange={(event) => update({ timeFormat: event.target.value as CompanySettingsInput["timeFormat"] })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="12H">12H</option>
            <option value="24H">24H</option>
          </select>
        </label>
      </div>
    </div>
  );
}
