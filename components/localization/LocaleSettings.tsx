"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_META } from "@/lib/i18n/config";

export function LocaleSettings() {
  const { locale } = useLocale();
  const meta = LOCALE_META[locale];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Row label="Language" value={meta.native} />
      <Row label="Text Direction" value={meta.dir.toUpperCase()} />
      <Row label="Date Format" value="YYYY-MM-DD" />
      <Row label="Time Format" value="24h" />
      <Row label="Number Format" value="1,234.56" />
      <Row label="Currency" value="USD ($)" />
      <Row label="First Day of Week" value="Monday" />
      <Row label="Timezone" value="UTC" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}
