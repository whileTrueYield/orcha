import { getParentProject } from "../helper";

describe("getParentProject", () => {
  it("returns the project's name", () => {
    expect(getParentProject("/foo/bar")).toBe("foo");
    expect(getParentProject("/foo/bar/")).toBe("foo");
    expect(getParentProject("foo/bar/")).toBe("foo");
    expect(getParentProject("foo/bar")).toBe("foo");
    expect(getParentProject("foo test/bar")).toBe("foo test");
    expect(getParentProject("foo test/x/bla/bar")).toBe("foo test/x/bla");
  });
});
