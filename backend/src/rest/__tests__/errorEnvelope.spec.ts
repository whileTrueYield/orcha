/**
 * Behavior tests for the REST error envelope.
 *
 * The REST API speaks HTTP status codes + a uniform JSON envelope, while the
 * schema underneath speaks GraphQLErrors carrying an `extensions.code`. This
 * mapper is the one place that translation happens, so every endpoint reports
 * failures identically: a known code becomes its conventional status, anything
 * unrecognised degrades to 500 rather than leaking a 200-with-errors.
 */

import expect from "expect";
import { GraphQLError } from "graphql";
import { errorEnvelope, toEnvelope } from "../errorEnvelope";

describe("rest error envelope", () => {
  it("maps known GraphQL error codes to their HTTP status", () => {
    const cases: Array<[string, number]> = [
      ["UNAUTHENTICATED", 401],
      ["FORBIDDEN", 403],
      ["NOT_FOUND", 404],
      ["BAD_USER_INPUT", 400],
    ];

    for (const [code, status] of cases) {
      const error = new GraphQLError("nope", { extensions: { code } });
      const result = toEnvelope([error]);
      expect(result.status).toBe(status);
      expect(result.body).toEqual({ error: { code, message: "nope" } });
    }
  });

  it("degrades an unrecognised or missing code to 500 INTERNAL", () => {
    const result = toEnvelope([new GraphQLError("boom")]);
    expect(result.status).toBe(500);
    expect(result.body.error.code).toBe("INTERNAL");
  });

  it("reports against the first error when several are present", () => {
    const result = toEnvelope([
      new GraphQLError("first", { extensions: { code: "NOT_FOUND" } }),
      new GraphQLError("second", { extensions: { code: "BAD_USER_INPUT" } }),
    ]);
    expect(result.status).toBe(404);
    expect(result.body.error.message).toBe("first");
  });

  it("builds an envelope directly from a code and message", () => {
    expect(errorEnvelope("UNAUTHENTICATED", "Missing bearer token")).toEqual({
      error: { code: "UNAUTHENTICATED", message: "Missing bearer token" },
    });
  });
});
