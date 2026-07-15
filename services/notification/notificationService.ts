import { prisma } from "@/lib/db";

export type NotifyInput = {
  userId: string;
  type: any; // NotificationType
  category?: any; // NotificationCategory
  priority?: any; // NotificationPriority
  title: string;
  body?: string;
  module?: string;
  platform?: string;
  entity?: string;
  entityType?: string;
  department?: string;
  senderId?: string;
  senderName?: string;
  meta?: any; // will be JSON-stringified
};

class NotificationService {
  /** Single entry point: every module publishes through this. */
  async notify(input: NotifyInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        category: input.category ?? "SYSTEM",
        priority: input.priority ?? "MEDIUM",
        title: input.title,
        body: input.body ?? null,
        module: input.module ?? null,
        platform: input.platform ?? null,
        entity: input.entity ?? null,
        entityType: input.entityType ?? null,
        department: input.department ?? null,
        senderId: input.senderId ?? null,
        senderName: input.senderName ?? null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });

    // mirror into the append-only event stream
    await prisma.notificationEvent.create({
      data: {
        type: input.type,
        category: input.category ?? "SYSTEM",
        priority: input.priority ?? "MEDIUM",
        module: input.module ?? null,
        platform: input.platform ?? null,
        title: input.title,
        body: input.body ?? null,
        entity: input.entity ?? null,
        entityType: input.entityType ?? null,
        senderId: input.senderId ?? null,
        senderName: input.senderName ?? null,
        department: input.department ?? null,
      },
    });

    return notification;
  }

  async list(userId: string, opts: {
    category?: string;
    type?: string;
    priority?: string;
    module?: string;
    platform?: string;
    unreadOnly?: boolean;
    archivedOnly?: boolean;
    search?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const where: any = { userId, isArchived: !!opts.archivedOnly };
    if (opts.unreadOnly) where.isRead = false;
    if (opts.category && opts.category !== "ALL") where.category = opts.category;
    if (opts.type) where.type = opts.type;
    if (opts.priority) where.priority = opts.priority;
    if (opts.module) where.module = opts.module;
    if (opts.platform) where.platform = opts.platform;
    if (opts.search) where.OR = [
      { title: { contains: opts.search, mode: "insensitive" } },
      { body: { contains: opts.search, mode: "insensitive" } },
      { senderName: { contains: opts.search, mode: "insensitive" } },
      { platform: { contains: opts.search, mode: "insensitive" } },
    ];
    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: opts.skip ?? 0, take: opts.take ?? 30 }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false, isArchived: false } }),
    ]);
    return { items, total, unread };
  }

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false, isArchived: false } });
  }

  async markRead(id: string, userId: string) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) return null;
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }

  async archive(id: string, userId: string) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) return null;
    await prisma.notificationArchive.upsert({
      where: { id: `${id}_${userId}` },
      update: {},
      create: { notificationId: id, userId },
    });
    return prisma.notification.update({ where: { id }, data: { isArchived: true } });
  }

  async remove(id: string, userId: string) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) return null;
    return prisma.notification.delete({ where: { id } });
  }

  async events(opts: { module?: string; type?: string; take?: number } = {}) {
    const where: any = {};
    if (opts.module) where.module = opts.module;
    if (opts.type) where.type = opts.type;
    return prisma.notificationEvent.findMany({ where, orderBy: { createdAt: "desc" }, take: opts.take ?? 50 });
  }

  async systemEvents(take = 50) {
    return prisma.systemEvent.findMany({ orderBy: { createdAt: "desc" }, take });
  }

  async logSystemEvent(input: { source: string; action: string; status?: string; message?: string; userId?: string; refId?: string; refType?: string; meta?: any }) {
    return prisma.systemEvent.create({
      data: {
        source: input.source,
        action: input.action,
        status: input.status ?? "success",
        message: input.message ?? null,
        userId: input.userId ?? null,
        refId: input.refId ?? null,
        refType: input.refType ?? null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  }

  async getPreferences(userId: string) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async setPreferences(userId: string, data: any) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}

export const notificationService = new NotificationService();
