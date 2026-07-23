import { NextRequest, NextResponse } from "next/server";
import { requirePermission, getCurrentUser } from "@/lib/auth-server";
import {
  listContentPlans,
  createContentPlan,
} from "@/services/content/planner";

export const runtime = "nodejs";

/** TASK-75 — List content plans (real Post rows). */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const items = await listContentPlans({
    platform: (sp.get("platform") as any) ?? "all",
    workflowStatus: (sp.get("workflowStatus") as any) ?? "all",
    campaignId: sp.get("campaignId") ?? "all",
    creatorId: sp.get("creatorId") ?? "all",
    search: sp.get("search") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    includeArchived: sp.get("includeArchived") === "true",
  });
  return NextResponse.json({ items });
}

/** TASK-75 — Create content plan (real Post row + audit). */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("MANAGE_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const user = perm.user!;
  const body = await req.json().catch(() => ({}));
  if (!body?.title || !body?.platforms?.length) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Content could not be saved", fields: { platforms: "Select at least one connected account" } }, { status: 400 });
  }
  try {
    const item = await createContentPlan(
      {
        title: body.title,
        caption: body.caption,
        platforms: body.platforms,
        accountIds: body.accountIds,
        workflowStatus: body.workflowStatus ?? "DRAFT",
        status: body.status,
        category: body.category,
        priority: body.priority,
        assigneeId: body.assigneeId ?? null,
        campaignId: body.campaignId ?? null,
        creatorId: user.id,
        labels: body.labels ?? [],
        hashtags: body.hashtags ?? [],
        notes: body.notes,
        targetAudience: body.targetAudience,
        goal: body.goal,
        scheduledAt: body.scheduledAt ?? null,
        mediaAttachments: body.mediaAttachments ?? [],
      },
      { id: user.id, name: user.name },
    );
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Create failed" }, { status: 500 });
  }
}
