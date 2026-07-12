import { Metadata } from "next";
import SettingsControlCenter from "@/components/settings/SettingsControlCenter";
import { Stagger, StaggerItem } from "@/components/anim/motion";

export const metadata: Metadata = {
  title: "Company Settings - K2KAI Social Flow",
  description: "Enterprise Control Center for company, regional, branding, AI, security, integrations, and system settings.",
};

export default function SettingsPage() {
  return (
    <Stagger className="space-y-4">
      <StaggerItem>
        <SettingsControlCenter />
      </StaggerItem>
    </Stagger>
  );
}
