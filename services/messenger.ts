import { prisma } from "@/lib/db";
import type {
  ConversationDTO,
  MessageDTO,
  ConversationMemberDTO,
  MessengerUser,
  ReactionDTO,
  ReactionEmoji,
} from "@/types/messenger";
import { encrypt, decrypt } from "@/lib/crypto";

const REACTION_CHARS: Record<ReactionEmoji, string> = {
  LIKE: "👍",
  HEART: "❤️",
  FIRE: "🔥",
  CLAP: "👏",
  LAUGH: "😂",
  WOW: "😮",
  CRY: "😢",
  PARTY: "🎉",
};

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

function mapReactions(rows: { emoji: ReactionEmoji; userId: string }[], meId?: string): ReactionDTO[] {
  const byEmoji = new Map<ReactionEmoji, string[]>();
  for (const r of rows) {
    const list = byEmoji.get(r.emoji) ?? [];
    list.push(r.userId);
    byEmoji.set(r.emoji, list);
  }
  return (Object.keys(REACTION_CHARS) as ReactionEmoji[])
    .map((emoji) => {
      const userIds = byEmoji.get(emoji) ?? [];
      return {
        emoji,
        count: userIds.length,
        userIds,
        reactedByMe: meId ? userIds.includes(meId) : false,
      } as ReactionDTO;
    })
    .filter((r) => r.count > 0);
}

export async function serializeMessage(msg: any, meId?: string): Promise<MessageDTO> {
  const content = msg.encryptedContent
    ? (() => {
        try {
          return decrypt(msg.encryptedContent);
        } catch {
          return msg.content;
        }
      })()
    : msg.content;

  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.sender?.avatar ?? null,
    content,
    status: msg.status,
    replyToId: msg.replyToId ?? null,
    replyTo: msg.replyTo
      ? { id: msg.replyTo.id, senderName: msg.replyTo.senderName, content: msg.replyTo.content }
      : null,
    isEdited: msg.isEdited,
    isDeleted: msg.isDeleted,
    isPinned: msg.isPinned,
    isStarred: msg.isStarred,
    isBookmarked: msg.isBookmarked,
    isRecalled: msg.isRecalled,
    mentions: msg.mentions ?? [],
    translations: msg.translations ?? null,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
    attachments: (msg.attachments ?? []).map((a: any) => ({
      id: a.id,
      kind: a.kind,
      fileName: a.fileName,
      originalName: a.originalName,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
      url: a.url,
      thumbnailUrl: a.thumbnailUrl ?? null,
      duration: a.duration ?? null,
    })),
    reactions: mapReactions(msg.reactions ?? [], meId),
    readReceipts: (msg.readReceipts ?? []).map((r: any) => ({
      userId: r.userId,
      status: r.status,
      at: r.at.toISOString(),
    })),
    voice: msg.voice
      ? {
          url: msg.voice.url,
          duration: msg.voice.duration,
          transcript: msg.voice.transcript ?? null,
          waveform: msg.voice.waveform ?? [],
        }
      : null,
    forwardedFromId: msg.forwardedFromId ?? null,
  };
}

