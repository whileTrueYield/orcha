/**
 * End-to-end proof that an OAuth grant's scope is a real, enforced capability:
 * the scope round-trips authorize → token → resolveRole, and the resource server
 * (/mcp) refuses a write tool for a read-only grant while allowing it for a
 * read+write grant — through the SAME read-only refusal a read-only PAT hits
 * (writeAs), with no new per-tool logic.
 *
 * Like connect.e2e, the browser consent step is shortcut by minting the code
 * directly (as a successful consent decision would), so the test is deterministic
 * and needs no session; the scope on the code is what the consent screen will set.
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
  createRandomProject,
  pkceChallengeFor,
} from "../../../utils/testing";
import prisma from "../../../prisma";

const VERIFIER = "test-verifier-0123456789-0123456789-0123456789";
const REDIRECT = "http://localhost:7777/cb";

// Register a client and exchange a freshly-minted, scope-bound code for an access
// token — the real grant path, so the token's capability is whatever the scope
// derived, not a value the test set directly.
async function accessTokenForScope(
  app: ReturnType<typeof createExpressApp>,
  scope: string,
  roleId: number,
  organizationId: number,
): Promise<string> {
  const reg = await request(app)
    .post("/register")
    .send({ redirect_uris: [REDIRECT] });
  const clientId: string = reg.body.client_id;
  const clientRow = await prisma.oAuthClient.findUnique({ where: { clientId } });
  const code = await mintCode({
    clientPk: clientRow!.id,
    roleId,
    organizationId,
    scope,
    codeChallenge: pkceChallengeFor(VERIFIER),
    redirectUri: REDIRECT,
  });
  const tok = await request(app).post("/token").type("form").send({
    grant_type: "authorization_code",
    code,
    code_verifier: VERIFIER,
    client_id: clientId,
    redirect_uri: REDIRECT,
  });
  expect(tok.status).toBe(200);
  return tok.body.access_token;
}

describe("oauth scope enforcement e2e", () => {
  it("a read grant resolves read-only and is refused on a write tool", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);
    const { role, organization } = await createRandomOrgAndUser();
    const project = await createRandomProject(organization);
    const accessToken = await accessTokenForScope(
      app,
      "read",
      role.id,
      organization.id,
    );

    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    try {
      const { client } = await connect(
        new URL(`http://127.0.0.1:${port}/mcp`),
        accessToken,
      );

      // The scope round-tripped to a read-only capability.
      const who = parse(await client.callTool({ name: "whoami", arguments: {} }));
      expect(who.readOnly).toBe(true);

      // And that capability is enforced: the write tool is refused before any
      // mutation runs, the same FORBIDDEN a read-only PAT gets.
      const result = await client.callTool({
        name: "create_ticket",
        arguments: { title: "Should not exist", projectId: project.id },
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("FORBIDDEN");
    } finally {
      server.close();
    }

    // The mutation never ran.
    const count = await prisma.ticket.count({ where: { projectId: project.id } });
    expect(count).toBe(0);
  });

  it("a read+write grant resolves writable and is allowed on a write tool", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);
    const { role, organization } = await createRandomOrgAndUser();
    const project = await createRandomProject(organization);
    const accessToken = await accessTokenForScope(
      app,
      "read write",
      role.id,
      organization.id,
    );

    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    try {
      const { client } = await connect(
        new URL(`http://127.0.0.1:${port}/mcp`),
        accessToken,
      );

      const who = parse(await client.callTool({ name: "whoami", arguments: {} }));
      expect(who.readOnly).toBe(false);

      const created = parse(
        await client.callTool({
          name: "create_ticket",
          arguments: { title: "Shipped via OAuth write", projectId: project.id },
        }),
      );
      expect(created.title).toBe("Shipped via OAuth write");
      expect(created.projectId).toBe(project.id);
    } finally {
      server.close();
    }
  });
});
