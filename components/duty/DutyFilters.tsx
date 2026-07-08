"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Duty } from "@/types/duty";

type DutyFiltersProps = {
  search: string;
  department: string;
  status: string;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function DutyFilters({
  search,
  department,
  status,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
}: DutyFiltersProps) {
  const [open, setOpen] = useState(false);

  const departments = Array.from(new Set(["Security", "Sales", "Marketing", "Engineering", "Operations", "HR"]));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search duties..."
        className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400 focus:ring-0 sm:w-72"
      />
      <div className="flex items-center gap-2">
        <select
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-0"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-0"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>
  );
}
