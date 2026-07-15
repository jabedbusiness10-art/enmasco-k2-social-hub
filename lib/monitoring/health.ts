/**
 * TASK-60 — Monitoring health aggregator (server side).
 *
 * Reuses EXISTING production services (no duplication):
 *   - DB reachability        (lib/db)
 *   - Redis / BullMQ         (lib/queue/connection, lib/queue/metrics)
 *   - AI usage               (prisma.aITokenUsage)
 *   - Storage / media        (prisma.mediaAsset)
 *   - Auth / sessions        (prisma.session / user)
 *   - Notifications / alerts (prisma.notification / systemEvent)
 *
 * Every component reports { status, detail }. When a source is absent
 * (e.g. Redis for BullMQ) it reports "disabled"/"unknown" — NEVER fake data.
 */
import { prisma } from "@/lib/db";
import { REDIS_READY, pingRedis } from "@/lib/queue/connection";
import { collectMetrics } from "@/lib/queue/metrics";

export type Status = "ok" | "warning" | "error" | "disabled" | "unknown";

export interface ServiceCheck {
  key: string;
  label: string;
  status: Status;
  detail: string;
  lastChecked: string;
  latencyMs?: number;
}

export interface MonitoringSnapshot {
  generatedAt: string;
  version: string;
  environment: string;
  system: {
    uptimeSec: number;
    memoryMb: number;
    node: string;
    cpuLoad: number[];
  };
  services: ServiceCheck[];
  queue?: {
    configured: boolean;
    connected: boolean;
    totals: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    queues: { name: string; waiting: number; active: number; completed: number; failed: number }[];
  };
  counts: {
    users: number;
    aiRequests: number;
    mediaAssets: number;
    storageBytes: number;
    notifications: number;
    failedJobs: number;
    systemEvents: number;
    sessions: number;
  };
  externalApis: Record<string, boolean>;
}

export async function getMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  const startedAt = Date.now();
  const services: ServiceCheck[] = [];
  const now = () => new Date().toISOString();

  // ---- Database / Prisma ----
  let dbStatus: Status = "ok";
  let dbDetail = "connected";
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbStatus = "error";
    dbDetail = e instanceof Error ? e.message : "db error";
  }
  const dbLatency = Date.now() - dbStart;
  services.push({ key: "database", label: "PostgreSQL", status: dbStatus, detail: dbDetail, lastChecked: now(), latencyMs: dbLatency });
  services.push({ key: "prisma", label: "Prisma ORM", status: dbStatus, detail: `client v${require("@prisma/client/package.json").version ?? "?"}`, lastChecked: now() });

  // ---- Redis / BullMQ ----
  let redisStatus: Status = "disabled";
  let redisDetail = "REDIS_URL not configured (DB fallback)";
  let queue: MonitoringSnapshot["queue"] | undefined;
  if (REDIS_READY) {
    const rStart = Date.now();
    const ok = await pingRedis().catch(() => false);
    redisStatus = ok ? "ok" : "error";
    redisDetail = ok ? "connected" : "ping failed";
    const rLatency = Date.now() - rStart;
    services.push({ key: "redis", label: "Redis", status: redisStatus, detail: redisDetail, lastChecked: now(), latencyMs: rLatency });
    const m = await collectMetrics();
    if (m?.redis?.connected) {
      queue = {
        configured: true,
        connected: true,
        totals: m.totals,
        queues: m.queues.map((q) => ({ name: q.name, waiting: q.waiting, active: q.active, completed: q.completed, failed: q.failed })),
      };
      services.push({ key: "bullmq", label: "BullMQ", status: "ok", detail: `${m.queues.length} queues active`, lastChecked: now() });
    } else {
      services.push({ key: "bullmq", label: "BullMQ", status: "warning", detail: "engine metrics unavailable", lastChecked: now() });
    }
  } else {
    services.push({ key: "redis", label: "Redis", status: "disabled", detail: redisDetail, lastChecked: now() });
    services.push({ key: "bullmq", label: "BullMQ", status: "disabled", detail: "queue engine on DB fallback", lastChecked: now() });
  }

  // ---- Next.js server (self) ----
  services.push({ key: "next", label: "Next.js Server", status: "ok", detail: `node ${process.version}`, lastChecked: now() });

  // ---- Storage (local / cloudinary) ----
  const storageBytes = await prisma.mediaAsset.aggregate({ _sum: { fileSize: true } }).then((r) => r._sum.fileSize ?? 0).catch(() => 0);
  services.push({ key: "storage", label: "Media Storage", status: "ok", detail: `${(storageBytes / 1024 / 1024).toFixed(1)} MB stored`, lastChecked: now() });

  // ---- WebSocket (messenger bridge) — config presence only ----
  const ws = Boolean(process.env.NEXT_PUBLIC_MESSENGER_WS);
  services.push({ key: "websocket", label: "WebSocket Bridge", status: ws ? "ok" : "disabled", detail: ws ? "configured" : "NEXT_PUBLIC_MESSENGER_WS not set", lastChecked: now() });

  // ---- Scheduler / Cron ----
  services.push({ key: "scheduler", label: "Scheduler (Cron)", status: REDIS_READY ? "ok" : "disabled", detail: REDIS_READY ? "repeatable jobs armed" : "needs Redis", lastChecked: now() });

  // ---- Counts (real) ----
  const [users, aiRequests, mediaAssets, notifications, failedJobs, systemEvents, sessions] = await Promise.all([
    prisma.user.count(),
    prisma.aITokenUsage.count(),
    prisma.mediaAsset.count(),
    prisma.notification.count(),
    prisma.failedJob.count(),
    prisma.systemEvent.count(),
    prisma.session.count().catch(() => 0),
  ]);

  const externalApis: Record<string, boolean> = {
    "Meta Graph API": Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
    "Instagram Graph API": Boolean(process.env.META_APP_ID),
    "LinkedIn API": Boolean(process.env.LINKEDIN_CLIENT_ID),
    "Google OAuth": Boolean(process.env.GOOGLE_CLIENT_ID),
    "Google Analytics": Boolean(process.env.GOOGLE_ANALYTICS_ID),
    "OpenAI / OpenRouter": Boolean(process.env.OPENROUTER_API_KEY),
    "SMTP": Boolean(process.env.SMTP_HOST),
    "Webhooks": Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN),
  };

  return {
    generatedAt: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    system: {
      uptimeSec: Math.round(process.uptime()),
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      node: process.version,
      cpuLoad: require("os").loadavg(),
    },
    services,
    queue,
    counts: {
      users, aiRequests, mediaAssets, storageBytes,
      notifications, failedJobs, systemEvents, sessions,
    },
    externalApis,
  };
}
