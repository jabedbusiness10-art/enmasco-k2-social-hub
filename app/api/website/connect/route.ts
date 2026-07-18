import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createWebsiteConnection, listWebsiteConnections, webhookUrlFor } from "@/services/website/connection";
import { asPublicIntegrationError } from "@/services/integrations/errors";
import { z } from "zod";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

/** TASK-47 — Connect a website (CMS) as a first-class connected platform. */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });

  const raw = await req.json().catch(() => null);
  if (!raw) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = z.object({
    websiteName: z.string().trim().min(1).max(160),
    websiteUrl: z.string().trim().url(),
    cmsType: z.enum(["WORDPRESS", "REST_API", "RSS", "SITEMAP", "WEBHOOK", "NEXTJS", "CUSTOM", "HEADLESS", "LARAVEL", "STATIC"]),
    apiKey: z.string().max(4096).optional().nullable(),
    webhookSecret: z.string().min(24).max(4096).optional().nullable(),
    apiEndpoint: z.string().trim().url().optional().nullable(),
    authMethod: z.enum(["NONE", "BEARER", "API_KEY", "BASIC", "WORDPRESS_APP_PASSWORD"]).optional(),
    syncFrequency: z.enum(["MANUAL", "HOURLY", "DAILY", "REALTIME"]).optional(),
  }).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid website configuration", fields: parsed.error.flatten().fieldErrors }, { status: 400 });

  try {
    const conn = await createWebsiteConnection({
      ...parsed.data,
      connectedBy: perm.user!.name ?? perm.user!.email,
      connectedById: perm.user!.id,
    });
    await writeAudit({ action: "WEBSITE_CONNECTED", actionType: "SOCIAL_CONNECT", module: "SOCIAL", resource: "WebsiteConnection", entityName: conn.websiteName, entityId: conn.id, createdById: perm.user!.id, req, metadata: { provider: conn.cmsType, authMethod: conn.authMethod } });
    return NextResponse.json({ connection: conn, webhookUrl: webhookUrlFor(conn.id) }, { status: 201 });
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}

/** List website connections. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const connections = await listWebsiteConnections();
  return NextResponse.json({ connections });
}
