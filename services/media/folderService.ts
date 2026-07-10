import { prisma } from "@/lib/db";

export const folderService = {
  async list() {
    return prisma.mediaFolder.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  },

  async create(name: string, icon?: string | null, parentId?: string | null) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36).slice(-4);
    return prisma.mediaFolder.create({ data: { name, slug, icon: icon ?? "Folder", parentId: parentId ?? null } });
  },

  async remove(id: string) {
    // detach assets (move to root) then delete folder
    await prisma.mediaAsset.updateMany({ where: { folderId: id }, data: { folderId: null } });
    return prisma.mediaFolder.delete({ where: { id } });
  },

  async assetCount(folderId: string | null) {
    return prisma.mediaAsset.count({ where: { folderId, deletedAt: null, status: { not: "TRASHED" } } });
  },
};
