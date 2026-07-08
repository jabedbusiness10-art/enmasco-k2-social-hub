"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, MoreVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

type EmployeeTableProps = {
  data: User[];
  onRowClick?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
};

export default function EmployeeTable({ data, onRowClick, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="w-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/60 border-b border-slate-700/50 text-slate-400 text-sm uppercase tracking-wider">
            <th className="px-6 py-4 font-medium">Employee</th>
            <th className="px-6 py-4 font-medium">Department</th>
            <th className="px-6 py-4 font-medium">Role</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, index) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onRowClick?.(user)}
              className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors cursor-pointer group"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-100 group-hover:text-sky-400 transition-colors">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-300">{user.department}</td>
              <td className="px-6 py-4 text-slate-300">{user.role}</td>
              <td className="px-6 py-4">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onEdit?.(user)} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete?.(user.id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
