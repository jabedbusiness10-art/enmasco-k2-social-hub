import PageHeader from "@/components/layout/PageHeader";
import KanbanBoard from "@/components/team/KanbanBoard";
import ActivityTimeline from "@/components/team/ActivityTimeline";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Team Workspace"
        description="Collaborate, assign, and track enterprise work in real time."
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <KanbanBoard />
        </div>
        <div>
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
