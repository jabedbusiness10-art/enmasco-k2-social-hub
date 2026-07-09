"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030814] text-white">
      <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
        <div className="text-sm font-semibold">Something went wrong</div>
        <div className="text-xs text-white/70">{error?.message}</div>
        <button onClick={reset} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Try again</button>
      </div>
    </div>
  );
}
