import { prisma } from "@/lib/db";

type Where = any;

export interface ListQuery {
  search?: string;
  type?: string; // IMAGE | VIDEO | DOCUMENT | LOGO | BRAND_ASSET
  folderId?: string | null; // null = all; "__favorites"/"__trash"/"__recent" virtual
  category?: string;
  tags?: string[];
  uploadedBy?: string;
  favorite?: boolean;
  archived?: boolean;
  trashed?: boolean;
  collectionId?: string;
  sort?: "newest" | "oldest" | "name" | "largest" | "mostUsed";
  page?: number;
  pageSize?: number;
}

export const mediaService = {
  async list(q: ListQuery) {
    const where: Where = { deletedAt: null };

    if (q.favorite) where.favorited = true;
    if (q.archived) where.status = "ARCHIVED";
    if (q.trashed) {
      where.status = "TRASHED";
    } else if (!q.favorite && !q.archived) {
      where.status = { not: "TRASHED" };
    }

    if (q.collectionId) {
      const items = await prisma.collectionItem.findMany({ where: { collectionId: q.collectionId }, select: { assetId: true } });
      where.id = { in: items.map((x) => x.assetId) };
    }

    if (q.type) where.fileType = q.type;

    if (q.folderId && q.folderId === "__favorites") where.favorited = true;
    else if (q.folderId && q.folderId === "__trash") where.status = "TRASHED";
    else if (q.folderId && q.folderId === "__recent") { /* recent = all, sorted newest */ }
    else if (q.folderId) where.folderId = q.folderId;

    if (q.category) where.category = q.category;
    if (q.uploadedBy) where.uploadedById = q.uploadedBy;
    if (q.tags && q.tags.length) where.tags = { hasSome: q.tags };

    if (q.search) {
      where.OR = [
        { originalName: { contains: q.search, mode: "insensitive" } },
        { fileName: { contains: q.search, mode: "insensitive" } },
        { tags: { has: q.search } },
        { uploadedBy: { contains: q.search, mode: "insensitive" } },
        { folder: { name: { contains: q.search, mode: "insensitive" } } },
      ];
    }

    const orderBy =
      q.sort === "oldest" ? { createdAt: "asc" as const } :
      q.sort === "name" ? { originalName: "asc" as const } :
      q.sort === "largest" ? { fileSize: "desc" as const } :
      q.sort === "mostUsed" ? { usageCount: "desc" as const } :
      { createdAt: "desc" as const };

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({ where, orderBy, take: q.pageSize ?? 200, skip: ((q.page ?? 1) - 1) * (q.pageSize ?? 200) }),
      prisma.mediaAsset.count({ where }),
    ]);
    return { assets, total };
  },

  async stats() {
    const [all, images, videos, docs, favorites, archived, trashed] = await Promise.all([
      prisma.mediaAsset.findMany({ where: { deletedAt: null, status: { not: "TRASHED" } }, select: { fileSize: true, createdAt: true } }),
      prisma.mediaAsset.count({ where: { deletedAt: null, status: { not: "TRASHED" }, fileType: "IMAGE" } }),
      prisma.mediaAsset.count({ where: { deletedAt: null, status: { not: "TRASHED" }, fileType: "VIDEO" } }),
      prisma.mediaAsset.count({ where: { deletedAt: null, status: { not: "TRASHED" }, fileType: "DOCUMENT" } }),
      prisma.mediaAsset.count({ where: { deletedAt: null, status: { not: "TRASHED" }, favorited: true } }),
      prisma.mediaAsset.count({ where: { deletedAt: null, status: "ARCHIVED" } }),
      prisma.mediaAsset.count({ where: { deletedAt: null, status: "TRASHED" } }),
    ]);
    const usedBytes = all.reduce((s: number, a: any) => s + a.fileSize, 0);
    const recent = all.filter((a: any) => Date.now() - new Date(a.createdAt).getTime() < 7 * 864e5).length;
    return {
      total: all.length,
      images,
      videos,
      documents: docs,
      storageBytes: usedBytes,
      favorites,
      archived,
      trashed,
      recentUploads: recent,
    };
  },

  async activity(limit = 20) {
    return prisma.mediaActivity.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  },

  async get(id: string) {
    return prisma.mediaAsset.findUnique({ where: { id } });
  },

  async patch(id: string, data: any, actor: { userId: string; userName: string }) {
    const current = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!current) return null;
    const next = await prisma.mediaAsset.update({ where: { id }, data });

    // activity log for meaningful changes
    if (data.favorited !== undefined) this.log(id, actor, "FAVORITE", data.favorited ? "added" : "removed");
    if (data.originalName && data.originalName !== current.originalName) this.log(id, actor, "RENAME", data.originalName);
    if (data.folderId !== undefined && data.folderId !== current.folderId) this.log(id, actor, "MOVE", data.folderId ?? "root");
    if (data.status === "ARCHIVED" && current.status !== "ARCHIVED") this.log(id, actor, "ARCHIVE");
    if (data.status === "ACTIVE" && current.status === "ARCHIVED") this.log(id, actor, "RESTORE");
    if (data.status === "TRASHED" && current.status !== "TRASHED") this.log(id, actor, "DELETE");
    return next;
  },

  async log(assetId: string, actor: { userId: string; userName: string }, action: string, meta?: string) {
    return prisma.mediaActivity.create({ data: { assetId, userId: actor.userId, userName: actor.userName, action, meta: meta ?? null } });
  },

  async bulk(ids: string[], action: "delete" | "archive" | "restore" | "move" | "tag" | "favorite", opts: any, actor: { userId: string; userName: string }) {
    if (action === "delete") {
      await prisma.mediaAsset.updateMany({ where: { id: { in: ids } }, data: { status: "TRASHED", deletedAt: new Date() } });
    } else if (action === "archive") {
      await prisma.mediaAsset.updateMany({ where: { id: { in: ids } }, data: { status: "ARCHIVED", archivedAt: new Date() } });
    } else if (action === "restore") {
      await prisma.mediaAsset.updateMany({ where: { id: { in: ids } }, data: { status: "ACTIVE", archivedAt: null, deletedAt: null } });
    } else if (action === "move") {
      await prisma.mediaAsset.updateMany({ where: { id: { in: ids } }, data: { folderId: opts.folderId ?? null } });
    } else if (action === "favorite") {
      await prisma.mediaAsset.updateMany({ where: { id: { in: ids } }, data: { favorited: true } });
    } else if (action === "tag" && opts.tags?.length) {
      for (const id of ids) {
        const a = await prisma.mediaAsset.findUnique({ where: { id }, select: { tags: true } });
        if (a) await prisma.mediaAsset.update({ where: { id }, data: { tags: Array.from(new Set([...a.tags, ...opts.tags])) } });
      }
    }
    return { ok: true, count: ids.length };
  },

  async remove(id: string) {
    // hard delete (used from trash)
    const a = await prisma.mediaAsset.findUnique({ where: { id } });
    if (a) {
      const { storageService } = await import("./storageService");
      await storageService.remove(a.cloudinaryId);
    }
    return prisma.mediaAsset.delete({ where: { id } });
  },

  async incrementUsage(id: string) {
    return prisma.mediaAsset.update({ where: { id }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
  },

  // ---- TASK-55: Tags & Collections ----
  async listTags() {
    return prisma.mediaTag.findMany({ orderBy: { name: "asc" } });
  },

  async createTag(name: string, color?: string) {
    return prisma.mediaTag.upsert({
      where: { name },
      update: { color: color ?? null },
      create: { name, color: color ?? null },
    });
  },

  async listCollections(parentId?: string | null) {
    return prisma.mediaCollection.findMany({
      where: parentId !== undefined ? { parentId } : {},
      orderBy: [{ isPinned: "desc" }, { name: "asc" }],
      include: { _count: { select: { items: true, children: true } } },
    });
  },

  async createCollection(name: string, createdById: string, parentId?: string | null, description?: string) {
    return prisma.mediaCollection.create({
      data: { name, createdById, parentId: parentId ?? null, description: description ?? null },
    });
  },

  async addToCollection(collectionId: string, assetId: string) {
    const existing = await prisma.collectionItem.findFirst({ where: { collectionId, assetId } });
    if (existing) return existing;
    return prisma.collectionItem.create({ data: { collectionId, assetId } });
  },

  async listFavorites(userId: string) {
    return prisma.mediaFavorite.findMany({ where: { userId }, include: { asset: true } });
  },

  async toggleFavorite(assetId: string, userId: string) {
    const existing = await prisma.mediaFavorite.findFirst({ where: { assetId, userId } });
    if (existing) {
      await prisma.mediaFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }
    await prisma.mediaFavorite.create({ data: { assetId, userId } });
    return { favorited: true };
  },

  async history(assetId: string) {
    return prisma.mediaHistory.findMany({ where: { assetId }, orderBy: { createdAt: "desc" }, take: 30 });
  },

  async relationships(assetId: string) {
    return prisma.mediaRelationship.findMany({ where: { assetId }, orderBy: { createdAt: "desc" } });
  },

  async logHistory(assetId: string, actorId: string, action: string, field?: string, fromValue?: string, toValue?: string) {
    return prisma.mediaHistory.create({ data: { assetId, actorId, action, field: field ?? null, fromValue: fromValue ?? null, toValue: toValue ?? null } });
  },
};
