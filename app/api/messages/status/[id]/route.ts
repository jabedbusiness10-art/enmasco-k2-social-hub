import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { updateConversationStatus } from "@/services/messaging/conversations";
import type { ConvStatus } from "@/services/messaging/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: ConvStatus[] = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status as ConvStatus | undefined;
  if (!status || !STATUSES.includes(status)) {
    return Response.json({ error: "Valid status required (OPEN|PENDING|RESOLVED|CLOSED)" }, { status: 400 });
  }
  try {
    const conv = await updateConversationStatus(id, user.id, status);
    return Response.json({ conversation: conv });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "Failed" }, { status: 403 });
  }
}
