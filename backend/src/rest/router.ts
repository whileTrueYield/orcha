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
import { tokenRateLimiter } from "./tokenRateLimiter";
import { runOperation, OperationError } from "./runOperation";
import {
  ME_OPERATION,
  NEXT_TICKETS_OPERATION,
  TICKETS_OPERATION,
  TICKET_OPERATION,
  TICKET_BODY_OPERATION,
  PROJECT_BODY_OPERATION,
  SAVE_DOCUMENT_BODY_OPERATION,
  PROJECTS_OPERATION,
  PROJECT_OPERATION,
  SCHEDULE_OPERATION,
  CREATE_TICKET_OPERATION,
  UPDATE_TICKET_OPERATION,
  SCHEDULE_TICKET_OPERATION,
  START_TICKET_STAGE_OPERATION,
  ADVANCE_TICKET_STATE_OPERATION,
  UPDATE_TICKET_STATUS_OPERATION,
} from "./operations";
import { errorEnvelope, statusForCode } from "./errorEnvelope";
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
// handling identical. The operation itself runs through the transport-agnostic
// `runOperation` core (shared with `/mcp`); this wrapper is only the HTTP
// translation — mapping a thrown OperationError to its status + envelope.
async function executeAs(
  res: Response,
  document: string,
  variables: Record<string, unknown>,
  me: AuthRoleContext,
): Promise<Record<string, any> | undefined> {
  try {
    return await runOperation(document, variables, me);
  } catch (error) {
    if (error instanceof OperationError) {
      res
        .status(statusForCode(error.code))
        .json(errorEnvelope(error.code, error.message));
      return undefined;
    }
    throw error;
  }
}

// Bodies are JSON. Harmless for the current read-only tracer; ready for the
// write endpoints (#28) that ride this same router.
v1Router.use(jsonBodyParser());

// The published contract — unauthenticated by design.
v1Router.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

// Wrap a bearer-authenticated route. bearerAuth runs first (so req.me is a
// resolved LINKED context inside the handler), then the per-token rate limiter
// (it keys on the token id bearerAuth resolved), then the handler runs under
// one try/catch: a thrown CursorError is a client mistake (a bad `?after=`) →
// 400 with the envelope; anything else is unexpected → forwarded to Express.
// This keeps every route below free of repeated error plumbing — and means the
// rate limit covers the whole `/v1` surface from one place.
//
// `options.write` marks a mutating route: a read-only PAT is refused with 403
// before the handler runs, so the capability check lives in one place rather
// than in every write handler. (PATs only reach the API through this router, so
// this is the complete enforcement point for token read-only.)
function route(
  handler: (req: Request, res: Response) => Promise<void>,
  options: { write?: boolean } = {},
): RequestHandler[] {
  return [
    bearerAuth,
    tokenRateLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (options.write && req.tokenReadOnly) {
          res
            .status(403)
            .json(
              errorEnvelope(
                "FORBIDDEN",
                "This token is read-only and cannot perform writes.",
              ),
            );
          return;
        }
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

// Build a GraphQL input object from ONLY the keys actually present in a JSON
// request body — a PATCH that omits a field must leave it untouched, not send
// `undefined` (or worse, `null`) the resolver would read as "clear it". Mirrors
// how the GET list omits absent filter variables. `allowed` is the whitelist of
// input fields, so an unknown body key is silently ignored rather than passed
// through. Returns a plain object; the caller decides what an empty one means.
function pickPresent(
  body: Record<string, unknown>,
  allowed: readonly string[],
): Record<string, unknown> {
  const input: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      input[key] = body[key];
    }
  }
  return input;
}

// The fields PATCH /v1/tickets/:id accepts, matching UpdateTicketInput. Listed
// here so the route reads as "these are the patchable fields" and an unknown
// body key never leaks into the mutation.
const UPDATE_TICKET_FIELDS = [
  "title",
  "ownerId",
  "projectId",
  "difficulty",
  "estimating",
  "milestone",
  "productId",
  "workflowId",
] as const;

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
  }, { write: true });
}

// GET /v1/me — the tracer. The token's Role, User, and Organization.
v1Router.get(
  "/me",
  route(async (req, res) => {
    const data = await executeAs(res, ME_OPERATION, {}, req.me!);
    if (data) res.json(data.me);
  }),
);

