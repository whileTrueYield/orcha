/**
 * Refresh end to end: a DCR client exchanges a code for an access + refresh
 * token, the access token is force-expired (so it 401s on /mcp), the refresh
 * grant mints a fresh access token, and that token authenticates a whoami tool
 * call. A second exchange of the now-spent refresh token returns 400 invalid_grant.
 *
 * Mirrors connect.e2e.spec.ts: we build the app with session middleware ourselves
 * (mcpClient.listen omits it), mint the code directly to skip the browser consent,
 * and use the real SDK client for the /mcp call so the full handshake runs.
 */
import expect from "expect";
import request from "supertest";
import session from "express-session";
import { AddressInfo } from "net";
import { createExpressApp } from "../../../app";
import { connect, parse } from "../../__tests__/mcpClient";
import { mintCode } from "../codes";
import {
  createRandomOrgAndUser,
  pkceChallengeFor,
} from "../../../utils/testing";
import prisma from "../../../prisma";

const VERIFIER = "test-verifier-0123456789-0123456789-0123456789";

describe("oauth refresh e2e", () => {
  it("expire → refresh → call-tool, and reuse is rejected", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);

    // 1. DCR + a consent-equivalent code, exactly as connect.e2e does.
    const reg = await request(app)
      .post("/register")
      .send({ redirect_uris: ["http://localhost:7777/cb"] });
    const clientId: string = reg.body.client_id;
    const { role, organization } = await createRandomOrgAndUser();
    const clientRow = await prisma.oAuthClient.findUnique({ where: { clientId } });
    const code = await mintCode({
      clientPk: clientRow!.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "read write",
      codeChallenge: pkceChallengeFor(VERIFIER),
      redirectUri: "http://localhost:7777/cb",
    });

    // 2. Exchange the code — the response now carries a refresh_token.
    const tok = await request(app).post("/token").type("form").send({
      grant_type: "authorization_code",
      code,
      code_verifier: VERIFIER,
      client_id: clientId,
      redirect_uri: "http://localhost:7777/cb",
    });
    expect(tok.status).toBe(200);
    const accessToken: string = tok.body.access_token;
    const refreshToken: string = tok.body.refresh_token;
    expect(accessToken.startsWith("orcha_oat_")).toBe(true);
    expect(refreshToken.startsWith("orcha_ort_")).toBe(true);

    // 3. Force-expire the issued access token (as the existing e2e edits rows).
    await prisma.oAuthAccessToken.updateMany({
      where: { organizationId: organization.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    const mcpUrl = new URL(`http://127.0.0.1:${port}/mcp`);
    try {
      // The expired access token must no longer authenticate on /mcp.
      await expect(connect(mcpUrl, accessToken)).rejects.toThrow();

      // 4. Refresh: a fresh access token + a rotated refresh token.
      const refreshed = await request(app).post("/token").type("form").send({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      });
      expect(refreshed.status).toBe(200);
      const newAccess: string = refreshed.body.access_token;
      const newRefresh: string = refreshed.body.refresh_token;
      expect(newAccess.startsWith("orcha_oat_")).toBe(true);
      expect(newRefresh).not.toBe(refreshToken);

      // 5. The fresh access token authenticates a real tool call.
      const { client } = await connect(mcpUrl, newAccess);
      const result = await client.callTool({ name: "whoami", arguments: {} });
      const who = parse(result);
      expect(who.organization.id).toBe(organization.id);

      // 6. Reusing the now-spent original refresh token is rejected (400).
      const reused = await request(app).post("/token").type("form").send({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      });
      expect(reused.status).toBe(400);
      expect(reused.body.error).toBe("invalid_grant");
    } finally {
      server.close();
    }
  });
});
