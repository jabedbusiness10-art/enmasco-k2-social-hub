import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 removed the Rust engine — a Driver Adapter is required.
// PrismaPg accepts a connection string directly (no need to import `pg`).
//
// NOTE: never write back into process.env.DATABASE_URL here. Next/webpack
// statically inlines process.env.DATABASE_URL, so `process.env.X = ...`
// compiles into an illegal assignment to a string literal. Read the value
// into a local instead.
function resolveDatabaseUrl(): string | undefined {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;
  for (const f of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(process.cwd(), f), "utf8");
      const m = raw.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) return m[1].trim();
    } catch {
      /* ignore missing file */
    }
  }
  return undefined;
}

const connectionString = resolveDatabaseUrl() ?? "";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(connectionString) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
