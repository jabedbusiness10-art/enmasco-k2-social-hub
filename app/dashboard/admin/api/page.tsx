"use client";

import AccountHeader from "@/components/account-manager/AccountHeader";
import AccountCards from "@/components/account-manager/AccountCards";
import ConnectedAccountsTable from "@/components/account-manager/ConnectedAccountsTable";
import PlatformDetails from "@/components/account-manager/PlatformDetails";
import SyncHealth from "@/components/account-manager/SyncHealth";
import ActivityTimeline from "@/components/account-manager/ActivityTimeline";
import PermissionPanel from "@/components/account-manager/PermissionPanel";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { companyAccounts, activityTimeline, permissions } from "@/data/account-manager";

export default function CompanyAccountsSettingsPage() {
  return (
    <Stagger className="flex h-[calc(100vh-6rem)] flex-col">
      <StaggerItem>
        <AccountHeader title="Company Social Account Manager" description="Manage connected official ENMASCO company social accounts, sync health, and access permissions." />
      </StaggerItem>
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto px-4">
        <StaggerItem><AccountCards /></StaggerItem>
        <StaggerItem>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ConnectedAccountsTable accounts={companyAccounts} />
            <PlatformDetails accounts={companyAccounts} />
          </section>
        </StaggerItem>
        <StaggerItem>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SyncHealth accounts={companyAccounts} />
            <ActivityTimeline items={activityTimeline} />
          </section>
        </StaggerItem>
        <StaggerItem><PermissionPanel items={permissions} /></StaggerItem>
      </div>
    </Stagger>
  );
}
