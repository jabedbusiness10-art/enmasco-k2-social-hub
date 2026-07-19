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
  isActiveParent?: boolean;
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
  isActiveParent = false,
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
  // A parent is "active" (glowing) only when it is THE active section —
  // never merely because a sibling also matches the current path. This keeps
  // "Users" and "Workspace" mutually exclusive.
  const active = isActiveParent || expanded;

  const handleClick = () => {
    if (collapsed) return;
    if (!isExpandable) {
      router.push(section.children[0]?.href ?? "/");
      return;
    }
    toggleSection(section.key);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleClick}
        onMouseEnter={() => {
          const target = section.children[0]?.href;
          if (target) router.prefetch(target);
        }}
        onFocus={() => {
          const target = section.children[0]?.href;
          if (target) router.prefetch(target);
        }}
        title={collapsed ? section.label : undefined}
        className={`group ${collapsed ? "h-12 justify-center !rounded-xl !bg-transparent !p-0" : ""} ${sidebarSectionTrigger({
          state: expanded ? "open" : active ? "childActive" : "idle",
        })}`}
      >
        <span className={`${collapsed ? "h-10 w-10 rounded-xl" : "mr-2.5 h-10 w-10 rounded-xl"} flex shrink-0 items-center justify-center border transition-all duration-300 group-hover:border-sky-400/40 group-hover:bg-sky-500/[0.08] ${active ? "border-sky-300/45 bg-sky-500/[0.12] shadow-[0_0_14px_rgba(56,189,248,0.18)]" : "border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"}`}>
          {(() => { const Icon = section.icon; return <Icon className={`h-[18px] w-[18px] transition-colors duration-300 group-hover:text-sky-200 ${active ? "text-sky-200" : "text-white/80"}`} strokeWidth={1.8} />; })()}
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 text-[13px] font-semibold tracking-[0.02em]"
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
        {active && (
          <span className={`absolute top-1/2 -translate-y-1/2 rounded-r bg-sky-400 ${collapsed ? "left-0 h-5 w-[3px] shadow-[0_0_8px_rgba(56,189,248,0.55)]" : "left-1 h-5 w-[3px] shadow-[0_0_9px_rgba(56,189,248,0.65)]"}`} />
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
            className="overflow-hidden pl-2 pr-0.5"
          >
            <div className="space-y-1.5 py-1.5">
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
