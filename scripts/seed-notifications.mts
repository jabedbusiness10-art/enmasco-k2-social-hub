import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";
const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  if (!users.length) { console.log("no users"); return; }
  // seed from real media assets
  const assets = await prisma.mediaAsset.findMany({ where: { deletedAt: null }, take: 5 });
  for (const a of assets) {
    const u = users.find((x) => x.id === a.uploadedById) || users[0];
    await prisma.notification.create({
      data: {
        userId: u.id, type: "MEDIA", category: "MEDIA", priority: "LOW",
        title: `Upload Complete`, body: `${a.originalName || a.filename} is ready in Media Library.`,
        module: "media", entity: a.id, entityType: "ASSET", senderName: a.uploadedBy || u.name,
        meta: null,
      },
    });
  }
  // seed security + system from real activity
  for (const u of users) {
    await prisma.notification.create({
      data: { userId: u.id, type: "SECURITY", category: "SECURITY", priority: "INFO",
        title: "New session signed in", body: "A new dashboard session was started.", module: "auth", senderName: u.name },
    });
  }
  // system event
  await prisma.systemEvent.create({ data: { source: "system", action: "Background job completed", status: "success", message: "Notification engine initialized." } });
  const total = await prisma.notification.count();
  console.log("seeded. total notifications:", total);
}

main().finally(() => prisma.$disconnect());
