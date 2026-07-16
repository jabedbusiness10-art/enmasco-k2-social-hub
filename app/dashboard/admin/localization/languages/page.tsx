"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { LanguageBadge } from "@/components/localization/LanguageBadge";
import { LOCALE_META, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LanguageManagerPage() {
  const { t, setLocale, locale } = useLocale();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/localization/languages", { cache: "no-store" }).then((r) => r.json()).then((j) => setRows(j.languages ?? [])).catch(() => {}); }, []);

  return (
    <div>
      <PageHeader title={t("localization.languageManager")} description="Supported languages and text direction." />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SUPPORTED_LOCALES.map((l) => (
          <BackupCard key={l} className="p-4">
            <div className="flex items-center justify-between">
              <LanguageBadge code={l} />
              {l === locale && <span className="text-[10px] text-emerald-300">active</span>}
            </div>
            <div className="mt-2 text-sm text-white/70">{LOCALE_META[l].label}</div>
            <div className="mt-3">
              <button onClick={() => setLocale(l)} disabled={l === locale} className="rounded-lg bg-sky-500/80 px-3 py-1.5 text-xs text-white disabled:opacity-40">{l === locale ? "Current" : "Switch"}</button>
            </div>
          </BackupCard>
        ))}
      </div>
    </div>
  );
}
