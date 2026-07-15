"use client";

import { useState } from "react";
import { Pause, Play, RotateCw, Trash2, Loader2 } from "lucide-react";

export default function QueueControls({
  onAction,
  available,
}: {
  onAction: (action: "pause" | "resume" | "retry" | "clean") => Promise<void>;
  available: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: "pause" | "resume" | "retry" | "clean") {
    setBusy(action);
    try {
      await onAction(action);
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={btn} disabled={!available || busy !== null} onClick={() => run("pause")}>
        {busy === "pause" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />} Pause
      </button>
      <button className={btn} disabled={!available || busy !== null} onClick={() => run("resume")}>
        {busy === "resume" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Resume
      </button>
      <button className={btn} disabled={!available || busy !== null} onClick={() => run("retry")}>
        {busy === "retry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />} Retry Failed
      </button>
      <button className={btn} disabled={!available || busy !== null} onClick={() => run("clean")}>
        {busy === "clean" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Clean
      </button>
    </div>
  );
}
