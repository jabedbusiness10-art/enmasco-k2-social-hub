"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Flag, Calendar, User } from "lucide-react";

type Status = "TODO" | "IN_PROGRESS" | "REVIEW" | "APPROVED" | "COMPLETED" | "CANCELLED" | "OVERDUE";
type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface Assignment {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  assignedTo: { id: string; name: string; avatar: string | null } | null;
  tags: string[];
  _count?: { comments: number; attachments: number };
}

const COLUMNS: { id: Status; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "COMPLETED", label: "Completed" },
];

const PRIORITY_META: Record<Priority, { color: string; label: string }> = {
  CRITICAL: { color: "text-rose-300", label: "Critical" },
  HIGH: { color: "text-orange-300", label: "High" },
  MEDIUM: { color: "text-amber-300", label: "Medium" },
  LOW: { color: "text-sky-300", label: "Low" },
};

export default function KanbanBoard() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/team/assignments?take=200");
    const j = await r.json();
    setItems(j.assignments ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const move = async (id: string, status: Status) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch(`/api/team/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Assignment Board</h2>
        <span className="text-[11px] text-white/40">{items.length} total</span>
      </div>
      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colItems = items.filter((a) => a.status === col.id);
            return (
              <div key={col.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">{col.label}</span>
                  <span className="rounded-full bg-white/10 px-2 text-[10px] text-white/50">{colItems.length}</span>
                </div>
                <div className="space-y-2">
                  {colItems.map((a) => {
                    const p = PRIORITY_META[a.priority];
                    return (
                      <motion.div
                        key={a.id}
                        layout
                        draggable
                        onDragEnd={() => move(a.id, col.id)}
                        className="cursor-grab rounded-xl border border-white/10 bg-white/[0.04] p-3 active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-white/90">{a.title}</span>
                          <Flag className={`h-3.5 w-3.5 ${p.color}`} />
                        </div>
                        {a.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {a.tags.map((t) => (
                              <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/55">#{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-white/45">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {a.assignedTo?.name ?? "—"}</span>
                          {a.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(a.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </motion.div>
                    );
                  })}
                  {colItems.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/10 py-4 text-center text-[10px] text-white/30">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
