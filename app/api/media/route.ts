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
  const sort = searchParams.get("sort") || "newest"; // newest | oldest | name

  const where: any = { deletedAt: null };
  if (type) where.fileType = type;
  if (search) {
    where.OR = [
      { originalName: { contains: search, mode: "insensitive" } },
      { fileName: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
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
