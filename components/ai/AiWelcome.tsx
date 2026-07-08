"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AiWelcome() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-white/60">
      <Sparkles className="h-8 w-8 text-white/30" strokeWidth={1.8} />
      <div>
        <div className="text-white font-medium">Welcome to K2Kai AI</div>
        <div className="mt-1">Your Enterprise Intelligence Assistant for ENMASCO Security Trading Co.</div>
      </div>
    </div>
  );
}
