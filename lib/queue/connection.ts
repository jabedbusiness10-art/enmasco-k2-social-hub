import IORedis from "ioredis";

/**
 * TASK-57 — Redis connection layer.
 *
 * Single shared IORedis instance for BullMQ (BullMQ requires a non-blocking
 * Redis connection, so we set `maxRetriesPerRequest: null`).
 *
 * When REDIS_URL is absent the connection is NOT created — the engine degrades
 * gracefully to the DB-backed queue (see services/publishing/queue.ts), so the
 * app never crashes without Redis.
 */

export function redisUrl(): string | null {
  return process.env.REDIS_URL || process.env.REDIS_HOST
    ? process.env.REDIS_URL ||
        `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : null;
}

export const REDIS_READY = Boolean(redisUrl());

let _connection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (_connection) return _connection;
  const url = redisUrl();
  if (!url) throw new Error("REDIS_URL is not configured");
  _connection = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    // Secure transport when a rediss:// (TLS) URL is provided.
    tls: url.startsWith("rediss://") ? {} : undefined,
  });

  // Surface connection-level errors without crashing the process.
  _connection.on("error", (err) => {
    // BullMQ listens to its own connection; this is just for observability.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[queue:redis] connection error:", err.message);
    }
  });

  return _connection;
}

/** Returns true if a Redis connection can be established. */
export async function pingRedis(): Promise<boolean> {
  const url = redisUrl();
  if (!url) return false;
  const probe = new IORedis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    connectTimeout: 2000,
  });
  try {
    await probe.connect();
    const pong = await probe.ping();
    return pong === "PONG";
  } catch {
    return false;
  } finally {
    probe.disconnect();
  }
}
