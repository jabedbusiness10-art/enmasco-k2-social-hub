"use client";

import { ReactNode } from "react";

export type Status = "ok" | "warning" | "error" | "disabled" | "unknown";

const COLOR: Record<Status, { dot: string; text: string; ring: string }> = {
  ok: { dot: "bg-emerald-400", text: "text-emerald-300", ring: "ring-emerald-400/20" },
  warning: { dot: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/20" },
  error: { dot: "bg-rose-400", text: "text-rose-300", ring: "ring-rose-400/20" },
  disabled: { dot: "bg-white/30", text: "text-white/40", ring: "ring-white/10" },
  unknown: { dot: "bg-white/30", text: "text-white/40", ring: "ring-white/10" },
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const c = COLOR[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {label ?? status}
    </span>
  );
}

export function StatusCard({
  title,
  status,
  statusLabel,
  children,
  action,
}: {
  title: string;
  status?: Status;
  statusLabel?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {status && <StatusBadge status={status} label={statusLabel} />}
      </div>
      <div className="mt-3">{children}</div>
      {action}
    </div>
  );
}

export function Metric({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between py-1 text-xs">
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}{sub && <span className="ml-1 text-white/40">{sub}</span>}</span>
    </div>
  );
}

export function Skeleton({ h = "h-24" }: { h?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${h}`} />;
}
