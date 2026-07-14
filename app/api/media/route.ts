import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { mediaService } from "@/services/media/mediaService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_MEDIA", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "assets"; // assets | stats | activity

  if (view === "stats") {
    const stats = await mediaService.stats();
    return NextResponse.json({ stats });
  }
  if (view === "activity") {
    const activity = await mediaService.activity(Number(searchParams.get("limit") || 20));
    return NextResponse.json({ activity });
  }

  const assets = await mediaService.list({
    search: searchParams.get("search")?.trim() || undefined,
    type: searchParams.get("type")?.trim() || undefined,
    folderId: searchParams.get("folderId"),
    category: searchParams.get("category")?.trim() || undefined,
    tags: searchParams.get("tags") ? searchParams.get("tags")!.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    uploadedBy: searchParams.get("uploadedBy")?.trim() || undefined,
    favorite: searchParams.get("favorite") === "1",
    archived: searchParams.get("archived") === "1",
    trashed: searchParams.get("trashed") === "1",
    collectionId: searchParams.get("collectionId") || undefined,
    sort: (searchParams.get("sort") as any) || "newest",
  });
  return NextResponse.json(assets);
}
