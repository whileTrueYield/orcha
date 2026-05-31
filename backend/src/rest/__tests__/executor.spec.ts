/**
 * Behavior tests for the in-process GraphQL executor.
 *
 * The executor is the bridge that lets a REST request ride the existing
 * GraphQL schema without an HTTP hop: given a role context, it runs an
 * operation and returns the JSON-shaped result a client would see.
 *
 * The contract that matters: an operation executed through the token path
 * (a synthesized role context) returns exactly what the same operation
 * returns through the Apollo session path. If these ever diverge, the REST
 * API silently lies about what the GraphQL API would say — so we pin them
 * together.
 */

import expect from "expect";
import { AuthStatus } from "../../types";
import { buildRoleContext } from "../../middlewares/isAuthenticated";
import { execute } from "../executor";
import { ME_OPERATION } from "../operations";
import {
  createRandomOrgAndUser,
  graphqlRequest,
} from "../../utils/testing";
import prisma from "../../prisma";

// A real org-scoped query from the schema. We run it through the executor to
// prove the REST path enforces the exact same per-resolver tenant scoping the
// GraphQL path does — see src/models/note/resolvers/note.resolver.ts, which
// filters on `organizationId: me.organizationId`.
const NOTE_QUERY = /* GraphQL */ `
  query GetNote($id: Int!) {
    note(id: $id) {
      id
    }
  }
`;

// Build a token-style role context the way the bearer middleware does.
function roleContextFor({
  user,
  role,
  organization,
}: Awaited<ReturnType<typeof createRandomOrgAndUser>>) {
  return buildRoleContext({
    userId: user.id,
    roleId: role.id,
    organizationId: organization.id,
    roleType: role.type,
  });
}

describe("rest executor", () => {
  it("runs an operation against the schema with a synthesized role context", async () => {
    const fixture = await createRandomOrgAndUser();
    const me = roleContextFor(fixture);

    const { data, errors } = await execute({ document: ME_OPERATION, me });

    expect(errors).toBeUndefined();
    expect(data.me.status).toBe(AuthStatus.LINKED);
    expect(data.me.role.id).toBe(fixture.role.id);
    expect(data.me.user.id).toBe(fixture.user.id);
    expect(data.me.organization.id).toBe(fixture.organization.id);
  });

  it("returns the same result as the Apollo session path", async () => {
    const { user, organization, role } = await createRandomOrgAndUser();
    const session = {
      userId: user.id,
      roleId: role.id,
      organizationId: organization.id,
      roleType: role.type,
    };
    const me = buildRoleContext(session);

    const viaToken = await execute({ document: ME_OPERATION, me });
    const viaSession = await graphqlRequest({ source: ME_OPERATION, session });

    expect(viaToken.data).toEqual(viaSession.data);
  });

  it("enforces the same tenant isolation as the GraphQL path", async () => {
    // A note that lives in organization B, owned by B's role.
    const orgB = await createRandomOrgAndUser();
    const note = await prisma.note.create({
      data: {
        body: "organization B private note",
        organizationId: orgB.organization.id,
        ownerId: orgB.role.id,
      },
    });

    // A role context from organization A, asking for B's note by id.
    const orgA = await createRandomOrgAndUser();
    const crossOrg = await execute({
      document: NOTE_QUERY,
      variables: { id: note.id },
      me: roleContextFor(orgA),
    });

    // The note resolver scopes on me.organizationId, so A's context simply
    // cannot see it — the same boundary the session path enforces.
    expect(crossOrg.errors).toBeDefined();
    expect(crossOrg.data?.note ?? null).toBeNull();

    // Control: B's own context reads it through the very same executor, which
    // also proves the synthesized `me` satisfies the hasRole auth scope.
    const sameOrg = await execute({
      document: NOTE_QUERY,
      variables: { id: note.id },
      me: roleContextFor(orgB),
    });
    expect(sameOrg.errors).toBeUndefined();
    expect(sameOrg.data.note.id).toBe(note.id);
  });
});
