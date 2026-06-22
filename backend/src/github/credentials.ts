// Webhook credential helpers for GitHub Repository links — the transport-free
// core shared by the link resolvers (which mint credentials) and the webhook
// route (which verifies deliveries). Knows nothing about GraphQL or Express.
//
// Public API:
//   - generateWebhookCredentials(): mint a fresh opaque URL token + HMAC secret
//   - buildWebhookUrl(token): the public URL an admin pastes into GitHub
//   - verifySignature(rawBody, secret, header): validate a delivery's HMAC
//
// See ADR 0011.

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { config } from "../config";

export interface WebhookCredentials {
  // Opaque, unguessable token carried in the webhook URL path. base64url so it
  // is URL-safe without escaping.
  webhookToken: string;
  // The shared secret GitHub HMACs each delivery with. Stored encrypted at rest.
  webhookSecret: string;
}

export function generateWebhookCredentials(): WebhookCredentials {
  return {
    webhookToken: randomBytes(24).toString("base64url"),
    webhookSecret: randomBytes(32).toString("base64url"),
  };
}

// The URL is the API's public origin + path prefix + the link's token, e.g.
// https://api.orcha.run/github/webhook/<token>. apiPathPrefix is "" by default
// and "/api" only where the proxy preserves the prefix (see config).
export function buildWebhookUrl(webhookToken: string): string {
  return `${config.apiUri}${config.apiPathPrefix}/github/webhook/${webhookToken}`;
}

// GitHub signs each delivery as `x-hub-signature-256: sha256=<hex>` over the raw
// request bytes. We recompute the HMAC and compare in constant time. Any missing
// or malformed header, wrong secret, or tampered body fails closed (returns
// false) rather than throwing — the caller maps that to a 401.
export function verifySignature(
  rawBody: Buffer,
  secret: string,
  signatureHeader: string | undefined
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(signatureHeader.slice("sha256=".length), "hex");

  // timingSafeEqual throws on length mismatch, so guard first — a wrong-length
  // signature is simply invalid.
  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(received, expected);
}
