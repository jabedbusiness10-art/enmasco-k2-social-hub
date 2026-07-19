import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { notifySocial, notifyTeam } from "@/lib/notifications";
import { writeAudit } from "@/lib/security/audit";
import type { NextRequest } from "next/server";

export type InboxProvider = "FACEBOOK" | "INSTAGRAM" | "YOUTUBE" | "WEBSITE" | "LINKEDIN" | "TIKTOK";
export type InboxStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
export type InboxPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface InboxFilters {
  provider?: InboxProvider;
  status?: InboxStatus;
  priority?: InboxPriority;
  assignedToId?: string;
  unread?: boolean;
  starred?: boolean;
  archived?: boolean;
  spam?: boolean;
  tag?: string;
  customer?: string;
  search?: string;
  from?: Date;
  to?: Date;
}

export interface InboxActor { id: string; name: string; canViewAll: boolean }

const SOCIAL_PLATFORMS: InboxProvider[] = ["FACEBOOK", "INSTAGRAM", "YOUTUBE", "WEBSITE", "LINKEDIN", "TIKTOK"];

function cleanText(value: unknown, max = 10_000): string {
  return String(value ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function scopeWhere(actor: InboxActor): Prisma.ConversationWhereInput {
  if (actor.canViewAll) return {};
  return { OR: [{ assignedToId: actor.id }, { assignedToId: null }, { members: { some: { userId: actor.id } } }] };
}

export async function findAccessibleInboxConversation(actor: InboxActor, id: string) {
  return prisma.conversation.findFirst({ where: { id, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] }, include: { customer: true } });
}

function filterWhere(actor: InboxActor, filters: InboxFilters): Prisma.ConversationWhereInput {
  const AND: Prisma.ConversationWhereInput[] = [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }];
  if (filters.provider) AND.push({ platform: filters.provider });
  if (filters.status) AND.push({ status: filters.status });
  if (filters.priority) AND.push({ priority: filters.priority });
  if (filters.assignedToId) AND.push({ assignedToId: filters.assignedToId });
  if (filters.unread !== undefined) AND.push(filters.unread ? { inboxUnreadCount: { gt: 0 } } : { inboxUnreadCount: 0 });
  if (filters.starred !== undefined) AND.push({ isStarred: filters.starred });
  if (filters.archived !== undefined) AND.push({ isArchived: filters.archived });
  if (filters.spam !== undefined) AND.push({ isSpam: filters.spam });
  if (filters.tag) AND.push({ labelIds: { has: filters.tag } });
  if (filters.customer) AND.push({ customer: { name: { contains: filters.customer, mode: "insensitive" } } });
  if (filters.from || filters.to) AND.push({ lastMessageAt: { gte: filters.from, lte: filters.to } });
  if (filters.search) AND.push({ OR: [
    { title: { contains: filters.search, mode: "insensitive" } },
    { participantUsername: { contains: filters.search, mode: "insensitive" } },
    { customer: { name: { contains: filters.search, mode: "insensitive" } } },
    { messages: { some: { content: { contains: filters.search, mode: "insensitive" }, isInternalNote: false } } },
  ] });
  return { AND };
}

function uiStatus(row: any): "UNREAD" | "REPLIED" | "PENDING" | "RESOLVED" | "CLOSED" {
  if (row.inboxUnreadCount > 0) return "UNREAD";
  if (row.status === "RESOLVED") return "RESOLVED";
  if (row.status === "CLOSED") return "CLOSED";
  if (row.status === "PENDING") return "PENDING";
  return row.hasReplied ? "REPLIED" : "PENDING";
}

