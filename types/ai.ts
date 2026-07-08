export interface AiModule {
  id: string;
  label: string;
  description: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// TASK-27 additions
export interface AITool {
  id: string;
  title: string;
  description: string;
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
}

export interface AISetting {
  model: string;
  responseStyle: string;
  language: string;
  creativity: string;
  responseLength: string;
  autoSaveHistory: boolean;
}

export interface AIInsight {
  requestsToday: string;
  avgResponseTime: string;
  contentGenerated: string;
  aiRepliesCreated: string;
  postsAnalyzed: string;
  automationTasks: string;
}
