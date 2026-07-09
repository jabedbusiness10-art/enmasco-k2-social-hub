import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { SessionUser } from "@/types/auth";
import { authenticate, toSessionUser } from "@/services/auth/permissions";

export const auth = NextAuth({
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
  secret: process.env.AUTH_SECRET,
});

export const { handlers } = auth;
