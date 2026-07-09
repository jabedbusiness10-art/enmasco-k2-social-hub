import { Metadata } from "next";
import CompanySettings from "@/components/settings/CompanySettings";

export const metadata: Metadata = {
  title: "Company Settings - ENMASCO K2 Social",
  description: "Manage company configuration, regional, appearance, and security settings.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Company Settings</h1>
        <p className="mt-1 text-white/60">Central configuration for company, regional, appearance, and security settings.</p>
      </div>
      <CompanySettings />
    </div>
  );
}
