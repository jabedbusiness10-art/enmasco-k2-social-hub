import { AlertTriangle, AlertOctagon, Info, ChevronUp, Minus } from "lucide-react";

const config: Record<string, { label: string; cls: string; Icon: any }> = {
  CRITICAL: { label: "Critical", cls: "border-red-500/40 bg-red-500/15 text-red-200", Icon: AlertOctagon },
  HIGH: { label: "High", cls: "border-orange-500/40 bg-orange-500/15 text-orange-200", Icon: AlertTriangle },
  MEDIUM: { label: "Medium", cls: "border-amber-500/40 bg-amber-500/15 text-amber-200", Icon: ChevronUp },
  LOW: { label: "Low", cls: "border-sky-500/30 bg-sky-500/10 text-sky-200", Icon: Minus },
  INFO: { label: "Info", cls: "border-white/15 bg-white/5 text-white/60", Icon: Info },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const c = config[priority] || config.INFO;
  const { label, cls, Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}
