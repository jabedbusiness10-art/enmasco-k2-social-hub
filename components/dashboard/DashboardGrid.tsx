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
import CommandCenter from "./command/CommandCenter";

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
    <div className="space-y-[var(--space-section)]">
      {/* MODULES — primary navigation surface (unchanged routes) */}
      <section className="rise-in">
        <div className="section-heading mb-5">
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300/70">
              Workspace
            </div>
            <h3>Modules</h3>
            <p className="sub mt-1.5">Manage all enterprise social operations from one place.</p>
          </div>
        </div>
        <GlassCard className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-[var(--space-card-gap)] sm:grid-cols-2 lg:grid-cols-4">
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
                    className="focus-ring group flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-sky-400/40 hover:shadow-[0_0_24px_rgba(56,189,248,0.12)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] transition-colors duration-300 group-hover:bg-sky-400/[0.08]">
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
      </section>

      {/* COMMAND CENTER — denser, data-rich lower section */}
      <CommandCenter />
    </div>
  );
}
