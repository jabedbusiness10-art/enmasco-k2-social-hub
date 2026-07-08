"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  id?: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: User | undefined;
  onSave: (payload: Partial<User> & { id?: string }) => void;
};

export default function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
  const [form, setForm] = useState<User>({
    name: "",
    email: "",
    department: "",
    role: "",
    status: "Active",
  });

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        status: user.status,
      });
    } else {
      setForm({ name: "", email: "", department: "", role: "", status: "Active" });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100">{user ? "Edit Employee" : "New Employee"}</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0"
              placeholder="Full name"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              type="email"
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0"
              placeholder="name@company.com"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</span>
            <input
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              required
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0"
              placeholder="Engineering"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</span>
            <input
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              required
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0"
              placeholder="Manager"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as User["status"] }))}
              className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-0"
            >
              <option value="Active">Active</option>
              <option value="Away">Away</option>
              <option value="Offline">Offline</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.12]">
            Cancel
          </button>
          <button type="submit" className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20">
            Save Employee
          </button>
        </div>
      </motion.form>
    </div>
  );
}
