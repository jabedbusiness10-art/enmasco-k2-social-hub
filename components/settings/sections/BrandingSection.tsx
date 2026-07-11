"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, SelectField, ColorField, SliderField, ToggleField, TextAreaField, UploadField } from "@/components/settings/fields";

type Props = { data: AppSettings["branding"]; onChange: (p: Partial<AppSettings["branding"]>) => void };

export default function BrandingSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Theme" description="Global appearance. Driven by CSS variables in production.">
        <FieldRow>
          <SelectField label="Mode" value={data.theme} onChange={(v) => onChange({ theme: v })} options={[
            { value: "dark", label: "Dark" }, { value: "light", label: "Light" }, { value: "system", label: "System" },
          ]} />
          <SelectField label="Sidebar Style" value={data.sidebarStyle} onChange={(v) => onChange({ sidebarStyle: v })} options={[
            { value: "glass", label: "Glass" }, { value: "solid", label: "Solid" }, { value: "minimal", label: "Minimal" },
          ]} />
          <SelectField label="Font Family" value={data.fontFamily} onChange={(v) => onChange({ fontFamily: v })} options={[
            { value: "Geist", label: "Geist" }, { value: "Inter", label: "Inter" }, { value: "System", label: "System UI" },
          ]} />
          <SelectField label="Email Template" value={data.emailTemplate} onChange={(v) => onChange({ emailTemplate: v })} options={[
            { value: "default", label: "Default" }, { value: "compact", label: "Compact" }, { value: "branded", label: "Branded" },
          ]} />
        </FieldRow>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ColorField label="Accent Color" value={data.accentColor} onChange={(v) => onChange({ accentColor: v })} />
          <SliderField label="Border Radius" value={data.borderRadius} onChange={(v) => onChange({ borderRadius: v })} min={0} max={28} suffix="px" />
        </div>
        <div className="mt-4">
          <ToggleField label="Glassmorphism effect" description="Frosted blur on surfaces" value={data.glassEffect} onChange={(v) => onChange({ glassEffect: v })} />
        </div>
      </SectionCard>

      <SectionCard title="Logos & Custom CSS">
        <FieldRow>
          <UploadField label="Logo (Light bg)" value={data.logoOnLight} onChange={(v) => onChange({ logoOnLight: v })} />
          <UploadField label="Logo (Dark bg)" value={data.logoOnDark} onChange={(v) => onChange({ logoOnDark: v })} />
        </FieldRow>
        <div className="mt-4">
          <TextAreaField label="Custom CSS" value={data.customCss} onChange={(v) => onChange({ customCss: v })} rows={4} hint="Injected into :root scope. Use with caution." />
        </div>
      </SectionCard>
    </div>
  );
}