function serializeConversation(row: any) {
  const last = row.messages?.[0];
  const assignment = row.assignments?.[0];
  return {
    id: row.id,
    platform: String(row.platform ?? "WEBSITE").toLowerCase(),
    providerAccountId: row.platformAccountId,
    externalConversationId: row.externalId,
    externalParticipantId: row.externalParticipantId,
    customer: row.customer?.name ?? row.title ?? row.externalParticipantId ?? "Unknown customer",
    username: row.participantUsername ?? row.customer?.username ?? null,
    avatar: row.customer?.avatarUrl ?? row.avatarUrl ?? null,
    lastMessage: last?.content ?? "",
    lastActivity: row.lastMessageAt.toISOString(),
    unread: row.inboxUnreadCount,
    status: uiStatus(row),
    starred: row.isStarred,
    assignedTo: assignment?.assignedTo?.name ?? null,
    assignedToId: row.assignedToId,
    spam: row.isSpam,
    archived: row.isArchived,
    tags: row.labelIds ?? [],
    priority: row.priority,
    conversationCount: row.customer?._count?.conversations ?? 1,
    firstContact: (row.firstContactAt ?? row.createdAt).toISOString(),
    sourceUrl: row.sourceUrl,
  };
}

const listInclude = {
  customer: { include: { _count: { select: { conversations: true } } } },
  messages: { where: { isInternalNote: false }, orderBy: { sentAt: "desc" as const }, take: 1, select: { content: true, sentAt: true } },
  assignments: { orderBy: { assignedAt: "desc" as const }, take: 1, include: { assignedTo: { select: { id: true, name: true, avatar: true } } } },
} as const;

export async function listInboxConversations(actor: InboxActor, filters: InboxFilters, page = 1, take = 30) {
  const safeTake = Math.min(100, Math.max(1, take));
  const safePage = Math.max(1, page);
  const where = filterWhere(actor, filters);
  const [rows, total] = await Promise.all([
    prisma.conversation.findMany({ where, include: listInclude, orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }], skip: (safePage - 1) * safeTake, take: safeTake }),
    prisma.conversation.count({ where }),
  ]);
  return { items: rows.map(serializeConversation), page: safePage, take: safeTake, total, pages: Math.ceil(total / safeTake) };
}

export async function getInboxConversation(actor: InboxActor, id: string) {
  const row = await prisma.conversation.findFirst({ where: { id, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] }, include: {
    ...listInclude,
    customer: { include: { _count: { select: { conversations: true } }, conversations: { select: { id: true, title: true, status: true, lastMessageAt: true }, orderBy: { lastMessageAt: "desc" }, take: 10 } } },
    notes: { orderBy: { createdAt: "asc" }, take: 100 },
  } });
  if (!row) return null;
  const conversation = serializeConversation(row);
  return {
    conversation,
    profile: {
      id: row.customer?.id ?? row.id,
      name: conversation.customer,
      platform: conversation.platform,
      firstContact: conversation.firstContact,
      lastActivity: conversation.lastActivity,
      conversationCount: row.customer?._count.conversations ?? 1,
      tags: row.labelIds,
      assignedAgent: conversation.assignedTo ?? "Unassigned",
      username: row.customer?.username ?? row.participantUsername,
      email: row.customer?.email ?? row.contactEmail,
      phone: row.customer?.phone ?? row.contactPhone,
      consentStatus: row.customer?.consentStatus ?? row.consentStatus,
      sourceUrl: row.sourceUrl,
      previousInquiries: row.customer?.conversations ?? [],
    },
    notes: row.notes,
  };
}

export async function listInboxMessages(actor: InboxActor, conversationId: string, page = 1, take = 50) {
  const accessible = await prisma.conversation.findFirst({ where: { id: conversationId, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] }, select: { id: true } });
  if (!accessible) return null;
  const safeTake = Math.min(100, Math.max(1, take));
  const safePage = Math.max(1, page);
  const where = { conversationId, isInternalNote: false, isDeleted: false };
  const [rows, total] = await Promise.all([
    prisma.message.findMany({ where, include: { attachments: true }, orderBy: [{ sentAt: "asc" }, { id: "asc" }], skip: (safePage - 1) * safeTake, take: safeTake }),
    prisma.message.count({ where }),
  ]);
  return { items: rows.map((m) => ({ id: m.id, externalId: m.externalId, conversationId, sender: m.direction === "INBOUND" ? "CUSTOMER" : m.senderType === "AI" ? "AI" : "AGENT", senderName: m.senderName, text: m.content, sentAt: m.sentAt.toISOString(), attachment: m.attachments[0]?.url, attachments: m.attachments, deliveryStatus: m.deliveryStatus, readStatus: m.readStatus, failureReason: m.failureReason })), page: safePage, take: safeTake, total };
}

