"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Duty, DutyPriority, DutyStatus } from "@/types/duty";

type DutyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (duty: Partial<Duty>) => Promise<void>;
  duty?: Duty | undefined;
};

const EMPTY = {
  title: "",
  description: "",
  department: "",
  assignedTo: "",
  priority: "MEDIUM",
  status: "PENDING",
  startDate: "",
  dueDate: "",
  attachment: "",
};

export default function DutyModal({ isOpen, onClose, onSave, duty }: DutyModalProps) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Load duty into form when opening for edit
  useEffect(() => {
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
    } else if (isOpen && !duty) {
      setForm(EMPTY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, duty]);

  // ESC closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ ...form, priority: form.priority as DutyPriority, status: form.status as DutyStatus, id: duty?.id });
      setForm(EMPTY);
      onClose();
    } catch {
      // error toast handled by caller
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "h-10 w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0 disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => !saving && onClose()} />
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
          <button type="button" onClick={onClose} disabled={saving} className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white disabled:opacity-50">
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
              disabled={saving}
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
              disabled={saving}
              className="min-h-[80px] w-full rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-0 disabled:opacity-60"
              placeholder="Short description"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</span>
            <input
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              required
              disabled={saving}
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
              disabled={saving}
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
                disabled={saving}
                className="h-10 rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-0 disabled:opacity-60"
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
                disabled={saving}
                className="h-10 rounded-xl border border-slate-700/70 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-0 disabled:opacity-60"
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
                disabled={saving}
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
                disabled={saving}
                className={inputCls}
              />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attachment (placeholder)</span>
            <input
              value={form.attachment}
              onChange={(e) => setForm((prev) => ({ ...prev, attachment: e.target.value }))}
              disabled={saving}
              className={inputCls}
              placeholder="https://example.com/file.pdf"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.12] disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20 disabled:opacity-60">
            {saving ? "Saving…" : duty ? "Save Changes" : "Create Duty"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
