"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppSettings, SettingsSectionKey } from "@/types/settings";
import { DEFAULT_APP_SETTINGS } from "@/data/settings";
import { useToast } from "@/components/ui/Toast";

type SettingsState = {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  lastSavedAt: string | null;
};

export type UseAppSettingsResult = {
  state: SettingsState;
  draft: AppSettings;
  isDirty: boolean;
  isSaving: boolean;
  setSection: <K extends SettingsSectionKey>(key: K, patch: Partial<AppSettings[K]>) => void;
  save: () => Promise<void>;
  reset: () => void;
  reload: () => Promise<void>;
};

// Deep merge so partial server payloads never wipe local defaults.
function mergeSettings(base: AppSettings, patch: Partial<AppSettings>): AppSettings {
  const next = { ...base } as any;
  (Object.keys(patch) as SettingsSectionKey[]).forEach((k) => {
    next[k] = { ...(next[k] as object), ...(patch[k] as object) };
  });
  return next as AppSettings;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function useAppSettings(): UseAppSettingsResult {
  const { showToast } = useToast();
  const [state, setState] = useState<SettingsState>({
    settings: DEFAULT_APP_SETTINGS,
    isLoading: true,
    error: null,
    lastSavedAt: null,
  });
  const [draft, setDraft] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [saved, setSaved] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch("/api/company/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const json = await res.json();
      const loaded = (json.settings as AppSettings) ?? DEFAULT_APP_SETTINGS;
      const next = mergeSettings(DEFAULT_APP_SETTINGS, loaded);
      setDraft(next);
      setSaved(next);
      setState({ settings: next, isLoading: false, error: null, lastSavedAt: json.savedAt ?? null });
    } catch {
      // Fall back to defaults so the control center always renders.
      setDraft(DEFAULT_APP_SETTINGS);
      setSaved(DEFAULT_APP_SETTINGS);
      setState({ settings: DEFAULT_APP_SETTINGS, isLoading: false, error: "Using defaults", lastSavedAt: null });
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const setSection = useCallback(
    <K extends SettingsSectionKey>(key: K, patch: Partial<AppSettings[K]>) => {
      setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } } as AppSettings));
    },
    [],
  );

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const json = await res.json();
      const next = mergeSettings(DEFAULT_APP_SETTINGS, (json.settings as AppSettings) ?? draft);
      setDraft(next);
      setSaved(clone(next));
      setState((s) => ({ ...s, lastSavedAt: json.savedAt ?? new Date().toISOString() }));
      showToast("Settings saved successfully");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  }, [draft, showToast]);

  const reset = useCallback(() => {
    setDraft(clone(saved));
    showToast("Changes reset");
  }, [saved, showToast]);

  return { state, draft, isDirty, isSaving, setSection, save, reset, reload };
}
