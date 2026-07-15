"use client";

import { ReactNode } from "react";

/**
 * TASK-58 — Shared glassmorphism section wrapper matching the K2KAI design
 * system (rounded-2xl border-white/10 bg-white/[0.04]).
 */
export default function SectionCard({
  title,
  icon,
  subtitle,
  action,
  available,
  children,
}: {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  available?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-sky-400">{icon}</span>}
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="text-xs text-white/45">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {available === false && (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              No Data
            </span>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
