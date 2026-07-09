"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCompanySettings } from "@/services/settings/useCompanySettings";
import { cn } from "@/lib/utils";
import CompanyProfile from "./sections/CompanyProfile";
import RegionalSettings from "./sections/RegionalSettings";
import AppearanceSettings from "./sections/AppearanceSettings";
import SecuritySettings from "./sections/SecuritySettings";
import SaveBar from "./SaveBar";

type Tab = "profile" | "regional" | "appearance" | "security";

const tabs: { key: Tab; label: string }[] = [
  { key: "profile", label: "Company Profile" },
  { key: "regional", label: "Regional" },
  { key: "appearance", label: "Appearance" },
  { key: "security", label: "Security" },
];

export default function CompanySettings() {
  const { state, saveSettings, resetSettings, isSaving } = useCompanySettings();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (state.isLoading || !state.settings) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-56 rounded bg-white/10" />
        <div className="h-64 w-full rounded-2xl border border-white/10 bg-white/[0.04]" />
      </div>
    );
  }

  const handleSectionChange = async (next: any) => {
    await saveSettings(next);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      <motion.div
        layout
        className="flex flex-row gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-2 lg:flex-col lg:overflow-visible"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-xl px-3 py-2 text-left text-sm font-medium transition",
              activeTab === tab.key
                ? "bg-white/10 text-sky-200 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div layout className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {activeTab === "profile" && (
          <CompanyProfile settings={state.settings} onChange={handleSectionChange} />
        )}
        {activeTab === "regional" && (
          <RegionalSettings settings={state.settings} onChange={handleSectionChange} />
        )}
        {activeTab === "appearance" && (
          <AppearanceSettings settings={state.settings} onChange={handleSectionChange} />
        )}
        {activeTab === "security" && (
          <SecuritySettings settings={state.settings} onChange={handleSectionChange} />
        )}

        <SaveBar onSave={() => {}} onReset={resetSettings} isSaving={isSaving} />
      </motion.div>
    </div>
  );
}
