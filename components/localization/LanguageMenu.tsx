"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_META } from "@/lib/i18n/config";
import { Globe, Check } from "lucide-react";

export function LanguageMenu() {
  const { locale, setLocale, available } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
        <Globe className="h-4 w-4 text-sky-300" /> {LOCALE_META[locale].native} {LOCALE_META[locale].flag}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-white/10 bg-[#0a0a14] p-1 shadow-xl">
          {available.map((l) => (
            <button key={l} onClick={() => { setLocale(l); setOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10">
              <span>{LOCALE_META[l].flag} {LOCALE_META[l].native}</span>
              {l === locale && <Check className="h-4 w-4 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
