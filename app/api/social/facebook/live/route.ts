import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDecryptedToken, listAccounts } from "@/services/social/accounts";

export const runtime = "nodejs";

// Server-side live fetch from the encrypted stored FB token. Never returns the raw token.
async function gq(endpoint: string, token: string, params = "") {
  const sep = params ? "?" : "";
  const url = `https://graph.facebook.com/v21.0/${endpoint}${sep}${params}&access_token=${token}`;
  const res = await fetch(url);
  return res.json();
}

export async function GET(req: NextRequest) {
  const perm = await requirePermission("VIEW_SOCIAL", req);
  if (!perm.ok) return NextResponse.json({ error: perm.error ?? "Unauthorized" }, { status: 401 });

  const accounts = await listAccounts();
  const fb = accounts.find((a) => a.platform === "FACEBOOK" && a.status === "CONNECTED");
  if (!fb) return NextResponse.json({ error: "No connected Facebook account" }, { status: 404 });

  const token = await getDecryptedToken(fb.id);
  if (!token) return NextResponse.json({ error: "Token missing or decrypt failed" }, { status: 400 });

  const pageId = fb.pageId || fb.accountId;
  if (!pageId) return NextResponse.json({ error: "Page ID not set" }, { status: 400 });

  try {
    const info = await gq(pageId, token, "fields=name,fan_count,followers_count,category,link");
    const postsRaw = await gq(`${pageId}/posts`, token, "fields=message,created_time,permalink_url,likes.limit(0).summary(true)&limit=8").catch(() => ({ data: [] }));
    const convsRaw = await gq(`${pageId}/conversations`, token, "fields=id,snippet,updated_time&limit=10").catch(() => ({ data: [] }));

    if (info.error) {
      return NextResponse.json({ error: `Graph API: ${info.error.message}`, code: info.error.code }, { status: 502 });
    }

    return NextResponse.json({
      page: {
        id: pageId,
        name: info.name ?? fb.accountName,
        fanCount: info.fan_count ?? null,
        followersCount: info.followers_count ?? null,
        category: info.category ?? null,
        link: info.link ?? fb.profileUrl ?? null,
        about: null,
      },
      posts: (postsRaw.data ?? []).map((p: any) => ({
        id: p.id,
        message: p.message ?? "",
        createdTime: p.created_time ?? null,
        url: p.permalink_url ?? null,
        likes: p.likes?.summary?.total_count ?? 0,
        comments: [],
      })),
      conversations: (convsRaw.data ?? []).map((c: any) => ({
        id: c.id,
        snippet: c.snippet ?? "",
        updatedTime: c.updated_time ?? null,
      })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Graph API failed" }, { status: 502 });
  }
}
