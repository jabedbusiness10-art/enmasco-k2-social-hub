export default function EmptyState({ title = "Nothing here yet", hint = "" }: { title?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
      <div className="text-sm font-medium text-white/70">{title}</div>
      {hint && <div className="mt-1 text-xs text-white/40">{hint}</div>}
    </div>
  );
}
