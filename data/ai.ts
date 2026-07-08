import type { AiModule, AiMessage, AITool, AIConversation, PromptTemplate, AISetting, AIInsight } from "@/types/ai";

export const aiModules: AiModule[] = [
  { id: "CHAT", label: "K2Kai Chat", description: "General assistant." },
  { id: "WRITER", label: "Writer", description: "Long-form content." },
  { id: "SOCIAL", label: "Social", description: "Posts and captions." },
  { id: "ANALYTICS", label: "Analytics", description: "Performance insights." },
  { id: "REPORTS", label: "Reports", description: "Weekly summaries." },
  { id: "SALES", label: "Sales", description: "Quotation support." },
  { id: "SECURITY", label: "Security", description: "Security content." },
  { id: "CREATIVE", label: "Creative", description: "Creative direction." },
  { id: "AUTOMATION", label: "Automation", description: "Workflow helpers." },
];

export const aiMessages: AiMessage[] = [
  { id: "x1", role: "assistant", content: "Welcome to K2Kai AI - Your Enterprise Intelligence Assistant for ENMASCO Security Trading Co.", createdAt: "2026-07-08 12:00" },
  { id: "x2", role: "user", content: "Generate 5 Facebook captions for Eid sale.", createdAt: "2026-07-08 14:00" },
  { id: "x3", role: "assistant", content: "Here are 5 captions for Eid sale: 1) ...", createdAt: "2026-07-08 14:01" },
  { id: "x4", role: "user", content: "Make them shorter.", createdAt: "2026-07-08 14:02" },
  { id: "x5", role: "assistant", content: "Short versions ready.", createdAt: "2026-07-08 14:02" },
];

export const aiTools: AITool[] = [
  { id: "t1", title: "AI Caption Generator", description: "Generate captions for social posts." },
  { id: "t2", title: "Customer Reply Assistant", description: "Draft customer replies." },
  { id: "t3", title: "Content Planner", description: "Plan weekly content ideas." },
  { id: "t4", title: "Social Performance Analyzer", description: "Analyze post performance." },
  { id: "t5", title: "Translator", description: "Translate Arabic ↔ English." },
  { id: "t6", title: "Blog Writer", description: "Draft marketing blogs." },
  { id: "t7", title: "Marketing Copy", description: "Create ad copies." },
  { id: "t8", title: "Hashtag Generator", description: "Suggest hashtags." },
  { id: "t9", title: "Proposal Generator", description: "Generate proposals." },
  { id: "t10", title: "Email Assistant", description: "Draft outreach emails." },
];

export const conversations: AIConversation[] = [
  { id: "a1", title: "Eid Campaign Captions", createdAt: "2026-07-08" },
  { id: "a2", title: "LinkedIn Post Ideas", createdAt: "2026-07-07" },
  { id: "a3", title: "Customer Reply Draft", createdAt: "2026-07-08" },
];

export const promptTemplates: PromptTemplate[] = [
  { id: "p1", title: "Generate Facebook Caption", prompt: "Write a Facebook caption for ENMASCO..." },
  { id: "p2", title: "Generate LinkedIn Post", prompt: "Draft a LinkedIn post about ENMASCO solutions..." },
  { id: "p3", title: "Write Product Description", prompt: "Write a product description for..." },
  { id: "p4", title: "Reply to Customer", prompt: "Reply politely to the customer..." },
  { id: "p5", title: "Translate Arabic ↔ English", prompt: "Translate this text keeping brand tone..." },
  { id: "p6", title: "Create Weekly Content Plan", prompt: "Create a 7-day social content plan..." },
  { id: "p7", title: "Generate Marketing Proposal", prompt: "Generate a proposal for..." },
  { id: "p8", title: "SEO Optimization", prompt: "Optimize this text for SEO..." },
];

export const aiSettings: AISetting = {
  model: "K2Kai Default",
  responseStyle: "Professional",
  language: "English",
  creativity: "Medium",
  responseLength: "Medium",
  autoSaveHistory: true,
};

export const aiInsights: AIInsight = {
  requestsToday: "128",
  avgResponseTime: "1.2s",
  contentGenerated: "84",
  aiRepliesCreated: "45",
  postsAnalyzed: "27",
  automationTasks: "18",
};
