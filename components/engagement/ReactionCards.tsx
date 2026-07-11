"use client";

import type { EngagementStat } from "@/types/engagement";
import StatsCard from "./StatsCard";

export default function ReactionCards({ stats }: { stats: EngagementStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {stats.map((s, i) => (
        <StatsCard
          key={s.key + i}
          label={s.label}
          icon={s.icon}
          total={s.total}
          growth={s.growth}
          trend={s.trend}
          index={i}
          percent={s.key === "ENGAGEMENT_RATE"}
        />
      ))}
    </div>
  );
}
