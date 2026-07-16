import "server-only";
import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import bn from "@/messages/bn.json";
import hi from "@/messages/hi.json";
import ur from "@/messages/ur.json";
import { isLocale, type Locale, DEFAULT_LOCALE } from "./config";

const DICTS: Record<Locale, any> = { en, ar, bn, hi, ur };

export function getDictionary(locale?: string): any {
  const l = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return DICTS[l];
}

/** Flatten a nested dict into dot-paths for coverage/missing detection. */
export function flatten(obj: any, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === "object") Object.assign(out, flatten(obj[k], key));
    else out[key] = String(obj[k]);
  }
  return out;
}

export function getCoverage(): { locale: Locale; total: number; translated: number; missing: string[] }[] {
  const base = flatten(DICTS.en);
  const total = Object.keys(base).length;
  return (Object.keys(DICTS) as Locale[]).map((locale) => {
    const flat = flatten(DICTS[locale]);
    const missing = Object.keys(base).filter((k) => !(k in flat) || !flat[k]);
    return { locale, total, translated: total - missing.length, missing };
  });
}
