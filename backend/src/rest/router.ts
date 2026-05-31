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
 * No CORS — by design. This is a machine-to-machine API: callers are scripts,
 * CI jobs, and backends that present a long-lived Personal Access Token in the
 * Authorization header. CORS is a *browser* mechanism, irrelevant to those
 * clients. We deliberately do NOT send `Access-Control-Allow-*` headers, which
 * means a browser's same-origin policy blocks any cross-origin JS from reading
 * `/v1` responses — exactly what we want. A PAT is a long-lived secret; it has
 * no business living in frontend code, and refusing browser access keeps us
 * out of the token-exfiltration / CSRF / clickjacking surface that opening it
 * up would drag in for zero benefit. If browser access is ever genuinely
 * needed, the right answer is short-lived OAuth tokens, not CORS on PATs.
 *
 * The mount point (see app.ts) places this router ahead of the cookie/session
 * middleware, so a `/v1` request never acquires a session cookie either.
 *
 * The OpenAPI spec is served unauthenticated: the contract is public so
 * integrators can read it before they hold a token. Everything else requires a
 * valid bearer token.
 */

import { Router, json as jsonBodyParser } from "express";
import { bearerAuth } from "./bearerAuth";
import { execute } from "./executor";
import { ME_OPERATION } from "./operations";
import { toEnvelope } from "./errorEnvelope";
import { openApiSpec } from "./openapi";

export const v1Router = Router();

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
