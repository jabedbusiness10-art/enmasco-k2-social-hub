"use client";

import EmployeeTable from "@/components/dashboard/EmployeeTable";
import ProfileDrawer from "@/components/dashboard/ProfileDrawer";
import UserModal from "@/components/dashboard/UserModal";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

const demo: User[] = [
  { id: "1", name: "MD Kazim", email: "md.kazim@enmasco.com", department: "Engineering", role: "Chief Executive Officer (CEO)", status: "Active" },
  { id: "2", name: "Sara Khan", email: "sara@enmasco.com", department: "Product", role: "Manager", status: "Away" },
  { id: "3", name: "Rafi Ahmed", email: "rafi@enmasco.com", department: "Security", role: "Analyst", status: "Offline" },
  { id: "4", name: "Nusrat Jahan", email: "nusrat@enmasco.com", department: "HR", role: "Lead", status: "Active" },
];

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(demo);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = typeof window !== "undefined" ? window.confirm("Are you sure you want to remove this employee?") : true;
    if (!ok) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSave = async (payload: Partial<User> & { id?: string }) => {
    if (payload.id) {
      await fetch(`/api/users/${payload.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setUsers((prev) => prev.map((u) => (u.id === payload.id ? { ...u, ...payload } : u)));
    } else {
      await fetch(`/api/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setUsers((prev) => [...prev, { ...(payload as User), id: `${Date.now()}` }]);
    }
    setModalOpen(false);
  };

  return (
    <Stagger className="space-y-6">
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">User Management</h1>
            <p className="text-sm text-slate-400">Manage employees, roles, and statuses.</p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
          >
            Add Employee
          </button>
        </div>
      </StaggerItem>
      <StaggerItem>
        <EmployeeTable
          data={users}
          onRowClick={setSelectedUser}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </StaggerItem>
      <ProfileDrawer isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser ?? undefined} />
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser ?? undefined} onSave={handleSave} />
    </Stagger>
  );
}
