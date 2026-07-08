"use client";

import { motion } from "framer-motion";
import type { Message } from "@/types/message";

type ChatWindowProps = {
  messages: Message[];
};

export default function ChatWindow({ messages }: ChatWindowProps) {
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
                {message.senderName?.slice(0, 2)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-white">{message.senderName}</div>
                  <div className="text-[10px] text-white/50">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="mt-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                  {message.content}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                  <span>{message.status === "READ" ? "Read" : message.status === "DELIVERED" ? "Delivered" : "Sent"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
