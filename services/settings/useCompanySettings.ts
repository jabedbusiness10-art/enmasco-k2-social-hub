"use client";

import { useState, useEffect } from "react";
import type { CompanySettingsInput } from "@/lib/validations/settings";
import { useToast } from "@/components/ui/Toast";

// Defaults mirror the Prisma schema @default values so the form always renders
// even when no CompanySettings row exists in the database yet.
const DEFAULT_SETTINGS: CompanySettingsInput = {
  companyName: "",
  companyShortName: "",
  logoUrl: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  timezone: "UTC",
  language: "en",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24H",
  theme: "dark",
  accentColor: "blue",
  sidebarStyle: "glass",
  glassEffect: true,
  sessionTimeout: 30,
  passwordPolicy: "standard",
  auditLogging: true,
};

type SettingsState = {
  settings: CompanySettingsInput;
  isLoading: boolean;
  error: string | null;
};

export type UseCompanySettingsResult = {
  state: SettingsState;
  saveSettings: (input: CompanySettingsInput) => Promise<void>;
  resetSettings: () => Promise<void>;
  isSaving: boolean;
};

export function useCompanySettings(): UseCompanySettingsResult {
  const { showToast } = useToast();
  const [state, setState] = useState<SettingsState>({
    settings: DEFAULT_SETTINGS,
    isLoading: true,
    error: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [original, setOriginal] = useState<CompanySettingsInput>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/company/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const json = await res.json();
        const loaded = (json.settings as CompanySettingsInput) ?? null;
        // Render the loaded row if present, otherwise fall back to defaults so
        // the form is never blank/hidden.
        const next = loaded ?? DEFAULT_SETTINGS;
        if (!cancelled) {
          setState({
            settings: next,
            isLoading: false,
            error: null,
          });
          setOriginal(next);
        }
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false, error: "Failed to load settings" }));
          showToast("Failed to load settings", "error");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const saveSettings = async (input: CompanySettingsInput) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const json = await res.json();
      setState((prev) => ({ ...prev, settings: json.settings as CompanySettingsInput }));
      setOriginal((json.settings as CompanySettingsInput) ?? null);
      showToast("Settings saved successfully");
    } catch (error) {
      showToast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!original) return;
    await saveSettings(original);
  };

  return {
    state,
    saveSettings,
    resetSettings,
    isSaving,
  };
}
