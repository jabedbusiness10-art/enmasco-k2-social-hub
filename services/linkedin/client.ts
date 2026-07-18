import { classifyLinkedInError, IntegrationError } from "@/services/integrations/errors";

const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
export const LINKEDIN_API_VERSION = process.env.LINKEDIN_API_VERSION?.trim() || "202606";

export function linkedinHeaders(accessToken: string, json = true): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Linkedin-Version": LINKEDIN_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

export async function linkedinRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
  options: { retries?: number; timeoutMs?: number } = {},
): Promise<{ data: T; headers: Headers }> {
  const retries = Math.min(2, Math.max(0, options.retries ?? 1));
  const timeoutMs = Math.min(30_000, Math.max(2_000, options.timeoutMs ?? 12_000));
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${LINKEDIN_API_BASE}${path}`, {
        ...init,
        headers: { ...linkedinHeaders(accessToken), ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!response.ok) {
        const classified = classifyLinkedInError(response.status, data, response.headers.get("retry-after"));
        if (attempt < retries && (classified.code === "RATE_LIMITED" || response.status >= 500)) {
          const delay = classified.retryAfterSeconds ? classified.retryAfterSeconds * 1000 : 400 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 2_000)));
          continue;
        }
        throw classified;
      }
      return { data: data as T, headers: response.headers };
    } catch (error) {
      lastError = error;
      if (error instanceof IntegrationError) throw error;
      if (attempt < retries) continue;
    }
  }

  throw new IntegrationError(
    "LINKEDIN",
    "NETWORK_ERROR",
    lastError instanceof Error && /timeout/i.test(lastError.message) ? "LinkedIn request timed out" : "LinkedIn network request failed",
    503,
    true,
    "Retry when network connectivity is restored.",
  );
}

export function organizationUrn(id: string): string {
  return id.startsWith("urn:li:organization:") ? id : `urn:li:organization:${id}`;
}
