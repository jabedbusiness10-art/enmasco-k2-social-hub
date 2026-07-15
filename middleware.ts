import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/unauthorized", "/", "/api/auth", "/api/health", "/api/system", "/healthz"];

function isPublic(pathname: string) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/* ---------- TASK-59.7 — lightweight API rate limiting ----------
 * Sliding-window limiter (in-memory). Protects /api/* from abuse.
 * For multi-instance deployments, swap this for Redis (see DEPLOYMENT.md).
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120; // ~2 req/s average per IP
const buckets = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- Rate limit API routes (skip public auth + health) ---
  if (path.startsWith("/api/") && !isPublic(path)) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // --- Auth guard ---
  // Pages -> redirect to /login.  API routes -> 401 JSON (not a redirect,
  // so API consumers get a real error, not an HTML login page).
  if (!isPublic(path)) {
    const session =
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");
    if (!session) {
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // --- Security headers are applied in next.config; add HSTS hint on root ---
  const res = NextResponse.next();
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/social/:path*",
    "/planner/:path*",
    "/automation/:path*",
    "/insights/:path*",
    "/media/:path*",
    "/scheduler/:path*",
    "/publishing/:path*",
    "/inbox/:path*",
    "/ai/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/api/:path*",
  ],
};
