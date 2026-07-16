"use client";

import PageHeader from "@/components/layout/PageHeader";
import { SecurityOverview } from "@/components/security/SecurityOverview";

export default function SecurityOverviewPage() {
  return (
    <div>
      <PageHeader title="Security Overview" description="Real-time security posture, activity and dynamic risk score for K2KAI Social Flow." />
      <SecurityOverview />
    </div>
  );
}
