import { env } from "@/config/env";

const CACHE_TTL_MS = 10 * 60 * 1000;
const PROVIDER_TIMEOUT_MS = 8_000;

export type WeatherIconName = "sun" | "cloud-sun" | "cloud" | "fog" | "rain" | "snow" | "storm";

export type WeatherSnapshot = {
  status: "ok";
  provider: "Open-Meteo";
  location: string;
  timezone: string;
  temperatureC: number;
  condition: string;
  icon: WeatherIconName;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  updatedAt: string;
  observedAt: string;
  cached: boolean;
};

export type WeatherUnavailable = {
  status: "unavailable";
  location: string;
  timezone: string;
  message: "Weather Unavailable";
  lastSuccessfulUpdate: string | null;
};

export type WeatherResult = WeatherSnapshot | WeatherUnavailable;

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

let cachedWeather: WeatherSnapshot | null = null;
let cacheExpiresAt = 0;
let requestInFlight: Promise<WeatherResult> | null = null;

function configuredCoordinate(value: string, label: string, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be a number between ${min} and ${max}`);
  }
  return parsed;
}

export function weatherCodeMeta(code: number): { condition: string; icon: WeatherIconName } {
  if (code === 0) return { condition: "Clear", icon: "sun" };
  if (code === 1 || code === 2) return { condition: "Partly Cloudy", icon: "cloud-sun" };
  if (code === 3) return { condition: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { condition: "Fog", icon: "fog" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { condition: "Rain", icon: "rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { condition: "Snow", icon: "snow" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: "storm" };
  return { condition: "Unknown", icon: "cloud" };
}

function requiredNumber(value: number | undefined, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Weather provider omitted ${field}`);
  }
  return value;
}

async function requestWeather(): Promise<WeatherResult> {
  try {
    const latitude = configuredCoordinate(env.weather.latitude, "WEATHER_LATITUDE", -90, 90);
    const longitude = configuredCoordinate(env.weather.longitude, "WEATHER_LONGITUDE", -180, 180);
    const query = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      timezone: env.weather.timezone,
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);

    const payload = await response.json() as OpenMeteoResponse;
    const current = payload.current;
    if (!current?.time) throw new Error("Weather provider omitted observation time");
    const meta = weatherCodeMeta(requiredNumber(current.weather_code, "weather_code"));
    const snapshot: WeatherSnapshot = {
      status: "ok",
      provider: "Open-Meteo",
      location: env.weather.location,
      timezone: env.weather.timezone,
      temperatureC: requiredNumber(current.temperature_2m, "temperature_2m"),
      condition: meta.condition,
      icon: meta.icon,
      feelsLikeC: requiredNumber(current.apparent_temperature, "apparent_temperature"),
      humidityPercent: requiredNumber(current.relative_humidity_2m, "relative_humidity_2m"),
      windSpeedKmh: requiredNumber(current.wind_speed_10m, "wind_speed_10m"),
      updatedAt: new Date().toISOString(),
      observedAt: current.time,
      cached: false,
    };
    cachedWeather = snapshot;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return snapshot;
  } catch {
    return {
      status: "unavailable",
      location: env.weather.location,
      timezone: env.weather.timezone,
      message: "Weather Unavailable",
      lastSuccessfulUpdate: cachedWeather?.updatedAt ?? null,
    };
  }
}

export async function getCurrentWeather(forceRefresh = false): Promise<WeatherResult> {
  if (!forceRefresh && cachedWeather && Date.now() < cacheExpiresAt) {
    return { ...cachedWeather, cached: true };
  }
  if (!forceRefresh && requestInFlight) return requestInFlight;

  requestInFlight = requestWeather();
  try {
    return await requestInFlight;
  } finally {
    requestInFlight = null;
  }
}

export function resetWeatherCacheForTests() {
  cachedWeather = null;
  cacheExpiresAt = 0;
  requestInFlight = null;
}
