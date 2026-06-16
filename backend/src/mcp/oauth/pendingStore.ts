/**
 * Pending-authorize store for the OAuth consent flow.
 *
 * Between /authorize (where the SDK validates the request and our provider
 * records intent) and the consent decision, the request must be parked
 * somewhere the consent GET and the decision POST can both read it. Those are
 * separate HTTP requests that, behind a load balancer, can each land on a
 * different API instance — so the parking spot must be shared, not in-process
 * (the in-process Map this replaced only worked on a single instance).
 *
 * Redis is the right fit: the record is purely ephemeral, holds no secret (all
 * public OAuth params), needs no durability, and has a short TTL. `SET … EX`
 * gives native self-expiry — an abandoned authorize (consent never submitted)
 * just vanishes, with no row to sweep. Single-use is enforced atomically with a
 * GET+DEL Lua script so two concurrent decisions can't both consume one request.
 * Only the SHA-256 hash of the opaque request token is used as the key, so a
 * Redis dump never exposes a live consent handle.
 *
 * Exports:
 *  - PendingRequest / PendingRequestInput: the parked request shape.
 *  - PendingStore / PendingRedis: the store and the Redis slice it needs (an
 *    interface so it is testable against a fake, with no live Redis).
 *  - redisPendingStore(client): build a store over a Redis client.
 *  - putPending / getPending / consumePending: the default store's operations,
 *    bound lazily to the shared Redis connection (kept out of the import graph
 *    so importing this never eagerly opens a socket).
 *  - setPendingStore(store): test seam to swap the backing store.
 */
import { hashToken } from "../../models/apiToken/token";

// 5 minutes is generous for a human consent decision; the authorization code
// minted on approval then has its own 60-second TTL.
const PENDING_TTL_SECONDS = 60 * 5;
const KEY_PREFIX = "oauth:pending:";

// A validated authorize request awaiting the user's approve/deny decision.
// Expiry is owned by the store's TTL, so it is not a field here.
export interface PendingRequest {
  clientId: string; // public client_id
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  state?: string;
}

export type PendingRequestInput = PendingRequest;

// The slice of the Redis client the store needs. Structural typing keeps this
// module decoupled from ioredis' export shape (whose default export resolves to
// a namespace, not a usable type), matching how the REST rate limiter types its
// client.
export interface PendingRedis {
  set(key: string, value: string, mode: "EX", ttlSeconds: number): Promise<unknown>;
  get(key: string): Promise<string | null>;
  eval(script: string, numKeys: number, ...keys: string[]): Promise<unknown>;
}

export interface PendingStore {
  // Park a validated authorize request under the opaque token, with the TTL.
  put(requestToken: string, input: PendingRequestInput): Promise<void>;
  // Read without consuming — the consent GET may be reloaded before deciding.
  peek(requestToken: string): Promise<PendingRequest | null>;
  // Read and delete atomically — the decision spends the request exactly once.
  take(requestToken: string): Promise<PendingRequest | null>;
}

// Atomic get-and-delete: returns the value and removes the key in one round
// trip, so a single-use take cannot double-fire across concurrent decisions.
const TAKE_SCRIPT =
  "local v = redis.call('GET', KEYS[1]); if v then redis.call('DEL', KEYS[1]) end; return v";

function serialize(input: PendingRequestInput): string {
  return JSON.stringify({
    clientId: input.clientId,
    redirectUri: input.redirectUri,
    codeChallenge: input.codeChallenge,
    scope: input.scope,
    state: input.state ?? null,
  });
}

function deserialize(raw: string): PendingRequest {
  const o = JSON.parse(raw);
  return {
    clientId: o.clientId,
    redirectUri: o.redirectUri,
    codeChallenge: o.codeChallenge,
    scope: o.scope,
    state: o.state ?? undefined,
  };
}

export function redisPendingStore(client: PendingRedis): PendingStore {
  const keyFor = (token: string) => `${KEY_PREFIX}${hashToken(token)}`;
  return {
    async put(requestToken, input) {
      await client.set(keyFor(requestToken), serialize(input), "EX", PENDING_TTL_SECONDS);
    },
    async peek(requestToken) {
      const raw = await client.get(keyFor(requestToken));
      return raw ? deserialize(raw) : null;
    },
    async take(requestToken) {
      const raw = (await client.eval(TAKE_SCRIPT, 1, keyFor(requestToken))) as
        | string
        | null;
      return raw ? deserialize(raw) : null;
    },
  };
}

// The active store. Bound lazily to the shared Redis connection on first use:
// the deferred require keeps the eager ioredis singleton out of this module's
// import graph, so importing the OAuth router in a test never opens a socket.
// Tests call setPendingStore before any use, so the require never runs there.
let store: PendingStore | undefined;
function activeStore(): PendingStore {
  if (!store) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { redis } = require("../../redis") as { redis: PendingRedis };
    store = redisPendingStore(redis);
  }
  return store;
}

export function setPendingStore(next: PendingStore): void {
  store = next;
}

export const putPending = (
  requestToken: string,
  input: PendingRequestInput,
): Promise<void> => activeStore().put(requestToken, input);

export const getPending = (
  requestToken: string,
): Promise<PendingRequest | null> => activeStore().peek(requestToken);

export const consumePending = (
  requestToken: string,
): Promise<PendingRequest | null> => activeStore().take(requestToken);
