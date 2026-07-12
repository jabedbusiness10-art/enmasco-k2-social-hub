"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { AiModule } from "@/types/ai";

type AiSidebarProps = {
  modules: { id: AiModule; label: string; description: string }[];
  selectedModuleId: AiModule;
  onSelectModule: (moduleId: AiModule) => void;
};

export default function AiSidebar({ modules, selectedModuleId, onSelectModule }: AiSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-white/[0.02]">
      <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">AI Modules</div>
      <div className="space-y-1 px-3">
        {modules.map((module, index) => (
          <motion.button
            key={module.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            onClick={() => onSelectModule(module.id)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
              selectedModuleId === module.id ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            {module.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
