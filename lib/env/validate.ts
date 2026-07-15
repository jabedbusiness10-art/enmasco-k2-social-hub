/**
 * TASK-59.1 — Environment validation.
 *
 * Validates required environment variables at startup. Critical vars (DB,
 * auth) are REQUIRED — missing them logs a hard error. Optional integration
 * vars (Meta, LinkedIn, Google, SMTP, Redis, …) log a WARNING and let the
 * app boot in a degraded mode (per TASK-51: never fake, just report).
 *
 * It NEVER throws — the goal is visibility, not a silent crash.
 */

export type Severity = "critical" | "warn" | "info";

export interface EnvCheck {
  key: string;
  required: boolean;
  present: boolean;
  severity: Severity;
  note?: string;
}

export interface EnvReport {
  ok: boolean; // false only if a CRITICAL var is missing
  criticalMissing: string[];
  warnings: string[];
  checks: EnvCheck[];
}

// Map the TASK-59 spec names → the ACTUAL keys used in this project.
const SCHEMA: { key: string; required: boolean; note?: string }[] = [
  { key: "DATABASE_URL", required: true, note: "PostgreSQL connection string (Prisma 7 driver adapter)." },
  { key: "NEXTAUTH_SECRET", required: true, note: "Session encryption secret (>=32 chars)." },
  { key: "NEXTAUTH_URL", required: true, note: "Public base URL, e.g. https://app.k2kai.com." },
  { key: "AI_PROVIDER", required: false, note: "AI provider id (default openrouter)." },
  { key: "OPENROUTER_API_KEY", required: false, note: "OpenRouter key for K2Kai AI (TASK-52)." },
  { key: "META_APP_ID", required: false, note: "Meta / Facebook Graph app id." },
  { key: "META_APP_SECRET", required: false, note: "Meta app secret." },
  { key: "META_WEBHOOK_VERIFY_TOKEN", required: false, note: "Meta webhook verification token." },
  { key: "LINKEDIN_CLIENT_ID", required: false, note: "LinkedIn OAuth client id." },
  { key: "LINKEDIN_CLIENT_SECRET", required: false, note: "LinkedIn OAuth secret." },
  { key: "GOOGLE_CLIENT_ID", required: false, note: "Google / YouTube OAuth client id." },
  { key: "GOOGLE_CLIENT_SECRET", required: false, note: "Google / YouTube OAuth secret." },
  { key: "GOOGLE_ANALYTICS_ID", required: false, note: "GA4 measurement id (audience analytics)." },
  { key: "REDIS_URL", required: false, note: "BullMQ + Redis queue (TASK-57). Absent → DB fallback." },
  { key: "QUEUE_SECRET", required: false, note: "Shared secret for internal queue control endpoints." },
  { key: "ENCRYPTION_KEY", required: false, note: "32-byte key for token encryption at rest." },
  { key: "SMTP_HOST", required: false, note: "Transactional email (notifications / reports)." },
  { key: "SMTP_USER", required: false, note: "SMTP username." },
  { key: "SMTP_PASSWORD", required: false, note: "SMTP password." },
  { key: "CLOUDINARY_URL", required: false, note: "Media storage (TASK-54/55). Absent → local storage." },
];

export function validateEnv(): EnvReport {
  const checks: EnvCheck[] = SCHEMA.map((s) => {
    const present = Boolean(process.env[s.key] && String(process.env[s.key]).trim().length > 0);
    return {
      key: s.key,
      required: s.required,
      present,
      severity: s.required && !present ? "critical" : !present ? "warn" : "info",
      note: s.note,
    };
  });

  const criticalMissing = checks.filter((c) => c.required && !c.present).map((c) => c.key);
  const warnings = checks.filter((c) => !c.required && !c.present).map((c) => c.key);

  return {
    ok: criticalMissing.length === 0,
    criticalMissing,
    warnings,
    checks,
  };
}

/** Pretty log used by instrumentation on boot. Never throws. */
export function logEnvReport(): void {
  const r = validateEnv();
  const line = "──────────────────────────────────────────────";
  // eslint-disable-next-line no-console
  console.log(`\n${line}\n  K2KAI ENVIRONMENT VALIDATION\n${line}`);
  for (const c of r.checks) {
    const mark = c.present ? "✓" : c.required ? "✗" : "·";
    const tag = c.required ? "REQUIRED" : "optional";
    // eslint-disable-next-line no-console
    console.log(`  ${mark} ${c.key.padEnd(28)} (${tag})${c.present ? "" : " — MISSING"}`);
  }
  if (!r.ok) {
    // eslint-disable-next-line no-console
    console.error(`\n  ✗ CRITICAL: missing required vars: ${r.criticalMissing.join(", ")}`);
    // eslint-disable-next-line no-console
    console.error("  The app may fail to start or authenticate. See DEPLOYMENT.md.\n");
  }
  if (r.warnings.length) {
    // eslint-disable-next-line no-console
    console.warn(`  ⚠ Optional integrations disabled: ${r.warnings.join(", ")}\n`);
  }
  if (r.ok && r.warnings.length === 0) {
    // eslint-disable-next-line no-console
    console.log("  ✓ All environment variables present.\n");
  }
}
