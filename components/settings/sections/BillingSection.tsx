"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, ToggleField, SelectField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["billing"]; onChange: (p: Partial<AppSettings["billing"]>) => void };

export default function BillingSection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-sky-400/30 bg-sky-500/[0.04] p-4 text-xs text-sky-200/80">
        Billing is provisioned for a future release. These controls are wired to the
        subscription service interface and will activate when the billing module ships.
      </div>
      <SectionCard title="Plan">
        <FieldRow>
          <SelectField label="Plan" value={data.plan} onChange={(v) => onChange({ plan: v })} options={[
            { value: "free", label: "Free" }, { value: "pro", label: "Pro" }, { value: "business", label: "Business" }, { value: "enterprise", label: "Enterprise" }, { value: "future", label: "Future (Preview)" },
          ]} />
          <TextField label="Billing Email" value={data.billingEmail} onChange={(v) => onChange({ billingEmail: v })} />
          <TextField label="Payment Method" value={data.paymentMethod} onChange={(v) => onChange({ paymentMethod: v })} />
          <TextField label="Seats Included" value={String(data.seatsIncluded)} onChange={(v) => onChange({ seatsIncluded: Number(v) || 0 })} />
          <SelectField label="Invoice Format" value={data.invoiceFormat} onChange={(v) => onChange({ invoiceFormat: v })} options={[
            { value: "pdf", label: "PDF" }, { value: "xml", label: "XML (UBL)" },
          ]} />
          <TextField label="Currency" value={data.currency} onChange={(v) => onChange({ currency: v.toUpperCase() })} />
        </FieldRow>
        <div className="mt-4 space-y-3">
          <ToggleField label="Auto-renew" value={data.autoRenew} onChange={(v) => onChange({ autoRenew: v })} />
          <ToggleField label="Usage-based billing" value={data.usageBased} onChange={(v) => onChange({ usageBased: v })} />
        </div>
      </SectionCard>
    </div>
  );
}