export async function getInboxStats(actor: InboxActor, filters: InboxFilters) {
  const base = filterWhere(actor, filters);
  const [total, unread, replied, pending, resolved, assigned, starred, archived, spam, recentMessages, providerGroups] = await Promise.all([
    prisma.conversation.count({ where: base }),
    prisma.conversation.count({ where: { AND: [base, { inboxUnreadCount: { gt: 0 } }] } }),
    prisma.conversation.count({ where: { AND: [base, { hasReplied: true }] } }),
    prisma.conversation.count({ where: { AND: [base, { OR: [{ status: "PENDING" }, { status: "OPEN", hasReplied: false }] }] } }),
    prisma.conversation.count({ where: { AND: [base, { status: "RESOLVED" }] } }),
    prisma.conversation.count({ where: { AND: [base, { assignedToId: { not: null } }] } }),
    prisma.conversation.count({ where: { AND: [base, { isStarred: true }] } }),
    prisma.conversation.count({ where: { AND: [base, { isArchived: true }] } }),
    prisma.conversation.count({ where: { AND: [base, { isSpam: true }] } }),
    prisma.message.findMany({ where: { conversation: base, direction: { in: ["INBOUND", "OUTBOUND"] }, isInternalNote: false }, select: { conversationId: true, direction: true, sentAt: true }, orderBy: { sentAt: "desc" }, take: 2000 }),
    prisma.conversation.groupBy({ by: ["platform"], where: base, _sum: { inboxUnreadCount: true } }),
  ]);
  const byConversation = new Map<string, typeof recentMessages>();
  for (const message of recentMessages) byConversation.set(message.conversationId, [...(byConversation.get(message.conversationId) ?? []), message]);
  const responseTimes: number[] = [];
  for (const list of byConversation.values()) {
    const chronological = [...list].sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    for (let i = 0; i < chronological.length; i += 1) {
      if (chronological[i].direction !== "INBOUND") continue;
      const reply = chronological.slice(i + 1).find((m) => m.direction === "OUTBOUND");
      if (reply) { responseTimes.push(reply.sentAt.getTime() - chronological[i].sentAt.getTime()); break; }
    }
  }
  const averageResponseSeconds = responseTimes.length ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000) : null;
  const providerUnread = Object.fromEntries(providerGroups.filter((group) => group.platform).map((group) => [String(group.platform).toLowerCase(), group._sum.inboxUnreadCount ?? 0]));
  return { total, unread, replied, pending, resolved, assigned, starred, archived, spam, averageResponseSeconds, providerUnread };
}

export interface InboundMessageInput {
  provider: InboxProvider;
  providerAccountId: string;
  externalConversationId: string;
  externalParticipantId: string;
  externalMessageId: string;
  customerName?: string;
  username?: string;
  avatarUrl?: string;
  text: string;
  sentAt: Date;
  attachments?: Array<{ kind: any; fileName: string; originalName: string; mimeType: string; fileSize: number; url: string; thumbnailUrl?: string }>;
  sourceUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  providerMetadata?: Record<string, unknown>;
  priority?: InboxPriority;
  spam?: boolean;
}

