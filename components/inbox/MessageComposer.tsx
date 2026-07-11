"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Type a reply…"
        className="max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-400/40"
      />
      <button
        onClick={submit}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/20 text-white transition hover:bg-red-500/30 hover:shadow-[0_0_24px_rgba(248,113,113,0.25)]"
      >
        <Send className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
