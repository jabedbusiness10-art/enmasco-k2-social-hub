"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SocialOverviewCards from "@/components/social/SocialOverviewCards";
import PlatformSidebar from "@/components/social/PlatformSidebar";
import SocialFeed from "@/components/social/SocialFeed";
import AnalyticsPanel from "@/components/social/AnalyticsPanel";
import QuickActions from "@/components/social/QuickActions";
import PlatformStatus from "@/components/social/PlatformStatus";
import { socialAccounts as initialAccounts, socialPosts as initialPosts } from "@/data/social";
import type { SocialAccount, SocialPost } from "@/types/social";

export default function SocialHubPage() {
  const [accounts] = useState<SocialAccount[]>(initialAccounts);
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [selectedPlatformId, setSelectedPlatformId] = useState("all");

  const filteredPosts = posts.filter((post) => selectedPlatformId === "all" || post.platform.toLowerCase() === accounts.find((a) => a.id === selectedPlatformId)?.platform.toLowerCase());

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Social Hub</h1>
          <p className="text-xs text-slate-400">Manage all social media from one command center.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400 focus:ring-0"
            placeholder="Search posts..."
          />
          <motion.button whileHover={{ y: -1, scale: 1.02 }} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
            Refresh
          </motion.button>
        </div>
      </motion.div>

      <SocialOverviewCards accounts={accounts} />

      <div className="mt-4 flex flex-col gap-3 px-4">
        <PlatformStatus name="Facebook" connected={accounts[0]?.connected} />
        <QuickActions />
      </div>

      <div className="mt-4 grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_1fr_16rem]">
        <PlatformSidebar accounts={accounts} selectedPlatformId={selectedPlatformId} onSelectPlatform={setSelectedPlatformId} />
        <div className="flex h-full flex-col border-r border-white/5">
          <div className="flex-1 overflow-y-auto p-4">
            <SocialFeed posts={filteredPosts} />
          </div>
        </div>
        <div className="hidden lg:block">
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}