export async function serializeConversation(
  conv: any,
  meId?: string,
): Promise<ConversationDTO> {
  const me = conv.members?.find((m: any) => m.userId === meId);
  const unreadCount = me?.unreadCount ?? 0;
  const members: MessengerUser[] = (conv.members ?? []).map((m: any) => ({
    id: m.userId,
    name: m.user?.name ?? "Unknown",
    avatar: m.user?.avatar ?? null,
    role: m.user?.role?.name ?? m.role,
    department: m.user?.department?.name ?? null,
    status: (m as any).presence?.status ?? "OFFLINE",
  }));
  const last = conv.messages?.[0];
  return {
    id: conv.id,
    kind: conv.kind,
    title: conv.title ?? members.map((m) => m.name).join(", "),
    description: conv.description ?? null,
    avatarUrl: conv.avatarUrl ?? null,
    isPinned: conv.isPinned,
    isStarred: conv.isStarred,
    isArchived: conv.isArchived,
    isEncrypted: conv.isEncrypted,
    isCeoChannel: conv.isCeoChannel,
    isBroadcast: conv.isBroadcast,
    departmentId: conv.departmentId ?? null,
    lastMessageAt: conv.lastMessageAt.toISOString(),
    unreadCount,
    hasUnread: unreadCount > 0,
    lastMessage: last
      ? {
          content: last.content,
          senderName: last.senderName,
          createdAt: last.createdAt.toISOString(),
          isCeo: last.senderId === conv.createdById,
        }
      : null,
    members,
    memberCount: members.length,
    presence: members.find((m) => m.id === meId)?.status,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const messageInclude = {
  sender: { select: { id: true, name: true, avatar: true } },
  attachments: true,
  reactions: { select: { emoji: true, userId: true } },
  readReceipts: true,
  voice: true,
  replyTo: { select: { id: true, senderName: true, content: true } },
} as const;

const convInclude = {
  members: {
    include: {
      user: { select: { id: true, name: true, avatar: true, role: true, department: true } },
    },
  },
  messages: { take: 1, orderBy: { createdAt: "desc" }, select: { content: true, senderName: true, createdAt: true, senderId: true } },
} as const;

export async function listConversationsForUser(userId: string, opts?: { kind?: string; archived?: boolean }) {
  const where: any = {
    members: { some: { userId } },
  };
  if (opts?.kind) where.kind = opts.kind;
  if (opts?.archived !== undefined) where.isArchived = opts.archived;
  const convs = await prisma.conversation.findMany({
    where,
    include: convInclude,
    orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
  });
  return Promise.all(convs.map((c) => serializeConversation(c, userId)));
}

export async function getConversation(conversationId: string, userId: string) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, members: { some: { userId } } },
    include: convInclude,
  });
  if (!conv) return null;
  return serializeConversation(conv, userId);
}

export async function getMessages(conversationId: string, userId: string, take = 50, cursor?: string) {
  const msgs = await prisma.message.findMany({
    where: { conversationId, isRecalled: false },
    include: messageInclude,
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = msgs.length > take;
  const sliced = hasMore ? msgs.slice(0, take) : msgs;
  const serialized = await Promise.all(sliced.reverse().map((m) => serializeMessage(m, userId)));
  return { messages: serialized, hasMore };
}

export async function getPinnedMessages(conversationId: string, userId: string) {
  const msgs = await prisma.message.findMany({
    where: { conversationId, isPinned: true, isRecalled: false },
    include: messageInclude,
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(msgs.map((m) => serializeMessage(m, userId)));
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  replyToId?: string | null;
  mentions?: string[];
  attachments?: any[];
  voice?: any;
  forwardedFromId?: string | null;
  encrypt?: boolean;
}) {
  const conv = await prisma.conversation.findFirst({
    where: { id: data.conversationId, members: { some: { userId: data.senderId } } },
  });
  if (!conv) throw new Error("Conversation not found or access denied");

  const encryptedContent = data.encrypt === false ? null : encrypt(data.content);
  const msg = await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.encrypt === false ? data.content : "",
      encryptedContent,
      replyToId: data.replyToId ?? null,
      mentions: data.mentions ?? [],
      forwardedFromId: data.forwardedFromId ?? null,
      attachments: data.attachments?.length
        ? { create: data.attachments }
        : undefined,
      voice: data.voice ? { create: data.voice } : undefined,
    },
    include: messageInclude,
  });

  // update conversation lastMessageAt + bump unread for other members
  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: { lastMessageAt: new Date() },
  });
  await prisma.conversationMember.updateMany({
    where: { conversationId: data.conversationId, userId: { not: data.senderId } },
    data: { unreadCount: { increment: 1 } },
  });

  return serializeMessage(msg, data.senderId);
}

