"use client";

import { useState, useEffect } from "react";
import type { CompanySettingsInput } from "@/lib/validations/settings";
import { useToast } from "@/components/ui/Toast";

type SettingsState = {
  settings: CompanySettingsInput | null;
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
    settings: null,
    isLoading: true,
    error: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [original, setOriginal] = useState<CompanySettingsInput | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/company/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const json = await res.json();
        if (!cancelled) {
          setState({
            settings: (json.settings as CompanySettingsInput) ?? null,
            isLoading: false,
            error: null,
          });
          setOriginal((json.settings as CompanySettingsInput) ?? null);
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
