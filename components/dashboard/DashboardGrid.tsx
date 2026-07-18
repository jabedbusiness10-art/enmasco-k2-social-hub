"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Network,
  CalendarClock,
  HeartPulse,
  Inbox,
  Users,
  Bot,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

/* ------------------------------------------------------------------ */
/* Module links (unchanged navigation)                                */
/* ------------------------------------------------------------------ */
type ModuleLink = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  accent: string;
};

const modules: ModuleLink[] = [
  { icon: Network, title: "Social", desc: "Accounts, publishing & engagement", href: "/dashboard/social", accent: "text-sky-300" },
  { icon: CalendarClock, title: "Publishing Scheduler", desc: "Plan & schedule posts", href: "/dashboard/social/publisher", accent: "text-sky-300" },
  { icon: HeartPulse, title: "Engagement Monitor", desc: "Reactions & insights", href: "/dashboard/social/engagement", accent: "text-red-300" },
  { icon: Inbox, title: "Unified Inbox", desc: "All conversations in one place", href: "/dashboard/inbox/unified", accent: "text-sky-300" },
  { icon: Users, title: "Team", desc: "Members & permissions", href: "/dashboard/team/members", accent: "text-sky-300" },
  { icon: Bot, title: "AI & Automation", desc: "Studio & workflows", href: "/dashboard/ai", accent: "text-sky-300" },
  { icon: BarChart3, title: "Insights", desc: "Analytics & reports", href: "/dashboard/insights/analytics", accent: "text-sky-300" },
  { icon: ShieldCheck, title: "Administration", desc: "Settings & security", href: "/dashboard/admin", accent: "text-sky-300" },
];

