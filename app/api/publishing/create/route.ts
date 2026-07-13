import { NextRequest, NextResponse } from "next/server";
import { requirePermission, getCurrentUser } from "@/lib/auth-server";
import { createPost, updatePost, deletePost } from "@/services/publishing/service";

export const runtime = "nodejs";

/** TASK-48 — Create a post (draft / scheduled). */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const user = perm.user!;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.caption || !Array.isArray(body.platforms) || !body.platforms.length) {
    return NextResponse.json({ error: "caption and platforms[] are required" }, { status: 400 });
  }
  try {
    const post = await createPost({
      ...body,
      createdBy: { id: user.id, name: user.name },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Create failed" }, { status: 500 });
  }
}

/** List posts. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { prisma } = await import("@/lib/db");
  const posts = await prisma.post.findMany({
    include: { platforms: true, media: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ posts });
}
