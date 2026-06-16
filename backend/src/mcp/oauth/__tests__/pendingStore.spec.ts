/**
 * Unit tests for the pending-authorize store's logic — park, non-destructive
 * peek (the consent GET may be reloaded), and single-use take (the decision
 * spends it exactly once). Runs against the in-memory Redis fake, so it exercises
 * the store's serialize/peek/take behavior with no live Redis. TTL expiry is not
 * tested here: it is Redis's `EX`, not this module's logic.
 */
import expect from "expect";
import { redisPendingStore, PendingRequest } from "../pendingStore";
import { inMemoryPendingRedis } from "../../../utils/testing";

const sample: PendingRequest = {
  clientId: "client-123",
  redirectUri: "http://localhost/cb",
  codeChallenge: "challenge",
  scope: "read write",
  state: "xyz",
};

describe("redisPendingStore", () => {
  it("peek returns a parked request without consuming it", async () => {
    const store = redisPendingStore(inMemoryPendingRedis());
    await store.put("tok", sample);

    expect(await store.peek("tok")).toEqual(sample);
    // Still there — peek must not consume.
    expect(await store.peek("tok")).toEqual(sample);
  });

  it("take returns the request once, then it is gone (single-use)", async () => {
    const store = redisPendingStore(inMemoryPendingRedis());
    await store.put("tok", sample);

    expect(await store.take("tok")).toEqual(sample);
    expect(await store.take("tok")).toBeNull();
    expect(await store.peek("tok")).toBeNull();
  });

  it("returns null for an unknown token", async () => {
    const store = redisPendingStore(inMemoryPendingRedis());

    expect(await store.peek("nope")).toBeNull();
    expect(await store.take("nope")).toBeNull();
  });

  it("round-trips a request that carries no state", async () => {
    const store = redisPendingStore(inMemoryPendingRedis());
    const { state: _state, ...withoutState } = sample;
    await store.put("tok", withoutState);

    const got = await store.peek("tok");
    expect(got).toEqual(withoutState);
    expect(got?.state).toBeUndefined();
  });
});
