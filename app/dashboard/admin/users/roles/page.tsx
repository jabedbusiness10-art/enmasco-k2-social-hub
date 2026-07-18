"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Users2, Layers } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";

type MatrixRow = { role: string; permissions: string[] };
type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: { name: string } | null;
  department?: { id: string; name: string } | null;
  status: string;
  effectivePermissions: string[];
};
type Dept = { id: string; name: string };

const ALL_PERMS: string[] = [
  "VIEW_DASHBOARD", "VIEW_MEDIA", "VIEW_NOTIFICATIONS", "VIEW_SCHEDULER",
  "VIEW_PUBLISHING", "VIEW_AI", "VIEW_SETTINGS", "MEDIA_UPLOAD", "MEDIA_DELETE",
  "VIEW_SOCIAL", "SOCIAL_CONNECT", "SOCIAL_DISCONNECT", "VIEW_ANALYTICS",
  "VIEW_TEAM", "MANAGE_TEAM", "APPROVE_WORK", "MANAGE_USERS", "MANAGE_ROLES",
];

export default function UserRolesPage() {
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/users/roles", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setMatrix(j.matrix ?? []);
        setUsers(j.users ?? []);
        setDepartments(j.departments ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const has = (perms: string[], p: string) => perms.includes(p);
  const level = (u: UserRow) =>
    u.effectivePermissions.includes("MANAGE_ROLES") ? "ADMIN" : u.effectivePermissions.includes("MANAGE_TEAM") ? "MANAGER" : u.effectivePermissions.includes("VIEW_TEAM") ? "MEMBER" : "VIEWER";

  return (
    <div>
      <PageHeader title="User Roles" description="Role-based access control: permission matrix, role assignment, user access levels, and per-user effective permissions." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SecCard className="overflow-x-auto p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <ShieldCheck className="h-4 w-4 text-sky-300" /> Permission Matrix
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{matrix.length} roles</span>
          </div>
          {loading ? <Sk /> : matrix.length === 0 ? <Empty /> : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="text-white/45">
                  <th className="sticky left-0 bg-[#0b1220] py-2 pr-3 text-left font-medium">Role</th>
                  {ALL_PERMS.map((p) => (
                    <th key={p} className="px-1 py-2 text-center font-medium" title={p}>
                      {p.split("_")[0].slice(0, 4)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((r) => (
                  <tr key={r.role} className="border-t border-white/5">
                    <td className="sticky left-0 bg-[#0b1220] py-2 pr-3 font-medium text-white/85">{r.role}</td>
                    {ALL_PERMS.map((p) => (
                      <td key={p} className="px-1 py-2 text-center">
                        {has(r.permissions, p) ? (
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        ) : (
                          <span className="text-white/15">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SecCard>

        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <Layers className="h-4 w-4 text-violet-300" /> User Access Levels
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{users.length}</span>
          </div>
          {loading ? <Sk /> : users.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-200">{u.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-white/85">{u.name}</div>
                    <div className="truncate text-[11px] text-white/40">{u.email}</div>
                  </div>
                  <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-200">{level(u)}</span>
                </div>
              ))}
            </div>
          )}
        </SecCard>
      </div>

      <SecCard className="mt-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
          <KeyRound className="h-4 w-4 text-emerald-300" /> Role Assignment
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{users.length}</span>
        </div>
        {loading ? <Sk /> : users.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="min-w-[150px] truncate text-sm text-white/85">{u.name}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">{u.role?.name ?? "—"}</span>
                <span className="text-xs text-white/40">{u.department?.name ?? "No dept"}</span>
                <span className="ml-auto text-xs text-white/45">{u.effectivePermissions.length} permissions</span>
              </div>
            ))}
          </div>
        )}
      </SecCard>

      <SecCard className="mt-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
          <Users2 className="h-4 w-4 text-sky-300" /> Departments (Access Scope)
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{departments.length}</span>
        </div>
        {loading ? <Sk /> : departments.length === 0 ? <Empty /> : (
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <span key={d.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70">{d.name}</span>
            ))}
          </div>
        )}
      </SecCard>
    </div>
  );
}

function Sk() { return <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-9 animate-pulse rounded-xl bg-white/5" />)}</div>; }
function Empty() { return <p className="py-6 text-center text-sm text-white/40">No records found.</p>; }
