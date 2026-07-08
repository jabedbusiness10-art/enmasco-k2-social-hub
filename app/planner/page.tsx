"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import PlannerStats from "@/components/planner/PlannerStats";
import PlannerSidebar from "@/components/planner/PlannerSidebar";
import CampaignCards from "@/components/planner/CampaignCards";
import ContentQueue from "@/components/planner/ContentQueue";
import ApprovalPanel from "@/components/planner/ApprovalPanel";
import PlannerCalendar from "@/components/planner/PlannerCalendar";
import QuickActions from "@/components/planner/QuickActions";
import NewCampaignModal from "@/components/planner/NewCampaignModal";
import SchedulePostModal from "@/components/planner/SchedulePostModal";
import { campaigns as initialCampaigns, scheduledPosts as initialPosts } from "@/data/planner";
import type { Campaign, ScheduledPost } from "@/types/planner";

export default function PlannerPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);
  const [view, setView] = useState("Month");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const approvedCount = posts.filter((p) => p.status === "APPROVED").length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const todayPosts = posts.filter((p) => p.scheduledAt.startsWith(new Date().toISOString().slice(0, 10))).length;

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">K2 Planner</h1>
          <p className="text-xs text-slate-400">Content planning and campaign command center.</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40" placeholder="Search posts..." />
          <motion.button whileHover={{ y: -1, scale: 1.02 }} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]">New Campaign</motion.button>
        </div>
      </motion.div>

      <PlannerStats
        activeCampaigns={activeCampaigns}
        scheduledPosts={scheduledCount}
        approvedPosts={approvedCount}
        drafts={draftCount}
        todayPosts={todayPosts || 4}
      />

      <div className="mt-4 grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_1fr_16rem]">
        <PlannerSidebar view={view} setView={setView} />
        <div className="flex h-full flex-col border-r border-white/5">
          <div className="flex-none border-b border-white/5 px-4 py-3">
            <QuickActions />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <PlannerCalendar />
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Campaigns</div>
                <button onClick={() => setShowCampaignModal(true)} className="text-xs text-sky-300">+ Create</button>
              </div>
              <CampaignCards campaigns={campaigns} />
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold text-white">Content Queue</div>
              <ContentQueue posts={posts} />
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <ApprovalPanel upcomingCount={posts.length} />
        </div>
      </div>

      <NewCampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreate={(campaign) => setCampaigns((prev) => [...prev, { ...campaign, id: `c${Date.now()}` }])}
      />
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={(post) => setPosts((prev) => [...prev, { ...post, id: `s${Date.now()}` }])}
      />
    </div>
  );
}
