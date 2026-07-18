"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users as UsersIcon, Mail, Building2, BadgeCheck, Circle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import { SecCard } from "@/components/security/primitives";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  Active: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  Away: "text-amber-300 bg-amber-500/10 border-amber-400/30",
  Offline: "text-white/50 bg-white/5 border-white/10",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", department: "", role: "", status: "Active" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      setUsers(json.users ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to create user");
      }
      toast.success("User created");
      setForm({ name: "", email: "", department: "", role: "", status: "Active" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage platform users, access, and invitations. Changes are saved to the database."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SecCard className="p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <UsersIcon className="h-4 w-4 text-sky-300" />
            Team Members
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {users.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-sky-400/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sm font-bold text-sky-200">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">{u.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          STATUS_STYLES[u.status] ?? STATUS_STYLES.Offline
                        }`}
                      >
                        <Circle className="h-1.5 w-1.5 fill-current" />
                        {u.status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/45">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {u.email}
                      </span>
                      {u.department && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {u.department}
                        </span>
                      )}
                      {u.role && (
                        <span className="inline-flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" />
                          {u.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SecCard>

        <SecCard className="h-fit p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/60">
            <Plus className="h-4 w-4 text-sky-300" />
            Add User
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
              required
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email address"
              type="email"
              required
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
            <input
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              placeholder="Department"
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
            <input
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              placeholder="Role (e.g. Engineer)"
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Active">Active</option>
              <option value="Away">Away</option>
              <option value="Offline">Offline</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add User"}
            </button>
          </form>
        </SecCard>
      </div>
    </div>
  );
}
