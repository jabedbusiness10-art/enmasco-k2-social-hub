"use client";

import type { ContentStatus, ApprovalStatus } from "@/types/contentPlanner";

const STATUS_STYLE: Record<ContentStatus, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "bg-white/10 text-white/70 border-white/15" },
  REVIEW: { label: "Review", cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
  APPROVED: { label: "Approved", cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" },
  SCHEDULED: { label: "Scheduled", cls: "bg-sky-400/15 text-sky-300 border-sky-400/30" },
  PUBLISHED: { label: "Published", cls: "bg-violet-400/15 text-violet-300 border-violet-400/30" },
  FAILED: { label: "Failed", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const APPROVAL_STYLE: Record<ApprovalStatus, { label: string; cls: string }> = {
  NOT_REQUIRED: { label: "No Approval", cls: "bg-white/10 text-white/55 border-white/15" },
  PENDING: { label: "Pending", cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
  APPROVED: { label: "Approved", cls: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30" },
  REJECTED: { label: "Rejected", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

export function StatusBadge({ status, className = "" }: { status: ContentStatus; className?: string }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
}

export function ApprovalBadge({ status, className = "" }: { status: ApprovalStatus; className?: string }) {
  const s = APPROVAL_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.cls} ${className}`}>
      {s.label}
    </span>
  );
}
