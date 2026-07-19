import crypto from "node:crypto";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { notifySocial } from "@/lib/notifications";
import { writeAudit } from "@/lib/security/audit";
import { refreshAccount, refreshMetaAccountIfNeeded } from "@/services/social/accounts";
import { classifyMetaError } from "@/services/meta/oauth";
import { getDecryptedSecrets } from "@/services/website/connection";
import { assertPublicWebsiteUrl, safeWebsiteFetch } from "@/services/website/security";
import type { NextRequest } from "next/server";
import { findAccessibleInboxConversation, ingestInboundMessage, type InboxActor } from "./service";

const META_GRAPH = "https://graph.facebook.com/v21.0";
const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

type ReplyResult = { externalId: string; providerStatus: string; metadata?: Record<string, unknown> };

function safeProviderFailure(error: unknown) {
  const raw = (error instanceof Error ? error.message : "Provider reply failed")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [REDACTED]")
    .replace(/(access[_ -]?token|refresh[_ -]?token|client[_ -]?secret)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
    .slice(0, 500);
  const publicMessage = /permission|scope|unauthor|forbidden|token/i.test(raw)
    ? "Provider authorization is missing or expired. Reconnect the account and verify inbox permissions."
    : /rate|quota|429/i.test(raw)
      ? "Provider rate limit reached. Please retry later."
      : /not configured|not approved|does not expose|unavailable/i.test(raw)
        ? raw
        : "The provider rejected the reply. Review the connection and retry.";
  return { internal: raw, public: publicMessage };
}

async function socialAccount(id: string) {
  let account = await prisma.companySocialAccount.findUnique({ where: { id } });
  if (!account || !account.isActive || account.status === "DISCONNECTED") throw new Error("Provider account is disconnected");
  if (account.provider === "meta") await refreshMetaAccountIfNeeded(id);
  if (account.provider === "youtube" && (!account.expiresAt || account.expiresAt.getTime() < Date.now() + 5 * 60_000)) await refreshAccount(id);
  account = await prisma.companySocialAccount.findUnique({ where: { id } });
  if (!account?.accessToken) throw new Error("Provider account token is unavailable");
  return { account, token: decrypt(account.accessToken) };
}

async function metaReply(conversation: any, text: string, attachments: string[]): Promise<ReplyResult> {
  const { account, token } = await socialAccount(conversation.platformAccountId);
  if (account.provider !== "meta") throw new Error("Selected connection is not a Meta account");
  const metadata = (conversation.providerMetadata ?? {}) as Record<string, any>;
  const kind = String(metadata.kind ?? "MESSAGE");
  if (kind.includes("COMMENT")) {
    const parent = String(metadata.parentCommentId ?? metadata.commentId ?? conversation.externalId ?? "");
    if (!parent) throw new Error("Meta comment reply target is unavailable");
    const response = await fetch(`${META_GRAPH}/${encodeURIComponent(parent)}/comments`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ access_token: token, message: text }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) throw new Error(classifyMetaError(data).message);
    return { externalId: String(data.id), providerStatus: "SENT", metadata: { kind: "COMMENT_REPLY", parentCommentId: parent } };
  }
  const senderId = conversation.platform === "INSTAGRAM" ? account.instagramBusinessId : account.pageId;
  if (!senderId || !conversation.externalParticipantId) throw new Error("Meta messaging identity is incomplete");
  const message: Record<string, unknown> = attachments.length ? { attachment: { type: "image", payload: { url: attachments[0], is_reusable: false } } } : { text };
  const response = await fetch(`${META_GRAPH}/${senderId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient: { id: conversation.externalParticipantId }, messaging_type: "RESPONSE", message, access_token: token }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.message_id) throw new Error(classifyMetaError(data).message);
  return { externalId: String(data.message_id), providerStatus: "SENT", metadata: { recipientId: data.recipient_id ?? conversation.externalParticipantId } };
}

async function youtubeReply(conversation: any, text: string): Promise<ReplyResult> {
  const { account, token } = await socialAccount(conversation.platformAccountId);
  if (account.provider !== "youtube") throw new Error("Selected connection is not a YouTube account");
  const metadata = (conversation.providerMetadata ?? {}) as Record<string, any>;
  const parentId = String(metadata.topLevelCommentId ?? metadata.parentCommentId ?? "");
  if (!parentId) throw new Error("YouTube reply target is unavailable");
  const response = await fetch(`${YOUTUBE_API}/comments?part=snippet`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ snippet: { parentId, textOriginal: text } }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) throw new Error(String(data?.error?.message ?? "YouTube reply failed"));
  return { externalId: String(data.id), providerStatus: "SENT", metadata: { parentId } };
}

async function websiteReply(conversation: any, text: string): Promise<ReplyResult> {
  const connection = await prisma.websiteConnection.findUnique({ where: { id: conversation.platformAccountId } });
  if (!connection || connection.status !== "CONNECTED") throw new Error("Website connection is unavailable");
  const capabilities = (connection.providerCapabilities ?? {}) as Record<string, any>;
  const replyUrl = typeof capabilities.inboxReplyUrl === "string" ? capabilities.inboxReplyUrl : null;
  if (!replyUrl) throw new Error("Website reply webhook is not configured");
  const secrets = await getDecryptedSecrets(connection.id);
  if (!secrets?.webhookSecret) throw new Error("Website reply signing secret is not configured");
  const payload = JSON.stringify({ event: "inquiry.reply", conversationId: conversation.externalId, participantId: conversation.externalParticipantId, message: text });
  const timestamp = String(Date.now());
  const signature = crypto.createHmac("sha256", secrets.webhookSecret).update(`${timestamp}.${payload}`).digest("hex");
  const response = await safeWebsiteFetch(replyUrl, { method: "POST", headers: { "Content-Type": "application/json", "x-k2kai-timestamp": timestamp, "x-k2kai-signature": `sha256=${signature}` }, body: payload }, { timeoutMs: 10_000 });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("Website reply provider rejected the request");
  const externalId = String(data?.messageId ?? data?.id ?? "");
  if (!externalId) throw new Error("Website reply provider did not confirm a message ID");
  return { externalId, providerStatus: "SENT", metadata: { replyWebhook: true } };
}

async function linkedinCommentReply(conversation: any, text: string): Promise<ReplyResult> {
  const { account, token } = await socialAccount(conversation.platformAccountId);
  const capabilities = (account.providerCapabilities ?? {}) as Record<string, any>;
  const metadata = (conversation.providerMetadata ?? {}) as Record<string, any>;
  if (capabilities.inboxComments !== true) throw new Error("LinkedIn Community Management comment access is not approved");
  const objectUrn = String(metadata.objectUrn ?? "");
  if (!objectUrn || !account.organizationId) throw new Error("LinkedIn comment reply target is unavailable");
  const version = account.apiVersion ?? process.env.LINKEDIN_API_VERSION ?? "202607";
  const response = await fetch(`https://api.linkedin.com/rest/socialActions/${encodeURIComponent(objectUrn)}/comments`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": version, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" }, body: JSON.stringify({ actor: `urn:li:organization:${account.organizationId}`, object: objectUrn, message: { text } }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(data?.message ?? "LinkedIn comment reply failed"));
  const externalId = response.headers.get("x-restli-id") ?? data?.id ?? data?.commentUrn;
  if (!externalId) throw new Error("LinkedIn did not confirm the comment reply ID");
  return { externalId: String(externalId), providerStatus: "SENT", metadata: { objectUrn } };
}

export async function sendInboxReply(actor: InboxActor, conversationId: string, text: string, attachments: string[], req?: NextRequest) {
  const conversation = await findAccessibleInboxConversation(actor, conversationId);
  if (!conversation) throw new Error("Conversation not found or access denied");
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 10_000);
  if (!clean && !attachments.length) throw new Error("Reply content is required");
  const validatedAttachments = await Promise.all(attachments.map(async (url) => (await assertPublicWebsiteUrl(url)).toString()));
  const metadata = (conversation.providerMetadata ?? {}) as Record<string, unknown>;
  const supportsAttachment = (conversation.platform === "FACEBOOK" || conversation.platform === "INSTAGRAM") && !String(metadata.kind ?? "MESSAGE").includes("COMMENT");
  if (validatedAttachments.length && !supportsAttachment) throw new Error("Attachments are not supported for this provider conversation");
  if (validatedAttachments.length > 1) throw new Error("Meta inbox replies currently support one image attachment at a time");
  const pending = await prisma.message.create({ data: { conversationId, senderId: actor.id, senderName: actor.name, content: clean, senderType: "AGENT", direction: "OUTBOUND", deliveryStatus: "PENDING", readStatus: "READ", sentAt: new Date(), providerMetadata: { attachments: validatedAttachments } } });
  try {
    let result: ReplyResult;
    if (conversation.platform === "FACEBOOK" || conversation.platform === "INSTAGRAM") result = await metaReply(conversation, clean, validatedAttachments);
    else if (conversation.platform === "YOUTUBE") result = await youtubeReply(conversation, clean);
    else if (conversation.platform === "WEBSITE") result = await websiteReply(conversation, clean);
    else if (conversation.platform === "LINKEDIN") result = await linkedinCommentReply(conversation, clean);
    else throw new Error("This provider does not expose an authorized inbox reply API");
    const message = await prisma.message.update({ where: { id: pending.id }, data: { externalId: result.externalId, deliveryStatus: result.providerStatus, providerMetadata: result.metadata as any, status: "SENT" } });
    await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: message.sentAt, lastOutboundAt: message.sentAt, hasReplied: true, inboxUnreadCount: 0, status: "OPEN" } });
    await writeAudit({ action: "INBOX_REPLY_SENT", actionType: "PROVIDER_REPLY", module: "INBOX", resource: "Message", entityId: message.id, metadata: { platform: conversation.platform, externalId: result.externalId }, createdById: actor.id, req });
    return message;
  } catch (error) {
    const failure = safeProviderFailure(error);
    await prisma.message.update({ where: { id: pending.id }, data: { deliveryStatus: "FAILED", failureReason: failure.internal } });
    await notifySocial({ userId: actor.id, type: "SOCIAL", category: "MESSAGES", priority: "HIGH", title: "Inbox reply failed", body: failure.public, entity: conversationId, entityType: "CONVERSATION", platform: String(conversation.platform) });
    await writeAudit({ action: "INBOX_REPLY_FAILED", actionType: "PROVIDER_REPLY", module: "INBOX", resource: "Message", entityId: pending.id, status: "FAILURE", severity: "HIGH", metadata: { platform: conversation.platform, error: failure.internal }, createdById: actor.id, req });
    throw new Error(failure.public);
  }
}

