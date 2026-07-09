import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { SessionUser } from "@/types/auth";
import { authenticate, toSessionUser } from "@/services/auth/permissions";

export const authOptions = {
  session: {
    strategy: "jwt" as const,
  },
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "ENMASCO",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = authenticate(credentials.email, credentials.password);
        if (!user) return null;
        return toSessionUser(user) as SessionUser;
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
