"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Loader2,
  Radio,
  RefreshCw,
  Sun,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { hrefForLabel } from "@/lib/search/navigation";
import type { WeatherIconName, WeatherResult } from "@/lib/weather/service";

const WEATHER_REFRESH_MS = 10 * 60 * 1000;

type EnterpriseTopNavProps = {
  className?: string;
};

// Branding: single source of truth is the saved Company Settings
// (/api/company/settings, same store the Company Settings page writes to).
type Branding = { name: string; logo: string };
const DEFAULT_BRANDING: Branding = { name: "K2Media Hub", logo: "/logo.png" };

async function loadBranding(): Promise<Branding> {
  try {
    const res = await fetch("/api/company/settings", { cache: "no-store" });
    if (!res.ok) return DEFAULT_BRANDING;
    const json = await res.json();
    const settings = json?.settings;
    const profile = settings?.profile;
    if (!profile) return DEFAULT_BRANDING;
    const name = profile.companyShortName?.trim() || profile.companyName?.trim() || DEFAULT_BRANDING.name;
    const logo = profile.logoUrl?.trim() || DEFAULT_BRANDING.logo;
    return { name, logo };
  } catch {
    return DEFAULT_BRANDING;
  }
}

function formatClock(date: Date) {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Riyadh",
  }).format(date);

  const calendarDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(date);

  return { day, calendarDate, time };
}

export default function EnterpriseTopNav({ className = "" }: EnterpriseTopNavProps) {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const executiveHref = hrefForLabel("Executive");

  const loadWeather = useCallback(async (forceRefresh = false) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather${forceRefresh ? "?refresh=1" : ""}`, { cache: "no-store" });
      const result = await response.json() as WeatherResult;
      setWeather((previous) => {
        if (result.status === "ok") return result;
        return {
          ...result,
          lastSuccessfulUpdate: result.lastSuccessfulUpdate ?? (previous?.status === "ok" ? previous.updatedAt : null),
        };
      });
    } catch {
      setWeather((previous) => ({
        status: "unavailable",
        location: previous?.location ?? "Configured location",
        timezone: previous?.timezone ?? "UTC",
        message: "Weather Unavailable",
        lastSuccessfulUpdate: previous?.status === "ok" ? previous.updatedAt : previous?.lastSuccessfulUpdate ?? null,
      }));
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadWeather();
    const timer = window.setInterval(() => void loadWeather(), WEATHER_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadWeather]);

  // Branding: load saved company identity/logo (single source = /api/company/settings).
  // Refetch on window focus so a save in Company Settings reflects without a restart.
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  useEffect(() => {
    let cancelled = false;
    void loadBranding().then((b) => { if (!cancelled) setBranding(b); });
    const onFocus = () => void loadBranding().then((b) => { if (!cancelled) setBranding(b); });
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const clock = useMemo(() => formatClock(now ?? new Date("2026-07-07T13:45:18.000Z")), [now]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`enterprise-top-nav relative z-50 overflow-visible rounded-[20px] border border-white/10 bg-[#070709]/80 px-3 py-2 text-white shadow-[0_18px_55px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:px-4 ${className}`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_0%,rgba(248,113,113,0.18),transparent_28%),radial-gradient(circle_at_50%_-30%,rgba(255,255,255,0.09),transparent_24%),radial-gradient(circle_at_95%_100%,rgba(127,29,29,0.24),transparent_34%)]" />
      <div className="top-nav-grid absolute inset-0 -z-10 opacity-35" />
      <div className="absolute left-0 top-0 -z-10 h-px w-full bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />

      <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ duration: 0.25 }}
          className="group flex min-w-0 flex-shrink-0 items-center gap-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={branding.logo}
            alt={`${branding.name} logo`}
            className="h-9 w-auto drop-shadow-[0_0_12px_rgba(99,102,241,0.55)]"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src !== window.location.origin + "/logo.png") {
                el.src = "/logo.png";
              } else {
                el.style.display = "none";
              }
            }}
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold leading-tight tracking-[0.25px] text-white">
              {branding.name}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.015, y: -1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex min-w-[136px] flex-shrink-0 flex-col justify-center rounded-xl border border-red-400/20 bg-black/55 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_18px_rgba(248,113,113,0.06)] backdrop-blur-sm"
        >
          <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-red-200/55">
            GMT+3 (Riyadh)
          </div>
          <div className="font-mono text-[21px] font-bold leading-6 tabular-nums tracking-[0.035em] text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.65)]">
            {clock.time}
          </div>
          <div className="text-[9px] font-medium leading-3 text-white/38">
            {clock.calendarDate}
          </div>
        </motion.div>

        <div className="ml-auto flex min-w-0 flex-wrap items-stretch justify-end gap-1.5 xl:flex-nowrap">
          <StatusTile
            icon={BrainCircuit}
            label="AI Status"
            value="Online"
            tone="emerald"
          />
          <StatusTile
            icon={Radio}
            label="Network Status"
            value="Connected"
            tone="emerald"
          />
          <WeatherTile weather={weather} loading={weatherLoading} onRefresh={() => void loadWeather(true)} />

          <NotificationBell />

          <motion.button
            type="button"
            onClick={() => router.push(executiveHref)}
            title="Executive Dashboard"
            aria-label="Executive Dashboard"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ y: 0, scale: 0.985 }}
            transition={{ duration: 0.25 }}
            className="group flex min-h-[44px] min-w-[180px] cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-left shadow-[0_10px_26px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-white/[0.075] hover:shadow-[0_0_24px_rgba(248,113,113,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070709] active:border-red-200/45 active:bg-white/[0.09]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-200/20 bg-red-400/[0.1] text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.14)] transition-all duration-300 group-hover:border-red-200/45 group-hover:text-white">
              <UserRound className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold leading-tight text-white">
                MD Kazim
              </div>
              <div className="mt-0.5 truncate text-[8px] font-semibold uppercase tracking-[0.12em] text-white/40">
                Chief Executive Officer (CEO)
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      <style>{`
        .top-nav-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(248, 113, 113, 0.12), transparent 56%);
          background-size: 34px 34px, 34px 34px, 100% 100%;
          animation: top-nav-grid-drift 18s linear infinite;
        }

        @keyframes top-nav-grid-drift {
          from {
            background-position: 0 0, 0 0, center;
          }
          to {
            background-position: 34px 34px, 34px 34px, center;
          }
        }
      `}</style>
    </motion.header>
  );
}

