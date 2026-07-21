"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import SidebarSection from "./SidebarSection";
import { sidebarConfig } from "@/navigation/sidebarConfig";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Exactly ONE parent section can be active/expanded at a time. Score each
  // section by how well it "owns" the current path: its own href as a prefix,
  // or one of its children matching exactly. The best (most specific) wins —
  // so /dashboard/admin/users or /dashboard/admin/security/permissions activate
  // "Users", never "Workspace" (which also lives under /dashboard/admin).
  const activeSectionKey = (() => {
    let best: string | null = null;
    let bestScore = -1;
    for (const section of sidebarConfig) {
      let score = 0;
      const isPrefix =
        section.href === "/"
          ? pathname === "/"
          : pathname === section.href ||
            pathname.startsWith(section.href + "/") ||
            pathname.startsWith(section.href);
      if (isPrefix) score = Math.max(score, section.href.length);
      for (const child of section.children) {
        const [path] = child.href.split("?");
        if (pathname === path) score = Math.max(score, child.href.length);
      }
      if (score > bestScore) {
        bestScore = score;
        best = section.key;
      }
    }
    return best;
  })();

  useEffect(() => {
    if (activeSectionKey) setExpandedKeys(new Set([activeSectionKey]));
  }, [activeSectionKey]);

  const toggleSection = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.clear();
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const glow = document.getElementById("sidebar-glow");
      if (glow) {
        glow.style.transform = `translate(${e.clientX - 144}px, ${e.clientY - 72}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-full w-[260px] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-white/[0.04] shadow-[0_0_20px_rgba(56,189,248,0.18)] backdrop-blur-2xl"
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
        id="sidebar-glow"
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-sky-400/20 blur-[140px]"
        style={{ left: -144, top: -72 }}
      />

      <div
        className={`flex shrink-0 items-center ${
          collapsed
            ? "h-[92px] flex-col justify-center gap-2 px-3 py-3"
            : "h-[60px] justify-between px-4"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 p-0.5 shadow-[0_0_22px_rgba(96,120,255,0.28)]">
            <Image
              src="/logo.png"
              alt="K2KAI official logo"
              width={40}
              height={34}
              className="h-auto w-full object-contain drop-shadow-[0_0_10px_rgba(120,145,255,0.42)]"
              priority
            />
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
                <span className="truncate text-sm font-bold tracking-[0.3px] text-white">Social OS</span>
                <span className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[2px] text-white/55">
                  by ENMASCO
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={`flex items-center justify-center border border-white/10 bg-white/[0.05] text-white/65 outline-none transition hover:border-sky-300/25 hover:bg-sky-400/10 hover:text-white focus:outline-none focus-visible:border-sky-300/35 focus-visible:ring-2 focus-visible:ring-sky-400/20 ${
            collapsed ? "h-7 w-10 rounded-lg" : "h-8 w-8 rounded-lg"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav
        className={`sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden ${
          collapsed ? "sidebar-scroll-collapsed mt-1 px-3" : "mt-3 px-4"
        }`}
      >
        {sidebarConfig.map((section, idx) => (
          <div
            key={section.key}
            className={idx === 0 ? "" : collapsed ? "mt-0.5 pt-0.5" : "mt-0.5 border-t border-white/[0.055] pt-0.5"}
          >
            <SidebarSection
              section={section}
              expandedKeys={expandedKeys}
              toggleSection={toggleSection}
              collapsed={collapsed}
              isActiveParent={section.key === activeSectionKey}
            />
          </div>
        ))}
      </nav>

      <div className={`mt-auto shrink-0 border-t border-white/[0.08] bg-black/15 ${collapsed ? "px-3 py-2.5" : "px-4 py-2"}`}>
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium tracking-[0.06em] text-white/72">Social OS</span>
                <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-300/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[8px] font-normal tracking-[0.04em] text-white/30">
                <span className="truncate">v1.0 · Build 2026.07.13</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-md border border-white/[0.07] bg-white/[0.045] px-1.5 py-0.5 text-[7px] uppercase tracking-[0.1em] text-white/42">
                    {process.env.NODE_ENV === "production" ? "Prod" : "Dev"}
                  </span>
                  <span className="text-white/25">ENMASCO</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center py-1"
              title="System online"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
