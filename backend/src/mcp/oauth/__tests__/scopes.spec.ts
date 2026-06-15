/**
 * Behavior tests for the OAuth scope vocabulary and the one mapping every grant
 * path shares: a requested scope is granted canonically (write implies read,
 * absence defaults to full), and a granted scope without `write` resolves
 * read-only — the same capability flag a read-only PAT carries.
 */
import expect from "expect";
import {
  SUPPORTED_SCOPES,
  grantedScopeFromRequest,
  isReadOnlyScope,
  offeredScopes,
  isGrantableScope,
} from "../scopes";

describe("oauth scopes", () => {
  it("advertises read and write as supported", () => {
    expect(SUPPORTED_SCOPES).toEqual(["read", "write"]);
  });

  it("grants full read+write when nothing is requested", () => {
    expect(grantedScopeFromRequest()).toBe("read write");
    expect(grantedScopeFromRequest([])).toBe("read write");
  });

  it("grants read+write when write is requested (write implies read)", () => {
    expect(grantedScopeFromRequest(["read", "write"])).toBe("read write");
    expect(grantedScopeFromRequest(["write"])).toBe("read write");
  });

  it("grants read-only when only read is requested", () => {
    expect(grantedScopeFromRequest(["read"])).toBe("read");
  });

  it("maps a scope without write to read-only, and with write to read+write", () => {
    expect(isReadOnlyScope("read")).toBe(true);
    expect(isReadOnlyScope("read write")).toBe(false);
  });

  it("offers both scopes when the request included write, read-only otherwise", () => {
    expect(offeredScopes("read write")).toEqual(["read", "read write"]);
    expect(offeredScopes("read")).toEqual(["read"]);
  });

  it("grants only a scope the request offered — never a widened grant", () => {
    // A read+write request: the user may pick either.
    expect(isGrantableScope("read", "read write")).toBe(true);
    expect(isGrantableScope("read write", "read write")).toBe(true);
    // A read-only request: read+write is not on the table.
    expect(isGrantableScope("read", "read")).toBe(true);
    expect(isGrantableScope("read write", "read")).toBe(false);
    // Junk is never grantable.
    expect(isGrantableScope("admin", "read write")).toBe(false);
  });
});