// GET /v1/me/next-tickets — the MCTS work queue: the caller's Role's next
// Tickets in scheduler order, each with the workflow state up next. No
// parameters — the priority order is scheduler-derived. A pure read, so a
// read-only token is welcome.
v1Router.get(
  "/me/next-tickets",
  route(async (req, res) => {
    const data = await executeAs(res, NEXT_TICKETS_OPERATION, {}, req.me!);
    if (data) res.json({ data: data.myNextTickets });
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

// POST /v1/tickets — create a ticket. We validate the two required fields here
// rather than relying on the executor: a missing GraphQL variable is a
// query-validation error with no mapped status (it would surface as a 500), so
// a clean 400 has to come from the REST layer. Everything else is the
// mutation's job. 201 on success with the shared write shape.
v1Router.post(
  "/tickets",
  route(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { title, projectId } = body;

    if (typeof title !== "string" || title.length === 0) {
      res
        .status(400)
        .json(errorEnvelope("BAD_USER_INPUT", "`title` is required."));
      return;
    }
    if (typeof projectId !== "number") {
      res
        .status(400)
        .json(
          errorEnvelope("BAD_USER_INPUT", "`projectId` (integer) is required."),
        );
      return;
    }

    const input = pickPresent(body, [
      "title",
      "projectId",
      "productId",
      "workflowId",
      "stage",
    ]);

    const data = await executeAs(
      res,
      CREATE_TICKET_OPERATION,
      { input },
      req.me!,
    );
    if (data) res.status(201).json(data.createTicket);
  }, { write: true }),
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

// PATCH /v1/tickets/:id — partial update. Build the input from only the fields
// present in the body (so an omitted field is left untouched), and reject an
// empty patch here: updateTicket's own empty-input guard throws without a mapped
// code, so we turn "nothing to update" into a clean 400 before executing.
v1Router.patch(
  "/tickets/:id",
  route(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const input = pickPresent(body, UPDATE_TICKET_FIELDS);

    if (Object.keys(input).length === 0) {
      res
        .status(400)
        .json(
          errorEnvelope(
            "BAD_USER_INPUT",
            "Provide at least one field to update.",
          ),
        );
      return;
    }

    const data = await executeAs(
      res,
      UPDATE_TICKET_OPERATION,
      { ticketId: parseInt(req.params.id, 10), input },
      req.me!,
    );
    if (data) res.json(data.updateTicket);
  }, { write: true }),
);

// POST /v1/tickets/:id/transition — the ticket's state machine over HTTP. One
// endpoint dispatches on the body's `action` to the matching GraphQL mutation,
// so a client drives a ticket's lifecycle without learning five separate
// routes. The request contract per action:
//   schedule          — UNSCHEDULED → SCHEDULED. No extra fields.
//   start  { stageId } — open work on that stage. stageId REQUIRED.
//   advance { toStageId?, note? } — next (or explicit) stage; may complete it.
//   close  { note }    — → DONE.      note REQUIRED (the API demands a reason).
//   cancel { note }    — → CANCELLED. note REQUIRED.
// schedule/advance/close/cancel answer with the resulting ticket (shared write
// shape); start answers with the ScheduleItem it created.
v1Router.post(
  "/tickets/:id/transition",
  route(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const ticketId = parseInt(req.params.id, 10);
    const action = body.action;

    if (action === "schedule") {
      const data = await executeAs(
        res,
        SCHEDULE_TICKET_OPERATION,
        { ticketId },
        req.me!,
      );
      if (data) res.json(data.scheduleTicket);
      return;
    }

    if (action === "start") {
      const stageId = body.stageId;
      if (typeof stageId !== "number") {
        res
          .status(400)
          .json(
            errorEnvelope(
              "BAD_USER_INPUT",
              "`stageId` (the workflow state to start) is required for action `start`.",
            ),
          );
        return;
      }
      const data = await executeAs(
        res,
        START_TICKET_STAGE_OPERATION,
        { input: { ticketId, ticketWorkflowStateId: stageId } },
        req.me!,
      );
      if (data) res.json(data.createScheduleItem);
      return;
    }

    if (action === "advance") {
      const data = await executeAs(
        res,
        ADVANCE_TICKET_STATE_OPERATION,
        {
          ticketId,
          // Omit when absent so the resolver picks the next stage by position.
          toTicketWorkflowStateId:
            typeof body.toStageId === "number" ? body.toStageId : undefined,
          note: typeof body.note === "string" ? body.note : undefined,
        },
        req.me!,
      );
      if (data) res.json(data.advanceTicketWorkflowState);
      return;
    }

    // close → DONE, cancel → CANCELLED. Both require a note by REST contract
    // even though the GraphQL arg is optional: a lifecycle-ending decision
    // should always carry its reason.
    if (action === "close" || action === "cancel") {
      const note = body.note;
      if (typeof note !== "string" || note.trim().length === 0) {
        res
          .status(400)
          .json(
            errorEnvelope(
              "BAD_USER_INPUT",
              `A non-empty \`note\` is required for action \`${action}\`.`,
            ),
          );
        return;
      }
      const status = action === "close" ? "DONE" : "CANCELLED";
      const data = await executeAs(
        res,
        UPDATE_TICKET_STATUS_OPERATION,
        { ticketId, status, note },
        req.me!,
      );
      if (data) res.json(data.updateTicketStatus);
      return;
    }

    res
      .status(400)
      .json(
        errorEnvelope(
          "BAD_USER_INPUT",
          "Unknown `action`. Valid actions: schedule, start, advance, close, cancel.",
        ),
      );
  }, { write: true }),
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
