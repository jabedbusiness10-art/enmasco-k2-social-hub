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
  unused?: boolean;
  aiGenerated?: boolean;
  platform?: string;
  campaign?: string;
  dateFrom?: string;
  sizeMin?: number;
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

    if (q.archived) where.status = "ARCHIVED";
    if (q.unused) where.usageCount = 0;
    if (q.aiGenerated) where.aiGenerated = true;
    if (q.platform) where.platforms = { has: q.platform };
    if (q.campaign) where.campaign = { contains: q.campaign, mode: "insensitive" };
    if (q.dateFrom) where.createdAt = { gte: new Date(q.dateFrom) };
    if (q.sizeMin) where.fileSize = { gte: q.sizeMin };

    if (q.search) {
      where.OR = [
        { originalName: { contains: q.search, mode: "insensitive" } },
        { fileName: { contains: q.search, mode: "insensitive" } },
        { tags: { has: q.search } },
        { uploadedBy: { contains: q.search, mode: "insensitive" } },
        { campaign: { contains: q.search, mode: "insensitive" } },
        { platforms: { has: q.search } },
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

  async storageAnalytics() {
    const [assets, collections, tags] = await Promise.all([
      prisma.mediaAsset.findMany({ where: { deletedAt: null, status: { not: "TRASHED" } }, select: { id: true, fileSize: true, createdAt: true, originalName: true, fileType: true, url: true } }),
      prisma.mediaCollection.count(),
      prisma.mediaTag.count(),
    ]);
    const byMonth: Record<string, { count: number; bytes: number }> = {};
    for (const a of assets) {
      const key = new Date(a.createdAt).toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { count: 0, bytes: 0 };
      byMonth[key].count += 1;
      byMonth[key].bytes += a.fileSize;
    }
    const monthly = Object.entries(byMonth).sort((x, y) => x[0].localeCompare(y[0])).map(([month, v]) => ({ month, ...v }));
    const largest = [...assets].sort((a, b) => b.fileSize - a.fileSize).slice(0, 5);
    const usedBytes = assets.reduce((s, a) => s + a.fileSize, 0);
    return { total: assets.length, collections, tags, usedBytes, monthly, largest };
  },

  async get(id: string) {
    return prisma.mediaAsset.findUnique({ where: { id } });
  },

  async activity(limit = 20) {
    return prisma.mediaActivity.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  },

  async patch(id: string, data: any, actor: { userId: string; userName: string }) {
    const current = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!current) return null;
    const next = await prisma.mediaAsset.update({ where: { id }, data });

    // sync inline tags -> normalized MediaAssetTag
    if (Array.isArray(data.tags)) {
      const existing = await prisma.mediaAssetTag.findMany({ where: { assetId: id } });
      const keep = existing.filter((t: any) => data.tags.includes(t.tagId ? t.tagId : ""));
      // create tag rows for any tag name present
      for (const name of data.tags) {
        const tag = await prisma.mediaTag.upsert({ where: { name }, update: {}, create: { name } });
        await prisma.mediaAssetTag.upsert({
          where: { assetId_tagId: { assetId: id, tagId: tag.id } },
          update: {},
          create: { assetId: id, tagId: tag.id },
        });
      }
      // remove tag rows not in new list
      const tagIds = (await Promise.all(data.tags.map(async (n: string) => (await prisma.mediaTag.findUnique({ where: { name: n } }))?.id))).filter(Boolean);
      await prisma.mediaAssetTag.deleteMany({ where: { assetId: id, tagId: { notIn: tagIds } } });
    }

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

  async bulk(ids: string[], action: "delete" | "archive" | "restore" | "move" | "tag" | "favorite" | "collection" | "duplicate", opts: any, actor: { userId: string; userName: string }) {
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
    } else if (action === "collection" && opts.collectionId) {
      for (const id of ids) await this.addToCollection(opts.collectionId, id);
    } else if (action === "duplicate") {
      for (const id of ids) {
        const src = await prisma.mediaAsset.findUnique({ where: { id } });
        if (src) {
          await prisma.mediaAsset.create({
            data: {
              fileName: src.fileName, originalName: `${src.originalName} (copy)`, fileType: src.fileType,
              mimeType: src.mimeType, fileSize: src.fileSize, cloudinaryId: src.cloudinaryId, url: src.url,
              width: src.width, height: src.height, duration: src.duration, extension: src.extension,
              category: src.category, tags: src.tags, description: src.description, uploadedBy: src.uploadedBy,
              uploadedById: src.uploadedById, folderId: src.folderId, platforms: src.platforms, campaign: src.campaign,
              aiGenerated: src.aiGenerated,
            },
          });
        }
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

  // ---- TASK-56: full Collections / Tags / Archive ----
  async patchCollection(id: string, data: { name?: string; description?: string; parentId?: string | null; isPinned?: boolean }) {
    return prisma.mediaCollection.update({ where: { id }, data });
  },

  async deleteCollection(id: string) {
    return prisma.mediaCollection.delete({ where: { id } });
  },

  async removeFromCollection(collectionId: string, assetId: string) {
    return prisma.collectionItem.deleteMany({ where: { collectionId, assetId } });
  },

  async collectionAssets(collectionId: string) {
    const items = await prisma.collectionItem.findMany({
      where: { collectionId },
      include: { asset: true },
      orderBy: { order: "asc" },
    });
    return items.map((i: any) => i.asset);
  },

  async patchTag(id: string, data: { name?: string; color?: string }) {
    return prisma.mediaTag.update({ where: { id }, data });
  },

  async deleteTag(id: string) {
    return prisma.mediaTag.delete({ where: { id } });
  },

  async mergeTag(fromId: string, toId: string) {
    const fromTag = await prisma.mediaTag.findUnique({ where: { id: fromId } });
    const toTag = await prisma.mediaTag.findUnique({ where: { id: toId } });
    if (!fromTag || !toTag) throw new Error("tag not found");
    const fromName = fromTag.name;
    const toName = toTag.name;
    // move all assetTags from -> to
    const from = await prisma.mediaAssetTag.findMany({ where: { tagId: fromId } });
    for (const t of from) {
      await prisma.mediaAssetTag.upsert({
        where: { assetId_tagId: { assetId: t.assetId, tagId: toId } },
        update: {},
        create: { assetId: t.assetId, tagId: toId },
      });
    }
    // also merge inline tags on MediaAsset
    const assets = await prisma.mediaAsset.findMany({ where: { tags: { has: fromName } } });
    for (const a of assets) {
      const next = Array.from(new Set([...a.tags.filter((x: string) => x !== fromName), toName]));
      await prisma.mediaAsset.update({ where: { id: a.id }, data: { tags: next } });
    }
    await prisma.mediaTag.delete({ where: { id: fromId } });
    return { mergedInto: toId };
  },

  async archiveAsset(id: string, archivedBy: string, reason?: string) {
    await prisma.mediaArchive.create({ data: { assetId: id, archivedBy, reason: reason ?? null } });
    return prisma.mediaAsset.update({ where: { id }, data: { status: "ARCHIVED", archivedAt: new Date() } });
  },

  async restoreAsset(id: string) {
    await prisma.mediaArchive.updateMany({ where: { assetId: id, restoredAt: null }, data: { restoredAt: new Date() } });
    return prisma.mediaAsset.update({ where: { id }, data: { status: "ACTIVE", archivedAt: null } });
  },

  async tagAsset(assetId: string, tagId: string) {
    return prisma.mediaAssetTag.upsert({
      where: { assetId_tagId: { assetId, tagId } },
      update: {},
      create: { assetId, tagId },
    });
  },

  async untagAsset(assetId: string, tagId: string) {
    return prisma.mediaAssetTag.deleteMany({ where: { assetId, tagId } });
  },
};
