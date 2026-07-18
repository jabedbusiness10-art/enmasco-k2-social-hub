"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      animate={{ width: collapsed ? 90 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-full w-[280px] shrink-0 flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_20px_rgba(56,189,248,0.18)] overflow-hidden"
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
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="sidebar-scroll mt-5 min-h-0 flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-5">
        {sidebarConfig.map((section, idx) => (
          <div key={section.key} className={idx === 0 ? "" : "mt-1 border-t border-white/[0.06] pt-1"}>
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

      <div className="mt-auto shrink-0 border-t border-white/10 px-5 py-5">
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.3px] text-white/85">Social OS</span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/45">
                <span>v1.0.0</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 uppercase tracking-wider">
                  {process.env.NODE_ENV === "production" ? "Production" : "Development"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/35">
                <span>Build 2026.07.13</span>
                <span>by ENMASCO</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200/30 bg-sky-500/10 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.35)]">
                <span className="text-[11px] font-bold">K2</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
