"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import type { Duty, DutyPriority } from "@/types/duty";

type DutyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (duty: Partial<Duty>) => void;
  duty?: Duty | undefined;
};

export default function DutyModal({ isOpen, onClose, onSave, duty }: DutyModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    assignedTo: "",
    priority: "MEDIUM",
    status: "PENDING",
    startDate: "",
    dueDate: "",
    attachment: "",
  });

  // Load duty into form on open/edit
  if (isOpen && duty) {
    setForm({
      title: duty.title,
      description: duty.description,
      department: duty.department,
      assignedTo: duty.assignedTo,
      priority: duty.priority,
      status: duty.status,
      startDate: duty.startDate,
      dueDate: duty.dueDate,
      attachment: duty.attachment || "",
    });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, priority: form.priority as DutyPriority, status: form.status as any, id: duty?.id });
    onClose();
  };

  const inputCls =
    "h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0";

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
          <h2 className="text-xl font-semibold text-slate-100">{duty ? "Edit Duty" : "Create Duty"}</h2>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              className={inputCls}
              placeholder="Duty title"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
              className="min-h-[80px] w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0"
              placeholder="Short description"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</span>
            <input
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              required
              className={inputCls}
              placeholder="Engineering"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assign Employee</span>
            <input
              value={form.assignedTo}
              onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
              required
              className={inputCls}
              placeholder="Employee name"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</span>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="h-10 rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-0"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="h-10 rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-0"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                required
                className={inputCls}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
                className={inputCls}
              />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attachment (placeholder)</span>
            <input
              value={form.attachment}
              onChange={(e) => setForm((prev) => ({ ...prev, attachment: e.target.value }))}
              className={inputCls}
              placeholder="https://example.com/file.pdf"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.12]">
            Cancel
          </button>
          <button type="submit" className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20">
            {duty ? "Save Changes" : "Create Duty"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
