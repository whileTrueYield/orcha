/**
 * Behavior tests for buildRoleContext.
 *
 * buildRoleContext is the session-agnostic constructor of an AuthRoleContext.
 * It is the single source of truth shared by the Apollo session factory
 * (via buildMeContext) and the REST PAT bearer middleware, so the `me` object
 * resolvers see is identical regardless of how the caller authenticated.
 *
 * These tests exercise it through its public contract: given the four
 * identifiers a Role is known by, it yields a LINKED context whose lazy
 * accessors resolve the correct records.
 */

import expect from "expect";
import { AuthStatus } from "../../types";
import { buildRoleContext } from "../isAuthenticated";
import { createRandomOrgAndUser } from "../../utils/testing";
import { RoleType } from "@prisma/client";

describe("buildRoleContext", () => {
  it("yields a LINKED context carrying the role's identifiers", async () => {
    const { user, organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
    );

    const me = buildRoleContext({
      userId: user.id,
      roleId: role.id,
      organizationId: organization.id,
      roleType: role.type,
    });

    expect(me.status).toBe(AuthStatus.LINKED);
    expect(me.userId).toBe(user.id);
    expect(me.roleId).toBe(role.id);
    expect(me.organizationId).toBe(organization.id);
    expect(me.roleType).toBe(RoleType.MEMBER);
  });

  it("resolves the user, role, and organization through its lazy accessors", async () => {
    const { user, organization, role } = await createRandomOrgAndUser();

    const me = buildRoleContext({
      userId: user.id,
      roleId: role.id,
      organizationId: organization.id,
      roleType: role.type,
    });

    expect((await me.getUser()).id).toBe(user.id);
    expect((await me.getRole()).id).toBe(role.id);
    expect((await me.getOrganization()).id).toBe(organization.id);
  });
});
