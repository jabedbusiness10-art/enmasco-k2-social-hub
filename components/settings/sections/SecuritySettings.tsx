"use client";

import type { CompanySettingsInput } from "@/lib/validations/settings";

type SectionProps = {
  settings: CompanySettingsInput;
  onChange: (next: CompanySettingsInput) => void;
};

export default function SecuritySettings({ settings, onChange }: SectionProps) {
  const update = (patch: Partial<CompanySettingsInput>) => onChange({ ...settings, ...patch });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Security Settings</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Session Timeout (minutes)</span>
          <input
            type="number"
            min={5}
            max={120}
            value={settings.sessionTimeout}
            onChange={(event) => update({ sessionTimeout: Number(event.target.value) })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Password Policy</span>
          <select
            value={settings.passwordPolicy}
            onChange={(event) => update({ passwordPolicy: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="standard">Standard</option>
            <option value="strong">Strong</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label className="flex select-none items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <span className="text-sm font-medium text-white">Audit Logging</span>
          <input
            type="checkbox"
            checked={settings.auditLogging}
            onChange={(event) => update({ auditLogging: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
        </label>
      </div>
    </div>
  );
}
