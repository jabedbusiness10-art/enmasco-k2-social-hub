"use client";

import { LOCALE_META } from "@/lib/i18n/config";

export function TranslationProgress({ code, percent }: { code: string; percent: number }) {
  const meta = LOCALE_META[code as keyof typeof LOCALE_META];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-white/70">{meta?.flag} {meta?.native}</span>
        <span className="text-white/40">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${percent === 100 ? "bg-emerald-400" : percent >= 60 ? "bg-sky-400" : "bg-amber-400"}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
