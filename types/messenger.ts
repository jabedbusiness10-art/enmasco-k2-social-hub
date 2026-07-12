// K2 Messenger shared types (TASK-44)

export type ConversationKind =
  | "DIRECT"
  | "GROUP"
  | "CHANNEL"
  | "DEPARTMENT"
  | "ANNOUNCEMENT"
  | "CEO_BROADCAST"
  | "COMPANY_BROADCAST";

export type PresenceStatus = "ONLINE" | "OFFLINE" | "BUSY" | "AWAY" | "DND";

export type MsgStatus = "SENT" | "DELIVERED" | "READ";

export type AttachmentKind =
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "PDF"
  | "WORD"
  | "EXCEL"
  | "POWERPOINT"
  | "ZIP"
  | "OTHER";

export type ReactionEmoji = "LIKE" | "HEART" | "FIRE" | "CLAP" | "LAUGH" | "WOW" | "CRY" | "PARTY";

export type SupportedLang = "en" | "ar" | "bn" | "hi" | "auto";

export interface MessengerUser {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  department?: string | null;
  status?: PresenceStatus;
  lastSeen?: string;
}

export interface AttachmentDTO {
  id: string;
  kind: AttachmentKind;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
}

export interface ReactionDTO {
  emoji: ReactionEmoji;
  count: number;
  userIds: string[];
  reactedByMe: boolean;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  status: MsgStatus;
  replyToId?: string | null;
  replyTo?: { id: string; senderName: string; content: string } | null;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isStarred: boolean;
  isBookmarked: boolean;
  isRecalled: boolean;
  mentions: string[];
  translations?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentDTO[];
  reactions: ReactionDTO[];
  readReceipts?: { userId: string; status: MsgStatus; at: string }[];
  voice?: { url: string; duration: number; transcript?: string | null; waveform: number[] } | null;
  forwardedFromId?: string | null;
}

export interface ConversationMemberDTO {
  userId: string;
  name: string;
  avatar?: string | null;
  role: string;
  isMuted: boolean;
  isFavorite: boolean;
  unreadCount: number;
  typing: boolean;
}

export interface ConversationDTO {
  id: string;
  kind: ConversationKind;
  title: string;
  description?: string | null;
  avatarUrl?: string | null;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isEncrypted: boolean;
  isCeoChannel: boolean;
  isBroadcast: boolean;
  departmentId?: string | null;
  lastMessageAt: string;
  unreadCount: number;
  hasUnread: boolean;
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
    isCeo?: boolean;
  } | null;
  members: MessengerUser[];
  memberCount: number;
  presence?: PresenceStatus;
}

// ---- Realtime socket event payloads ----

export interface ServerToClientEvents {
  "message:new": (msg: MessageDTO) => void;
  "message:updated": (msg: MessageDTO) => void;
  "message:deleted": (data: { id: string; conversationId: string }) => void;
  "typing": (data: { conversationId: string; userId: string; name: string; typing: boolean }) => void;
  "presence:update": (data: { userId: string; status: PresenceStatus; lastSeen: string }) => void;
  "receipt:update": (data: { messageId: string; userId: string; status: MsgStatus }) => void;
  "reaction:update": (data: { messageId: string; reactions: ReactionDTO[] }) => void;
  "conversation:update": (conv: ConversationDTO) => void;
  "unread:update": (data: { conversationId: string; unreadCount: number }) => void;
  "notification:new": (n: ClientNotification) => void;
  "connect_error": (err: Error) => void;
}

export interface ClientToServerEvents {
  "identify": (data: { userId: string; name: string }) => void;
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
  "message:send": (data: OutgoingMessage) => void;
  "typing": (data: { conversationId: string; typing: boolean }) => void;
  "presence:set": (status: PresenceStatus) => void;
  "receipt:send": (data: { messageId: string; status: MsgStatus }) => void;
}

export interface OutgoingMessage {
  conversationId: string;
  content: string;
  replyToId?: string | null;
  mentions?: string[];
  attachments?: { kind: AttachmentKind; fileName: string; originalName: string; mimeType: string; fileSize: number; url: string; thumbnailUrl?: string | null; duration?: number | null }[];
  voice?: { url: string; duration: number; transcript?: string | null; waveform: number[] };
  forwardedFromId?: string | null;
}

export interface ClientNotification {
  id: string;
  type: "MENTION" | "MESSAGE" | "CEO" | "ANNOUNCEMENT";
  title: string;
  body?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  priority: "NORMAL" | "HIGH" | "CEO";
  createdAt: string;
}

// ---- AI / translate ----

export interface AISuggestion {
  type: "reply" | "rewrite" | "grammar" | "summary" | "tasks" | "reminder" | "meeting";
  result: string;
}

export const REACTION_EMOJIS: { key: ReactionEmoji; char: string }[] = [
  { key: "LIKE", char: "👍" },
  { key: "HEART", char: "❤️" },
  { key: "FIRE", char: "🔥" },
  { key: "CLAP", char: "👏" },
  { key: "LAUGH", char: "😂" },
  { key: "WOW", char: "😮" },
  { key: "CRY", char: "😢" },
  { key: "PARTY", char: "🎉" },
];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: "English",
  ar: "Arabic",
  bn: "Bengali",
  hi: "Hindi",
  auto: "Auto Detect",
};
