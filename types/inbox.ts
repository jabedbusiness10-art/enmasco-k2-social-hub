// TASK-41 Unified Social Inbox — domain types
// Platforms: live (FB/IG/LinkedIn) + future-ready (X/TikTok/WhatsApp).

export type InboxPlatform =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "tiktok"
  | "whatsapp";

export type ConversationStatus =
  | "UNREAD"
  | "REPLIED"
  | "PENDING"
  | "RESOLVED"
  | "CLOSED";

export type MessageSender = "CUSTOMER" | "AGENT" | "SYSTEM" | "AI";

export type InboxFolder =
  | "ALL"
  | "UNREAD"
  | "ASSIGNED"
  | "STARRED"
  | "ARCHIVED"
  | "SPAM";

export interface Conversation {
  id: string;
  platform: InboxPlatform;
  customer: string;
  avatar?: string;
  lastMessage: string;
  lastActivity: string; // ISO
  unread: number;
  status: ConversationStatus;
  starred?: boolean;
  assignedTo?: string;
  spam?: boolean;
  archived?: boolean;
  tags: string[];
  priority: "LOW" | "MEDIUM" | "HIGH";
  conversationCount: number;
  firstContact: string; // ISO
}

export interface InboxMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  sentAt: string;
  attachment?: string;
}

export interface CustomerProfileData {
  id: string;
  name: string;
  platform: InboxPlatform;
  firstContact: string;
  lastActivity: string;
  conversationCount: number;
  tags: string[];
  assignedAgent: string;
}

export interface InboxNotification {
  platform: InboxPlatform;
  count: number;
}

export interface QuickReply {
  id: string;
  title: string;
  text: string;
}
