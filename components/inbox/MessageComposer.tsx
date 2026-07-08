"use client";

import { motion } from "framer-motion";

type MessageComposerProps = {
  onSend: (text: string) => void;
};

export default function MessageComposer({ onSend }: MessageComposerProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <textarea className="h-24 w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-white outline-none placeholder:text-white/40" placeholder="Type a reply..." />
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={() => onSend("")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white">Attach</button>
        <button onClick={() => onSend("")} className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">Send</button>
      </div>
    </div>
  );
}
