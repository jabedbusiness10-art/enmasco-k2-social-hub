"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Network,
  CalendarClock,
  HeartPulse,
  Inbox,
  Users,
  Bot,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

type ModuleLink = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  accent: string;
};

const modules: ModuleLink[] = [
  { icon: Network, title: "Social", desc: "Accounts, publishing & engagement", href: "/dashboard/social", accent: "text-sky-300" },
  { icon: CalendarClock, title: "Publishing Scheduler", desc: "Plan & schedule posts", href: "/dashboard/social/publisher", accent: "text-sky-300" },
  { icon: HeartPulse, title: "Engagement Monitor", desc: "Reactions & insights", href: "/dashboard/social/engagement", accent: "text-red-300" },
  { icon: Inbox, title: "Unified Inbox", desc: "All conversations in one place", href: "/dashboard/inbox/unified", accent: "text-sky-300" },
  { icon: Users, title: "Team", desc: "Members & permissions", href: "/dashboard/team/members", accent: "text-sky-300" },
  { icon: Bot, title: "AI & Automation", desc: "Studio & workflows", href: "/dashboard/ai", accent: "text-sky-300" },
  { icon: BarChart3, title: "Insights", desc: "Analytics & reports", href: "/dashboard/insights/analytics", accent: "text-sky-300" },
  { icon: ShieldCheck, title: "Administration", desc: "Settings & security", href: "/dashboard/admin", accent: "text-sky-300" },
];

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <GlassCard className="col-span-12">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
          Modules
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={m.href}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-sky-400/40 hover:shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                    <Icon className={`h-5 w-5 ${m.accent}`} strokeWidth={1.8} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{m.title}</span>
                    <span className="mt-0.5 text-xs text-white/50">{m.desc}</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="col-span-8 h-72" />
      <GlassCard className="col-span-4 h-72" />
    </div>
  );
}
