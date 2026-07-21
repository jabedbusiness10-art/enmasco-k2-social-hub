"use client";

import type { ContentStatus, ApprovalStatus } from "@/types/contentPlanner";

const STATUS_STYLE: Record<ContentStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "border-white/15 bg-white/10 text-white/75" },
  REVIEW: { label: "Review", cls: "border-amber-400/30 bg-amber-400/15 text-amber-200" },
  APPROVED: { label: "Approved", cls: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200" },
  SCHEDULED: { label: "Scheduled", cls: "border-sky-400/30 bg-sky-400/15 text-sky-200" },
  PUBLISHED: { label: "Published", cls: "border-violet-400/30 bg-violet-400/15 text-violet-200" },
  FAILED: { label: "Failed", cls: "border-rose-500/30 bg-rose-500/15 text-rose-200" },
};

const APPROVAL_STYLE: Record<ApprovalStatus, { label: string; cls: string }> = {
  NOT_REQUIRED: { label: "No Approval", cls: "border-white/15 bg-white/10 text-white/55" },
  PENDING: { label: "Pending", cls: "border-amber-400/30 bg-amber-400/15 text-amber-200" },
  APPROVED: { label: "Approved", cls: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200" },
  REJECTED: { label: "Rejected", cls: "border-rose-500/30 bg-rose-500/15 text-rose-200" },
};

export function StatusBadge({ status, className = "" }: { status: ContentStatus; className?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
}

export function ApprovalBadge({ status, className = "" }: { status: ApprovalStatus; className?: string }) {
  const s = APPROVAL_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
}
