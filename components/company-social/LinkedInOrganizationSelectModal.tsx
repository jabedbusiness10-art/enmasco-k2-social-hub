"use client";

import { useState } from "react";
import { Building2, Loader2, X } from "lucide-react";

export interface SelectableLinkedInOrganization {
  id: string;
  name: string;
  vanityName?: string | null;
  websiteUrl?: string | null;
  adminRole: string;
  adminState: string;
}

export default function LinkedInOrganizationSelectModal({
  organizations,
  busy,
  onSelect,
  onClose,
}: {
  organizations: SelectableLinkedInOrganization[];
  busy: boolean;
  onSelect: (organizationId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(organizations[0]?.id ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0f] p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white" aria-label="Close LinkedIn organization selection">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Select LinkedIn Company Page</h2>
        <p className="mt-1 text-sm text-white/55">Only organizations this LinkedIn member is authorized to manage are shown.</p>
        <div className="mt-5 max-h-80 space-y-2 overflow-y-auto">
          {organizations.map((organization) => (
            <label key={organization.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${selected === organization.id ? "border-sky-400/45 bg-sky-400/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"}`}>
              <input type="radio" name="linkedin-organization" value={organization.id} checked={selected === organization.id} onChange={() => setSelected(organization.id)} className="sr-only" />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2]/20 text-[#70b7ff]"><Building2 className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{organization.name}</span>
                <span className="block truncate text-xs text-white/45">{organization.websiteUrl || organization.vanityName || `Organization ${organization.id}`}</span>
              </span>
              <span className="rounded-full border border-emerald-400/25 px-2 py-1 text-[10px] font-semibold text-emerald-300">{organization.adminRole.replaceAll("_", " ")}</span>
            </label>
          ))}
        </div>
        <button type="button" disabled={!selected || busy} onClick={() => onSelect(selected)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Connect selected company
        </button>
      </div>
    </div>
  );
}
