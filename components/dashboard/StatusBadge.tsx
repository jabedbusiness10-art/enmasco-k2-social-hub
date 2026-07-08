"use client";

type StatusBadgeProps = {
  status: "Active" | "Away" | "Offline";
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Away: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Offline: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const dot = {
    Active: "bg-emerald-400",
    Away: "bg-amber-400",
    Offline: "bg-slate-400",
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
