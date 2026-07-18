import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { listAccounts } from "@/services/social/accounts";

export const runtime = "nodejs";

/**
 * TASK-74 — Social Accounts API with live Meta health.
 * Returns the same public account list plus a computed `health` object
 * (connection/token/permission status, API version, last sync, token
 * expiration, health score). No tokens or secrets are ever returned.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }
  const accounts = await listAccounts();

  const withHealth = accounts.map((a) => {
    const daysLeft = a.expiresAt
      ? (new Date(a.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      : null;
    const tokenExpiration = a.expiresAt ?? null;
    // Health score: starts at 100, penalize by status / expiry proximity.
    let score = 100;
    if (a.status !== "CONNECTED") score -= 60;
    if (daysLeft != null) {
      if (daysLeft <= 0) score -= 40;
      else if (daysLeft <= 3) score -= 25;
      else if (daysLeft <= 7) score -= 10;
    }
    if (a.accessTokenStatus === "EXPIRING") score -= 10;
    if (a.accessTokenStatus === "EXPIRED") score -= 30;
    score = Math.max(0, Math.min(100, score));

    return {
      ...a,
      health: {
        connectionStatus: a.status,
        tokenStatus: a.accessTokenStatus ?? "ACTIVE",
        permissionStatus: a.permissions?.length ? "GRANTED" : "MISSING",
        apiVersion: a.apiVersion ?? "Graph v21.0",
        lastSync: a.lastSyncAt,
        tokenExpiration,
        healthScore: score,
      },
    };
  });

  return NextResponse.json({ accounts: withHealth });
}
