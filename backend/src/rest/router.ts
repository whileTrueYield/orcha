/**
 * The `/v1` public REST router — the HTTP face of the Orcha REST API.
 *
 * This is intentionally a thin shell: each endpoint authenticates, runs a
 * GraphQL operation (from operations.ts) through the in-process executor, and
 * maps the result into the JSON envelope. No business logic lives here — it
 * all stays in the schema the executor targets.
 *
 * Exports:
 *  - v1Router: mount under `${apiPathPrefix}/v1`.
 *
 * CORS: this router carries its OWN cors policy — `origin: *`, `credentials:
 * false` — because a PAT is a bearer credential, not a cookie. That is the
 * opposite of the GraphQL endpoint's credentialed, origin-allowlisted CORS, so
 * the two must never share a policy. The mount point (see app.ts) places this
 * router ahead of the cookie/session middleware so a `/v1` request never
 * touches them.
 *
 * The OpenAPI spec is served unauthenticated: the contract is public so
 * integrators can read it before they hold a token. Everything else requires a
 * valid bearer token.
 */

import { Router, json as jsonBodyParser } from "express";
import cors from "cors";
import { bearerAuth } from "./bearerAuth";
import { execute } from "./executor";
import { ME_OPERATION } from "./operations";
import { toEnvelope } from "./errorEnvelope";
import { openApiSpec } from "./openapi";

export const v1Router = Router();

// Bearer-only CORS — any origin, no credentials. Deliberately distinct from the
// session-cookie CORS the GraphQL endpoint uses.
v1Router.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

// Bodies are JSON. Harmless for the current read-only tracer; ready for the
// write endpoints (#28) that ride this same router.
v1Router.use(jsonBodyParser());

// The published contract — unauthenticated by design.
v1Router.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

// GET /v1/me — the tracer. Resolve the token, run the `me` operation as that
// role, and return its data (or map any GraphQL errors to the envelope).
v1Router.get("/me", bearerAuth, async (req, res, next) => {
  try {
    // bearerAuth guarantees req.me is a resolved LINKED context past this point.
    const { data, errors } = await execute({
      document: ME_OPERATION,
      me: req.me!,
    });

    if (errors && errors.length > 0) {
      const { status, body } = toEnvelope(errors);
      res.status(status).json(body);
      return;
    }

    res.json(data!.me);
  } catch (error) {
    next(error);
  }
});
