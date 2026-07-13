"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Globe, Palette, Share2, Sparkles, Send, Bell, Users,
  ShieldCheck, Plug, Database, CreditCard, ScrollText, Activity, SlidersHorizontal,
  Save, RotateCcw, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSettings } from "@/services/settings/useAppSettings";
import { SETTINGS_SECTIONS, type SettingsSectionKey } from "@/types/settings";

import CompanyProfileSection from "@/components/settings/sections/CompanyProfileSection";
import RegionalSection from "@/components/settings/sections/RegionalSection";
import BrandingSection from "@/components/settings/sections/BrandingSection";
import SocialSection from "@/components/settings/sections/SocialSection";
import AISection from "@/components/settings/sections/AISection";
import PublishingSection from "@/components/settings/sections/PublishingSection";
import NotificationsSection from "@/components/settings/sections/NotificationsSection";
import TeamSection from "@/components/settings/sections/TeamSection";
import SecuritySection from "@/components/settings/sections/SecuritySection";
import IntegrationsSection from "@/components/settings/sections/IntegrationsSection";
import BackupSection from "@/components/settings/sections/BackupSection";
import BillingSection from "@/components/settings/sections/BillingSection";
import AuditSection from "@/components/settings/sections/AuditSection";
import SystemSection from "@/components/settings/sections/SystemSection";
import AdvancedSection from "@/components/settings/sections/AdvancedSection";

const ICONS: Record<string, LucideIcon> = {
  Building2, Globe, Palette, Share2, Sparkles, Send, Bell, Users,
  ShieldCheck, Plug, Database, CreditCard, ScrollText, Activity, SlidersHorizontal,
};

const RENDERERS: Record<SettingsSectionKey, (p: any) => JSX.Element> = {
  profile: (p) => <CompanyProfileSection data={p.data.profile} onChange={(x) => p.onChange("profile", x)} />,
  regional: (p) => <RegionalSection data={p.data.regional} onChange={(x) => p.onChange("regional", x)} />,
  branding: (p) => <BrandingSection data={p.data.branding} onChange={(x) => p.onChange("branding", x)} />,
  social: (p) => <SocialSection data={p.data.social} onChange={(x) => p.onChange("social", x)} />,
  ai: (p) => <AISection data={p.data.ai} onChange={(x) => p.onChange("ai", x)} />,
  publishing: (p) => <PublishingSection data={p.data.publishing} onChange={(x) => p.onChange("publishing", x)} />,
  notifications: (p) => <NotificationsSection data={p.data.notifications} onChange={(x) => p.onChange("notifications", x)} />,
  team: (p) => <TeamSection data={p.data.team} onChange={(x) => p.onChange("team", x)} />,
  security: (p) => <SecuritySection data={p.data.security} onChange={(x) => p.onChange("security", x)} />,
  integrations: (p) => <IntegrationsSection data={p.data.integrations} onChange={(x) => p.onChange("integrations", x)} />,
  backup: (p) => <BackupSection data={p.data.backup} onChange={(x) => p.onChange("backup", x)} />,
  billing: (p) => <BillingSection data={p.data.billing} onChange={(x) => p.onChange("billing", x)} />,
  audit: (p) => <AuditSection data={p.data.audit} onChange={(x) => p.onChange("audit", x)} />,
  system: (p) => <SystemSection data={p.data.system} onChange={(x) => p.onChange("system", x)} />,
  advanced: (p) => <AdvancedSection data={p.data.advanced} onChange={(x) => p.onChange("advanced", x)} />,
};

const GROUPS = ["Organization", "Channels", "Administration", "Observability"];

export default function SettingsControlCenter() {
  const { state, draft, isDirty, isSaving, setSection, save, reset } = useAppSettings();
  const [active, setActive] = useState<SettingsSectionKey>("profile");

  if (state.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-96 w-full rounded-2xl border border-white/10 bg-white/[0.04]" />
      </div>
    );
  }

  const Active = RENDERERS[active];
  const activeLabel = SETTINGS_SECTIONS.find((s) => s.key === active)?.label ?? "";

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar nav */}
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden w-60 shrink-0 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:block"
      >
        {GROUPS.map((g) => (
          <div key={g} className="mb-4">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">{g}</div>
            <div className="space-y-0.5">
              {SETTINGS_SECTIONS.filter((s) => s.group === g).map((s) => {
                const Icon = ICONS[s.icon] ?? SlidersHorizontal;
                const isActive = s.key === active;
                return (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition",
                      isActive
                        ? "bg-sky-500/15 text-sky-100 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.3)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.aside>

      {/* Content */}
      <motion.main
        key={active}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-y-auto pr-1"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{activeLabel}</h1>
            <p className="text-xs text-white/40">Enterprise Control Center · K2KAI Social Flow</p>
          </div>
          {isDirty && (
            <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
              Unsaved changes
            </span>
          )}
        </div>

        <Active data={draft} onChange={setSection} />

        {/* Save / Reset bar */}
        <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t border-white/10 bg-[#06060a]/80 py-4 backdrop-blur">
          <button
            onClick={reset}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={save}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 rounded-xl border border-sky-300/40 bg-sky-500/15 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25 disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.main>
    </div>
  );
}
