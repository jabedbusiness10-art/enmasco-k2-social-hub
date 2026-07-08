export type InboxPlatform = "facebook" | "instagram" | "linkedin" | "website";
export type ConversationStatus = "OPEN" | "ASSIGNED" | "CLOSED";
export type MessageSender = "CUSTOMER" | "AGENT" | "SYSTEM";

export interface Conversation {
  id: string;
  platform: InboxPlatform;
  customer: string;
  avatar?: string;
  lastMessage: string;
  unread: number;
  status: ConversationStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedTo?: string;
  lastActivity: string;
  tags: string[];
}

export interface InboxMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  sentAt: string;
  internalNote?: boolean;
  attachment?: string;
}

export interface CustomerProfile {
  name: string;
  platform: InboxPlatform;
  firstContact: string;
  lastActivity: string;
  assignedStaff?: string;
  status: ConversationStatus;
  tags: string[];
  notes: string;
  interactionHistory: { date: string; action: string }[];
}

export interface QuickReply {
  id: string;
  title: string;
  text: string;
}
