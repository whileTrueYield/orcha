/**
 * Auth scope integration tests — verify the Pothos scope-auth plugin
 * correctly gates access based on the caller's context.
 *
 * These tests build the real schema and execute GraphQL queries directly
 * (no running server needed). The auth scopes fire BEFORE resolvers run,
 * so we don't need DB data — we only need to verify that:
 *   - wrong context → auth error
 *   - correct context → no auth error (resolver may fail for other reasons)
 *
 * Test targets:
 *   - hasRole:          Query.organization (requires any linked role)
 *   - isStaff:          Query.organizations (requires isStaff flag)
 *   - isAuthenticated:  Mutation.createOrganization (requires non-guest session)
 *   - public:           Query.version (no auth required)
 */

import "mocha";
import expect from "expect";
import { graphql } from "graphql";
import { getSchema } from "../index";
import { AuthStatus } from "../../types";

// ---------------------------------------------------------------------------
// Build the schema once — shared across all tests
// ---------------------------------------------------------------------------

const schema = getSchema();

// ---------------------------------------------------------------------------
// Mock contexts matching AppContext<AuthContext>
//
// We provide minimal shapes — just enough for scope-auth to evaluate.
// Prisma client and req/res are stubbed because we never reach resolvers.
// ---------------------------------------------------------------------------

const guestContext = {
  me: { status: AuthStatus.GUEST },
  prisma: {} as any,
  req: {} as any,
  res: {} as any,
};

const userContext = {
  me: {
    status: AuthStatus.USER,
    userId: 1,
    getUser: async () => ({ id: 1, isStaff: false } as any),
  },
  prisma: {} as any,
  req: {} as any,
  res: {} as any,
};

const roleContext = {
  me: {
    status: AuthStatus.LINKED,
    userId: 1,
    roleId: 1,
    organizationId: 1,
    roleType: "MEMBER" as const,
    getUser: async () => ({ id: 1, isStaff: false } as any),
    getRole: async () => ({ id: 1 } as any),
    getOrganization: async () => ({ id: 1 } as any),
  },
  prisma: {} as any,
  req: {} as any,
  res: {} as any,
};

// NOTE: isStaff scope uses the module-level prisma client (not context.prisma),
// so we cannot mock the DB lookup for staff/non-staff without a live DB.
// The guest rejection path is testable since it short-circuits before the DB call.

// ---------------------------------------------------------------------------
// Helper — check if a result contains an auth-related error
// ---------------------------------------------------------------------------

function hasAuthError(result: any): boolean {
  if (!result.errors) return false;
  return result.errors.some(
    (e: any) =>
      e.message.includes("Not authorized") ||
      e.message.includes("do not appear to be connected") ||
      e.message.includes("UNAUTHENTICATED") ||
      e.message.includes("Access denied") ||
      e.message.includes("need to be") ||
      (e.extensions?.code === "UNAUTHENTICATED"),
  );
}

