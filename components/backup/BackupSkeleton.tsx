"use client";

export function BackupSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
    </div>
  );
}
