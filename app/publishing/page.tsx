"use client";

import PublishingHeader from "@/components/publishing/PublishingHeader";
import PublishingStats from "@/components/publishing/PublishingStats";
import PlatformStatus from "@/components/publishing/PlatformStatus";
import PublishQueue from "@/components/publishing/PublishQueue";
import PublishStatus from "@/components/publishing/PublishStatus";
import PublishHistory from "@/components/publishing/PublishHistory";
import ActionToolbar from "@/components/publishing/ActionToolbar";
import QueueFilters from "@/components/publishing/QueueFilters";
import { publishJobs, platformStatuses, publishHistory, kpis } from "@/data/publishing";

export default function PublishingPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <PublishingHeader />
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <PublishingStats items={kpis} />
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <aside className="flex flex-col gap-3">
            <QueueFilters />
            <ActionToolbar onPublishNow={() => {}} onRetryFailed={() => {}} onCancelJob={() => {}} onPauseQueue={() => {}} onResumeQueue={() => {}} onViewLogs={() => {}} />
            <PlatformStatus items={platformStatuses} />
          </aside>
          <div className="flex flex-col gap-3">
            <PublishQueue jobs={publishJobs} />
          </div>
          <div className="flex flex-col gap-3">
            <PublishStatus jobs={publishJobs} />
            <PublishHistory history={publishHistory} />
          </div>
        </section>
      </div>
    </div>
  );
}
