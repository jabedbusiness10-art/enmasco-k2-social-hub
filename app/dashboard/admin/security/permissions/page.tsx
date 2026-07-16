"use client";

import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";
import { PermissionMatrix } from "@/components/security/PermissionMatrix";

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader title="User Permissions" description="Role-based access control matrix. Toggle a permission to grant or revoke it for a role (CEO/ADMIN only)." />
      <SecCard className="p-4">
        <PermissionMatrix />
      </SecCard>
    </div>
  );
}
