export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
            <div className="h-2 w-1/4 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
