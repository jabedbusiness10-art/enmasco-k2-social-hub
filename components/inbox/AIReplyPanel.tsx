"use client";

import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Languages, Briefcase, Smile, Minus, AlignLeft } from "lucide-react";

const ACTIONS: {
  key: "generate" | "rewrite" | "translate" | "professional" | "friendly" | "short" | "long";
  label: string;
  icon: typeof Sparkles;
}[] = [
  { key: "generate", label: "Generate Reply", icon: Sparkles },
  { key: "rewrite", label: "Rewrite Reply", icon: RefreshCw },
  { key: "translate", label: "Translate", icon: Languages },
  { key: "professional", label: "Professional Tone", icon: Briefcase },
  { key: "friendly", label: "Friendly Tone", icon: Smile },
  { key: "short", label: "Short Reply", icon: Minus },
  { key: "long", label: "Long Reply", icon: AlignLeft },
];

// Mock AI responses — no real API.
const MOCK: Record<string, string> = {
  generate:
    "Thank you for reaching out to ENMASCO! We have received your request and our team will get back to you shortly with the details.",
  rewrite:
    "We appreciate your message and are happy to help. Here is a clearer version of our response for you.",
  translate: "[Translated] ধন্যবাদ আপনার বার্তার জন্য — আমরা শিঘ্রই বিস্তারিত পাঠাব।",
  professional:
    "Dear valued customer, thank you for your inquiry. Our team is reviewing the details and will provide a formal response within one business day.",
  friendly:
    "Hey! Thanks so much for messaging us 😊 We're on it and will get back to you super soon!",
  short: "Thanks! We'll follow up shortly.",
  long:
    "Hello and thank you for contacting ENMASCO K2 Social Flow support. We truly value your business and want to make sure everything is handled perfectly. Our specialist team is currently reviewing your request in detail, and we will follow up with a complete, tailored answer within the next business day. In the meantime, if there is anything else you need, please don't hesitate to let us know!",
};

export default function AIReplyPanel({
  onApply,
}: {
  onApply: (text: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Sparkles className="h-4 w-4 text-violet-300" strokeWidth={1.8} />
        <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
        <span className="ml-auto rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-200">
          Mock
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              onClick={() => onApply(MOCK[a.key])}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-medium text-white/75 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
