"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AiSidebar from "@/components/ai/AiSidebar";
import AiChat from "@/components/ai/AiChat";
import AiOutput from "@/components/ai/AiOutput";
import AiWelcome from "@/components/ai/AiWelcome";
import type { AiModule, AiMessage } from "@/types/ai";
import { aiModules, aiMessages, aiTools, conversations, promptTemplates, aiSettings, aiInsights } from "@/data/ai";

export default function AiStudioPage() {
  const [selectedModuleId, setSelectedModuleId] = useState("CHAT");
  const [messages, setMessages] = useState<AiMessage[]>(aiMessages);
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
          <h1 className="text-xl font-semibold text-white">K2Kai AI Assistant</h1>
          <p className="text-xs text-white/60">Central AI workspace for content, replies, analytics and automation.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400 focus:ring-0"
            placeholder="Search capabilities..."
          />
        </div>
      </motion.div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[16rem_1fr_16rem]">
        <aside className="flex flex-col gap-3 overflow-hidden p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">AI Tools</div>
            <div className="mt-2 space-y-1">
              {aiTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  <div className="text-sm text-white">{tool.title}</div>
                  <div className="text-[11px] text-white/60">{tool.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex h-full flex-col border-r border-white/5">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? <AiWelcome /> : <AiChat messages={messages} onSendMessage={handleSendMessage} />}
          </div>
          <div className="border-t border-white/10 bg-white/[0.02] p-3">
            <motion.div whileHover={{ y: -1, scale: 1.01 }} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                placeholder={`Ask K2Kai anything about ENMASCO marketing...`}
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

        <div className="hidden lg:flex flex-col gap-3 overflow-y-auto p-4">
          <AiOutput content={output || "No output yet. Start a conversation with K2Kai AI."} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">AI Insights</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/80">
              <div>Requests Today <div className="text-white font-semibold">{aiInsights.requestsToday}</div></div>
              <div>Avg Response <div className="text-white font-semibold">{aiInsights.avgResponseTime}</div></div>
              <div>Generated <div className="text-white font-semibold">{aiInsights.contentGenerated}</div></div>
              <div>Replies <div className="text-white font-semibold">{aiInsights.aiRepliesCreated}</div></div>
              <div>Posts Analyzed <div className="text-white font-semibold">{aiInsights.postsAnalyzed}</div></div>
              <div>Automations <div className="text-white font-semibold">{aiInsights.automationTasks}</div></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Prompt Templates</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {promptTemplates.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  onClick={() => handleSendMessage(template.prompt)}
                  className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-white transition hover:bg-white/10"
                >
                  {template.title}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
