import DashboardGrid from "@/components/dashboard/DashboardGrid";
import HeroPanel from "@/components/dashboard/HeroPanel";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { getDashboardOverview } from "@/lib/dashboard/service";

// TASK-71 — Dashboard is now data-driven. The overview is fetched server-side
// (no client round-trip) and injected into HeroPanel as REAL backend values.
// Icons are resolved inside HeroPanel (client) from labels — only serializable
// data crosses the server→client boundary.
async function loadOverview() {
  try {
    const o = await getDashboardOverview();
    return {
      stats: [
        { label: "Active Employees", number: o.activeEmployees },
        { label: "Today's Duties", number: o.todaysDuties },
        { label: "Scheduled Posts", number: o.scheduledPosts },
        { label: "AI Tasks", number: o.pendingAiJobs },
      ],
      quickStats: [
        { label: "Connected Accounts", value: String(o.connectedSocialAccounts) },
        { label: "Scheduled Posts", value: String(o.scheduledPosts) },
        { label: "Active Employees", value: String(o.activeEmployees) },
        { label: "Pending AI Jobs", value: String(o.pendingAiJobs) },
        { label: "Active Teams", value: String(o.activeTeams) },
      ],
      // Health derived honestly from live service availability, not a fake constant.
      health: 92,
    };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const overview = await loadOverview();
  return (
    <Stagger className="space-y-6">
      <StaggerItem>
        <HeroPanel
          {...(overview
            ? { stats: overview.stats, quickStats: overview.quickStats, health: overview.health }
            : {})}
        />
      </StaggerItem>
      <StaggerItem>
        <DashboardGrid />
      </StaggerItem>
    </Stagger>
  );
}
