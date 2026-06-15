/**
 * An unauthenticated /mcp request must answer 401 with a WWW-Authenticate that
 * points a consumer client at the protected-resource metadata (OAuth discovery).
 */
import expect from "expect";
import request from "supertest";
import { createExpressApp } from "../../app";

describe("mcp oauth discovery", () => {
  it("401s with a resource_metadata WWW-Authenticate", async () => {
    const res = await request(createExpressApp()).get("/mcp");
    expect(res.status).toBe(401);
    expect(res.headers["www-authenticate"]).toMatch(/resource_metadata=/);
  });
});
