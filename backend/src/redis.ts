import IORedis from "ioredis";

// Shared Redis connection config for all consumers (session store, BullMQ,
// Hocuspocus). Supports REDIS_URL (DO Managed Redis — includes TLS via
// rediss:// and password) or REDIS_HOSTNAME/REDIS_PORT for self-hosted.
function parseRedisConfig() {
  if (process.env.REDIS_URL) {
    // TODO: remove after DO deployment is verified
    const masked = process.env.REDIS_URL.replace(/:([^@]+)@/, ":***@");
    console.log(`[redis] connecting to: ${masked}`);
    const url = new URL(process.env.REDIS_URL);
    const opts: Record<string, any> = {
      host: url.hostname,
      port: parseInt(url.port || "6379"),
    };
    if (url.password) opts.password = decodeURIComponent(url.password);
    if (url.protocol === "rediss:") opts.tls = {};
    return opts;
  }
  return {
    host: process.env.REDIS_HOSTNAME || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  };
}

export const redisConfig = parseRedisConfig();

export const redis = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});
