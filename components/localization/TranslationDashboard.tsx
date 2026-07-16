"use client";

import { useEffect, useState } from "react";
import { TranslationStatusCard } from "./TranslationStatusCard";
import { TranslationProgress } from "./TranslationProgress";
import { MissingTranslations } from "./MissingTranslations";
import { LOCALE_META } from "@/lib/i18n/config";

interface CoverageRow { locale: string; total: number; translated: number; percent: number; missing: string[]; }

export function TranslationDashboard() {
  const [rows, setRows] = useState<CoverageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/localization/translations", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setRows(j.coverage ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <TranslationStatusCard key={r.locale} code={r.locale} native={LOCALE_META[r.locale as keyof typeof LOCALE_META]?.native ?? r.locale} percent={r.percent} missing={r.missing.length} total={r.total} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <TranslationProgress key={r.locale} code={r.locale} percent={r.percent} />
        ))}
      </div>
      <MissingTranslations rows={rows} />
    </div>
  );
}
