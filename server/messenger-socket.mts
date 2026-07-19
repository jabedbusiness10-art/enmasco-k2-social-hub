/**
 * K2 Messenger — standalone Socket.IO realtime server (TASK-44)
 *
 * Runs on port 3001 (next to the Next.js dev server on 3000) so we keep the
 * App Router untouched while getting bi-directional realtime. For production
 * you would colocate this inside `next start` (custom server) and swap the
 * in-memory presence store for the Redis adapter / ioredis. The event surface
 * and persistence layer are production-shaped: every message, reaction,
 * receipt and presence change is written through `services/messenger` + Prisma.
 *
 * Start: `node server/messenger-socket.mjs`  (added as `npm run messenger:ws`)
 */
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---- resolve DATABASE_URL like lib/db.ts (Next inlines process.env at build) ----
function resolveDatabaseUrl() {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;
  for (const f of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(process.cwd(), f), "utf8");
      const m = raw.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) return m[1].trim();
    } catch {}
  }
  return undefined;
}

const prisma = new PrismaClient({ adapter: new PrismaPg(resolveDatabaseUrl() ?? "") });

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "k2-messenger-socket", ts: Date.now() }));
});
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingInterval: 25000,
  pingTimeout: 20000,
});

// In-memory presence + socket<->userId (swap for Redis adapter in prod)
const socketToUser = new Map<string, string>();
const userToSockets = new Map<string, Set<string>>();

async function setPresence(userId: string, status: string) {
  await prisma.onlinePresence.upsert({
    where: { userId },
    update: { status, lastSeen: new Date(), updatedAt: new Date() },
    create: { userId, status, lastSeen: new Date() },
  });
  io.emit("presence:update", { userId, status, lastSeen: new Date().toISOString() });
}

function broadcastToConversation(conversationId: string, event: string, payload: any) {
  io.to(`conv:${conversationId}`).emit(event, payload);
}

io.on("connection", (socket) => {
  socket.on("identify", async ({ userId, name }) => {
    if (!userId) return;
    socket.data.userId = userId;
    socket.data.name = name;
    socketToUser.set(socket.id, userId);
    if (!userToSockets.has(userId)) userToSockets.set(userId, new Set());
    userToSockets.get(userId)!.add(socket.id);
    socket.join(`user:${userId}`);
    await setPresence(userId, "ONLINE");
    socket.emit("presence:update", { userId, status: "ONLINE", lastSeen: new Date().toISOString() });
  });

  socket.on("conversation:join", (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
  });
  socket.on("conversation:leave", (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on("typing", async ({ conversationId, typing }) => {
    const userId = socket.data.userId;
    if (!userId) return;
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (member) {
      await prisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { typingAt: typing ? new Date() : null },
      });
    }
    broadcastToConversation(conversationId, "typing", {
      conversationId,
      userId,
      name: socket.data.name,
      typing,
    });
  });

  socket.on("presence:set", async (status: string) => {
    const userId = socket.data.userId;
    if (!userId) return;
    await setPresence(userId, status);
  });

  socket.on("message:send", async (data: any) => {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return;
    try {
      const { serializeMessage } = await import("../services/messenger.ts");
      const msg = await serializeMessage(
        await persistMessage(data, userId, socket.data.name),
        userId,
      );
      broadcastToConversation(data.conversationId, "message:new", msg);
      // notifications + unread to other members
      const members = await prisma.conversationMember.findMany({
        where: { conversationId: data.conversationId, userId: { not: userId } },
        include: { user: { select: { name: true } } },
      });
      for (const m of members) {
        io.to(`user:${m.userId}`).emit("unread:update", {
          conversationId: data.conversationId,
          unreadCount: m.unreadCount + 1,
        });
        const isCeo = data.conversationId === (await getCeoConvId());
        const isMention = (data.mentions ?? []).includes(m.userId);
        if (isMention || isCeo) {
          const notif = await prisma.conversationNotification.create({
            data: {
              userId: m.userId,
              conversationId: data.conversationId,
              messageId: msg.id,
              type: isCeo ? "CEO" : isMention ? "MENTION" : "MESSAGE",
              title: isCeo ? "CEO Broadcast" : isMention ? `Mentioned by ${socket.data.name}` : `New message`,
              body: msg.content.slice(0, 140),
              priority: isCeo ? "CEO" : isMention ? "HIGH" : "NORMAL",
            },
          });
          io.to(`user:${m.userId}`).emit("notification:new", {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            body: notif.body,
            conversationId: notif.conversationId,
            messageId: notif.messageId,
            priority: notif.priority,
            createdAt: notif.createdAt.toISOString(),
          });
        }
      }
    } catch (e: any) {
      socket.emit("connect_error", new Error(e.message));
    }
  });

  socket.on("receipt:send", async ({ messageId, status }) => {
    const userId = socket.data.userId;
    if (!userId || !messageId) return;
    await prisma.readReceipt.upsert({
      where: { messageId_userId: { messageId, userId } },
      update: { status, at: new Date() },
      create: { messageId, userId, status },
    });
    const msg = await prisma.message.findUnique({ where: { id: messageId }, select: { conversationId: true } });
    if (msg) broadcastToConversation(msg.conversationId, "receipt:update", { messageId, userId, status });
  });

  // --- Mutations driven from the REST API are also forwarded here so every
  //     connected client sees the update in realtime (edit / delete / react). ---
  socket.on("message:edit", async ({ messageId, content }) => {
    const userId = socket.data.userId;
    if (!userId || !messageId) return;
    const { updateMessage, serializeMessage } = await import("../services/messenger.ts");
    const msg = await updateMessage(messageId, userId, content);
    const full = await prisma.message.findUnique({ where: { id: messageId }, select: { conversationId: true } });
    if (full) broadcastToConversation(full.conversationId, "message:updated", msg);
  });

  socket.on("message:delete", async ({ messageId }) => {
    const userId = socket.data.userId;
    if (!userId || !messageId) return;
    const { deleteMessage } = await import("../services/messenger.ts");
    const msg = await deleteMessage(messageId, userId);
    const full = await prisma.message.findUnique({ where: { id: messageId }, select: { conversationId: true } });
    if (full) broadcastToConversation(full.conversationId, "message:deleted", { id: messageId, conversationId: full.conversationId });
  });

  socket.on("message:react", async ({ messageId, emoji }) => {
    const userId = socket.data.userId;
    if (!userId || !messageId) return;
    const { toggleReaction } = await import("../services/messenger.ts");
    const msg = await toggleReaction(messageId, userId, emoji);
    const full = await prisma.message.findUnique({ where: { id: messageId }, select: { conversationId: true } });
    if (msg && full) broadcastToConversation(full.conversationId, "reaction:update", { messageId, reactions: msg.reactions });
  });

  socket.on("disconnect", async () => {
    const userId = socketToUser.get(socket.id);
    if (userId) {
      userToSockets.get(userId)?.delete(socket.id);
      socketToUser.delete(socket.id);
      if (!userToSockets.get(userId)?.size) {
        await setPresence(userId, "OFFLINE");
      }
    }
  });
});

