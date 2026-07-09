import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const f of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(process.cwd(), f), "utf8");
      const m = raw.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) return m[1].trim();
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

// Prisma 7 reads DATABASE_URL from the environment; ensure it is set at runtime
if (!process.env.DATABASE_URL) {
  const url = loadDatabaseUrl();
  if (url) process.env.DATABASE_URL = url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
