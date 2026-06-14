/**
 * Tests for the Personal Access Token display helpers.
 *
 * The status state machine is the one piece of branching logic in the token
 * UI: a token can be revoked, expired, or active, and those states have a
 * precedence (a revoked token that is also past its expiry still reads as
 * "revoked", because revocation is the deliberate, terminal action).
 */

import { tokenStatus } from "../helper";
import { PersonalAccessToken } from "types/graphql";

// Minimal token factory — only the fields tokenStatus reads.
const makeToken = (
  overrides: Partial<PersonalAccessToken> = {}
): PersonalAccessToken =>
  ({
    __typename: "PersonalAccessToken",
    id: 1,
    name: "test",
    tokenPrefix: "orcha_pat_ab",
    readOnly: false,
    lastUsedAt: null,
    expiresAt: null,
    revokedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    roleId: 1,
    role: {} as PersonalAccessToken["role"],
    ...overrides,
  }) as PersonalAccessToken;

const NOW = new Date("2026-06-13T00:00:00.000Z");

describe("tokenStatus", () => {
  it("is active for a token with no expiry and no revocation", () => {
    expect(tokenStatus(makeToken(), NOW)).toBe("active");
  });

  it("is active when expiry is in the future", () => {
    const token = makeToken({ expiresAt: "2026-12-01T00:00:00.000Z" });
    expect(tokenStatus(token, NOW)).toBe("active");
  });

  it("is expired when expiry is in the past", () => {
    const token = makeToken({ expiresAt: "2026-01-01T00:00:00.000Z" });
    expect(tokenStatus(token, NOW)).toBe("expired");
  });

  it("is revoked when revokedAt is set", () => {
    const token = makeToken({ revokedAt: "2026-05-01T00:00:00.000Z" });
    expect(tokenStatus(token, NOW)).toBe("revoked");
  });

  it("reads as revoked even when also past expiry (revocation wins)", () => {
    const token = makeToken({
      revokedAt: "2026-05-01T00:00:00.000Z",
      expiresAt: "2026-01-01T00:00:00.000Z",
    });
    expect(tokenStatus(token, NOW)).toBe("revoked");
  });
});
