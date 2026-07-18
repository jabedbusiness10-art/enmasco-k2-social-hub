"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, AlertTriangle } from "lucide-react";
import { WidgetShell, SkeletonRows, EmptyState } from "./command/primitives";

type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  department: string;
  role: string;
  status: string;
};

const statusTone = (s: string) =>
  s === "ACTIVE" ? "ok" : s === "SUSPENDED" ? "err" : s === "INACTIVE" ? "warn" : "off";

export default function EmployeeDirectory() {
  const [state, setState] = useState<{ status: "loading" | "ready" | "empty" | "error"; data?: DirectoryUser[] }>({
    status: "loading",
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/users", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        const users: DirectoryUser[] = (j.users ?? []).slice(0, 5);
        if (!alive) return;
        setState({ status: users.length ? "ready" : "empty", data: users });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <WidgetShell
      title="Employee Directory"
      icon={Users}
      action={
        <Link
          href="/dashboard/admin/users"
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-300/80 transition-colors hover:text-sky-200"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {state.status === "loading" && <SkeletonRows rows={5} />}
      {state.status === "error" && <EmptyState>Directory unavailable.</EmptyState>}
      {state.status === "empty" && <EmptyState>No employees found.</EmptyState>}
      {state.status === "ready" && (
        <ul className="space-y-2.5">
          {state.data!.map((u) => (
            <li key={u.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-sky-500/20">
                {u.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                ) : (
                  u.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white/85">{u.name}</div>
                <div className="truncate text-[11px] text-white/40">{u.email}</div>
              </div>
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-[11px] text-white/55">{u.department}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/35">{u.role}</span>
              </div>
              <span
                className={`ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  statusTone(u.status) === "ok"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                    : statusTone(u.status) === "err"
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
                      : statusTone(u.status) === "warn"
                        ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                        : "border-white/15 bg-white/5 text-white/45"
                }`}
              >
                {u.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}
