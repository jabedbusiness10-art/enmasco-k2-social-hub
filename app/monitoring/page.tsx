"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { SystemHealth, InfrastructureStatus, ExternalServices, QueueHealth, DatabaseHealth, AIHealth, StorageHealth, NotificationAlerts, HealthTimeline } from "@/components/monitoring/sections";
import LogsViewer from "@/components/monitoring/LogsViewer";
import { Skeleton } from "@/components/monitoring/StatusCard";
import type { MonitoringSnapshot } from "@/lib/monitoring/health";
import type { ExternalService } from "@/lib/monitoring/services";
import type { Alert } from "@/lib/monitoring/alerts";

interface Payload { snapshot: MonitoringSnapshot; externals: ExternalService[]; alerts: Alert[]; generatedAt: string; }

export default function MonitoringPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (res.status === 401) { setError("Admin access required to view monitoring."); setLoading(false); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring & Health"
        description="Enterprise operational command center — infrastructure, queues, external APIs and alerts."
        actions={
          <div className="flex items-center gap-3">
            {data && <span className="text-xs text-white/40">Scan {new Date(data.generatedAt).toLocaleTimeString()}</span>}
            <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        }
      />

      {error && !data && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/[0.06] p-4 text-sm text-rose-200">{error}</div>
      )}

      {loading && !data ? (
        <div className="space-y-4">
          <Skeleton h="h-20" />
          <Skeleton h="h-40" />
          <Skeleton h="h-40" />
        </div>
      ) : data ? (
        <>
          <Section title="Overall System Status"><SystemHealth snap={data.snapshot} lastScan={data.generatedAt} /></Section>
          <Section title="Infrastructure Health"><InfrastructureStatus snap={data.snapshot} /></Section>
          <Section title="External Services"><ExternalServices externals={data.externals} /></Section>
          <Section title="Queue Monitoring"><QueueHealth snap={data.snapshot} /></Section>
          <Section title="Database"><DatabaseHealth snap={data.snapshot} /></Section>
          <Section title="AI Services"><AIHealth snap={data.snapshot} /></Section>
          <Section title="Storage"><StorageHealth snap={data.snapshot} /></Section>
          <Section title="Authentication">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Mini label="Active Users" value={data.snapshot.counts.users} />
              <Mini label="Sessions" value={data.snapshot.counts.sessions} />
              <Mini label="Failed Jobs" value={data.snapshot.counts.failedJobs} />
              <Mini label="NextAuth" value="Operational" />
            </div>
          </Section>
          <Section title="Notifications & Alerts"><NotificationAlerts alerts={data.alerts} /></Section>
          <Section title="Logs Viewer"><LogsViewer /></Section>
          <Section title="Health Timeline"><HealthTimeline snap={data.snapshot} externals={data.externals} /></Section>
        </>
      ) : (
        <EmptyState title="No monitoring data" description="Could not load the operational snapshot." />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      {children}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] text-white/40">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
    </div>
  );
}
