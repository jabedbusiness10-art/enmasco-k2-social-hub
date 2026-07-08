"use client";

import { motion } from "framer-motion";
import type { ActivityItem } from "@/types/notification";

type ActivityFeedProps = {
  activities: ActivityItem[];
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">Activity Feed</div>
      <div className="divide-y divide-white/5">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-center justify-between px-3 py-2 text-xs text-white/80">
            <div>
              <div className="text-white">{activity.title}</div>
              <div className="text-white/60">Activity recorded</div>
            </div>
            <div className="text-white/60">{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
