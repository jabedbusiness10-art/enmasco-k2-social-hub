"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AiSidebar from "@/components/ai/AiSidebar";
import AiChat from "@/components/ai/AiChat";
import AiOutput from "@/components/ai/AiOutput";
import AiWelcome from "@/components/ai/AiWelcome";
import { aiModules, aiMessages as initialMessages } from "@/data/ai";
import type { AiModule, AiMessage } from "@/types/ai";

export default function AiStudioPage() {
  const [selectedModuleId, setSelectedModuleId] = useState<AiModule>("CHAT");
  const [messages, setMessages] = useState<AiMessage[]>(initialMessages);
  const [output, setOutput] = useState<string>("");

  const selectedModule = aiModules.find((module) => module.id === selectedModuleId) ?? aiModules[0];

  const handleSendMessage = (content: string) => {
    const userMessage: AiMessage = {
      id: `m${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: AiMessage = {
        id: `m${Date.now()}-ai`,
        role: "assistant",
        content: `K2Kai ${selectedModule.label} generated a response for: ${content}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setOutput(aiMessage.content);
    }, 600);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <h1 className="text-xl font-semibold text-white">K2Kai AI Studio</h1>
          <p className="text-xs text-slate-400">Enterprise Intelligence Workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400 focus:ring-0"
            placeholder="Search capabilities..."
          />
        </div>
      </motion.div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_1fr_16rem]">
        <AiSidebar modules={aiModules} selectedModuleId={selectedModuleId} onSelectModule={setSelectedModuleId} />
        <div className="flex h-full flex-col border-r border-white/5">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? <AiWelcome /> : <AiChat messages={messages} onSendMessage={handleSendMessage} />}
          </div>
          <div className="border-t border-white/10 bg-white/[0.02] p-3">
            <motion.div whileHover={{ y: -1, scale: 1.01 }} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                placeholder={`Ask K2Kai AI...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      handleSendMessage(value);
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </motion.div>
          </div>
        </div>
        <div className="hidden lg:block">
          <AiOutput content={output || "No output yet. Start a conversation with K2Kai AI."} />
        </div>
      </div>
    </div>
  );
}
