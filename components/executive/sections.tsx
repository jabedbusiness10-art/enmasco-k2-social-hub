"use client";

import { Database, Bot, Users, Film, Layers, Radio, Sparkles, TrendingUp, Inbox } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

function Stat({ label, value, sub }: { label: string; value: string | number | null; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[11px] uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">{value ?? "—"}</div>
      {sub && <div className="text-[10px] text-white/40">{sub}</div>}
    </div>
  );
}

export function OverviewSection({ data }: { data: any }) {
  const o = data.overview ?? {};
  if (!o.available)
    return <EmptyState title="No analytics data yet" description="Connect a Facebook page to populate overview metrics." />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Stat label="Followers" value={o.followers} sub={o.growthPct != null ? `${o.growthPct}% growth` : undefined} />
      <Stat label="Reach" value={o.reach} />
      <Stat label="Engagement" value={o.engagement} />
      <Stat label="Messages" value={o.messages} />
      <Stat label="Posts" value={o.posts} />
    </div>
  );
}

export function PlatformSection({ data }: { data: any }) {
  const rows = data.platformIntel ?? [];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((p: any) => (
        <div key={p.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{p.label}</span>
            {p.available ? (
              <span className={`text-[10px] ${p.connected ? "text-emerald-300" : "text-amber-300"}`}>
                {p.connected ? "CONNECTED" : "NO DATA"}
              </span>
            ) : (
              <span className="text-[10px] text-rose-300">UNAVAILABLE</span>
            )}
          </div>
          {p.available && p.connected ? (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>Followers: <span className="text-white">{p.followers ?? "—"}</span></div>
              <div>Reach: <span className="text-white">{p.reach ?? "—"}</span></div>
              <div>Engagement: <span className="text-white">{p.engagement ?? "—"}</span></div>
              <div>Clicks: <span className="text-white">{p.clicks ?? "—"}</span></div>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-white/40">{p.error ?? "No integration configured"}</p>
          )}
          {p.lastSync && (
            <p className="mt-2 text-[10px] text-white/35">Synced {new Date(p.lastSync).toLocaleString()}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function PublishingSection({ data }: { data: any }) {
  const p = data.publishingIntel ?? {};
  if (!p.available) return <EmptyState title="No publishing activity yet" />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Published" value={p.published} />
      <Stat label="Scheduled" value={p.scheduled} />
      <Stat label="Drafts" value={p.drafts} />
      <Stat label="Failed" value={p.failed} />
      <Stat label="Queued" value={p.queued} />
      <Stat label="Success %" value={p.published ? "100%" : "—"} />
    </div>
  );
}

export function CampaignSection({ data }: { data: any }) {
  const c = data.campaignIntel ?? {};
  if (!c.available)
    return <EmptyState title="No campaigns yet" description="Create campaigns to track reach, CTR, conversions and leads." />;
  return <div className="text-sm text-white/70">Total campaigns: {c.total}</div>;
}

export function AiSection({ data }: { data: any }) {
  const a = data.aiIntel ?? {};
  if (!a.available) return <EmptyState title="No AI activity yet" description="AI requests will appear here as they happen." />;
  const modules = Object.entries(a.byModule ?? {}).map(([k, v]) => `${k}: ${v}`);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat label="AI Requests" value={a.totalRequests} sub="TASK-52" />
      <Stat label="Health" value={a.health} />
      <Stat label="Modules" value={modules.length} />
      <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-3">
        <div className="text-[11px] uppercase tracking-wide text-white/45">Requests by module</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {modules.length ? (
            modules.map((m) => (
              <span key={m} className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-300">
                {m}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-white/40">No module breakdown</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamSection({ data }: { data: any }) {
  const t = data.teamIntel ?? {};
  if (!t.available) return <EmptyState title="No team data" />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Employees" value={t.employees} />
      <Stat label="Conversations" value={t.conversations} />
      <Stat label="Posts" value={t.posts} />
      <Stat label="Scheduled" value={t.scheduled} />
    </div>
  );
}

export function MediaSection({ data }: { data: any }) {
  const m = data.mediaIntel ?? {};
  if (!m.available) return <EmptyState title="No media assets yet" description="Upload assets in Media Library (TASK-54)." />;
  const mb = (m.storageBytes ?? 0) / (1024 * 1024);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <Stat label="Assets" value={m.totalAssets} />
      <Stat label="Collections" value={m.collections} />
      <Stat label="Tags" value={m.tags} />
      <Stat label="Storage" value={`${mb.toFixed(1)} MB`} />
      <Stat label="Usage" value={m.totalUsage} />
      <Stat label="Unused" value={m.unusedAssets} />
    </div>
  );
}

export function QueueSection({ data }: { data: any }) {
  const q = data.queueIntel ?? {};
  const totals = q.totals;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${q.redisConnected ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>
          Redis: {q.redisConnected ? "Connected" : q.redisConfigured ? "Down" : "Not Configured"}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Engine: {q.engine}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">Jobs processed: {q.jobsProcessed}</span>
        <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-[10px] text-rose-300">Failed: {q.failedJobs}</span>
      </div>
      {totals ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Waiting" value={totals.waiting} />
          <Stat label="Active" value={totals.active} />
          <Stat label="Completed" value={totals.completed} />
          <Stat label="Failed" value={totals.failed} />
          <Stat label="Delayed" value={totals.delayed} />
        </div>
      ) : (
        <p className="text-[11px] text-white/40">Live BullMQ metrics require Redis. Running on DB fallback.</p>
      )}
      {!q.redisConfigured && (
        <p className="text-[11px] text-amber-300/80">Set REDIS_URL in .env.local to activate full BullMQ monitoring (TASK-57).</p>
      )}
    </div>
  );
}

export function AudienceSection({ data }: { data: any }) {
  const a = data.audienceIntel ?? {};
  return (
    <EmptyState
      title="Audience intelligence unavailable"
      description={a.reason ?? "No demographics integration (age, gender, geo) is configured."}
    />
  );
}

export function ForecastSection({ data }: { data: any }) {
  const f = data.forecastIntel ?? {};
  return (
    <EmptyState
      title="Forecast unavailable"
      description={f.reason ?? "No historical time-series model is configured for predictions."}
    />
  );
}
