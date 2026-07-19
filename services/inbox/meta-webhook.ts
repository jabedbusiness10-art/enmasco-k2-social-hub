import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ingestInboundMessage, markProviderMessageState } from "./service";

function timingSafeHex(expected: string, provided: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(provided)) return false;
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(provided, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function verifyMetaWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeHex(expected, signature.slice(7));
}

export function verifyMetaChallenge(mode: string | null, token: string | null): boolean {
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN ?? "";
  if (mode !== "subscribe" || !token || !expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function accountForEntry(entryId: string) {
  return prisma.companySocialAccount.findFirst({ where: { provider: "meta", isActive: true, OR: [{ pageId: entryId }, { instagramBusinessId: entryId }] } });
}

async function claimEvent(provider: string, accountId: string, externalEventId: string, eventType: string, payload: unknown, occurredAt?: Date) {
  const payloadHash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  try {
    return await prisma.inboxWebhookEvent.create({ data: { provider, providerAccountId: accountId, externalEventId, eventType, payloadHash, occurredAt } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
    throw error;
  }
}

function attachmentRows(list: any[] = []) {
  return list.map((item, index) => {
    const payload = item?.payload ?? {};
    const url = String(payload.url ?? "");
    const type = String(item?.type ?? "file").toLowerCase();
    const kind = type === "image" ? "IMAGE" : type === "video" ? "VIDEO" : type === "audio" ? "AUDIO" : "OTHER";
    return { kind, fileName: `meta-${index + 1}`, originalName: `meta-${index + 1}`, mimeType: type === "image" ? "image/*" : type === "video" ? "video/*" : "application/octet-stream", fileSize: 0, url };
  }).filter((item) => /^https:\/\//i.test(item.url));
}

async function processMessaging(account: any, entry: any, event: any) {
  const occurredAt = new Date(Number(event.timestamp ?? entry.time ?? Date.now()));
  if (event.message && !event.message.is_echo) {
    const messageId = String(event.message.mid ?? "");
    if (!messageId) return { skipped: true };
    const claim = await claimEvent(String(account.platform), account.id, messageId, "MESSAGE_RECEIVED", event, occurredAt);
    if (!claim) return { duplicate: true };
    try {
      const participantId = String(event.sender?.id ?? "");
      const result = await ingestInboundMessage({ provider: account.platform, providerAccountId: account.id, externalConversationId: `dm:${participantId}`, externalParticipantId: participantId, externalMessageId: messageId, customerName: participantId, text: event.message.text ?? (event.message.attachments?.length ? "Attachment" : ""), sentAt: occurredAt, attachments: attachmentRows(event.message.attachments), providerMetadata: { kind: "MESSAGE", entryId: entry.id, quickReply: event.message.quick_reply?.payload ?? null } });
      await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "PROCESSED", processedAt: new Date(), conversationId: result.conversationId } });
      return result;
    } catch (error) {
      await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "FAILED", processedAt: new Date(), error: error instanceof Error ? error.message.slice(0, 500) : "Processing failed" } });
      throw error;
    }
  }
  if (event.delivery) {
    const eventId = `delivery:${event.delivery.watermark}:${(event.delivery.mids ?? []).join(",")}`;
    const claim = await claimEvent(String(account.platform), account.id, eventId, "MESSAGE_DELIVERED", event, occurredAt);
    if (!claim) return { duplicate: true };
    await Promise.all((event.delivery.mids ?? []).map((mid: string) => markProviderMessageState(mid, "DELIVERED", occurredAt)));
    await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "PROCESSED", processedAt: new Date() } });
  }
  if (event.read) {
    const eventId = `read:${event.sender?.id}:${event.read.watermark}`;
    const claim = await claimEvent(String(account.platform), account.id, eventId, "MESSAGE_READ", event, occurredAt);
    if (!claim) return { duplicate: true };
    await prisma.message.updateMany({ where: { conversation: { platformAccountId: account.id, externalParticipantId: String(event.sender?.id ?? "") }, direction: "OUTBOUND", sentAt: { lte: occurredAt } }, data: { deliveryStatus: "READ", readStatus: "READ" } });
    await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "PROCESSED", processedAt: new Date() } });
  }
  return { processed: true };
}

