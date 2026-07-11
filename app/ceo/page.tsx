"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { RefreshCcw } from "lucide-react";
import ExecutiveHeader from "@/components/ceo/ExecutiveHeader";
import ExecutiveKPICards from "@/components/ceo/ExecutiveKPICards";
import ExecutiveOverview from "@/components/ceo/ExecutiveOverview";
import SocialPerformance from "@/components/ceo/SocialPerformance";
import K2KaiExecutiveCenter from "@/components/ceo/K2KaiExecutiveCenter";
import AutomationMonitor from "@/components/ceo/AutomationMonitor";
import PlannerOverview from "@/components/ceo/PlannerOverview";
import TeamActivity from "@/components/ceo/TeamActivity";
import UnifiedInbox from "@/components/ceo/UnifiedInbox";
import PlatformHealth from "@/components/ceo/PlatformHealth";
import NotificationCenter from "@/components/ceo/NotificationCenter";
import { ceoKPIs, socialStats, automationRuns, calendarItems, recentActivities, inbox, platformHealth, notifications } from "@/data/ceo";

export default function CEOPage() {
  const [timeLabel, setTimeLabel] = useState(() => new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => setTimeLabel(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Stagger className="flex h-[calc(100vh-6rem)] flex-col">
      <StaggerItem>
        <ExecutiveHeader timeLabel={timeLabel} />
      </StaggerItem>
      <StaggerItem>
        <div className="mt-3 flex items-center justify-between px-4">
          <div className="text-xs text-white/60">{timeLabel}</div>
          <motion.button whileHover={{ y: -1, scale: 1.02 }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.12]">
            <RefreshCcw className="h-4 w-4" strokeWidth={1.8} /> Refresh
          </motion.button>
        </div>
      </StaggerItem>
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <StaggerItem><ExecutiveKPICards kpis={ceoKPIs} /></StaggerItem>
        <StaggerItem>
          <ExecutiveOverview
            summary={[
              { label: "Posts Published", value: "6" },
              { label: "Scheduled Posts", value: "7" },
              { label: "Active Campaigns", value: "3" },
              { label: "AI Requests", value: "128" },
              { label: "Automation Success", value: "98%" },
              { label: "Team Online", value: "22" },
            ]}
          />
        </StaggerItem>
        <StaggerItem>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SocialPerformance stats={socialStats} />
            <K2KaiExecutiveCenter requests={128} popularPrompt="Generate weekly security report" generatedCaptions={84} generatedReports={12} />
          </section>
        </StaggerItem>
        <StaggerItem>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AutomationMonitor runs={automationRuns} />
            <PlannerOverview items={calendarItems} />
          </section>
        </StaggerItem>
        <StaggerItem>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TeamActivity activities={recentActivities} />
            <UnifiedInbox items={inbox} />
          </section>
        </StaggerItem>
        <StaggerItem>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PlatformHealth items={platformHealth} />
            <NotificationCenter notifications={notifications} />
          </section>
        </StaggerItem>
      </div>
    </Stagger>
  );
}
