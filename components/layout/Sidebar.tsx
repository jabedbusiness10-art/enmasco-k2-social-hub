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

  useEffect(() => {
    const activeParents = sidebarConfig
      .filter((section) =>
        section.children.some((child) =>
          child.href === "/" ? pathname === "/" : pathname.startsWith(child.href),
        ),
      )
      .map((section) => section.key);
    if (activeParents.length > 0) {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        activeParents.forEach((key) => next.add(key));
        if (next.size > 1) {
          const [first, ...rest] = [...next];
          return new Set([first, ...rest]);
        }
        return next;
      });
    }
  }, [pathname]);

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
      animate={{ width: collapsed ? 72 : 260 }}
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
                <span className="text-sm font-semibold text-white">ENMASCO</span>
                <span className="text-[10px] uppercase tracking-widest text-white/50">
                  Social
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
        {sidebarConfig.map((section) => (
          <SidebarSection
            key={section.key}
            section={section}
            expandedKeys={expandedKeys}
            toggleSection={toggleSection}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
            <span className="text-xs font-bold text-white/80">K2</span>
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
                  K2 SOCIAL
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
