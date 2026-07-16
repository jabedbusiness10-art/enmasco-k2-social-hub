"use client";

import { motion } from "framer-motion";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Crown,
  MessageCircle,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import HealthBar from "./HealthBar";
import QuickAction from "./QuickAction";
import StatCard from "./StatCard";

const stats = [
  { icon: Users, number: 34, label: "Active Employees" },
  { icon: BriefcaseBusiness, number: 12, label: "Today's Duties" },
  { icon: CalendarClock, number: 18, label: "Scheduled Posts" },
  { icon: Bot, number: 5, label: "AI Tasks" },
];

const quickActions = [
  { icon: Network, label: "SOCIAL HUB", href: "/dashboard/social" },
  { icon: ShieldCheck, label: "DUTY ROUTINE", href: "/dashboard/team/tasks" },
  { icon: MessageCircle, label: "K2 MESSENGER", href: "/dashboard/messenger" },
  { icon: Crown, label: "CEO PANEL", href: "/ceo" },
];

type HeroPanelProps = {
  className?: string;
};

export default function HeroPanel({ className = "" }: HeroPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`enterprise-hero-panel relative isolate min-h-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#09090b]/80 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-6 lg:p-7 ${className}`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(248,113,113,0.18),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_52%_110%,rgba(127,29,29,0.26),transparent_38%)]" />
      <div className="cyber-grid absolute inset-0 -z-10 opacity-45" />
      <div className="absolute -left-24 top-10 -z-10 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute right-0 top-0 -z-10 h-px w-2/3 bg-gradient-to-r from-transparent via-red-200/40 to-transparent" />

      <div className="relative space-y-5 sm:space-y-6">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-red-100/80 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-red-300 shadow-[0_0_14px_rgba(252,165,165,0.9)]" />
              WELCOME BACK
            </div>
            <h1 className="cyber-title-flow">
              Enma Security Trading Company
            </h1>
            <p className="mt-3 text-lg font-medium tracking-normal text-white/75 sm:text-xl lg:text-2xl">
              Enterprise Command Center
            </p>
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-red-100/80 sm:text-xs">
                Monitor • Manage • Automate • Secure
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-red-200/20 bg-red-400/[0.08] text-red-100 shadow-[0_0_30px_rgba(248,113,113,0.18)]">
              <Building2 className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Live Mode
              </div>
              <div className="mt-1 text-sm font-semibold text-white/80">
                Secure Ops
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
              delay={0.14 + index * 0.06}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: Network, label: "Connected Accounts", value: "3" },
            { icon: CalendarClock, label: "Scheduled Today", value: "18" },
            { icon: Users, label: "Online Team", value: "12" },
            { icon: Bot, label: "AI Queue", value: "Stable" },
            { icon: ShieldCheck, label: "Uptime", value: "99.9%" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 + index * 0.05 }}
              className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur-xl"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                <item.icon className="h-3.5 w-3.5 text-red-200/70" strokeWidth={1.8} />
                {item.label}
              </div>
              <div className="text-lg font-bold text-white/90">{item.value}</div>
            </motion.div>
          ))}
        </div>

        <HealthBar value={97} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
            Quick Actions
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action, index) => (
              <QuickAction
                key={action.label}
                icon={action.icon}
                label={action.label}
                href={action.href}
                delay={0.48 + index * 0.05}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .cyber-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(248, 113, 113, 0.14), transparent 55%);
          background-size: 34px 34px, 34px 34px, 100% 100%;
          animation: cyber-grid-drift 18s linear infinite;
          mask-image: radial-gradient(circle at 50% 42%, black, transparent 78%);
        }

        .enterprise-hero-panel .health-bar-fill {
          background-size: 180% 100%;
          animation: health-pulse 1.9s ease-in-out infinite;
        }

        @keyframes cyber-grid-drift {
          from {
            background-position: 0 0, 0 0, center;
          }
          to {
            background-position: 34px 34px, 34px 34px, center;
          }
        }

        @keyframes health-pulse {
          0%, 100% {
            filter: brightness(1);
            background-position: 0% 50%;
          }
          50% {
            filter: brightness(1.22);
            background-position: 100% 50%;
          }
        }

        @keyframes quick-action-shine {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(120%);
          }
        }
      `}</style>
    </motion.section>
  );
}
