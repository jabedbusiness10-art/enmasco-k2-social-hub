import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { syncWebsiteConnection } from "@/services/website/connection";
import { asPublicIntegrationError } from "@/services/integrations/errors";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

/** TASK-47 — Trigger a content sync (blog/news/media). Architecture for TASK-48. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  try {
    const result = await syncWebsiteConnection(id);
    await writeAudit({ action: "WEBSITE_CONTENT_SYNCED", actionType: "SYNC", module: "SOCIAL", resource: "WebsiteConnection", entityId: id, createdById: perm.user!.id, req, metadata: { imported: result.imported, updated: result.updated } });
    return NextResponse.json({ sync: result });
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}
