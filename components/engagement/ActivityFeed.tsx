"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Camera, Briefcase, MessageCircle, Send, Music2, PlayCircle, type LucideIcon } from "lucide-react";
import type { ActivityItem, EngagementPlatform } from "@/types/engagement";
import { REACTION_EMOJI } from "@/data/engagement";
import { relTime } from "./dateUtils";

const META: Record<EngagementPlatform, { icon: LucideIcon; color: string }> = {
  facebook: { icon: Camera, color: "text-sky-400" },
  instagram: { icon: Camera, color: "text-pink-400" },
  linkedin: { icon: Briefcase, color: "text-blue-400" },
  x: { icon: Send, color: "text-white/70" },
  tiktok: { icon: Music2, color: "text-cyan-300" },
  youtube: { icon: PlayCircle, color: "text-red-400" },
};

const VERB: Record<string, string> = {
  LIKE: "reacted to",
  LOVE: "loved",
  HAHA: "laughed at",
  WOW: "was amazed by",
  SAD: "felt sad about",
  ANGRY: "was angry at",
  COMMENT: "commented on",
  SHARE: "shared",
  SAVE: "saved",
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        <h3 className="text-sm font-semibold text-white">Live Activity Feed</h3>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const meta = META[it.platform];
            const Icon = meta.icon;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition hover:bg-white/[0.05]"
              >
                <div className="relative shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-xs font-semibold text-white/80">
                    {it.avatar}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 ${meta.color}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-white/75">
                    <span className="font-semibold text-white">{it.customer}</span>{" "}
                    {VERB[it.reaction]}{" "}
                    <span className="italic text-white/55">&ldquo;{it.postPreview}&rdquo;</span>
                  </p>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-white/40">
                    {REACTION_EMOJI[it.reaction]} {relTime(it.at)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
