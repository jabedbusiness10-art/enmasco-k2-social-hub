export type AiModule =
  | "CHAT"
  | "WRITER"
  | "SOCIAL"
  | "ANALYTICS"
  | "REPORTS"
  | "SALES"
  | "SECURITY"
  | "CREATIVE"
  | "AUTOMATION";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
