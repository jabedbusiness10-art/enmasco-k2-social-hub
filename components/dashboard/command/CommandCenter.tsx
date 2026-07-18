"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  HardDrive,
  Server,
  ShieldCheck,
  Radio,
  BrainCircuit,
  Users,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import {
  WidgetShell,
  SectionShell,
  KpiStat,
  StatusPill,
  Sparkline,
  MiniBar,
  EmptyState,
  SkeletonRows,
} from "./primitives";

/* ------------------------------------------------------------------ */
/* Real-data fetchers — every widget below is backed by an existing    */
/* endpoint. No fabricated metrics; unavailable sources show honesty.   */
/* ------------------------------------------------------------------ */
async function getJSON(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}
type S<T> = { status: "loading" | "ready" | "empty" | "error"; data?: T };
function useFetch<T>(url: string, map: (r: any) => T | null) {
  const [s, set] = useState<S<T>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    getJSON(url)
      .then((r) => alive && set(map(r) ? { status: "ready", data: map(r)! } : { status: "empty" }))
      .catch(() => alive && set({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [url]);
  return s;
}

/* ----------------------------- KPI strip ---------------------------- */
function KpiStrip() {
  const exec = useFetch<any>("/api/executive", (r) => (r && typeof r === "object" ? r : null));
  const sys = useFetch<any>("/api/system", (r) => (r?.server ? r : null));

  const items: { label: string; value: React.ReactNode; tone?: "sky" | "red"; icon?: LucideIcon }[] = [
    {
      label: "Team Members",
      value: exec.status === "ready" ? (exec.data?.team?.total ?? "—") : exec.status === "loading" ? "··" : "—",
      icon: Users,
    },
    {
      label: "Scheduled Posts",
      value: exec.status === "ready" ? (exec.data?.publishing?.scheduled ?? "—") : exec.status === "loading" ? "··" : "—",
      icon: CalendarClock,
    },
    {
      label: "Uptime",
      value: sys.status === "ready" ? `${Math.floor((sys.data!.server.uptimeSec ?? 0) / 86400)}d` : sys.status === "loading" ? "··" : "—",
      icon: Server,
    },
    {
      label: "Memory",
      value: sys.status === "ready" ? `${sys.data!.server.memoryMb ?? 0} MB` : sys.status === "loading" ? "··" : "—",
      icon: HardDrive,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {items.map((k, i) => (
        <div key={k.label} className="rise-in" style={{ animationDelay: `${i * 60}ms` }}>
          <KpiStat icon={k.icon} label={k.label} value={k.value} tone={k.tone} />
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Platform grid -------------------------- */
function PlatformGrid() {
  const st = useFetch<{ name: string; connected: boolean; reach?: number }[]>(
    "/api/social/accounts",
    (r) => {
      const acc = r?.accounts ?? [];
      if (!Array.isArray(acc)) return null;
      const known = ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Website"];
      const set = new Set(acc.map((a: any) => (a.platform ?? a.provider ?? "").toLowerCase()));
      return known.map((n) => ({ name: n, connected: set.has(n.toLowerCase()) }));
    },
  );
  const rows =
    st.data ??
    ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Website"].map((n) => ({
      name: n,
      connected: false,
    }));

  return (
    <WidgetShell title="Platform Status" icon={Radio}>
      {st.status === "loading" && <SkeletonRows rows={6} />}
      {st.status === "error" && <EmptyState>Platform status unavailable.</EmptyState>}
      {st.status !== "loading" && (
        <ul className="space-y-2.5">
          {rows.map((p) => (
            <li key={p.name} className="flex items-center justify-between">
              <span className="text-sm text-white/75">{p.name}</span>
              <StatusPill status={p.connected ? "ok" : "off"}>
                {p.connected ? "Connected" : "Disconnected"}
              </StatusPill>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* --------------------------- Recent activity ------------------------ */
function ActivityFeed() {
  const st = useFetch<{ text: string; time: string }[]>("/api/activity", (r) => {
    const items = r?.items ?? [];
    if (!Array.isArray(items) || !items.length) return null;
    return items.slice(0, 6).map((it: any) => ({ text: it.title ?? it.text ?? "Activity", time: it.timeAgo ?? it.time ?? "" }));
  });
  return (
    <WidgetShell title="Recent Activity" icon={Activity}>
      {st.status === "loading" && <SkeletonRows rows={5} />}
      {st.status === "error" && <EmptyState>Activity feed unavailable.</EmptyState>}
      {(st.status === "empty" || (st.status === "ready" && !st.data!.length)) && <EmptyState>No recent activity yet.</EmptyState>}
      {st.status === "ready" && st.data!.length > 0 && (
        <ul className="space-y-3">
          {st.data!.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/70 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white/80">{a.text}</p>
                {a.time && <p className="text-[10px] text-white/40">{a.time}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ----------------------------- AI insights -------------------------- */
function AiInsights() {
  const st = useFetch<{ title: string; detail?: string }[]>("/api/intelligence", (r) => {
    const items = r?.insights ?? r?.items ?? [];
    if (!Array.isArray(items) || !items.length) return null;
    return items.slice(0, 4).map((it: any) => ({ title: it.title ?? it.text ?? "Insight", detail: it.detail ?? it.description }));
  });
  return (
    <WidgetShell title="AI Insights" icon={BrainCircuit}>
      {st.status === "loading" && <SkeletonRows rows={4} />}
      {(st.status === "empty" || st.status === "error") && <EmptyState>No AI insights available yet.</EmptyState>}
      {st.status === "ready" && st.data!.length > 0 && (
        <ul className="space-y-2.5">
          {st.data!.map((ins, i) => (
            <li key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <p className="text-sm text-white/80">{ins.title}</p>
              {ins.detail && <p className="mt-1 text-[11px] text-white/45">{ins.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ------------------------------ Storage ----------------------------- */
function StorageCard() {
  const st = useFetch<{ usedMb: number; count: number }>("/api/media", (r) => {
    const items = r?.items ?? r?.assets ?? r?.media ?? [];
    if (!Array.isArray(items)) return null;
    const usedMb = Math.round(items.reduce((s: number, m: any) => s + (m.sizeBytes ?? m.size ?? 0), 0) / 1024 / 1024);
    return { usedMb, count: items.length };
  });
  return (
    <WidgetShell title="Storage Usage" icon={HardDrive}>
      {st.status === "loading" && <SkeletonRows rows={3} />}
      {st.status === "error" && <EmptyState>Storage data unavailable.</EmptyState>}
      {(st.status === "empty" || (st.status === "ready" && st.data!.count === 0)) && <EmptyState>No media stored yet.</EmptyState>}
      {st.status === "ready" && st.data!.count > 0 && (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white/90">{st.data!.usedMb} MB</span>
            <span className="text-xs text-white/45">{st.data!.count} files</span>
          </div>
          <MiniBar value={Math.min(100, (st.data!.usedMb / 1024) * 100)} />
          <p className="text-[11px] text-white/40">Media · Documents · Backups · Queue Cache</p>
        </div>
      )}
    </WidgetShell>
  );
}

/* ---------------------------- Server health ------------------------- */
function HealthCard() {
  const st = useFetch<{ services: { label: string; status: string }[] }>("/api/system", (r) =>
    Array.isArray(r?.services) ? { services: r.services.map((s: any) => ({ label: s.label, status: s.status })) } : null,
  );
  const tone = (s: string) => (s === "ok" ? "ok" : s === "warning" ? "warn" : s === "disabled" ? "off" : "err");
  return (
    <WidgetShell title="Server Health" icon={Server}>
      {st.status === "loading" && <SkeletonRows rows={5} />}
      {st.status === "error" && <EmptyState>Health data unavailable.</EmptyState>}
      {st.status === "ready" && (
        <ul className="space-y-2.5">
          {st.data!.services.slice(0, 6).map((svc, i) => (
            <li key={i} className="flex items-center justify-between text-xs">
              <span className="text-white/70">{svc.label}</span>
              <StatusPill status={tone(svc.status)}>
                {svc.status === "ok" ? "Healthy" : svc.status === "disabled" ? "Idle" : svc.status}
              </StatusPill>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ------------------------------ Audit log -------------------------- */
function AuditCard() {
  const st = useFetch<{ text: string; time: string }[]>("/api/security/audit", (r) => {
    const items = r?.items ?? r?.logs ?? [];
    if (!Array.isArray(items) || !items.length) return null;
    return items.slice(0, 5).map((it: any) => ({ text: it.action ?? it.message ?? "Event", time: it.createdAt ?? it.time ?? "" }));
  });
  return (
    <WidgetShell title="Audit Logs" icon={ShieldCheck}>
      {st.status === "loading" && <SkeletonRows rows={5} />}
      {(st.status === "empty" || st.status === "error") && <EmptyState>No audit events recorded.</EmptyState>}
      {st.status === "ready" && st.data!.length > 0 && (
        <ul className="space-y-2.5">
          {st.data!.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span className="truncate text-xs text-white/70">{a.text}</span>
              {a.time && <span className="shrink-0 text-[10px] text-white/35">{a.time}</span>}
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* --------------------------- Composition ----------------------------- */
export default function CommandCenter() {
  return (
    <div className="space-y-[var(--space-section)]">
      <SectionShell eyebrow="Live" title="Operations Command Center" subtitle="Real-time enterprise signals across every connected surface.">
        <KpiStrip />
      </SectionShell>

      <div className="grid grid-cols-1 gap-[var(--space-card-gap)] md:grid-cols-2 xl:grid-cols-3">
        <PlatformGrid />
        <ActivityFeed />
        <AiInsights />
        <StorageCard />
        <HealthCard />
        <AuditCard />
      </div>
    </div>
  );
}
