import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth-server";
import { syncLinkedInPosts } from "@/services/linkedin/sync";
import { publishLinkedInOrganization } from "@/services/linkedin/posts";
import { asPublicIntegrationError } from "@/services/integrations/errors";
import { writeAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  try {
    return NextResponse.json(await syncLinkedInPosts(accountId, { pages: Number(req.nextUrl.searchParams.get("pages") || 2), count: Number(req.nextUrl.searchParams.get("count") || 50) }));
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "LINKEDIN");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}

const publishSchema = z.object({ accountId: z.string().min(1), caption: z.string().min(1).max(3000), title: z.string().max(300).optional(), hashtags: z.array(z.string().max(100)).max(30).optional(), link: z.string().url().optional(), mediaUrls: z.array(z.string().url()).max(20).optional() });

export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: perm.error === "Unauthorized" ? 401 : 403 });
  const parsed = publishSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid LinkedIn publish request", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { accountId, ...input } = parsed.data;
  const result = await publishLinkedInOrganization(accountId, input);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });
  await writeAudit({ action: "LINKEDIN_POST_PUBLISHED", actionType: "PUBLISH", module: "SOCIAL", resource: "CompanySocialAccount", entityId: accountId, createdById: perm.user!.id, req, metadata: { postId: result.platformPostId } });
  return NextResponse.json({ result }, { status: 201 });
}
