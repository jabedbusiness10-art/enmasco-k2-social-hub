import EmployeeTable from "@/components/dashboard/EmployeeTable";
import ProfileDrawer from "@/components/dashboard/ProfileDrawer";
import { useState } from "react";

const demo = [
  { id: "1", name: "Jabed Hossain", email: "jabed@enmasco.com", department: "Engineering", role: "Super Admin", status: "Active" as const },
  { id: "2", name: "Sara Khan", email: "sara@enmasco.com", department: "Product", role: "Manager", status: "Away" as const },
  { id: "3", name: "Rafi Ahmed", email: "rafi@enmasco.com", department: "Security", role: "Analyst", status: "Offline" as const },
  { id: "4", name: "Nusrat Jahan", email: "nusrat@enmasco.com", department: "HR", role: "Lead", status: "Active" as const },
];

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<typeof demo[number] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-slate-400">Manage employees, roles, and statuses.</p>
        </div>
      </div>
      <EmployeeTable
        data={demo}
        onRowClick={setSelectedUser}
      />
      <ProfileDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser ?? undefined}
      />
    </div>
  );
}
