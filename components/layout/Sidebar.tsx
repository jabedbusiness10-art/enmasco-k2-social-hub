"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  Network,
  BriefcaseBusiness,
  MessageCircle,
  Crown,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

type NavItem = {
  label: string;
  icon: LucideIcon;
};

type Point = { x: number; y: number };

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Command Center", icon: Activity },
  { label: "Social Hub", icon: Network },
  { label: "Duty Routine", icon: BriefcaseBusiness },
  { label: "Internal Chat", icon: MessageCircle },
  { label: "CEO Panel", icon: Crown },
  { label: "Security", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [mouse, setMouse] = useState<Point>({ x: -300, y: -300 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    const handleMouseLeave = () => setMouse({ x: -300, y: -300 });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const width = collapsed ? 72 : 260;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-screen shrink-0 flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_20px_rgba(56,189,248,0.18)] overflow-hidden"
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Mouse follower glow */}
      <div
        className="pointer-events-none fixed h-72 w-72 rounded-full bg-sky-400/20 blur-[140px]"
        style={{ left: mouse.x, top: mouse.y }}
        aria-hidden="true"
      />

      {/* Brand + toggle */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200/30 bg-sky-500/10 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.35)]">
            <span className="text-sm font-bold">K2</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="text-sm font-semibold text-white">ENMASCO</span>
                <span className="text-[10px] uppercase tracking-widest text-white/50">
                  OS Launcher
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;

          return (
            <div key={item.label} className="relative">
              <motion.button
                whileHover={{ y: -6, scale: 1.02 }}
                animate={{ scale: 1.02 }}
                onClick={() => setActive(item.label)}
                className={`
                  group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                  ${isActive ? "bg-sky-500/10 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.35)] drop-shadow-[0_0_20px_rgba(56,189,248,.45)]" : "text-white/70 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_18px_rgba(56,189,248,0.25)]"}
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-glow"
                    className="absolute inset-0 rounded-xl border border-sky-300/40 bg-sky-500/[0.06]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-5 w-5 shrink-0 ${isActive ? "text-sky-100" : "text-white/80"}`}
                  strokeWidth={1.8}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Floating glass tooltip when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/90 opacity-0 shadow-2xl backdrop-blur-xl transition-opacity duration-200 group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 h-10 w-1 rounded-r-full bg-sky-400 shadow-[0_0_20px_#38bdf8]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </motion.button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
            <ShieldCheck className="h-4 w-4 text-sky-100" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  ENMASCO Security
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">
                  Enterprise Edition
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
