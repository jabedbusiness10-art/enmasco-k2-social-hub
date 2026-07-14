// ===========================================================================
// TASK-51 — lib/analytics/health.ts
// Enterprise Platform Health Engine. Produces a 0-100 score from the
// real fetch results (token health, API health, sync recency, etc).
// Never fabricates — score reflects actual integration state.
// ===========================================================================

import type { HealthComponent, HealthSnapshot, HealthStatus, PlatformFetchResult } from "./types";

function statusFromScore(score: number): HealthStatus {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 40) return "warning";
  return "critical";
}

function ageMinutes(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((Date.now() - t) / 60000));
}

export function computeHealth(platforms: PlatformFetchResult[]): HealthSnapshot {
  const components: HealthComponent[] = [];

  // Per-platform API health
  for (const p of platforms) {
    let score = 0;
    let detail = "";
    if (!p.available) {
      score = 0;
      detail = "No integration / credentials";
    } else if (!p.connected) {
      score = 25;
      detail = p.error ? `API error: ${p.error}` : "Disconnected";
    } else {
      const mins = ageMinutes(p.lastSync);
      if (mins === null) {
        score = 80;
        detail = "Connected";
      } else if (mins <= 5) {
        score = 100;
        detail = `Synced ${mins}m ago`;
      } else if (mins <= 30) {
        score = 85;
        detail = `Synced ${mins}m ago`;
      } else if (mins <= 120) {
        score = 65;
        detail = `Stale — ${mins}m ago`;
      } else {
        score = 40;
        detail = `Very stale — ${mins}m ago`;
      }
    }
    components.push({
      key: `platform:${p.platform}`,
      label: `${p.label} API`,
      status: statusFromScore(score),
      detail,
      score,
    });
  }

  // Overall = average of available platform scores (or critical if none available)
  const scored = components.filter((c) => c.score > 0);
  const overall = scored.length
    ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length)
    : 0;

  return {
    overall,
    status: statusFromScore(overall),
    components,
    generatedAt: new Date().toISOString(),
  };
}