export async function updateMessage(messageId: string, userId: string, content: string, doEncrypt = true) {
  const existing = await prisma.message.findUnique({ where: { id: messageId } });
  if (!existing || existing.senderId !== userId) throw new Error("Not allowed");
  const editHistory = Array.isArray(existing.editHistory) ? existing.editHistory : [];
  editHistory.push({ content: decrypt(existing.encryptedContent ?? existing.content), at: new Date().toISOString() });
  const msg = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: doEncrypt ? "" : content,
      encryptedContent: doEncrypt ? encrypt(content) : null,
      isEdited: true,
      editHistory,
    },
    include: messageInclude,
  });
  return serializeMessage(msg, userId);
}

export async function deleteMessage(messageId: string, userId: string) {
  const existing = await prisma.message.findUnique({ where: { id: messageId } });
  if (!existing || existing.senderId !== userId) throw new Error("Not allowed");
  const msg = await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, content: "", encryptedContent: null, attachments: { deleteMany: {} } },
    include: messageInclude,
  });
  return serializeMessage(msg, userId);
}

export async function recallMessage(messageId: string, userId: string) {
  const existing = await prisma.message.findUnique({ where: { id: messageId } });
  if (!existing || existing.senderId !== userId) throw new Error("Not allowed");
  const msg = await prisma.message.update({
    where: { id: messageId },
    data: { isRecalled: true, isDeleted: true, content: "", encryptedContent: null },
    include: messageInclude,
  });
  return serializeMessage(msg, userId);
}

export async function toggleReaction(messageId: string, userId: string, emoji: ReactionEmoji) {
  const existing = await prisma.reaction.findUnique({ where: { messageId_userId_emoji: { messageId, userId, emoji } } });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { messageId, userId, emoji } });
  }
  const msg = await prisma.message.findUnique({ where: { id: messageId }, include: messageInclude });
  return msg ? serializeMessage(msg, userId) : null;
}

export async function markRead(conversationId: string, userId: string) {
  await prisma.conversationMember.updateMany({
    where: { conversationId, userId },
    data: { unreadCount: 0, lastReadAt: new Date() },
  });
  // mark messages as read
  const msgs = await prisma.message.findMany({
    where: { conversationId, senderId: { not: userId }, isRecalled: false },
    select: { id: true },
  });
  for (const m of msgs) {
    await prisma.readReceipt.upsert({
      where: { messageId_userId: { messageId: m.id, userId } },
      update: { status: "READ", at: new Date() },
      create: { messageId: m.id, userId, status: "READ" },
    });
  }
}

export async function ensureDirectConversation(userA: string, userB: string) {
  const existing = await prisma.conversation.findFirst({
    where: {
      kind: "DIRECT",
      AND: [
        { members: { some: { userId: userA } } },
        { members: { some: { userId: userB } } },
      ],
      members: { every: { userId: { in: [userA, userB] } } },
    },
    include: convInclude,
  });
  if (existing) return serializeConversation(existing, userA);
  const b = await prisma.user.findUnique({ where: { id: userB }, select: { name: true, role: true, department: true } });
  const conv = await prisma.conversation.create({
    data: {
      kind: "DIRECT",
      title: b?.name ?? "Direct",
      members: { create: [{ userId: userA }, { userId: userB }] },
    },
    include: convInclude,
  });
  return serializeConversation(conv, userA);
}

export async function createGroupOrChannel(data: {
  kind: "GROUP" | "CHANNEL" | "DEPARTMENT";
  title: string;
  description?: string;
  memberIds: string[];
  createdById: string;
  departmentId?: string;
  isCeoChannel?: boolean;
  isBroadcast?: boolean;
}) {
  const conv = await prisma.conversation.create({
    data: {
      kind: data.kind,
      title: data.title,
      description: data.description ?? null,
      departmentId: data.departmentId ?? null,
      isCeoChannel: data.isCeoChannel ?? false,
      isBroadcast: data.isBroadcast ?? false,
      members: { create: [{ userId: data.createdById, role: "OWNER" }, ...data.memberIds.filter((id) => id !== data.createdById).map((id) => ({ userId: id }))] },
    },
    include: convInclude,
  });
  return serializeConversation(conv, data.createdById);
}
