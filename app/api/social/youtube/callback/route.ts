import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  exchangeCodeForToken,
  getChannels,
  tokenExpiryInfo,
} from "@/services/youtube/oauth";
import { connectYouTubeAccount } from "@/services/social/accounts";

export const runtime = "nodejs";

/**
 * TASK-57 — YouTube (Google) OAuth callback.
 * Validates `state` (CSRF), exchanges code for a token, fetches the user's
 * YouTube channel, then securely persists the connection. Never returns
 * tokens to the client.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return NextResponse.redirect(
      new URL("/dashboard/social/accounts?youtube=unauthorized", req.url),
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  const storedState = req.cookies.get("youtube_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(
      new URL(
        `/dashboard/social/accounts?youtube=error&reason=${encodeURIComponent(reason)}`,
        req.url,
      ),
    );

  if (error) {
    const msg = errorDesc ?? error;
    return fail(msg);
  }
  if (!code) return fail("Missing authorization code");
  if (!state || !storedState || state !== storedState) {
    return fail("Invalid OAuth state (possible CSRF)");
  }

  try {
    const user = perm.user!;
    // 1. code -> access token (+ refresh token for offline access)
    const token = await exchangeCodeForToken(code);
    const { expiresAt } = tokenExpiryInfo(token.expires_in);

    // 2. fetch the authenticated user's YouTube channel
    const channels = await getChannels(token.access_token);
    if (!channels.length) {
      return fail("No YouTube channel found for this Google account");
    }
    const channel = channels[0];

    // 3. persist securely (tokens encrypted at rest)
    await connectYouTubeAccount({
      channel: {
        id: channel.id,
        title: channel.title,
        handle: channel.handle,
        customUrl: channel.customUrl,
        thumbnail: channel.thumbnail,
        subscriberCount: channel.subscriberCount,
        viewCount: channel.viewCount,
        videoCount: channel.videoCount,
      },
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? null,
      permissions: token.scope ? token.scope.split(" ") : [],
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      connectedBy: user.name ?? user.email,
      connectedById: user.id,
    });

    const res = NextResponse.redirect(
      new URL("/dashboard/social/accounts?youtube=success", req.url),
    );
    res.cookies.set("youtube_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e: any) {
    return fail(e?.message ?? "YouTube connection failed");
  }
}
