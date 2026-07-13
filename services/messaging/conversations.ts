import { prisma } from "@/lib/db";
import type { ConversationDTO, ConversationMemberDTO, MessengerUser } from "@/types/messenger";

// ---------------------------------------------------------------------------
// TASK-49 — Enterprise Direct Message Center service.
// DB-backed, social-platform aware. Reuses the existing Conversation model
// (extended in schema) + Message/Attachment. All reads are scoped to the
// requesting user's memberships. Never returns platform access tokens.
// ---------------------------------------------------------------------------

export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "WEBSITE" | "WHATSAPP";
export type ConvStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
export type ConvPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ListConversationsOpts {
  platform?: SocialPlatform;
  status?: ConvStatus;
  priority?: ConvPriority;
  labelId?: string;
  assignedToId?: string;
  starred?: boolean;
  pinned?: boolean;
  archived?: boolean;
  search?: string;
  take?: number;
}

const memberInclude = {
  user: { select: { id: true, name: true, avatar: true, role: true, department: true } },
} as const;

const convInclude = {
  members: { include: memberInclude },
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" },
    select: { content: true, senderName: true, createdAt: true, senderId: true, isRecalled: true },
  },
  customer: true,
  assignments: { include: { assignedTo: { select: { id: true, name: true, avatar: true } } }, orderBy: { assignedAt: "desc" }, take: 1 },
  labels: false,
} as const;

export interface SocialCustomerDTO {
  id: string;
  name: string;
  platform?: string | null;
  externalId?: string | null;
  avatarUrl?: string | null;
  locale?: string | null;
}

export interface ConversationListItem extends ConversationDTO {
  platform?: string | null;
  externalId?: string | null;
  priority: ConvPriority;
  status: ConvStatus;
  labelIds: string[];
  customer?: SocialCustomerDTO | null;
  assignedTo?: { id: string; name: string; avatar?: string | null } | null;
}

function serializeConv(conv: any, meId?: string): ConversationListItem {
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
  const assigned = conv.assignments?.[0]?.assignedTo;
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
      ? { content: last.isRecalled ? "Message recalled" : last.content, senderName: last.senderName, createdAt: last.createdAt.toISOString(), isCeo: last.senderId === conv.createdById }
      : null,
    members,
    memberCount: members.length,
    presence: members.find((m) => m.id === meId)?.status,
    // TASK-49 extensions
    platform: conv.platform ?? null,
    externalId: conv.externalId ?? null,
    priority: conv.priority ?? "MEDIUM",
    status: conv.status ?? "OPEN",
    labelIds: conv.labelIds ?? [],
    customer: conv.customer
      ? { id: conv.customer.id, name: conv.customer.name, platform: conv.customer.platform ?? null, externalId: conv.customer.externalId ?? null, avatarUrl: conv.customer.avatarUrl ?? null, locale: conv.customer.locale ?? null }
      : null,
    assignedTo: assigned ? { id: assigned.id, name: assigned.name, avatar: assigned.avatar ?? null } : null,
  };
}

export async function listSocialConversations(userId: string, opts: ListConversationsOpts = {}) {
  const where: any = { members: { some: { userId } } };
  if (opts.platform) where.platform = opts.platform;
  if (opts.status) where.status = opts.status;
  if (opts.priority) where.priority = opts.priority;
  if (opts.labelId) where.labelIds = { has: opts.labelId };
  if (opts.assignedToId) where.assignedToId = opts.assignedToId;
  if (opts.starred) where.isStarred = true;
  if (opts.pinned) where.isPinned = true;
  if (opts.archived !== undefined) where.isArchived = opts.archived;
  if (opts.search) {
    where.OR = [
      { title: { contains: opts.search, mode: "insensitive" } },
      { customer: { name: { contains: opts.search, mode: "insensitive" } } },
    ];
  }
  const convs = await prisma.conversation.findMany({
    where,
    include: convInclude,
    orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
    take: opts.take ?? 100,
  });
  return convs.map((c) => serializeConv(c, userId));
}

export async function searchSocialConversations(userId: string, q: string) {
  return listSocialConversations(userId, { search: q });
}

export async function getConversationThread(conversationId: string, userId: string, take = 50) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, members: { some: { userId } } },
    include: { ...convInclude, customer: true },
  });
  if (!conv) return null;
  const msgs = await prisma.message.findMany({
    where: { conversationId, isRecalled: false },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      attachments: true,
      reactions: { select: { emoji: true, userId: true } },
      readReceipts: true,
      voice: true,
    },
  });
  return { conversation: serializeConv(conv, userId), messages: msgs.reverse() };
}

export async function sendSocialMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  attachments: any[] = [],
) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, members: { some: { userId: senderId } } },
  });
  if (!conv) throw new Error("Conversation not found or access denied");
  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      senderName,
      content,
      attachments: attachments.length ? { create: attachments } : undefined,
    },
    include: {
      attachments: true,
      reactions: { select: { emoji: true, userId: true } },
      readReceipts: true,
      voice: true,
    },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });
  await prisma.conversationMember.updateMany({
    where: { conversationId, userId: { not: senderId } },
    data: { unreadCount: { increment: 1 } },
  });
  return msg;
}

export async function updateConversationStatus(conversationId: string, userId: string, status: ConvStatus) {
  // ensure membership
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, members: { some: { userId } } } });
  if (!conv) throw new Error("Access denied");
  return prisma.conversation.update({ where: { id: conversationId }, data: { status } });
}

export async function setConversationMeta(conversationId: string, userId: string, data: { isStarred?: boolean; isPinned?: boolean; priority?: ConvPriority; labelIds?: string[] }) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, members: { some: { userId } } } });
  if (!conv) throw new Error("Access denied");
  return prisma.conversation.update({ where: { id: conversationId }, data });
}

export async function assignConversation(conversationId: string, assignedToId: string, assignedById: string) {
  const created = await prisma.conversationAssignment.create({
    data: { conversationId, assignedToId, assignedById },
    include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { assignedToId } });
  return created;
}

// ---- Labels ----

export async function listLabels(companyId?: string) {
  return prisma.conversationLabel.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { name: "asc" },
  });
}

export async function createLabel(name: string, color = "#38bdf8", companyId?: string) {
  return prisma.conversationLabel.create({ data: { name, color, companyId } });
}

export async function updateLabel(id: string, data: { name?: string; color?: string }) {
  return prisma.conversationLabel.update({ where: { id }, data });
}

export async function deleteLabel(id: string) {
  return prisma.conversationLabel.delete({ where: { id } });
}
