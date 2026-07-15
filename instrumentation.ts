/**
 * TASK-59 — Next.js Instrumentation.
 *
 * Runs ONCE per server process on boot (Node runtime). Used to:
 *   - validate environment variables (logs, never throws)
 *   - record boot of the web process
 *
 * This file must stay side-effect only and import nothing that touches
 * the request path at module scope.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logEnvReport } = await import("@/lib/env/validate");
    const { log } = await import("@/lib/logger");
    logEnvReport();
    log("app").info("web process booted", {
      node: process.version,
      env: process.env.NODE_ENV || "development",
      time: new Date().toISOString(),
    });
  }
}
