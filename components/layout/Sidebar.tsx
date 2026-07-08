"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  Users,
  Mail,
  Globe,
  Bot,
  CalendarDays,
  Workflow,
  BarChart3,
  LifeBuoy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SidebarItem from "./SidebarItem";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

type Point = { x: number; y: number };

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Users", icon: Users, href: "/dashboard/users" },
  { label: "Command Center", icon: Activity, href: "/dashboard/users" },
  { label: "Social Hub", icon: Network, href: "/social" },
  { label: "Duty Routine", icon: BriefcaseBusiness, href: "/duty-routine" },
  { label: "Internal Chat", icon: MessageCircle, href: "/messages" },
  { label: "CEO Panel", icon: Crown, href: "/ceo" },
  { label: "Security", icon: ShieldCheck, href: "/dashboard/users" },
  { label: "AI Studio", icon: Bot, href: "/ai" },
  { label: "K2 Planner", icon: CalendarDays, href: "/planner" },
  { label: "K2Flow Engine", icon: Workflow, href: "/automation" },
  { label: "K2 Insights", icon: BarChart3, href: "/insights" },
  { label: "Social Integration", icon: Globe, href: "/settings/social" },
  { label: "Settings", icon: Settings, href: "/dashboard/users" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<string>(() => {
    const match = navItems.find((item) => item.href && pathname?.startsWith(item.href));
    return match?.label ?? "Dashboard";
  });
  const [mouse, setMouse] = useState<Point>({ x: -300, y: -300 });

  useEffect(() => {
    const match = navItems.find((item) => item.href && pathname?.startsWith(item.href));
    if (match) setActive(match.label);
  }, [pathname]);

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

  const handleClick = (item: NavItem) => {
    setActive(item.label);
    if (item.href) router.push(item.href);
  };

  const width = collapsed ? 72 : 260;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-screen shrink-0 flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_20px_rgba(56,189,248,0.18)] overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridMove 40s linear infinite",
        }}
      />

      <div
        className="pointer-events-none fixed h-72 w-72 rounded-full bg-sky-400/20 blur-[140px]"
        style={{ left: mouse.x, top: mouse.y }}
        aria-hidden="true"
      />

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

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <SidebarItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            isActive={active === item.label}
            onClick={() => handleClick(item)}
          />
        ))}
      </nav>

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
