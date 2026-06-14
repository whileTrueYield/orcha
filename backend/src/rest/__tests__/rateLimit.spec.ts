/**
 * Behavior tests for the per-token rate limiter middleware.
 *
 * We test the middleware through a real Express app (supertest), driving it
 * against a genuine in-memory store with an injectable clock. That exercises
 * the middleware's real decisions — allow under the limit, 429 + Retry-After
 * over it, per-token isolation, recovery after the window, and fail-open when
 * the store errors — deterministically, without depending on a live Redis.
 *
 * The Redis-backed store's own INCR/EXPIRE/TTL wiring is covered separately
 * (see redisRateLimitStore + its guarded integration test).
 */

import express, { Express } from "express";
import request from "supertest";
import expect from "expect";
import { rateLimit, RateLimitStore, redisRateLimitStore } from "../rateLimit";

// A real fixed-window store backed by a Map and a settable clock. Not a stub:
// it counts and expires for real, so the middleware runs its true logic. The
// clock is injectable so "recovers after the window" needs no wall-clock wait.
class MemoryStore implements RateLimitStore {
  private hits = new Map<string, { count: number; resetAt: number }>();
  private windowSeconds: number;
  private now: () => number;

  constructor(windowSeconds: number, now: () => number) {
    this.windowSeconds = windowSeconds;
    this.now = now;
  }

  async hit(key: string): Promise<{ count: number; ttlSeconds: number }> {
    const t = this.now();
    const existing = this.hits.get(key);
    if (!existing || t >= existing.resetAt) {
      this.hits.set(key, { count: 1, resetAt: t + this.windowSeconds * 1000 });
      return { count: 1, ttlSeconds: this.windowSeconds };
    }
    existing.count += 1;
    return {
      count: existing.count,
      ttlSeconds: Math.ceil((existing.resetAt - t) / 1000),
    };
  }
}

// Stand in for bearerAuth: read the simulated token id off a header so a test
// can act as different tokens, then mount the limiter under test.
function appWith(
  middleware: express.RequestHandler,
): Express {
  const app = express();
  app.use((req, _res, next) => {
    const id = req.headers["x-token-id"];
    if (typeof id === "string") req.tokenId = Number(id);
    next();
  });
  app.use(middleware);
  app.get("/probe", (_req, res) => {
    res.json({ ok: true });
  });
  return app;
}

const asToken = (app: Express, id: string) =>
  request(app).get("/probe").set("x-token-id", id);

describe("per-token rate limiter", () => {
  it("allows requests up to the limit, then 429s with Retry-After", async () => {
    const store = new MemoryStore(60, () => 1000);
    const app = appWith(rateLimit({ store, max: 3, windowSeconds: 60 }));

    for (let i = 0; i < 3; i++) {
      await asToken(app, "1").expect(200);
    }
    const res = await asToken(app, "1").expect(429);

    expect(res.body.error.code).toBe("RATE_LIMITED");
    expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
  });

  it("limits each token independently, not globally", async () => {
    const store = new MemoryStore(60, () => 1000);
    const app = appWith(rateLimit({ store, max: 1, windowSeconds: 60 }));

    await asToken(app, "1").expect(200);
    await asToken(app, "1").expect(429); // token 1 exhausted
    await asToken(app, "2").expect(200); // token 2 untouched
  });

  it("allows again once the window elapses", async () => {
    let now = 1000;
    const store = new MemoryStore(60, () => now);
    const app = appWith(rateLimit({ store, max: 1, windowSeconds: 60 }));

    await asToken(app, "1").expect(200);
    await asToken(app, "1").expect(429);

    now += 61_000; // step past the window
    await asToken(app, "1").expect(200);
  });

  it("fails open and logs when the store errors", async () => {
    const errors: unknown[] = [];
    const brokenStore: RateLimitStore = {
      hit: async () => {
        throw new Error("redis down");
      },
    };
    const app = appWith(
      rateLimit({
        store: brokenStore,
        max: 1,
        windowSeconds: 60,
        log: (_msg, err) => errors.push(err),
      }),
    );

    await asToken(app, "1").expect(200);
    await asToken(app, "1").expect(200);
    expect(errors.length).toBe(2);
  });
});

// A minimal fake Redis with real counting, so we can assert the store's
// command choreography without a live server — the established pattern in this
// codebase (auth.spec stubs the shared redis client likewise).
function fakeRedis(ttl: number) {
  const state = { count: 0 };
  const expireCalls: Array<[string, number]> = [];
  return {
    client: {
      incr: async (_key: string) => {
        state.count += 1;
        return state.count;
      },
      expire: async (key: string, seconds: number) => {
        expireCalls.push([key, seconds]);
        return 1;
      },
      ttl: async (_key: string) => ttl,
    } as unknown as Parameters<typeof redisRateLimitStore>[0],
    expireCalls,
  };
}

describe("redisRateLimitStore", () => {
  it("counts up and anchors the window expiry on the first hit only", async () => {
    const { client, expireCalls } = fakeRedis(42);
    const store = redisRateLimitStore(client, 60);

    const first = await store.hit("7");
    const second = await store.hit("7");

    expect(first).toEqual({ count: 1, ttlSeconds: 42 });
    expect(second.count).toBe(2);
    // EXPIRE runs once, on the first hit — that's what lets the window recover.
    expect(expireCalls).toEqual([["ratelimit:v1:7", 60]]);
  });

  it("falls back to the full window when the key has no TTL", async () => {
    // ttl -1 (no expiry) / -2 (gone) must not yield a negative Retry-After.
    const { client } = fakeRedis(-1);
    const store = redisRateLimitStore(client, 60);

    const result = await store.hit("9");

    expect(result.ttlSeconds).toBe(60);
  });
});
