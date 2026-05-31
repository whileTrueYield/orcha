/**
 * Integration tests for GET /v1/me — the REST pipeline tracer.
 *
 * This drives the whole spine end-to-end through the real Express app: bearer
 * auth → role context → in-process GraphQL execution → JSON envelope. A green
 * test here means every later `/v1` endpoint has a proven path to ride on.
 *
 * Tenant isolation is asserted as observable behavior: a token is bound to a
 * single Role, so it can only ever surface its own Organization — there is no
 * request a holder of token A can craft that returns Organization B's data.
 */

import request from "supertest";
import expect from "expect";
import { createExpressApp } from "../../app";
import { getTestApiToken } from "../../utils/testing";

describe("GET /v1/me", () => {
  it("returns the token's role, user, and organization", async () => {
    const { plaintext, role, user, organization } = await getTestApiToken();

    const res = await request(createExpressApp())
      .get("/v1/me")
      .set("Authorization", `Bearer ${plaintext}`)
      .expect(200);

    expect(res.body.status).toBe("LINKED");
    expect(res.body.role.id).toBe(role.id);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body.organization.id).toBe(organization.id);
  });

  it("returns 401 with the error envelope when no token is presented", async () => {
    const res = await request(createExpressApp()).get("/v1/me").expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("isolates tenants: each token surfaces only its own organization", async () => {
    const tokenA = await getTestApiToken();
    const tokenB = await getTestApiToken();
    expect(tokenA.organization.id).not.toBe(tokenB.organization.id);

    const app = createExpressApp();

    const resA = await request(app)
      .get("/v1/me")
      .set("Authorization", `Bearer ${tokenA.plaintext}`)
      .expect(200);
    const resB = await request(app)
      .get("/v1/me")
      .set("Authorization", `Bearer ${tokenB.plaintext}`)
      .expect(200);

    // Token A sees only A's org; token B sees only B's. Neither can reach the
    // other's tenant — the credential is the boundary.
    expect(resA.body.organization.id).toBe(tokenA.organization.id);
    expect(resB.body.organization.id).toBe(tokenB.organization.id);
    expect(resA.body.organization.id).not.toBe(tokenB.organization.id);
  });

  it("serves an OpenAPI 3 spec documenting GET /v1/me", async () => {
    const res = await request(createExpressApp())
      .get("/v1/openapi.json")
      .expect(200);

    expect(res.body.openapi).toMatch(/^3\./);
    for (const path of [
      "/v1/me",
      "/v1/tickets",
      "/v1/tickets/{id}",
      "/v1/projects",
      "/v1/projects/{id}",
      "/v1/schedule",
    ]) {
      expect(res.body.paths[path].get).toBeDefined();
    }
  });

  it("emits no CORS headers, so browsers cannot read it cross-origin", async () => {
    const { plaintext } = await getTestApiToken();

    const res = await request(createExpressApp())
      .get("/v1/me")
      .set("Origin", "https://some-third-party.example")
      .set("Authorization", `Bearer ${plaintext}`)
      .expect(200);

    // This is a machine-to-machine API. We deliberately advertise no CORS, so
    // a browser's same-origin policy blocks cross-origin JS from reading the
    // response — a PAT has no business living in frontend code. M2M clients
    // (curl, scripts, backends) ignore CORS entirely and are unaffected.
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});
