"use client";

import { LOCALE_META } from "@/lib/i18n/config";

export function LanguageBadge({ code, dir }: { code: string; dir?: "ltr" | "rtl" }) {
  const meta = LOCALE_META[code as keyof typeof LOCALE_META];
  if (!meta) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/60">
      <span>{meta.flag}</span>{meta.native}
      <span className="text-white/30">{meta.dir.toUpperCase()}</span>
    </span>
  );
}