export async function ingestInboundMessage(input: InboundMessageInput) {
  const existing = await prisma.message.findFirst({ where: { conversation: { platformAccountId: input.providerAccountId, externalId: input.externalConversationId }, externalId: input.externalMessageId } });
  if (existing) return { duplicate: true, messageId: existing.id, conversationId: existing.conversationId };
  const customer = await prisma.socialCustomer.upsert({
    where: { platform_providerAccountId_externalId: { platform: input.provider, providerAccountId: input.providerAccountId, externalId: input.externalParticipantId } },
    create: { platform: input.provider, providerAccountId: input.providerAccountId, externalId: input.externalParticipantId, name: cleanText(input.customerName || input.username || input.externalParticipantId, 200), username: input.username ? cleanText(input.username, 160) : null, avatarUrl: input.avatarUrl, email: input.contactEmail, phone: input.contactPhone, providerMetadata: input.providerMetadata as any },
    update: { name: input.customerName ? cleanText(input.customerName, 200) : undefined, username: input.username ? cleanText(input.username, 160) : undefined, avatarUrl: input.avatarUrl, email: input.contactEmail, phone: input.contactPhone, providerMetadata: input.providerMetadata as any },
  });
  const conversation = await prisma.conversation.upsert({
    where: { platformAccountId_externalId: { platformAccountId: input.providerAccountId, externalId: input.externalConversationId } },
    create: { kind: "DIRECT", title: customer.name, platform: input.provider, platformAccountId: input.providerAccountId, externalId: input.externalConversationId, externalParticipantId: input.externalParticipantId, participantUsername: input.username, customerId: customer.id, priority: input.priority ?? "MEDIUM", status: "OPEN", inboxUnreadCount: 0, hasReplied: false, isSpam: input.spam ?? false, firstContactAt: input.sentAt, lastMessageAt: input.sentAt, lastInboundAt: input.sentAt, sourceUrl: input.sourceUrl, contactEmail: input.contactEmail, contactPhone: input.contactPhone, providerMetadata: input.providerMetadata as any },
    update: { title: customer.name, externalParticipantId: input.externalParticipantId, participantUsername: input.username, customerId: customer.id, lastMessageAt: input.sentAt, lastInboundAt: input.sentAt, hasReplied: false, sourceUrl: input.sourceUrl ?? undefined, contactEmail: input.contactEmail ?? undefined, contactPhone: input.contactPhone ?? undefined, providerMetadata: input.providerMetadata as any, isSpam: input.spam ?? undefined, isArchived: false },
  });
  try {
    const message = await prisma.message.create({ data: { conversationId: conversation.id, senderId: input.externalParticipantId, senderName: customer.name, content: cleanText(input.text), externalId: input.externalMessageId, senderType: "CUSTOMER", senderExternalId: input.externalParticipantId, direction: "INBOUND", deliveryStatus: "DELIVERED", readStatus: "UNREAD", sentAt: input.sentAt, providerMetadata: input.providerMetadata as any, attachments: input.attachments?.length ? { create: input.attachments } : undefined } });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { inboxUnreadCount: { increment: 1 } } });
    const recipients = await prisma.user.findMany({ where: conversation.assignedToId ? { id: conversation.assignedToId } : { role: { name: { in: ["CEO", "ADMIN", "MANAGER", "SUPPORT"] } } }, select: { id: true } });
    await Promise.all(recipients.map((user) => notifySocial({ userId: user.id, type: "SOCIAL", category: "MESSAGES", priority: input.priority === "URGENT" || input.priority === "HIGH" ? "HIGH" : "MEDIUM", title: `New ${input.provider.toLowerCase()} message`, body: cleanText(input.text, 160), entity: conversation.id, entityType: "CONVERSATION", platform: input.provider })));
    return { duplicate: false, messageId: message.id, conversationId: conversation.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { duplicate: true, conversationId: conversation.id };
    throw error;
  }
}

export async function markProviderMessageState(externalMessageId: string, state: "DELIVERED" | "READ", occurredAt = new Date()) {
  const message = await prisma.message.findFirst({ where: { externalId: externalMessageId } });
  if (!message) return null;
  return prisma.message.update({ where: { id: message.id }, data: { deliveryStatus: state, readStatus: state === "READ" ? "READ" : undefined, providerMetadata: { stateOccurredAt: occurredAt.toISOString() } } });
}

export async function updateInboxAction(actor: InboxActor, conversationId: string, action: string, value: unknown, req?: NextRequest) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] } });
  if (!conversation) throw new Error("Conversation not found or access denied");
  const data: Prisma.ConversationUpdateInput = {};
  if (action === "read") data.inboxUnreadCount = 0;
  else if (action === "unread") data.inboxUnreadCount = Math.max(1, Number(value) || 1);
  else if (action === "star") data.isStarred = Boolean(value);
  else if (action === "archive") data.isArchived = Boolean(value);
  else if (action === "spam") data.isSpam = Boolean(value);
  else if (action === "priority" && ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(String(value))) data.priority = String(value) as InboxPriority;
  else if (action === "status" && ["OPEN", "PENDING", "RESOLVED", "CLOSED"].includes(String(value))) data.status = String(value) as InboxStatus;
  else throw new Error("Unsupported conversation action");
  const updated = await prisma.conversation.update({ where: { id: conversationId }, data });
  await writeAudit({ action: `INBOX_${action.toUpperCase()}`, actionType: "INBOX_ACTION", module: "INBOX", resource: "Conversation", entityId: conversationId, newValue: JSON.stringify(value), createdById: actor.id, req });
  return updated;
}

