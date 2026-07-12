"use client";

import { useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { Activity as ActivityIcon } from "lucide-react";
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";
import {
  engagement,
  PLATFORM_LABELS,
  REACTION_EMOJI,
} from "@/data/engagement";
import type {
  EngagementPlatform,
  ReactionType,
} from "@/types/engagement";
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

export default function EngagementPage() {
  const [platform, setPlatform] = useState<PF>("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [reaction, setReaction] = useState<ReactionFilter>("all");
  const [search, setSearch] = useState("");

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
  }, [platform, date, reaction, search]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return engagement.topPosts.filter((p) => {
      if (platform !== "all" && p.platform !== platform) return false;
      if (q) {
        if (!p.caption.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [platform, search]);

  return (
    <Stagger className="flex flex-col gap-5">
      {/* header */}
      <StaggerItem>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-red-300" strokeWidth={1.8} />
              <h1 className="text-lg font-semibold text-white">Reactions &amp; Engagement Monitor</h1>
            </div>
            <p className="text-xs text-white/55">
              Real-time reactions, comments &amp; reach across every connected platform.
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
