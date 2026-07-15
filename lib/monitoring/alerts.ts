/**
 * TASK-60 — Alert rule engine.
 *
 * Pure functions: take a MonitoringSnapshot + external services and emit alerts.
 * Severity: critical | warning | info. No external side-effects here
 * (the page/API decides whether to persist/notify).
 */
import type { MonitoringSnapshot } from "./health";
import type { ExternalService } from "./services";

export type Severity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  at: string;
}

export function evaluateAlerts(
  snap: MonitoringSnapshot,
  externals: ExternalService[],
): Alert[] {
  const alerts: Alert[] = [];
  const t = snap.generatedAt;

  // --- Infrastructure ---
  for (const s of snap.services) {
    if (s.status === "error") {
      alerts.push({ id: `crit-${s.key}`, severity: "critical", title: `${s.label} down`, detail: s.detail, at: t });
    } else if (s.status === "warning") {
      alerts.push({ id: `warn-${s.key}`, severity: "warning", title: `${s.label} degraded`, detail: s.detail, at: t });
    }
  }

  // --- Queue ---
  if (snap.queue) {
    if (snap.queue.totals.failed > 0) {
      alerts.push({ id: "queue-failed", severity: "warning", title: "Failed jobs present", detail: `${snap.queue.totals.failed} job(s) in dead-letter`, at: t });
    }
  } else {
    alerts.push({ id: "queue-off", severity: "info", title: "BullMQ disabled", detail: "Redis not configured — running on DB fallback queue.", at: t });
  }

  // --- External APIs ---
  for (const e of externals) {
    if (e.configured && e.connected === false) {
      alerts.push({ id: `ext-${e.key}`, severity: "warning", title: `${e.label} never synced`, detail: e.note, at: t });
    }
  }

  // --- Resource pressure (synthetic from real process stats) ---
  const memMb = snap.system.memoryMb;
  if (memMb > 1500) alerts.push({ id: "mem-high", severity: "warning", title: "High memory", detail: `${memMb} MB RSS`, at: t });
  const load = snap.system.cpuLoad[0] ?? 0;
  if (load > 4) alerts.push({ id: "cpu-high", severity: "warning", title: "High CPU load", detail: `loadavg ${load.toFixed(2)}`, at: t });

  // --- Auth ---
  if (snap.counts.failedJobs > 50) alerts.push({ id: "failjobs", severity: "warning", title: "Background worker backlog", detail: `${snap.counts.failedJobs} failed jobs`, at: t });

  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
}
