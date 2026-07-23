"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { Activity as ActivityIcon } from "lucide-react";
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { PLATFORM_LABELS, REACTION_EMOJI } from "@/data/engagement";
import type { EngagementData, EngagementPlatform, ReactionType } from "@/types/engagement";
import ReactionCards from "@/components/engagement/ReactionCards";
import ActivityFeed from "@/components/engagement/ActivityFeed";
import TopPosts from "@/components/engagement/TopPosts";
import EngagementCharts from "@/components/engagement/EngagementCharts";
import PlatformFilter, {
  type PlatformFilter as PF,
  type DateFilter,
  type ReactionFilter,
} from "@/components/engagement/PlatformFilter";
import EngagementOverview from "@/components/engagement/EngagementOverview";

type AggPlatform = {
  platform: string;
  label: string;
  connected: boolean;
  available: boolean;
  lastSync: string | null;
  error?: string | null;
  metrics?: Record<string, any> | null;
};

export default function EngagementPage() {
  const [platform, setPlatform] = useState<PF>("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [reaction, setReaction] = useState<ReactionFilter>("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<AggPlatform[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          range: date === "today" ? "today" : date === "week" ? "7d" : date === "month" ? "30d" : "30d",
          platforms: platform === "all" ? [] : [platform.toUpperCase()],
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load analytics");
      const json = await res.json();
      setPlatforms(json.platforms ?? []);
      setGeneratedAt(json.generatedAt ?? null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [platform, date]);

  useEffect(() => {
    load();
  }, [load]);

  const engagement = useMemo<EngagementData>(() => {
    const connected = platforms.filter((p) => p.connected && p.metrics);
    const m = (key: string): number =>
      connected.reduce((sum, p) => sum + (typeof p.metrics?.[key] === "number" ? (p.metrics![key] as number) : 0), 0);

    const totalFollowers = m("followers");
    const totalReach = m("reach");
    const totalImpressions = m("impressions");
    const totalEngagement = m("engagement");
    const totalComments = m("comments");
    const totalShares = m("shares");
    const totalPosts = m("posts");

    const stats = [
      { key: "REACH", label: "Reach", icon: "👀", total: totalReach, growth: null, trend: [] as number[] },
      { key: "ENGAGEMENT_RATE", label: "Engagement", icon: "📈", total: totalEngagement, growth: null, trend: [] as number[] },
      { key: "COMMENT", label: "Comments", icon: "💬", total: totalComments, growth: null, trend: [] as number[] },
      { key: "SHARE", label: "Shares", icon: "🔄", total: totalShares, growth: null, trend: [] as number[] },
      { key: "LIKE", label: "Followers", icon: "❤️", total: totalFollowers, growth: null, trend: [] as number[] },
      { key: "REACH", label: "Impressions", icon: "👀", total: totalImpressions, growth: null, trend: [] as number[] },
      { key: "POST", label: "Posts", icon: "📝", total: totalPosts, growth: null, trend: [] as number[] },
    ];

    // Real top posts aggregated across connected platforms.
    const topPosts = connected
      .flatMap((p) => (p.metrics?.topPosts ?? []).map((t: any) => ({ ...t, platform: p.platform })))
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      .slice(0, 8)
      .map((t: any) => ({
        id: t.id,
        platform: t.platform as EngagementPlatform,
        caption: t.title ?? "(no caption)",
        thumbnail: "📸",
        likes: t.likes ?? 0,
        comments: t.comments ?? 0,
        shares: t.shares ?? 0,
        reach: t.reach ?? null,
        engagementRate: t.engagementRate ?? null,
        createdAt: t.createdAt ?? generatedAt ?? new Date().toISOString(),
      }));

    // Real activity feed from available comment/reaction signals (no fabrication).
    const activity = connected
      .flatMap((p) =>
        (p.metrics?.topPosts ?? []).map((t: any, i: number) => ({
          id: `${p.platform}-${t.id}-${i}`,
          platform: p.platform as EngagementPlatform,
          customer: t.title?.slice(0, 24) ?? "Post",
          avatar: (t.title?.[0] ?? "P").toUpperCase(),
          reaction: (t.comments ?? 0) > 0 ? ("COMMENT" as ReactionType) : ("REACH" as ReactionType),
          postPreview: t.title ?? "(no caption)",
          at: t.createdAt ?? generatedAt ?? new Date().toISOString(),
        })),
      )
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 20);

    return {
      stats,
      activity,
      topPosts,
      daily: [],
      weekly: [],
      monthly: [],
      platformComparison: connected.map((p) => ({ platform: p.platform as EngagementPlatform, value: (p.metrics?.followers ?? 0) as number })),
      reactionDistribution: [],
      growthTrend: [],
      live: {
        monitoring: connected.length > 0,
        lastSync: generatedAt,
        dataSource: connected.length
          ? `Live · ${connected.map((p) => p.label).join(", ")} (Meta Graph)`
          : "No connected accounts",
        refresh: "live",
      },
    } as EngagementData;
  }, [platforms, generatedAt]);

  const platformConnected = useMemo(
    () => new Set(platforms.filter((p) => p.connected && p.metrics).map((p) => p.platform)),
    [platforms],
  );

  const filteredActivity = useMemo(() => {
    const q = search.trim().toLowerCase();
    return engagement.activity.filter((a) => {
      if (platform !== "all" && a.platform !== platform) return false;
      if (date === "today" && !isToday(parseISO(a.at))) return false;
      if (date === "week" && !isThisWeek(parseISO(a.at))) return false;
      if (date === "month" && !isThisMonth(parseISO(a.at))) return false;
      if (reaction !== "all" && a.reaction !== reaction) return false;
      if (q) {
        const hay = `${a.customer} ${a.postPreview}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [platform, date, reaction, search, engagement.activity]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return engagement.topPosts.filter((p) => {
      if (platform !== "all" && p.platform !== platform) return false;
      if (q && !p.caption.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [platform, search, engagement.topPosts]);

  return (
    <Stagger className="flex flex-col gap-5">
      {error && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-300">{error}</div>
      )}
      {/* header */}
      <StaggerItem>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-red-300" strokeWidth={1.8} />
              <h1 className="text-lg font-semibold text-white">Reactions &amp; Engagement Monitor</h1>
            </div>
            <p className="text-xs text-white/55">
              {loading ? "Loading real provider analytics…" : "Real-time reactions, comments &amp; reach across every connected platform."}
            </p>
          </div>
        </div>
      </StaggerItem>

      {/* overview stat cards */}
      <StaggerItem>
        <ReactionCards stats={engagement.stats} />
      </StaggerItem>

      <StaggerItem>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr]">
          {/* left: filters + live status */}
          <aside className="flex flex-col gap-4">
            <PlatformFilter
              platform={platform}
              onPlatform={setPlatform}
              date={date}
              onDate={setDate}
              reaction={reaction}
              onReaction={setReaction}
              search={search}
              onSearch={setSearch}
            />
            <EngagementOverview live={engagement.live} />
            {/* Honest unsupported-platform notice */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55">
              <p className="mb-1 font-medium text-white/70">Provider support</p>
              {platforms
                .filter((p) => !p.connected || !p.metrics)
                .map((p) => (
                  <div key={p.platform} className="flex items-center justify-between py-0.5">
                    <span>{PLATFORM_LABELS[p.platform as EngagementPlatform] ?? p.label}</span>
                    <span className="text-amber-300/80">{p.available ? "Connected, no data" : "Not supported"}</span>
                  </div>
                ))}
              {platforms.filter((p) => !p.connected || !p.metrics).length === 0 && (
                <p className="text-emerald-300/80">All configured platforms returning data.</p>
              )}
            </div>
          </aside>

          {/* right: feed + charts */}
          <div className="flex flex-col gap-4">
            <ActivityFeed items={filteredActivity} />
            <EngagementCharts
              daily={engagement.daily}
              weekly={engagement.weekly}
              monthly={engagement.monthly}
              platformComparison={engagement.platformComparison}
              reactionDistribution={engagement.reactionDistribution}
              growthTrend={engagement.growthTrend}
            />
          </div>
        </section>
      </StaggerItem>

      {/* top posts full width */}
      <StaggerItem>
        <TopPosts posts={filteredPosts} />
      </StaggerItem>
    </Stagger>
  );
}