async function processChange(account: any, entry: any, change: any) {
  const value = change?.value ?? {};
  const commentId = String(value.comment_id ?? value.id ?? "");
  const text = value.message ?? value.text;
  if (!commentId || typeof text !== "string") return { skipped: true };
  const occurredAt = new Date(Number(value.created_time ? value.created_time * 1000 : entry.time ?? Date.now()));
  const verb = String(value.verb ?? "add");
  const version = /edit|update/i.test(verb) ? String(entry.time ?? value.created_time ?? crypto.createHash("sha256").update(String(text)).digest("hex").slice(0, 16)) : verb;
  const claim = await claimEvent(String(account.platform), account.id, `${change.field}:${commentId}:${verb}:${version}`, /edit|update/i.test(verb) ? "COMMENT_UPDATED" : "COMMENT_CREATED", change, occurredAt);
  if (!claim) return { duplicate: true };
  const participantId = String(value.from?.id ?? value.user_id ?? value.sender_id ?? commentId);
  const threadId = String(value.parent_id ?? value.post_id ?? value.media_id ?? commentId);
  try {
    if (/edit|update/i.test(verb)) {
      const existing = await prisma.message.findFirst({ where: { externalId: commentId, conversation: { platformAccountId: account.id } } });
      if (existing) {
        await prisma.message.update({ where: { id: existing.id }, data: { content: String(text).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 10_000), providerMetadata: { kind: account.platform === "INSTAGRAM" ? "INSTAGRAM_COMMENT" : "FACEBOOK_COMMENT", commentId, updated: true } } });
        await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "PROCESSED", processedAt: new Date(), conversationId: existing.conversationId } });
        return { updated: true, conversationId: existing.conversationId };
      }
    }
    const result = await ingestInboundMessage({ provider: account.platform, providerAccountId: account.id, externalConversationId: `comment:${threadId}:${participantId}`, externalParticipantId: participantId, externalMessageId: commentId, customerName: value.from?.name ?? value.username ?? participantId, username: value.username, text, sentAt: occurredAt, sourceUrl: value.permalink_url, providerMetadata: { kind: account.platform === "INSTAGRAM" ? "INSTAGRAM_COMMENT" : "FACEBOOK_COMMENT", commentId, parentCommentId: commentId, postId: value.post_id ?? null, mediaId: value.media_id ?? null, verb: value.verb ?? "add" } });
    await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "PROCESSED", processedAt: new Date(), conversationId: result.conversationId } });
    return result;
  } catch (error) {
    await prisma.inboxWebhookEvent.update({ where: { id: claim.id }, data: { status: "FAILED", processedAt: new Date(), error: error instanceof Error ? error.message.slice(0, 500) : "Processing failed" } });
    throw error;
  }
}

export async function processMetaWebhook(payload: any) {
  const results: any[] = [];
  for (const entry of payload?.entry ?? []) {
    const account = await accountForEntry(String(entry.id ?? ""));
    if (!account) { results.push({ entryId: entry.id, skipped: "UNKNOWN_ACCOUNT" }); continue; }
    for (const event of entry.messaging ?? []) {
      try { results.push(await processMessaging(account, entry, event)); }
      catch (error) { results.push({ error: error instanceof Error ? error.message : "Messaging event failed" }); }
    }
    for (const change of entry.changes ?? []) {
      try { results.push(await processChange(account, entry, change)); }
      catch (error) { results.push({ error: error instanceof Error ? error.message : "Change event failed" }); }
    }
  }
  return { processed: results.filter((r) => !r?.duplicate && !r?.skipped).length, duplicates: results.filter((r) => r?.duplicate).length, results };
}
