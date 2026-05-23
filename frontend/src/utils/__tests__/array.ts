import { withoutAt } from "../array";

describe("withoutAt", () => {
  it("removes a single item at the end", () => {
    const arr = ["zero", "one", "two", "three"];

    expect(withoutAt(arr, 3)).toEqual(["zero", "one", "two"]);
  });

  it("removes a single item at the begining", () => {
    const arr = ["zero", "one", "two", "three"];

    expect(withoutAt(arr, 0)).toEqual(["one", "two", "three"]);
  });

  it("removes a single item in the middle", () => {
    const arr = ["zero", "one", "two", "three"];

    expect(withoutAt(arr, 1)).toEqual(["zero", "two", "three"]);
  });

  it("does not crash when out of range", () => {
    const arr = ["zero", "one", "two", "three"];

    expect(withoutAt(arr, 4)).toBe(arr);
  });
});
