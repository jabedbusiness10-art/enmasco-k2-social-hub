"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarItem from "./SidebarItem";

export type NavChild = {
  label: string;
  href: string;
};

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  children: NavChild[];
};

type SidebarSectionProps = {
  section: NavSection;
  defaultExpanded?: boolean;
  expandedKeys: Set<string>;
  toggleSection: (key: string) => void;
  collapsed: boolean;
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  show: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

export default function SidebarSection({
  section,
  defaultExpanded,
  expandedKeys,
  toggleSection,
  collapsed,
}: SidebarSectionProps) {
  const pathname = usePathname();
  const router = useRouter();

  const expanded = expandedKeys.has(section.key);
  const hasActiveChild = section.children.some((child) =>
    child.href === "/" ? pathname === "/" : pathname.startsWith(child.href),
  );

  useEffect(() => {
    if (hasActiveChild) {
      toggleSection(section.key);
    }
  }, [hasActiveChild, section.key, toggleSection]);

  const handleParentClick = () => {
    if (collapsed) return;
    toggleSection(section.key);
    router.push(section.children[0]?.href ?? "/");
  };

  return (
    <div className="space-y-0.5">
      <button
        onClick={handleParentClick}
        title={collapsed ? section.label : undefined}
        className={[
          "relative flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors duration-300",
          "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]",
          expanded || hasActiveChild ? "text-sky-100" : "text-white/70",
        ].join(" ")}
      >
        <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
          {(() => { const Icon = section.icon; return <Icon className="h-4 w-4" strokeWidth={1.8} />; })()}
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 text-sm font-semibold tracking-wide"
            >
              {section.label}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="chevron"
              initial={{ rotate: 0 }}
              animate={{ rotate: expanded ? 180 : 0 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.25 }}
              className="ml-1 text-white/50"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </motion.span>
          )}
        </AnimatePresence>
        {expanded && (
          <span className="absolute left-1.5 top-1/2 h-6 w-[4px] -translate-y-1/2 rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && expanded && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="ml-5 overflow-hidden border-l border-white/10 pl-2"
          >
            <div className="space-y-1 py-1">
              {section.children.map((child) => (
                <SidebarItem
                  key={child.href}
                  label={child.label}
                  href={child.href}
                  subitem
                  onClick={() => router.push(child.href)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
