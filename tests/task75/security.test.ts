import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { isPrivateAddress, parseWebsiteUrl } from "../../services/website/security";
import { verifyWebhookSignature } from "../../services/website/connection";

test("website URL validation blocks local and private destinations", () => {
  for (const value of ["https://localhost/test", "https://127.0.0.1/test", "https://10.1.2.3/test", "https://[::1]/test", "file:///etc/passwd"]) {
    assert.throws(() => parseWebsiteUrl(value));
  }
  assert.equal(parseWebsiteUrl("https://example.com/articles").hostname, "example.com");
});

test("private IP classifier covers reserved IPv4 and IPv6 ranges", () => {
  assert.equal(isPrivateAddress("192.168.20.4"), true);
  assert.equal(isPrivateAddress("172.20.0.1"), true);
  assert.equal(isPrivateAddress("169.254.10.1"), true);
  assert.equal(isPrivateAddress("fd00::1"), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
});

test("website webhook HMAC requires a current timestamp and rejects tampering", () => {
  const secret = "task-75-test-secret-that-is-long-enough";
  const timestamp = String(Date.now());
  const body = JSON.stringify({ event: "connection.test" });
  const signature = `sha256=${crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
  assert.equal(verifyWebhookSignature(body, signature, secret, timestamp), true);
  assert.equal(verifyWebhookSignature(`${body}x`, signature, secret, timestamp), false);
  assert.equal(verifyWebhookSignature(body, signature, secret, String(Date.now() - 10 * 60_000)), false);
});
