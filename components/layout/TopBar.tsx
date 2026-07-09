"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BrainCircuit,
  CloudSun,
  Radio,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type EnterpriseTopNavProps = {
  className?: string;
};

function formatClock(date: Date) {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Riyadh",
  }).format(date);

  const calendarDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  }).format(date);

  return { day, calendarDate, time };
}

export default function EnterpriseTopNav({ className = "" }: EnterpriseTopNavProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const clock = useMemo(() => formatClock(now ?? new Date("2026-07-07T13:45:18.000Z")), [now]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      className={`enterprise-top-nav sticky top-0 z-50 overflow-hidden rounded-[28px] border border-white/10 bg-[#070709]/80 px-4 py-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:px-5 lg:px-6 ${className}`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_0%,rgba(248,113,113,0.18),transparent_28%),radial-gradient(circle_at_50%_-30%,rgba(255,255,255,0.09),transparent_24%),radial-gradient(circle_at_95%_100%,rgba(127,29,29,0.24),transparent_34%)]" />
      <div className="top-nav-grid absolute inset-0 -z-10 opacity-35" />
      <div className="absolute left-0 top-0 -z-10 h-px w-full bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />

      <div className="grid items-center gap-4 lg:grid-cols-[minmax(240px,1fr)_auto_minmax(360px,1fr)]">
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ duration: 0.25 }}
          className="group flex min-w-0 items-center gap-3"
        >
          <img
            src="/logo.svg"
            alt="ENMASCO K2 SOCIAL"
            className="h-10 w-auto drop-shadow-[0_0_14px_rgba(56,189,248,0.55)]"
          />
          <div className="min-w-0">
            <div className="truncate text-base font-semibold leading-tight tracking-normal text-white sm:text-lg">
              ENMASCO K2 SOCIAL
            </div>
            <div className="truncate text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              Enterprise Command Center
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col justify-center p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm"
        >
          <div className="text-sky-400/80 text-xs font-bold tracking-wider uppercase mb-1">
            GMT+3 (Riyadh)
          </div>
          <div className="text-3xl font-bold text-white tracking-tight mb-1">
            {clock.time}
          </div>
          <div className="text-slate-400 text-sm font-medium">
            {clock.calendarDate}
          </div>
        </motion.div>

        <div className="flex flex-wrap items-stretch justify-start gap-2 lg:justify-end">
          <StatusTile
            icon={BrainCircuit}
            label="AI Status"
            value="Online"
            tone="emerald"
          />
          <StatusTile
            icon={Radio}
            label="Network Status"
            value="Connected"
            tone="red"
          />
          <StatusTile
            icon={CloudSun}
            label="Riyadh Weather"
            value={"39°C Sunny"}
            tone="amber"
          />

          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/76 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-red-400/[0.09] hover:text-white hover:shadow-[0_0_30px_rgba(248,113,113,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200/60"
            aria-label="Notifications: 3 unread"
          >
            <Bell className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" strokeWidth={1.8} />
            <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full border border-red-100/30 bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_18px_rgba(239,68,68,0.65)]">
              3
            </span>
          </motion.button>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: 0.25 }}
            className="group flex min-h-[58px] min-w-[210px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-white/[0.078] hover:shadow-[0_0_30px_rgba(248,113,113,0.2)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200/20 bg-red-400/[0.1] text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.18)] transition-all duration-300 group-hover:border-red-200/45 group-hover:text-white">
              <UserRound className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-tight text-white">
                Jabed Hossain
              </div>
              <div className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Super Administrator
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .top-nav-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(248, 113, 113, 0.12), transparent 56%);
          background-size: 34px 34px, 34px 34px, 100% 100%;
          animation: top-nav-grid-drift 18s linear infinite;
        }

        @keyframes top-nav-grid-drift {
          from {
            background-position: 0 0, 0 0, center;
          }
          to {
            background-position: 34px 34px, 34px 34px, center;
          }
        }
      `}</style>
    </motion.header>
  );
}

type StatusTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "emerald" | "red" | "amber";
};

function StatusTile({ icon: Icon, label, value, tone }: StatusTileProps) {
  const toneClass = {
    emerald: "bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.75)]",
    red: "bg-red-300 shadow-[0_0_16px_rgba(252,165,165,0.75)]",
    amber: "bg-amber-200 shadow-[0_0_16px_rgba(253,230,138,0.7)]",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group flex min-h-[58px] min-w-[148px] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-red-200/35 hover:bg-white/[0.078] hover:shadow-[0_0_30px_rgba(248,113,113,0.18)]"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/35 text-red-100 transition-all duration-300 group-hover:border-red-200/35 group-hover:text-white">
        <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${toneClass}`} />
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-white/84">
          {value}
        </div>
      </div>
    </motion.div>
  );
}
