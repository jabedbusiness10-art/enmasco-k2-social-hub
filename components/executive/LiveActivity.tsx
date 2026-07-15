"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export default function LiveActivity({ events }: { events: any[] }) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {(!events || events.length === 0) && (
        <div className="py-6 text-center text-xs text-white/40">No live events yet.</div>
      )}
      {[...(events ?? [])].reverse().map((e, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
          <p className="text-white/70">
            <span className="text-white/40">{new Date(e.at).toLocaleTimeString()} · </span>
            {e.message}
          </p>
        </div>
      ))}
    </div>
  );
}
