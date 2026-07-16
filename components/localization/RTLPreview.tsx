"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_META } from "@/lib/i18n/config";

// Live RTL preview — renders a sample block with the target language's direction.
export function RTLPreview({ previewLocale = "ar" }: { previewLocale?: "ar" | "ur" }) {
  const { t } = useLocale();
  const meta = LOCALE_META[previewLocale];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 text-sm text-white/60">RTL Preview — {meta.native} ({meta.dir.toUpperCase()})</div>
      <div dir={meta.dir} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-white/70">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span>{t("dashboard.title")}</span>
          <span className="text-white/40">→</span>
        </div>
        <p className="text-sm">{t("localization.rtlPreview")}: {t("dashboard.quickActions")}</p>
        <div className="flex gap-2">
          <span className="rounded-md bg-sky-500/20 px-2 py-1 text-xs">{t("common.save")}</span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs">{t("common.cancel")}</span>
        </div>
      </div>
    </div>
  );
}
