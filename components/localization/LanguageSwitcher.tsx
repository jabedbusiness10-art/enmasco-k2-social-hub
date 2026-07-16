"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_META } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale, available } = useLocale();
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-white/40" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white focus:outline-none"
        aria-label="Select language"
      >
        {available.map((l) => (
          <option key={l} value={l}>{LOCALE_META[l].flag} {LOCALE_META[l].native}</option>
        ))}
      </select>
    </div>
  );
}
