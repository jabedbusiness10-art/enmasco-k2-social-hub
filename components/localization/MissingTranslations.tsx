"use client";

import { useEffect, useState } from "react";
import { TranslationTable, TranslationSearch } from "./TranslationTable";

interface Row { locale: string; total: number; translated: number; percent: number; missing: string[]; }

export function MissingTranslations({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");
  useEffect(() => setRows(initial), [initial]);

  const filtered = rows
    .flatMap((r) => r.missing.map((m) => ({ locale: r.locale, key: m })))
    .filter((x) => `${x.locale} ${x.key}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-white/70">Missing Translations ({filtered.length})</div>
        <TranslationSearch value={q} onChange={setQ} />
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-white/40">No missing keys for the current filter — every namespace is fully covered in English; other languages show partial coverage above.</div>
      ) : (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {filtered.slice(0, 200).map((x, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-1.5 text-xs">
              <span className="font-mono text-white/50">{x.key}</span>
              <span className="text-amber-300">{x.locale}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
