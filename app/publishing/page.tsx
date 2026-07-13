"use client";

import { useState } from "react";
import PublishingHeader from "@/components/publishing/PublishingHeader";
import QueueFilters from "@/components/publishing/QueueFilters";
import PlatformStatus from "@/components/publishing/PlatformStatus";
import ActionToolbar from "@/components/publishing/ActionToolbar";
import PublishQueue from "@/components/publishing/PublishQueue";
import PublishStatus from "@/components/publishing/PublishStatus";
import PublishHistory from "@/components/publishing/PublishHistory";
import PublishStats from "@/components/publishing/PublishingStats";
import GlassCard from "@/components/ui/GlassCard";

import { publishJobs, platformStatuses, publishHistory, kpis } from "@/data/publishing";
import type { PublishJob, PlatformStatusItem, PublishHistoryItem } from "@/types/publishing";

export default function PublishingPage() {
  const [jobs, setJobs] = useState<PublishJob[]>(publishJobs);
  const [selected, setSelected] = useState<PublishJob | null>(publishJobs[1] ?? null);

  return (
    <div className="flex h-full flex-col">
      <PublishingHeader />
      <div className="mt-4 px-4">
        <PublishStats items={kpis} />
      </div>

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 overflow-hidden px-4 lg:grid-cols-[20rem_1fr_16rem]">
        <div className="flex flex-col gap-3 overflow-y-auto border-r border-white/5 pr-1">
          <QueueFilters />
          <PlatformStatus items={platformStatuses} />

          <GlassCard className="p-4">
            <div className="text-xs uppercase tracking-widest text-white/60">Module Pipeline</div>
            <div className="mt-2 flex flex-col gap-2">
              <PipelineRow label="Post Scheduler" status="CONNECTED" />
              <PipelineRow label="Publishing Engine" status="ACTIVE" accent />
              <PipelineRow label="Company Social Accounts" status="READY" />
              <PipelineRow label="Analytics" status="READY" />
              <PipelineRow label="CEO Dashboard" status="READY" />
            </div>
          </GlassCard>
        </div>

        <div className="flex min-h-0 flex-col border-r border-white/5 pr-1">
          <ActionToolbar />
          <PublishQueue jobs={jobs} />
          <PublishHistory history={publishHistory} />
        </div>

        <div className="hidden min-h-0 flex-col gap-3 overflow-y-auto lg:flex">
          <PublishStatus jobs={jobs} />
          {selected && <PostPreview job={selected} />}
        </div>
      </div>
    </div>
  );
}

function PostPreview({ job }: { job: PublishJob }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-widest text-white/60">Post Preview</div>
      <div className="mt-2 flex flex-col gap-2 text-xs text-white/80">
        <PreviewField label="Title" value={job.title} />
        <PreviewField label="Platform" value={job.platform} />
        <PreviewField label="Status" value={job.status} />
        <PreviewField label="Content" value={job.content ?? "-"} />
        <PreviewField label="Scheduled" value={job.scheduledAt} />
        <PreviewField label="Priority" value={job.priority ?? "-"} />
        {job.error && <PreviewField label="Last Error" value={job.error} />}
      </div>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] text-white/50">
        Approval status shown above if applicable.
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-widest text-white/50">{label}</span>
      <span className="text-right text-xs font-medium text-white">{value}</span>
    </div>
  );
}

function PipelineRow({ label, status, accent }: { label: string; status: string; accent?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-2 py-1.5 ${
        accent
          ? "border-sky-400/30 bg-sky-500/10 text-sky-200"
          : "border-white/10 bg-white/[0.04] text-white/70"
      }`}
    >
      <span className="text-[11px] font-medium">{label}</span>
      <span className="text-[10px] uppercase tracking-widest text-white/50">{status}</span>
    </div>
  );
}
