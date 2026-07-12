import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDecryptedToken } from "@/services/social/accounts";
import { testMetaConnection, debugToken } from "@/services/meta/oauth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * TASK-45 — Test a stored Meta connection.
 * Reads the encrypted token server-side, runs an end-to-end Graph API check,
 * and returns the result. Never exposes the raw token.
 */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Missing account id" }, { status: 400 });
  }

  const account = await prisma.companySocialAccount.findUnique({ where: { id } });
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
  if (account.platform !== "FACEBOOK" && account.platform !== "INSTAGRAM") {
    return NextResponse.json({ error: "Not a Meta connection" }, { status: 400 });
  }

  const token = await getDecryptedToken(id);
  if (!token) {
    return NextResponse.json(
      { ok: false, steps: [{ name: "Token", ok: false, detail: "No token stored or decrypt failed" }] },
      { status: 200 },
    );
  }

  // Validate token health via debug
  let debug: Awaited<ReturnType<typeof debugToken>> | null = null;
  try {
    debug = await debugToken(token);
  } catch {
    debug = null;
  }

  // Test page + IG access
  const result = await testMetaConnection({ pageToken: token });
  if (debug) {
    result.steps.unshift({
      name: "Token Validity",
      ok: debug.is_valid !== false,
      detail: debug.is_valid === false ? debug.error?.message : `expires ${debug.expires_at ?? "n/a"}`,
    });
  }

  return NextResponse.json({ ok: result.ok, steps: result.steps });
}
