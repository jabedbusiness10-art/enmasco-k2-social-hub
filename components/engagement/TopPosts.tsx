"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Briefcase, Send, Music2, PlayCircle, type LucideIcon } from "lucide-react";
import { Flame, Clock, TrendingUp } from "lucide-react";
import type { TopPost, EngagementPlatform } from "@/types/engagement";
import { PLATFORM_LABELS } from "@/data/engagement";

const META: Record<EngagementPlatform, { icon: LucideIcon; color: string }> = {
  facebook: { icon: Camera, color: "text-sky-400" },
  instagram: { icon: Camera, color: "text-pink-400" },
  linkedin: { icon: Briefcase, color: "text-blue-400" },
  x: { icon: Send, color: "text-white/70" },
  tiktok: { icon: Music2, color: "text-cyan-300" },
  youtube: { icon: PlayCircle, color: "text-red-400" },
};

type Sort = "popular" | "newest" | "engagement";

const SORTS: { key: Sort; label: string; icon: typeof Flame }[] = [
  { key: "popular", label: "Most Popular", icon: Flame },
  { key: "newest", label: "Newest", icon: Clock },
  { key: "engagement", label: "Highest Engagement", icon: TrendingUp },
];

export default function TopPosts({ posts }: { posts: TopPost[] }) {
  const [sort, setSort] = useState<Sort>("popular");

  const sorted = [...posts].sort((a, b) => {
    if (sort === "popular") return b.likes - a.likes;
    if (sort === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt);
    return b.engagementRate - a.engagementRate;
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <h3 className="text-sm font-semibold text-white">Top Performing Posts</h3>
        <div className="flex gap-1.5">
          {SORTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  sort === s.key
                    ? "bg-red-500/15 text-white"
                    : "bg-white/[0.04] text-white/55 hover:text-white"
                }`}
              >
                <Icon className="h-3 w-3" strokeWidth={2} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((p, i) => {
          const meta = META[p.platform];
          const Icon = meta.icon;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-2.5 transition hover:border-red-400/30 hover:bg-white/[0.05]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/8 text-xl">
                {p.thumbnail}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-white/80">{p.caption}</p>
                <div className={`mt-0.5 inline-flex items-center gap-1 text-[10px] ${meta.color}`}>
                  <Icon className="h-3 w-3" strokeWidth={2.5} />
                  {PLATFORM_LABELS[p.platform]}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-white/45">
                  <span>👍 {p.likes.toLocaleString()}</span>
                  <span>💬 {p.comments}</span>
                  <span>🔄 {p.shares}</span>
                  <span>👀 {p.reach.toLocaleString()}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs font-bold text-white">{p.engagementRate}%</div>
                <div className="text-[10px] text-white/40">Engmt</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
