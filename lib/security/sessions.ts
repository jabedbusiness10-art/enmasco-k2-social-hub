/**
 * TASK-62 — Session manager.
 * Records real sessions, lists active sessions for a user, and supports
 * terminate / terminate-others. Uses the extended Session model.
 */
import { prisma } from "@/lib/db";
import { parseUA } from "@/lib/security/audit";

export interface SessionMeta { ip?: string; userAgent?: string; browser?: string; os?: string; device?: string; }

export async function recordSession(userId: string, sessionToken: string, meta?: { ua?: string | null; ip?: string | null }, isCurrent = true) {
  const ua = meta?.ua ?? undefined;
  const ip = meta?.ip ?? undefined;
  const { browser, os, device } = parseUA(ua ?? undefined);
  const existing = await prisma.session.findFirst({ where: { sessionToken } });
  if (existing) {
    await prisma.session.update({ where: { id: existing.id }, data: { lastActivityAt: new Date(), isCurrent } });
    return existing;
  }
  return prisma.session.create({
    data: {
      sessionToken, userId, isCurrent,
      ip: ip ?? null, userAgent: ua ?? null, browser: browser ?? null, os: os ?? null, device: device ?? null,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
}

export async function listSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, expires: { gt: new Date() } },
    orderBy: [{ isCurrent: "desc" }, { lastActivityAt: "desc" }],
  });
}

export async function terminateSession(sessionId: string, userId: string) {
  return prisma.session.deleteMany({ where: { id: sessionId, userId } });
}

export async function terminateOthers(userId: string, currentToken: string) {
  return prisma.session.deleteMany({
    where: { userId, NOT: { sessionToken: currentToken } },
  });
}
