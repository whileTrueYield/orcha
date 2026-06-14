/**
 * Behavior tests for the transport-agnostic `runOperation` core.
 *
 * `runOperation` is the seam both `/v1` and `/mcp` sit on: it runs a GraphQL
 * operation under a role context and either returns the `data` or throws a
 * typed `OperationError{ code, message }`. It knows nothing about HTTP status
 * codes or MCP tool envelopes — each transport maps the thrown error into its
 * own failure shape. These tests pin the two halves of that contract:
 * success → data, failure → typed error carrying the GraphQL `extensions.code`.
 */

import expect from "expect";
import { buildRoleContext } from "../../middlewares/isAuthenticated";
import { runOperation, OperationError } from "../runOperation";
import { ME_OPERATION, TICKET_OPERATION } from "../operations";
import { getTestApiToken } from "../../utils/testing";
import { AuthRoleContext } from "../../types";

// Build a token-style role context the way the bearer/resolveRole seam does.
function roleContextFor(
  role: Awaited<ReturnType<typeof getTestApiToken>>["role"],
): AuthRoleContext {
  return buildRoleContext({
    userId: role.userId,
    roleId: role.id,
    organizationId: role.organizationId,
    roleType: role.type,
  });
}

describe("runOperation", () => {
  it("returns the operation's data on success", async () => {
    const token = await getTestApiToken();
    const me = roleContextFor(token.role);

    const data = await runOperation(ME_OPERATION, {}, me);

    expect(data.me.role.id).toBe(token.role.id);
    expect(data.me.user.id).toBe(token.user.id);
    expect(data.me.organization.id).toBe(token.organization.id);
  });

  it("throws a typed OperationError carrying the GraphQL error code", async () => {
    const token = await getTestApiToken();
    const me = roleContextFor(token.role);

    // A ticket id that cannot exist in this fresh org → the resolver's
    // findUniqueOrThrow raises P2025, normalised to a NOT_FOUND code.
    let thrown: unknown;
    try {
      await runOperation(TICKET_OPERATION, { id: 999_999_999 }, me);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(OperationError);
    expect((thrown as OperationError).code).toBe("NOT_FOUND");
    expect((thrown as OperationError).message.length).toBeGreaterThan(0);
  });
});
