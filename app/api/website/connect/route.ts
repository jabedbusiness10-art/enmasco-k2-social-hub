import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { createWebsiteConnection, listWebsiteConnections, webhookUrlFor } from "@/services/website/connection";

export const runtime = "nodejs";

/** TASK-47 — Connect a website (CMS) as a first-class connected platform. */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { websiteName, websiteUrl, cmsType, apiKey, webhookSecret, syncFrequency } = body ?? {};
  if (!websiteName || !websiteUrl || !cmsType || !apiKey || !webhookSecret) {
    return NextResponse.json(
      { error: "websiteName, websiteUrl, cmsType, apiKey and webhookSecret are required" },
      { status: 400 },
    );
  }

  const validCms = ["WORDPRESS", "NEXTJS", "CUSTOM", "HEADLESS", "LARAVEL", "STATIC"];
  if (!validCms.includes(cmsType)) {
    return NextResponse.json({ error: "Invalid cmsType" }, { status: 400 });
  }

  try {
    const conn = await createWebsiteConnection({
      websiteName,
      websiteUrl,
      cmsType,
      apiKey,
      webhookSecret,
      syncFrequency,
      connectedBy: perm.user!.name ?? perm.user!.email,
    });
    return NextResponse.json({ connection: conn, webhookUrl: webhookUrlFor(conn.id) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to connect website" }, { status: 500 });
  }
}

/** List website connections. */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const connections = await listWebsiteConnections();
  return NextResponse.json({ connections });
}
