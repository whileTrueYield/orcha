/**
 * Behavior tests for the DCR client store: registerClient persists the
 * library-generated client_id and redirect_uris, and getClient round-trips it.
 */
import expect from "expect";
import { orchaClientsStore } from "../clientStore";
import { getRandomCode } from "../../../utils/testing";

describe("oauth clientStore", () => {
  it("registers a client and reads it back by client_id", async () => {
    // The test DB persists across runs, so the client_id must be unique per run
    // (the unique constraint otherwise collides on re-run) — same isolation
    // pattern the rest of the suite uses via getRandomCode/createRandomOrgAndUser.
    const clientId = `test-client-${getRandomCode(12)}`;
    const registered = await orchaClientsStore.registerClient!({
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: ["http://localhost:9999/callback"],
      client_name: "Test Client",
      token_endpoint_auth_method: "none",
    } as any);

    expect(registered.client_id).toBe(clientId);

    const fetched = await orchaClientsStore.getClient(clientId);
    expect(fetched?.redirect_uris).toEqual(["http://localhost:9999/callback"]);
    expect(fetched?.client_name).toBe("Test Client");
  });

  it("returns undefined for an unknown client", async () => {
    expect(await orchaClientsStore.getClient("nope")).toBeUndefined();
  });
});
