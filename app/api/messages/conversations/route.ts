import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { listSocialConversations, searchSocialConversations, type SocialPlatform, type ConvStatus, type ConvPriority } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORMS: SocialPlatform[] = ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "WEBSITE", "WHATSAPP"];
const STATUSES: ConvStatus[] = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];
const PRIORITIES: ConvPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") as SocialPlatform | null;
  const status = searchParams.get("status") as ConvStatus | null;
  const priority = searchParams.get("priority") as ConvPriority | null;
  const labelId = searchParams.get("labelId") ?? undefined;
  const assignedToId = searchParams.get("assignedToId") ?? undefined;
  const starred = searchParams.get("starred") === "true" ? true : undefined;
  const pinned = searchParams.get("pinned") === "true" ? true : undefined;
  const archivedRaw = searchParams.get("archived");
  const archived = archivedRaw === "true" ? true : archivedRaw === "false" ? false : undefined;
  const search = searchParams.get("search") ?? undefined;

  if (platform && !PLATFORMS.includes(platform))
    return Response.json({ error: "Invalid platform" }, { status: 400 });
  if (status && !STATUSES.includes(status))
    return Response.json({ error: "Invalid status" }, { status: 400 });
  if (priority && !PRIORITIES.includes(priority))
    return Response.json({ error: "Invalid priority" }, { status: 400 });

  const conversations = await listSocialConversations(user.id, {
    platform: platform ?? undefined,
    status: status ?? undefined,
    priority: priority ?? undefined,
    labelId,
    assignedToId,
    starred,
    pinned,
    archived,
    search,
  });
  return Response.json({ conversations });
}
