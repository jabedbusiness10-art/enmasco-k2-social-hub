"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { isLocale, dir, DEFAULT_LOCALE, type Locale, LOCALE_COOKIE } from "@/lib/i18n/config";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import bn from "@/messages/bn.json";
import hi from "@/messages/hi.json";
import ur from "@/messages/ur.json";

const DICTS: Record<Locale, any> = { en, ar, bn, hi, ur };

type Dict = Record<string, any>;

function flatten(obj: Dict, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === "object") Object.assign(out, flatten(obj[k], key));
    else out[key] = String(obj[k]);
  }
  return out;
}

function lookup(dict: any, path: string): string | undefined {
  return path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), dict) as string | undefined;
}

interface LocaleCtx {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (path: string, fallback?: string) => string;
  available: Locale[];
}

const Ctx = createContext<LocaleCtx | null>(null);

export function useLocale() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLocale must be used within LocaleProvider");
  return v;
}

export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE);
  const direction = dir(locale);

  // apply dir to <html> instantly on change
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.documentElement.lang = l;
    document.documentElement.dir = dir(l);
    // persist to cookie (server reads) + localStorage (client)
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    try { localStorage.setItem(LOCALE_COOKIE, l); } catch {}
    // best-effort: persist to user profile via API (admins only)
    fetch("/api/localization/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: l }) }).catch(() => {});
  }, []);

  const t = useCallback((path: string, fallback?: string) => {
    return lookup(DICTS[locale], path) ?? lookup(DICTS.en, path) ?? fallback ?? path;
  }, [locale]);

  return <Ctx.Provider value={{ locale, dir: direction, setLocale, t, available: ["en", "ar", "bn", "hi", "ur"] as Locale[] }}>{children}</Ctx.Provider>;
}
