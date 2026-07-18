"use client";

import { useEffect, useState } from "react";
import { Layers, Users2, ListChecks } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";

type Department = { id: string; name: string; _count?: { users: number; assignments: number } };
type Member = {
  id: string;
  name: string;
  avatar?: string | null;
  role?: { name: string } | null;
  department?: { id: string; name: string } | null;
  status: string;
};
type Assignment = {
  id: string;
  title: string;
  status: string;
  assignedTo?: { name: string } | null;
  department?: { name: string } | null;
};

export default function TeamRolesPage() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/team/roles", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setDepartments(j.departments ?? []);
        setMembers(j.members ?? []);
        setAssignments(j.assignments ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byDept = departments.map((d) => ({
    ...d,
    people: members.filter((m) => m.department?.id === d.id),
  }));

  return (
    <div>
      <PageHeader title="Team Roles" description="Department roles, team hierarchy, and active assignments across the organization." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <Layers className="h-4 w-4 text-sky-300" /> Department Roles
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{departments.length}</span>
          </div>
          {loading ? <Sk /> : departments.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {departments.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="text-sm font-medium text-white">{d.name}</span>
                  <span className="text-xs text-white/45">{d._count?.users ?? 0} members · {d._count?.assignments ?? 0} tasks</span>
                </div>
              ))}
            </div>
          )}
        </SecCard>

        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <Users2 className="h-4 w-4 text-violet-300" /> Team Hierarchy
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{members.length}</span>
          </div>
          {loading ? <Sk /> : members.length === 0 ? <Empty /> : (
            <div className="space-y-4">
              {byDept.map((d) => (
                <div key={d.id}>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-sky-300/80">{d.name}</div>
                  <div className="space-y-1.5">
                    {d.people.length === 0 ? (
                      <p className="text-xs text-white/35">No members in this department.</p>
                    ) : (
                      d.people.map((m) => (
                        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-200">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-white/85">{m.name}</span>
                          <span className="ml-auto text-xs text-white/45">{m.role?.name ?? "—"}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
              {byDept.length === 0 && members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-xs font-bold text-sky-200">{m.name.charAt(0).toUpperCase()}</div>
                  <span className="text-sm text-white/85">{m.name}</span>
                  <span className="ml-auto text-xs text-white/45">{m.role?.name ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </SecCard>
      </div>

      <SecCard className="mt-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
          <ListChecks className="h-4 w-4 text-emerald-300" /> Assignments
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{assignments.length}</span>
        </div>
        {loading ? <Sk /> : assignments.length === 0 ? <Empty /> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="text-sm text-white/85">{a.title}</span>
                <span className="ml-auto text-xs text-white/45">{a.assignedTo?.name ?? "Unassigned"}{a.department ? ` · ${a.department.name}` : ""}</span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </SecCard>
    </div>
  );
}

function Sk() {
  return <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-white/5" />)}</div>;
}
function Empty() {
  return <p className="py-6 text-center text-sm text-white/40">No records found.</p>;
}
