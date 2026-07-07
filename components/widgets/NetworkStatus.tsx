"use client";

export default function NetworkStatus() {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
        Online
      </span>
    </div>
  );
}
