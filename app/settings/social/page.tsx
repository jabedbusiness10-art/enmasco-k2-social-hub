"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import SocialHeader from "@/components/company-social/SocialHeader";
import ConnectionHealth from "@/components/company-social/ConnectionHealth";
import RolePermissions from "@/components/company-social/RolePermissions";
import BrandSettings from "@/components/company-social/BrandSettings";
import ActivityTimeline from "@/components/company-social/ActivityTimeline";
import SecurityCenter from "@/components/company-social/SecurityCenter";
import PostingPermissions from "@/components/company-social/PostingPermissions";
import CompanyAccounts from "@/components/company-social/CompanyAccounts";
import { companyAccounts, connectionHealth, rolePermissions, postingPermissions, brandSettings, activityTimeline, securityCenter, platformHealthSummary } from "@/data/company-social";
import type { HealthItem, ActivityItem, SecurityItem, PermissionItem, PostingPermissionItem, CompanySocialAccount, BrandSettings } from "@/types/company-social";
import type { HealthStatus } from "@/types/company-social";

const statusColor: Record<HealthStatus, string> = {
  EXCELLENT: "border-emerald-500/40 text-emerald-200",
  GOOD: "border-sky-500/40 text-sky-200",
  WARNING: "border-amber-500/40 text-amber-200",
  CRITICAL: "border-red-500/40 text-red-200",
};

export default function CompanySocialPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <SocialHeader title="Company Social Integration" description="Manage all official ENMASCO social media connections from one secure location." />
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <CompanyAccounts accounts={companyAccounts as CompanySocialAccount[]} />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ConnectionHealth items={connectionHealth as HealthItem[]} />
          <ActivityTimeline items={activityTimeline as ActivityItem[]} />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RolePermissions items={rolePermissions as PermissionItem[]} />
          <PostingPermissions items={postingPermissions as PostingPermissionItem[]} />
        </section>

        <BrandSettings settings={brandSettings as BrandSettings} />
        <SecurityCenter items={securityCenter as SecurityItem[]} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Right Panel — Platform Health Summary</div>
          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-5">
            {platformHealthSummary.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className={`rounded-xl border bg-white/[0.04] p-3 text-center ${statusColor[item.status] || "border-white/10 text-white"}`}
              >
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs">{item.status}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
