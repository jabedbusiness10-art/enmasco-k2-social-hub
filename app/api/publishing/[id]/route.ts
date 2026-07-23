import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** TASK-75 — Get a single scheduled post with its real publishing logs + approval state. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      platforms: true,
      media: true,
      scheduled: true,
      creator: { select: { id: true, name: true, email: true } },
      account: { select: { id: true, platform: true, accountName: true } },
      history: { orderBy: { createdAt: "desc" }, take: 50 },
      approvals: true,
      jobs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}
