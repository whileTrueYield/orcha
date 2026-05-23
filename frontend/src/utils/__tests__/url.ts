import { JSONToQuery, getFirstFromQuery, getManyFromQuery } from "../url";

describe("JSONToQuery", () => {
  it("escapes values", () => {
    expect(JSONToQuery({ foo: "foo bar baz" })).toBe("foo=foo%20bar%20baz");
  });
  it("escapes keys", () => {
    expect(JSONToQuery({ "foo bar": "foo" })).toBe("foo%20bar=foo");
  });
  it("accepts array of values", () => {
    expect(JSONToQuery({ foo: ["biz", "bar baz"] })).toBe(
      "foo=biz&foo=bar%20baz"
    );
  });
});

describe("getFirstFromQuery", () => {
  it("return a single item from url search", () => {
    expect(getFirstFromQuery("?foo=bar&foo=biz", "foo")).toBe("bar");
  });
  it("returns the default value when no matches", () => {
    const defaultValue = "bar";
    expect(getFirstFromQuery("?foo=bar&foo=biz", "fiz", defaultValue)).toBe(
      defaultValue
    );
  });
});

describe("getManyFromQuery", () => {
  it("returns an array of items from url search", () => {
    expect(getManyFromQuery("?foo=bar&foo=biz", "foo")).toEqual(["bar", "biz"]);
  });

  it("returns an empty array when no matches", () => {
    expect(getManyFromQuery("?foo=bar&foo=biz", "fiz")).toEqual([]);
  });

  it("returns the default value when no matches", () => {
    const defaultValue = ["bar"];
    expect(getManyFromQuery("?foo=bar&foo=biz", "fiz", defaultValue)).toBe(
      defaultValue
    );
  });
});
