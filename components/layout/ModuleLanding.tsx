"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { sidebarConfig } from "@/navigation/sidebarConfig";

/**
 * Generic module landing page: lists the module's sub-items as cards.
 * Keeps the existing design language (glass cards, sky accents, grid).
 */
export default function ModuleLanding({
  moduleKey,
}: {
  moduleKey: string;
}) {
  const section = sidebarConfig.find((s) => s.key === moduleKey);
  const children = section?.children ?? [];

  if (!section) return null;

  return (
    <div>
      <PageHeader title={section.label} description={section.description} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => {
          const Icon = section?.icon;
          return (
            <Link
              key={child.href}
              href={child.href}
              className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-sky-400/30 hover:bg-white/[0.06] hover:shadow-[0_0_44px_rgba(56,189,248,0.15)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-sky-200">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                </span>
                <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-sky-300" />
              </div>
              <div className="text-sm font-semibold text-white">{child.label}</div>
              {child.description && (
                <p className="text-xs leading-relaxed text-white/50">{child.description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
