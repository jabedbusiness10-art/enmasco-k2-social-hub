"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Server, Cpu, MemoryStick, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_COLOR: Record<string, string> = {
  WAITING: "text-sky-300",
  ACTIVE: "text-amber-300",
  COMPLETED: "text-emerald-300",
  FAILED: "text-rose-300",
  DELAYED: "text-violet-300",
  PAUSED: "text-white/50",
  STALLED: "text-rose-300",
};

function RefreshBtn({ on }: { on: () => void }) {
  return (
    <button
      onClick={on}
      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
    >
      <RefreshCw className="h-4 w-4" /> Refresh
    </button>
  );
}

/* ============================ JOBS ============================ */
export function JobsView() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/queue/jobs?take=50", { cache: "no-store" });
      const j = await r.json();
      setJobs(j.jobs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader title="Queue Jobs" description="Real job audit records across all queues (durable store)." actions={<RefreshBtn on={load} />} />
      {loading && jobs.length === 0 ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs recorded yet" description="Jobs appear here once the queue processes background tasks." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
          <table className="w-full text-xs">
            <thead className="text-left text-[11px] uppercase text-white/40">
              <tr className="border-b border-white/10">
                <th className="px-3 py-2">Queue</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Priority</th>
                <th className="px-3 py-2">Retries</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Finished</th>
                <th className="px-3 py-2">Ms</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 font-medium text-white">{j.queue}</td>
                  <td className="px-3 py-2 text-white/70">{j.name}</td>
                  <td className={`px-3 py-2 font-medium ${STATUS_COLOR[j.status] ?? "text-white/70"}`}>{j.status}</td>
                  <td className="px-3 py-2 text-white/70">{j.priority}</td>
                  <td className="px-3 py-2 text-white/70">{j.attempts}/{j.maxAttempts}</td>
                  <td className="px-3 py-2 text-white/45">{new Date(j.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-white/45">{j.startedAt ? new Date(j.startedAt).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2 text-white/45">{j.finishedAt ? new Date(j.finishedAt).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2 text-white/45">{j.processingMs ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================ WORKERS ============================ */
export function WorkersView() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [heartbeats, setHeartbeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/queue/workers", { cache: "no-store" });
      const j = await r.json();
      setWorkers(j.workers ?? []);
      setHeartbeats(j.heartbeats ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const hbByWorker = new Map(heartbeats.map((h: any) => [h.workerId, h]));

  return (
    <div className="space-y-4">
      <PageHeader title="Workers" description="Background worker instances and their latest health signals." actions={<RefreshBtn on={load} />} />
      {loading && workers.length === 0 ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : workers.length === 0 ? (
        <EmptyState title="No workers registered yet" description="Workers register when the BullMQ engine boots (set REDIS_URL). On DB fallback, jobs run inline." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {workers.map((w) => {
            const hb = hbByWorker.get(w.id);
            return (
              <div key={w.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{w.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${w.status === "OFFLINE" ? "bg-rose-400/15 text-rose-300" : "bg-emerald-400/15 text-emerald-300"}`}>{w.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
                  <div className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-sky-400" /> Queue: {w.queue}</div>
                  <div className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-sky-400" /> Concurrency: {w.pid}</div>
                  <div className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-sky-400" /> CPU: {hb?.cpu ?? "—"}</div>
                  <div className="flex items-center gap-1.5"><MemoryStick className="h-3.5 w-3.5 text-sky-400" /> Mem: {hb?.memoryMb ?? "—"} MB</div>
                </div>
                <div className="mt-2 text-[10px] text-white/35">Last heartbeat: {hb ? new Date(hb.timestamp).toLocaleString() : "—"} · Processed: {w.jobsProcessed} · Failed: {w.jobsFailed}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================ QUEUE HEALTH ============================ */
export function HealthView() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const load = useCallback(async () => {
    const [h, m] = await Promise.all([
      fetch("/api/queue/health", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/queue/metrics", { cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
    ]);
    setHealth(h);
    setMetrics(m);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const rows = [
    { label: "Redis", ok: health?.redisConnected, detail: health?.configured ? (health.redisConnected ? "Connected" : "Down") : "Not configured" },
    { label: "BullMQ Engine", ok: health?.engine === "bullmq", detail: health?.engine ?? "—" },
    { label: "Scheduler", ok: health?.available, detail: "Repeatable jobs (15m token check, 30m sync)" },
    { label: "Dead Letter Queue", ok: true, detail: "Failed jobs retained for recovery" },
    { label: "Retry Queue", ok: true, detail: "Exponential backoff" },
    { label: "Delayed Queue", ok: true, detail: metrics?.totals?.delayed ?? 0 },
    { label: "Webhook Queue", ok: true, detail: "webhook:meta / instagram / linkedin" },
    { label: "Token Refresh Queue", ok: true, detail: "token:refresh / expiry-check" },
    { label: "Publishing Queue", ok: true, detail: "publish:facebook / instagram / linkedin" },
    { label: "AI Queue", ok: true, detail: "ai:reply / caption / translate / moderation" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Queue Health" description="Operational health of every queue subsystem." actions={<RefreshBtn on={load} />} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{r.label}</span>
              {r.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
            </div>
            <p className="mt-1 text-[11px] text-white/50">{r.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ FAILED ============================ */
export function FailedView() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/queue/failed", { cache: "no-store" });
      const j = await r.json();
      setJobs(j.jobs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader title="Failed Jobs" description="Recoverable failures from the durable audit store." actions={<RefreshBtn on={load} />} />
      {loading && jobs.length === 0 ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : jobs.length === 0 ? (
        <EmptyState title="No failed jobs" description="All systems nominal." />
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <div key={j.id} className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{j.name}</span>
                <span className="text-[10px] uppercase text-white/40">{j.queue}</span>
              </div>
              <p className="mt-1 truncate text-[11px] text-rose-300/80">{j.error}</p>
              <div className="mt-1 text-[10px] text-white/35">Attempts: {j.attempts} · {new Date(j.failedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
