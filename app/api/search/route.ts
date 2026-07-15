import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TASK-61 — Global search API (RBAC gated).
 * Searches REAL entities the user can access. Never returns secrets.
 * Role-aware: admin-only tables (e.g. queue jobs) only when permitted.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_DASHBOARD", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  const user = perm.user!;
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 60);
  if (!q) return NextResponse.json({ results: [] });

  const like = `%${q}%`;
  const isAdmin = user.role === "CEO" || user.role === "ADMIN";
  const take5 = (arr: any[]) => (arr ?? []).slice(0, 5);

  const [accounts, posts, media, collections, tags, employees, notifications] = await Promise.all([
    prisma.companySocialAccount.findMany({ where: { OR: [{ accountName: { contains: like } }, { accountHandle: { contains: like } }] } }).then(take5).catch(() => []),
    prisma.post.findMany({ where: { content: { contains: like } } }).then(take5).catch(() => []),
    prisma.mediaAsset.findMany({ where: { OR: [{ originalName: { contains: like } }, { description: { contains: like } }] } }).then(take5).catch(() => []),
    prisma.mediaCollection.findMany({ where: { name: { contains: like } } }).then(take5).catch(() => []),
    prisma.mediaTag.findMany({ where: { name: { contains: like } } }).then(take5).catch(() => []),
    prisma.user.findMany({ where: { OR: [{ name: { contains: like } }, { email: { contains: like } }] } }).then(take5).catch(() => []),
    prisma.notification.findMany({ where: { OR: [{ title: { contains: like } }, { body: { contains: like } }] } }).then(take5).catch(() => []),
  ]);

  const results: any[] = [
    ...(accounts as any[]).map((a) => ({ id: `acc-${a.id}`, kind: "account", label: a.accountName || a.accountHandle, sub: a.platform, href: "/dashboard/social/accounts" })),
    ...(posts as any[]).map((p) => ({ id: `post-${p.id}`, kind: "post", label: p.content?.slice(0, 60), sub: "Post", href: "/dashboard/social/publisher" })),
    ...(media as any[]).map((m) => ({ id: `med-${m.id}`, kind: "media", label: m.originalName, sub: "Media", href: "/dashboard/media?view=assets" })),
    ...(collections as any[]).map((c) => ({ id: `col-${c.id}`, kind: "collection", label: c.name, sub: "Collection", href: "/dashboard/media?view=collections" })),
    ...(tags as any[]).map((t) => ({ id: `tag-${t.id}`, kind: "tag", label: t.name, sub: "Tag", href: "/dashboard/media?view=tags" })),
    ...(employees as any[]).map((u) => ({ id: `usr-${u.id}`, kind: "employee", label: u.name, sub: u.email, href: "/dashboard/team/members" })),
    ...(notifications as any[]).map((n) => ({ id: `ntf-${n.id}`, kind: "notification", label: n.title, sub: "Notification", href: "/dashboard/notifications" })),
  ];

  if (isAdmin) {
    const jobs = await prisma.queueJob.findMany({ where: { OR: [{ name: { contains: like } }, { queue: { contains: like } }] } }).then(take5).catch(() => []);
    results.push(...(jobs as any[]).map((j) => ({ id: `job-${j.id}`, kind: "queue", label: `${j.queue} / ${j.name}`, sub: j.status, href: "/dashboard/queue/jobs" })));
  }

  log("search").info("query", { q, hits: results.length, role: user.role });
  return NextResponse.json({ results: results.slice(0, 30) });
}
