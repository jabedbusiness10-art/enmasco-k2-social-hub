"use client";

import { useEffect, useState } from "react";
import { Activity, GitBranch, ListChecks, Clock, Users } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";

type TeamEvent = {
  id: string;
  action: string;
  createdAt: string;
  actor?: { name: string } | null;
  assignment?: { id: string; title: string } | null;
};
type DeptChange = {
  id: string;
  field: string;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
  assignment?: { id: string; title: string } | null;
};
type Assignment = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: { name: string } | null;
  department?: { name: string } | null;
  updatedAt: string;
};
type Department = { id: string; name: string; _count?: { users: number; assignments: number } };

const fmt = (d: string) => new Date(d).toLocaleString();

function Badge({ children, tone = "sky" }: { children: React.ReactNode; tone?: "sky" | "amber" | "emerald" | "violet" }) {
  const tones: Record<string, string> = {
    sky: "text-sky-300 bg-sky-500/10 border-sky-400/30",
    amber: "text-amber-300 bg-amber-500/10 border-amber-400/30",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
    violet: "text-violet-300 bg-violet-500/10 border-violet-400/30",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

export default function TeamActivityPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [changes, setChanges] = useState<DeptChange[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/team/operations", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setEvents(j.events ?? []);
        setChanges(j.changes ?? []);
        setAssignments(j.assignments ?? []);
        setDepartments(j.departments ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeline = [
    ...events.map((e) => ({
      key: `e-${e.id}`,
      when: e.createdAt,
      icon: <Activity className="h-3.5 w-3.5" />,
      tone: "sky" as const,
      text: (
        <span>
          <b className="text-white/90">{e.actor?.name ?? "Someone"}</b>{" "}
          <span className="text-white/60">{e.action.toLowerCase()}</span>{" "}
          {e.assignment ? <span className="text-sky-200">“{e.assignment.title}”</span> : null}
        </span>
      ),
    })),
    ...changes.map((c) => ({
      key: `c-${c.id}`,
      when: c.createdAt,
      icon: <GitBranch className="h-3.5 w-3.5" />,
      tone: "amber" as const,
      text: (
        <span>
          <span className="text-white/60">Department change on</span>{" "}
          <span className="text-amber-200">“{c.assignment?.title ?? "assignment"}”</span>
          <span className="text-white/40"> — {c.field}: {c.fromValue ?? "∅"} → {c.toValue ?? "∅"}</span>
        </span>
      ),
    })),
  ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

  return (
    <div>
      <PageHeader title="Team Activity" description="Dashboard of team operations: events, department changes, assignment history, and the team timeline." />

      <div className="grid gap-6 lg:grid-cols-2">
        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <Activity className="h-4 w-4 text-sky-300" /> Team Events
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{events.length}</span>
          </div>
          {loading ? <Skeleton /> : events.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {events.slice(0, 12).map((e) => (
                <Row key={e.id} icon={<Activity className="h-3.5 w-3.5" />} tone="sky">
                  <span><b className="text-white/90">{e.actor?.name ?? "Someone"}</b> <span className="text-white/60">{e.action.toLowerCase()}</span> {e.assignment ? <span className="text-sky-200">“{e.assignment.title}”</span> : null}</span>
                  <span className="text-[11px] text-white/35">{fmt(e.createdAt)}</span>
                </Row>
              ))}
            </div>
          )}
        </SecCard>

        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <GitBranch className="h-4 w-4 text-amber-300" /> Department Changes
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{changes.length}</span>
          </div>
          {loading ? <Skeleton /> : changes.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {changes.slice(0, 12).map((c) => (
                <Row key={c.id} icon={<GitBranch className="h-3.5 w-3.5" />} tone="amber">
                  <span><span className="text-amber-200">“{c.assignment?.title ?? "assignment"}”</span> <span className="text-white/40">— {c.field}: {c.fromValue ?? "∅"} → {c.toValue ?? "∅"}</span></span>
                  <span className="text-[11px] text-white/35">{fmt(c.createdAt)}</span>
                </Row>
              ))}
            </div>
          )}
        </SecCard>

        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <ListChecks className="h-4 w-4 text-emerald-300" /> Assignment History
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{assignments.length}</span>
          </div>
          {loading ? <Skeleton /> : assignments.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {assignments.slice(0, 12).map((a) => (
                <Row key={a.id} icon={<ListChecks className="h-3.5 w-3.5" />} tone="emerald">
                  <span>
                    <span className="text-white/90">{a.title}</span>
                    <span className="ml-2"><Badge tone="emerald">{a.status}</Badge></span>
                    <span className="ml-1"><Badge tone="violet">{a.priority}</Badge></span>
                    <span className="text-white/40"> — {a.assignedTo?.name ?? "Unassigned"}{a.department ? ` · ${a.department.name}` : ""}</span>
                  </span>
                  <span className="text-[11px] text-white/35">{fmt(a.updatedAt)}</span>
                </Row>
              ))}
            </div>
          )}
        </SecCard>

        <SecCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <Clock className="h-4 w-4 text-violet-300" /> Team Timeline
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{timeline.length}</span>
          </div>
          {loading ? <Skeleton /> : timeline.length === 0 ? <Empty /> : (
            <div className="space-y-1">
              {timeline.slice(0, 16).map((t) => (
                <div key={t.key} className="flex items-start gap-2 border-l border-white/10 pl-3">
                  <span className="mt-0.5 text-sky-300">{t.icon}</span>
                  <div className="flex-1 text-xs">{t.text}</div>
                  <span className="text-[11px] text-white/35">{fmt(t.when)}</span>
                </div>
              ))}
            </div>
          )}
        </SecCard>
      </div>

      <SecCard className="mt-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
          <Users className="h-4 w-4 text-sky-300" /> Departments
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{departments.length}</span>
        </div>
        {loading ? <Skeleton /> : departments.length === 0 ? <Empty /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-sm font-semibold text-white">{d.name}</div>
                <div className="mt-1 flex gap-3 text-xs text-white/45">
                  <span>{d._count?.users ?? 0} members</span>
                  <span>{d._count?.assignments ?? 0} assignments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SecCard>
    </div>
  );
}

function Row({ icon, tone, children }: { icon: React.ReactNode; tone: "sky" | "amber" | "emerald" | "violet"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    sky: "text-sky-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
    violet: "text-violet-300",
  };
  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className={`mt-0.5 ${tones[tone]}`}>{icon}</span>
      <div className="flex-1 text-xs text-white/70">{children}</div>
    </div>
  );
}
function Skeleton() {
  return <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-white/5" />)}</div>;
}
function Empty() {
  return <p className="py-6 text-center text-sm text-white/40">No records found.</p>;
}
