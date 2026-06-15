/**
 * Behavior tests for the OAuth grant abstraction (a "connected client").
 *
 * A grant is one familyId — the chain a single connect mints and rotation
 * preserves. These tests pin the two things the connected-apps UI rides on:
 *  - listGrants surfaces a Role's active grants (one row per live family) with
 *    the client, scope and timing the UI shows, and never another tenant's.
 *  - revokeGrant kills the WHOLE chain (access AND refresh) and only ever
 *    touches the caller's own grants.
 */

import expect from "expect";
import {
  createRandomOrgAndUser,
  getTestGrant,
} from "../../../utils/testing";
import { fromNow } from "../../../utils/testing";
import { listGrants, revokeGrant, GrantNotFoundError } from "../grants";
import { verifyAndResolveOAuth } from "../accessTokens";
import {
  rotateRefreshToken,
  InvalidRefreshTokenError,
} from "../refreshTokens";
import { InvalidTokenError } from "../../../models/apiToken/token";

describe("listGrants", () => {
  it("returns the Role's active grants with client, scope and timing", async () => {
    const lastUsedAt = fromNow(-5);
    const grant = await getTestGrant({
      scope: "read",
      readOnly: true,
      clientName: "Claude Desktop",
      lastUsedAt,
    });

    const grants = await listGrants({
      organizationId: grant.organization.id,
      roleId: grant.role.id,
    });

    expect(grants).toHaveLength(1);
    expect(grants[0].familyId).toBe(grant.familyId);
    expect(grants[0].clientId).toBe(grant.client.clientId);
    expect(grants[0].clientName).toBe("Claude Desktop");
    expect(grants[0].roleId).toBe(grant.role.id);
    expect(grants[0].scope).toBe("read");
    expect(grants[0].readOnly).toBe(true);
    expect(grants[0].connectedAt).toBeInstanceOf(Date);
    expect(grants[0].lastUsedAt?.getTime()).toBe(lastUsedAt.getTime());
  });

  it("collapses a rotated family to a single grant row", async () => {
    // Same familyId, two access/refresh pairs (one rotated, one live) — the
    // chain is still ONE connected client, so it must list once.
    const first = await getTestGrant({ rotatedAt: fromNow(-10) });
    await getTestGrant({
      organization: first.organization,
      role: first.role,
      client: first.client,
      familyId: first.familyId,
    });

    const grants = await listGrants({
      organizationId: first.organization.id,
      roleId: first.role.id,
    });

    expect(grants).toHaveLength(1);
    expect(grants[0].familyId).toBe(first.familyId);
  });

  it("omits revoked, expired and fully-rotated (dead) grants", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    await getTestGrant({ role, organization, revokedAt: fromNow(-1) });
    await getTestGrant({ role, organization, expiresAt: fromNow(-1) });
    await getTestGrant({ role, organization, rotatedAt: fromNow(-1) });

    const grants = await listGrants({
      organizationId: role.organizationId,
      roleId: role.id,
    });

    expect(grants).toHaveLength(0);
  });

  it("is tenant-scoped — never returns another Role's grants", async () => {
    const mine = await getTestGrant({});
    const theirs = await getTestGrant({});

    const grants = await listGrants({
      organizationId: mine.organization.id,
      roleId: mine.role.id,
    });

    expect(grants.map((g) => g.familyId)).toEqual([mine.familyId]);
    expect(grants.map((g) => g.familyId)).not.toContain(theirs.familyId);
  });
});

describe("revokeGrant", () => {
  it("kills the whole chain: access token AND refresh token stop working", async () => {
    const grant = await getTestGrant({});

    await revokeGrant({
      familyId: grant.familyId,
      organizationId: grant.organization.id,
      roleId: grant.role.id,
    });

    // The access token no longer resolves...
    await expect(
      verifyAndResolveOAuth(grant.accessPlaintext),
    ).rejects.toBeInstanceOf(InvalidTokenError);
    // ...and the refresh token can no longer be exchanged.
    await expect(
      rotateRefreshToken(grant.client.clientId, grant.refreshPlaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("returns the revoked grant's identity", async () => {
    const grant = await getTestGrant({ clientName: "VS Code" });

    const revoked = await revokeGrant({
      familyId: grant.familyId,
      organizationId: grant.organization.id,
      roleId: grant.role.id,
    });

    expect(revoked.familyId).toBe(grant.familyId);
    expect(revoked.clientName).toBe("VS Code");
  });

  it("refuses to revoke another tenant's grant, leaving it live", async () => {
    const mine = await getTestGrant({});
    const theirs = await getTestGrant({});

    await expect(
      revokeGrant({
        familyId: theirs.familyId,
        organizationId: mine.organization.id,
        roleId: mine.role.id,
      }),
    ).rejects.toBeInstanceOf(GrantNotFoundError);

    // Their tokens are untouched.
    const resolved = await verifyAndResolveOAuth(theirs.accessPlaintext);
    expect(resolved.clientId).toBe(theirs.client.clientId);
  });
});
