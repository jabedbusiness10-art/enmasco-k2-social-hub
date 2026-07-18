import dns from "node:dns/promises";
import net from "node:net";
import { IntegrationError } from "@/services/integrations/errors";

const BLOCKED_HOST_SUFFIXES = [".local", ".localhost", ".internal", ".home", ".lan"];
const ALLOWED_PORTS = new Set(["", "80", "443", ...(process.env.WEBSITE_ALLOWED_PORTS ?? "").split(",").map((value) => value.trim()).filter(Boolean)]);

function isPrivateIpv4(ip: string): boolean {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return true;
  const [a, b] = octets;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase().split("%")[0];
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized)) return true;
  if (normalized.startsWith("::ffff:")) return isPrivateIpv4(normalized.slice(7));
  return false;
}

export function isPrivateAddress(address: string): boolean {
  const version = net.isIP(address);
  return version === 4 ? isPrivateIpv4(address) : version === 6 ? isPrivateIpv6(address) : true;
}

export function parseWebsiteUrl(raw: string, options: { allowHttp?: boolean } = {}): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new IntegrationError("WEBSITE", "INVALID_URL", "Website URL is invalid", 400, false, "Enter an absolute HTTPS URL.");
  }
  if (url.protocol !== "https:" && !(options.allowHttp && url.protocol === "http:")) {
    throw new IntegrationError("WEBSITE", "INVALID_URL", "Only HTTPS website URLs are allowed", 400, false, "Use an HTTPS endpoint.");
  }
  if (url.username || url.password) {
    throw new IntegrationError("WEBSITE", "INVALID_URL", "Credentials are not allowed in website URLs", 400, false, "Configure authentication separately.");
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new IntegrationError("WEBSITE", "SSRF_BLOCKED", "Website port is not permitted", 400, false, "Use port 443 or explicitly allow a required public port.");
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
  if (!hostname || hostname === "localhost" || BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new IntegrationError("WEBSITE", "SSRF_BLOCKED", "Local or internal website hosts are blocked", 400, false, "Use a publicly resolvable website host.");
  }
  if (net.isIP(hostname) && isPrivateAddress(hostname)) {
    throw new IntegrationError("WEBSITE", "SSRF_BLOCKED", "Private and reserved IP addresses are blocked", 400, false, "Use a public website address.");
  }
  url.hash = "";
  return url;
}

export async function assertPublicWebsiteUrl(raw: string, options: { allowHttp?: boolean } = {}): Promise<URL> {
  const url = parseWebsiteUrl(raw, options);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!net.isIP(hostname)) {
    let addresses: { address: string }[];
    try {
      addresses = await dns.lookup(hostname, { all: true, verbatim: true });
    } catch {
      throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", "Website hostname could not be resolved", 422, true, "Check the public DNS record.");
    }
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
      throw new IntegrationError("WEBSITE", "SSRF_BLOCKED", "Website hostname resolves to a private or reserved address", 400, false, "Use a publicly routable website endpoint.");
    }
  }
  return url;
}

export async function safeWebsiteFetch(
  rawUrl: string,
  init: RequestInit = {},
  options: { allowHttp?: boolean; timeoutMs?: number; maxRedirects?: number } = {},
): Promise<Response> {
  const timeoutMs = Math.min(30_000, Math.max(2_000, options.timeoutMs ?? 10_000));
  const maxRedirects = Math.min(5, Math.max(0, options.maxRedirects ?? 3));
  let current = await assertPublicWebsiteUrl(rawUrl, { allowHttp: options.allowHttp });
  let headers = new Headers(init.headers);

  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    let response: Response;
    try {
      response = await fetch(current, { ...init, headers, redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      throw new IntegrationError("WEBSITE", "NETWORK_ERROR", error instanceof Error && /timeout/i.test(error.message) ? "Website request timed out" : "Website request failed", 503, true, "Check endpoint availability and retry.");
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    if (redirect === maxRedirects) {
      throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", "Website redirect limit exceeded", 422, false, "Configure the final public endpoint URL.");
    }
    const location = response.headers.get("location");
    if (!location) throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", "Website returned an invalid redirect", 422, false, "Fix the endpoint redirect response.");
    const next = await assertPublicWebsiteUrl(new URL(location, current).toString(), { allowHttp: options.allowHttp });
    if (next.origin !== current.origin) {
      headers = new Headers(headers);
      headers.delete("authorization");
      headers.delete("x-api-key");
      headers.delete("cookie");
    }
    current = next;
  }
  throw new IntegrationError("WEBSITE", "ENDPOINT_UNAVAILABLE", "Website redirect failed", 422, false, "Check the endpoint URL.");
}

export async function readLimitedBody(response: Response, maxBytes = 5 * 1024 * 1024): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new IntegrationError("WEBSITE", "API_ERROR", "Website response is too large", 413, false, "Reduce the provider response size.");
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new IntegrationError("WEBSITE", "API_ERROR", "Website response is too large", 413, false, "Reduce the provider response size.");
    }
    chunks.push(value);
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

export async function readLimitedText(response: Response, maxBytes?: number): Promise<string> {
  return new TextDecoder().decode(await readLimitedBody(response, maxBytes));
}
