"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { setRolePermission } from "@/lib/security/actions";
import type { Permission, UserRole } from "@/types/auth";

const ROLES: UserRole[] = ["CEO", "ADMIN", "MARKETING_MANAGER", "MARKETING_TEAM", "CONTENT_CREATOR", "ANALYST", "VIEWER"];

export function PermissionMatrix() {
  const [matrix, setMatrix] = useState<{ role: UserRole; permissions: Permission[] }[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/security/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setMatrix(j.matrix ?? []);
        const set = new Set<Permission>();
        (j.matrix ?? []).forEach((m: any) => m.permissions.forEach((p: Permission) => set.add(p)));
        setAllPerms([...set]);
      })
      .finally(() => setLoading(false));
  }, []);

  const has = (role: UserRole, p: Permission) => matrix.find((m) => m.role === role)?.permissions.includes(p) ?? false;

  const toggle = (role: UserRole, p: Permission) => {
    const next = !has(role, p);
    startTransition(async () => {
      await setRolePermission(role, p, next ? "ALLOW" : "DENY");
      setMatrix((prev) => prev.map((m) =>
        m.role === role
          ? { ...m, permissions: next ? [...new Set([...m.permissions, p])] : m.permissions.filter((x) => x !== p) }
          : m
      ));
    });
  };

  if (loading) return <div className="p-6 text-center text-xs text-white/40">Loading permission matrix…</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-white/40">
          <tr className="border-b border-white/10">
            <th className="sticky left-0 bg-[#0b0b0f]/90 px-3 py-2 font-medium">Permission</th>
            {ROLES.map((r) => <th key={r} className="px-3 py-2 text-center font-medium">{r.replace("_", " ")}</th>)}
          </tr>
        </thead>
        <tbody>
          {allPerms.map((p) => (
            <tr key={p} className="border-b border-white/5">
              <td className="sticky left-0 bg-[#0b0b0f]/90 px-3 py-2 text-white/70">{p}</td>
              {ROLES.map((r) => {
                const on = has(r, p);
                return (
                  <td key={r} className="px-3 py-2 text-center">
                    <button onClick={() => toggle(r, p)}
                      className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border ${on ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300" : "border-white/10 bg-white/5 text-white/30"} hover:bg-white/10`}>
                      {on ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
