import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { refreshAccount, SocialProviderRefreshError } from "@/services/social/accounts";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const account = await refreshAccount(id);
    return NextResponse.json({ account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    const accountMissing = message === "Account not found";
    if (error instanceof SocialProviderRefreshError) {
      return NextResponse.json(
        {
          error: {
            code: error.reason,
            message,
            recoverable: error.recoverable,
            recovery: error.reason === "NETWORK_ERROR" || error.reason === "PROVIDER_UNAVAILABLE"
              ? "Try refreshing again shortly."
              : "Reconnect this account from Connected Accounts.",
          },
        },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      {
        error: accountMissing
          ? message
          : "Unable to refresh this account with its social provider. Please try again or reconnect the account.",
      },
      { status: accountMissing ? 404 : 502 },
    );
  }
}
