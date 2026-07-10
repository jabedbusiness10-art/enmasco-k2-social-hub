import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_MEDIA", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const type = searchParams.get("type")?.trim() || ""; // IMAGE | VIDEO | DOCUMENT | LOGO | BRAND_ASSET
  const category = searchParams.get("category")?.trim() || "";
  const date = searchParams.get("date")?.trim() || ""; // all | today | week | month
  const sort = searchParams.get("sort") || "newest"; // newest | oldest | name

  const where: any = { deletedAt: null };
  if (type) where.fileType = type;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: "insensitive" } },
      { fileName: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }
  if (date && date !== "all") {
    const now = new Date();
    let from: Date;
    if (date === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (date === "week") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (date === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      from = now;
    }
    where.createdAt = { gte: from };
  }

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : sort === "name"
        ? { originalName: "asc" as const }
        : { createdAt: "desc" as const };

  const assets = await prisma.mediaAsset.findMany({ where, orderBy });
  return NextResponse.json({ assets });
}