export async function syncYouTubeComments(accountId: string, maxPages = 2) {
  const { account, token } = await socialAccount(accountId);
  if (account.provider !== "youtube" || account.platform !== "YOUTUBE") throw new Error("YouTube account required");
  const channelId = account.accountId;
  if (!channelId) throw new Error("YouTube channel ID is unavailable");
  let pageToken: string | undefined;
  let imported = 0;
  let duplicates = 0;
  for (let page = 0; page < Math.min(10, Math.max(1, maxPages)); page += 1) {
    const params: URLSearchParams = new URLSearchParams({ part: "snippet,replies", allThreadsRelatedToChannelId: channelId, maxResults: "100", order: "time", textFormat: "plainText" });
    if (pageToken) params.set("pageToken", pageToken);
    const response: Response = await fetch(`${YOUTUBE_API}/commentThreads?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(data?.error?.message ?? "YouTube comment sync failed"));
    for (const thread of (data.items ?? []) as any[]) {
      const comment: any = thread?.snippet?.topLevelComment;
      const snippet: any = comment?.snippet;
      if (!comment?.id || !snippet) continue;
      const authorId: string = String(snippet.authorChannelId?.value ?? snippet.authorDisplayName ?? comment.id);
      if (authorId === channelId) continue;
      const result = await ingestInboundMessage({ provider: "YOUTUBE", providerAccountId: accountId, externalConversationId: String(thread.id), externalParticipantId: authorId, externalMessageId: String(comment.id), customerName: snippet.authorDisplayName, avatarUrl: snippet.authorProfileImageUrl, text: snippet.textOriginal ?? snippet.textDisplay ?? "", sentAt: new Date(snippet.publishedAt ?? Date.now()), sourceUrl: `https://youtube.com/watch?v=${encodeURIComponent(snippet.videoId ?? "")}&lc=${encodeURIComponent(comment.id)}`, providerMetadata: { kind: "YOUTUBE_COMMENT", threadId: thread.id, topLevelCommentId: comment.id, videoId: snippet.videoId, canReply: thread.snippet?.canReply === true, moderationStatus: snippet.moderationStatus ?? null, likeCount: snippet.likeCount ?? 0, updatedAt: snippet.updatedAt ?? null } });
      if (result.duplicate) duplicates += 1; else imported += 1;
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  await prisma.companySocialAccount.update({ where: { id: accountId }, data: { lastSyncAt: new Date(), lastError: null } });
  return { imported, duplicates, nextPageToken: pageToken ?? null };
}

export async function syncMetaInbox(accountId: string, maxPages = 2) {
  const { account, token } = await socialAccount(accountId);
  if (account.provider !== "meta" || !["FACEBOOK", "INSTAGRAM"].includes(account.platform)) throw new Error("Meta account required");
  const providerIdentity = account.platform === "INSTAGRAM" ? account.instagramBusinessId : account.pageId;
  if (!providerIdentity) throw new Error("Meta provider identity is unavailable");
  let nextUrl: string | null = `${META_GRAPH}/${providerIdentity}/conversations?${new URLSearchParams({ fields: "id,participants,updated_time,messages.limit(50){id,message,from,to,created_time,attachments}", limit: "50", ...(account.platform === "INSTAGRAM" ? { platform: "instagram" } : {}), access_token: token })}`;
  let imported = 0;
  let duplicates = 0;
  for (let page = 0; nextUrl && page < Math.min(10, Math.max(1, maxPages)); page += 1) {
    const response: Response = await fetch(nextUrl);
    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(classifyMetaError(data).message);
    for (const remote of data.data ?? []) {
      const participants: any[] = remote.participants?.data ?? [];
      const participant = participants.find((item) => String(item.id) !== providerIdentity) ?? participants[0];
      if (!participant?.id || !remote.id) continue;
      const ordered = [...(remote.messages?.data ?? [])].sort((a: any, b: any) => new Date(a.created_time).getTime() - new Date(b.created_time).getTime());
      for (const message of ordered) {
        const inbound = String(message.from?.id ?? "") === String(participant.id);
        if (!inbound) continue;
        const result = await ingestInboundMessage({ provider: account.platform as "FACEBOOK" | "INSTAGRAM", providerAccountId: accountId, externalConversationId: String(remote.id), externalParticipantId: String(participant.id), externalMessageId: String(message.id), customerName: participant.name ?? message.from?.name ?? String(participant.id), username: participant.username, text: message.message ?? (message.attachments?.data?.length ? "Attachment" : ""), sentAt: new Date(message.created_time ?? remote.updated_time ?? Date.now()), attachments: (message.attachments?.data ?? []).map((attachment: any, index: number) => ({ kind: String(attachment.mime_type ?? "").startsWith("image/") ? "IMAGE" : String(attachment.mime_type ?? "").startsWith("video/") ? "VIDEO" : "OTHER", fileName: `meta-${index + 1}`, originalName: attachment.name ?? `meta-${index + 1}`, mimeType: attachment.mime_type ?? "application/octet-stream", fileSize: Number(attachment.file_size) || 0, url: attachment.image_data?.url ?? attachment.video_data?.url ?? attachment.file_url ?? "" })).filter((attachment: any) => /^https:\/\//.test(attachment.url)), providerMetadata: { kind: "MESSAGE", synced: true } });
        if (result.duplicate) duplicates += 1; else imported += 1;
      }
      const localConversation = await prisma.conversation.findUnique({ where: { platformAccountId_externalId: { platformAccountId: accountId, externalId: String(remote.id) } } });
      if (localConversation) {
        for (const message of ordered.filter((item: any) => String(item.from?.id ?? "") !== String(participant.id))) {
          const externalId = String(message.id ?? "");
          if (!externalId) continue;
          const sentAt = new Date(message.created_time ?? remote.updated_time ?? Date.now());
          const existing = await prisma.message.findUnique({ where: { conversationId_externalId: { conversationId: localConversation.id, externalId } } });
          if (existing) { duplicates += 1; continue; }
          await prisma.message.create({ data: { conversationId: localConversation.id, senderId: String(message.from?.id ?? providerIdentity), senderName: message.from?.name ?? account.accountName, content: String(message.message ?? "").replace(/<[^>]+>/g, " ").slice(0, 10_000), externalId, senderType: "PROVIDER_ACCOUNT", senderExternalId: String(message.from?.id ?? providerIdentity), direction: "OUTBOUND", deliveryStatus: "SENT", readStatus: "READ", sentAt, providerMetadata: { kind: "MESSAGE", synced: true } } });
          await prisma.conversation.update({ where: { id: localConversation.id }, data: { lastOutboundAt: sentAt, lastMessageAt: sentAt > localConversation.lastMessageAt ? sentAt : undefined } });
          imported += 1;
        }
        const refreshed = await prisma.conversation.findUnique({ where: { id: localConversation.id }, select: { lastInboundAt: true, lastOutboundAt: true } });
        if (refreshed?.lastOutboundAt) await prisma.conversation.update({ where: { id: localConversation.id }, data: { hasReplied: !refreshed.lastInboundAt || refreshed.lastOutboundAt >= refreshed.lastInboundAt } });
      }
    }
    nextUrl = data.paging?.next ?? null;
  }
  await prisma.companySocialAccount.update({ where: { id: accountId }, data: { lastSyncAt: new Date(), lastError: null } });
  return { imported, duplicates, hasMore: Boolean(nextUrl) };
}
