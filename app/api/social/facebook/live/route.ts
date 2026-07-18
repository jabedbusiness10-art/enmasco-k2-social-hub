import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import { getDecryptedToken, listAccounts } from "@/services/social/accounts";
import { metaGraphGet } from "@/services/meta/oauth";

export const runtime = "nodejs";

// Server-side live fetch from the encrypted stored FB token. Never returns the raw token.
async function gq(endpoint: string, token: string, params = "") {
  const res = await metaGraphGet(endpoint, token, params ? Object.fromEntries(new URLSearchParams(params)) : {});
  if (!res.ok && res.error) {
    // surface a classified, actionable error instead of the raw Graph body
    const e = res.error;
    return { error: { message: e.message, code: e.code, kind: e.kind, recoverable: e.recoverable } };
  }
  return res.data ?? {};
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
    // Base posts always work. Enriched call (likes/attachments) needs pages_read_engagement
    // which dev-mode tokens may lack - fall back gracefully so posts still render.
    const basePosts = await gq(`${pageId}/posts`, token, "fields=message,created_time,permalink_url&limit=8").catch(() => ({ data: [] }));
    const enriched = await gq(`${pageId}/posts`, token, "fields=message,created_time,permalink_url,attachments{media_type,media,url,title},likes.limit(0).summary(true)&limit=8").catch(() => null);
    const postsRaw = enriched && enriched.data ? enriched : basePosts;
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
      posts: (postsRaw.data ?? []).map((p: any) => {
        const att = p.attachments?.data?.[0];
        const media = att?.media ?? null;
        return {
          id: p.id,
          message: p.message ?? "",
          createdTime: p.created_time ?? null,
          url: p.permalink_url ?? null,
          likes: p.likes?.summary?.total_count ?? 0,
          comments: [],
          mediaType: att?.media_type ?? null,
          mediaUrl: media?.src ?? att?.url ?? (typeof media === "string" ? media : null),
          mediaTitle: att?.title ?? null,
        };
      }),
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
