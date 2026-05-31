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

import {
  Router,
  json as jsonBodyParser,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { bearerAuth } from "./bearerAuth";
import { execute } from "./executor";
import {
  ME_OPERATION,
  TICKETS_OPERATION,
  TICKET_OPERATION,
  TICKET_BODY_OPERATION,
  PROJECT_BODY_OPERATION,
  SAVE_DOCUMENT_BODY_OPERATION,
  PROJECTS_OPERATION,
  PROJECT_OPERATION,
  SCHEDULE_OPERATION,
} from "./operations";
import { toEnvelope, errorEnvelope } from "./errorEnvelope";
import {
  parsePageParams,
  buildPage,
  CursorError,
} from "./pagination";
import { stringParam, intParam, stringList, intList } from "./params";
import { AuthRoleContext } from "../types";
import { openApiSpec } from "./openapi";

export const v1Router = Router();

// Run a GraphQL operation as the token's role and either return its `data`
// (for the caller to shape into a response) or write the error envelope and
// return undefined. Centralising this keeps every route's success/failure
// handling identical.
async function executeAs(
  res: Response,
  document: string,
  variables: Record<string, unknown>,
  me: AuthRoleContext,
): Promise<Record<string, any> | undefined> {
  const { data, errors } = await execute({ document, variables, me });

  if (errors && errors.length > 0) {
    const { status, body } = toEnvelope(errors);
    res.status(status).json(body);
    return undefined;
  }

  return data ?? undefined;
}

// Bodies are JSON. Harmless for the current read-only tracer; ready for the
// write endpoints (#28) that ride this same router.
v1Router.use(jsonBodyParser());

// The published contract — unauthenticated by design.
v1Router.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

// Wrap a bearer-authenticated route. bearerAuth runs first (so req.me is a
// resolved LINKED context inside the handler), then the handler runs under one
// try/catch: a thrown CursorError is a client mistake (a bad `?after=`) → 400
// with the envelope; anything else is unexpected → forwarded to Express. This
// keeps every route below free of repeated error plumbing.
function route(handler: (req: Request, res: Response) => Promise<void>): RequestHandler[] {
  return [
    bearerAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res);
      } catch (error) {
        if (error instanceof CursorError) {
          res.status(400).json(errorEnvelope("BAD_USER_INPUT", error.message));
          return;
        }
        next(error);
      }
    },
  ];
}

// Parse an If-Match value (`"3"`) into the base version a write rebases onto.
// Returns null when the header is absent or malformed, so the caller can demand
// the precondition rather than guess a version.
function parseIfMatch(header: string | undefined): number | null {
  if (!header) return null;
  const match = header.trim().match(/^"?(\d+)"?$/);
  return match ? parseInt(match[1], 10) : null;
}

// Map a saveDocumentBody result to the HTTP response: a conflict is 409 with the
// git-markered Markdown and the current version as the ETag to rebase onto; a
// success is 200 with the new version as the ETag. Both carry any unresolved-
// mention warnings.
function sendBodyResult(
  res: Response,
  result: {
    body: { markdown: string; version: number } | null;
    conflict: { markdown: string; version: number } | null;
    warnings: unknown[];
  },
): void {
  if (result.conflict) {
    res
      .status(409)
      .set("ETag", `"${result.conflict.version}"`)
      .json({ markdown: result.conflict.markdown, warnings: result.warnings });
    return;
  }
  res
    .set("ETag", `"${result.body!.version}"`)
    .json({ markdown: result.body!.markdown, warnings: result.warnings });
}

// Read a Markdown body and return it with the version as the ETag. One handler
// serves every document type's GET body route; `pick` selects the body off the
// operation's tenant-scoped result.
function readBody(
  operation: string,
  pick: (data: any) => { markdown: string; version: number },
): RequestHandler[] {
  return route(async (req, res) => {
    const data = await executeAs(
      res,
      operation,
      { id: parseInt(req.params.id, 10) },
      req.me!,
    );
    if (!data) return;
    const { markdown, version } = pick(data);
    res.set("ETag", `"${version}"`).json({ markdown });
  });
}

