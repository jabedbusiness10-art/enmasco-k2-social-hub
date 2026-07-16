"use client";

import { Search } from "lucide-react";
import { LOCALE_META } from "@/lib/i18n/config";

interface Row { locale: string; total: number; translated: number; percent: number; missing: string[]; }

export function TranslationTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-white/40">
          <tr className="border-b border-white/10">
            <th className="px-3 py-2">Language</th><th>Total Keys</th><th>Translated</th><th>Coverage</th><th>Missing</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const state = r.percent === 100 ? "COMPLETE" : r.percent >= 60 ? "IN_PROGRESS" : r.percent > 0 ? "NEEDS_REVIEW" : "MISSING";
            const tone = state === "COMPLETE" ? "text-emerald-300" : state === "IN_PROGRESS" ? "text-sky-300" : state === "NEEDS_REVIEW" ? "text-amber-300" : "text-rose-300";
            return (
              <tr key={r.locale} className="border-b border-white/5">
                <td className="px-3 py-2 text-white/80">{LOCALE_META[r.locale as keyof typeof LOCALE_META]?.flag} {LOCALE_META[r.locale as keyof typeof LOCALE_META]?.native}</td>
                <td className="text-white/60">{r.total}</td>
                <td className="text-white/60">{r.translated}</td>
                <td className="text-white/60">{r.percent}%</td>
                <td className="text-white/60">{r.missing.length}</td>
                <td className={`font-medium ${tone}`}>{state}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TranslationSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5">
      <Search className="h-3.5 w-3.5 text-white/30" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search keys, values, namespaces…" className="bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
    </div>
  );
}