/* ------------------------------------------------------------------ */
/* Lightweight data fetchers (real endpoints only — no fabricated data)*/
/* ------------------------------------------------------------------ */
async function getJSON(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

type WidgetState<T> = { status: "loading" | "ready" | "empty" | "error"; data?: T };

function useFetch<T>(url: string, map: (raw: any) => T | null) {
  const [state, setState] = useState<WidgetState<T>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    getJSON(url)
      .then((raw) => {
        if (!alive) return;
        const mapped = map(raw);
        setState(mapped ? { status: "ready", data: mapped } : { status: "empty" });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

/* ------------------------------------------------------------------ */
/* Shared widget primitives                                            */
/* ------------------------------------------------------------------ */
function WidgetCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={`flex flex-col p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
          <Icon className="h-4 w-4 text-sky-200" strokeWidth={1.8} />
        </span>
        <h4 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/70">
          {title}
        </h4>
      </div>
      <div className="flex-1">{children}</div>
    </GlassCard>
  );
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
      ))}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-white/40">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Widgets                                                             */
/* ------------------------------------------------------------------ */

function RecentActivityWidget() {
  const state = useFetch<{ text: string; time: string; tone: string }[]>(
    "/api/activity",
    (raw) => {
      const items = raw?.items ?? [];
      if (!Array.isArray(items) || items.length === 0) return null;
      return items.slice(0, 6).map((it: any) => ({
        text: it.title ?? it.text ?? it.message ?? "Activity",
        time: it.timeAgo ?? it.time ?? "",
        tone: it.tone ?? "neutral",
      }));
    },
  );

  return (
    <WidgetCard title="Recent Activity" icon={CalendarClock}>
      {state.status === "loading" && <Skeleton rows={5} />}
      {state.status === "error" && <EmptyNote>Activity feed unavailable.</EmptyNote>}
      {(state.status === "empty" || (state.status === "ready" && state.data!.length === 0)) && (
        <EmptyNote>No recent activity yet.</EmptyNote>
      )}
      {state.status === "ready" && state.data!.length > 0 && (
        <ul className="space-y-3">
          {state.data!.map((a, i) => (
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
    </WidgetCard>
  );
}

function PlatformStatusWidget() {
  const state = useFetch<{ name: string; connected: boolean }[]>(
    "/api/social/accounts",
    (raw) => {
      const accounts = raw?.accounts ?? [];
      if (!Array.isArray(accounts)) return null;
      const known = ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Website"];
      const connected = new Set(accounts.map((a: any) => (a.platform ?? a.provider ?? "").toLowerCase()));
      return known.map((name) => ({
        name,
        connected: connected.has(name.toLowerCase()),
      }));
    },
  );

  const rows = state.data ?? [
    { name: "Facebook", connected: false },
    { name: "Instagram", connected: false },
    { name: "LinkedIn", connected: false },
    { name: "YouTube", connected: false },
    { name: "TikTok", connected: false },
    { name: "Website", connected: false },
  ];

  return (
    <WidgetCard title="Platform Status" icon={Network}>
      {state.status === "loading" && <Skeleton rows={6} />}
      {state.status === "error" && <EmptyNote>Platform status unavailable.</EmptyNote>}
      {state.status !== "loading" && (
        <ul className="space-y-2.5">
          {rows.map((p) => (
            <li key={p.name} className="flex items-center justify-between">
              <span className="text-sm text-white/75">{p.name}</span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  p.connected
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/[0.05] text-white/45"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    p.connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-white/30"
                  }`}
                />
                {p.connected ? "Connected" : "Disconnected"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

function AiInsightsWidget() {
  const state = useFetch<{ title: string; detail?: string }[]>(
    "/api/intelligence",
    (raw) => {
      const insights = raw?.insights ?? raw?.items ?? [];
      if (!Array.isArray(insights) || insights.length === 0) return null;
      return insights.slice(0, 4).map((it: any) => ({
        title: it.title ?? it.text ?? "Insight",
        detail: it.detail ?? it.description,
      }));
    },
  );

  return (
    <WidgetCard title="AI Insights" icon={Bot}>
      {state.status === "loading" && <Skeleton rows={4} />}
      {(state.status === "empty" || state.status === "error") && (
        <EmptyNote>No AI insights available yet.</EmptyNote>
      )}
      {state.status === "ready" && state.data!.length > 0 && (
        <ul className="space-y-3">
          {state.data!.map((ins, i) => (
            <li key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <p className="text-sm text-white/80">{ins.title}</p>
              {ins.detail && <p className="mt-1 text-[11px] text-white/45">{ins.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

function StorageWidget() {
  const state = useFetch<{ usedMb: number; count: number }>(
    "/api/media",
    (raw) => {
      const items = raw?.items ?? raw?.assets ?? raw?.media ?? [];
      if (!Array.isArray(items)) return null;
      const usedMb = Math.round(
        items.reduce((sum: number, m: any) => sum + (m.sizeBytes ?? m.size ?? 0), 0) / 1024 / 1024,
      );
      return { usedMb, count: items.length };
    },
  );

  return (
    <WidgetCard title="Storage Usage" icon={Inbox}>
      {state.status === "loading" && <Skeleton rows={3} />}
      {state.status === "error" && <EmptyNote>Storage data unavailable.</EmptyNote>}
      {(state.status === "empty" || (state.status === "ready" && state.data!.count === 0)) && (
        <EmptyNote>No media stored yet.</EmptyNote>
      )}
      {state.status === "ready" && state.data!.count > 0 && (
        <div className="space-y-3">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white/90">{state.data!.usedMb} MB</span>
              <span className="text-xs text-white/45">{state.data!.count} files</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500/70 to-sky-300/70"
                style={{ width: `${Math.min(100, (state.data!.usedMb / 1024) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-white/40">Media Library · Documents · Backups · Queue Cache</p>
        </div>
      )}
    </WidgetCard>
  );
}

function ServerHealthWidget() {
  const state = useFetch<{ services: { label: string; status: string }[]; uptimeSec: number; memoryMb: number }>(
    "/api/system",
    (raw) => {
      const services = raw?.services ?? [];
      if (!Array.isArray(services)) return null;
      return {
        services: services.map((s: any) => ({ label: s.label, status: s.status })),
        uptimeSec: raw?.server?.uptimeSec ?? 0,
        memoryMb: raw?.server?.memoryMb ?? 0,
      };
    },
  );

  const statusColor = (s: string) =>
    s === "ok"
      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
      : s === "warning"
        ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
        : s === "disabled"
          ? "bg-white/30"
          : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]";

  return (
    <WidgetCard title="Server Health" icon={ShieldCheck}>
      {state.status === "loading" && <Skeleton rows={5} />}
      {state.status === "error" && <EmptyNote>Health data unavailable.</EmptyNote>}
      {state.status === "ready" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="text-lg font-bold text-white/90">
                {Math.floor(state.data!.uptimeSec / 86400)}d
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Uptime</div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="text-lg font-bold text-white/90">{state.data!.memoryMb}MB</div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">RAM</div>
            </div>
          </div>
          <ul className="space-y-2">
            {state.data!.services.slice(0, 5).map((svc, i) => (
              <li key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/70">{svc.label}</span>
                <span className={`h-2 w-2 rounded-full ${statusColor(svc.status)}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </WidgetCard>
  );
}

function AuditLogWidget() {
  const state = useFetch<{ text: string; time: string }[]>(
    "/api/security/audit",
    (raw) => {
      const items = raw?.items ?? raw?.logs ?? [];
      if (!Array.isArray(items) || items.length === 0) return null;
      return items.slice(0, 5).map((it: any) => ({
        text: it.action ?? it.message ?? "Audit event",
        time: it.createdAt ?? it.time ?? "",
      }));
    },
  );

  return (
    <WidgetCard title="Audit Logs" icon={Users}>
      {state.status === "loading" && <Skeleton rows={5} />}
      {(state.status === "empty" || state.status === "error") && (
        <EmptyNote>No audit events recorded.</EmptyNote>
      )}
      {state.status === "ready" && state.data!.length > 0 && (
        <ul className="space-y-2.5">
          {state.data!.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span className="truncate text-xs text-white/70">{a.text}</span>
              {a.time && <span className="shrink-0 text-[10px] text-white/35">{a.time}</span>}
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

/* ------------------------------------------------------------------ */
/* Page composition                                                    */
/* ------------------------------------------------------------------ */
export default function DashboardGrid() {
  return (
    <div className="space-y-8">
      {/* MODULES */}
      <GlassCard className="p-5 sm:p-6">
        <div className="mb-[18px] mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Modules</h3>
          <p className="mt-1.5 text-xs text-white/40">
            Manage all enterprise social operations from one place.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={m.href}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-sky-400/40 hover:shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                    <Icon className={`h-5 w-5 ${m.accent}`} strokeWidth={1.8} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{m.title}</span>
                    <span className="mt-0.5 text-xs text-white/50">{m.desc}</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* ENTERPRISE WIDGETS — responsive 3 / 2 / 1 columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <RecentActivityWidget />
        <PlatformStatusWidget />
        <AiInsightsWidget />
        <StorageWidget />
        <ServerHealthWidget />
        <AuditLogWidget />
      </div>
    </div>
  );
}
