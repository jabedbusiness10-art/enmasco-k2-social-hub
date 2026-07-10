/**
 * Seed demo Role + User rows so FK constraints in DB-backed features
 * (AI conversations, prompts, token usage, etc.) resolve against the
 * dummy-auth user ids (u1..u7). This does NOT change authentication —
 * auth still uses dummyUsers in services/auth. It only ensures the
 * referenced User rows exist in Postgres. Idempotent.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const env = fs.readFileSync("C:/ENMASCO-K2-SOCIAL-HUB/.env.local", "utf8");
const url = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!url) throw new Error("DATABASE_URL not found");
const pool = new pg.Pool({ connectionString: url });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const demoUsers = [
  { id: "u1", name: "Jabed", email: "ceo@enmasco.local", role: "CEO", password: "admin123" },
  { id: "u2", name: "Admin User", email: "admin@enmasco.local", role: "ADMIN", password: "admin123" },
  { id: "u3", name: "Marketing Manager", email: "manager@enmasco.local", role: "MARKETING_MANAGER", password: "admin123" },
  { id: "u4", name: "Marketing Team", email: "marketing@enmasco.local", role: "MARKETING_TEAM", password: "admin123" },
  { id: "u5", name: "Content Creator", email: "creator@enmasco.local", role: "CONTENT_CREATOR", password: "admin123" },
  { id: "u6", name: "Analyst", email: "analyst@enmasco.local", role: "ANALYST", password: "admin123" },
  { id: "u7", name: "Viewer", email: "viewer@enmasco.local", role: "VIEWER", password: "admin123" },
];

async function main() {
  for (const u of demoUsers) {
    await prisma.role.upsert({
      where: { name: u.role },
      update: {},
      create: { name: u.role },
    });
  }
  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, name: u.name, roleId: roleMap[u.role] },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        roleId: roleMap[u.role],
        status: "ACTIVE",
        emailVerified: false,
      },
    });
  }

  const count = await prisma.user.count();
  console.log("Seeded. Users in DB:", count);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