function getAuthErrorMessage(result: any): string | null {
  if (!result.errors) return null;
  const authErr = result.errors.find(
    (e: any) =>
      e.message.includes("Not authorized") ||
      e.message.includes("do not appear to be connected") ||
      e.message.includes("UNAUTHENTICATED") ||
      e.message.includes("Access denied") ||
      e.message.includes("need to be") ||
      (e.extensions?.code === "UNAUTHENTICATED"),
  );
  return authErr?.message ?? null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Auth scopes", () => {
  // -----------------------------------------------------------------------
  // Public field — no auth required
  // -----------------------------------------------------------------------

  describe("public (no scope)", () => {
    const query = `{ version }`;

    it("allows guest access", async () => {
      const result = await graphql({ schema, source: query, contextValue: guestContext });
      expect(hasAuthError(result)).toBe(false);
      expect(result.data?.version).toBe("0.0.1");
    });

    it("allows authenticated access", async () => {
      const result = await graphql({ schema, source: query, contextValue: userContext });
      expect(hasAuthError(result)).toBe(false);
      expect(result.data?.version).toBe("0.0.1");
    });
  });

  // -----------------------------------------------------------------------
  // hasRole scope — requires LINKED status
  // -----------------------------------------------------------------------

  describe("hasRole: true", () => {
    // organization query requires hasRole: true
    const query = `{ organization { id } }`;

    it("rejects guest context", async () => {
      const result = await graphql({ schema, source: query, contextValue: guestContext });
      expect(hasAuthError(result)).toBe(true);
    });

    it("rejects authenticated user without role", async () => {
      const result = await graphql({ schema, source: query, contextValue: userContext });
      expect(hasAuthError(result)).toBe(true);
    });

    it("allows user with a linked role", async () => {
      // The resolver will fail because prisma isn't real, but auth should pass.
      // We check that the error is NOT an auth error.
      const result = await graphql({ schema, source: query, contextValue: roleContext });
      expect(hasAuthError(result)).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // isStaff scope — requires isStaff flag on User record
  //
  // NOTE: The isStaff scope uses the MODULE-LEVEL prisma client (not
  // the context one), so we can only fully test the guest rejection path
  // without a real DB. The non-staff and staff paths require a live DB
  // connection and are noted as integration-level tests.
  // -----------------------------------------------------------------------

  describe("isStaff: true", () => {
    // organizations query requires isStaff: true
    const query = `{ organizations { totalCount } }`;

    it("rejects guest context", async () => {
      const result = await graphql({ schema, source: query, contextValue: guestContext });
      expect(hasAuthError(result)).toBe(true);
    });

    // Non-staff and staff tests require a live DB because the isStaff
    // scope calls the module-level prisma.user.findUniqueOrThrow directly.
    // These are left as TODO for full integration testing.
  });

  // -----------------------------------------------------------------------
  // isAuthenticated scope — requires non-guest status
  // -----------------------------------------------------------------------

  describe("isAuthenticated: true", () => {
    // myRoles requires isAuthenticated: true
    const query = `{ myRoles { id } }`;

    it("rejects guest context", async () => {
      const result = await graphql({ schema, source: query, contextValue: guestContext });
      expect(hasAuthError(result)).toBe(true);
    });

    it("allows authenticated user (USER status)", async () => {
      const result = await graphql({ schema, source: query, contextValue: userContext });
      // Auth should pass — resolver may fail because prisma isn't wired
      expect(hasAuthError(result)).toBe(false);
    });

    it("allows linked user (LINKED status)", async () => {
      const result = await graphql({ schema, source: query, contextValue: roleContext });
      expect(hasAuthError(result)).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // hasRole with specific role type — requires ADMIN or OWNER
  // -----------------------------------------------------------------------

  describe("hasRole: [ADMIN, OWNER]", () => {
    // toggleOnboarding requires hasRole: ["ADMIN", "OWNER"]
    const mutation = `mutation {
      toggleOnboarding(showOnboarding: true) {
        id
      }
    }`;

    it("rejects guest context", async () => {
      const result = await graphql({ schema, source: mutation, contextValue: guestContext });
      expect(hasAuthError(result)).toBe(true);
    });

    it("rejects MEMBER role", async () => {
      const result = await graphql({ schema, source: mutation, contextValue: roleContext });
      // roleContext has roleType: "MEMBER" — should fail
      expect(hasAuthError(result)).toBe(true);
    });

    it("allows OWNER role", async () => {
      const ownerContext = {
        ...roleContext,
        me: { ...roleContext.me, roleType: "OWNER" as const },
      };
      const result = await graphql({ schema, source: mutation, contextValue: ownerContext });
      // Auth passes, resolver may fail due to missing prisma
      expect(hasAuthError(result)).toBe(false);
    });

    it("allows ADMIN role", async () => {
      const adminContext = {
        ...roleContext,
        me: { ...roleContext.me, roleType: "ADMIN" as const },
      };
      const result = await graphql({ schema, source: mutation, contextValue: adminContext });
      expect(hasAuthError(result)).toBe(false);
    });
  });
});
