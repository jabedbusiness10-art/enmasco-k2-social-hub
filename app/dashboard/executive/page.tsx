"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, RefreshCw, Filter, Database, Bot, Users, Film, Layers, Radio, Sparkles, TrendingUp, Inbox, Download } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import SectionCard from "@/components/executive/SectionCard";
import KpiHeader, { Kpi } from "@/components/executive/KpiHeader";
import {
  OverviewSection,
  PlatformSection,
  PublishingSection,
  CampaignSection,
  AiSection,
  TeamSection,
  MediaSection,
  QueueSection,
  AudienceSection,
  ForecastSection,
} from "@/components/executive/sections";
import Recommendations from "@/components/executive/Recommendations";
import LiveActivity from "@/components/executive/LiveActivity";
import ExportCenter from "@/components/executive/ExportCenter";

type Range = "today" | "yesterday" | "7d" | "30d" | "90d" | "year";
const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "year", label: "This Year" },
];
const PLATFORMS = ["All", "Facebook", "Instagram", "LinkedIn", "Website", "Google Business"];

export default function ExecutiveDashboard() {
  const [range, setRange] = useState<Range>("7d");
  const [platform, setPlatform] = useState("All");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/executive?range=${range}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000); // 60s auto-refresh
    return () => clearInterval(t);
  }, [load]);

  const overview = data?.overview ?? {};
  const ai = data?.aiIntel ?? {};
  const queue = data?.queueIntel ?? {};
  const media = data?.mediaIntel ?? {};

  const kpis: Kpi[] = [
    { label: "Followers", value: overview.followers ?? null, growthPct: overview.growthPct },
    { label: "Reach", value: overview.reach ?? null },
    { label: "Impressions", value: null, hint: "No GA4/impressions source" },
    { label: "Engagement", value: overview.engagement ?? null },
    { label: "Website Users", value: null, hint: "No website analytics connected" },
    { label: "Messages", value: overview.messages ?? null },
    { label: "Leads", value: null, hint: "No campaign/lead source" },
    { label: "AI Requests", value: ai.totalRequests ?? null },
    { label: "Automation", value: null, hint: queue.engine },
    { label: "Queue Health", value: queue.redisConnected ? 100 : 0, unit: queue.redisConnected ? "%" : "", hint: "Redis connected" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Executive Intelligence Dashboard"
        description="Unified CEO / Management command center — aggregating every K2KAI module into one real-time view."
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <span className="flex items-center gap-1.5 text-xs text-white/50">
          <Filter className="h-4 w-4" /> Filters
        </span>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                range === r.key ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="mx-2 h-5 w-px bg-white/10" />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 outline-none"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p} className="bg-[#0c1320]">
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">{error}</div>}

      {loading && !data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <KpiHeader kpis={kpis} />

          <SectionCard title="Executive Overview" icon={<LayoutDashboard className="h-4 w-4" />} available={overview.available}>
            <OverviewSection data={data} />
          </SectionCard>

          <SectionCard title="Platform Intelligence" icon={<TrendingUp className="h-4 w-4" />}>
            <PlatformSection data={data} />
          </SectionCard>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="Publishing Intelligence" icon={<Radio className="h-4 w-4" />} available={data?.publishingIntel?.available}>
              <PublishingSection data={data} />
            </SectionCard>
            <SectionCard title="Campaign Intelligence" icon={<Inbox className="h-4 w-4" />} available={data?.campaignIntel?.available}>
              <CampaignSection data={data} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="AI Intelligence" icon={<Bot className="h-4 w-4" />} available={ai.available}>
              <AiSection data={data} />
            </SectionCard>
            <SectionCard title="Team Intelligence" icon={<Users className="h-4 w-4" />} available={data?.teamIntel?.available}>
              <TeamSection data={data} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="Media Intelligence" icon={<Film className="h-4 w-4" />} available={media.available}>
              <MediaSection data={data} />
            </SectionCard>
            <SectionCard title="Queue Intelligence" icon={<Layers className="h-4 w-4" />} available={queue.redisConfigured}>
              <QueueSection data={data} />
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="Audience Intelligence" icon={<Users className="h-4 w-4" />} available={false}>
              <AudienceSection data={data} />
            </SectionCard>
            <SectionCard title="Predictive Intelligence" icon={<TrendingUp className="h-4 w-4" />} available={false}>
              <ForecastSection data={data} />
            </SectionCard>
          </div>

          <SectionCard title="Executive AI Recommendations" icon={<Sparkles className="h-4 w-4" />}>
            <Recommendations data={data} />
          </SectionCard>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="Live Activity Center" icon={<Radio className="h-4 w-4" />}>
              <LiveActivity events={data?.liveEvents ?? []} />
            </SectionCard>
            <SectionCard title="Export Center" icon={<Download className="h-4 w-4" />}>
              <ExportCenter snapshot={data} />
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
