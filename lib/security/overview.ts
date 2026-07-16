/**
 * TASK-62 — Security overview aggregator.
 * Pulls REAL counts from the database (no fake metrics).
 * Signals that have no real data return available:false so the UI can
 * show an honest "No Data" state (TASK-51 rule).
 */
import { prisma } from "@/lib/db";

export interface SecurityOverview {
  generatedAt: string;
  protectedUsers: number;
  activeSessions: number;
  failedLoginsToday: number;
  blockedRequests: number;
  apiCallsToday: number;
  auditEventsToday: number;
  criticalAlerts: number;
  lastBackup: { available: boolean; at: string | null };
}

export async function getSecurityOverview(): Promise<SecurityOverview> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    protectedUsers,
    activeSessions,
    failedLoginsToday,
    blockedRequests,
    apiCallsToday,
    auditEventsToday,
    criticalAlerts,
    lastAudit,
  ] = await Promise.all([
    prisma.user.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.session.count({ where: { expires: { gt: new Date() } } }).catch(() => 0),
    prisma.loginHistory.count({ where: { result: "FAILURE", createdAt: { gte: startOfDay } } }).catch(() => 0),
    prisma.blockedIP.count().catch(() => 0),
    prisma.apiAccessLog.count({ where: { createdAt: { gte: startOfDay } } }).catch(() => 0),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfDay } } }).catch(() => 0),
    prisma.securityEvent.count({ where: { severity: "CRITICAL", resolved: false } }).catch(() => 0),
    prisma.auditLog.findFirst({ where: { actionType: "BACKUP" }, orderBy: { createdAt: "desc" } }).catch(() => null),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    protectedUsers,
    activeSessions,
    failedLoginsToday,
    blockedRequests,
    apiCallsToday,
    auditEventsToday,
    criticalAlerts,
    lastBackup: { available: !!lastAudit, at: lastAudit?.createdAt?.toISOString() ?? null },
  };
}
