import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getWebsiteConnection, testWebsiteConnection } from "@/services/website/connection";
import { asPublicIntegrationError } from "@/services/integrations/errors";

export const runtime = "nodejs";

/** TASK-47 — Live health/status of a website connection. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  const conn = await getWebsiteConnection(id);
  if (!conn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ connection: conn });
}

/** TASK-47 — Run a live connection test (reachability, SSL, API, webhook). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });
  const { id } = await params;
  try {
    const result = await testWebsiteConnection(id);
    const conn = await getWebsiteConnection(id);
    return NextResponse.json({ result, connection: conn });
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}
