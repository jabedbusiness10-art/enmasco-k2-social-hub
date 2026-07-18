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
        name: user.name,
        email: user.email,
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

  // TASK-70 — Enterprise Database Foundation seed (safe: upserts only, keeps
  // existing users/data). Ensures a Company exists, then creates a default
  // Team under it and links all users to that team.
  const company =
    (await prisma.company.findFirst()) ??
    (await prisma.company.create({
      data: { name: "ENMASCO K2 SOCIAL", industry: "Social Media Automation" },
    }));

  const team = await prisma.team.upsert({
    where: { slug: "core-ops" },
    update: {},
    create: {
      companyId: company.id,
      name: "Core Operations",
      slug: "core-ops",
      description: "Default enterprise team",
      status: "ACTIVE",
    },
  });

  const allUsers = await prisma.user.findMany({ select: { id: true } });
  for (const u of allUsers) {
    await prisma.user.update({
      where: { id: u.id },
      data: { teamId: team.id },
    });
  }

  // TASK-70.1 — Seed the existing mock duties into the DB (idempotent).
  const dutyCount = await prisma.duty.count();
  if (dutyCount === 0) {
  const mockDuties = [
  { title: "Install Hikvision CCTV", description: "Install 8 unit Hikvision cameras at main gate and parking.", department: "Security", assignedTo: "MD Kazim", priority: "HIGH", status: "IN_PROGRESS", startDate: "2026-07-01", dueDate: "2026-07-10", attachment: "https://example.com/cctv-plan.pdf" },
  { title: "Configure NVR", description: "Configure NVR and enable remote viewing.", department: "Security", assignedTo: "Sara Khan", priority: "MEDIUM", status: "PENDING", startDate: "2026-07-05", dueDate: "2026-07-12" },
  { title: "Client Site Visit", description: "Visit client site in Riyadh for requirement gathering.", department: "Sales", assignedTo: "Rafi Ahmed", priority: "HIGH", status: "COMPLETED", startDate: "2026-06-28", dueDate: "2026-07-03" },
  { title: "Prepare Quotation", description: "Prepare quotation for social media automation package.", department: "Sales", assignedTo: "Nusrat Jahan", priority: "MEDIUM", status: "PENDING", startDate: "2026-07-06", dueDate: "2026-07-14" },
  { title: "Social Media Campaign", description: "Schedule and launch campaign for EnmaSco K2.", department: "Marketing", assignedTo: "MD Kazim", priority: "HIGH", status: "IN_PROGRESS", startDate: "2026-07-02", dueDate: "2026-07-09", attachment: "https://example.com/campaign-brief.pdf" },
  { title: "Monthly Maintenance", description: "Server room monthly check and backup verification.", department: "Engineering", assignedTo: "Rafi Ahmed", priority: "LOW", status: "COMPLETED", startDate: "2026-06-30", dueDate: "2026-07-01" },
  { title: "Warehouse Inspection", description: "Physical inspection of warehouse stock layout.", department: "Operations", assignedTo: "Sara Khan", priority: "MEDIUM", status: "PENDING", startDate: "2026-07-08", dueDate: "2026-07-15" },
  { title: "Update Dashboard UI", description: "Refine dashboard cards and topbar animations.", department: "Engineering", assignedTo: "Nusrat Jahan", priority: "MEDIUM", status: "IN_PROGRESS", startDate: "2026-07-04", dueDate: "2026-07-11" },
  { title: "Security Audit", description: "Internal security audit and compliance review.", department: "Security", assignedTo: "MD Kazim", priority: "HIGH", status: "PENDING", startDate: "2026-07-07", dueDate: "2026-07-13" },
  { title: "Employee Training", description: "Conduct onboarding training for new hires.", department: "HR", assignedTo: "Sara Khan", priority: "LOW", status: "CANCELLED", startDate: "2026-07-09", dueDate: "2026-07-16" },
  ];
  for (const d of mockDuties) {
  await prisma.duty.create({ data: d });
  }
  }

  // TASK-70.5 — Seed real activity/audit/security/device/api/assignment data
  // so the separated Team + Users activity/roles modules render real content
  // (DB-backed, idempotent — never overwrites existing rows).
  const [loginCount, auditCount, secCount, deviceCount, apiCount, assignCount] = await Promise.all([
  prisma.loginHistory.count(),
  prisma.auditLog.count(),
  prisma.securityEvent.count(),
  prisma.trustedDevice.count(),
  prisma.apiConnection.count(),
  prisma.assignment.count(),
  ]);

  const seedUsers = await prisma.user.findMany({ include: { role: true } });
  const ceo = seedUsers.find((u) => u.role.name === "CEO") ?? seedUsers[0];
  const admin = seedUsers.find((u) => u.role.name === "ADMIN") ?? seedUsers[0];
  const marketingManager = seedUsers.find((u) => u.role.name === "MARKETING_MANAGER") ?? seedUsers[0];
  const marketingTeam = seedUsers.find((u) => u.role.name === "MARKETING_TEAM") ?? seedUsers[0];

  if (loginCount === 0 && ceo) {
  const logins = [
  { userId: ceo.id, email: ceo.email, result: "SUCCESS", ip: "192.168.1.10", browser: "Chrome", os: "Windows", country: "Bangladesh", city: "Dhaka" },
  { userId: admin?.id ?? ceo.id, email: admin?.email ?? ceo.email, result: "SUCCESS", ip: "192.168.1.11", browser: "Safari", os: "macOS", country: "Saudi Arabia", city: "Riyadh" },
  { userId: marketingTeam?.id ?? ceo.id, email: marketingTeam?.email ?? ceo.email, result: "FAILURE", ip: "203.0.113.5", browser: "Firefox", os: "Linux", country: "Unknown", city: "Unknown" },
  { userId: ceo.id, email: ceo.email, result: "LOGOUT", ip: "192.168.1.10", browser: "Chrome", os: "Windows", country: "Bangladesh", city: "Dhaka" },
  ];
  for (const l of logins) await prisma.loginHistory.create({ data: l });
  }

  if (auditCount === 0 && ceo) {
  const audits = [
  { action: "MEDIA_UPLOAD", actionType: "MEDIA", module: "MEDIA", entityName: "HeroBanner", status: "SUCCESS", severity: "INFO", createdById: ceo.id, ip: "192.168.1.10" },
  { action: "ROLE_PERMISSION_UPDATE", actionType: "PERMISSION", module: "SECURITY", entityName: "MANAGE_ROLES", status: "SUCCESS", severity: "MEDIUM", createdById: admin?.id ?? ceo.id, ip: "192.168.1.11" },
  { action: "PASSWORD_CHANGE", actionType: "AUTH", module: "AUTH", entityName: "ceo@enmasco.local", status: "SUCCESS", severity: "LOW", createdById: ceo.id, ip: "192.168.1.10" },
  { action: "SCHEDULE_POST", actionType: "PUBLISH", module: "SOCIAL", entityName: "CampaignQ3", status: "SUCCESS", severity: "INFO", createdById: marketingManager?.id ?? ceo.id, ip: "192.168.1.12" },
  ];
  for (const a of audits) await prisma.auditLog.create({ data: a });
  }

  if (secCount === 0 && ceo) {
  const events = [
  { severity: "HIGH", type: "SUSPICIOUS_LOGIN", title: "Repeated failed login from new IP", message: "3 failed attempts from 203.0.113.5", userId: marketingTeam?.id ?? ceo.id, userEmail: marketingTeam?.email ?? ceo.email, ip: "203.0.113.5", resolved: false },
  { severity: "MEDIUM", type: "PERMISSION_CHANGED", title: "Role permission updated", message: "MANAGE_ROLES granted to ADMIN", userId: admin?.id ?? ceo.id, userEmail: admin?.email ?? ceo.email, resolved: false },
  { severity: "LOW", type: "SESSION", title: "New device trusted", message: "iPad added to trusted devices", userId: ceo.id, userEmail: ceo.email, resolved: true },
  ];
  for (const e of events) await prisma.securityEvent.create({ data: e });
  }

  if (deviceCount === 0 && ceo) {
  const devices = [
  { userId: ceo.id, fingerprint: "fp-ceo-mac", name: "MD Kazim's MacBook", browser: "Chrome", os: "macOS", ip: "192.168.1.10" },
  { userId: admin?.id ?? ceo.id, fingerprint: "fp-admin-ipad", name: "Admin iPad", browser: "Safari", os: "iOS", ip: "192.168.1.11" },
  { userId: marketingTeam?.id ?? ceo.id, fingerprint: "fp-mt-linux", name: "Marketing Linux", browser: "Firefox", os: "Linux", ip: "192.168.1.12" },
  ];
  for (const d of devices) await prisma.trustedDevice.create({ data: d });
  }

  if (apiCount === 0 && ceo) {
  const apis = [
  { userId: ceo.id, name: "OpenRouter AI", provider: "openrouter", status: "ACTIVE", scopes: ["chat", "completions"], lastUsedAt: new Date() },
  { userId: admin?.id ?? ceo.id, name: "Meta Graph API", provider: "meta", status: "ACTIVE", scopes: ["pages_manage", "instagram_content_publish"], lastUsedAt: new Date(Date.now() - 86400000) },
  { userId: marketingManager?.id ?? ceo.id, name: "LinkedIn API", provider: "linkedin", status: "INACTIVE", scopes: ["r_organization_social"], lastUsedAt: null },
  ];
  for (const a of apis) await prisma.apiConnection.create({ data: a });
  }

  if (assignCount === 0 && ceo) {
  const a1 = await prisma.assignment.create({
  data: {
    title: "Q3 Social Campaign Launch",
    description: "Plan and publish the Q3 campaign across all platforms.",
    kind: "INTERNAL_TASK",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignedById: ceo.id,
    assignedToId: marketingManager?.id ?? ceo.id,
    departmentId: marketing?.id ?? null,
  },
  });
  await prisma.assignmentActivity.create({ data: { assignmentId: a1.id, actorId: ceo.id, action: "CREATED", meta: JSON.stringify({ title: a1.title }) } });
  await prisma.assignmentActivity.create({ data: { assignmentId: a1.id, actorId: marketingManager?.id ?? ceo.id, action: "STATUS", meta: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }) } });
  await prisma.assignmentHistory.create({ data: { assignmentId: a1.id, changedById: ceo.id, field: "status", fromValue: "TODO", toValue: "IN_PROGRESS" } });

  const a2 = await prisma.assignment.create({
  data: {
    title: "Monthly Analytics Report",
    description: "Compile engagement metrics for leadership.",
    kind: "INTERNAL_TASK",
    status: "REVIEW",
    priority: "MEDIUM",
    assignedById: admin?.id ?? ceo.id,
    assignedToId: marketingTeam?.id ?? ceo.id,
    departmentId: marketing?.id ?? null,
  },
  });
  await prisma.assignmentActivity.create({ data: { assignmentId: a2.id, actorId: admin?.id ?? ceo.id, action: "CREATED", meta: JSON.stringify({ title: a2.title }) } });
  }
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
