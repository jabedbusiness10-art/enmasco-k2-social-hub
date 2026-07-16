"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { TranslationTable } from "@/components/localization/TranslationTable";
import { MissingTranslations } from "@/components/localization/MissingTranslations";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface Row { locale: string; total: number; translated: number; percent: number; missing: string[]; }

export default function TranslationCenterPage() {
  const { t } = useLocale();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ns, setNs] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/localization/translations${ns !== "all" ? `?namespace=${ns}` : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.coverage ?? []))
      .finally(() => setLoading(false));
  }, [ns]);

  return (
    <div>
      <PageHeader title={t("localization.translationCenter")} description="Translation coverage, status and missing keys across all languages." />
      <div className="mb-3 flex items-center gap-2">
        <select value={ns} onChange={(e) => setNs(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white">
          {["all", "common", "dashboard", "analytics", "media", "notifications", "security", "backup", "queue", "settings", "localization"].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={() => setNs(ns)} className="rounded-lg bg-sky-500/80 px-3 py-1.5 text-xs text-white">Refresh</button>
      </div>
      {loading ? <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" /> : (
        <div className="space-y-4">
          <BackupCard className="p-4"><TranslationTable rows={rows} /></BackupCard>
          <BackupCard className="p-4"><MissingTranslations rows={rows} /></BackupCard>
        </div>
      )}
    </div>
  );
}
