import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getWebsiteConnection, testWebsiteConnection } from "@/services/website/connection";
import { asPublicIntegrationError } from "@/services/integrations/errors";

export const runtime = "nodejs";

/**
 * TASK-47 — Dedicated test endpoint (spec: app/api/website/test).
 * Accepts { id } in the body and runs a live connection test.
 */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    const result = await testWebsiteConnection(id);
    const connection = await getWebsiteConnection(id);
    return NextResponse.json({ result, connection });
  } catch (error) {
    const publicError = asPublicIntegrationError(error, "WEBSITE");
    return NextResponse.json(publicError.error, { status: publicError.status });
  }
}
