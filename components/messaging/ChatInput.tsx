"use client";

import { motion } from "framer-motion";
import { Paperclip, Smile, Mic, Camera } from "lucide-react";

type ChatInputProps = {
  onSendMessage: (message: string) => void;
};

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  return (
    <div className="border-t border-white/10 bg-white/[0.02] p-3">
      <motion.div whileHover={{ y: -1, scale: 1.01 }} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
        <button type="button" className="rounded-lg p-2 text-white/60 transition hover:text-white">
          <Paperclip className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <input
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          placeholder="Type a message..."
          onChange={(e) => {
            if (e.key === "Enter") {
              const value = e.currentTarget.value.trim();
              if (value) {
                onSendMessage(value);
                e.currentTarget.value = "";
              }
            }
          }}
        />
        <button type="button" className="rounded-lg p-2 text-white/60 transition hover:text-white">
          <Smile className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button type="button" className="rounded-lg p-2 text-white/60 transition hover:text-white">
          <Mic className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button type="button" className="rounded-lg p-2 text-white/60 transition hover:text-white">
          <Camera className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </motion.div>
    </div>
  );
}
