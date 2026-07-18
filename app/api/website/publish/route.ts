import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-server";
import { publishWebsiteConnection } from "@/services/website/connection";
import { asPublicIntegrationError } from "@/services/integrations/errors";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

const schema = z.object({
  connectionId: z.string().min(1),
  externalId: z.string().max(300).optional(),
  title: z.string().trim().min(1).max(300),
  content: z.string().min(1).max(200_000),
  excerpt: z.string().max(5_000).optional(),
  status: z.enum(["draft", "publish"]).default("draft"),
  featuredImage: z.string().url().optional(),
  categories: z.array(z.string().max(100)).max(50).optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
  canonicalUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid website publish request", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { connectionId, ...input } = parsed.data;
  try {
    const result = await publishWebsiteConnection(connectionId, input);
    await writeAudit({ action: "WEBSITE_CONTENT_PUBLISHED", actionType: "PUBLISH", module: "SOCIAL", resource: "WebsiteConnection", entityId: connectionId, createdById: perm.user!.id, req, metadata: { externalId: result.externalId, status: result.status } });
    return NextResponse.json({ result });
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}
