/**
 * TASK-59.5 — Enterprise structured logger.
 *
 * Lightweight, dependency-free, level-gated logger. Writes to stdout/stderr
 * (captured by Docker/PM2/systemd). Module-tagged so logs can be filtered:
 *
 *   [app]   [api]   [queue]   [auth]   [publishing]   [ai]   [error]
 *
 * Set LOG_LEVEL=debug|info|warn|error (default info in prod, debug in dev).
 */

type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const current = (): Level => {
  const v = (process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")).toLowerCase();
  return (ORDER[v as Level] !== undefined ? v : "info") as Level;
};

function emit(level: Level, mod: string, args: unknown[]) {
  if (ORDER[level] < ORDER[current()]) return;
  const ts = new Date().toISOString();
  const prefix = `${ts} [${level.toUpperCase().padEnd(5)}] [${mod}]`;
  const out = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  out(prefix, ...args);
}

export const logger = {
  debug: (m: string, ...a: unknown[]) => emit("debug", m, a),
  info: (m: string, ...a: unknown[]) => emit("info", m, a),
  warn: (m: string, ...a: unknown[]) => emit("warn", m, a),
  error: (m: string, ...a: unknown[]) => emit("error", m, a),
};

export function log(mod: string) {
  return {
    debug: (...a: unknown[]) => emit("debug", mod, a),
    info: (...a: unknown[]) => emit("info", mod, a),
    warn: (...a: unknown[]) => emit("warn", mod, a),
    error: (...a: unknown[]) => emit("error", mod, a),
  };
}
