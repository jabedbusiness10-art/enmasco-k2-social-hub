// Storage abstraction. Currently persists to the local filesystem under
// public/uploads (the same fallback used across TASK-34). The interface is
// provider-agnostic so Cloudinary / S3 / R2 can be dropped in later by
// implementing `upload` / `delete` against the provider SDK without touching
// the rest of the media stack.

import { promises as fs } from "fs";
import * as path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export interface StoredObject {
  url: string; // public URL
  key: string; // provider key / storage id
}

export const storageService = {
  async ensureDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  },

  async upload(buffer: Buffer, fileName: string): Promise<StoredObject> {
    await this.ensureDir();
    const safe = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const full = path.join(UPLOAD_DIR, safe);
    await fs.writeFile(full, buffer);
    return { url: `/uploads/${safe}`, key: safe };
  },

  async remove(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(key)));
    } catch {
      /* already gone */
    }
  },
};