// Keep a cached CEO channel id lookup
let ceoConvIdCache: string | null = null;
let ceoConvIdTs = 0;
async function getCeoConvId() {
  if (ceoConvIdCache && Date.now() - ceoConvIdTs < 30_000) return ceoConvIdCache;
  const c = await prisma.conversation.findFirst({ where: { isCeoChannel: true }, select: { id: true } });
  ceoConvIdCache = c?.id ?? null;
  ceoConvIdTs = Date.now();
  return ceoConvIdCache;
}

async function persistMessage(data: any, userId: string, name: string) {
  const { createMessage } = await import("../services/messenger.ts");
  return createMessage({
    conversationId: data.conversationId,
    senderId: userId,
    senderName: name ?? "User",
    content: data.content ?? "",
    replyToId: data.replyToId ?? null,
    mentions: data.mentions ?? [],
    attachments: data.attachments,
    voice: data.voice,
    forwardedFromId: data.forwardedFromId ?? null,
  });
}

const PORT = Number(process.env.MESSENGER_WS_PORT ?? 3001);
httpServer.listen(PORT, () => {
  console.log(`[K2 Messenger] Socket.IO realtime server listening on :${PORT}`);
});

// Reuse the existing Socket.IO bridge for social inbox mutations written by
// Next.js webhooks and REST routes. The bounded DB reconciliation avoids a
// second realtime stack and never polls external providers.
let lastInboxEventAt = new Date();
setInterval(async () => {
  const since = lastInboxEventAt;
  const checkedAt = new Date();
  try {
    const [webhook, audit] = await Promise.all([
      prisma.inboxWebhookEvent.findFirst({ where: { receivedAt: { gt: since }, status: "PROCESSED" }, orderBy: { receivedAt: "desc" }, select: { conversationId: true, eventType: true, receivedAt: true } }),
      prisma.auditLog.findFirst({ where: { createdAt: { gt: since }, module: "INBOX" }, orderBy: { createdAt: "desc" }, select: { entityId: true, action: true, createdAt: true } }),
    ]);
    if (webhook || audit) io.emit("inbox:update", { conversationId: webhook?.conversationId ?? audit?.entityId ?? null, event: webhook?.eventType ?? audit?.action ?? "UPDATED", at: checkedAt.toISOString() });
    lastInboxEventAt = checkedAt;
  } catch (error) {
    console.error("[K2 Messenger] inbox reconciliation failed", error instanceof Error ? error.message : error);
  }
}, 1500);

// Auto-reconnect awareness is handled client-side; server just cleans up on error.
io.engine.on("connection_error", (err) => {
  console.error("[K2 Messenger] connection_error", err.message);
});
