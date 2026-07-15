/**
 * TASK-60 — External service monitoring.
 *
 * Reports the OPERATIONAL status of every third-party integration using the
 * SAME signals the app already relies on (env config + real DB sync rows).
 * We do NOT make live outbound calls on every poll (that would rate-limit and
 * slow the dashboard); instead we surface config presence + last successful sync
 * read from SocialAccount.lastSyncAt where the row exists.
 *
 * No secrets / keys are ever returned — only booleans + timestamps.
 */
import { prisma } from "@/lib/db";

export interface ExternalService {
  key: string;
  label: string;
  configured: boolean;
  connected: boolean;   // has a synced account row
  lastSync: string | null;
  note: string;
}

export async function getExternalServices(): Promise<ExternalService[]> {
  const accounts = await prisma.companySocialAccount
    .findMany({ select: { platform: true, status: true, lastSyncAt: true } })
    .catch(() => []);

  const byPlatform = (p: string) => accounts.filter((a: any) => a.platform === p);
  const lastSync = (p: string): string | null => {
    const rows = byPlatform(p).map((a: any) => a.lastSyncAt?.getTime() ?? 0);
    return rows.length ? new Date(Math.max(...rows)).toISOString() : null;
  };
  const connected = (p: string) => byPlatform(p).some((a: any) => a.status === "CONNECTED");

  const def = (key: string, label: string, env: boolean, platform: string | null): ExternalService => ({
    key,
    label,
    configured: env,
    connected: platform ? connected(platform) : false,
    lastSync: platform ? lastSync(platform) : null,
    note: !env ? "Not configured" : platform && !connected(platform) ? "Configured, never synced" : "Operational",
  });

  return [
    def("meta", "Meta Graph API", Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET), "facebook"),
    def("instagram", "Instagram Graph API", Boolean(process.env.META_APP_ID), "instagram"),
    def("linkedin", "LinkedIn API", Boolean(process.env.LINKEDIN_CLIENT_ID), "linkedin"),
    def("google_oauth", "Google OAuth", Boolean(process.env.GOOGLE_CLIENT_ID), "youtube"),
    def("ga4", "Google Analytics", Boolean(process.env.GOOGLE_ANALYTICS_ID), null),
    def("openai", "OpenAI / OpenRouter", Boolean(process.env.OPENROUTER_API_KEY), null),
    def("smtp", "SMTP", Boolean(process.env.SMTP_HOST), null),
    def("webhook", "Webhook Services", Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN), null),
  ];
}
