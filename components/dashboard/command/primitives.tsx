"use client";

import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared command-center primitives — premium, data-agnostic.          */
/* These render whatever real data they are given; they never invent   */
/* metrics. Loading / empty / unavailable states are first-class.       */
/* ------------------------------------------------------------------ */

export function WidgetShell({
  title,
  icon: Icon,
  action,
  className = "",
  children,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`surface-widget flex flex-col p-5 ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
              <Icon className="h-4 w-4 text-sky-200" strokeWidth={1.8} />
            </span>
          )}
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/65">
            {title}
          </h4>
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function SectionShell({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rise-in">
      <div className="section-heading mb-5">
        <div>
          {eyebrow && (
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300/70">
              {eyebrow}
            </div>
          )}
          <h3>{title}</h3>
          {subtitle && <p className="sub mt-1.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function KpiStat({
  icon: Icon,
  value,
  label,
  trend,
  tone = "sky",
}: {
  icon?: LucideIcon;
  value: ReactNode;
  label: string;
  trend?: { dir: "up" | "down"; pct: number; good?: boolean };
  tone?: "sky" | "red";
}) {
  const accent = tone === "red" ? "text-red-200" : "text-sky-200";
  const accentBg = tone === "red" ? "bg-red-400/[0.08]" : "bg-sky-400/[0.08]";
  return (
    <div className="surface kpi-stat flex flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 ${accentBg} ${accent}`}>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="kpi-value">{value}</span>
        {trend && (
          <span
            className={`mb-1 flex items-center gap-0.5 text-[11px] font-semibold ${
              trend.good === false ? "text-red-300" : "text-emerald-300"
            }`}
          >
            {trend.dir === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend.pct}%
          </span>
        )}
      </div>
    </div>
  );
}

export function StatusPill({
  status,
  children,
}: {
  status: "ok" | "warn" | "off" | "err";
  children: ReactNode;
}) {
  return (
    <span className={`status-pill status-${status}`}>
      <span className="dot" />
      {children}
    </span>
  );
}

/* CSS-only sparkline — passes a percentage array, no libs. */
export function Sparkline({
  points,
  tone = "sky",
}: {
  points: number[];
  tone?: "sky" | "red";
}) {
  if (!points.length) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const step = 100 / (points.length - 1 || 1);
  const coords = points
    .map((p, i) => `${(i * step).toFixed(1)},${(100 - ((p - min) / span) * 100).toFixed(1)}`)
    .join(" ");
  const stroke = tone === "red" ? "rgba(248,113,113,0.9)" : "rgba(56,189,248,0.9)";
  const fill = tone === "red" ? "rgba(248,113,113,0.12)" : "rgba(56,189,248,0.12)";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-12 w-full">
      <polyline points={`0,100 ${coords} 100,100`} fill={fill} stroke="none" />
      <polyline points={coords} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Horizontal mini bar (e.g. storage / usage ratio). */
export function MiniBar({ value, tone = "sky" }: { value: number; tone?: "sky" | "red" }) {
  const pct = Math.max(0, Math.min(100, value));
  const grad = tone === "red" ? "from-red-500/70 to-red-300/70" : "from-sky-500/70 to-sky-300/70";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-white/40">{children}</p>;
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
      ))}
    </div>
  );
}
