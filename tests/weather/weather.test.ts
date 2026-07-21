import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentWeather, resetWeatherCacheForTests, weatherCodeMeta } from "../../lib/weather/service";

const root = process.cwd();

function providerResponse(temperatureC: number) {
  return new Response(JSON.stringify({
    current: {
      time: "2026-07-19T18:00",
      temperature_2m: temperatureC,
      relative_humidity_2m: 18,
      apparent_temperature: temperatureC + 1,
      weather_code: 0,
      wind_speed_10m: 13.5,
    },
  }), { status: 200, headers: { "content-type": "application/json" } });
}

test("WMO weather codes map to honest conditions and icons", () => {
  assert.deepEqual(weatherCodeMeta(0), { condition: "Clear", icon: "sun" });
  assert.deepEqual(weatherCodeMeta(2), { condition: "Partly Cloudy", icon: "cloud-sun" });
  assert.deepEqual(weatherCodeMeta(45), { condition: "Fog", icon: "fog" });
  assert.deepEqual(weatherCodeMeta(63), { condition: "Rain", icon: "rain" });
  assert.deepEqual(weatherCodeMeta(75), { condition: "Snow", icon: "snow" });
  assert.deepEqual(weatherCodeMeta(95), { condition: "Thunderstorm", icon: "storm" });
});

test("weather service caches data, refreshes provider changes, and preserves last success on failure", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => providerResponse(calls++ === 0 ? 38 : 41);
    resetWeatherCacheForTests();

    const first = await getCurrentWeather();
    assert.equal(first.status, "ok");
    if (first.status !== "ok") return;
    assert.equal(first.temperatureC, 38);
    assert.equal(first.cached, false);

    const cached = await getCurrentWeather();
    assert.equal(cached.status, "ok");
    if (cached.status !== "ok") return;
    assert.equal(cached.temperatureC, 38);
    assert.equal(cached.cached, true);
    assert.equal(calls, 1);

    const refreshed = await getCurrentWeather(true);
    assert.equal(refreshed.status, "ok");
    if (refreshed.status !== "ok") return;
    assert.equal(refreshed.temperatureC, 41);
    assert.equal(calls, 2);

    globalThis.fetch = async () => { throw new Error("provider offline"); };
    const unavailable = await getCurrentWeather(true);
    assert.equal(unavailable.status, "unavailable");
    if (unavailable.status !== "unavailable") return;
    assert.equal(unavailable.message, "Weather Unavailable");
    assert.equal(unavailable.lastSuccessfulUpdate, refreshed.updatedAt);
  } finally {
    globalThis.fetch = originalFetch;
    resetWeatherCacheForTests();
  }
});

test("header has live, automatic, manual, and fallback weather UI with no placeholder value", async () => {
  const topBar = await readFile(path.join(root, "components/layout/TopBar.tsx"), "utf8");
  assert.ok(topBar.includes("/api/weather"));
  assert.ok(topBar.includes("WEATHER_REFRESH_MS = 10 * 60 * 1000"));
  assert.ok(topBar.includes("?refresh=1"));
  assert.ok(topBar.includes('aria-label="Refresh weather"'));
  assert.ok(topBar.includes("Weather Unavailable"));
  assert.equal(topBar.includes("39°C Sunny"), false);
});
