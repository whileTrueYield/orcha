/**
 * The authorization-server endpoints are mounted and discoverable: AS metadata
 * advertises S256 + the endpoints, and DCR returns a client_id. (The /authorize
 * browser dance is covered by the provider unit tests + the e2e in Task 11.)
 */
import expect from "expect";
import request from "supertest";
import session from "express-session";
import { createExpressApp } from "../../../app";

// The AS endpoints need the session middleware present (authorize reads it); a
// memory-store session is enough for these metadata/DCR checks.
const appWithSession = () =>
  createExpressApp([
    session({ secret: "test", resave: false, saveUninitialized: false }),
  ]);

describe("oauth as router", () => {
  it("serves AS metadata with S256 and endpoints", async () => {
    const res = await request(appWithSession()).get(
      "/.well-known/oauth-authorization-server",
    );
    expect(res.status).toBe(200);
    expect(res.body.code_challenge_methods_supported).toContain("S256");
    expect(res.body.token_endpoint).toBeDefined();
    expect(res.body.registration_endpoint).toBeDefined();
  });

  it("registers a client via DCR", async () => {
    const res = await request(appWithSession())
      .post("/register")
      .send({ redirect_uris: ["http://localhost:7777/cb"] });
    expect(res.status).toBe(201);
    expect(res.body.client_id).toBeDefined();
  });
});
