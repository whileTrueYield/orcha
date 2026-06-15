/**
 * The first working connect, end to end: a client registers via DCR, an
 * authorization code (as a successful consent would produce) is exchanged at
 * /token with the matching PKCE verifier for an Orcha access token, and that
 * token authenticates a real whoami tool call over /mcp — proving the AS-issued
 * token grants the same tenant-scoped authority a PAT does.
 *
 * The browser consent step (the /authorize → /oauth/consent dance) is exercised
 * by Task 7/9 tests; here we mint the code directly so the test is deterministic
 * and needs no browser session.
 *
 * Non-obvious assumptions:
 *  - The app is built with session middleware so the AS endpoints (/register, /token,
 *    /.well-known/*) are present; the mcpClient.listen() helper omits session, so we
 *    build and listen here ourselves.
 *  - The VERIFIER must be ≥ 43 characters (PKCE minimum).
 *  - whoami returns { status, role: { id, name, type }, user: { id, email },
 *    organization: { id, name }, readOnly } — we assert on organization.id (nested),
 *    NOT a top-level organizationId field.
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

// ≥ 43 chars satisfies the PKCE minimum; this is the proof-of-possession secret
// we bind the code to and then send at /token to unlock it.
const VERIFIER = "test-verifier-0123456789-0123456789-0123456789";

describe("oauth connect e2e", () => {
  it("DCR → token → whoami over /mcp", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);

    // 1. Dynamic client registration — the AS assigns a client_id.
    const reg = await request(app)
      .post("/register")
      .send({ redirect_uris: ["http://localhost:7777/cb"] });
    expect(reg.status).toBe(201);
    const clientId: string = reg.body.client_id;

    // 2. Mint a code exactly as a successful consent decision would: PKCE-bound
    // to VERIFIER (stored as S256 challenge), tied to the test org/role.
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

    // 3. Exchange the code at /token — SDK validates PKCE-S256 before calling
    // exchangeAuthorizationCode, so sending the correct verifier succeeds.
    const tok = await request(app).post("/token").type("form").send({
      grant_type: "authorization_code",
      code,
      code_verifier: VERIFIER,
      client_id: clientId,
      redirect_uri: "http://localhost:7777/cb",
    });
    expect(tok.status).toBe(200);
    const accessToken: string = tok.body.access_token;
    expect(accessToken.startsWith("orcha_oat_")).toBe(true);

    // 4. Call whoami over /mcp with the issued access token. We listen on an
    // ephemeral port and use the real SDK client (not supertest) so the full
    // initialize handshake and JSON encoding run as they would for a remote agent.
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    const mcpUrl = new URL(`http://127.0.0.1:${port}/mcp`);
    try {
      const { client } = await connect(mcpUrl, accessToken);
      const result = await client.callTool({ name: "whoami", arguments: {} });
      const who = parse(result);
      // whoami returns { status, role: {...}, user: {...}, organization: { id, name }, readOnly }.
      // The org is nested — assert on organization.id, not a flat organizationId.
      expect(who.organization.id).toBe(organization.id);
      expect(who.readOnly).toBe(false);
    } finally {
      server.close();
    }
  });

  it("rejects /token with a wrong PKCE verifier", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);

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

    // A wrong verifier cannot produce the registered S256 challenge — the SDK
    // refuses before our code even runs.
    const tok = await request(app).post("/token").type("form").send({
      grant_type: "authorization_code",
      code,
      code_verifier: "the-wrong-verifier",
      client_id: clientId,
      redirect_uri: "http://localhost:7777/cb",
    });
    expect(tok.status).toBe(400);
  });
});
