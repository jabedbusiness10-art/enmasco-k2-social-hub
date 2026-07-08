"use client";

import AccountHeader from "@/components/account-manager/AccountHeader";
import AccountCards from "@/components/account-manager/AccountCards";
import ConnectedAccountsTable from "@/components/account-manager/ConnectedAccountsTable";
import PlatformDetails from "@/components/account-manager/PlatformDetails";
import SyncHealth from "@/components/account-manager/SyncHealth";
import ActivityTimeline from "@/components/account-manager/ActivityTimeline";
import PermissionPanel from "@/components/account-manager/PermissionPanel";
import { companyAccounts, activityTimeline, permissions } from "@/data/account-manager";

export default function CompanyAccountsSettingsPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <AccountHeader title="Company Social Account Manager" description="Manage connected official ENMASCO company social accounts, sync health, and access permissions." />
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <AccountCards />
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ConnectedAccountsTable accounts={companyAccounts} />
          <PlatformDetails accounts={companyAccounts} />
        </section>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SyncHealth accounts={companyAccounts} />
          <ActivityTimeline items={activityTimeline} />
        </section>
        <PermissionPanel items={permissions} />
      </div>
    </div>
  );
}
