/**
 * Integration tests for the consent ROUTES (the GET page + POST decision), the
 * part #80 adds on top of the pure renderConsent: the page reflects the session's
 * Roles and the requested scope, and the decision binds the authorization code to
 * the Role AND access level the user actually chose — refusing a forged Role or a
 * widened scope.
 *
 * The routes read req.session (httpOnly login state), so rather than drive a full
 * login each request is given a pre-populated session by a tiny inject middleware
 * — the same session the login flow would have produced, without its machinery.
 */
import expect from "expect";
import request from "supertest";
import session from "express-session";
import { Role } from "@prisma/client";
import { createExpressApp } from "../../../app";
import { pendingRequests, PendingRequest } from "../provider";
import { consumeCode } from "../codes";
import {
  createRandomOrgAndUser,
  pkceChallengeFor,
  getRandomCode,
} from "../../../utils/testing";
import prisma from "../../../prisma";

// An app whose session is populated on every request — the decision route reads
// req.session.{roles,roleId,organizationId}, injected here instead of via login.
function appAs(sessionData: {
  roles: Role[];
  roleId: number;
  organizationId: number;
}) {
  return createExpressApp([
    session({ secret: "test", resave: false, saveUninitialized: false }),
    (req: any, _res: any, next: any) => {
      Object.assign(req.session, sessionData);
      next();
    },
  ]);
}

// Seed a pending authorize request (as provider.authorize would) plus its client,
// and return the handles a consent test needs.
async function seedPending(
  scope: string,
): Promise<{ requestToken: string; clientId: string; redirectUri: string }> {
  const clientId = `consent-${getRandomCode(8)}`;
  await prisma.oAuthClient.create({
    data: { clientId, name: "Test Client", redirectUris: ["http://localhost/cb"] },
  });
  const requestToken = `tok-${getRandomCode(8)}`;
  const pending: PendingRequest = {
    clientId,
    redirectUri: "http://localhost/cb",
    codeChallenge: pkceChallengeFor("v"),
    scope,
    state: "xyz",
    expiresAt: Date.now() + 60_000,
  };
  pendingRequests.set(requestToken, pending);
  return { requestToken, clientId, redirectUri: pending.redirectUri };
}

describe("oauth consent routes", () => {
  it("GET renders the client, the Role, and both scope choices for a read+write request", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { requestToken } = await seedPending("read write");

    const res = await request(
      appAs({ roles: [role], roleId: role.id, organizationId: organization.id }),
    ).get(`/oauth/consent?request=${requestToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain("Test Client");
    expect(res.text).toContain(role.name);
    // Single Role → static, not a chooser.
    expect(res.text).toContain(`name="roleId" value="${role.id}"`);
    // A read+write request offers both access levels.
    expect(res.text).toContain('name="scope" value="read"');
    expect(res.text).toContain('name="scope" value="read write" checked');
  });

  it("GET renders a <select> when the user holds more than one Role", async () => {
    const a = await createRandomOrgAndUser();
    const b = await createRandomOrgAndUser();
    const { requestToken } = await seedPending("read write");

    const res = await request(
      appAs({
        roles: [a.role, b.role],
        roleId: a.role.id,
        organizationId: a.organization.id,
      }),
    ).get(`/oauth/consent?request=${requestToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('<select id="roleId" name="roleId"');
    expect(res.text).toContain(a.role.name);
    expect(res.text).toContain(b.role.name);
  });

  it("approve binds the code to the chosen Role and the chosen (narrowed) scope", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { requestToken, clientId } = await seedPending("read write");

    const res = await request(
      appAs({ roles: [role], roleId: role.id, organizationId: organization.id }),
    )
      .post("/oauth/consent/decision")
      .type("form")
      .send({ request: requestToken, roleId: role.id, scope: "read", decision: "approve" });

    expect(res.status).toBe(302);
    const loc = new URL(res.headers.location);
    expect(loc.searchParams.get("state")).toBe("xyz");
    const code = loc.searchParams.get("code");
    expect(code).toBeTruthy();

    // The grant carries exactly what the user approved: this Role, narrowed to read.
    const grant = await consumeCode(clientId, code!);
    expect(grant.roleId).toBe(role.id);
    expect(grant.organizationId).toBe(organization.id);
    expect(grant.scope).toBe("read");
  });

  it("approve binds to the OTHER Role when a multi-Role user picks it", async () => {
    const a = await createRandomOrgAndUser();
    const b = await createRandomOrgAndUser();
    const { requestToken, clientId } = await seedPending("read write");

    const res = await request(
      appAs({
        roles: [a.role, b.role],
        roleId: a.role.id,
        organizationId: a.organization.id,
      }),
    )
      .post("/oauth/consent/decision")
      .type("form")
      .send({ request: requestToken, roleId: b.role.id, scope: "read write", decision: "approve" });

    expect(res.status).toBe(302);
    const code = new URL(res.headers.location).searchParams.get("code");
    const grant = await consumeCode(clientId, code!);
    expect(grant.roleId).toBe(b.role.id);
    expect(grant.organizationId).toBe(b.organization.id);
  });

  it("deny grants nothing and returns access_denied to the client", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { requestToken } = await seedPending("read write");

    const res = await request(
      appAs({ roles: [role], roleId: role.id, organizationId: organization.id }),
    )
      .post("/oauth/consent/decision")
      .type("form")
      .send({ request: requestToken, roleId: role.id, scope: "read write", decision: "deny" });

    expect(res.status).toBe(302);
    const loc = new URL(res.headers.location);
    expect(loc.searchParams.get("error")).toBe("access_denied");
    expect(loc.searchParams.get("code")).toBeNull();
  });

  it("refuses a Role the user does not hold", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { requestToken } = await seedPending("read write");

    const res = await request(
      appAs({ roles: [role], roleId: role.id, organizationId: organization.id }),
    )
      .post("/oauth/consent/decision")
      .type("form")
      .send({ request: requestToken, roleId: role.id + 99999, scope: "read write", decision: "approve" });

    expect(res.status).toBe(400);
  });

  it("refuses a scope wider than the client requested", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    // The client asked for read-only; the user must not be able to grant write.
    const { requestToken } = await seedPending("read");

    const res = await request(
      appAs({ roles: [role], roleId: role.id, organizationId: organization.id }),
    )
      .post("/oauth/consent/decision")
      .type("form")
      .send({ request: requestToken, roleId: role.id, scope: "read write", decision: "approve" });

    expect(res.status).toBe(400);
  });
});
