import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import DutyStats from "@/components/duty/DutyStats";
import DutyFilters from "@/components/duty/DutyFilters";
import DutyTable from "@/components/duty/DutyTable";
import CreateDutyModal from "@/components/duty/CreateDutyModal";
import EditDutyModal from "@/components/duty/EditDutyModal";
import DutyDetailsDrawer from "@/components/duty/DutyDetailsDrawer";
import CalendarPlaceholder from "@/components/duty/CalendarPlaceholder";
import GlassCard from "@/components/ui/GlassCard";
import { duties as initialDuties } from "@/data/duties";
import type { Duty } from "@/types/duty";

export default function DutyRoutinePage() {
  const [duties, setDuties] = useState<Duty[]>(initialDuties);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [viewDuty, setViewDuty] = useState<Duty | null>(null);

  const filtered = duties.filter((duty) => {
    const matchesSearch = duty.title.toLowerCase().includes(search.toLowerCase()) || duty.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department ? duty.department === department : true;
    const matchesStatus = status ? duty.status === status : true;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleSave = (payload: Partial<Duty>) => {
    if (payload.id) {
      setDuties((prev) => prev.map((d) => (d.id === payload.id ? { ...d, ...payload } : d)) as Duty[]);
    } else {
      setDuties((prev) => [
        ...prev,
        {
          ...(payload as Duty),
          id: `${Date.now()}`,
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Duty Routine</h1>
          <p className="text-sm text-slate-400">Manage, assign and track duties.</p>
        </div>
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          New Duty
        </motion.button>
      </div>

      <DutyStats duties={duties} />
      <DutyFilters
        search={search}
        department={department}
        status={status}
        onSearchChange={setSearch}
        onDepartmentChange={setDepartment}
        onStatusChange={setStatus}
      />
      <DutyTable duties={filtered} onEdit={setEditingDuty} onView={setViewDuty} />
      <GlassCard className="p-6">
        <CalendarPlaceholder />
      </GlassCard>

      <CreateDutyModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleSave} />
      {editingDuty && <EditDutyModal duty={editingDuty} onClose={() => setEditingDuty(null)} onSave={handleSave} />}
      <DutyDetailsDrawer duty={viewDuty} isOpen={!!viewDuty} onClose={() => setViewDuty(null)} />
    </div>
  );
}