const WEATHER_ICONS: Record<WeatherIconName, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

function formatWeatherTime(value: string | null, timezone: string) {
  if (!value) return "No successful update";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(value));
}

function WeatherTile({ weather, loading, onRefresh }: { weather: WeatherResult | null; loading: boolean; onRefresh: () => void }) {
  const Icon = weather?.status === "ok" ? WEATHER_ICONS[weather.icon] : Cloud;
  const available = weather?.status === "ok";
  const updatedAt = available ? weather.updatedAt : weather?.lastSuccessfulUpdate ?? null;
  const timezone = weather?.timezone ?? "UTC";

  return (
    <div
      className="group flex min-h-[44px] min-w-[190px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-white/[0.075] hover:shadow-[0_0_24px_rgba(248,113,113,0.15)]"
      title={available ? `${weather.location} · Feels like ${Math.round(weather.feelsLikeC)}°C · Humidity ${Math.round(weather.humidityPercent)}% · Wind ${Math.round(weather.windSpeedKmh)} km/h` : "Weather provider is currently unavailable"}
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/35 text-amber-100 transition-all duration-300 group-hover:border-red-200/35 group-hover:text-white">
        <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${available ? "bg-amber-200 shadow-[0_0_16px_rgba(253,230,138,0.7)]" : "bg-white/35"}`} />
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[8px] font-semibold uppercase tracking-[0.13em] text-white/42">
          {weather?.location ?? "Weather"}
        </div>
        <div className="mt-0.5 truncate text-[11px] font-semibold leading-3 text-white/84">
          {available ? `${Math.round(weather.temperatureC)}°C · ${weather.condition}` : loading ? "Loading weather…" : "Weather Unavailable"}
        </div>
        <div className="mt-0.5 truncate text-[8px] leading-3 text-white/42">
          {available
            ? `Feels ${Math.round(weather.feelsLikeC)}° · H ${Math.round(weather.humidityPercent)}% · W ${Math.round(weather.windSpeedKmh)} km/h`
            : `Last update: ${formatWeatherTime(updatedAt, timezone)}`}
        </div>
        {available && <div className="truncate text-[8px] leading-3 text-white/35">Updated {formatWeatherTime(updatedAt, timezone)}</div>}
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh weather"
        title="Refresh weather"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-black/20 text-white/50 transition hover:border-amber-200/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60 disabled:cursor-wait disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

type StatusTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "emerald" | "red" | "amber";
};

function StatusTile({ icon: Icon, label, value, tone }: StatusTileProps) {
  const toneClass = {
    emerald: "bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.75)]",
    red: "bg-red-300 shadow-[0_0_16px_rgba(252,165,165,0.75)]",
    amber: "bg-amber-200 shadow-[0_0_16px_rgba(253,230,138,0.7)]",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group flex min-h-[44px] min-w-[112px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-white/[0.075] hover:shadow-[0_0_24px_rgba(248,113,113,0.15)]"
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/35 text-red-100 transition-all duration-300 group-hover:border-red-200/35 group-hover:text-white">
        <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${toneClass}`} />
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[8px] font-semibold uppercase tracking-[0.13em] text-white/42">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[11px] font-semibold leading-3 text-white/84">
          {value}
        </div>
      </div>
    </motion.div>
  );
}
