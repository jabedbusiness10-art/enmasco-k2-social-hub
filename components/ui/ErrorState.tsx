"use client";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export default function ErrorState({ title = "Something went wrong", description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center text-white">
      <div className="text-sm font-semibold">{title}</div>
      {description && <div className="text-xs text-white/70">{description}</div>}
      {onRetry && (
        <button onClick={onRetry} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10">Retry</button>
      )}
    </div>
  );
}
