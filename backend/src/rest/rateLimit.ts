/**
 * Per-token rate limiting for the `/v1` REST API.
 *
 * A runaway agent loop or an abusive client should fail gracefully with a
 * `429` rather than hammer the service. This middleware counts each Personal
 * Access Token's requests in a fixed window and refuses the ones past the
 * limit, with a `Retry-After` telling the caller when to come back.
 *
 * Exports:
 *  - RateLimitStore: the counter abstraction the middleware depends on. Keeping
 *    it an interface lets the middleware be tested against an in-memory store
 *    with a controllable clock, with no live Redis.
 *  - redisRateLimitStore: the production store — a Redis fixed-window counter
 *    (INCR + EXPIRE), reusing the shared connection.
 *  - rateLimit: the Express middleware factory.
 *
 * Keyed on `req.tokenId` (set by bearerAuth), so the limit is per token, never
 * per IP or global. A request without a token id is passed through untouched —
 * the limiter only governs authenticated `/v1` traffic.
 *
 * Fail-open by design: the limiter is abuse protection, not authentication
 * (auth already gated the request). If the store is unreachable we log and let
 * the request proceed rather than let a transient Redis blip take down `/v1`.
 */

import { RequestHandler } from "express";
import type Redis from "ioredis";
import { errorEnvelope } from "./errorEnvelope";

export interface RateLimitStore {
  // Count one hit for `key` in the current window and return the running count
  // plus the seconds remaining until the window resets.
  hit(key: string): Promise<{ count: number; ttlSeconds: number }>;
}

const KEY_PREFIX = "ratelimit:v1:";

/**
 * Redis fixed-window counter. The first hit in a window sets the key's expiry;
 * subsequent hits only INCR, so the window is anchored to the first request and
 * the key self-evicts when it elapses — that is what lets the limit recover.
 */
export function redisRateLimitStore(
  client: Redis,
  windowSeconds: number,
): RateLimitStore {
  return {
    async hit(key: string) {
      const redisKey = `${KEY_PREFIX}${key}`;
      const count = await client.incr(redisKey);
      if (count === 1) {
        await client.expire(redisKey, windowSeconds);
      }
      let ttlSeconds = await client.ttl(redisKey);
      // A key with no TTL (-1) or already gone (-2) shouldn't happen right
      // after INCR+EXPIRE, but guard so Retry-After is never negative.
      if (ttlSeconds < 0) {
        ttlSeconds = windowSeconds;
      }
      return { count, ttlSeconds };
    },
  };
}

export interface RateLimitOptions {
  store: RateLimitStore;
  max: number;
  windowSeconds: number;
  // Override how a request maps to a counter key; defaults to the PAT id.
  keyOf?: (req: { tokenId?: number }) => string | undefined;
  // Injection point for logging the fail-open path (defaults to console.warn).
  log?: (message: string, error: unknown) => void;
}

const defaultKeyOf = (req: { tokenId?: number }): string | undefined =>
  req.tokenId !== undefined ? String(req.tokenId) : undefined;

const defaultLog = (message: string, error: unknown): void => {
  // eslint-disable-next-line no-console
  console.warn(`[rate-limit] ${message}`, error);
};

export function rateLimit(options: RateLimitOptions): RequestHandler {
  const { store, max, windowSeconds } = options;
  const keyOf = options.keyOf ?? defaultKeyOf;
  const log = options.log ?? defaultLog;

  return async (req, res, next) => {
    const key = keyOf(req);
    if (key === undefined) {
      // No token to key on (e.g. an unauthenticated route) — not ours to limit.
      return next();
    }

    let result: { count: number; ttlSeconds: number };
    try {
      result = await store.hit(key);
    } catch (error) {
      log("store unreachable; allowing request (fail-open)", error);
      return next();
    }

    if (result.count > max) {
      const retryAfter = Math.max(1, result.ttlSeconds);
      res.set("Retry-After", String(retryAfter));
      res
        .status(429)
        .json(
          errorEnvelope(
            "RATE_LIMITED",
            `Rate limit of ${max} requests per ${windowSeconds}s exceeded; retry after ${retryAfter}s.`,
          ),
        );
      return;
    }

    next();
  };
}
