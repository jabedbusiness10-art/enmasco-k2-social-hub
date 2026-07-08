import type { AiModule, AiMessage } from "@/types/ai";

export const aiModules: { id: AiModule; label: string; description: string }[] = [
  { id: "CHAT", label: "K2Kai Chat", description: "Conversational assistant for operations." },
  { id: "WRITER", label: "K2Kai Writer", description: "Draft emails, posts, and reports." },
  { id: "SOCIAL", label: "K2Kai Social", description: "Social captions, hashtags, and content ideas." },
  { id: "ANALYTICS", label: "K2Kai Analytics", description: "Data insights and trend summaries." },
  { id: "REPORTS", label: "K2Kai Reports", description: "Weekly and monthly report generation." },
  { id: "SALES", label: "K2Kai Sales", description: "Quotations, proposals, and follow-ups." },
  { id: "SECURITY", label: "K2Kai Security", description: "Security knowledge base and SOPs." },
  { id: "CREATIVE", label: "K2Kai Creative", description: "Visual ideas, banners, and promos." },
  { id: "AUTOMATION", label: "K2Kai Automation", description: "Flows, rules, and assistant automations." },
];

export const aiMessages: AiMessage[] = [
  { id: "m1", role: "user", content: "Generate a Facebook caption for our new CCTV installation.", createdAt: "2026-07-08T12:00:00" },
  { id: "m2", role: "assistant", content: "✅ Secure the future with Hikvision CCTV installation by ENMASCO — smart monitoring for modern businesses.", createdAt: "2026-07-08T12:00:10" },
  { id: "m3", role: "user", content: "Prepare monthly security report.", createdAt: "2026-07-08T12:05:00" },
  { id: "m4", role: "assistant", content: "📄 Report drafted with site visits, incidents, and pending actions. Want me to save it?", createdAt: "2026-07-08T12:05:15" },
];
