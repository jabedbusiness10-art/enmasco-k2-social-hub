"use client";

import type { CompanySettings } from "@/services/settings/company";

type SectionProps = {
  settings: CompanySettings;
  onChange: (next: CompanySettings) => void;
};

export default function AppearanceSettings({ settings, onChange }: SectionProps) {
  const update = (patch: Partial<CompanySettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Appearance Settings</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Theme</span>
          <select
            value={settings.theme}
            onChange={(event) => update({ theme: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Accent Color</span>
          <select
            value={settings.accentColor}
            onChange={(event) => update({ accentColor: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="blue">Blue</option>
            <option value="sky">Sky</option>
            <option value="red">Red</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-white/60">Sidebar Style</span>
          <select
            value={settings.sidebarStyle}
            onChange={(event) => update({ sidebarStyle: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
          >
            <option value="glass">Glass</option>
            <option value="solid">Solid</option>
          </select>
        </label>
        <label className="flex select-none items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <span className="text-sm font-medium text-white">Glass Effect</span>
          <input
            type="checkbox"
            checked={settings.glassEffect}
            onChange={(event) => update({ glassEffect: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-white/10"
          />
        </label>
      </div>
    </div>
  );
}
