"use client";

import EmployeeTable from "@/components/dashboard/EmployeeTable";
import ProfileDrawer from "@/components/dashboard/ProfileDrawer";
import UserModal from "@/components/dashboard/UserModal";
import { Stagger, StaggerItem } from "@/components/anim/motion";
import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // TASK-66B — load real team members from the database on page load.
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setUsers(Array.isArray(data?.users) ? data.users : []);
      })
      .catch(() => active && setUsers([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

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
      const res = await fetch(`/api/users/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === payload.id ? (saved?.id ? saved : { ...u, ...payload }) : u)));
    } else {
      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      if (created?.id) {
        setUsers((prev) => [...prev, created]);
      } else {
        // Fallback: refetch to stay in sync with the database.
        const r = await fetch("/api/users", { cache: "no-store" });
        const data = await r.json();
        if (Array.isArray(data?.users)) setUsers(data.users);
      }
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
        {loading ? (
          <div className="w-full rounded-xl border border-slate-700/50 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
            Loading team members…
          </div>
        ) : (
          <EmployeeTable
            data={users}
            onRowClick={setSelectedUser}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </StaggerItem>
      <ProfileDrawer isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser ?? undefined} />
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser ?? undefined} onSave={handleSave} />
    </Stagger>
  );
}
