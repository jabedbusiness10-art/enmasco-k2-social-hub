"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SidebarItem from "./SidebarItem";
import { sidebarSectionTrigger } from "./sidebarStyles";

export type NavChild = {
  label: string;
  href: string;
};

export type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  children: NavChild[];
  expandable?: boolean;
};

type SidebarSectionProps = {
  section: NavSection;
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
  expandedKeys,
  toggleSection,
  collapsed,
}: SidebarSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Match a child href that may carry a ?view= query. usePathname() excludes
  // the search string, so compare path + the child's view param explicitly.
  const childMatches = (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    if (!query) return true;
    const params = new URLSearchParams(query);
    const view = params.get("view");
    if (!view) return true;
    return searchParams.get("view") === view;
  };

  const isExpandable = section.expandable !== false;
  const expanded = expandedKeys.has(section.key);
  const hasActiveChild = section.children.some((child) => childMatches(child.href));

  const handleClick = () => {
    if (collapsed) return;
    if (!isExpandable) {
      router.push(section.children[0]?.href ?? "/");
      return;
    }
    toggleSection(section.key);
  };

  return (
    <div className="space-y-0.5">
      <button
        onClick={handleClick}
        title={collapsed ? section.label : undefined}
        className={`group ${sidebarSectionTrigger({
          state: expanded ? "open" : hasActiveChild ? "childActive" : "idle",
        })}`}
      >
        <span className={`mr-3 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:border-sky-400/40 group-hover:bg-sky-500/[0.08] group-hover:shadow-[0_0_22px_rgba(56,189,248,0.18)] ${expanded || hasActiveChild ? "border-sky-300/40 bg-sky-500/[0.10] shadow-[0_0_22px_rgba(56,189,248,0.22)]" : "border-white/10 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"}`}>
          {(() => { const Icon = section.icon; return <Icon className={`h-5 w-5 transition-colors duration-300 group-hover:text-sky-200 ${expanded || hasActiveChild ? "text-sky-200" : "text-white/80"}`} strokeWidth={1.8} />; })()}
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
          {!collapsed && isExpandable && (
            <motion.span
              key="chevron"
              initial={{ rotate: 0 }}
              animate={{ rotate: expanded ? 180 : 0 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-1 text-white/50"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
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
            className="overflow-hidden pl-3"
          >
            <div className="space-y-1 py-1">
              {section.children.map((child, idx) => {
                // exact route + view match — only the child whose href (path +
                // ?view=) equals the current location is highlighted. Siblings
                // sharing the same base path but different view do NOT all
                // light up.
                const activeIndex = section.children.findIndex((c) => childMatches(c.href));
                const childActive = idx === activeIndex;
                return (
                  <SidebarItem
                    key={`${section.key}-${child.label}`}
                    label={child.label}
                    href={child.href}
                    subitem
                    isActive={childActive}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
