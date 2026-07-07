import GlassCard from "@/components/ui/GlassCard";

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <GlassCard className="col-span-8 h-72" />
      <GlassCard className="col-span-4 h-72" />
      <GlassCard className="col-span-4 h-64" />
      <GlassCard className="col-span-4 h-64" />
      <GlassCard className="col-span-4 h-64" />
    </div>
  );
}
