"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { sidebarItem } from "./sidebarStyles";

type SidebarItemProps = {
  isActive?: boolean;
  icon?: LucideIcon;
  label: string;
  href?: string;
  subitem?: boolean;
  onClick?: () => void;
};

export default function SidebarItem({ isActive, icon, label, href, subitem, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Submenu items get their active state from the parent section (exact route
  // match), NOT from pathname.startsWith — startsWith wrongly activates every
  // child that shares a prefix/href (e.g. Media Library's 3 identical links).
  const active = subitem
    ? !!isActive
    : href
      ? href === "/"
        ? pathname === "/"
        : pathname.startsWith(href)
      : !!isActive;

  const content = (
    <motion.span
      whileHover={subitem ? {} : { scale: 1.01, y: -1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onMouseEnter={() => href && router.prefetch(href)}
      onFocus={() => href && router.prefetch(href)}
      onClick={href ? undefined : onClick}
      className={sidebarItem({ variant: subitem ? "subitem" : "section", active })}
    >
      {icon && !subitem && (
        <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
          {(() => { const ActiveIcon = icon; return <ActiveIcon className="h-4 w-4" strokeWidth={1.8} />; })()}
        </span>
      )}
      <span className={`font-medium ${subitem ? "text-[11px] tracking-[0.01em]" : "text-sm"}`}>{label}</span>
      {active && (
        <span className={`absolute top-1/2 -translate-y-1/2 rounded-r bg-sky-400 shadow-[0_0_9px_rgba(56,189,248,0.75)] ${subitem ? "left-0 h-4 w-[2px]" : "left-1 h-5 w-[3px]"}`} />
      )}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:outline-none">
        {content}
      </Link>
    );
  }
  return content;
}
