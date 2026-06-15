import { resolveReturnTo } from "./resolveReturnTo";

const API = "https://api.orcha.test";

describe("resolveReturnTo", () => {
  it("accepts an /oauth/consent URL on the API origin", () => {
    const url = `${API}/oauth/consent?request=abc`;
    expect(resolveReturnTo(`?returnTo=${encodeURIComponent(url)}`, API)).toBe(url);
  });

  it("rejects a different origin (open-redirect guard)", () => {
    const url = "https://evil.test/oauth/consent";
    expect(resolveReturnTo(`?returnTo=${encodeURIComponent(url)}`, API)).toBeNull();
  });

  it("rejects a non-consent path on the API origin", () => {
    const url = `${API}/somewhere-else`;
    expect(resolveReturnTo(`?returnTo=${encodeURIComponent(url)}`, API)).toBeNull();
  });

  it("returns null when absent", () => {
    expect(resolveReturnTo("", API)).toBeNull();
  });
});
