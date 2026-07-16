export const SUPPORTED_LOCALES = ["en", "ar", "bn", "hi", "ur"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: Locale[] = ["ar", "ur"];

export const LOCALE_META: Record<Locale, { label: string; native: string; flag: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  ar: { label: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  bn: { label: "Bangla", native: "বাংলা", flag: "🇧🇩", dir: "ltr" },
  hi: { label: "Hindi", native: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  ur: { label: "Urdu", native: "اردو", flag: "🇵🇰", dir: "rtl" },
};

export const NAMESPACES = ["common", "dashboard", "analytics", "media", "notifications", "security", "backup", "queue", "settings", "localization"] as const;
export type Namespace = (typeof NAMESPACES)[number];

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v);
}

export function dir(locale: string): "ltr" | "rtl" {
  return (RTL_LOCALES as string[]).includes(locale) ? "rtl" : "ltr";
}

export const LOCALE_COOKIE = "k2kai_locale";