export async function assignInboxConversation(actor: InboxActor, conversationId: string, assignedToId: string | null, req?: NextRequest) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] } });
  if (!conversation) throw new Error("Conversation not found or access denied");
  if (!assignedToId) {
    await prisma.$transaction([prisma.conversation.update({ where: { id: conversationId }, data: { assignedToId: null } }), prisma.conversationAssignment.create({ data: { conversationId, assignedToId: null, assignedById: actor.id, action: "UNASSIGNED", note: "Conversation unassigned" } })]);
    await writeAudit({ action: "INBOX_UNASSIGN", actionType: "ASSIGNMENT", module: "INBOX", resource: "Conversation", entityId: conversationId, createdById: actor.id, req });
    return { assignedTo: null };
  }
  const user = await prisma.user.findUnique({ where: { id: assignedToId }, select: { id: true, name: true, avatar: true } });
  if (!user) throw new Error("Assigned user not found");
  const assignment = await prisma.$transaction(async (tx) => {
    const row = await tx.conversationAssignment.create({ data: { conversationId, assignedToId, assignedById: actor.id, action: conversation.assignedToId ? "REASSIGNED" : "ASSIGNED" } });
    await tx.conversation.update({ where: { id: conversationId }, data: { assignedToId } });
    return row;
  });
  await notifyTeam({ userId: assignedToId, type: "TEAM", category: "ASSIGNMENTS", priority: "MEDIUM", title: "Conversation assigned to you", body: conversation.title ?? "Social inbox conversation", entity: conversationId, entityType: "CONVERSATION", senderId: actor.id, senderName: actor.name });
  await writeAudit({ action: "INBOX_ASSIGN", actionType: "ASSIGNMENT", module: "INBOX", resource: "Conversation", entityId: conversationId, newValue: assignedToId, createdById: actor.id, req });
  return { ...assignment, assignedTo: user };
}

export async function addInboxNote(actor: InboxActor, conversationId: string, content: string, mentions: string[], req?: NextRequest) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] }, select: { id: true } });
  if (!conversation) throw new Error("Conversation not found or access denied");
  const note = await prisma.conversationNote.create({ data: { conversationId, authorId: actor.id, authorName: actor.name, content: cleanText(content, 10_000), mentions } });
  await Promise.all(mentions.map((userId) => notifyTeam({ userId, type: "TEAM", category: "MENTIONS", priority: "MEDIUM", title: `${actor.name} mentioned you in an inbox note`, body: cleanText(content, 160), entity: conversationId, entityType: "CONVERSATION", senderId: actor.id, senderName: actor.name })));
  await writeAudit({ action: "INBOX_NOTE_ADD", actionType: "INTERNAL_NOTE", module: "INBOX", resource: "ConversationNote", entityId: note.id, createdById: actor.id, req });
  return note;
}

export async function updateInboxTags(actor: InboxActor, conversationId: string, add: string[], remove: string[], req?: NextRequest) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, AND: [scopeWhere(actor), { platform: { in: SOCIAL_PLATFORMS } }] } });
  if (!conversation) throw new Error("Conversation not found or access denied");
  const next = [...new Set([...(conversation.labelIds ?? []), ...add.map((tag) => cleanText(tag, 80))])].filter((tag) => !remove.includes(tag)).slice(0, 50);
  const updated = await prisma.conversation.update({ where: { id: conversationId }, data: { labelIds: next } });
  await writeAudit({ action: "INBOX_TAGS_UPDATE", actionType: "INBOX_ACTION", module: "INBOX", resource: "Conversation", entityId: conversationId, newValue: JSON.stringify(next), createdById: actor.id, req });
  return updated;
}
