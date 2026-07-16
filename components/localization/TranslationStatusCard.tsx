"use client";

import { LanguageBadge } from "./LanguageBadge";

export function TranslationStatusCard({ code, native, percent, missing, total }: { code: string; native: string; percent: number; missing: number; total: number }) {
  const tone = percent === 100 ? "text-emerald-300" : percent >= 60 ? "text-sky-300" : "text-amber-300";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <LanguageBadge code={code} />
        <span className={`text-2xl font-semibold ${tone}`}>{percent}%</span>
      </div>
      <div className="mt-1 text-xs text-white/40">{native} · {total - missing}/{total} keys</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${percent === 100 ? "bg-emerald-400" : "bg-sky-400"}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
