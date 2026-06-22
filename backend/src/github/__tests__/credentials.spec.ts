import expect from "expect";
import { createHmac } from "crypto";
import {
  buildWebhookUrl,
  generateWebhookCredentials,
  verifySignature,
} from "../credentials";

// Produce the header GitHub would send for a given secret + body, so we test
// verifySignature against a real HMAC rather than a mock.
function sign(secret: string, body: Buffer): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

describe("generateWebhookCredentials", () => {
  it("returns a non-empty token and secret", () => {
    const { webhookToken, webhookSecret } = generateWebhookCredentials();
    expect(webhookToken.length).toBeGreaterThan(0);
    expect(webhookSecret.length).toBeGreaterThan(0);
  });

  it("produces fresh, unguessable values each call", () => {
    const a = generateWebhookCredentials();
    const b = generateWebhookCredentials();
    expect(a.webhookToken).not.toBe(b.webhookToken);
    expect(a.webhookSecret).not.toBe(b.webhookSecret);
  });
});

describe("buildWebhookUrl", () => {
  it("embeds the token under the /github/webhook path", () => {
    const url = buildWebhookUrl("tok_abc123");
    expect(url).toContain("/github/webhook/tok_abc123");
  });
});

describe("verifySignature", () => {
  const secret = "a-webhook-secret";
  const body = Buffer.from(JSON.stringify({ action: "opened" }), "utf8");

  it("accepts a correctly signed body", () => {
    expect(verifySignature(body, secret, sign(secret, body))).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(verifySignature(body, secret, sign("wrong-secret", body))).toBe(false);
  });

  it("rejects a tampered body", () => {
    const header = sign(secret, body);
    const tampered = Buffer.from(JSON.stringify({ action: "closed" }), "utf8");
    expect(verifySignature(tampered, secret, header)).toBe(false);
  });

  it("rejects a missing or malformed header", () => {
    expect(verifySignature(body, secret, undefined)).toBe(false);
    expect(verifySignature(body, secret, "not-a-sha256-header")).toBe(false);
  });
});
