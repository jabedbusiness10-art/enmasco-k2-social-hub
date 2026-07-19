"use client";

import { useCallback, useEffect, useState } from "react";
import { Info, Layers, RefreshCw } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import QueueHealth from "@/components/queue/QueueHealth";
import QueueMetrics from "@/components/queue/QueueMetrics";
import LiveActivity from "@/components/queue/LiveActivity";
import FailedJobs from "@/components/queue/FailedJobs";
import QueueControls from "@/components/queue/QueueControls";

interface Metrics {
  available: boolean;
  reason?: string;
  redis?: any;
  queues?: any[];
  totals?: any;
  events?: any[];
  generatedAt?: string;
}
interface Health {
  available: boolean;
  configured: boolean;
  redisConnected: boolean;
  engine: string;
  reason?: string;
}

export default function QueueDashboard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [failed, setFailed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const [h, m, f] = await Promise.all([
        fetch("/api/queue/health", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/queue/metrics", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/queue/failed", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ jobs: [] })),
      ]);
      setHealth(h);
      setMetrics(m);
      setFailed(f.jobs ?? []);
      setError(null);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load queue data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000); // 10s auto-refresh
    return () => clearInterval(t);
  }, [load]);

  async function control(action: "pause" | "resume" | "retry" | "clean") {
    const map = {
      pause: "/api/queue/pause",
      resume: "/api/queue/resume",
      retry: "/api/queue/retry",
      clean: "/api/queue/clean",
    };
    await fetch(map[action], { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await load();
  }

  const available = metrics?.available ?? false;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Enterprise Queue Engine"
        description="Centralized background processing with a built-in database queue and optional BullMQ acceleration."
        actions={
          <div className="flex items-center gap-3">
            {lastSync && <span className="text-xs text-white/40">Synced {lastSync}</span>}
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {loading && !health ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <QueueHealth health={health} />

          {!available && (
            <div className="flex items-start gap-3 rounded-2xl border border-sky-400/20 bg-sky-400/[0.055] px-4 py-3 text-xs leading-relaxed text-sky-100/80">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
              <div>
                <p className="font-medium text-sky-100">The platform is running normally using the built-in database queue.</p>
                <p className="mt-1 text-white/50">
                  Redis is recommended only for production environments or high-volume background processing.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="h-4 w-4 text-sky-400" /> Queue Metrics
            </div>
            <QueueControls onAction={control} available={available} />
          </div>

          {available ? (
            <QueueMetrics data={metrics} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-8 text-center">
              <Layers className="mx-auto h-5 w-5 text-white/25" />
              <p className="mt-2 text-xs font-medium text-white/55">Live BullMQ metrics are currently disabled.</p>
              <p className="mt-1 text-[11px] text-white/35">No Redis metrics are displayed while the database queue is active.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LiveActivity events={metrics?.events ?? []} />
            <FailedJobs jobs={failed} />
          </div>
        </>
      )}
    </div>
  );
}
