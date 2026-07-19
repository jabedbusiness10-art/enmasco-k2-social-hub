import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/login",
  "/unauthorized",
  "/",
  "/api/auth",
  "/api/health",
  "/api/system",
  "/healthz",
  "/api/webhooks/meta",
  "/api/webhooks/website",
  "/api/website/webhook",
];

const rateLimitExemptPaths = ["/api/auth", "/api/health", "/api/system"];

function isPublic(pathname: string) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isRateLimitExempt(pathname: string) {
  return rateLimitExemptPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
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

// TASK-62 — route-level role guard (defense in depth alongside page/API checks)
const ADMIN_PREFIXES = ["/dashboard/admin", "/dashboard/monitoring", "/dashboard/queue", "/monitoring"];
const EXECUTIVE_PREFIX = "/dashboard/executive";
const EXPORT_PREFIX = "/dashboard/insights/reports";

function needsAdmin(path: string) {
  return ADMIN_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- Rate limit API routes (skip public auth + health) ---
  if (path.startsWith("/api/") && !isRateLimitExempt(path)) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // --- Auth guard ---
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

    // --- Role guard (decode JWT) ---
    if (needsAdmin(path) || path.startsWith(EXECUTIVE_PREFIX) || path.startsWith(EXPORT_PREFIX)) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const role = (token?.role as string) || "";
      const isAdmin = role === "CEO" || role === "ADMIN";
      if (!isAdmin) {
        if (path.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({ error: "Forbidden: admin access required" }),
            { status: 403, headers: { "content-type": "application/json" } }
          );
        }
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

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
    "/monitoring/:path*",
    "/api/:path*",
  ],
};
