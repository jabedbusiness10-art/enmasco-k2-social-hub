"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BackupCard } from "@/components/backup/primitives";
import { LocaleSettings } from "@/components/localization/LocaleSettings";
import { RTLPreview } from "@/components/localization/RTLPreview";
import { LanguageSwitcher } from "@/components/localization/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_META, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { Languages, Sparkles } from "lucide-react";

export default function LocaleSettingsPage() {
  const { t, locale } = useLocale();
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("ar");
  const [text, setText] = useState("Protect what matters most. ENMASCO Security delivers enterprise-grade CCTV.");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  const translate = async () => {
    setBusy(true); setResult("");
    try {
      const r = await fetch("/api/localization/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, source, target }) });
      const j = await r.json();
      setResult(j.translated ?? "");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader title={t("localization.localeSettings")} description="Regional formatting, language preference and AI auto-translation." />
      <div className="space-y-4">
        <BackupCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-white/70"><Languages className="h-4 w-4 text-sky-300" /> Quick Language Switch</div>
          <LanguageSwitcher />
        </BackupCard>
        <BackupCard className="p-4"><LocaleSettings /></BackupCard>
        <BackupCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-white/70"><Sparkles className="h-4 w-4 text-sky-300" /> AI Auto Translation (never overwrites original)</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 flex gap-2">
                <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"><option value="en">EN</option></select>
                <span className="self-center text-white/40">→</span>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white">
                  {SUPPORTED_LOCALES.map((l) => <option key={l} value={l}>{LOCALE_META[l].native}</option>)}
                </select>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm text-white focus:outline-none" />
              <button onClick={translate} disabled={busy} className="mt-2 rounded-lg bg-sky-500/80 px-3 py-1.5 text-xs text-white disabled:opacity-40">{busy ? "Translating…" : "Translate"}</button>
            </div>
            <div dir={LOCALE_META[target as keyof typeof LOCALE_META]?.dir}>
              <div className="text-xs text-white/40">Translation ({LOCALE_META[target as keyof typeof LOCALE_META]?.native})</div>
              <div className="mt-1 min-h-[6rem] rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white/80">{result || "—"}</div>
              <div className="mt-1 text-[10px] text-white/30">{t("localization.neverOverwrite")}</div>
            </div>
          </div>
        </BackupCard>
        <BackupCard className="p-4"><RTLPreview previewLocale="ar" /></BackupCard>
      </div>
    </div>
  );
}
