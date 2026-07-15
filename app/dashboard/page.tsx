import DashboardGrid from "@/components/dashboard/DashboardGrid";
import HeroPanel from "@/components/dashboard/heroPanel";
import { Stagger, StaggerItem } from "@/components/anim/motion";

export default function DashboardPage() {
  return (
    <Stagger className="space-y-6">
      <StaggerItem>
        <HeroPanel />
      </StaggerItem>
      <StaggerItem>
        <DashboardGrid />
      </StaggerItem>
    </Stagger>
  );
}
