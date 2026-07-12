import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { ensureDirectConversation, createGroupOrChannel } from "@/services/messenger";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const body = await req.json().catch(() => ({}));
  const { kind, userId, memberIds, title, description, departmentId, isCeoChannel, isBroadcast } = body;

  try {
    if (kind === "DIRECT") {
      if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const conv = await ensureDirectConversation(user.id, userId);
      return new Response(JSON.stringify({ conversation: conv }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    if (["GROUP", "CHANNEL", "DEPARTMENT"].includes(kind)) {
      if (!title) return new Response(JSON.stringify({ error: "title required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      const conv = await createGroupOrChannel({
        kind,
        title,
        description,
        memberIds: memberIds ?? [],
        createdById: user.id,
        departmentId,
        isCeoChannel,
        isBroadcast,
      });
      return new Response(JSON.stringify({ conversation: conv }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "invalid kind" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "failed" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, avatar: true, role: { select: { name: true } }, department: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  return new Response(JSON.stringify({ users: users.map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, role: u.role?.name, department: u.department?.name ?? null })) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
