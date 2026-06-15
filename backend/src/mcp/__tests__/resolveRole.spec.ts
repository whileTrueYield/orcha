/**
 * Behavior tests for the `resolveRole` seam — the single point where a bearer
 * token becomes a resolved role context for the MCP transport.
 *
 * This is the seam OAuth (PRD B) will later swap: today it resolves a Personal
 * Access Token; tomorrow an OAuth access token. The MCP tools depend only on
 * its output `{ role, readOnly, tokenId }`, never on how the token was proven.
 * These tests pin that contract: a valid PAT resolves to its role context and
 * capability flags; an invalid one is refused (the connection fails); a
 * read-only PAT carries its `readOnly` flag through.
 */

import expect from "expect";
import { resolveRole } from "../resolveRole";
import { AuthStatus } from "../../types";
import { getTestApiToken } from "../../utils/testing";
import { InvalidTokenError } from "../../models/apiToken/token";

describe("resolveRole", () => {
  it("resolves a valid PAT to its role context, tokenId, and readOnly flag", async () => {
    const token = await getTestApiToken();

    const { role, readOnly, tokenId } = await resolveRole(token.plaintext);

    expect(role.status).toBe(AuthStatus.LINKED);
    expect(role.roleId).toBe(token.role.id);
    expect(role.userId).toBe(token.user.id);
    expect(role.organizationId).toBe(token.organization.id);
    expect(readOnly).toBe(false);
    expect(tokenId).toBe(token.token.id);
  });

  it("carries the readOnly capability of a read-only PAT", async () => {
    const token = await getTestApiToken({ readOnly: true });

    const { readOnly } = await resolveRole(token.plaintext);

    expect(readOnly).toBe(true);
  });

  it("throws InvalidTokenError for an unknown token", async () => {
    let thrown: unknown;
    try {
      await resolveRole("orcha_pat_not_a_real_token");
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(InvalidTokenError);
  });

  it("resolves a valid OAuth access token to its role context and readOnly", async () => {
    const { getTestOAuthToken } = await import("../../utils/testing");
    const t = await getTestOAuthToken();

    const { role, readOnly, tokenId } = await resolveRole(t.plaintext);

    expect(role.status).toBe(AuthStatus.LINKED);
    expect(role.roleId).toBe(t.role.id);
    expect(role.organizationId).toBe(t.organization.id);
    expect(readOnly).toBe(false);
    expect(tokenId).toBe(t.token.id);
  });

  it("throws InvalidTokenError for an unknown OAuth access token", async () => {
    await expect(resolveRole("orcha_oat_not_real")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
