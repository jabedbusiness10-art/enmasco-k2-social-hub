import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { SessionUser } from "@/types/auth";
import { authenticate, toSessionUser } from "@/services/auth/permissions";
import { prisma } from "@/lib/db";
import { recordSession } from "@/lib/security/sessions";
import { parseUA, writeAudit } from "@/lib/security/audit";

// TASK-73 — record a real login event: LoginHistory (SUCCESS) + Session row.
// Returns the created session id so it can be embedded in the JWT (enables
// real session revocation via terminate/terminate-others).
async function recordLoginSuccess(email: string, userId: string, meta?: { ua?: string | null; ip?: string | null }) {
  const ua = meta?.ua ?? undefined;
  const ip = meta?.ip ?? undefined;
  const { browser, os } = parseUA(ua ?? undefined);
  try {
    await prisma.loginHistory.create({
      data: { userId, email, result: "SUCCESS", ip: ip ?? null, userAgent: ua ?? null, browser, os },
    });
    const session = await recordSession(userId, `${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`, meta);
    await writeAudit({
      action: "User login",
      actionType: "AUTH",
      module: "SECURITY",
      resource: email,
      status: "SUCCESS",
      createdById: userId,
    });
    return session.id;
  } catch (e) {
    console.error("[auth] recordLoginSuccess failed", e);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "ENMASCO",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = authenticate(credentials.email, credentials.password);
        if (!user) {
          // failed login attempt audit (best-effort, no user id available)
          try {
            const h = (req?.headers ?? {}) as Record<string, string | undefined>;
            const ua = h["user-agent"] ?? undefined;
            const ip = h["x-forwarded-for"]?.split(",")[0]?.trim() || h["x-real-ip"] || undefined;
            const { browser, os } = parseUA(ua);
            await prisma.loginHistory.create({
              data: { userId: "unknown", email: credentials.email, result: "FAILURE", ip: ip ?? null, userAgent: ua ?? null, browser, os, reason: "bad credentials" },
            });
          } catch { /* never block login on audit failure */ }
          return null;
        }
        const h = (req?.headers ?? {}) as Record<string, string | undefined>;
        const ua = h["user-agent"] ?? undefined;
        const ip = h["x-forwarded-for"]?.split(",")[0]?.trim() || h["x-real-ip"] || undefined;
        const sid = await recordLoginSuccess(user.email, user.id, { ua, ip });
        const sessionUser = toSessionUser(user) as SessionUser & { sid?: string };
        if (sid) sessionUser.sid = sid;
        return sessionUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as SessionUser).role;
        token.department = (user as SessionUser).department;
        token.avatar = (user as SessionUser).avatar;
        const sid = (user as SessionUser & { sid?: string }).sid;
        if (sid) token.sid = sid;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as SessionUser["role"],
        department: token.department as string | undefined,
        avatar: token.avatar as string | undefined,
      } as SessionUser;
      return session;
    },
  },
  events: {
    async signOut({ token }: { token?: any }) {
      const email = token?.email as string | undefined;
      const id = token?.id as string | undefined;
      if (id) {
        try {
          await prisma.loginHistory.create({
            data: { userId: id, email: email ?? "unknown", result: "LOGOUT" },
          });
          await writeAudit({ action: "User logout", actionType: "AUTH", module: "SECURITY", resource: email, status: "SUCCESS", createdById: id });
        } catch { /* never block on audit failure */ }
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = NextAuth(authOptions);
export default auth;
export const GET = auth;
export const POST = auth;
