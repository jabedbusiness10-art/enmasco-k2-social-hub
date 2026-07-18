export type IntegrationProvider = "LINKEDIN" | "WEBSITE";

export type IntegrationErrorCode =
  | "EXPIRED_TOKEN"
  | "REVOKED_ACCESS"
  | "PERMISSION_MISSING"
  | "ORGANIZATION_ACCESS_DENIED"
  | "RATE_LIMITED"
  | "MEDIA_UPLOAD_FAILED"
  | "CONTENT_REJECTED"
  | "INVALID_URL"
  | "SSRF_BLOCKED"
  | "AUTH_FAILED"
  | "ENDPOINT_UNAVAILABLE"
  | "UNSUPPORTED_PROVIDER"
  | "READ_ONLY_PROVIDER"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "DUPLICATE_CONTENT"
  | "NETWORK_ERROR"
  | "API_ERROR";

export class IntegrationError extends Error {
  constructor(
    public readonly provider: IntegrationProvider,
    public readonly code: IntegrationErrorCode,
    message: string,
    public readonly status: number,
    public readonly recoverable: boolean,
    public readonly recovery: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

function safeProviderMessage(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  // Provider messages can contain request bodies or tokens. Keep the useful
  // prefix, strip common credential patterns, and cap the response size.
  return value
    .replace(/(access[_ -]?token|refresh[_ -]?token|api[_ -]?key|secret)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .slice(0, 280);
}

export function classifyLinkedInError(status: number, payload: any, retryAfter?: string | null): IntegrationError {
  const raw = safeProviderMessage(payload?.message ?? payload?.error_description ?? payload?.error, "LinkedIn API request failed");
  const lower = raw.toLowerCase();
  if (status === 401 && /expired|token/.test(lower)) {
    return new IntegrationError("LINKEDIN", "EXPIRED_TOKEN", raw, 401, true, "Reconnect the LinkedIn organization.");
  }
  if (status === 401) {
    return new IntegrationError("LINKEDIN", "REVOKED_ACCESS", raw, 401, true, "Reconnect the LinkedIn organization.");
  }
  if (status === 403 && /organization|company|role|admin/.test(lower)) {
    return new IntegrationError("LINKEDIN", "ORGANIZATION_ACCESS_DENIED", raw, 403, true, "Reconnect with a LinkedIn member who administers this organization.");
  }
  if (status === 403) {
    return new IntegrationError("LINKEDIN", "PERMISSION_MISSING", raw, 403, true, "Approve the required LinkedIn product and reconnect to grant the missing scope.");
  }
  if (status === 429) {
    const seconds = Math.min(300, Math.max(1, Number(retryAfter) || 30));
    return new IntegrationError("LINKEDIN", "RATE_LIMITED", raw, 429, true, `Retry after ${seconds} seconds.`, seconds);
  }
  if (status === 400 || status === 422) {
    return new IntegrationError("LINKEDIN", "CONTENT_REJECTED", raw, 422, false, "Review the content and media against LinkedIn publishing requirements.");
  }
  if (status >= 500) {
    return new IntegrationError("LINKEDIN", "API_ERROR", raw, 503, true, "Retry after LinkedIn service availability recovers.");
  }
  return new IntegrationError("LINKEDIN", "API_ERROR", raw, Math.max(400, status || 500), false, "Review the LinkedIn integration configuration.");
}

export function asPublicIntegrationError(error: unknown, provider: IntegrationProvider) {
  const value = error instanceof IntegrationError
    ? error
    : new IntegrationError(provider, "API_ERROR", "Integration operation failed", 500, false, "Review server logs and provider configuration.");
  return {
    error: {
      provider: value.provider,
      code: value.code,
      message: value.message,
      recoverable: value.recoverable,
      recovery: value.recovery,
      ...(value.retryAfterSeconds ? { retryAfterSeconds: value.retryAfterSeconds } : {}),
    },
    status: value.status,
  };
}
