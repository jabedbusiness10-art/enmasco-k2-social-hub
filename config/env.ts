export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "",
  isDev: process.env.NODE_ENV === "development",
  weather: {
    location: process.env.WEATHER_LOCATION?.trim() || "Riyadh, Saudi Arabia",
    latitude: process.env.WEATHER_LATITUDE?.trim() || "24.7136",
    longitude: process.env.WEATHER_LONGITUDE?.trim() || "46.6753",
    timezone: process.env.WEATHER_TIMEZONE?.trim() || "Asia/Riyadh",
  },
} as const;
