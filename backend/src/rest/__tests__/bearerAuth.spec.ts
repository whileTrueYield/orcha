/**
 * Behavior tests for the PAT bearer middleware.
 *
 * The middleware is the REST API's front door: it turns an
 * `Authorization: Bearer orcha_pat_...` header into a resolved role context on
 * the request, or refuses entry with a clean 401. We test it through a real
 * Express app so we observe exactly what a client observes — status and
 * envelope — rather than internal state.
 */

import express from "express";
import request from "supertest";
import expect from "expect";
import { bearerAuth } from "../bearerAuth";
import { getTestApiToken } from "../../utils/testing";

// A throwaway app whose sole handler echoes the resolved identity, so a 200
// proves the middleware populated req.me and a 401 proves it blocked the call.
function appWithBearer() {
  const app = express();
  app.use(bearerAuth);
  app.get("/probe", (req, res) => {
    res.json({
      userId: req.me?.userId,
      roleId: req.me?.roleId,
      tokenId: req.tokenId,
    });
  });
  return app;
}

describe("bearer auth middleware", () => {
  it("resolves a valid token to its role context and token id", async () => {
    const { plaintext, role, user, token } = await getTestApiToken();

    const res = await request(appWithBearer())
      .get("/probe")
      .set("Authorization", `Bearer ${plaintext}`)
      .expect(200);

    expect(res.body).toEqual({
      userId: user.id,
      roleId: role.id,
      tokenId: token.id,
    });
  });

  it("rejects a missing Authorization header with 401", async () => {
    const res = await request(appWithBearer()).get("/probe").expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("rejects a non-bearer scheme with 401", async () => {
    const res = await request(appWithBearer())
      .get("/probe")
      .set("Authorization", "Basic Zm9vOmJhcg==")
      .expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("rejects a garbage token with 401", async () => {
    const res = await request(appWithBearer())
      .get("/probe")
      .set("Authorization", "Bearer orcha_pat_not_a_real_token")
      .expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("rejects a revoked token with 401", async () => {
    const { plaintext } = await getTestApiToken({ revokedAt: new Date() });

    const res = await request(appWithBearer())
      .get("/probe")
      .set("Authorization", `Bearer ${plaintext}`)
      .expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });
});
