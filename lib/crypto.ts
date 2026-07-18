import crypto from "crypto";

// AES-256-GCM encryption for sensitive tokens at rest.
// Key is derived from TOKEN_ENCRYPTION_KEY (or a dev fallback — DO NOT use in prod).
const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Token encryption key is required in production");
    }
    // Development-only fallback so a local checkout can boot without live credentials.
    return crypto.createHash("sha256").update("enmasco-dev-token-key-change-me").digest();
  }
  // Accept either a 64-char hex (32 bytes) or a raw passphrase.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plain: string): string {
  if (plain === "" || plain == null) return plain;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: base64(iv).base64(tag).base64(ciphertext)
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    enc.toString("base64"),
  ].join(".");
}

export function decrypt(payload: string): string {
  if (!payload || payload.indexOf(".") === -1) return payload;
  const [ivB64, tagB64, dataB64] = payload.split(".");
  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
