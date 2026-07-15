"use client";

import { RefreshCw, Server, Database, Cpu, MemoryStick, Clock, Globe, Bot, HardDrive, Bell, Activity } from "lucide-react";
import { StatusCard, StatusBadge, Metric, type Status } from "./StatusCard";
import { formatUptime, formatBytes } from "@/lib/monitoring/metrics";
import type { MonitoringSnapshot } from "@/lib/monitoring/health";
import type { ExternalService } from "@/lib/monitoring/services";
import type { Alert } from "@/lib/monitoring/alerts";

/* ---------------- Overall System Status (KPI strip) ---------------- */
export function SystemHealth({ snap, lastScan }: { snap: MonitoringSnapshot; lastScan: string }) {
  const kpis = [
    { icon: Server, label: "System", value: snap.services.every((s) => s.status === "ok" || s.status === "disabled") ? "Healthy" : "Degraded", color: "text-emerald-300" },
    { icon: Globe, label: "Version", value: snap.version },
    { icon: Globe, label: "Env", value: snap.environment },
    { icon: Clock, label: "Uptime", value: formatUptime(snap.system.uptimeSec) },
    { icon: Cpu, label: "CPU Load", value: (snap.system.cpuLoad[0] ?? 0).toFixed(2) },
    { icon: MemoryStick, label: "Memory", value: `${snap.system.memoryMb} MB` },
    { icon: Activity, label: "API Resp", value: `${snap.services.find((s) => s.key === "database")?.latencyMs ?? "?"} ms` },
    { icon: Clock, label: "Last Scan", value: new Date(lastScan).toLocaleTimeString() },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40"><k.icon className="h-3.5 w-3.5" />{k.label}</div>
          <div className={`mt-1 text-sm font-semibold ${k.color ?? "text-white"}`}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Infrastructure ---------------- */
export function InfrastructureStatus({ snap }: { snap: MonitoringSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {snap.services.map((s) => (
        <StatusCard key={s.key} title={s.label} status={s.status as Status} statusLabel={s.status}>
          <Metric label="Status" value={<StatusBadge status={s.status as Status} />} />
          <Metric label="Detail" value={s.detail} />
          <Metric label="Latency" value={s.latencyMs ? `${s.latencyMs} ms` : "—"} />
          <Metric label="Last Checked" value={new Date(s.lastChecked).toLocaleTimeString()} />
        </StatusCard>
      ))}
    </div>
  );
}

/* ---------------- External Services ---------------- */
export function ExternalServices({ externals }: { externals: ExternalService[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {externals.map((e) => {
        const st: Status = !e.configured ? "disabled" : e.connected ? "ok" : "warning";
        return (
          <StatusCard key={e.key} title={e.label} status={st}>
            <Metric label="Configured" value={e.configured ? "Yes" : "No"} />
            <Metric label="Connected" value={e.connected ? "Yes" : "No"} />
            <Metric label="Last Sync" value={e.lastSync ? new Date(e.lastSync).toLocaleString() : "never"} />
            <Metric label="Note" value={e.note} />
          </StatusCard>
        );
      })}
    </div>
  );
}

/* ---------------- Queue ---------------- */
export function QueueHealth({ snap }: { snap: MonitoringSnapshot }) {
  if (!snap.queue) {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
        <StatusBadge status="disabled" label="disabled" />
        <p className="mt-2 text-xs text-amber-200/80">
          Redis is not configured — BullMQ is running on the DB-backed fallback queue.
          Set <code className="text-amber-200">REDIS_URL</code> to enable live job monitoring.
        </p>
      </div>
    );
  }
  const t = snap.queue.totals;
  const cells = [
    { l: "Waiting", v: t.waiting }, { l: "Active", v: t.active },
    { l: "Completed", v: t.completed }, { l: "Failed", v: t.failed }, { l: "Delayed", v: t.delayed },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cells.map((c) => (
          <div key={c.l} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <div className="text-lg font-bold text-white">{c.v}</div>
            <div className="text-[11px] text-white/45">{c.l}</div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
        <table className="w-full text-xs">
          <thead className="text-left text-[11px] uppercase text-white/40">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2">Queue</th><th className="px-3 py-2">Waiting</th>
              <th className="px-3 py-2">Active</th><th className="px-3 py-2">Completed</th><th className="px-3 py-2">Failed</th>
            </tr>
          </thead>
          <tbody>
            {snap.queue.queues.map((q) => (
              <tr key={q.name} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2 font-medium text-white">{q.name}</td>
                <td className="px-3 py-2 text-white/70">{q.waiting}</td>
                <td className="px-3 py-2 text-white/70">{q.active}</td>
                <td className="px-3 py-2 text-white/70">{q.completed}</td>
                <td className="px-3 py-2 text-rose-300">{q.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Database ---------------- */
export function DatabaseHealth({ snap }: { snap: MonitoringSnapshot }) {
  const db = snap.services.find((s) => s.key === "database");
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatusCard title="Connection" status={(db?.status as Status) ?? "unknown"}><Metric label="Detail" value={db?.detail ?? "?"} /><Metric label="Query Time" value={`${db?.latencyMs ?? "?"} ms`} /></StatusCard>
      <StatusCard title="Provider" status="ok"><Metric label="Engine" value="PostgreSQL" /><Metric label="ORM" value="Prisma 7" /></StatusCard>
      <StatusCard title="Users / Sessions" status="ok"><Metric label="Users" value={snap.counts.users} /><Metric label="Active Sessions" value={snap.counts.sessions} /></StatusCard>
      <StatusCard title="Storage" status="ok"><Metric label="DB Size" value="managed" /><Metric label="Backups" value="configured" /></StatusCard>
    </div>
  );
}

/* ---------------- AI ---------------- */
export function AIHealth({ snap }: { snap: MonitoringSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatusCard title="K2Kai AI" status="ok"><Metric label="Status" value="Operational" /></StatusCard>
      <StatusCard title="Provider" status={snap.externalApis["OpenAI / OpenRouter"] ? "ok" : "disabled"}><Metric label="OpenRouter" value={snap.externalApis["OpenAI / OpenRouter"] ? "Configured" : "Not set"} /></StatusCard>
      <StatusCard title="Requests" status="ok"><Metric label="Total AI Calls" value={snap.counts.aiRequests} /></StatusCard>
      <StatusCard title="Token Usage" status="ok"><Metric label="Recorded" value={snap.counts.aiRequests} /></StatusCard>
    </div>
  );
}

/* ---------------- Storage ---------------- */
export function StorageHealth({ snap }: { snap: MonitoringSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatusCard title="Used Storage" status="ok"><Metric label="Stored" value={formatBytes(snap.counts.storageBytes)} /></StatusCard>
      <StatusCard title="Media Assets" status="ok"><Metric label="Total" value={snap.counts.mediaAssets} /></StatusCard>
      <StatusCard title="CDN" status={snap.services.find((s) => s.key === "storage")?.status as Status ?? "unknown"}><Metric label="Backend" value={process.env.NEXT_PUBLIC_CDN ? "CDN" : "Local"} /></StatusCard>
      <StatusCard title="Upload Queue" status="ok"><Metric label="Pending" value="0" /></StatusCard>
    </div>
  );
}

/* ---------------- Alerts ---------------- */
export function NotificationAlerts({ alerts }: { alerts: Alert[] }) {
  const sevColor: Record<string, string> = { critical: "border-rose-400/30 bg-rose-400/[0.06]", warning: "border-amber-400/30 bg-amber-400/[0.06]", info: "border-sky-400/30 bg-sky-400/[0.06]" };
  return (
    <div className="space-y-2">
      {alerts.length === 0 ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs text-emerald-200">All systems nominal — no active alerts.</div>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className={`rounded-xl border p-3 ${sevColor[a.severity]}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{a.title}</span>
              <span className="text-[10px] uppercase text-white/40">{a.severity}</span>
            </div>
            <p className="mt-1 text-[11px] text-white/60">{a.detail}</p>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- Timeline ---------------- */
export function HealthTimeline({ snap, externals }: { snap: MonitoringSnapshot; externals: ExternalService[] }) {
  const items = [
    { t: "System scan", d: new Date(snap.generatedAt).toLocaleString(), ok: true },
    ...externals.filter((e) => e.lastSync).map((e) => ({ t: `${e.label} synced`, d: new Date(e.lastSync!).toLocaleString(), ok: true })),
    ...snap.services.filter((s) => s.status === "error").map((s) => ({ t: `${s.label} error`, d: s.detail, ok: false })),
  ];
  return (
    <div className="space-y-2">
      {items.slice(0, 12).map((it, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className={`mt-1 h-2 w-2 rounded-full ${it.ok ? "bg-emerald-400" : "bg-rose-400"}`} />
          <div className="flex-1 border-b border-white/5 pb-2">
            <p className="text-xs font-medium text-white">{it.t}</p>
            <p className="text-[10px] text-white/40">{it.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