// Run the shared saveDocumentBody mutation for a body write of `documentType`,
// translating the REST envelope (If-Match → baseVersion, JSON markdown) into the
// mutation and its result back into the HTTP response. One handler serves every
// document type's PUT route.
function writeBody(
  documentType: "TICKET" | "PROJECT" | "DOCUMENTATION",
): RequestHandler[] {
  return route(async (req, res) => {
    const baseVersion = parseIfMatch(req.get("If-Match"));
    if (baseVersion === null) {
      res
        .status(428)
        .json(
          errorEnvelope(
            "PRECONDITION_REQUIRED",
            "An If-Match header carrying the body version is required for a write.",
          ),
        );
      return;
    }

    const markdown = (req.body ?? {}).markdown;
    if (typeof markdown !== "string") {
      res
        .status(400)
        .json(
          errorEnvelope("BAD_USER_INPUT", "Body must be JSON with a string `markdown` field."),
        );
      return;
    }

    const data = await executeAs(
      res,
      SAVE_DOCUMENT_BODY_OPERATION,
      {
        documentType,
        documentId: parseInt(req.params.id, 10),
        markdown,
        baseVersion,
      },
      req.me!,
    );
    if (!data) return;
    sendBodyResult(res, data.saveDocumentBody);
  });
}

// GET /v1/me — the tracer. The token's Role, User, and Organization.
v1Router.get(
  "/me",
  route(async (req, res) => {
    const data = await executeAs(res, ME_OPERATION, {}, req.me!);
    if (data) res.json(data.me);
  }),
);

// GET /v1/tickets — tenant-scoped, filterable, cursor-paginated list.
v1Router.get(
  "/tickets",
  route(async (req, res) => {
    const { first, offset } = parsePageParams(req.query);
    const variables = {
      first,
      offset,
      sort: stringParam(req.query.sort),
      projectId: intParam(req.query.project),
      search: stringParam(req.query.search),
      statuses: stringList(req.query.status),
      assigneeIds: intList(req.query.assignee),
      stages: stringList(req.query.stage),
    };

    const data = await executeAs(res, TICKETS_OPERATION, variables, req.me!);
    if (data) res.json(buildPage(data.tickets, offset));
  }),
);

// GET /v1/tickets/:id — a single ticket's detail, scoped to the caller's org.
v1Router.get(
  "/tickets/:id",
  route(async (req, res) => {
    const data = await executeAs(
      res,
      TICKET_OPERATION,
      { id: parseInt(req.params.id, 10) },
      req.me!,
    );
    if (data) res.json(data.ticket);
  }),
);

// GET /v1/tickets/:id/body — the ticket's Markdown body. The version is
// returned as the ETag so an agent can issue a conditional (If-Match) write.
v1Router.get(
  "/tickets/:id/body",
  readBody(TICKET_BODY_OPERATION, (data) => data.ticket.body),
);

// PUT /v1/tickets/:id/body — write the ticket's Markdown body (optimistic
// concurrency via If-Match; 409 on conflict).
v1Router.put("/tickets/:id/body", writeBody("TICKET"));

// GET /v1/projects — tenant-scoped, searchable, cursor-paginated list.
v1Router.get(
  "/projects",
  route(async (req, res) => {
    const { first, offset } = parsePageParams(req.query);
    const variables = {
      first,
      offset,
      sort: stringParam(req.query.sort),
      search: stringParam(req.query.search),
      parentId: intParam(req.query.parent),
    };

    const data = await executeAs(res, PROJECTS_OPERATION, variables, req.me!);
    if (data) res.json(buildPage(data.projects, offset));
  }),
);

// GET /v1/projects/:id/body — the project's Markdown body (ETag = version).
v1Router.get(
  "/projects/:id/body",
  readBody(PROJECT_BODY_OPERATION, (data) => data.project.body),
);

// PUT /v1/projects/:id/body — write the project's Markdown body (optimistic
// concurrency via If-Match; 409 on conflict).
v1Router.put("/projects/:id/body", writeBody("PROJECT"));

// GET /v1/projects/:id — a single project's detail, scoped to the caller's org.
v1Router.get(
  "/projects/:id",
  route(async (req, res) => {
    const data = await executeAs(
      res,
      PROJECT_OPERATION,
      { id: parseInt(req.params.id, 10) },
      req.me!,
    );
    if (data) res.json(data.project);
  }),
);

// GET /v1/schedule — the caller's own outstanding scheduled work and its ETAs.
v1Router.get(
  "/schedule",
  route(async (req, res) => {
    const data = await executeAs(res, SCHEDULE_OPERATION, {}, req.me!);
    if (data) res.json({ data: data.myUnfinishedScheduleItems });
  }),
);
