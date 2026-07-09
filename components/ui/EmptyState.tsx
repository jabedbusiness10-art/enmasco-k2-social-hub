"use client";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-white">
      <div className="text-sm font-semibold">{title}</div>
      {description && <div className="text-xs text-white/70">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
