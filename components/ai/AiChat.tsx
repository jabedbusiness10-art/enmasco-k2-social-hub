"use client";

import { motion } from "framer-motion";
import type { AiMessage } from "@/types/ai";

type AiChatProps = {
  messages: AiMessage[];
  onSendMessage: (message: string) => void;
};

export default function AiChat({ messages, onSendMessage }: AiChatProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 p-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="flex gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold text-white">
                {message.role === "assistant" ? "AI" : "YOU"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{message.role === "assistant" ? "K2Kai AI" : "You"}</div>
                <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                  {message.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
