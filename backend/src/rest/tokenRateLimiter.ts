/**
 * The shared per-token rate limiter for the public, PAT-authenticated surface.
 *
 * Both `/v1` (REST) and `/mcp` (MCP) authenticate the same Personal Access
 * Tokens and must share one budget per token — a runaway agent shouldn't get
 * double the allowance just by spreading its calls across both transports. So
 * the limiter is built ONCE here, keyed on `req.tokenId` (set by each
 * transport's bearer step), and imported by both routers.
 *
 * Exports:
 *  - tokenRateLimiter: the Express middleware, env-tuned.
 *
 * Defaults: 120 requests / 60s — generous headroom for an agent's
 * read→update→transition loop, while still capping a runaway. Override with
 * RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_SECONDS.
 */

import { rateLimit, redisRateLimitStore } from "./rateLimit";
import { redis } from "../redis";

const RATE_LIMIT_WINDOW_SECONDS = parseInt(
  process.env.RATE_LIMIT_WINDOW_SECONDS || "60",
  10,
);
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "120", 10);

export const tokenRateLimiter = rateLimit({
  store: redisRateLimitStore(redis, RATE_LIMIT_WINDOW_SECONDS),
  max: RATE_LIMIT_MAX,
  windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
});
