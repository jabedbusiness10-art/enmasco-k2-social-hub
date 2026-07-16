/**
 * TASK-62 — Audit logging helper (server side).
 * Creates REAL AuditLog rows from request context. Never fake.
 * Call from API routes / server actions after a real action.
 */
import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

export interface AuditInput {
  action: string;
  actionType?: string;
  module?: string;
  resource?: string;
  entityName?: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  status?: "SUCCESS" | "FAILURE" | "BLOCKED";
  severity?: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  durationMs?: number;
  metadata?: unknown;
  createdById: string; // required — never log an anonymous audit
  req?: NextRequest;
}

/** Parse a User-Agent into browser/os/device strings (lightweight, no deps). */
export function parseUA(ua: string | undefined): { browser: string; os: string; device: string } {
  const s = ua ?? "";
  const browser = /Edg\//.test(s) ? "Edge"
    : /Chrome\//.test(s) ? "Chrome"
    : /Firefox\//.test(s) ? "Firefox"
    : /Safari\//.test(s) ? "Safari" : "Unknown";
  const os = /Windows/.test(s) ? "Windows" : /Mac OS/.test(s) ? "macOS" : /Linux/.test(s) ? "Linux" : /Android/.test(s) ? "Android" : /iPhone|iPad/.test(s) ? "iOS" : "Unknown";
  const device = /Mobile/.test(s) ? "Mobile" : /Tablet/.test(s) ? "Tablet" : "Desktop";
  return { browser, os, device };
}

export async function writeAudit(input: AuditInput) {
  const ua = input.req?.headers.get("user-agent") ?? undefined;
  const ip = input.req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || input.req?.headers.get("x-real-ip") || undefined;
  const { browser, os, device } = parseUA(ua);
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actionType: input.actionType,
        module: input.module,
        resource: input.resource,
        entityName: input.entityName,
        entityId: input.entityId,
        oldValue: input.oldValue,
        newValue: input.newValue,
        ip: ip ?? null,
        userAgent: ua ?? null,
        browser: browser ?? null,
        os: os ?? null,
        device: device ?? null,
        status: input.status ?? "SUCCESS",
        severity: input.severity ?? "INFO",
        durationMs: input.durationMs ?? null,
        metadata: input.metadata as any ?? null,
        createdById: input.createdById,
      },
    });
  } catch (e) {
    // Audit failures must NOT break the primary action.
    console.error("[audit] failed to write", e);
  }
}

/** Record a real API access log entry (called from API routes that have `req`). */
export async function logApiAccess(req: NextRequest, statusCode: number, executionMs?: number, userId?: string, userEmail?: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
  const ua = req.headers.get("user-agent") ?? undefined;
  try {
    await prisma.apiAccessLog.create({
      data: {
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode,
        executionMs: executionMs ?? null,
        userId: userId ?? null,
        userEmail: userEmail ?? null,
        ip: ip ?? null,
        userAgent: ua ?? null,
      },
    });
  } catch (e) {
    console.error("[audit] api-access log failed", e);
  }
}
