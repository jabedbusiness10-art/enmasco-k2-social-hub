"use client";

import type { AppSettings } from "@/types/settings";
import {
  SectionCard,
  FieldRow,
  TextField,
  TextAreaField,
  UploadField,
} from "@/components/settings/fields";

type Props = { data: AppSettings["profile"]; onChange: (p: Partial<AppSettings["profile"]>) => void };

export default function CompanyProfileSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Identity" description="Legal and public company identity used across the platform.">
        <FieldRow>
          <TextField label="Company Name" required value={data.companyName} onChange={(v) => onChange({ companyName: v })} />
          <TextField label="Short Name" value={data.companyShortName} onChange={(v) => onChange({ companyShortName: v })} />
          <TextField label="Legal Name" value={data.legalName} onChange={(v) => onChange({ legalName: v })} />
          <TextField label="Tax / VAT ID" value={data.taxId} onChange={(v) => onChange({ taxId: v })} />
          <TextField label="Industry" value={data.industry} onChange={(v) => onChange({ industry: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Brand Assets" description="Logos are uploaded and stored as data URLs (mock). Swap to a CDN/object storage URL in production.">
        <FieldRow>
          <UploadField label="Logo (Dark)" value={data.logoUrl} onChange={(v) => onChange({ logoUrl: v })} hint="PNG, SVG recommended" />
          <UploadField label="Favicon" value={data.faviconUrl} onChange={(v) => onChange({ faviconUrl: v })} hint=".ico / 32x32" />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Contact" description="Primary and support contact details.">
        <FieldRow>
          <TextField label="Website" value={data.website} onChange={(v) => onChange({ website: v })} />
          <TextField label="Email" value={data.email} onChange={(v) => onChange({ email: v })} />
          <TextField label="Support Email" value={data.supportEmail} onChange={(v) => onChange({ supportEmail: v })} />
          <TextField label="Phone" value={data.phone} onChange={(v) => onChange({ phone: v })} />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Address">
        <FieldRow>
          <TextField label="Street Address" value={data.address} onChange={(v) => onChange({ address: v })} />
          <TextField label="City" value={data.city} onChange={(v) => onChange({ city: v })} />
          <TextField label="Region / State" value={data.region} onChange={(v) => onChange({ region: v })} />
          <TextField label="Country" value={data.country} onChange={(v) => onChange({ country: v })} />
          <TextField label="Postal Code" value={data.postalCode} onChange={(v) => onChange({ postalCode: v })} />
        </FieldRow>
        <div className="mt-4">
          <TextAreaField label="Description" value={data.description} onChange={(v) => onChange({ description: v })} />
        </div>
      </SectionCard>
    </div>
  );
}
