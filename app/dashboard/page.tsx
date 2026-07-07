import DashboardGrid from "@/components/dashboard/DashboardGrid";
import HeroPanel from "@/components/dashboard/HeroPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <HeroPanel />
      <DashboardGrid />
    </div>
  );
}
