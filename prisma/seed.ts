import { PrismaClient, UserRole, DepartmentName } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";

// Prisma 7.8 requires a Driver Adapter.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = await Promise.all(
    ["CEO", "ADMIN", "MARKETING_MANAGER", "MARKETING_TEAM", "CONTENT_CREATOR", "ANALYST", "VIEWER"].map(
      (name) =>
        prisma.role.upsert({
          where: { name: name as UserRole },
          update: {},
          create: { name: name as UserRole },
        }),
    ),
  );

  const departments = await Promise.all(
    ["MARKETING", "SALES", "HR", "FINANCE", "IT"].map(
      (name) =>
        prisma.department.upsert({
          where: { name: name as DepartmentName },
          update: {},
          create: { name: name as DepartmentName, description: name },
        }),
    ),
  );

  const marketing = departments.find((item) => item.name === "MARKETING");
  const sales = departments.find((item) => item.name === "SALES");

  const users = [
    { name: "MD Kazim", email: "ceo@enmasco.local", password: "admin123", role: "CEO", department: null },
    { name: "Admin User", email: "admin@enmasco.local", password: "admin123", role: "ADMIN", department: null },
    { name: "Marketing Manager", email: "marketing_manager@enmasco.local", password: "admin123", role: "MARKETING_MANAGER", department: marketing },
    { name: "Marketing Team", email: "marketing_team@enmasco.local", password: "admin123", role: "MARKETING_TEAM", department: marketing },
    { name: "Viewer", email: "viewer@enmasco.local", password: "admin123", role: "VIEWER", department: sales },
  ];

  for (const user of users) {
    const role = roles.find((item) => item.name === user.role);
    if (!role) continue;
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: user.password,
        roleId: role.id,
        departmentId: user.department?.id ?? null,
      },
    });
  }

  await prisma.companySettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      companyName: "ENMASCO K2 SOCIAL",
      supportEmail: "support@enmasco.local",
      timezone: "Asia/Riyadh",
      defaultLanguage: "bn",
      allowRegistration: true,
      maintenanceMode: false,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
