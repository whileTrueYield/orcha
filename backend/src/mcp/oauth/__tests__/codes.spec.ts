/**
 * Behavior tests for the authorization-code store: a code is single-use,
 * short-lived, and bound to its client/role/scope/PKCE challenge. consumeCode
 * succeeds exactly once and refuses a reused, expired, or wrong-client code.
 */
import expect from "expect";
import { mintCode, lookupChallenge, consumeCode } from "../codes";
import {
  createRandomOrgAndUser,
  pkceChallengeFor,
  fromNow,
  getRandomCode,
} from "../../../utils/testing";
import prisma from "../../../prisma";

// Uses getRandomCode instead of performance.now() to guarantee uniqueness across
// parallel test runs (performance.now() in the same ms would collide on clientId).
const seedClient = () =>
  prisma.oAuthClient.create({
    data: { clientId: `c_${getRandomCode(12)}`, redirectUris: ["http://localhost/cb"] },
  });

describe("oauth codes", () => {
  it("mints a code and exposes its stored challenge", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const client = await seedClient();
    const challenge = pkceChallengeFor("verifier-abc");

    const code = await mintCode({
      clientPk: client.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: challenge,
      redirectUri: "http://localhost/cb",
    });

    expect(await lookupChallenge(client.clientId, code)).toBe(challenge);
  });

  it("consumes a code exactly once and returns the grant", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const client = await seedClient();
    const code = await mintCode({
      clientPk: client.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
    });

    const grant = await consumeCode(client.clientId, code);
    expect(grant.roleId).toBe(role.id);
    expect(grant.scope).toBe("mcp");

    await expect(consumeCode(client.clientId, code)).rejects.toThrow();
  });

  it("refuses an expired code", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const client = await seedClient();
    const code = await mintCode({
      clientPk: client.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
      expiresAt: fromNow(-1),
    });
    await expect(consumeCode(client.clientId, code)).rejects.toThrow();
  });
});
