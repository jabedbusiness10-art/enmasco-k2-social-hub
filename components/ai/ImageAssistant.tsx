"use client";

import { ImageIcon, FileText, Type, ScanText, Tags, Eraser, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: <FileText className="h-4 w-4" />, title: "Image Description", desc: "Generate a natural-language description of any uploaded image." },
  { icon: <Type className="h-4 w-4" />, title: "Alt Text", desc: "Accessible alt text for SEO and screen readers." },
  { icon: <ScanText className="h-4 w-4" />, title: "OCR", desc: "Extract text from images and screenshots automatically." },
  { icon: <Tags className="h-4 w-4" />, title: "Auto Tags", desc: "Smart content tags for the Media Library." },
  { icon: <Eraser className="h-4 w-4" />, title: "Background Remove", desc: "Placeholders ready — powered by vision models soon." },
  { icon: <Sparkles className="h-4 w-4" />, title: "Image Enhancement", desc: "Upscale and retouch placeholders ready." },
];

export default function ImageAssistant() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <ImageIcon className="h-5 w-5 text-sky-400" />
        <div>
          <div className="text-sm font-semibold text-white">AI Image Assistant</div>
          <div className="text-[11px] text-white/45">Future-ready vision features. Wiring in progress — architecture is ready.</div>
        </div>
        <span className="ml-auto rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Coming Soon</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="rounded-lg bg-gradient-to-br from-sky-500/20 to-rose-500/10 p-1.5 text-sky-200">{f.icon}</span>
              {f.title}
            </div>
            <p className="mt-2 text-xs text-white/55">{f.desc}</p>
            <div className="mt-3 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-2 text-center text-[10px] text-white/35">
              Drop an image to enable
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
